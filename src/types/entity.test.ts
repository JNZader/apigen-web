import { describe, expect, it } from 'vitest';
import {
  createDefaultField,
  JAVA_TYPES,
  TYPE_COLORS,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  VALIDATION_TYPES,
} from './entity';

describe('entity type utilities', () => {
  describe('createDefaultField', () => {
    it('should create a field with default values', () => {
      const field = createDefaultField();

      expect(field.id).toBe('');
      expect(field.name).toBe('');
      expect(field.columnName).toBe('');
      expect(field.type).toBe('String');
      expect(field.nullable).toBe(true);
      expect(field.unique).toBe(false);
      expect(field.validations).toEqual([]);
    });

    it('should create a new field object each time', () => {
      const field1 = createDefaultField();
      const field2 = createDefaultField();

      expect(field1).not.toBe(field2);
      expect(field1.validations).not.toBe(field2.validations);
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('userName')).toBe('user_name');
      expect(toSnakeCase('firstName')).toBe('first_name');
      expect(toSnakeCase('myVariableName')).toBe('my_variable_name');
    });

    it('should convert PascalCase to snake_case', () => {
      expect(toSnakeCase('UserName')).toBe('user_name');
      expect(toSnakeCase('FirstName')).toBe('first_name');
      expect(toSnakeCase('MyClassName')).toBe('my_class_name');
    });

    it('should handle single word', () => {
      expect(toSnakeCase('user')).toBe('user');
      expect(toSnakeCase('User')).toBe('user');
    });

    it('should handle empty string', () => {
      expect(toSnakeCase('')).toBe('');
    });

    it('should handle consecutive uppercase letters', () => {
      expect(toSnakeCase('XMLParser')).toBe('x_m_l_parser');
      expect(toSnakeCase('HTMLElement')).toBe('h_t_m_l_element');
    });
  });

  describe('toPascalCase', () => {
    it('should convert snake_case to PascalCase', () => {
      expect(toPascalCase('user_name')).toBe('UserName');
      expect(toPascalCase('first_name')).toBe('FirstName');
      expect(toPascalCase('my_variable_name')).toBe('MyVariableName');
    });

    it('should convert kebab-case to PascalCase', () => {
      expect(toPascalCase('user-name')).toBe('UserName');
      expect(toPascalCase('first-name')).toBe('FirstName');
    });

    it('should convert space-separated to PascalCase', () => {
      expect(toPascalCase('user name')).toBe('UserName');
      expect(toPascalCase('first name')).toBe('FirstName');
    });

    it('should handle single word', () => {
      expect(toPascalCase('user')).toBe('User');
      expect(toPascalCase('USER')).toBe('User');
    });

    it('should handle empty string', () => {
      expect(toPascalCase('')).toBe('');
    });

    it('should handle mixed case input', () => {
      expect(toPascalCase('HELLO_WORLD')).toBe('HelloWorld');
    });
  });

  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('user_name')).toBe('userName');
      expect(toCamelCase('first_name')).toBe('firstName');
      expect(toCamelCase('my_variable_name')).toBe('myVariableName');
    });

    it('should convert kebab-case to camelCase', () => {
      expect(toCamelCase('user-name')).toBe('userName');
      expect(toCamelCase('first-name')).toBe('firstName');
    });

    it('should convert space-separated to camelCase', () => {
      expect(toCamelCase('user name')).toBe('userName');
      expect(toCamelCase('first name')).toBe('firstName');
    });

    it('should handle single word', () => {
      expect(toCamelCase('user')).toBe('user');
      expect(toCamelCase('USER')).toBe('user');
    });

    it('should handle empty string', () => {
      expect(toCamelCase('')).toBe('');
    });
  });

  describe('JAVA_TYPES constant', () => {
    it('should have all expected Java types', () => {
      const typeValues = JAVA_TYPES.map((t) => t.value);

      expect(typeValues).toContain('String');
      expect(typeValues).toContain('Long');
      expect(typeValues).toContain('Integer');
      expect(typeValues).toContain('Double');
      expect(typeValues).toContain('Boolean');
      expect(typeValues).toContain('LocalDate');
      expect(typeValues).toContain('LocalDateTime');
      expect(typeValues).toContain('UUID');
    });

    it('should have SQL types for each Java type', () => {
      for (const javaType of JAVA_TYPES) {
        expect(javaType.sqlType).toBeDefined();
        expect(javaType.sqlType.length).toBeGreaterThan(0);
      }
    });

    it('should have labels for each type', () => {
      for (const javaType of JAVA_TYPES) {
        expect(javaType.label).toBeDefined();
        expect(javaType.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('TYPE_COLORS constant', () => {
    it('should have colors for all Java types', () => {
      expect(TYPE_COLORS.String).toBe('blue');
      expect(TYPE_COLORS.Long).toBe('grape');
      expect(TYPE_COLORS.Integer).toBe('violet');
      expect(TYPE_COLORS.Boolean).toBe('green');
      expect(TYPE_COLORS.LocalDate).toBe('orange');
      expect(TYPE_COLORS.UUID).toBe('pink');
    });
  });

  describe('VALIDATION_TYPES constant', () => {
    it('should have all expected validation types', () => {
      const validationValues = VALIDATION_TYPES.map((v) => v.value);

      expect(validationValues).toContain('NotNull');
      expect(validationValues).toContain('NotBlank');
      expect(validationValues).toContain('Email');
      expect(validationValues).toContain('Size');
      expect(validationValues).toContain('Min');
      expect(validationValues).toContain('Max');
      expect(validationValues).toContain('Pattern');
    });

    it('should have correct hasValue flag', () => {
      const notNull = VALIDATION_TYPES.find((v) => v.value === 'NotNull');
      const size = VALIDATION_TYPES.find((v) => v.value === 'Size');
      const min = VALIDATION_TYPES.find((v) => v.value === 'Min');

      expect(notNull?.hasValue).toBe(false);
      expect(size?.hasValue).toBe(true);
      expect(min?.hasValue).toBe(true);
    });

    it('should have correct valueType for numeric validations', () => {
      const min = VALIDATION_TYPES.find((v) => v.value === 'Min');
      const max = VALIDATION_TYPES.find((v) => v.value === 'Max');

      expect(min?.valueType).toBe('number');
      expect(max?.valueType).toBe('number');
    });

    it('should have correct valueType for string validations', () => {
      const size = VALIDATION_TYPES.find((v) => v.value === 'Size');
      const pattern = VALIDATION_TYPES.find((v) => v.value === 'Pattern');

      expect(size?.valueType).toBe('string');
      expect(pattern?.valueType).toBe('string');
    });
  });
});
