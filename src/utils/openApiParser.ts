import yaml from 'js-yaml';
import { nanoid } from 'nanoid';
import type { EntityDesign, FieldDesign, JavaType } from '../types';
import { toCamelCase, toPascalCase, toSnakeCase } from '../types';
import type { RelationDesign } from '../types/relation';
import {
  extractRefName,
  extractValidations,
  isArrayOfRefs,
  isExcludedSchema,
  isRefProperty,
  type OpenAPISchema,
  toJavaType,
} from './openApiTypeMapper';

// ============================================================================
// Interfaces
// ============================================================================

interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  components?: {
    schemas?: Record<string, OpenAPISchema>;
  };
  definitions?: Record<string, OpenAPISchema>; // OpenAPI 2.x
}

interface ParsedSchema {
  name: string;
  entityName: string;
  tableName: string;
  schema: OpenAPISchema;
}

interface PropertyInfo {
  name: string;
  schema: OpenAPISchema;
  isRequired: boolean;
}

interface RelationshipCandidate {
  sourceSchemaName: string;
  targetSchemaName: string;
  propertyName: string;
  isArray: boolean;
}

// ============================================================================
// Phase 1: Parse & Validate
// ============================================================================

/**
 * Detects if content is JSON or YAML and parses it
 */
function parseContent(content: string): OpenAPISpec {
  const trimmed = content.trim();

  // Try JSON first (faster for valid JSON)
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(content) as OpenAPISpec;
    } catch {
      throw new Error('Invalid JSON format');
    }
  }

  // Try YAML
  try {
    const result = yaml.load(content);
    if (typeof result !== 'object' || result === null) {
      throw new Error('Invalid YAML: root must be an object');
    }
    return result as OpenAPISpec;
  } catch (e: unknown) {
    if (e instanceof yaml.YAMLException) {
      throw new Error(`Invalid YAML: ${e.message}`);
    }
    throw e;
  }
}

/**
 * Validates OpenAPI version (3.x supported)
 */
function validateVersion(spec: OpenAPISpec): void {
  if (spec.swagger) {
    throw new Error(
      'OpenAPI 2.x (Swagger) is not supported. Please convert to OpenAPI 3.x first.',
    );
  }

  if (!spec.openapi) {
    throw new Error('Missing OpenAPI version. Expected "openapi: 3.x.x"');
  }

  const version = spec.openapi;
  if (!version.startsWith('3.')) {
    throw new Error(
      `Unsupported OpenAPI version: ${version}. Only 3.x is supported.`,
    );
  }
}

/**
 * Extracts schemas from OpenAPI spec
 */
function extractSchemas(spec: OpenAPISpec): Record<string, OpenAPISchema> {
  const schemas = spec.components?.schemas ?? spec.definitions ?? {};

  if (Object.keys(schemas).length === 0) {
    throw new Error(
      'No schemas found. Expected schemas in components.schemas (OpenAPI 3.x)',
    );
  }

  return schemas;
}

// ============================================================================
// Phase 2: Extract Schemas
// ============================================================================

/**
 * Filters and transforms schemas to ParsedSchema objects
 */
function filterSchemas(schemas: Record<string, OpenAPISchema>): ParsedSchema[] {
  const result: ParsedSchema[] = [];

  for (const [name, schema] of Object.entries(schemas)) {
    // Skip excluded schemas (DTOs, errors, etc.)
    if (isExcludedSchema(name)) continue;

    // Skip schemas that don't have properties (likely enums or primitives)
    if (!schema.properties || Object.keys(schema.properties).length === 0) {
      continue;
    }

    const entityName = toPascalCase(name);
    const tableName = toSnakeCase(name) + 's';

    result.push({
      name,
      entityName,
      tableName,
      schema,
    });
  }

  return result;
}

// ============================================================================
// Phase 3: Extract Properties -> Fields
// ============================================================================

/**
 * Extracts properties from a schema, filtering out relationships
 */
