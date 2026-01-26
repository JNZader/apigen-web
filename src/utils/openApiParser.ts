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
  nullable?: boolean;
  $ref?: string;
  items?: OpenApiPropertyObject;
  enum?: (string | number)[];
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
  warnings: string[];
}

export interface OpenApiParseError {
  message: string;
  line?: number;
  column?: number;
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
export function parseContent(
	content: string,
	format?: OpenApiFormat,
): OpenApiDocument {
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
function createValidations(
	schema: OpenApiSchema,
	isRequired: boolean,
): FieldDesign['validations'] {
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
export function parseOpenApi(
	content: string,
	format?: OpenApiFormat,
): OpenApiParseResult {
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
				warnings.push(
					`Reference to "${refName}" in "${entityName}" could not be resolved.`,
				);
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
import { nanoid } from 'nanoid';
import type { EntityDesign, FieldDesign, JavaType, ValidationRule } from '../types';
import type { RelationDesign, RelationType } from '../types/relation';

// ============================================================================
// Interfaces
// ============================================================================

export interface ParsedOpenApi {
  projectName: string;
  version: string;
  description?: string;
  entities: EntityDesign[];
  relations: RelationDesign[];
  endpoints: ParsedEndpoint[];
  warnings: string[];
}

export interface ParsedEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  operationId?: string;
  summary?: string;
  tags: string[];
  entityName?: string;
}

interface OpenApiDocument {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  paths?: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
}

interface PathItem {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  patch?: OperationObject;
  delete?: OperationObject;
}

interface OperationObject {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  requestBody?: {
    content?: Record<string, { schema?: SchemaObject }>;
  };
  responses?: Record<string, { content?: Record<string, { schema?: SchemaObject }> }>;
}

interface SchemaObject {
  type?: string;
  format?: string;
  $ref?: string;
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  description?: string;
  enum?: (string | number)[];
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
}

// ============================================================================
// Type Mapping
// ============================================================================

const OPENAPI_TO_JAVA: Record<string, Record<string, JavaType>> = {
  string: {
    default: 'String',
    date: 'LocalDate',
    'date-time': 'LocalDateTime',
    uuid: 'UUID',
    byte: 'byte[]',
    binary: 'byte[]',
  },
  integer: {
    default: 'Integer',
    int32: 'Integer',
    int64: 'Long',
  },
  number: {
    default: 'Double',
    float: 'Float',
    double: 'Double',
  },
  boolean: {
    default: 'Boolean',
  },
  array: {
    default: 'String', // Will be handled specially for relations
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sanitize a name to be a valid Java identifier
 */
export function sanitizeName(name: string): string {
  // Remove invalid characters, keeping only alphanumerics and underscores
  let sanitized = name.replaceAll(/[^\w]/g, '_');
  // Remove leading digits
  sanitized = sanitized.replace(/^\d+/, '');
  // Remove consecutive underscores
  sanitized = sanitized.replaceAll(/_+/g, '_');
  // Remove leading/trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, '');
  return sanitized || 'Unknown';
}

/**
 * Convert a string to PascalCase (for entity names)
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert a string to camelCase (for field names)
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert a string to snake_case (for table/column names)
 */
export function toSnakeCase(str: string): string {
  return str
    .replaceAll(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replaceAll(/_+/g, '_');
}

/**
 * Simple singularize function for common English plurals
 */
export function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es') && (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes'))) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Extract schema name from $ref path
 */
function extractRefName(ref: string): string | null {
  const match = /#\/components\/schemas\/(.+)$/.exec(ref);
  return match ? match[1] : null;
}

/**
 * Map OpenAPI type to Java type
 */
export function mapType(type: string | undefined, format: string | undefined): JavaType {
  if (!type) return 'String';

  const typeMapping = OPENAPI_TO_JAVA[type.toLowerCase()];
  if (!typeMapping) return 'String';

  if (format) {
    const formatMapping = typeMapping[format.toLowerCase()];
    if (formatMapping) return formatMapping;
  }

  return typeMapping.default || 'String';
}

// ============================================================================
// Parser Class
// ============================================================================

export class OpenApiParser {
  private doc: OpenApiDocument;
  private warnings: string[] = [];
  private entityIdMap = new Map<string, string>();
  private entities: EntityDesign[] = [];
  private relations: RelationDesign[] = [];
  private pendingRelations: Array<{
    sourceSchemaName: string;
    targetSchemaName: string;
    fieldName: string;
    relationType: RelationType;
  }> = [];

  constructor(jsonOrObject: string | object) {
    if (typeof jsonOrObject === 'string') {
      try {
        this.doc = JSON.parse(jsonOrObject) as OpenApiDocument;
      } catch {
        throw new Error('Invalid JSON format');
      }
    } else {
      this.doc = jsonOrObject as OpenApiDocument;
    }
  }

  /**
   * Main parse method
   */
  parse(): ParsedOpenApi {
    // Validate OpenAPI version
    if (!this.doc.openapi?.startsWith('3.')) {
      this.warnings.push(
        `OpenAPI version "${this.doc.openapi || 'unknown'}" may not be fully supported. Expected 3.x`,
      );
    }

    // Parse schemas as entities
    this.parseSchemas();

    // Resolve pending relations after all entities are created
    this.resolveRelations();

    // Parse endpoints
    const endpoints = this.parseEndpoints();

    return {
      projectName: sanitizeName(this.doc.info?.title || 'ApiProject'),
      version: this.doc.info?.version || '1.0.0',
      description: this.doc.info?.description,
      entities: this.entities,
      relations: this.relations,
      endpoints,
      warnings: this.warnings,
    };
  }

  /**
   * Parse all schemas into entities
   */
  private parseSchemas(): void {
    const schemas = this.doc.components?.schemas;
    if (!schemas) {
      this.warnings.push('No schemas found in components/schemas');
      return;
    }

    let posX = 100;
    let posY = 100;

    for (const [schemaName, schema] of Object.entries(schemas)) {
      // Skip schemas that don't look like entities (e.g., enums, primitives)
      if (!this.isEntitySchema(schema)) {
        continue;
      }

      const entity = this.parseSchema(schemaName, schema, { x: posX, y: posY });
      if (entity) {
        this.entities.push(entity);
        this.entityIdMap.set(schemaName, entity.id);

        // Update position for next entity
        posX += 300;
        if (posX > 900) {
          posX = 100;
          posY += 250;
        }
      }
    }
  }

  /**
   * Check if a schema looks like an entity (has properties)
   */
  private isEntitySchema(schema: SchemaObject): boolean {
    // Has object type with properties
    if (schema.type === 'object' && schema.properties) {
      return true;
    }
    // Uses allOf composition (common for inheritance)
    if (schema.allOf && schema.allOf.some((s) => s.properties || s.$ref)) {
      return true;
    }
    // Has properties without explicit type
    if (schema.properties && Object.keys(schema.properties).length > 0) {
      return true;
    }
    return false;
  }

  /**
   * Parse a single schema into an entity
   */
  private parseSchema(
    schemaName: string,
    schema: SchemaObject,
    position: { x: number; y: number },
  ): EntityDesign | null {
    const entityName = toPascalCase(sanitizeName(schemaName));
    const entityId = nanoid();

    // Handle allOf composition
    let properties = schema.properties || {};
    let required = schema.required || [];

    if (schema.allOf) {
      for (const subSchema of schema.allOf) {
        if (subSchema.properties) {
          properties = { ...properties, ...subSchema.properties };
        }
        if (subSchema.required) {
          required = [...required, ...subSchema.required];
        }
      }
    }

    const fields: FieldDesign[] = [];
    let hasIdField = false;

    for (const [propName, propSchema] of Object.entries(properties)) {
      const field = this.parseField(propName, propSchema, required.includes(propName), schemaName);
      if (field) {
        fields.push(field);
        if (propName.toLowerCase() === 'id') {
          hasIdField = true;
        }
      }
    }

    // Add ID field if missing
    if (!hasIdField) {
      fields.unshift({
        id: nanoid(),
        name: 'id',
        columnName: 'id',
        type: 'Long',
        nullable: false,
        unique: true,
        validations: [],
        description: 'Primary key (auto-generated)',
      });
    }

    return {
      id: entityId,
      name: entityName,
      tableName: toSnakeCase(entityName) + 's',
      description: schema.description,
      position,
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
        enableCaching: false,
      },
    };
  }

  /**
   * Parse a single property into a field
   */
  private parseField(
    propName: string,
    propSchema: SchemaObject,
    isRequired: boolean,
    parentSchemaName: string,
  ): FieldDesign | null {
    const fieldName = toCamelCase(sanitizeName(propName));

    // Handle $ref - this is a relation
    if (propSchema.$ref) {
      const refName = extractRefName(propSchema.$ref);
      if (refName) {
        this.pendingRelations.push({
          sourceSchemaName: parentSchemaName,
          targetSchemaName: refName,
          fieldName,
          relationType: 'ManyToOne',
        });
      }
      return null; // Relations are handled separately
    }

    // Handle array type
    if (propSchema.type === 'array' && propSchema.items) {
      // Array with $ref items - this is a relation
      if (propSchema.items.$ref) {
        const refName = extractRefName(propSchema.items.$ref);
        if (refName) {
          this.pendingRelations.push({
            sourceSchemaName: parentSchemaName,
            targetSchemaName: refName,
            fieldName,
            relationType: 'OneToMany',
          });
        }
        return null; // Relations are handled separately
      }

      // Array of primitives - store as String (JSON)
      this.warnings.push(
        `Field "${propName}" in "${parentSchemaName}" is an array of primitives. Mapped to String.`,
      );
      return this.createFieldDesign(fieldName, propName, 'String', isRequired, propSchema.description);
    }

    // Handle enum as String
    if (propSchema.enum) {
      return this.createFieldDesign(fieldName, propName, 'String', isRequired, propSchema.description);
    }

    // Standard type mapping
    const javaType = mapType(propSchema.type, propSchema.format);
    return this.createFieldDesign(fieldName, propName, javaType, isRequired, propSchema.description);
  }

  /**
   * Create a FieldDesign object
   */
  private createFieldDesign(
    fieldName: string,
    columnName: string,
    javaType: JavaType,
    isRequired: boolean,
    description?: string,
  ): FieldDesign {
    const validations: ValidationRule[] = [];

    if (isRequired) {
      validations.push({ type: javaType === 'String' ? 'NotBlank' : 'NotNull' });
    }

    return {
      id: nanoid(),
      name: fieldName,
      columnName: toSnakeCase(columnName),
      type: javaType,
      nullable: !isRequired,
      unique: false,
      validations,
      description,
    };
  }

  /**
   * Resolve all pending relations after entities are created
   */
  private resolveRelations(): void {
    for (const pending of this.pendingRelations) {
      const sourceEntityId = this.entityIdMap.get(pending.sourceSchemaName);
      const targetEntityId = this.entityIdMap.get(pending.targetSchemaName);

      if (!sourceEntityId) {
        this.warnings.push(
          `Could not resolve relation: source schema "${pending.sourceSchemaName}" not found`,
        );
        continue;
      }

      if (!targetEntityId) {
        this.warnings.push(
          `Could not resolve relation: target schema "${pending.targetSchemaName}" not found`,
        );
        continue;
      }

      const relation = this.createRelation(
        sourceEntityId,
        targetEntityId,
        pending.fieldName,
        pending.relationType,
        pending.targetSchemaName,
      );
      this.relations.push(relation);
    }
  }

  /**
   * Create a relation between two entities
   */
  private createRelation(
    sourceEntityId: string,
    targetEntityId: string,
    fieldName: string,
    relationType: RelationType,
    targetSchemaName: string,
  ): RelationDesign {
    return {
      id: nanoid(),
      type: relationType,
      sourceEntityId,
      sourceFieldName: fieldName,
      targetEntityId,
      bidirectional: false,
      fetchType: 'LAZY',
      cascade: [],
      foreignKey: {
        columnName: `${toSnakeCase(singularize(targetSchemaName))}_id`,
        nullable: true,
        onDelete: 'NO_ACTION',
        onUpdate: 'NO_ACTION',
      },
    };
  }

  /**
   * Parse all paths into endpoints
   */
  private parseEndpoints(): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = [];
    const paths = this.doc.paths;

    if (!paths) {
      this.warnings.push('No paths found in the OpenAPI document');
      return endpoints;
    }

    for (const [path, pathItem] of Object.entries(paths)) {
      const methods: Array<{ method: ParsedEndpoint['method']; op: OperationObject | undefined }> = [
        { method: 'GET', op: pathItem.get },
        { method: 'POST', op: pathItem.post },
        { method: 'PUT', op: pathItem.put },
        { method: 'PATCH', op: pathItem.patch },
        { method: 'DELETE', op: pathItem.delete },
      ];

      for (const { method, op } of methods) {
        if (op) {
          endpoints.push(this.parseEndpoint(path, method, op));
        }
      }
    }

    return endpoints;
  }

  /**
   * Parse a single endpoint
   */
  private parseEndpoint(
    path: string,
    method: ParsedEndpoint['method'],
    operation: OperationObject,
  ): ParsedEndpoint {
    // Try to infer entity name from path or tags
    let entityName: string | undefined;

    // Try from tags first
    if (operation.tags && operation.tags.length > 0) {
      entityName = toPascalCase(sanitizeName(singularize(operation.tags[0])));
    }

    // Try from path (e.g., /users, /api/v1/orders)
    if (!entityName) {
      const pathParts = path.split('/').filter(Boolean);
      for (let i = pathParts.length - 1; i >= 0; i--) {
        const part = pathParts[i];
        // Skip path parameters like {id}
        if (!part.startsWith('{')) {
          entityName = toPascalCase(sanitizeName(singularize(part)));
          break;
        }
      }
    }

    return {
      path,
      method,
      operationId: operation.operationId,
      summary: operation.summary || operation.description,
      tags: operation.tags || [],
      entityName,
    };
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

/**
 * Parse an OpenAPI document and return entities, relations, and endpoints
 */
export function parseOpenApi(jsonOrObject: string | object): ParsedOpenApi {
  const parser = new OpenApiParser(jsonOrObject);
  return parser.parse();
}
