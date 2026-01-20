import { nanoid } from 'nanoid';
import type { EntityDesign, FieldDesign, JavaType, ValidationRule } from '../types';
import { toPascalCase } from '../types';
import type { FKAction, RelationDesign } from '../types/relation';

// ============================================================================
// Type Mappings
// ============================================================================

const SQL_TO_JAVA: Record<string, JavaType> = {
  // String types
  VARCHAR: 'String',
  CHAR: 'String',
  TEXT: 'String',
  'CHARACTER VARYING': 'String',
  CHARACTER: 'String',
  // Numeric types
  BIGINT: 'Long',
  BIGSERIAL: 'Long',
  INT: 'Integer',
  INTEGER: 'Integer',
  SERIAL: 'Integer',
  SMALLINT: 'Integer',
  SMALLSERIAL: 'Integer',
  'DOUBLE PRECISION': 'Double',
  DOUBLE: 'Double',
  REAL: 'Float',
  FLOAT: 'Float',
  NUMERIC: 'BigDecimal',
  DECIMAL: 'BigDecimal',
  MONEY: 'BigDecimal',
  // Boolean
  BOOLEAN: 'Boolean',
  BOOL: 'Boolean',
  // Date/Time
  DATE: 'LocalDate',
  TIMESTAMP: 'LocalDateTime',
  'TIMESTAMP WITHOUT TIME ZONE': 'LocalDateTime',
  'TIMESTAMP WITH TIME ZONE': 'Instant',
  TIMESTAMPTZ: 'Instant',
  TIME: 'LocalTime',
  'TIME WITHOUT TIME ZONE': 'LocalTime',
  // Other
  UUID: 'UUID',
  BYTEA: 'byte[]',
  BLOB: 'byte[]',
};

// Base fields to skip (inherited from Base entity)
const BASE_FIELDS = new Set([
  'id',
  'estado',
  'fecha_creacion',
  'fecha_actualizacion',
  'creado_por',
  'modificado_por',
  'version',
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
  'deleted_at',
  'is_deleted',
]);

// ============================================================================
// Interfaces
// ============================================================================

interface ParsedColumn {
  name: string;
  type: string;
  nullable: boolean;
  unique: boolean;
  primaryKey: boolean;
  defaultValue?: string;
  length?: number;
  references?: {
    table: string;
    column: string;
    onDelete?: string;
    onUpdate?: string;
  };
}

interface ParsedForeignKey {
  columns: string[];
  refTable: string;
  refColumns: string[];
  onDelete?: string;
  onUpdate?: string;
}

