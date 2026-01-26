import { nanoid } from 'nanoid';
import type { EntityDesign, FieldDesign, JavaType, ValidationRule } from '../types';
import type { RelationDesign, RelationType } from '../types/relation';
import { toSnakeCase } from '../types';
import { ENTITY_GRID } from './canvasConstants';

// ============================================================================
// Types for OpenAPI parsing
// ============================================================================

interface OpenApiSchema {
  openapi?: string;
  swagger?: string;
  components?: {
    schemas?: Record<string, OpenApiSchemaObject>;
  };
  definitions?: Record<string, OpenApiSchemaObject>; // Swagger 2.0
}

interface OpenApiSchemaObject {
  type?: string;
  properties?: Record<string, OpenApiPropertyObject>;
  required?: string[];
  description?: string;
  allOf?: OpenApiSchemaObject[];
  $ref?: string;
}

interface OpenApiPropertyObject {
  type?: string;
  format?: string;
  description?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  nullable?: boolean;
  $ref?: string;
  items?: OpenApiPropertyObject;
  enum?: (string | number)[];
}

export interface OpenApiParseResult {
  entities: EntityDesign[];
  relations: RelationDesign[];
}

// ============================================================================
// Type mapping
// ============================================================================

function mapOpenApiTypeToJava(property: OpenApiPropertyObject): JavaType {
  const { type, format } = property;

  // Handle format-specific mappings first
  if (format) {
    switch (format) {
      case 'int64':
        return 'Long';
      case 'int32':
        return 'Integer';
      case 'float':
        return 'Float';
      case 'double':
        return 'Double';
      case 'date':
        return 'LocalDate';
      case 'date-time':
        return 'LocalDateTime';
      case 'time':
        return 'LocalTime';
      case 'uuid':
        return 'UUID';
      case 'byte':
      case 'binary':
        return 'byte[]';
      case 'decimal':
        return 'BigDecimal';
    }
  }

  // Fall back to type-based mapping
  switch (type) {
    case 'integer':
      return format === 'int64' ? 'Long' : 'Integer';
    case 'number':
      return format === 'double' ? 'Double' : 'BigDecimal';
    case 'boolean':
      return 'Boolean';
    case 'string':
      return 'String';
    case 'array':
      return 'String'; // Arrays are handled separately as relations
    default:
      return 'String';
  }
}

function extractValidations(
  property: OpenApiPropertyObject,
  isRequired: boolean,
): ValidationRule[] {
  const validations: ValidationRule[] = [];

  if (isRequired && !property.nullable) {
    validations.push({ type: 'NotNull' });
  }

  if (property.minLength !== undefined || property.maxLength !== undefined) {
    const min = property.minLength ?? 0;
    const max = property.maxLength ?? 255;
    validations.push({ type: 'Size', value: `${min},${max}` });
  }

  if (property.minimum !== undefined) {
    validations.push({ type: 'Min', value: property.minimum });
  }

  if (property.maximum !== undefined) {
    validations.push({ type: 'Max', value: property.maximum });
  }

  if (property.pattern) {
    validations.push({ type: 'Pattern', value: property.pattern });
  }

  // Detect email pattern
  if (property.format === 'email') {
    validations.push({ type: 'Email' });
  }

  return validations;
}

// ============================================================================
// Reference resolution
// ============================================================================