function extractProperties(schema: OpenAPISchema): PropertyInfo[] {
  if (!schema.properties) return [];

  const required = new Set(schema.required ?? []);
  const properties: PropertyInfo[] = [];

  for (const [name, propSchema] of Object.entries(schema.properties)) {
    properties.push({
      name,
      schema: propSchema,
      isRequired: required.has(name),
    });
  }

  return properties;
}

/**
 * Checks if a property should be skipped (base fields)
 */
function isBaseField(name: string): boolean {
  const BASE_FIELDS = new Set([
    'id',
    'created_at',
    'createdAt',
    'updated_at',
    'updatedAt',
    'created_by',
    'createdBy',
    'updated_by',
    'updatedBy',
    'deleted_at',
    'deletedAt',
    'is_deleted',
    'isDeleted',
    'version',
  ]);

  return BASE_FIELDS.has(name);
}

/**
 * Checks if a string is already in camelCase format
 */
function isCamelCase(str: string): boolean {
  // camelCase starts with lowercase and has no underscores/spaces/dashes
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Properly converts to camelCase, preserving existing camelCase
 */
function toFieldName(name: string): string {
  // If already camelCase, preserve it
  if (isCamelCase(name)) {
    return name;
  }
  return toCamelCase(name);
}

/**
 * Properly converts to snake_case, handling camelCase input
 */
function toColumnName(name: string): string {
  // Convert camelCase to snake_case by inserting underscores before uppercase letters
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Converts a property to a FieldDesign
 */
function propertyToField(prop: PropertyInfo): FieldDesign | null {
  const { name, schema, isRequired } = prop;

  // Skip base fields
  if (isBaseField(name)) return null;

  // Skip $ref properties (relationships)
  if (isRefProperty(schema)) return null;

  // Skip arrays of $refs (relationships)
  if (isArrayOfRefs(schema)) return null;

  // Handle arrays of primitives
  let javaType: JavaType;
  if (schema.type === 'array' && schema.items) {
    // Arrays of primitives are stored as JSON strings or handled specially
    javaType = 'String';
  } else {
    javaType = toJavaType(schema.type ?? 'string', schema.format);
  }

  const validations = extractValidations(schema, isRequired);

  return {
    id: nanoid(),
    name: toFieldName(name),
    columnName: toColumnName(name),
    type: javaType,
    nullable: !isRequired && schema.nullable !== false,
    unique: false,
    validations,
    description: schema.description,
  };
}

/**
 * Extracts fields from a ParsedSchema
 */
function extractFields(parsedSchema: ParsedSchema): FieldDesign[] {
  const properties = extractProperties(parsedSchema.schema);
  const fields: FieldDesign[] = [];

  for (const prop of properties) {
    const field = propertyToField(prop);
    if (field) {
      fields.push(field);
    }
  }

  return fields;
}

// ============================================================================
// Phase 4: Detect Relationships
// ============================================================================

/**
 * Finds all relationship candidates from schemas
 */
function findRelationshipCandidates(
  schemas: ParsedSchema[],
): RelationshipCandidate[] {
  const candidates: RelationshipCandidate[] = [];
  const schemaNames = new Set(schemas.map((s) => s.name));

  for (const parsedSchema of schemas) {
    if (!parsedSchema.schema.properties) continue;

    for (const [propName, propSchema] of Object.entries(
      parsedSchema.schema.properties,
    )) {
      // Direct $ref -> ManyToOne candidate
      if (isRefProperty(propSchema) && propSchema.$ref) {
        const targetName = extractRefName(propSchema.$ref);
        if (schemaNames.has(targetName)) {
          candidates.push({
            sourceSchemaName: parsedSchema.name,
            targetSchemaName: targetName,
            propertyName: propName,
            isArray: false,
          });
        }
      }

      // Array of $ref -> OneToMany candidate
      if (isArrayOfRefs(propSchema) && propSchema.items?.$ref) {
        const targetName = extractRefName(propSchema.items.$ref);
        if (schemaNames.has(targetName)) {
          candidates.push({
            sourceSchemaName: parsedSchema.name,
            targetSchemaName: targetName,
            propertyName: propName,
            isArray: true,
          });
        }
      }
    }
  }

  return candidates;
}

/**
 * Converts relationship candidates to RelationDesign objects
 */
function buildRelations(
  candidates: RelationshipCandidate[],
  entityIdMap: Map<string, string>,
): RelationDesign[] {
  const relations: RelationDesign[] = [];
  const processedPairs = new Set<string>();

  for (const candidate of candidates) {
    const sourceEntityId = entityIdMap.get(candidate.sourceSchemaName);
    const targetEntityId = entityIdMap.get(candidate.targetSchemaName);

    if (!sourceEntityId || !targetEntityId) continue;

    const pairKey = `${sourceEntityId}->${targetEntityId}`;

    // For arrays (OneToMany), check if there's an inverse ManyToOne
    if (candidate.isArray) {
      // Look for inverse relationship
      const hasInverse = candidates.some(
        (c) =>
          !c.isArray &&
          c.sourceSchemaName === candidate.targetSchemaName &&
          c.targetSchemaName === candidate.sourceSchemaName,
      );

      if (hasInverse) {
        // This will be handled by the ManyToOne side
        continue;
      }

      // Standalone OneToMany (no inverse defined)
      if (!processedPairs.has(pairKey)) {
        relations.push({
          id: nanoid(),
          type: 'OneToMany',
          sourceEntityId,
          sourceFieldName: candidate.propertyName,
          targetEntityId,
          bidirectional: false,
          fetchType: 'LAZY',
          cascade: [],
          foreignKey: {
            columnName: `${toSnakeCase(candidate.sourceSchemaName)}_id`,
            nullable: true,
            onDelete: 'NO_ACTION',
            onUpdate: 'NO_ACTION',
          },
        });
        processedPairs.add(pairKey);
      }
    } else {
      // ManyToOne relationship
      if (!processedPairs.has(pairKey)) {
        // Check for bidirectional (inverse OneToMany exists)
        const hasInverse = candidates.some(
          (c) =>
            c.isArray &&
            c.sourceSchemaName === candidate.targetSchemaName &&
            c.targetSchemaName === candidate.sourceSchemaName,
        );

        relations.push({
          id: nanoid(),
          type: 'ManyToOne',
          sourceEntityId,
          sourceFieldName: toCamelCase(candidate.propertyName),
          targetEntityId,
          targetFieldName: hasInverse
            ? `${toCamelCase(candidate.sourceSchemaName)}s`
            : undefined,
          bidirectional: hasInverse,
          fetchType: 'LAZY',
          cascade: [],
          foreignKey: {
            columnName: `${toSnakeCase(candidate.propertyName)}_id`,
            nullable: true,
            onDelete: 'NO_ACTION',
            onUpdate: 'NO_ACTION',
          },
        });
        processedPairs.add(pairKey);
      }
    }
  }

  return relations;
}

/**
 * Detects ManyToMany relationships (mutual arrays)
 */
function detectManyToMany(
  candidates: RelationshipCandidate[],
  entityIdMap: Map<string, string>,
  existingRelations: RelationDesign[],
): RelationDesign[] {
  const manyToManyRelations: RelationDesign[] = [];
  const processed = new Set<string>();

  for (const candidate of candidates) {
    if (!candidate.isArray) continue;

    // Find inverse array relationship
    const inverse = candidates.find(
      (c) =>
        c.isArray &&
        c.sourceSchemaName === candidate.targetSchemaName &&
        c.targetSchemaName === candidate.sourceSchemaName,
    );

    if (!inverse) continue;

    // Create canonical key (alphabetically sorted)
    const sortedPair = [candidate.sourceSchemaName, candidate.targetSchemaName]
      .sort()
      .join('-');
    if (processed.has(sortedPair)) continue;
    processed.add(sortedPair);

    const sourceEntityId = entityIdMap.get(candidate.sourceSchemaName);
    const targetEntityId = entityIdMap.get(candidate.targetSchemaName);

    if (!sourceEntityId || !targetEntityId) continue;

    // Remove any existing relations between these entities
    const indicesToRemove: number[] = [];
    for (let i = 0; i < existingRelations.length; i++) {
      const r = existingRelations[i];
      if (
        (r.sourceEntityId === sourceEntityId &&
          r.targetEntityId === targetEntityId) ||
        (r.sourceEntityId === targetEntityId &&
          r.targetEntityId === sourceEntityId)
      ) {
        indicesToRemove.push(i);
      }
    }
    // Remove in reverse order to maintain indices
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      existingRelations.splice(indicesToRemove[i], 1);
    }

    // Create join table name
    const joinTableName = `${toSnakeCase(candidate.sourceSchemaName)}_${toSnakeCase(candidate.targetSchemaName)}`;

    manyToManyRelations.push({
      id: nanoid(),
      type: 'ManyToMany',
      sourceEntityId,
      sourceFieldName: candidate.propertyName,
      targetEntityId,
      targetFieldName: inverse.propertyName,
      bidirectional: true,
      fetchType: 'LAZY',
      cascade: [],
      foreignKey: {
        columnName: `${toSnakeCase(candidate.sourceSchemaName)}_id`,
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      joinTable: {
        name: joinTableName,
        joinColumn: `${toSnakeCase(candidate.sourceSchemaName)}_id`,
        inverseJoinColumn: `${toSnakeCase(candidate.targetSchemaName)}_id`,
      },
    });
  }

  return manyToManyRelations;
}

// ============================================================================
// Phase 5: Build Output
// ============================================================================

/**
 * Creates EntityDesign objects from ParsedSchemas
 */
function buildEntities(
  schemas: ParsedSchema[],
): { entities: EntityDesign[]; entityIdMap: Map<string, string> } {
  const entities: EntityDesign[] = [];
  const entityIdMap = new Map<string, string>();

  let posX = 100;
  let posY = 100;

  for (const parsedSchema of schemas) {
    const id = nanoid();
    entityIdMap.set(parsedSchema.name, id);

    const fields = extractFields(parsedSchema);

    entities.push({
      id,
      name: parsedSchema.entityName,
      tableName: parsedSchema.tableName,
      description: parsedSchema.schema.description,
      position: { x: posX, y: posY },
      fields,
      config: {
        generateController: true,
        generateService: true,
        enableCaching: true,
      },
    });

    // Update position for next entity
    posX += 300;
    if (posX > 900) {
      posX = 100;
      posY += 250;
    }
  }

  return { entities, entityIdMap };
}

// ============================================================================
// Main Parse Function
// ============================================================================

export interface OpenAPIParseResult {
  entities: EntityDesign[];
  relations: RelationDesign[];
}

/**
 * Parses an OpenAPI 3.x specification and extracts entities and relations
 */
export function parseOpenAPI(content: string): OpenAPIParseResult {
  // Phase 1: Parse & Validate
  const spec = parseContent(content);
  validateVersion(spec);
  const schemas = extractSchemas(spec);

  // Phase 2: Extract Schemas
  const parsedSchemas = filterSchemas(schemas);

  if (parsedSchemas.length === 0) {
    throw new Error(
      'No valid entity schemas found. Schemas ending with Request, Response, DTO, etc. are excluded.',
    );
  }

  // Phase 3 & 5: Build Entities (includes field extraction)
  const { entities, entityIdMap } = buildEntities(parsedSchemas);

  // Phase 4: Detect Relationships
  const candidates = findRelationshipCandidates(parsedSchemas);
  const relations = buildRelations(candidates, entityIdMap);

  // Detect ManyToMany (mutates relations array)
  const manyToManyRelations = detectManyToMany(
    candidates,
    entityIdMap,
    relations,
  );

  return {
    entities,
    relations: [...relations, ...manyToManyRelations],
  };
}