interface ParsedTable {
  name: string;
  columns: ParsedColumn[];
  primaryKey?: string[];
  foreignKeys: ParsedForeignKey[];
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseSqlType(sqlType: string): { baseType: string; length?: number } {
  // Extract length/precision if present: e.g., VARCHAR(255) or DECIMAL(10,2)
  const parenIndex = sqlType.indexOf('(');
  if (parenIndex !== -1) {
    const baseType = sqlType.slice(0, parenIndex).trim().toUpperCase();
    const lengthPart = sqlType.slice(parenIndex + 1, sqlType.indexOf(')'));
    const length = Number.parseInt(lengthPart.split(',')[0].trim(), 10);
    return {
      baseType,
      length: Number.isNaN(length) ? undefined : length,
    };
  }
  return { baseType: sqlType.trim().toUpperCase() };
}

function sqlTypeToJava(sqlType: string): JavaType {
  const { baseType } = parseSqlType(sqlType);

  // Try exact match first
  const exactMatch = SQL_TO_JAVA[baseType];
  if (exactMatch) return exactMatch;

  // Try partial matches
  for (const [key, value] of Object.entries(SQL_TO_JAVA)) {
    if (baseType.includes(key)) return value;
  }

  return 'String';
}

function splitColumnDefinitions(text: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of text) {
    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function toCamelCase(str: string): string {
  return str.toLowerCase().replaceAll(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function tableToEntityName(tableName: string): string {
  let name = tableName;
  if (name.endsWith('s') && !name.endsWith('ss')) {
    name = name.slice(0, -1);
  }
  return toPascalCase(name);
}

function normalizeAction(action: string | undefined): string | undefined {
  return action?.replaceAll(/\s+/g, '_').toUpperCase();
}

// Helper to extract ON DELETE action from a string
function extractOnDelete(text: string): string | undefined {
  const regex = /\bON\s+DELETE\s+(CASCADE|SET\s+NULL|RESTRICT|NO\s+ACTION)/i;
  const match = regex.exec(text);
  return match ? normalizeAction(match[1]) : undefined;
}

// Helper to extract ON UPDATE action from a string
function extractOnUpdate(text: string): string | undefined {
  const regex = /\bON\s+UPDATE\s+(CASCADE|SET\s+NULL|RESTRICT|NO\s+ACTION)/i;
  const match = regex.exec(text);
  return match ? normalizeAction(match[1]) : undefined;
}

// ============================================================================
// Column Definition Parser
// ============================================================================

function parseColumnDefinition(def: string): ParsedColumn | null {
  const columnRegex = /^["'`]?(\w+)["'`]?\s+([A-Z][A-Z0-9\s]*(?:\([^)]+\))?)/i;
  const match = columnRegex.exec(def);
  if (!match) return null;

  const column: ParsedColumn = {
    name: match[1],
    type: match[2].trim(),
    nullable: true,
    unique: false,
    primaryKey: false,
  };

  const rest = def.substring(match[0].length).toUpperCase();

  // Check constraints
  if (/\bNOT\s+NULL\b/i.test(rest)) column.nullable = false;
  if (/\bUNIQUE\b/i.test(rest)) column.unique = true;
  if (/\bPRIMARY\s+KEY\b/i.test(rest)) {
    column.primaryKey = true;
    column.nullable = false;
  }

  // Check for DEFAULT
  const defaultRegex = /\bDEFAULT\s+([^\s,]+|'[^']*')/i;
  const defaultMatch = defaultRegex.exec(def);
  if (defaultMatch) column.defaultValue = defaultMatch[1];

  // Check for inline REFERENCES (simplified regex, FK actions extracted separately)
  const refRegex = /\bREFERENCES\s+["'`]?(\w+)["'`]?\s*\(([^)]+)\)/i;
  const refMatch = refRegex.exec(def);
  if (refMatch) {
    column.references = {
      table: refMatch[1],
      column: refMatch[2].trim().replaceAll(/["'`]/g, ''),
      onDelete: extractOnDelete(def),
      onUpdate: extractOnUpdate(def),
    };
  }

  return column;
}

// ============================================================================
// Table Constraint Parsers
// ============================================================================

function parsePrimaryKeyConstraint(trimmed: string): string[] | null {
  const pkRegex = /PRIMARY\s+KEY\s*\(([^)]+)\)/i;
  const pkMatch = pkRegex.exec(trimmed);
  if (pkMatch) {
    return pkMatch[1].split(',').map((c) => c.trim().replaceAll(/["'`]/g, ''));
  }
  return null;
}

function parseForeignKeyConstraint(trimmed: string): ParsedForeignKey | null {
  // Simplified regex - FK actions extracted separately
  const fkRegex = /FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+["'`]?(\w+)["'`]?\s*\(([^)]+)\)/i;
  const fkMatch = fkRegex.exec(trimmed);
  if (fkMatch) {
    return {
      columns: fkMatch[1].split(',').map((c) => c.trim().replaceAll(/["'`]/g, '')),
      refTable: fkMatch[2],
      refColumns: fkMatch[3].split(',').map((c) => c.trim().replaceAll(/["'`]/g, '')),
      onDelete: extractOnDelete(trimmed),
      onUpdate: extractOnUpdate(trimmed),
    };
  }
  return null;
}

// ============================================================================
// CREATE TABLE Parser
// ============================================================================

// Helper to check if a definition is a PRIMARY KEY constraint
function isPrimaryKeyConstraint(def: string): boolean {
  return /^PRIMARY\s+KEY/i.test(def);
}

// Helper to check if a definition is a FOREIGN KEY constraint
function isForeignKeyConstraint(def: string): boolean {
  return /^(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY/i.test(def);
}

// Helper to check if a definition is a UNIQUE or CHECK constraint (to skip)
function isSkippableConstraint(def: string): boolean {
  return /^(?:CONSTRAINT\s+\w+\s+)?(?:UNIQUE|CHECK)/i.test(def);
}

// Process a single table definition part and update the table
function processTablePart(trimmed: string, table: ParsedTable): void {
  if (isPrimaryKeyConstraint(trimmed)) {
    const pk = parsePrimaryKeyConstraint(trimmed);
    if (pk) table.primaryKey = pk;
    return;
  }

  if (isForeignKeyConstraint(trimmed)) {
    const fk = parseForeignKeyConstraint(trimmed);
    if (fk) table.foreignKeys.push(fk);
    return;
  }

  if (isSkippableConstraint(trimmed)) return;

  const column = parseColumnDefinition(trimmed);
  if (column) table.columns.push(column);
}

function parseCreateTable(sql: string): ParsedTable | null {
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`]?(\w+)["'`]?\s*\(([\s\S]+)\)/i;
  const tableMatch = tableRegex.exec(sql);
  if (!tableMatch) return null;

  const table: ParsedTable = {
    name: tableMatch[1],
    columns: [],
    foreignKeys: [],
  };

  const parts = splitColumnDefinitions(tableMatch[2]);

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) {
      processTablePart(trimmed, table);
    }
  }

  return table;
}

// ============================================================================
// ALTER TABLE Parser
// ============================================================================

// Helper to extract table name from ALTER TABLE statement
function extractAlterTableName(sql: string): string | null {
  const regex = /ALTER\s+TABLE\s+(?:ONLY\s+)?["'`]?(\w+)["'`]?/i;
  const match = regex.exec(sql);
  return match ? match[1] : null;
}

// Helper to extract FOREIGN KEY columns
function extractForeignKeyColumns(sql: string): string[] | null {
  const regex = /FOREIGN\s+KEY\s*\(([^)]+)\)/i;
  const match = regex.exec(sql);
  if (!match) return null;
  return match[1].split(',').map((c) => c.trim().replaceAll(/["'`]/g, ''));
}

// Helper to extract REFERENCES table and columns
function extractReferencesInfo(sql: string): { table: string; columns: string[] } | null {
  const regex = /REFERENCES\s+["'`]?(\w+)["'`]?\s*\(([^)]+)\)/i;
  const match = regex.exec(sql);
  if (!match) return null;
  return {
    table: match[1],
    columns: match[2].split(',').map((c) => c.trim().replaceAll(/["'`]/g, '')),
  };
}

function parseAlterTable(sql: string, tables: Map<string, ParsedTable>): void {
  // Extract each component separately to keep regex complexity low
  const tableName = extractAlterTableName(sql);
  if (!tableName) return;

  const table = tables.get(tableName.toLowerCase());
  if (!table) return;

  const fkColumns = extractForeignKeyColumns(sql);
  if (!fkColumns) return;

  const refInfo = extractReferencesInfo(sql);
  if (!refInfo) return;

  table.foreignKeys.push({
    columns: fkColumns,
    refTable: refInfo.table,
    refColumns: refInfo.columns,
    onDelete: extractOnDelete(sql),
    onUpdate: extractOnUpdate(sql),
  });
}

// ============================================================================
// Junction Table Detection
// ============================================================================

function identifyJunctionTables(tables: Map<string, ParsedTable>): Set<string> {
  const junctionTables = new Set<string>();

  for (const [name, table] of tables) {
    const fkColumns = collectForeignKeyColumns(table);
    const nonPkColumns = table.columns.filter(
      (c) => !c.primaryKey && c.name.toLowerCase() !== 'id',
    );

    if (fkColumns.size >= 2 && nonPkColumns.length <= fkColumns.size) {
      junctionTables.add(name);
    }
  }

  return junctionTables;
}

function collectForeignKeyColumns(table: ParsedTable): Set<string> {
  const fkColumns = new Set<string>();

  for (const fk of table.foreignKeys) {
    for (const c of fk.columns) {
      fkColumns.add(c.toLowerCase());
    }
  }

  for (const col of table.columns) {
    if (col.references) {
      fkColumns.add(col.name.toLowerCase());
    }
  }

  return fkColumns;
}

// ============================================================================
// Field Generation
// ============================================================================

function createFieldFromColumn(column: ParsedColumn): FieldDesign {
  const { length } = parseSqlType(column.type);
  const javaType = sqlTypeToJava(column.type);
  const validations: ValidationRule[] = [];

  // Add NotNull/NotBlank validation
  if (!column.nullable) {
    validations.push({ type: javaType === 'String' ? 'NotBlank' : 'NotNull' });
  }

  // Add Size validation for VARCHAR with non-default length
  if (javaType === 'String' && length && length !== 255) {
    validations.push({ type: 'Size', value: `max = ${length}` });
  }

  return {
    id: nanoid(),
    name: toCamelCase(column.name),
    columnName: column.name,
    type: javaType,
    nullable: column.nullable,
    unique: column.unique,
    validations,
    defaultValue: column.defaultValue,
  };
}

function shouldSkipColumn(column: ParsedColumn, table: ParsedTable): boolean {
  // Skip base fields and primary key
  if (BASE_FIELDS.has(column.name.toLowerCase()) || column.primaryKey) {
    return true;
  }

  // Skip foreign key columns
  const isForeignKey =
    table.foreignKeys.some((fk) => fk.columns.includes(column.name)) || column.references;

  return Boolean(isForeignKey);
}

// ============================================================================
// Entity Generation
// ============================================================================

function createEntityFromTable(
  table: ParsedTable,
  position: { x: number; y: number },
): EntityDesign {
  const fields: FieldDesign[] = [];

  for (const column of table.columns) {
    if (!shouldSkipColumn(column, table)) {
      fields.push(createFieldFromColumn(column));
    }
  }

  return {
    id: nanoid(),
    name: tableToEntityName(table.name),
    tableName: table.name,
    position,
    fields,
    config: {
      generateController: true,
      generateService: true,
      enableCaching: true,
    },
  };
}

function convertTablesToEntities(
  tables: Map<string, ParsedTable>,
  junctionTables: Set<string>,
): { entities: EntityDesign[]; entityIdMap: Map<string, string> } {
  const entities: EntityDesign[] = [];
  const entityIdMap = new Map<string, string>();

  let posX = 100;
  let posY = 100;

  for (const [tableName, table] of tables) {
    if (junctionTables.has(tableName)) continue;

    const entity = createEntityFromTable(table, { x: posX, y: posY });
    entityIdMap.set(tableName, entity.id);
    entities.push(entity);

    // Update position for next entity
    posX += 300;
    if (posX > 900) {
      posX = 100;
      posY += 250;
    }
  }

  return { entities, entityIdMap };
}

// ============================================================================
// Relation Generation
// ============================================================================

function createManyToOneRelation(
  sourceEntityId: string,
  targetEntityId: string,
  targetEntityName: string,
  fk: ParsedForeignKey,
): RelationDesign {
  return {
    id: nanoid(),
    type: 'ManyToOne',
    sourceEntityId,
    sourceFieldName: toCamelCase(targetEntityName),
    targetEntityId,
    bidirectional: false,
    fetchType: 'LAZY',
    cascade: [],
    foreignKey: {
      columnName: fk.columns[0],
      nullable: true,
      onDelete: (fk.onDelete as FKAction) || 'NO_ACTION',
      onUpdate: (fk.onUpdate as FKAction) || 'NO_ACTION',
    },
  };
}

function createRelationFromInlineReference(
  sourceEntityId: string,
  targetEntityId: string,
  targetEntityName: string,
  column: ParsedColumn,
): RelationDesign {
  return {
    id: nanoid(),
    type: 'ManyToOne',
    sourceEntityId,
    sourceFieldName: toCamelCase(targetEntityName),
    targetEntityId,
    bidirectional: false,
    fetchType: 'LAZY',
    cascade: [],
    foreignKey: {
      columnName: column.name,
      nullable: column.nullable,
      onDelete: (column.references?.onDelete as FKAction) || 'NO_ACTION',
      onUpdate: (column.references?.onUpdate as FKAction) || 'NO_ACTION',
    },
  };
}

function processTableForeignKeys(
  table: ParsedTable,
  sourceEntityId: string,
  entities: EntityDesign[],
  entityIdMap: Map<string, string>,
  relations: RelationDesign[],
): void {
  for (const fk of table.foreignKeys) {
    const targetEntityId = entityIdMap.get(fk.refTable.toLowerCase());
    if (!targetEntityId) continue;

    const targetEntity = entities.find((e) => e.id === targetEntityId);
    if (!targetEntity) continue;

    relations.push(createManyToOneRelation(sourceEntityId, targetEntityId, targetEntity.name, fk));
  }
}

function processInlineReferences(
  table: ParsedTable,
  sourceEntityId: string,
  entities: EntityDesign[],
  entityIdMap: Map<string, string>,
  relations: RelationDesign[],
): void {
  for (const column of table.columns) {
    if (!column.references) continue;

    const targetEntityId = entityIdMap.get(column.references.table.toLowerCase());
    if (!targetEntityId) continue;

    const targetEntity = entities.find((e) => e.id === targetEntityId);
    if (!targetEntity) continue;

    // Check if relation already exists
    const exists = relations.some(
      (r) =>
        r.sourceEntityId === sourceEntityId &&
        r.targetEntityId === targetEntityId &&
        r.foreignKey.columnName === column.name,
    );

    if (!exists) {
      relations.push(
        createRelationFromInlineReference(
          sourceEntityId,
          targetEntityId,
          targetEntity.name,
          column,
        ),
      );
    }
  }
}

function convertForeignKeysToRelations(
  tables: Map<string, ParsedTable>,
  junctionTables: Set<string>,
  entities: EntityDesign[],
  entityIdMap: Map<string, string>,
): RelationDesign[] {
  const relations: RelationDesign[] = [];

  for (const [tableName, table] of tables) {
    if (junctionTables.has(tableName)) continue;

    const sourceEntityId = entityIdMap.get(tableName);
    if (!sourceEntityId) continue;

    processTableForeignKeys(table, sourceEntityId, entities, entityIdMap, relations);
    processInlineReferences(table, sourceEntityId, entities, entityIdMap, relations);
  }

  return relations;
}

// ============================================================================
// ManyToMany Relation Generation
// ============================================================================

function collectJunctionTableForeignKeys(table: ParsedTable): ParsedForeignKey[] {
  const fks = [...table.foreignKeys];

  for (const col of table.columns) {
    if (!col.references) continue;

    const exists = fks.some((fk) => fk.columns.includes(col.name));
    if (!exists) {
      fks.push({
        columns: [col.name],
        refTable: col.references.table,
        refColumns: [col.references.column],
      });
    }
  }

  return fks;
}

function processManyToManyRelations(
  junctionTables: Set<string>,
  tables: Map<string, ParsedTable>,
  entities: EntityDesign[],
  entityIdMap: Map<string, string>,
  relations: RelationDesign[],
): void {
  for (const junctionTableName of junctionTables) {
    const junctionTable = tables.get(junctionTableName);
    if (!junctionTable) continue;

    const fks = collectJunctionTableForeignKeys(junctionTable);
    if (fks.length < 2) continue;

    const sourceEntityId = entityIdMap.get(fks[0].refTable.toLowerCase());
    const targetEntityId = entityIdMap.get(fks[1].refTable.toLowerCase());

    if (!sourceEntityId || !targetEntityId) continue;

    const targetEntity = entities.find((e) => e.id === targetEntityId);

    relations.push({
      id: nanoid(),
      type: 'ManyToMany',
      sourceEntityId,
      sourceFieldName: `${toCamelCase(targetEntity?.name || '')}s`,
      targetEntityId,
      bidirectional: false,
      fetchType: 'LAZY',
      cascade: [],
      foreignKey: {
        columnName: fks[0].columns[0],
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      joinTable: {
        name: junctionTableName,
        joinColumn: fks[0].columns[0],
        inverseJoinColumn: fks[1].columns[0],
      },
    });
  }
}

// ============================================================================
// Comment Removal Helpers
// ============================================================================

// Remove block comments without using vulnerable regex with backtracking
// This avoids ReDoS (Regular Expression Denial of Service) attacks
function removeBlockComments(sql: string): string {
  let result = '';
  let i = 0;
  while (i < sql.length) {
    if (sql[i] === '/' && sql[i + 1] === '*') {
      // Find the end of the block comment
      const endIndex = sql.indexOf('*/', i + 2);
      if (endIndex === -1) {
        // Unclosed comment - skip to end
        break;
      }
      i = endIndex + 2;
    } else {
      result += sql[i];
      i++;
    }
  }
  return result;
}

// Remove SQL line comments (-- comment) without using vulnerable regex
// This avoids ReDoS by using simple string operations
function removeLineComments(sql: string): string {
  const lines = sql.split('\n');
  const cleanedLines = lines.map((line) => {
    const commentIndex = line.indexOf('--');
    if (commentIndex === -1) {
      return line;
    }
    return line.substring(0, commentIndex);
  });
  return cleanedLines.join('\n');
}

// ============================================================================
// Main Parse Function
// ============================================================================

export function parseSQL(sql: string): {
  entities: EntityDesign[];
  relations: RelationDesign[];
} {
  const tables = new Map<string, ParsedTable>();

  // Clean SQL: remove comments (using safe, non-backtracking approach)
  const cleanedSql = removeLineComments(removeBlockComments(sql));

  const statements = cleanedSql.split(';').filter((s) => s.trim());

  // First pass: parse CREATE TABLE statements
  for (const stmt of statements) {
    if (/CREATE\s+TABLE/i.test(stmt)) {
      const table = parseCreateTable(stmt);
      if (table) {
        tables.set(table.name.toLowerCase(), table);
      }
    }
  }

  // Second pass: parse ALTER TABLE for foreign keys
  for (const stmt of statements) {
    if (/ALTER\s+TABLE/i.test(stmt) && /FOREIGN\s+KEY/i.test(stmt)) {
      parseAlterTable(stmt, tables);
    }
  }

  // Identify junction tables
  const junctionTables = identifyJunctionTables(tables);

  // Convert tables to entities
  const { entities, entityIdMap } = convertTablesToEntities(tables, junctionTables);

  // Convert foreign keys to relations
  const relations = convertForeignKeysToRelations(tables, junctionTables, entities, entityIdMap);

  // Process junction tables for ManyToMany relations
  processManyToManyRelations(junctionTables, tables, entities, entityIdMap, relations);

  return { entities, relations };
}
