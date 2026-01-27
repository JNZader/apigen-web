import type { JavaType, ValidationRule } from '../types';

// ============================================================================
// OpenAPI Type Mapping
// ============================================================================

interface OpenAPITypeMapping {
  type: string;
  format?: string;
  javaType: JavaType;
}

const TYPE_MAPPINGS: OpenAPITypeMapping[] = [
  // String types with formats
  { type: 'string', format: 'date', javaType: 'LocalDate' },
  { type: 'string', format: 'date-time', javaType: 'LocalDateTime' },
  { type: 'string', format: 'time', javaType: 'LocalTime' },
  { type: 'string', format: 'uuid', javaType: 'UUID' },
  { type: 'string', format: 'byte', javaType: 'byte[]' },
  { type: 'string', format: 'binary', javaType: 'byte[]' },
  { type: 'string', javaType: 'String' },

  // Integer types
  { type: 'integer', format: 'int32', javaType: 'Integer' },
  { type: 'integer', format: 'int64', javaType: 'Long' },
  { type: 'integer', javaType: 'Integer' },

  // Number types
  { type: 'number', format: 'float', javaType: 'Float' },
  { type: 'number', format: 'double', javaType: 'Double' },
  { type: 'number', javaType: 'BigDecimal' },

  // Boolean
  { type: 'boolean', javaType: 'Boolean' },
];

// ============================================================================
// Type Conversion Functions
// ============================================================================

/**
 * Converts OpenAPI type/format to Java type
 */
export function toJavaType(type: string, format?: string): JavaType {
  // Try exact match with format first
  if (format) {
    const exactMatch = TYPE_MAPPINGS.find(
      (m) => m.type === type && m.format === format,
    );
    if (exactMatch) return exactMatch.javaType;
  }

  // Fall back to type-only match
  const typeMatch = TYPE_MAPPINGS.find(
    (m) => m.type === type && !m.format,
  );

  return typeMatch?.javaType ?? 'String';
}

// ============================================================================
// Reference Detection
// ============================================================================

export interface OpenAPISchema {
  type?: string;
  format?: string;
  $ref?: string;
  items?: OpenAPISchema;
  properties?: Record<string, OpenAPISchema>;
  required?: string[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  pattern?: string;
  enum?: (string | number)[];
  nullable?: boolean;
  description?: string;
}

/**
 * Checks if a property is a $ref (relationship reference)
 */
export function isRefProperty(schema: OpenAPISchema): boolean {
  return Boolean(schema.$ref);
}

/**
 * Checks if a property is an array of $refs
 */
export function isArrayOfRefs(schema: OpenAPISchema): boolean {
  return schema.type === 'array' && Boolean(schema.items?.$ref);
}

/**
 * Extracts the schema name from a $ref path
 * @example '#/components/schemas/User' -> 'User'
 */
export function extractRefName(ref: string): string {
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

// ============================================================================
// Validation Extraction
// ============================================================================

/**
 * Extracts validation rules from OpenAPI schema constraints
 */
export function extractValidations(
  schema: OpenAPISchema,
  isRequired: boolean,
): ValidationRule[] {
  const validations: ValidationRule[] = [];
  const javaType = schema.type ? toJavaType(schema.type, schema.format) : 'String';

  // Not null/blank for required fields
  if (isRequired) {
    if (javaType === 'String') {
      validations.push({ type: 'NotBlank' });
    } else {
      validations.push({ type: 'NotNull' });
    }
  }

  // Size constraints for strings
  if (javaType === 'String') {
    if (schema.minLength !== undefined || schema.maxLength !== undefined) {
      const sizeParts: string[] = [];
      if (schema.minLength !== undefined) {
        sizeParts.push(`min = ${schema.minLength}`);
      }
      if (schema.maxLength !== undefined) {
        sizeParts.push(`max = ${schema.maxLength}`);
      }
      validations.push({ type: 'Size', value: sizeParts.join(', ') });
    }
  }

  // Numeric constraints
  if (['Integer', 'Long', 'Float', 'Double', 'BigDecimal'].includes(javaType)) {
    if (schema.minimum !== undefined) {
      validations.push({ type: 'Min', value: schema.minimum });
    }
    if (schema.maximum !== undefined) {
      validations.push({ type: 'Max', value: schema.maximum });
    }
    // Positive/Negative shortcuts
    if (schema.minimum === 0 && schema.exclusiveMinimum === undefined) {
      // Already covered by Min
    } else if (schema.exclusiveMinimum === 0) {
      validations.push({ type: 'Positive' });
    }
  }

  // Pattern constraint
  if (schema.pattern) {
    validations.push({ type: 'Pattern', value: schema.pattern });
  }

  // Email detection (common pattern)
  if (
    schema.format === 'email' ||
    (schema.pattern && schema.pattern.toLowerCase().includes('email'))
  ) {
    // Add Email validation if not already present via pattern
    if (!validations.some((v) => v.type === 'Pattern')) {
      validations.push({ type: 'Email' });
    }
  }

  return validations;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Determines if a schema name should be excluded from entity generation
 * (Request/Response DTOs, error types, etc.)
 */
export function isExcludedSchema(schemaName: string): boolean {
  const EXCLUDED_PATTERNS = [
    /Request$/i,
    /Response$/i,
    /DTO$/i,
    /Input$/i,
    /Output$/i,
    /Payload$/i,
    /^Error$/i,
    /^Pageable$/i,
    /^Page$/i,
    /^Sort$/i,
    /^Link$/i,
    /^Links$/i,
  ];

  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(schemaName));
}

/**
 * Checks if a property name looks like a foreign key
 */
export function isForeignKeyProperty(propertyName: string): boolean {
  return propertyName.endsWith('Id') || propertyName.endsWith('_id');
}
