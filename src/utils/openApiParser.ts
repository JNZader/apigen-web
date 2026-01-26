import * as yaml from 'js-yaml';
import { nanoid } from 'nanoid';
import type { EntityDesign, FieldDesign, JavaType } from '../types';
import { toPascalCase, toSnakeCase } from '../types';
import type { RelationDesign, RelationType } from '../types/relation';

// ============================================================================
// OpenAPI Type Mappings
// ============================================================================

const OPENAPI_TO_JAVA: Record<string, JavaType> = {
  // String types
  string: 'String',
  // Integer types
  integer: 'Integer',
  int32: 'Integer',
  int64: 'Long',
  // Number types
  number: 'Double',
  float: 'Float',
  double: 'Double',
  // Boolean
  boolean: 'Boolean',
  // Date/Time formats
  date: 'LocalDate',
  'date-time': 'LocalDateTime',
  time: 'LocalTime',
  // Special formats
  uuid: 'UUID',
  binary: 'byte[]',
  byte: 'byte[]',
};

// ============================================================================
// Types
// ============================================================================

export type OpenApiFormat = 'json' | 'yaml';

interface OpenApiSchema {
  type?: string;
  format?: string;
  $ref?: string;
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  required?: string[];
  enum?: (string | number)[];
  description?: string;
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

interface OpenApiDocument {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  components?: {
    schemas?: Record<string, OpenApiSchema>;
  };
  definitions?: Record<string, OpenApiSchema>;
  paths?: Record<string, unknown>;
}

export interface OpenApiParseResult {
  entities: EntityDesign[];
  relations: RelationDesign[];
  warnings: string[];
}

export interface OpenApiParseError {
  message: string;
  line?: number;
  column?: number;
}

// ============================================================================
// Format Detection
// ============================================================================

/**
 * Detects the format of an OpenAPI document (JSON or YAML)
 */
export function detectFormat(content: string): OpenApiFormat {
  const trimmed = content.trim();

  // JSON starts with { or [
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // YAML indicators
  if (
    trimmed.startsWith('---') ||
    trimmed.startsWith('openapi:') ||
    trimmed.startsWith('swagger:') ||
    trimmed.startsWith('#')
  ) {
    return 'yaml';
  }

  // Try to parse as JSON first
  try {
    JSON.parse(content);
    return 'json';
  } catch {
    // Not JSON, assume YAML
    return 'yaml';
  }
}

// ============================================================================
// Parsing
// ============================================================================

/**
 * Parses content based on detected or specified format
 */
export function parseContent(content: string, format?: OpenApiFormat): OpenApiDocument {
  const detectedFormat = format ?? detectFormat(content);

  if (detectedFormat === 'json') {
    return JSON.parse(content) as OpenApiDocument;
  }

  return yaml.load(content) as OpenApiDocument;
}

/**
 * Extracts the schema name from a $ref
 */
function extractRefName(ref: string): string {
  // Handle both OpenAPI 3.x (#/components/schemas/Name) and Swagger 2.x (#/definitions/Name)
  const match = ref.match(/#\/(?:components\/schemas|definitions)\/(.+)$/);
  return match?.[1] ?? ref;
}

/**
 * Maps OpenAPI type/format to Java type
 */
function mapToJavaType(schema: OpenApiSchema): JavaType {
  // Handle format first (more specific)
  if (schema.format) {
    const formatType = OPENAPI_TO_JAVA[schema.format.toLowerCase()];
    if (formatType) return formatType;
  }

  // Handle type
  if (schema.type) {
    const baseType = OPENAPI_TO_JAVA[schema.type.toLowerCase()];
    if (baseType) return baseType;

    // Special handling for integer with int64 format
    if (schema.type === 'integer' && schema.format === 'int64') {
      return 'Long';
    }
  }

  // Default to String
  return 'String';
}

/**
 * Creates validation rules from OpenAPI schema constraints
 */
function createValidations(schema: OpenApiSchema, isRequired: boolean): FieldDesign['validations'] {
  const validations: FieldDesign['validations'] = [];

  if (isRequired && !schema.nullable) {
    validations.push({ type: 'NotNull' });
  }

  if (schema.minLength !== undefined || schema.maxLength !== undefined) {
    const sizeValue =
      schema.minLength !== undefined && schema.maxLength !== undefined
        ? `${schema.minLength},${schema.maxLength}`
        : schema.minLength !== undefined
          ? `${schema.minLength},`
          : `,${schema.maxLength}`;
    validations.push({ type: 'Size', value: sizeValue });
  }

  if (schema.minimum !== undefined) {
    validations.push({ type: 'Min', value: schema.minimum });
  }

  if (schema.maximum !== undefined) {
    validations.push({ type: 'Max', value: schema.maximum });
  }

  if (schema.pattern) {
    validations.push({ type: 'Pattern', value: schema.pattern });
  }

  // Check for email format
  if (schema.format === 'email') {
    validations.push({ type: 'Email' });
  }

  return validations;
}

/**
 * Parses a single schema into an EntityDesign
 */
function parseSchema(
  name: string,
  schema: OpenApiSchema,
  position: { x: number; y: number },
): { entity: EntityDesign; refs: Array<{ fieldName: string; refName: string }> } {
  const refs: Array<{ fieldName: string; refName: string }> = [];
  const fields: FieldDesign[] = [];
  const requiredFields = new Set(schema.required ?? []);

  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      // Handle $ref (relations)
      if (propSchema.$ref) {
        const refName = extractRefName(propSchema.$ref);
        refs.push({ fieldName: propName, refName });
        continue;
      }

      // Handle array of refs (OneToMany)
      if (propSchema.type === 'array' && propSchema.items?.$ref) {
        const refName = extractRefName(propSchema.items.$ref);
        refs.push({ fieldName: propName, refName });
        continue;
      }

      // Skip array of primitives for now
      if (propSchema.type === 'array') {
        continue;
      }

      const field: FieldDesign = {
        id: nanoid(),
        name: propName,
        columnName: toSnakeCase(propName),
        type: mapToJavaType(propSchema),
        nullable: propSchema.nullable ?? !requiredFields.has(propName),
        unique: false,
        validations: createValidations(propSchema, requiredFields.has(propName)),
        description: propSchema.description,
      };

      fields.push(field);
    }
  }

