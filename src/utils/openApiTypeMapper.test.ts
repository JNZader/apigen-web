import { describe, expect, it } from 'vitest';
import {
  extractRefName,
  extractValidations,
  isArrayOfRefs,
  isExcludedSchema,
  isForeignKeyProperty,
  isRefProperty,
  type OpenAPISchema,
  toJavaType,
} from './openApiTypeMapper';

describe('openApiTypeMapper', () => {
  describe('toJavaType', () => {
    it('maps string without format to String', () => {
      expect(toJavaType('string')).toBe('String');
    });

    it('maps string with date format to LocalDate', () => {
      expect(toJavaType('string', 'date')).toBe('LocalDate');
    });

    it('maps string with date-time format to LocalDateTime', () => {
      expect(toJavaType('string', 'date-time')).toBe('LocalDateTime');
    });

    it('maps string with time format to LocalTime', () => {
      expect(toJavaType('string', 'time')).toBe('LocalTime');
    });

    it('maps string with uuid format to UUID', () => {
      expect(toJavaType('string', 'uuid')).toBe('UUID');
    });

    it('maps string with byte format to byte[]', () => {
      expect(toJavaType('string', 'byte')).toBe('byte[]');
    });

    it('maps string with binary format to byte[]', () => {
      expect(toJavaType('string', 'binary')).toBe('byte[]');
    });

    it('maps integer without format to Integer', () => {
      expect(toJavaType('integer')).toBe('Integer');
    });

    it('maps integer with int32 format to Integer', () => {
      expect(toJavaType('integer', 'int32')).toBe('Integer');
    });

    it('maps integer with int64 format to Long', () => {
      expect(toJavaType('integer', 'int64')).toBe('Long');
    });

    it('maps number without format to BigDecimal', () => {
      expect(toJavaType('number')).toBe('BigDecimal');
    });

    it('maps number with float format to Float', () => {
      expect(toJavaType('number', 'float')).toBe('Float');
    });

    it('maps number with double format to Double', () => {
      expect(toJavaType('number', 'double')).toBe('Double');
    });

    it('maps boolean to Boolean', () => {
      expect(toJavaType('boolean')).toBe('Boolean');
    });

    it('maps unknown type to String', () => {
      expect(toJavaType('object')).toBe('String');
      expect(toJavaType('unknown')).toBe('String');
    });
  });

  describe('isRefProperty', () => {
    it('returns true for $ref property', () => {
      const schema: OpenAPISchema = { $ref: '#/components/schemas/User' };
      expect(isRefProperty(schema)).toBe(true);
    });

    it('returns false for non-$ref property', () => {
      const schema: OpenAPISchema = { type: 'string' };
      expect(isRefProperty(schema)).toBe(false);
    });

    it('returns false for empty schema', () => {
      const schema: OpenAPISchema = {};
      expect(isRefProperty(schema)).toBe(false);
    });
  });

  describe('isArrayOfRefs', () => {
    it('returns true for array of $refs', () => {
      const schema: OpenAPISchema = {
        type: 'array',
        items: { $ref: '#/components/schemas/Post' },
      };
      expect(isArrayOfRefs(schema)).toBe(true);
    });

    it('returns false for array of primitives', () => {
      const schema: OpenAPISchema = {
        type: 'array',
        items: { type: 'string' },
      };
      expect(isArrayOfRefs(schema)).toBe(false);
    });

    it('returns false for non-array', () => {
      const schema: OpenAPISchema = { type: 'string' };
      expect(isArrayOfRefs(schema)).toBe(false);
    });
  });

  describe('extractRefName', () => {
    it('extracts name from standard $ref path', () => {
      expect(extractRefName('#/components/schemas/User')).toBe('User');
    });

    it('extracts name from definitions path (OpenAPI 2.x style)', () => {
      expect(extractRefName('#/definitions/Product')).toBe('Product');
    });

    it('handles simple ref', () => {
      expect(extractRefName('Entity')).toBe('Entity');
    });
  });

  describe('extractValidations', () => {
    it('adds NotBlank for required string', () => {
      const schema: OpenAPISchema = { type: 'string' };
      const validations = extractValidations(schema, true);
      expect(validations).toContainEqual({ type: 'NotBlank' });
    });

    it('adds NotNull for required non-string', () => {
      const schema: OpenAPISchema = { type: 'integer' };
      const validations = extractValidations(schema, true);
      expect(validations).toContainEqual({ type: 'NotNull' });
    });

    it('does not add NotNull/NotBlank for optional field', () => {
      const schema: OpenAPISchema = { type: 'string' };
      const validations = extractValidations(schema, false);
      expect(validations).not.toContainEqual({ type: 'NotBlank' });
      expect(validations).not.toContainEqual({ type: 'NotNull' });
    });

    it('extracts Size validation for string with minLength', () => {
      const schema: OpenAPISchema = { type: 'string', minLength: 5 };
      const validations = extractValidations(schema, false);
      expect(validations).toContainEqual({ type: 'Size', value: 'min = 5' });
    });

    it('extracts Size validation for string with maxLength', () => {
      const schema: OpenAPISchema = { type: 'string', maxLength: 100 };
      const validations = extractValidations(schema, false);
      expect(validations).toContainEqual({ type: 'Size', value: 'max = 100' });
    });

    it('extracts Size validation for string with both min and max', () => {
      const schema: OpenAPISchema = { type: 'string', minLength: 5, maxLength: 100 };
      const validations = extractValidations(schema, false);
      expect(validations).toContainEqual({
        type: 'Size',
        value: 'min = 5, max = 100',
      });
    });

    it('extracts Min validation for number with minimum', () => {
      const schema: OpenAPISchema = { type: 'integer', minimum: 0 };
      const validations = extractValidations(schema, false);
      expect(validations).toContainEqual({ type: 'Min', value: 0 });
    });

    it('extracts Max validation for number with maximum', () => {
      const schema: OpenAPISchema = { type: 'number', maximum: 1000 };
      const validations = extractValidations(schema, false);
      expect(validations).toContainEqual({ type: 'Max', value: 1000 });
    });

    it('extracts Positive for exclusiveMinimum of 0', () => {
      const schema: OpenAPISchema = { type: 'integer', exclusiveMinimum: 0 };
      const validations = extractValidations(schema, false);
      expect(validations).toContainEqual({ type: 'Positive' });
    });

    it('extracts Pattern validation', () => {
      const schema: OpenAPISchema = { type: 'string', pattern: '^[A-Z]+$' };
      const validations = extractValidations(schema, false);
      expect(validations).toContainEqual({ type: 'Pattern', value: '^[A-Z]+$' });
    });

    it('extracts Email validation for email format', () => {
      const schema: OpenAPISchema = { type: 'string', format: 'email' };
      const validations = extractValidations(schema, false);
      expect(validations).toContainEqual({ type: 'Email' });
    });
  });

  describe('isExcludedSchema', () => {
    it('excludes Request schemas', () => {
      expect(isExcludedSchema('UserRequest')).toBe(true);
      expect(isExcludedSchema('CreateUserRequest')).toBe(true);
    });

    it('excludes Response schemas', () => {
      expect(isExcludedSchema('UserResponse')).toBe(true);
      expect(isExcludedSchema('ListUsersResponse')).toBe(true);
    });

    it('excludes DTO schemas', () => {
      expect(isExcludedSchema('UserDTO')).toBe(true);
      expect(isExcludedSchema('ProductDto')).toBe(true);
    });

    it('excludes Input/Output schemas', () => {
      expect(isExcludedSchema('UserInput')).toBe(true);
      expect(isExcludedSchema('UserOutput')).toBe(true);
    });

    it('excludes Payload schemas', () => {
      expect(isExcludedSchema('LoginPayload')).toBe(true);
    });

    it('excludes Error schemas', () => {
      expect(isExcludedSchema('Error')).toBe(true);
    });

    it('excludes pagination schemas', () => {
      expect(isExcludedSchema('Pageable')).toBe(true);
      expect(isExcludedSchema('Page')).toBe(true);
      expect(isExcludedSchema('Sort')).toBe(true);
    });

    it('excludes Link schemas', () => {
      expect(isExcludedSchema('Link')).toBe(true);
      expect(isExcludedSchema('Links')).toBe(true);
    });

    it('does not exclude entity schemas', () => {
      expect(isExcludedSchema('User')).toBe(false);
      expect(isExcludedSchema('Product')).toBe(false);
      expect(isExcludedSchema('OrderItem')).toBe(false);
    });
  });

  describe('isForeignKeyProperty', () => {
    it('detects camelCase FK', () => {
      expect(isForeignKeyProperty('userId')).toBe(true);
      expect(isForeignKeyProperty('authorId')).toBe(true);
    });

    it('detects snake_case FK', () => {
      expect(isForeignKeyProperty('user_id')).toBe(true);
      expect(isForeignKeyProperty('author_id')).toBe(true);
    });

    it('does not match regular properties', () => {
      expect(isForeignKeyProperty('name')).toBe(false);
      expect(isForeignKeyProperty('email')).toBe(false);
      expect(isForeignKeyProperty('identity')).toBe(false);
    });
  });
});
