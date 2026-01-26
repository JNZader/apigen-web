// ============================================================================
// OPENAPI TO ENTITY CONVERTER
// Converts parsed OpenAPI 3.x schemas to EntityDesign and RelationDesign
// ============================================================================

import type { EntityDesign, FieldDesign, JavaType, ValidationRule } from '@/types/entity';
import { toSnakeCase } from '@/types/entity';
import type { RelationDesign, RelationType } from '@/types/relation';
import type { Language } from '@/types/target';

// ============================================================================
// OPENAPI TYPES (inline for now, will be moved to types/openapi.ts in T-033)
// ============================================================================

/**
 * OpenAPI Schema Object (simplified for entity conversion)
 */
export interface OpenApiSchema {
  type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean';
  format?: string;
  properties?: Record<string, OpenApiProperty>;
  required?: string[];
  $ref?: string;
  items?: OpenApiProperty;
  description?: string;
  nullable?: boolean;
  allOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  enum?: (string | number)[];
  title?: string;
}

/**
 * OpenAPI Property Object
 */
export interface OpenApiProperty {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  format?: string;
  $ref?: string;
  items?: OpenApiProperty;
  description?: string;
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  enum?: (string | number)[];
  default?: unknown;
  example?: unknown;
  readOnly?: boolean;
  writeOnly?: boolean;
}

/**
 * OpenAPI Document schemas section
 */
export interface OpenApiSchemas {
  [schemaName: string]: OpenApiSchema;
}

/**
 * Parsed OpenAPI document (minimal structure needed for conversion)
 */
export interface ParsedOpenApiDocument {
  openapi?: string;
  info?: { title?: string; version?: string };
  components?: {
    schemas?: OpenApiSchemas;
  };
}

// ============================================================================
// CONVERSION RESULT TYPES
// ============================================================================

/**
 * Result of converting OpenAPI to entities
 */
export interface ConversionResult {
  entities: EntityDesign[];
  relations: RelationDesign[];
  warnings: string[];
}

/**
 * Options for OpenAPI to entity conversion
 */
export interface ConversionOptions {
  /** Target language for type mapping (defaults to 'java') */
  targetLanguage?: Language;
  /** Include description as field description */
  includeDescriptions?: boolean;
  /** Grid spacing for entity positioning */
  gridSpacing?: number;
  /** Starting position for entities */
  startPosition?: { x: number; y: number };
}

// ============================================================================
// TYPE MAPPING BY LANGUAGE
// ============================================================================

type OpenApiTypeFormat = `${string}:${string}` | string;
type TypeMapping = Record<OpenApiTypeFormat, JavaType>;

/** Base type mapping from OpenAPI types to Java types (used as default for all languages) */
const BASE_TYPE_MAPPING: TypeMapping = {
  'string:': 'String',
  'string:date': 'LocalDate',
  'string:date-time': 'LocalDateTime',
  'string:time': 'LocalTime',
  'string:uuid': 'UUID',
  'string:byte': 'byte[]',
  'string:binary': 'byte[]',
  'string:email': 'String',
  'string:uri': 'String',
  'string:hostname': 'String',
  'string:ipv4': 'String',
  'string:ipv6': 'String',
  'string:password': 'String',
  'integer:': 'Integer',
  'integer:int32': 'Integer',
  'integer:int64': 'Long',
  'number:': 'Double',
  'number:float': 'Float',
  'number:double': 'Double',
  'number:decimal': 'BigDecimal',
  'boolean:': 'Boolean',
};

/** Get type mapping for a specific language (currently all use base mapping) */
function getTypeMapping(_language: Language): TypeMapping {
  // All languages currently use the same base mapping
  // This function allows for future language-specific overrides
  return BASE_TYPE_MAPPING;
}

// ============================================================================
// SCHEMA NAME PATTERNS FOR FILTERING
// ============================================================================

