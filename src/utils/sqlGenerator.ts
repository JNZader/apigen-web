import type { EntityDesign, FieldDesign, JavaType } from '../types';
import { toSnakeCase } from '../types';
import type { RelationDesign } from '../types/relation';

// Map Java types to PostgreSQL types
const JAVA_TO_SQL: Record<JavaType, string> = {
  String: 'VARCHAR(255)',
  Long: 'BIGINT',
  Integer: 'INTEGER',
  Double: 'DOUBLE PRECISION',
  Float: 'REAL',
  BigDecimal: 'DECIMAL(19,2)',
  Boolean: 'BOOLEAN',
  LocalDate: 'DATE',
  LocalDateTime: 'TIMESTAMP',
  LocalTime: 'TIME',
  Instant: 'TIMESTAMP WITH TIME ZONE',
  UUID: 'UUID',
  'byte[]': 'BYTEA',
};

// Get SQL type from Java type, adjusting for Size validation
function getSqlType(field: FieldDesign): string {
  const baseType = JAVA_TO_SQL[field.type] || 'VARCHAR(255)';

  // Check for Size validation to adjust VARCHAR length
  const sizeValidation = field.validations.find((v) => v.type === 'Size');
  if (sizeValidation && field.type === 'String' && sizeValidation.value) {
    const sizeRegex = /max\s*=\s*(\d+)/;
    const match = sizeRegex.exec(String(sizeValidation.value));
    if (match) {
      return `VARCHAR(${match[1]})`;
    }
  }

  return baseType;
}

// Generate column definition
function generateColumn(field: FieldDesign): string {
  const columnName = field.columnName || toSnakeCase(field.name);
  const sqlType = getSqlType(field);

  // Build parts array using filter to handle optional parts
  const parts = [
    columnName,
    sqlType,
    field.nullable ? null : 'NOT NULL',
    field.unique ? 'UNIQUE' : null,
    field.defaultValue ? `DEFAULT ${field.defaultValue}` : null,
  ].filter((part): part is string => part !== null);

  return `    ${parts.join(' ')}`;
}

// Generate foreign key column definition
function generateForeignKeyColumn(relation: RelationDesign, targetEntity: EntityDesign): string {
  const fkColumn = relation.foreignKey.columnName || `${toSnakeCase(targetEntity.name)}_id`;
  const nullable = relation.foreignKey.nullable ? '' : ' NOT NULL';
  return `    ${fkColumn} BIGINT${nullable}`;
}

// Generate foreign key constraint statement
function generateForeignKeyConstraint(
  tableName: string,
  relation: RelationDesign,
  targetEntity: EntityDesign,
): string {
  const fkColumn = relation.foreignKey.columnName || `${toSnakeCase(targetEntity.name)}_id`;
  const targetTable = targetEntity.tableName || `${toSnakeCase(targetEntity.name)}s`;
  const onDelete = (relation.foreignKey.onDelete || 'NO ACTION').replace('_', ' ');
  const onUpdate = (relation.foreignKey.onUpdate || 'NO ACTION').replace('_', ' ');

  return [
    '',
    `ALTER TABLE ${tableName}`,
    `    ADD CONSTRAINT fk_${tableName}_${fkColumn}`,
    `    FOREIGN KEY (${fkColumn})`,
    `    REFERENCES ${targetTable}(id)`,
    `    ON DELETE ${onDelete}`,
    `    ON UPDATE ${onUpdate};`,
  ].join('\n');
}

// Generate index statement for foreign key
function generateForeignKeyIndex(
  tableName: string,
  relation: RelationDesign,
  targetEntity: EntityDesign,
): string {
  const fkColumn = relation.foreignKey.columnName || `${toSnakeCase(targetEntity.name)}_id`;
  return `\nCREATE INDEX idx_${tableName}_${fkColumn} ON ${tableName}(${fkColumn});`;
}

