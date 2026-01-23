import { nanoid } from 'nanoid';
import type { EntityDesign, FieldDesign, JavaType, ValidationRule } from '../../types';

/**
 * Creates a mock field for testing purposes.
 */
export function createMockField(overrides: Partial<FieldDesign> = {}): FieldDesign {
  return {
    id: nanoid(),
    name: 'testField',
    columnName: 'test_field',
    type: 'String' as JavaType,
    nullable: true,
    unique: false,
    validations: [],
    ...overrides,
  };
}

/**
 * Creates a mock entity for testing purposes.
 */
export function createMockEntity(overrides: Partial<EntityDesign> = {}): EntityDesign {
  const id = overrides.id ?? nanoid();
  const name = overrides.name ?? 'TestEntity';

  return {
    id,
    name,
    tableName: `${name.toLowerCase()}s`,
    position: { x: 0, y: 0 },
    fields: [],
    config: {
      generateController: true,
      generateService: true,
      enableCaching: false,
    },
    ...overrides,
  };
}

/**
 * Creates multiple mock entities for testing purposes.
 */
export function createMockEntities(
  count: number,
  baseOverrides: Partial<EntityDesign> = {},
): EntityDesign[] {
  return Array.from({ length: count }, (_, i) =>
    createMockEntity({
      name: `Entity${i + 1}`,
      position: { x: (i % 4) * 320 + 50, y: Math.floor(i / 4) * 250 + 50 },
      ...baseOverrides,
    }),
  );
}

/**
 * Creates a mock entity with fields for testing purposes.
 */
export function createMockEntityWithFields(
  fieldCount: number,
  overrides: Partial<EntityDesign> = {},
): EntityDesign {
  const fields = Array.from({ length: fieldCount }, (_, i) =>
    createMockField({
      name: `field${i + 1}`,
      columnName: `field_${i + 1}`,
      type: i % 2 === 0 ? 'String' : 'Long',
    }),
  );

  return createMockEntity({
    fields,
    ...overrides,
  });
}

/**
 * Creates a mock validation rule for testing purposes.
 */
export function createMockValidation(overrides: Partial<ValidationRule> = {}): ValidationRule {
  return {
    type: 'NotNull',
    ...overrides,
  };
}
