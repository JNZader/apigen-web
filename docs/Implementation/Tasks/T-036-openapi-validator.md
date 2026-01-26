# T-036: Crear Validador OpenAPI

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.1 Parser Core

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-036 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | [[T-034]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Crear validador para documentos OpenAPI antes del parsing.

---

## Archivos a Crear

```
src/utils/
└── openApiValidator.ts  ← CREAR (~150 lineas)
```

---

## Codigo de Referencia

```typescript
// src/utils/openApiValidator.ts

import type { OpenApiDocument, ParseWarning, ParseError } from '@/types/openapi';

export interface ValidationResult {
  isValid: boolean;
  errors: ParseError[];
  warnings: ParseWarning[];
}

export function validateOpenApiDocument(doc: unknown): ValidationResult {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];

  if (!doc || typeof doc !== 'object') {
    errors.push({
      code: 'INVALID_DOCUMENT',
      message: 'Document must be a valid object',
    });
    return { isValid: false, errors, warnings };
  }

  const document = doc as Record<string, unknown>;

  // Check required fields
  if (!document.openapi) {
    errors.push({
      code: 'MISSING_OPENAPI_VERSION',
      message: 'Missing required field: openapi',
    });
  } else if (typeof document.openapi !== 'string') {
    errors.push({
      code: 'INVALID_OPENAPI_VERSION',
      message: 'Field "openapi" must be a string',
    });
  } else if (!document.openapi.startsWith('3.')) {
    warnings.push({
      code: 'UNSUPPORTED_VERSION',
      message: `OpenAPI version ${document.openapi} may not be fully supported. Use 3.0.x or 3.1.x`,
    });
  }

  // Check info object
  if (!document.info) {
    errors.push({
      code: 'MISSING_INFO',
      message: 'Missing required field: info',
    });
  } else if (typeof document.info !== 'object') {
    errors.push({
      code: 'INVALID_INFO',
      message: 'Field "info" must be an object',
    });
  } else {
    const info = document.info as Record<string, unknown>;

    if (!info.title || typeof info.title !== 'string') {
      errors.push({
        code: 'MISSING_TITLE',
        message: 'Missing required field: info.title',
        path: 'info.title',
      });
    }

    if (!info.version || typeof info.version !== 'string') {
      errors.push({
        code: 'MISSING_VERSION',
        message: 'Missing required field: info.version',
        path: 'info.version',
      });
    }
  }

  // Check paths
  if (document.paths) {
    if (typeof document.paths !== 'object') {
      errors.push({
        code: 'INVALID_PATHS',
        message: 'Field "paths" must be an object',
      });
    } else {
      validatePaths(document.paths as Record<string, unknown>, errors, warnings);
    }
  } else {
    warnings.push({
      code: 'NO_PATHS',
      message: 'Document has no paths defined',
    });
  }

  // Check components
  if (document.components) {
    if (typeof document.components !== 'object') {
      errors.push({
        code: 'INVALID_COMPONENTS',
        message: 'Field "components" must be an object',
      });
    } else {
      validateComponents(document.components as Record<string, unknown>, errors, warnings);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function validatePaths(
  paths: Record<string, unknown>,
  errors: ParseError[],
  warnings: ParseWarning[]
): void {
  for (const [path, pathItem] of Object.entries(paths)) {
    if (!path.startsWith('/')) {
      errors.push({
        code: 'INVALID_PATH',
        message: `Path must start with "/": ${path}`,
        path: `paths.${path}`,
      });
    }

    if (!pathItem || typeof pathItem !== 'object') {
      errors.push({
        code: 'INVALID_PATH_ITEM',
        message: `Invalid path item for: ${path}`,
        path: `paths.${path}`,
      });
      continue;
    }

    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
    const item = pathItem as Record<string, unknown>;

    for (const method of methods) {
      if (item[method]) {
        validateOperation(item[method], `paths.${path}.${method}`, errors, warnings);
      }
    }
  }
}

function validateOperation(
  operation: unknown,
  path: string,
  errors: ParseError[],
  warnings: ParseWarning[]
): void {
  if (!operation || typeof operation !== 'object') {
    errors.push({
      code: 'INVALID_OPERATION',
      message: 'Operation must be an object',
      path,
    });
    return;
  }

  const op = operation as Record<string, unknown>;

  if (!op.responses || typeof op.responses !== 'object') {
    warnings.push({
      code: 'MISSING_RESPONSES',
      message: 'Operation should have responses defined',
      path,
    });
  }

  if (op.operationId && typeof op.operationId !== 'string') {
    errors.push({
      code: 'INVALID_OPERATION_ID',
      message: 'operationId must be a string',
      path: `${path}.operationId`,
    });
  }
}

function validateComponents(
  components: Record<string, unknown>,
  errors: ParseError[],
  warnings: ParseWarning[]
): void {
  const schemas = components.schemas;

  if (schemas) {
    if (typeof schemas !== 'object') {
      errors.push({
        code: 'INVALID_SCHEMAS',
        message: 'components.schemas must be an object',
        path: 'components.schemas',
      });
      return;
    }

    for (const [name, schema] of Object.entries(schemas)) {
      validateSchema(schema, `components.schemas.${name}`, errors, warnings);
    }
  } else {
    warnings.push({
      code: 'NO_SCHEMAS',
      message: 'No schemas defined in components. No entities will be generated.',
    });
  }
}

function validateSchema(
  schema: unknown,
  path: string,
  errors: ParseError[],
  warnings: ParseWarning[]
): void {
  if (!schema || typeof schema !== 'object') {
    errors.push({
      code: 'INVALID_SCHEMA',
      message: 'Schema must be an object',
      path,
    });
    return;
  }

  const s = schema as Record<string, unknown>;

  // Check for $ref
  if (s.$ref && typeof s.$ref !== 'string') {
    errors.push({
      code: 'INVALID_REF',
      message: '$ref must be a string',
      path: `${path}.$ref`,
    });
  }

  // Validate type
  const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
  if (s.type && !validTypes.includes(s.type as string)) {
    errors.push({
      code: 'INVALID_TYPE',
      message: `Invalid type: ${s.type}`,
      path: `${path}.type`,
    });
  }

  // Validate array items
  if (s.type === 'array' && !s.items) {
    warnings.push({
      code: 'MISSING_ITEMS',
      message: 'Array type should have items defined',
      path: `${path}.items`,
    });
  }

  // Validate object properties
  if (s.type === 'object' && s.properties && typeof s.properties !== 'object') {
    errors.push({
      code: 'INVALID_PROPERTIES',
      message: 'properties must be an object',
      path: `${path}.properties`,
    });
  }
}

export function isOpenApiDocument(doc: unknown): doc is OpenApiDocument {
  const result = validateOpenApiDocument(doc);
  return result.isValid;
}
```

---

## Criterios de Completado

- [ ] Valida estructura de OpenAPI 3.x
- [ ] Detecta errores criticos
- [ ] Genera warnings para problemas no criticos
- [ ] Type guard para OpenApiDocument
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

[[T-034]] → [[T-036]] → [[T-037]] | [[Phases/03-OPENAPI-IMPORT]]
