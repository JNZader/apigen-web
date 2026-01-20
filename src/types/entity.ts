export type JavaType =
  | 'String'
  | 'Long'
  | 'Integer'
  | 'Double'
  | 'Float'
  | 'BigDecimal'
  | 'Boolean'
  | 'LocalDate'
  | 'LocalDateTime'
  | 'LocalTime'
  | 'Instant'
  | 'UUID'
  | 'byte[]';

// Color mapping for Java types (used in UI badges)
export const TYPE_COLORS: Record<JavaType, string> = {
  String: 'blue',
  Long: 'grape',
  Integer: 'violet',
  Double: 'cyan',
  Float: 'cyan',
  BigDecimal: 'teal',
  Boolean: 'green',
  LocalDate: 'orange',
  LocalDateTime: 'orange',
  LocalTime: 'orange',
  Instant: 'yellow',
  UUID: 'pink',
  'byte[]': 'gray',
};

export const JAVA_TYPES: { value: JavaType; label: string; sqlType: string }[] = [
  { value: 'String', label: 'String', sqlType: 'VARCHAR(255)' },
  { value: 'Long', label: 'Long', sqlType: 'BIGINT' },
  { value: 'Integer', label: 'Integer', sqlType: 'INTEGER' },
  { value: 'Double', label: 'Double', sqlType: 'DOUBLE PRECISION' },
  { value: 'Float', label: 'Float', sqlType: 'REAL' },
  { value: 'BigDecimal', label: 'BigDecimal', sqlType: 'DECIMAL(19,2)' },
  { value: 'Boolean', label: 'Boolean', sqlType: 'BOOLEAN' },
  { value: 'LocalDate', label: 'LocalDate', sqlType: 'DATE' },
  { value: 'LocalDateTime', label: 'LocalDateTime', sqlType: 'TIMESTAMP' },
  { value: 'LocalTime', label: 'LocalTime', sqlType: 'TIME' },
  { value: 'Instant', label: 'Instant', sqlType: 'TIMESTAMP WITH TIME ZONE' },
  { value: 'UUID', label: 'UUID', sqlType: 'UUID' },
  { value: 'byte[]', label: 'byte[] (Binary)', sqlType: 'BYTEA' },
];

export type ValidationType =
  | 'NotNull'
  | 'NotBlank'
  | 'NotEmpty'
  | 'Size'
  | 'Min'
  | 'Max'
  | 'DecimalMin'
  | 'DecimalMax'
  | 'Positive'
  | 'PositiveOrZero'
  | 'Negative'
  | 'NegativeOrZero'
  | 'Email'
  | 'Pattern'
  | 'Past'
  | 'PastOrPresent'
  | 'Future'
  | 'FutureOrPresent';

export interface ValidationRule {
  type: ValidationType;
  value?: string | number;
  message?: string;
}

export const VALIDATION_TYPES: {
  value: ValidationType;
  label: string;
  hasValue: boolean;
  valueType?: 'number' | 'string';
}[] = [
  { value: 'NotNull', label: 'Not Null', hasValue: false },
  { value: 'NotBlank', label: 'Not Blank', hasValue: false },
  { value: 'NotEmpty', label: 'Not Empty', hasValue: false },
  { value: 'Size', label: 'Size (min, max)', hasValue: true, valueType: 'string' },
  { value: 'Min', label: 'Min', hasValue: true, valueType: 'number' },
  { value: 'Max', label: 'Max', hasValue: true, valueType: 'number' },
  { value: 'Email', label: 'Email', hasValue: false },
  { value: 'Pattern', label: 'Pattern (Regex)', hasValue: true, valueType: 'string' },
  { value: 'Positive', label: 'Positive', hasValue: false },
  { value: 'PositiveOrZero', label: 'Positive or Zero', hasValue: false },
  { value: 'Negative', label: 'Negative', hasValue: false },
  { value: 'NegativeOrZero', label: 'Negative or Zero', hasValue: false },
  { value: 'Past', label: 'Past', hasValue: false },
  { value: 'PastOrPresent', label: 'Past or Present', hasValue: false },
  { value: 'Future', label: 'Future', hasValue: false },
  { value: 'FutureOrPresent', label: 'Future or Present', hasValue: false },
];

export interface FieldDesign {
  id: string;
  name: string;
  columnName: string;
  type: JavaType;
  nullable: boolean;
  unique: boolean;
  validations: ValidationRule[];
  defaultValue?: string;
  description?: string;
}

export interface EntityDesign {
  id: string;
  name: string;
  tableName: string;
  description?: string;
  position: { x: number; y: number };
  fields: FieldDesign[];
  config: {
    generateController: boolean;
    generateService: boolean;
    customEndpoint?: string;
    enableCaching: boolean;
  };
}

export function createDefaultField(): FieldDesign {
  return {
    id: '',
    name: '',
    columnName: '',
    type: 'String',
    nullable: true,
    unique: false,
    validations: [],
  };
}

export function toSnakeCase(str: string): string {
  return str
    .replaceAll(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

export function toPascalCase(str: string): string {
  return str
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