/** Patterns that indicate a schema is NOT an entity */
const NON_ENTITY_PATTERNS = [
  /Request$/i,
  /Response$/i,
  /DTO$/i,
  /Dto$/,
  /Input$/i,
  /Output$/i,
  /Payload$/i,
  /Error$/i,
  /Exception$/i,
  /Page$/i,
  /Pageable$/i,
  /Paginated/i,
  /List$/i,
  /Collection$/i,
  /Wrapper$/i,
  /Envelope$/i,
  /Result$/i,
  /ApiResponse/i,
  /^Link$/i,
  /^Links$/i,
  /^Meta$/i,
  /^Metadata$/i,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for entities and fields
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Extract schema name from $ref
 * @example "#/components/schemas/User" -> "User"
 */
export function extractRefName(ref: string): string {
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

/**
 * Convert PascalCase or camelCase to snake_case for table names
 */
function generateTableName(entityName: string): string {
  return toSnakeCase(entityName).toLowerCase();
}

/**
 * Convert camelCase to snake_case for column names
 */
function generateColumnName(fieldName: string): string {
  return toSnakeCase(fieldName).toLowerCase();
}

/**
 * Map OpenAPI type and format to target language type
 */
export function mapOpenApiType(
  type: string | undefined,
  format: string | undefined,
  language: Language = 'java',
): JavaType {
  const typeKey = `${type || 'string'}:${format || ''}`;
  const typeKeyNoFormat = `${type || 'string'}:`;

  const mapping = getTypeMapping(language);
  return mapping[typeKey] || mapping[typeKeyNoFormat] || 'String';
}

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

/**
 * Check if a schema name represents an entity (not a DTO, Response, etc.)
 */
export function isEntitySchema(schemaName: string, schema: OpenApiSchema): boolean {
  // Must be an object type
  if (schema.type && schema.type !== 'object') {
    return false;
  }

  // Must have properties
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return false;
  }

  // Check against non-entity patterns
  for (const pattern of NON_ENTITY_PATTERNS) {
    if (pattern.test(schemaName)) {
      return false;
    }
  }

  // We'll be permissive and include schemas that pass the filters above
  // Even if they don't have an 'id' property, they might still be valid entities
  return true;
}

/**
 * Filter schemas to only include entity-like schemas
 */
export function filterEntitySchemas(schemas: OpenApiSchemas): OpenApiSchemas {
  const filtered: OpenApiSchemas = {};

  for (const [name, schema] of Object.entries(schemas)) {
    if (isEntitySchema(name, schema)) {
      filtered[name] = schema;
    }
  }

  return filtered;
}

// ============================================================================
// CONSTRAINT CONVERSION
// ============================================================================

/**
 * Convert OpenAPI property constraints to validation rules
 */
export function convertConstraintsToValidations(
  property: OpenApiProperty,
  isRequired: boolean,
): ValidationRule[] {
  const validations: ValidationRule[] = [];

  // Required field gets NotNull
  if (isRequired) {
    validations.push({ type: 'NotNull' });
  }

  // String validations
  if (property.type === 'string') {
    // Size constraints
    if (property.minLength !== undefined || property.maxLength !== undefined) {
      const min = property.minLength ?? 0;
      const max = property.maxLength ?? 255;
      validations.push({ type: 'Size', value: `${min},${max}` });
    }

    // Email format
    if (property.format === 'email') {
      validations.push({ type: 'Email' });
    }

    // Pattern
    if (property.pattern) {
      validations.push({ type: 'Pattern', value: property.pattern });
    }

    // Not blank for required strings
    if (isRequired && property.minLength !== undefined && property.minLength > 0) {
      // Replace NotNull with NotBlank for strings
      const notNullIndex = validations.findIndex((v) => v.type === 'NotNull');
      if (notNullIndex !== -1) {
        validations[notNullIndex] = { type: 'NotBlank' };
      }
    }
  }

  // Numeric validations
  if (property.type === 'number' || property.type === 'integer') {
    if (property.minimum !== undefined) {
      validations.push({ type: 'Min', value: property.minimum });
    }
    if (property.maximum !== undefined) {
      validations.push({ type: 'Max', value: property.maximum });
    }
  }

  return validations;
}

// ============================================================================
// PROPERTY TO FIELD CONVERSION
// ============================================================================

/**
 * Convert an OpenAPI property to a FieldDesign
 */
export function convertPropertyToField(
  propertyName: string,
  property: OpenApiProperty,
  isRequired: boolean,
  options: ConversionOptions = {},
): FieldDesign | null {
  const { targetLanguage = 'java', includeDescriptions = true } = options;

  // Skip properties that are references (relations) or arrays of references
  if (property.$ref) {
    return null;
  }

  if (property.type === 'array' && property.items?.$ref) {
    return null;
  }

  // Skip read-only properties that look like computed fields
  if (property.readOnly && propertyName !== 'id') {
    return null;
  }

  const javaType = mapOpenApiType(property.type, property.format, targetLanguage);
  const validations = convertConstraintsToValidations(property, isRequired);

  const field: FieldDesign = {
    id: generateId(),
    name: propertyName,
    columnName: generateColumnName(propertyName),
    type: javaType,
    nullable: !isRequired && (property.nullable !== false),
    unique: false, // OpenAPI doesn't have a direct unique constraint
    validations,
  };

  if (includeDescriptions && property.description) {
    field.description = property.description;
  }

  if (property.default !== undefined) {
    field.defaultValue = String(property.default);
  }

  return field;
}

// ============================================================================
// RELATION DETECTION
// ============================================================================

/**
 * Detected relation from OpenAPI schema
 */
interface DetectedRelation {
  sourceSchemaName: string;
  sourceFieldName: string;
  targetSchemaName: string;
  isArray: boolean;
}

/**
 * Detect relations from a schema's properties
 */
export function detectRelationsFromSchema(
  schemaName: string,
  schema: OpenApiSchema,
): DetectedRelation[] {
  const relations: DetectedRelation[] = [];

  if (!schema.properties) {
    return relations;
  }

  for (const [propertyName, property] of Object.entries(schema.properties)) {
    // Direct reference: { $ref: "#/components/schemas/User" }
    if (property.$ref) {
      relations.push({
        sourceSchemaName: schemaName,
        sourceFieldName: propertyName,
        targetSchemaName: extractRefName(property.$ref),
        isArray: false,
      });
    }
    // Array of references: { type: "array", items: { $ref: "..." } }
    else if (property.type === 'array' && property.items?.$ref) {
      relations.push({
        sourceSchemaName: schemaName,
        sourceFieldName: propertyName,
        targetSchemaName: extractRefName(property.items.$ref),
        isArray: true,
      });
    }
  }

  return relations;
}

/**
 * Check if target schema has a back-reference to source
 */
export function hasBackReference(
  sourceSchemaName: string,
  targetSchema: OpenApiSchema,
): { hasBackRef: boolean; backRefField?: string; isArray?: boolean } {
  if (!targetSchema.properties) {
    return { hasBackRef: false };
  }

  for (const [propertyName, property] of Object.entries(targetSchema.properties)) {
    // Check direct reference back
    if (property.$ref) {
      const refName = extractRefName(property.$ref);
      if (refName === sourceSchemaName) {
        return { hasBackRef: true, backRefField: propertyName, isArray: false };
      }
    }
    // Check array reference back
    if (property.type === 'array' && property.items?.$ref) {
      const refName = extractRefName(property.items.$ref);
      if (refName === sourceSchemaName) {
        return { hasBackRef: true, backRefField: propertyName, isArray: true };
      }
    }
  }

  return { hasBackRef: false };
}

/**
 * Determine relation type based on source and target references
 */
function determineRelationType(
  sourceIsArray: boolean,
  targetHasBackRef: boolean,
  targetBackRefIsArray: boolean,
): RelationType {
  if (!targetHasBackRef) {
    // Unidirectional
    return sourceIsArray ? 'OneToMany' : 'ManyToOne';
  }

  // Bidirectional - determine type
  if (sourceIsArray && targetBackRefIsArray) {
    return 'ManyToMany';
  }
  if (sourceIsArray && !targetBackRefIsArray) {
    return 'OneToMany';
  }
  if (!sourceIsArray && targetBackRefIsArray) {
    return 'ManyToOne';
  }
  return 'OneToOne';
}

/**
 * Build relations from detected references
 */
function buildRelations(
  detectedRelations: DetectedRelation[],
  schemas: OpenApiSchemas,
  entityIdMap: Map<string, string>,
): { relations: RelationDesign[]; warnings: string[] } {
  const relations: RelationDesign[] = [];
  const warnings: string[] = [];
  const processedPairs = new Set<string>();

  for (const detected of detectedRelations) {
    const { sourceSchemaName, sourceFieldName, targetSchemaName, isArray } = detected;

    // Skip if target is not an entity
    if (!entityIdMap.has(targetSchemaName)) {
      warnings.push(`Skipped relation ${sourceSchemaName}.${sourceFieldName} -> ${targetSchemaName}: target not an entity`);
      continue;
    }

    // Skip if we already processed this pair (for bidirectional)
    const pairKey = [sourceSchemaName, targetSchemaName].sort().join(':');
    if (processedPairs.has(pairKey)) {
      continue;
    }
    processedPairs.add(pairKey);

    const sourceEntityId = entityIdMap.get(sourceSchemaName);
    const targetEntityId = entityIdMap.get(targetSchemaName);

    if (!sourceEntityId || !targetEntityId) {
      continue;
    }

    const targetSchema = schemas[targetSchemaName];
    const backRef = hasBackReference(sourceSchemaName, targetSchema);
    const relationType = determineRelationType(isArray, backRef.hasBackRef, backRef.isArray ?? false);

    const relation: RelationDesign = {
      id: generateId(),
      type: relationType,
      sourceEntityId,
      sourceFieldName,
      targetEntityId,
      targetFieldName: backRef.backRefField,
      bidirectional: backRef.hasBackRef,
      fetchType: 'LAZY',
      cascade: [],
      foreignKey: {
        columnName: `${generateColumnName(sourceFieldName)}_id`,
        nullable: true,
        onDelete: 'NO_ACTION',
        onUpdate: 'NO_ACTION',
      },
    };

    // For ManyToMany, add join table config
    if (relationType === 'ManyToMany') {
      const tableName1 = generateTableName(sourceSchemaName);
      const tableName2 = generateTableName(targetSchemaName);
      relation.joinTable = {
        name: `${tableName1}_${tableName2}`,
        joinColumn: `${tableName1}_id`,
        inverseJoinColumn: `${tableName2}_id`,
      };
    }

    relations.push(relation);
  }

  return { relations, warnings };
}

// ============================================================================
// SCHEMA TO ENTITY CONVERSION
// ============================================================================

/**
 * Convert an OpenAPI schema to an EntityDesign
 */
export function convertSchemaToEntity(
  schemaName: string,
  schema: OpenApiSchema,
  position: { x: number; y: number },
  options: ConversionOptions = {},
): { entity: EntityDesign; warnings: string[] } {
  const warnings: string[] = [];
  const fields: FieldDesign[] = [];
  const requiredFields = new Set(schema.required || []);

  // Add ID field if not present
  let hasIdField = false;

  if (schema.properties) {
    for (const [propertyName, property] of Object.entries(schema.properties)) {
      const isRequired = requiredFields.has(propertyName);
      const field = convertPropertyToField(propertyName, property, isRequired, options);

      if (field) {
        fields.push(field);
        if (propertyName.toLowerCase() === 'id') {
          hasIdField = true;
        }
      }
    }
  }

  // Add default ID field if not present
  if (!hasIdField) {
    fields.unshift({
      id: generateId(),
      name: 'id',
      columnName: 'id',
      type: 'Long',
      nullable: false,
      unique: true,
      validations: [],
    });
  }

  const entity: EntityDesign = {
    id: generateId(),
    name: schemaName,
    tableName: generateTableName(schemaName),
    description: schema.description,
    position,
    fields,
    config: {
      generateController: true,
      generateService: true,
      enableCaching: false,
    },
  };

  return { entity, warnings };
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Convert a parsed OpenAPI document to EntityDesign and RelationDesign arrays
 */
export function convertOpenApiToEntities(
  document: ParsedOpenApiDocument,
  options: ConversionOptions = {},
): ConversionResult {
  const {
    gridSpacing = 300,
    startPosition = { x: 100, y: 100 },
  } = options;

  const entities: EntityDesign[] = [];
  const allWarnings: string[] = [];
  const entityIdMap = new Map<string, string>();
  const allDetectedRelations: DetectedRelation[] = [];

  // Get schemas from document
  const schemas = document.components?.schemas;
  if (!schemas) {
    return {
      entities: [],
      relations: [],
      warnings: ['No schemas found in OpenAPI document'],
    };
  }

  // Filter to only entity-like schemas
  const entitySchemas = filterEntitySchemas(schemas);
  const schemaNames = Object.keys(entitySchemas);

  if (schemaNames.length === 0) {
    return {
      entities: [],
      relations: [],
      warnings: ['No entity schemas found after filtering'],
    };
  }

  // Calculate grid layout
  const columnsCount = Math.ceil(Math.sqrt(schemaNames.length));

  // Convert each schema to entity
  schemaNames.forEach((schemaName, index) => {
    const schema = entitySchemas[schemaName];

    // Calculate position in grid
    const row = Math.floor(index / columnsCount);
    const col = index % columnsCount;
    const position = {
      x: startPosition.x + col * gridSpacing,
      y: startPosition.y + row * gridSpacing,
    };

    const { entity, warnings } = convertSchemaToEntity(schemaName, schema, position, options);
    entities.push(entity);
    entityIdMap.set(schemaName, entity.id);
    allWarnings.push(...warnings);

    // Detect relations from this schema
    const detected = detectRelationsFromSchema(schemaName, schema);
    allDetectedRelations.push(...detected);
  });

  // Build relations from all detected references
  const { relations, warnings: relationWarnings } = buildRelations(
    allDetectedRelations,
    schemas,
    entityIdMap,
  );
  allWarnings.push(...relationWarnings);

  return {
    entities,
    relations,
    warnings: allWarnings,
  };
}