  const entity: EntityDesign = {
    id: nanoid(),
    name: toPascalCase(name),
    tableName: toSnakeCase(name),
    description: schema.description,
    position,
    fields,
    config: {
      generateController: true,
      generateService: true,
      enableCaching: false,
    },
  };

  return { entity, refs };
}

/**
 * Creates relations from parsed references
 */
function createRelations(
  entityMap: Map<string, EntityDesign>,
  allRefs: Map<string, Array<{ fieldName: string; refName: string }>>,
): RelationDesign[] {
  const relations: RelationDesign[] = [];

  for (const [entityName, refs] of allRefs) {
    const sourceEntity = entityMap.get(entityName);
    if (!sourceEntity) continue;

    for (const { fieldName, refName } of refs) {
      const targetEntity = entityMap.get(refName);
      if (!targetEntity) continue;

      // Determine relation type (simple heuristic)
      const isArray = fieldName.endsWith('s') || fieldName.endsWith('es');
      const relationType: RelationType = isArray ? 'OneToMany' : 'ManyToOne';

      const relation: RelationDesign = {
        id: nanoid(),
        type: relationType,
        sourceEntityId: sourceEntity.id,
        sourceFieldName: fieldName,
        targetEntityId: targetEntity.id,
        bidirectional: false,
        fetchType: 'LAZY',
        cascade: [],
        foreignKey: {
          columnName: `${toSnakeCase(fieldName)}_id`,
          nullable: true,
          onDelete: 'NO_ACTION',
          onUpdate: 'NO_ACTION',
        },
      };

      relations.push(relation);
    }
  }

  return relations;
}

// ============================================================================
// Main Parser
// ============================================================================

/**
 * Parses an OpenAPI document (JSON or YAML) and extracts entities and relations
 */
export function parseOpenApi(content: string, format?: OpenApiFormat): OpenApiParseResult {
  const warnings: string[] = [];
  const doc = parseContent(content, format);

  // Get schemas from OpenAPI 3.x or Swagger 2.x
  const schemas = doc.components?.schemas ?? doc.definitions ?? {};

  if (Object.keys(schemas).length === 0) {
    warnings.push(
      'No schemas found in the OpenAPI document. Make sure your document has components/schemas (OpenAPI 3.x) or definitions (Swagger 2.x).',
    );
    return { entities: [], relations: [], warnings };
  }

  const entityMap = new Map<string, EntityDesign>();
  const allRefs = new Map<string, Array<{ fieldName: string; refName: string }>>();

  // Calculate grid positions for entities
  const gridCols = 3;
  const cellWidth = 300;
  const cellHeight = 200;

  let index = 0;
  for (const [name, schema] of Object.entries(schemas)) {
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;
    const position = {
      x: col * cellWidth + 50,
      y: row * cellHeight + 50,
    };

    const { entity, refs } = parseSchema(name, schema, position);
    entityMap.set(name, entity);

    if (refs.length > 0) {
      allRefs.set(name, refs);
    }

    index++;
  }

  // Create relations from references
  const relations = createRelations(entityMap, allRefs);

  // Add warnings for unresolved references
  for (const [entityName, refs] of allRefs) {
    for (const { refName } of refs) {
      if (!entityMap.has(refName)) {
        warnings.push(`Reference to "${refName}" in "${entityName}" could not be resolved.`);
      }
    }
  }

  return {
    entities: Array.from(entityMap.values()),
    relations,
    warnings,
  };
}

/**
 * Validates if the content is a valid OpenAPI document
 */
export function validateOpenApi(
  content: string,
  format?: OpenApiFormat,
): { valid: boolean; errors: OpenApiParseError[] } {
  const errors: OpenApiParseError[] = [];

  try {
    const doc = parseContent(content, format);

    // Check for OpenAPI version
    if (!doc.openapi && !doc.swagger) {
      errors.push({
        message:
          'Missing OpenAPI version. Document should have "openapi" (3.x) or "swagger" (2.x) field.',
      });
    }

    // Check for info section
    if (!doc.info) {
      errors.push({
        message: 'Missing "info" section.',
      });
    }

    // Check for schemas
    const schemas = doc.components?.schemas ?? doc.definitions;
    if (!schemas || Object.keys(schemas).length === 0) {
      errors.push({
        message:
          'No schemas found. Add schemas in "components.schemas" (OpenAPI 3.x) or "definitions" (Swagger 2.x).',
      });
    }
  } catch (e) {
    const error = e as Error;
    errors.push({
      message: `Parse error: ${error.message}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
