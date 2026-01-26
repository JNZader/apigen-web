# T-033: Crear OpenAPI Parser

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.1 Parser Core

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-033 |
| **Tipo** | Feature |
| **Estimado** | 4h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Crear parser para archivos OpenAPI 3.x que extraiga entidades, endpoints y relaciones.

---

## Tareas

- [ ] Crear `utils/openApiParser.ts`
- [ ] Parsear schemas como entidades
- [ ] Detectar relaciones ($ref, allOf)
- [ ] Extraer endpoints
- [ ] Manejar errores de formato

---

## Archivos a Crear

```
src/utils/
└── openApiParser.ts  ← CREAR (~300 lineas)
```

---

## Codigo de Referencia

```typescript
// src/utils/openApiParser.ts

import type { Entity, Field } from '@/types/entity';
import type { Relation } from '@/types/relation';

export interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
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
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, ResponseObject>;
}

interface ParameterObject {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  schema?: SchemaObject;
}

interface RequestBodyObject {
  content?: Record<string, MediaTypeObject>;
  required?: boolean;
}

interface ResponseObject {
  description: string;
  content?: Record<string, MediaTypeObject>;
}

interface MediaTypeObject {
  schema?: SchemaObject;
}

interface SchemaObject {
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  $ref?: string;
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  enum?: (string | number)[];
  description?: string;
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

export interface ParsedOpenApi {
  projectName: string;
  version: string;
  description?: string;
  entities: Entity[];
  relations: Relation[];
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

export class OpenApiParser {
  private warnings: string[] = [];
  private entities: Map<string, Entity> = new Map();
  private relations: Relation[] = [];

  parse(content: string): ParsedOpenApi {
    this.warnings = [];
    this.entities.clear();
    this.relations = [];

    let doc: OpenApiDocument;
    try {
      doc = this.parseContent(content);
    } catch (error) {
      throw new Error(`Invalid OpenAPI document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.validateOpenApiVersion(doc);
    this.parseSchemas(doc.components?.schemas || {});
    const endpoints = this.parseEndpoints(doc.paths || {});

    return {
      projectName: this.sanitizeName(doc.info.title),
      version: doc.info.version,
      description: doc.info.description,
      entities: Array.from(this.entities.values()),
      relations: this.relations,
      endpoints,
      warnings: this.warnings,
    };
  }

  private parseContent(content: string): OpenApiDocument {
    // Try JSON first
    try {
      return JSON.parse(content);
    } catch {
      // Try YAML (basic support)
      return this.parseYaml(content);
    }
  }

  private parseYaml(content: string): OpenApiDocument {
    // Basic YAML parsing - for full support, use a library
    // This handles simple cases
    throw new Error('YAML parsing requires js-yaml library. Please provide JSON format.');
  }

  private validateOpenApiVersion(doc: OpenApiDocument): void {
    if (!doc.openapi) {
      throw new Error('Missing openapi version field');
    }
    if (!doc.openapi.startsWith('3.')) {
      this.warnings.push(`OpenAPI version ${doc.openapi} may not be fully supported. Recommended: 3.0.x or 3.1.x`);
    }
  }

  private parseSchemas(schemas: Record<string, SchemaObject>): void {
    for (const [name, schema] of Object.entries(schemas)) {
      if (this.isEntitySchema(schema)) {
        this.parseEntitySchema(name, schema);
      }
    }

    // Second pass: resolve relations
    this.resolveRelations(schemas);
  }

  private isEntitySchema(schema: SchemaObject): boolean {
    return schema.type === 'object' && !!schema.properties;
  }

  private parseEntitySchema(name: string, schema: SchemaObject): void {
    const fields: Field[] = [];
    const required = schema.required || [];

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties || {})) {
      const field = this.parseField(fieldName, fieldSchema, required.includes(fieldName));
      if (field) {
        fields.push(field);
      }
    }

    // Ensure there's an ID field
    if (!fields.some((f) => f.name.toLowerCase() === 'id')) {
      fields.unshift({
        id: crypto.randomUUID(),
        name: 'id',
        type: 'Long',
        primaryKey: true,
        nullable: false,
        unique: true,
      });
    }

    const entity: Entity = {
      id: crypto.randomUUID(),
      name: this.sanitizeName(name),
      tableName: this.toSnakeCase(name),
      fields,
      position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
    };

    this.entities.set(name, entity);
  }

  private parseField(name: string, schema: SchemaObject, isRequired: boolean): Field | null {
    // Skip reference fields (will become relations)
    if (schema.$ref) {
      return null;
    }

    const field: Field = {
      id: crypto.randomUUID(),
      name: this.toCamelCase(name),
      type: this.mapType(schema),
      nullable: !isRequired || schema.nullable === true,
      unique: false,
    };

    // Add constraints
    if (schema.minLength !== undefined) {
      field.minLength = schema.minLength;
    }
    if (schema.maxLength !== undefined) {
      field.maxLength = schema.maxLength;
    }
    if (schema.minimum !== undefined) {
      field.min = schema.minimum;
    }
    if (schema.maximum !== undefined) {
      field.max = schema.maximum;
    }
    if (schema.pattern) {
      field.pattern = schema.pattern;
    }
    if (schema.enum) {
      field.enumValues = schema.enum.map(String);
      field.type = 'Enum';
    }

    return field;
  }

  private mapType(schema: SchemaObject): string {
    const { type, format } = schema;

    if (type === 'string') {
      switch (format) {
        case 'date':
          return 'LocalDate';
        case 'date-time':
          return 'LocalDateTime';
        case 'uuid':
          return 'UUID';
        case 'email':
          return 'String';
        case 'uri':
          return 'String';
        default:
          return 'String';
      }
    }

    if (type === 'integer') {
      return format === 'int64' ? 'Long' : 'Integer';
    }

    if (type === 'number') {
      return format === 'float' ? 'Float' : 'Double';
    }

    if (type === 'boolean') {
      return 'Boolean';
    }

    if (type === 'array') {
      return 'List';
    }

    return 'String';
  }

  private resolveRelations(schemas: Record<string, SchemaObject>): void {
    for (const [name, schema] of Object.entries(schemas)) {
      for (const [fieldName, fieldSchema] of Object.entries(schema.properties || {})) {
        if (fieldSchema.$ref) {
          this.createRelation(name, fieldName, fieldSchema.$ref);
        }
        if (fieldSchema.type === 'array' && fieldSchema.items?.$ref) {
          this.createRelation(name, fieldName, fieldSchema.items.$ref, true);
        }
      }
    }
  }

  private createRelation(sourceName: string, fieldName: string, ref: string, isArray = false): void {
    const targetName = ref.split('/').pop() || '';
    const source = this.entities.get(sourceName);
    const target = this.entities.get(targetName);

    if (!source || !target) {
      this.warnings.push(`Could not resolve relation: ${sourceName}.${fieldName} -> ${targetName}`);
      return;
    }

    const relation: Relation = {
      id: crypto.randomUUID(),
      name: fieldName,
      sourceEntityId: source.id,
      targetEntityId: target.id,
      type: isArray ? 'ONE_TO_MANY' : 'MANY_TO_ONE',
      sourceField: fieldName,
      targetField: 'id',
    };

    this.relations.push(relation);
  }

  private parseEndpoints(paths: Record<string, PathItem>): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = [];

    for (const [path, pathItem] of Object.entries(paths)) {
      const methods: Array<{ method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; op?: OperationObject }> = [
        { method: 'GET', op: pathItem.get },
        { method: 'POST', op: pathItem.post },
        { method: 'PUT', op: pathItem.put },
        { method: 'PATCH', op: pathItem.patch },
        { method: 'DELETE', op: pathItem.delete },
      ];

      for (const { method, op } of methods) {
        if (op) {
          endpoints.push({
            path,
            method,
            operationId: op.operationId,
            summary: op.summary,
            tags: op.tags || [],
            entityName: this.inferEntityFromPath(path),
          });
        }
      }
    }

    return endpoints;
  }

  private inferEntityFromPath(path: string): string | undefined {
    // Try to extract entity name from path like /api/users or /api/v1/products
    const segments = path.split('/').filter(Boolean);
    const entitySegment = segments.find((s) => !s.startsWith('{') && !['api', 'v1', 'v2'].includes(s));
    if (entitySegment) {
      return this.sanitizeName(this.singularize(entitySegment));
    }
    return undefined;
  }

  private sanitizeName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '_$&');
  }

  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  private singularize(word: string): string {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }
}

export const openApiParser = new OpenApiParser();
```

---

## Criterios de Completado

- [ ] Parsea documentos OpenAPI 3.x JSON
- [ ] Extrae schemas como entidades
- [ ] Detecta relaciones por $ref
- [ ] Extrae endpoints
- [ ] Maneja errores gracefully
- [ ] `npm run check` pasa

---

## Pre-Commit Checklist

> **Antes de commitear**, ejecutar en orden:

```bash
npm run check:fix && npm run test:run && gga run
```

- [ ] `npm run build` - Sin errores de tipos
- [ ] `npm run check:fix` - Lint/formato OK
- [ ] `npm run test:run` - Tests pasan
- [ ] `gga run` - STATUS: PASSED

> Ver detalles: [[WORKFLOW-PRECOMMIT]]

---

## Log de Trabajo

| Fecha | Tiempo | Notas |
|-------|--------|-------|
| - | - | - |

---

#task #fase-3 #feature #pending

Fase 0 → [[T-033]] → [[T-034]] | [[Phases/03-OPENAPI-IMPORT]]
