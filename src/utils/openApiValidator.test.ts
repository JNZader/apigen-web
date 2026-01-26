import { describe, expect, it } from 'vitest';
import { isOpenApiDocument, validateOpenApiDocument } from './openApiValidator';

describe('openApiValidator', () => {
  describe('isOpenApiDocument', () => {
    it('returns true for valid OpenAPI document', () => {
      const doc = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
      };
      expect(isOpenApiDocument(doc)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isOpenApiDocument(null)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isOpenApiDocument('string')).toBe(false);
      expect(isOpenApiDocument(123)).toBe(false);
      expect(isOpenApiDocument(undefined)).toBe(false);
    });

    it('returns false when openapi field is missing', () => {
      const doc = { info: { title: 'Test', version: '1.0.0' } };
      expect(isOpenApiDocument(doc)).toBe(false);
    });

    it('returns false when openapi is not a string', () => {
      const doc = { openapi: 3, info: { title: 'Test', version: '1.0.0' } };
      expect(isOpenApiDocument(doc)).toBe(false);
    });

    it('returns false when info is missing', () => {
      const doc = { openapi: '3.0.0' };
      expect(isOpenApiDocument(doc)).toBe(false);
    });

    it('returns false when info.title is missing', () => {
      const doc = { openapi: '3.0.0', info: { version: '1.0.0' } };
      expect(isOpenApiDocument(doc)).toBe(false);
    });

    it('returns false when info.version is missing', () => {
      const doc = { openapi: '3.0.0', info: { title: 'Test' } };
      expect(isOpenApiDocument(doc)).toBe(false);
    });
  });

  describe('validateOpenApiDocument', () => {
    describe('basic structure', () => {
      it('validates a minimal valid document', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('returns error for non-object input', () => {
        const result = validateOpenApiDocument('not an object');
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_DOCUMENT',
          message: 'Document must be a valid object',
        });
      });

      it('returns error for null input', () => {
        const result = validateOpenApiDocument(null);
        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_DOCUMENT');
      });
    });

    describe('openapi version validation', () => {
      it('returns error when openapi field is missing', () => {
        const doc = { info: { title: 'Test', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'MISSING_OPENAPI_VERSION',
          message: 'Missing required field: openapi',
          path: 'openapi',
        });
      });

      it('returns error when openapi is not a string', () => {
        const doc = { openapi: 3, info: { title: 'Test', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_OPENAPI_VERSION',
          message: 'Field "openapi" must be a string',
          path: 'openapi',
        });
      });

      it('returns error for OpenAPI 2.x (Swagger)', () => {
        const doc = { openapi: '2.0', info: { title: 'Test', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'UNSUPPORTED_OPENAPI_VERSION',
          message: 'OpenAPI version 2.0 is not supported. Only OpenAPI 3.x is supported',
          path: 'openapi',
        });
      });

      it('accepts OpenAPI 3.0.x versions', () => {
        const doc = { openapi: '3.0.3', info: { title: 'Test', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.errors.filter((e) => e.code.includes('OPENAPI_VERSION'))).toHaveLength(0);
      });

      it('accepts OpenAPI 3.1.x versions', () => {
        const doc = { openapi: '3.1.0', info: { title: 'Test', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.errors.filter((e) => e.code.includes('OPENAPI_VERSION'))).toHaveLength(0);
      });
    });

    describe('info validation', () => {
      it('returns error when info is missing', () => {
        const doc = { openapi: '3.0.0' };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'MISSING_INFO',
          message: 'Missing required field: info',
          path: 'info',
        });
      });

      it('returns error when info is not an object', () => {
        const doc = { openapi: '3.0.0', info: 'invalid' };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_INFO',
          message: 'Field "info" must be an object',
          path: 'info',
        });
      });

      it('returns error when info.title is missing', () => {
        const doc = { openapi: '3.0.0', info: { version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'MISSING_INFO_TITLE',
          message: 'Missing required field: info.title',
          path: 'info.title',
        });
      });

      it('returns error when info.title is empty', () => {
        const doc = { openapi: '3.0.0', info: { title: '  ', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'EMPTY_INFO_TITLE',
          message: 'Field "info.title" cannot be empty',
          path: 'info.title',
        });
      });

      it('returns error when info.version is missing', () => {
        const doc = { openapi: '3.0.0', info: { title: 'Test' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'MISSING_INFO_VERSION',
          message: 'Missing required field: info.version',
          path: 'info.version',
        });
      });

      it('returns warning when description is missing', () => {
        const doc = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings).toContainEqual({
          code: 'MISSING_INFO_DESCRIPTION',
          message: 'Consider adding a description to info',
          path: 'info.description',
        });
      });

      it('does not warn when description is present', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0', description: 'A test API' },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.filter((w) => w.code === 'MISSING_INFO_DESCRIPTION')).toHaveLength(
          0,
        );
      });
    });

    describe('paths validation', () => {
      it('returns warning when paths is missing', () => {
        const doc = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings).toContainEqual({
          code: 'MISSING_PATHS',
          message: 'No paths defined in the document',
          path: 'paths',
        });
      });

      it('returns error when paths is not an object', () => {
        const doc = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: 'bad' };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_PATHS',
          message: 'Field "paths" must be an object',
          path: 'paths',
        });
      });

      it('returns warning when paths is empty', () => {
        const doc = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings).toContainEqual({
          code: 'EMPTY_PATHS',
          message: 'No paths defined in the document',
          path: 'paths',
        });
      });

      it('returns error when path does not start with /', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: { 'users/{id}': {} },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_PATH_FORMAT',
          message: 'Path "users/{id}" must start with /',
          path: 'paths.users/{id}',
        });
      });

      it('accepts valid paths starting with /', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: { '/users': {}, '/users/{id}': {} },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.errors.filter((e) => e.code === 'INVALID_PATH_FORMAT')).toHaveLength(0);
      });

      it('returns error when path item is not an object', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: { '/users': 'invalid' },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_PATH_ITEM',
          message: 'Path item for "/users" must be an object',
          path: 'paths./users',
        });
      });
    });

    describe('components.schemas validation', () => {
      it('accepts document without components', () => {
        const doc = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.errors.filter((e) => e.code.includes('COMPONENT'))).toHaveLength(0);
      });

      it('returns error when components is not an object', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: 'bad',
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_COMPONENTS',
          message: 'Field "components" must be an object',
          path: 'components',
        });
      });

      it('accepts components without schemas', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { responses: {} },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.errors.filter((e) => e.code.includes('SCHEMA'))).toHaveLength(0);
      });

      it('returns error when schemas is not an object', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: 'bad' },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_SCHEMAS',
          message: 'Field "components.schemas" must be an object',
          path: 'components.schemas',
        });
      });

      it('returns error when schema is not an object', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: { User: 'bad' } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'INVALID_SCHEMA',
          message: 'Schema "User" must be an object',
          path: 'components.schemas.User',
        });
      });

      it('returns warning when schema has no type or $ref', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: { Empty: {} } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings).toContainEqual({
          code: 'SCHEMA_MISSING_TYPE',
          message: 'Schema "Empty" has no type, $ref, or composition keyword',
          path: 'components.schemas.Empty',
        });
      });

      it('does not warn for schema with type', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: { User: { type: 'object', properties: {} } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.filter((w) => w.code === 'SCHEMA_MISSING_TYPE')).toHaveLength(0);
      });

      it('does not warn for schema with $ref', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: { Ref: { $ref: '#/components/schemas/Other' } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.filter((w) => w.code === 'SCHEMA_MISSING_TYPE')).toHaveLength(0);
      });

      it('does not warn for schema with allOf', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: { Combined: { allOf: [{ type: 'object' }] } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.filter((w) => w.code === 'SCHEMA_MISSING_TYPE')).toHaveLength(0);
      });

      it('returns warning for object schema without properties', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: { Empty: { type: 'object' } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings).toContainEqual({
          code: 'OBJECT_SCHEMA_MISSING_PROPERTIES',
          message: 'Object schema "Empty" has no properties defined',
          path: 'components.schemas.Empty',
        });
      });

      it('returns error for array schema without items', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: { List: { type: 'array' } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual({
          code: 'ARRAY_SCHEMA_MISSING_ITEMS',
          message: 'Array schema "List" must have items defined',
          path: 'components.schemas.List',
        });
      });

      it('accepts valid array schema with items', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: { schemas: { List: { type: 'array', items: { type: 'string' } } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.errors.filter((e) => e.code === 'ARRAY_SCHEMA_MISSING_ITEMS')).toHaveLength(
          0,
        );
      });
    });

    describe('full document validation', () => {
      it('validates a complete valid OpenAPI document', () => {
        const doc = {
          openapi: '3.0.3',
          info: {
            title: 'Pet Store API',
            version: '1.0.0',
            description: 'A sample pet store API',
          },
          paths: {
            '/pets': {
              get: { summary: 'List pets', responses: { '200': { description: 'OK' } } },
            },
            '/pets/{id}': {
              get: { summary: 'Get pet by ID', responses: { '200': { description: 'OK' } } },
            },
          },
          components: {
            schemas: {
              Pet: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                },
              },
              Pets: {
                type: 'array',
                items: { $ref: '#/components/schemas/Pet' },
              },
            },
          },
        };

        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('collects multiple errors from invalid document', () => {
        const doc = {
          openapi: '2.0',
          info: { title: '' },
          paths: { 'no-slash': 'bad' },
          components: { schemas: { Bad: { type: 'array' } } },
        };

        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(3);
      });
    });
  });
});