function resolveRef(ref: string): string {
  // Handle #/components/schemas/EntityName or #/definitions/EntityName
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

function isEntityReference(property: OpenApiPropertyObject): string | null {
  if (property.$ref) {
    return resolveRef(property.$ref);
  }
  if (property.type === 'array' && property.items?.$ref) {
    return resolveRef(property.items.$ref);
  }
  return null;
}

// ============================================================================
// Main parser
// ============================================================================

export function parseOpenApi(content: string): OpenApiParseResult {
  let spec: OpenApiSchema;

  try {
    spec = JSON.parse(content);
  } catch {
    // Try YAML parsing (simple support for common cases)
    throw new Error(
      'Invalid OpenAPI specification. Please provide a valid JSON OpenAPI/Swagger document.',
    );
  }

  // Validate it's an OpenAPI spec
  if (!spec.openapi && !spec.swagger) {
    throw new Error(
      'Invalid OpenAPI specification. Missing "openapi" or "swagger" version field.',
    );
  }

  // Get schemas from components (OpenAPI 3.x) or definitions (Swagger 2.x)
  const schemas = spec.components?.schemas ?? spec.definitions ?? {};

  if (Object.keys(schemas).length === 0) {
    throw new Error(
      'No schemas found in the OpenAPI specification. Expected schemas in components.schemas or definitions.',
    );
  }

  const entities: EntityDesign[] = [];
  const relations: RelationDesign[] = [];
  const entityIdMap = new Map<string, string>();

  // First pass: create all entities
  let index = 0;
  for (const [name, schema] of Object.entries(schemas)) {
    // Skip non-object schemas
    if (schema.type && schema.type !== 'object') {
      continue;
    }

    // Handle allOf by merging properties
    let properties = schema.properties ?? {};
    let required = schema.required ?? [];

    if (schema.allOf) {
      for (const item of schema.allOf) {
        if (item.properties) {
          properties = { ...properties, ...item.properties };
        }
        if (item.required) {
          required = [...required, ...item.required];
        }
      }
    }

    if (Object.keys(properties).length === 0) {
      continue;
    }

    const entityId = nanoid();
    entityIdMap.set(name, entityId);

    // Calculate grid position
    const gridX = (index % ENTITY_GRID.COLUMNS) * ENTITY_GRID.SPACING_X + ENTITY_GRID.PADDING;
    const gridY =
      Math.floor(index / ENTITY_GRID.COLUMNS) * ENTITY_GRID.SPACING_Y + ENTITY_GRID.PADDING;

    const fields: FieldDesign[] = [];

    for (const [propName, propSchema] of Object.entries(properties)) {
      // Skip ID fields as they're auto-generated
      if (propName.toLowerCase() === 'id') {
        continue;
      }

      // Skip reference fields - they'll become relations
      if (isEntityReference(propSchema)) {
        continue;
      }

      const isRequired = required.includes(propName);
      const javaType = mapOpenApiTypeToJava(propSchema);
      const validations = extractValidations(propSchema, isRequired);

      fields.push({
        id: nanoid(),
        name: propName,
        columnName: toSnakeCase(propName),
        type: javaType,
        nullable: propSchema.nullable ?? !isRequired,
        unique: false,
        validations,
        description: propSchema.description,
      });
    }

    entities.push({
      id: entityId,
      name,
      tableName: `${toSnakeCase(name)}s`,
      description: schema.description,
      position: { x: gridX, y: gridY },
      fields,
      config: {
        generateController: true,
        generateService: true,
        enableCaching: true,
      },
    });

    index++;
  }

  // Second pass: create relations from $ref properties
  for (const [name, schema] of Object.entries(schemas)) {
    const sourceEntityId = entityIdMap.get(name);
    if (!sourceEntityId) continue;

    let properties = schema.properties ?? {};

    if (schema.allOf) {
      for (const item of schema.allOf) {
        if (item.properties) {
          properties = { ...properties, ...item.properties };
        }
      }
    }

    for (const [propName, propSchema] of Object.entries(properties)) {
      const targetEntityName = isEntityReference(propSchema);
      if (!targetEntityName) continue;

      const targetEntityId = entityIdMap.get(targetEntityName);
      if (!targetEntityId) continue;

      // Determine relation type
      let relationType: RelationType = 'ManyToOne';
      if (propSchema.type === 'array') {
        relationType = 'OneToMany';
      }

      relations.push({
        id: nanoid(),
        name: propName,
        sourceEntityId,
        targetEntityId,
        type: relationType,
        fetchType: 'LAZY',
        cascadeTypes: ['PERSIST'],
        orphanRemoval: relationType === 'OneToMany',
        optional: true,
      });
    }
  }

  return { entities, relations };
}
