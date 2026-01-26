import { describe, expect, it } from 'vitest';
import { isOpenApiDocument, validateOpenApiDocument } from './openApiValidator';

describe('openApiValidator', () => {
  describe('isOpenApiDocument', () => {
    it('should return true for valid OpenAPI document structure', () => {
      const validDoc = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
      };
      expect(isOpenApiDocument(validDoc)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isOpenApiDocument(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isOpenApiDocument(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isOpenApiDocument('string')).toBe(false);
      expect(isOpenApiDocument(123)).toBe(false);
      expect(isOpenApiDocument(true)).toBe(false);
      expect(isOpenApiDocument([])).toBe(false);
    });

    it('should return false when openapi is missing', () => {
      const noOpenApi = {
        info: { title: 'Test', version: '1.0' },
      };
      expect(isOpenApiDocument(noOpenApi)).toBe(false);
    });

    it('should return false when openapi is not a string', () => {
      const nonStringOpenApi = {
        openapi: 3,
        info: { title: 'Test', version: '1.0' },
      };
      expect(isOpenApiDocument(nonStringOpenApi)).toBe(false);
    });

    it('should return false when info is missing', () => {
      const noInfo = { openapi: '3.0.0' };
      expect(isOpenApiDocument(noInfo)).toBe(false);
    });

    it('should return false when info is not an object', () => {
      const nonObjectInfo = {
        openapi: '3.0.0',
        info: 'not an object',
      };
      expect(isOpenApiDocument(nonObjectInfo)).toBe(false);
    });

    it('should return false when info.title is missing', () => {
      const noTitle = {
        openapi: '3.0.0',
        info: { version: '1.0' },
      };
      expect(isOpenApiDocument(noTitle)).toBe(false);
    });

    it('should return false when info.version is missing', () => {
      const noVersion = {
        openapi: '3.0.0',
        info: { title: 'Test' },
      };
      expect(isOpenApiDocument(noVersion)).toBe(false);
    });

    it('should return false when info.title is not a string', () => {
      const nonStringTitle = {
        openapi: '3.0.0',
        info: { title: 123, version: '1.0' },
      };
      expect(isOpenApiDocument(nonStringTitle)).toBe(false);
    });

    it('should return false when info.version is not a string', () => {
      const nonStringVersion = {
        openapi: '3.0.0',
        info: { title: 'Test', version: 1.0 },
      };
      expect(isOpenApiDocument(nonStringVersion)).toBe(false);
    });
  });

  describe('validateOpenApiDocument', () => {
    describe('basic structure validation', () => {
      it('should return valid for correct document', () => {
        const validDoc = {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0', description: 'Test' },
          paths: { '/users': {} },
          components: { schemas: { User: { type: 'object' } } },
        };
        const result = validateOpenApiDocument(validDoc);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should return error for null document', () => {
        const result = validateOpenApiDocument(null);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_DOCUMENT')).toBe(true);
      });

      it('should return error for non-object document', () => {
        const result = validateOpenApiDocument('not an object');
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_DOCUMENT')).toBe(true);
      });
    });

    describe('openapi version validation', () => {
      it('should return error for missing openapi field', () => {
        const doc = { info: { title: 'Test', version: '1.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('openapi'))).toBe(true);
      });

      it('should return error for non-string openapi field', () => {
        const doc = { openapi: 3, info: { title: 'Test', version: '1.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('openapi'))).toBe(true);
      });

      it('should return error for unsupported OpenAPI version', () => {
        const doc = { openapi: '2.0', info: { title: 'Test', version: '1.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.message.includes('not supported'))).toBe(true);
      });

      it('should accept OpenAPI 3.0.x versions', () => {
        const doc = {
          openapi: '3.0.3',
          info: { title: 'Test', version: '1.0', description: 'desc' },
          paths: { '/test': {} },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(true);
      });

      it('should accept OpenAPI 3.1.x versions', () => {
        const doc = {
          openapi: '3.1.0',
          info: { title: 'Test', version: '1.0', description: 'desc' },
          paths: { '/test': {} },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(true);
      });
    });

    describe('info validation', () => {
      it('should return error for missing info field', () => {
        const doc = { openapi: '3.0.0' };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.path === 'info')).toBe(true);
      });

      it('should return error for non-object info field', () => {
        const doc = { openapi: '3.0.0', info: 'invalid' };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_INFO')).toBe(true);
      });

      it('should return error for missing info.title', () => {
        const doc = { openapi: '3.0.0', info: { version: '1.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.path === 'info.title')).toBe(true);
      });

      it('should return error for non-string info.title', () => {
        const doc = { openapi: '3.0.0', info: { title: 123, version: '1.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_INFO_TITLE')).toBe(true);
      });

      it('should return error for empty info.title', () => {
        const doc = { openapi: '3.0.0', info: { title: '  ', version: '1.0' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'EMPTY_INFO_TITLE')).toBe(true);
      });

      it('should return error for missing info.version', () => {
        const doc = { openapi: '3.0.0', info: { title: 'Test' } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.path === 'info.version')).toBe(true);
      });

      it('should return error for non-string info.version', () => {
        const doc = { openapi: '3.0.0', info: { title: 'Test', version: 1.0 } };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_INFO_VERSION')).toBe(true);
      });

      it('should add warning for missing description', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0' },
          paths: { '/test': {} },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.some((w) => w.code === 'MISSING_INFO_DESCRIPTION')).toBe(true);
      });
    });

    describe('paths validation', () => {
      it('should add warning for missing paths', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0', description: 'desc' },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.some((w) => w.code === 'MISSING_PATHS')).toBe(true);
      });

      it('should return error for non-object paths', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0' },
          paths: 'invalid',
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_PATHS')).toBe(true);
      });

      it('should add warning for empty paths object', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0', description: 'desc' },
          paths: {},
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.some((w) => w.code === 'EMPTY_PATHS')).toBe(true);
      });

      it('should return error for path not starting with /', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0' },
          paths: { users: {} },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_PATH_FORMAT')).toBe(true);
      });

      it('should return error for non-object path item', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0' },
          paths: { '/users': 'invalid' },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_PATH_ITEM')).toBe(true);
      });
    });

    describe('components.schemas validation', () => {
      it('should not error when components is missing', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0', description: 'desc' },
          paths: { '/test': {} },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(true);
      });

      it('should return error for non-object components', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0' },
          components: 'invalid',
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_COMPONENTS')).toBe(true);
      });

      it('should return error for non-object schemas', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0' },
          components: { schemas: 'invalid' },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_SCHEMAS')).toBe(true);
      });

      it('should return error for non-object schema', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0' },
          components: { schemas: { User: 'invalid' } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'INVALID_SCHEMA')).toBe(true);
      });

      it('should add warning for schema without type or $ref', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0', description: 'desc' },
          paths: { '/test': {} },
          components: { schemas: { Empty: {} } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.some((w) => w.code === 'SCHEMA_MISSING_TYPE')).toBe(true);
      });

      it('should not warn for schema with $ref', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0', description: 'desc' },
          paths: { '/test': {} },
          components: {
            schemas: { Ref: { $ref: '#/components/schemas/Other' } },
          },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.some((w) => w.code === 'SCHEMA_MISSING_TYPE')).toBe(false);
      });

      it('should not warn for schema with allOf', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0', description: 'desc' },
          paths: { '/test': {} },
          components: { schemas: { Composed: { allOf: [{ type: 'object' }] } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.some((w) => w.code === 'SCHEMA_MISSING_TYPE')).toBe(false);
      });

      it('should add warning for object schema without properties', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0', description: 'desc' },
          paths: { '/test': {} },
          components: { schemas: { EmptyObj: { type: 'object' } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.warnings.some((w) => w.code === 'OBJECT_SCHEMA_MISSING_PROPERTIES')).toBe(
          true,
        );
      });

      it('should return error for array schema without items', () => {
        const doc = {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0' },
          components: { schemas: { NoItems: { type: 'array' } } },
        };
        const result = validateOpenApiDocument(doc);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.code === 'ARRAY_SCHEMA_MISSING_ITEMS')).toBe(true);
      });
    });
  });
});
