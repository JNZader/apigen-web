# T-037: Tests OpenAPI Parser

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.2 Tests

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-037 |
| **Tipo** | Test |
| **Estimado** | 2h |
| **Dependencias** | [[T-033]], [[T-036]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Crear tests exhaustivos para OpenAPI parser y validator.

---

## Archivos a Crear

```
src/utils/
├── openApiParser.test.ts     ← CREAR (~150 lineas)
└── openApiValidator.test.ts  ← CREAR (~100 lineas)
```

---

## Codigo de Referencia

```typescript
// src/utils/openApiParser.test.ts

import { describe, it, expect } from 'vitest';
import { OpenApiParser } from './openApiParser';

describe('OpenApiParser', () => {
  const parser = new OpenApiParser();

  describe('parse', () => {
    it('parses minimal valid document', () => {
      const doc = JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
              },
              required: ['name', 'email'],
            },
          },
        },
      });

      const result = parser.parse(doc);

      expect(result.projectName).toBe('TestAPI');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('User');
    });

    it('extracts fields from schema', () => {
      const doc = JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Product: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 1, maxLength: 100 },
                price: { type: 'number', minimum: 0 },
                quantity: { type: 'integer' },
                active: { type: 'boolean' },
              },
              required: ['name', 'price'],
            },
          },
        },
      });

      const result = parser.parse(doc);
      const product = result.entities.find((e) => e.name === 'Product');

      expect(product).toBeDefined();
      expect(product!.fields).toContainEqual(
        expect.objectContaining({ name: 'name', type: 'String', minLength: 1, maxLength: 100 })
      );
      expect(product!.fields).toContainEqual(
        expect.objectContaining({ name: 'price', type: 'Double', min: 0 })
      );
    });

    it('detects relations from $ref', () => {
      const doc = JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Order: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/OrderItem' },
                },
              },
            },
            User: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
            OrderItem: {
              type: 'object',
              properties: { quantity: { type: 'integer' } },
            },
          },
        },
      });

      const result = parser.parse(doc);

      expect(result.relations).toHaveLength(2);
      expect(result.relations).toContainEqual(
        expect.objectContaining({ type: 'MANY_TO_ONE' })
      );
      expect(result.relations).toContainEqual(
        expect.objectContaining({ type: 'ONE_TO_MANY' })
      );
    });

    it('parses endpoints', () => {
      const doc = JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/api/users': {
            get: { summary: 'List users', tags: ['users'] },
            post: { summary: 'Create user', tags: ['users'] },
          },
          '/api/users/{id}': {
            get: { summary: 'Get user', operationId: 'getUserById' },
            delete: { summary: 'Delete user' },
          },
        },
      });

      const result = parser.parse(doc);

      expect(result.endpoints).toHaveLength(4);
      expect(result.endpoints).toContainEqual(
        expect.objectContaining({ path: '/api/users', method: 'GET' })
      );
      expect(result.endpoints).toContainEqual(
        expect.objectContaining({ operationId: 'getUserById' })
      );
    });

    it('adds ID field if missing', () => {
      const doc = JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Category: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
          },
        },
      });

      const result = parser.parse(doc);
      const category = result.entities[0];

      expect(category.fields[0]).toEqual(
        expect.objectContaining({ name: 'id', primaryKey: true })
      );
    });

    it('handles type mappings correctly', () => {
      const doc = JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Event: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date' },
                timestamp: { type: 'string', format: 'date-time' },
                uuid: { type: 'string', format: 'uuid' },
                count: { type: 'integer', format: 'int64' },
                rating: { type: 'number', format: 'float' },
              },
            },
          },
        },
      });

      const result = parser.parse(doc);
      const event = result.entities[0];

      expect(event.fields).toContainEqual(expect.objectContaining({ name: 'date', type: 'LocalDate' }));
      expect(event.fields).toContainEqual(expect.objectContaining({ name: 'timestamp', type: 'LocalDateTime' }));
      expect(event.fields).toContainEqual(expect.objectContaining({ name: 'uuid', type: 'UUID' }));
      expect(event.fields).toContainEqual(expect.objectContaining({ name: 'count', type: 'Long' }));
      expect(event.fields).toContainEqual(expect.objectContaining({ name: 'rating', type: 'Float' }));
    });

    it('handles enum fields', () => {
      const doc = JSON.stringify({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        components: {
          schemas: {
            Task: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'DONE'] },
              },
            },
          },
        },
      });

      const result = parser.parse(doc);
      const statusField = result.entities[0].fields.find((f) => f.name === 'status');

      expect(statusField?.type).toBe('Enum');
      expect(statusField?.enumValues).toEqual(['PENDING', 'IN_PROGRESS', 'DONE']);
    });

    it('throws on invalid JSON', () => {
      expect(() => parser.parse('not json')).toThrow();
    });

    it('throws on missing openapi version', () => {
      const doc = JSON.stringify({
        info: { title: 'Test', version: '1.0.0' },
      });

      expect(() => parser.parse(doc)).toThrow();
    });
  });
});
```

```typescript
// src/utils/openApiValidator.test.ts

import { describe, it, expect } from 'vitest';
import { validateOpenApiDocument, isOpenApiDocument } from './openApiValidator';

describe('validateOpenApiDocument', () => {
  it('returns valid for correct document', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const result = validateOpenApiDocument(doc);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns error for missing openapi field', () => {
    const doc = {
      info: { title: 'Test', version: '1.0.0' },
    };

    const result = validateOpenApiDocument(doc);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'MISSING_OPENAPI_VERSION' })
    );
  });

  it('returns error for missing info', () => {
    const doc = { openapi: '3.0.0' };

    const result = validateOpenApiDocument(doc);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'MISSING_INFO' })
    );
  });

  it('returns warning for old version', () => {
    const doc = {
      openapi: '2.0',
      info: { title: 'Test', version: '1.0.0' },
    };

    const result = validateOpenApiDocument(doc);

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'UNSUPPORTED_VERSION' })
    );
  });

  it('returns warning for no schemas', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {},
    };

    const result = validateOpenApiDocument(doc);

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'NO_SCHEMAS' })
    );
  });

  it('validates path format', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        'invalid-path': {},
      },
    };

    const result = validateOpenApiDocument(doc);

    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: 'INVALID_PATH' })
    );
  });
});

describe('isOpenApiDocument', () => {
  it('returns true for valid document', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    };

    expect(isOpenApiDocument(doc)).toBe(true);
  });

  it('returns false for invalid document', () => {
    expect(isOpenApiDocument(null)).toBe(false);
    expect(isOpenApiDocument({})).toBe(false);
    expect(isOpenApiDocument({ openapi: '3.0.0' })).toBe(false);
  });
});
```

---

## Criterios de Completado

- [ ] Tests para parser cubren casos principales
- [ ] Tests para validator cubren validaciones
- [ ] Cobertura >80%
- [ ] `npm run test:run` pasa

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

#task #fase-3 #test #pending

[[T-033]], [[T-036]] → [[T-037]] | [[Phases/03-OPENAPI-IMPORT]]
