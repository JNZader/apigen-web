# T-035: Crear openApiConverter.ts

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.1 Parser y Utilidades

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-035 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | [[T-033]], [[T-034]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Crear la utilidad que convierte schemas OpenAPI parseados a EntityDesign del proyecto, incluyendo deteccion de relaciones.

---

## Tareas

- [ ] Crear `src/utils/openApiConverter.ts`
- [ ] Implementar conversion schema → EntityDesign
- [ ] Implementar deteccion de relaciones via $ref
- [ ] Manejar arrays y objetos anidados
- [ ] Manejar enums
- [ ] Tests unitarios completos

---

## Archivos a Crear

```
src/utils/
├── openApiConverter.ts          ← CREAR (~300 lineas)
└── openApiConverter.test.ts     ← CREAR (~200 lineas)
```

**LOC Estimado:** ~500

---

## Codigo de Referencia

```typescript
// src/utils/openApiConverter.ts

import type { OpenAPIV3 } from 'openapi-types';
import type { EntityDesign, FieldDesign, FieldType } from '@/types/entity';
import type { RelationDesign, RelationType } from '@/types/relation';
import { mapOpenApiTypeToJava, mapOpenApiTypeToTypeScript } from './openApiTypeMapper';

// ============================================
// TYPES
// ============================================

export interface ConversionOptions {
  /** Target language for type mapping */
  targetLanguage: 'java' | 'typescript' | 'python' | 'go';
  /** Generate table names from schema names */
  generateTableNames: boolean;
  /** Naming convention for table names */
  tableNamingConvention: 'snake_case' | 'camelCase' | 'PascalCase';
  /** Include schemas that look like DTOs/responses */
  includeResponseSchemas: boolean;
}

export interface ConversionResult {
  entities: EntityDesign[];
  relations: RelationDesign[];
  warnings: string[];
  skipped: string[];
}

const DEFAULT_OPTIONS: ConversionOptions = {
  targetLanguage: 'java',
  generateTableNames: true,
  tableNamingConvention: 'snake_case',
  includeResponseSchemas: false,
};

// ============================================
// MAIN CONVERTER
// ============================================

/**
 * Convierte schemas OpenAPI a EntityDesign
 */
export function convertOpenApiToEntities(
  schemas: Record<string, OpenAPIV3.SchemaObject>,
  options: Partial<ConversionOptions> = {}
): ConversionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const entities: EntityDesign[] = [];
  const relations: RelationDesign[] = [];
  const warnings: string[] = [];
  const skipped: string[] = [];

  // First pass: identify entity-like schemas
  const entitySchemas = filterEntitySchemas(schemas, opts);

  // Second pass: convert each schema
  for (const [name, schema] of Object.entries(entitySchemas)) {
    try {
      const entity = convertSchemaToEntity(name, schema, opts);
      entities.push(entity);
    } catch (error) {
      warnings.push(`Failed to convert schema "${name}": ${error.message}`);
    }
  }

  // Third pass: detect relations from $ref
  for (const [name, schema] of Object.entries(entitySchemas)) {
    const detectedRelations = detectRelations(name, schema, entitySchemas);
    relations.push(...detectedRelations);
  }

  // Track skipped schemas
  for (const name of Object.keys(schemas)) {
    if (!entitySchemas[name]) {
      skipped.push(name);
    }
  }

  return { entities, relations, warnings, skipped };
}

// ============================================
// SCHEMA FILTERING
// ============================================

/**
 * Filtra schemas que parecen entidades (no DTOs, responses, etc.)
 */
function filterEntitySchemas(
  schemas: Record<string, OpenAPIV3.SchemaObject>,
  options: ConversionOptions
): Record<string, OpenAPIV3.SchemaObject> {
  const result: Record<string, OpenAPIV3.SchemaObject> = {};

  for (const [name, schema] of Object.entries(schemas)) {
    // Skip if not an object
    if (schema.type !== 'object') continue;

    // Skip common non-entity patterns
    if (!options.includeResponseSchemas) {
      if (name.endsWith('Response')) continue;
      if (name.endsWith('Request')) continue;
      if (name.endsWith('DTO')) continue;
      if (name.endsWith('Error')) continue;
      if (name.startsWith('Api')) continue;
    }

    // Must have properties
    if (!schema.properties || Object.keys(schema.properties).length === 0) {
      continue;
    }

    result[name] = schema;
  }

  return result;
}

// ============================================
// ENTITY CONVERSION
// ============================================

/**
 * Convierte un schema OpenAPI a EntityDesign
 */
function convertSchemaToEntity(
  name: string,
  schema: OpenAPIV3.SchemaObject,
  options: ConversionOptions
): EntityDesign {
  const fields: FieldDesign[] = [];
  const requiredFields = new Set(schema.required || []);

  // Check if has id field, if not add one
  let hasId = false;

  for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
    // Handle $ref - skip for now, will be a relation
    if ('$ref' in propSchema) continue;

    const prop = propSchema as OpenAPIV3.SchemaObject;

    // Skip array properties - these become relations
    if (prop.type === 'array') continue;

    // Skip nested objects - these might need separate entities
    if (prop.type === 'object' && prop.properties) continue;

    const field = convertPropertyToField(
      propName,
      prop,
      requiredFields.has(propName),
      options
    );

    if (propName === 'id' || propName === 'ID') {
      hasId = true;
      field.isPrimaryKey = true;
    }

    fields.push(field);
  }

  // Add id field if missing
  if (!hasId) {
    fields.unshift({
      id: crypto.randomUUID(),
      name: 'id',
      type: options.targetLanguage === 'java' ? 'Long' : 'number',
      isPrimaryKey: true,
      isNullable: false,
      isUnique: true,
      columnName: 'id',
    });
  }

  return {
    id: crypto.randomUUID(),
    name: name,
    tableName: options.generateTableNames
      ? toTableName(name, options.tableNamingConvention)
      : name.toLowerCase(),
    fields,
    position: { x: 0, y: 0 }, // Will be set by layout algorithm
  };
}

/**
 * Convierte una propiedad OpenAPI a FieldDesign
 */
function convertPropertyToField(
  name: string,
  schema: OpenAPIV3.SchemaObject,
  isRequired: boolean,
  options: ConversionOptions
): FieldDesign {
  const type = mapOpenApiType(schema, options.targetLanguage);

  const field: FieldDesign = {
    id: crypto.randomUUID(),
    name: name,
    type: type,
    isPrimaryKey: false,
    isNullable: !isRequired,
    isUnique: false,
    columnName: toSnakeCase(name),
  };

  // Add validations based on schema constraints
  if (schema.maxLength) {
    field.validations = { ...field.validations, maxLength: schema.maxLength };
  }
  if (schema.minLength) {
    field.validations = { ...field.validations, minLength: schema.minLength };
  }
  if (schema.minimum !== undefined) {
    field.validations = { ...field.validations, min: schema.minimum };
  }
  if (schema.maximum !== undefined) {
    field.validations = { ...field.validations, max: schema.maximum };
  }
  if (schema.pattern) {
    field.validations = { ...field.validations, pattern: schema.pattern };
  }
  if (schema.format === 'email') {
    field.validations = { ...field.validations, email: true };
  }

  return field;
}

// ============================================
// RELATION DETECTION
// ============================================

/**
 * Detecta relaciones basadas en $ref y arrays
 */
function detectRelations(
  sourceName: string,
  schema: OpenAPIV3.SchemaObject,
  allSchemas: Record<string, OpenAPIV3.SchemaObject>
): RelationDesign[] {
  const relations: RelationDesign[] = [];

  for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
    // Direct $ref - ManyToOne
    if ('$ref' in propSchema) {
      const targetName = extractRefName(propSchema.$ref);
      if (allSchemas[targetName]) {
        relations.push({
          id: crypto.randomUUID(),
          sourceEntityId: sourceName, // Will be replaced with actual ID
          targetEntityId: targetName, // Will be replaced with actual ID
          type: 'ManyToOne' as RelationType,
          sourceFieldName: propName,
          targetFieldName: 'id',
        });
      }
    }

    // Array with $ref items - OneToMany or ManyToMany
    const prop = propSchema as OpenAPIV3.SchemaObject;
    if (prop.type === 'array' && prop.items) {
      if ('$ref' in prop.items) {
        const targetName = extractRefName(prop.items.$ref);
        if (allSchemas[targetName]) {
          // Heuristic: if target has reference back, it's OneToMany
          // otherwise it might be ManyToMany
          const hasBackRef = hasBackReference(targetName, sourceName, allSchemas);

          relations.push({
            id: crypto.randomUUID(),
            sourceEntityId: sourceName,
            targetEntityId: targetName,
            type: hasBackRef ? 'OneToMany' : 'ManyToMany' as RelationType,
            sourceFieldName: propName,
            targetFieldName: hasBackRef ? toFieldName(sourceName) : undefined,
          });
        }
      }
    }
  }

  return relations;
}

/**
 * Verifica si el target schema tiene referencia de vuelta al source
 */
function hasBackReference(
  targetName: string,
  sourceName: string,
  allSchemas: Record<string, OpenAPIV3.SchemaObject>
): boolean {
  const targetSchema = allSchemas[targetName];
  if (!targetSchema?.properties) return false;

  for (const propSchema of Object.values(targetSchema.properties)) {
    if ('$ref' in propSchema) {
      const refName = extractRefName(propSchema.$ref);
      if (refName === sourceName) return true;
    }
  }

  return false;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function extractRefName(ref: string): string {
  // #/components/schemas/User -> User
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

function toTableName(
  name: string,
  convention: ConversionOptions['tableNamingConvention']
): string {
  switch (convention) {
    case 'snake_case':
      return toSnakeCase(name) + 's'; // Pluralize
    case 'camelCase':
      return name.charAt(0).toLowerCase() + name.slice(1) + 's';
    case 'PascalCase':
      return name + 's';
    default:
      return toSnakeCase(name) + 's';
  }
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function toFieldName(entityName: string): string {
  return entityName.charAt(0).toLowerCase() + entityName.slice(1);
}

function mapOpenApiType(
  schema: OpenAPIV3.SchemaObject,
  targetLanguage: string
): FieldType {
  if (targetLanguage === 'java') {
    return mapOpenApiTypeToJava(schema.type, schema.format);
  }
  return mapOpenApiTypeToTypeScript(schema.type, schema.format);
}

// ============================================
// EXPORTS
// ============================================

export {
  convertOpenApiToEntities,
  filterEntitySchemas,
  convertSchemaToEntity,
  detectRelations,
  type ConversionOptions,
  type ConversionResult,
};
```

---

## Criterios de Completado

- [ ] Convierte schemas basicos correctamente
- [ ] Detecta campos required/nullable
- [ ] Mapea tipos correctamente por lenguaje
- [ ] Detecta relaciones via $ref
- [ ] Filtra schemas que no son entidades
- [ ] Genera warnings para schemas problematicos
- [ ] Tests cubren casos edge
- [ ] `npm run check` pasa
- [ ] `npm run test:run` pasa

---

## Casos Edge a Testear

1. Schema sin propiedades
2. Schema con solo $refs
3. Circular references
4. allOf/oneOf/anyOf
5. Enums como campos
6. Arrays de primitivos
7. Nested objects sin $ref

---

## Notas

- Usar `crypto.randomUUID()` para IDs temporales
- Las posiciones de entidades seran ajustadas por auto-layout
- Los IDs de entityId en relaciones necesitan ser resueltos despues

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

[[T-033]] [[T-034]] → [[T-035]] → [[T-036]] | [[Phases/03-OPENAPI-IMPORT]]
