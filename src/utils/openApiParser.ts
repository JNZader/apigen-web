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
