export type RelationType = 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';

export type CascadeType = 'ALL' | 'PERSIST' | 'MERGE' | 'REMOVE' | 'REFRESH' | 'DETACH';

export type FetchType = 'LAZY' | 'EAGER';

export type FKAction = 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';

export interface ForeignKeyConfig {
  columnName: string;
  nullable: boolean;
  onDelete: FKAction;
  onUpdate: FKAction;
}

export interface RelationDesign {
  id: string;
  type: RelationType;
  sourceEntityId: string;
  sourceFieldName: string;
  targetEntityId: string;
  targetFieldName?: string;
  foreignKey: ForeignKeyConfig;
  joinTable?: {
    name: string;
    joinColumn: string;
    inverseJoinColumn: string;
  };
  bidirectional: boolean;
  mappedBy?: string;
  fetchType: FetchType;
  cascade: CascadeType[];
}

export const RELATION_TYPES: { value: RelationType; label: string; description: string }[] = [
  {
    value: 'ManyToOne',
    label: 'Many to One (N:1)',
    description: 'Multiple entities reference one entity',
  },
  {
    value: 'OneToMany',
    label: 'One to Many (1:N)',
    description: 'One entity has multiple related entities',
  },
  {
    value: 'OneToOne',
    label: 'One to One (1:1)',
    description: 'Unique relationship between two entities',
  },
  {
    value: 'ManyToMany',
    label: 'Many to Many (N:N)',
    description: 'Multiple entities relate to multiple entities',
  },
];

export const CASCADE_TYPES: { value: CascadeType; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PERSIST', label: 'Persist' },
  { value: 'MERGE', label: 'Merge' },
  { value: 'REMOVE', label: 'Remove' },
  { value: 'REFRESH', label: 'Refresh' },
  { value: 'DETACH', label: 'Detach' },
];

export const FK_ACTIONS: { value: FKAction; label: string }[] = [
  { value: 'CASCADE', label: 'Cascade' },
  { value: 'SET_NULL', label: 'Set Null' },
  { value: 'RESTRICT', label: 'Restrict' },
  { value: 'NO_ACTION', label: 'No Action' },
];

export function createDefaultRelation(
  sourceEntityId: string,
  targetEntityId: string,
): RelationDesign {
  return {
    id: '',
    type: 'ManyToOne',
    sourceEntityId,
    sourceFieldName: '',
    targetEntityId,
    bidirectional: false,
    fetchType: 'LAZY',
    cascade: [],
    foreignKey: {
      columnName: '',
      nullable: true,
      onDelete: 'NO_ACTION',
      onUpdate: 'NO_ACTION',
    },
  };
}
