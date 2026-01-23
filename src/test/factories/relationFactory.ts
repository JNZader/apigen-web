import { nanoid } from 'nanoid';
import type { ForeignKeyConfig, RelationDesign, RelationType } from '../../types';

/**
 * Creates a mock foreign key configuration for testing purposes.
 */
export function createMockForeignKeyConfig(
  overrides: Partial<ForeignKeyConfig> = {},
): ForeignKeyConfig {
  return {
    columnName: 'target_id',
    nullable: true,
    onDelete: 'NO_ACTION',
    onUpdate: 'NO_ACTION',
    ...overrides,
  };
}

/**
 * Creates a mock relation for testing purposes.
 */
export function createMockRelation(overrides: Partial<RelationDesign> = {}): RelationDesign {
  return {
    id: nanoid(),
    type: 'ManyToOne' as RelationType,
    sourceEntityId: 'source-entity-1',
    sourceFieldName: 'targetEntity',
    targetEntityId: 'target-entity-2',
    bidirectional: false,
    fetchType: 'LAZY',
    cascade: [],
    foreignKey: createMockForeignKeyConfig(),
    ...overrides,
  };
}

/**
 * Creates a mock bidirectional relation for testing purposes.
 */
export function createMockBidirectionalRelation(
  overrides: Partial<RelationDesign> = {},
): RelationDesign {
  return createMockRelation({
    bidirectional: true,
    targetFieldName: 'sourceEntities',
    mappedBy: 'targetEntity',
    ...overrides,
  });
}

/**
 * Creates a mock ManyToMany relation with join table for testing purposes.
 */
export function createMockManyToManyRelation(
  overrides: Partial<RelationDesign> = {},
): RelationDesign {
  return createMockRelation({
    type: 'ManyToMany',
    bidirectional: true,
    joinTable: {
      name: 'source_target',
      joinColumn: 'source_id',
      inverseJoinColumn: 'target_id',
    },
    ...overrides,
  });
}

/**
 * Creates multiple mock relations for testing purposes.
 */
export function createMockRelations(
  count: number,
  baseOverrides: Partial<RelationDesign> = {},
): RelationDesign[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRelation({
      sourceFieldName: `relation${i + 1}`,
      ...baseOverrides,
    }),
  );
}