// Generate CREATE TABLE statement for an entity
function generateCreateTable(
  entity: EntityDesign,
  relations: RelationDesign[],
  entities: EntityDesign[],
): string {
  const tableName = entity.tableName || `${toSnakeCase(entity.name)}s`;

  // Build header lines
  const headerLines = [
    `-- Entity: ${entity.name}`,
    entity.description ? `-- ${entity.description}` : null,
    `CREATE TABLE ${tableName} (`,
  ].filter((line): line is string => line !== null);

  // Foreign keys from ManyToOne and OneToOne relations
  const incomingRelations = relations.filter(
    (r) => r.sourceEntityId === entity.id && (r.type === 'ManyToOne' || r.type === 'OneToOne'),
  );

  // Build columns array
  const entityFieldColumns = entity.fields.map((field) => generateColumn(field));

  const fkColumns = incomingRelations
    .map((relation) => {
      const targetEntity = entities.find((e) => e.id === relation.targetEntityId);
      return targetEntity ? generateForeignKeyColumn(relation, targetEntity) : null;
    })
    .filter((col): col is string => col !== null);

  // Base entity fields (auditing)
  const baseFields = [
    "    estado VARCHAR(20) DEFAULT 'ACTIVO'",
    '    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    '    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    '    creado_por VARCHAR(100)',
    '    modificado_por VARCHAR(100)',
    '    version BIGINT DEFAULT 0',
  ];

  const allColumns = [
    '    id BIGSERIAL PRIMARY KEY',
    ...entityFieldColumns,
    ...fkColumns,
    ...baseFields,
  ];

  // Build constraint lines
  const constraintLines = incomingRelations
    .map((relation) => {
      const targetEntity = entities.find((e) => e.id === relation.targetEntityId);
      return targetEntity ? generateForeignKeyConstraint(tableName, relation, targetEntity) : null;
    })
    .filter((line): line is string => line !== null);

  // Build index lines
  const indexLines = incomingRelations
    .map((relation) => {
      const targetEntity = entities.find((e) => e.id === relation.targetEntityId);
      return targetEntity ? generateForeignKeyIndex(tableName, relation, targetEntity) : null;
    })
    .filter((line): line is string => line !== null);

  // Combine all lines
  const lines = [...headerLines, allColumns.join(',\n'), ');', ...constraintLines, ...indexLines];

  return lines.join('\n');
}

// Generate join table for ManyToMany relations
function generateJoinTable(relation: RelationDesign, entities: EntityDesign[]): string | null {
  if (relation.type !== 'ManyToMany' || !relation.joinTable) {
    return null;
  }

  const sourceEntity = entities.find((e) => e.id === relation.sourceEntityId);
  const targetEntity = entities.find((e) => e.id === relation.targetEntityId);

  if (!sourceEntity || !targetEntity) {
    return null;
  }

  const joinTableName = relation.joinTable.name;
  const sourceTable = sourceEntity.tableName || `${toSnakeCase(sourceEntity.name)}s`;
  const targetTable = targetEntity.tableName || `${toSnakeCase(targetEntity.name)}s`;

  const joinCol = relation.joinTable.joinColumn;
  const inverseCol = relation.joinTable.inverseJoinColumn;

  const lines: string[] = [
    `-- Join table: ${sourceEntity.name} <-> ${targetEntity.name}`,
    `CREATE TABLE ${joinTableName} (`,
    `    ${joinCol} BIGINT NOT NULL,`,
    `    ${inverseCol} BIGINT NOT NULL,`,
    `    PRIMARY KEY (${joinCol}, ${inverseCol})`,
    ');',
    '',
    `ALTER TABLE ${joinTableName}`,
    `    ADD CONSTRAINT fk_${joinTableName}_${joinCol}`,
    `    FOREIGN KEY (${joinCol})`,
    `    REFERENCES ${sourceTable}(id)`,
    '    ON DELETE CASCADE;',
    '',
    `ALTER TABLE ${joinTableName}`,
    `    ADD CONSTRAINT fk_${joinTableName}_${inverseCol}`,
    `    FOREIGN KEY (${inverseCol})`,
    `    REFERENCES ${targetTable}(id)`,
    '    ON DELETE CASCADE;',
    '',
    `CREATE INDEX idx_${joinTableName}_${joinCol} ON ${joinTableName}(${joinCol});`,
    `CREATE INDEX idx_${joinTableName}_${inverseCol} ON ${joinTableName}(${inverseCol});`,
  ];

  return lines.join('\n');
}

// Check if entity has foreign key relations
function hasForeignKeyRelation(entityId: string, relations: RelationDesign[]): boolean {
  return relations.some(
    (r) => r.sourceEntityId === entityId && (r.type === 'ManyToOne' || r.type === 'OneToOne'),
  );
}

// Main export function
export function generateSQL(
  entities: EntityDesign[],
  relations: RelationDesign[],
  projectName = 'API Project',
): string {
  // Header
  const header = [
    '-- ===========================================',
    '-- Generated by APiGen Studio',
    `-- Project: ${projectName}`,
    `-- Date: ${new Date().toISOString()}`,
    '-- ===========================================',
    '',
  ];

  // Sort entities to handle dependencies (entities without FK first)
  const sortedEntities = [...entities].sort((a, b) => {
    const aHasFK = hasForeignKeyRelation(a.id, relations);
    const bHasFK = hasForeignKeyRelation(b.id, relations);
    if (aHasFK && !bHasFK) return 1;
    if (!aHasFK && bHasFK) return -1;
    return 0;
  });

  // Generate table sections using flatMap
  const tableSections = sortedEntities.flatMap((entity) => [
    generateCreateTable(entity, relations, entities),
    '',
  ]);

  // Generate join tables for ManyToMany using flatMap
  const manyToManyRelations = relations.filter((r) => r.type === 'ManyToMany');
  const joinTableSections = manyToManyRelations.flatMap((relation) => {
    const joinTable = generateJoinTable(relation, entities);
    return joinTable ? [joinTable, ''] : [];
  });

  // Combine all sections
  const sections = [...header, ...tableSections, ...joinTableSections];

  return sections.join('\n');
}
