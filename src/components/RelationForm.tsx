import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowRight } from '@tabler/icons-react';
import { useProjectStore } from '../store/projectStore';
import { toCamelCase, toSnakeCase } from '../types';
import type { CascadeType, FetchType, RelationType } from '../types/relation';
import { CASCADE_TYPES, RELATION_TYPES } from '../types/relation';
import { notify } from '../utils/notifications';

interface RelationFormProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
}

interface FormValues {
  type: RelationType;
  bidirectional: boolean;
  fetchType: FetchType;
  cascade: CascadeType[];
  nullable: boolean;
}

// Helper functions to reduce template literal nesting
function buildFetchAnnotation(fetchType: FetchType): string {
  return `fetch = FetchType.${fetchType}`;
}

function buildCascadeAnnotation(cascade: CascadeType[]): string {
  if (cascade.length === 0) {
    return '';
  }
  const cascadeTypes = cascade.map((c) => `CascadeType.${c}`).join(', ');
  return `, cascade = {${cascadeTypes}}`;
}

// Join column nullable clause constants
const JOIN_COLUMN_NULLABLE = '';
const JOIN_COLUMN_REQUIRED = ', nullable = false';

// Separate methods instead of boolean parameter to improve readability
function getOptionalJoinColumnClause(): string {
  return JOIN_COLUMN_NULLABLE;
}

function getRequiredJoinColumnClause(): string {
  return JOIN_COLUMN_REQUIRED;
}

function buildManyToOnePreview(
  targetName: string,
  fieldName: string,
  fetchAnnotation: string,
  nullableClause: string,
): string {
  const joinColumnName = `${toSnakeCase(targetName)}_id`;
  return `@ManyToOne(${fetchAnnotation})
@JoinColumn(name = "${joinColumnName}"${nullableClause})
private ${targetName} ${fieldName};`;
}

function buildOneToManyPreview(
  sourceName: string,
  targetName: string,
  fieldName: string,
  fetchAnnotation: string,
  cascadeAnnotation: string,
): string {
  const mappedByField = toCamelCase(sourceName);
  return `@OneToMany(mappedBy = "${mappedByField}", ${fetchAnnotation}${cascadeAnnotation})
private List<${targetName}> ${fieldName}s = new ArrayList<>();`;
}

function buildOneToOnePreview(
  targetName: string,
  fieldName: string,
  fetchAnnotation: string,
  cascadeAnnotation: string,
  nullableClause: string,
): string {
  const joinColumnName = `${toSnakeCase(targetName)}_id`;
  return `@OneToOne(${fetchAnnotation}${cascadeAnnotation})
@JoinColumn(name = "${joinColumnName}"${nullableClause})
private ${targetName} ${fieldName};`;
}

function buildManyToManyPreview(
  sourceName: string,
  targetName: string,
  fieldName: string,
  fetchAnnotation: string,
  cascadeAnnotation: string,
): string {
  const tableName = `${toSnakeCase(sourceName)}_${toSnakeCase(targetName)}`;
  const sourceJoinColumn = `${toSnakeCase(sourceName)}_id`;
  const targetJoinColumn = `${toSnakeCase(targetName)}_id`;
  return `@ManyToMany(${fetchAnnotation}${cascadeAnnotation})
@JoinTable(
    name = "${tableName}",
    joinColumns = @JoinColumn(name = "${sourceJoinColumn}"),
    inverseJoinColumns = @JoinColumn(name = "${targetJoinColumn}")
)
private List<${targetName}> ${fieldName}s = new ArrayList<>();`;
}

export function RelationForm({
  opened,
  onClose,
  sourceEntityId,
  targetEntityId,
}: Readonly<RelationFormProps>) {
  // Use atomic selectors to prevent unnecessary re-renders
  const addRelation = useProjectStore((state) => state.addRelation);
  const getEntity = useProjectStore((state) => state.getEntity);

  const sourceEntity = getEntity(sourceEntityId);
  const targetEntity = getEntity(targetEntityId);

  // Form will reset on remount via key prop at usage site
  const form = useForm<FormValues>({
    initialValues: {
      type: 'ManyToOne',
      bidirectional: false,
      fetchType: 'LAZY',
      cascade: [],
      nullable: true,
    },
  });

  const handleSubmit = (values: FormValues) => {
    if (!sourceEntity || !targetEntity) return;

    const fieldName = toCamelCase(targetEntity.name);
    const columnName = `${toSnakeCase(targetEntity.name)}_id`;

    addRelation({
      type: values.type,
      sourceEntityId,
      sourceFieldName: fieldName,
      targetEntityId,
      bidirectional: values.bidirectional,
      fetchType: values.fetchType,
      cascade: values.cascade,
      foreignKey: {
        columnName,
        nullable: values.nullable,
        onDelete: values.nullable ? 'SET_NULL' : 'CASCADE',
        onUpdate: 'CASCADE',
      },
      ...(values.type === 'ManyToMany' && {
        joinTable: {
          name: `${toSnakeCase(sourceEntity.name)}_${toSnakeCase(targetEntity.name)}`,
          joinColumn: `${toSnakeCase(sourceEntity.name)}_id`,
          inverseJoinColumn: `${toSnakeCase(targetEntity.name)}_id`,
        },
      }),
    });

    notify.success({
      title: 'Relation Created',
      message: `${sourceEntity.name} -> ${targetEntity.name} (${values.type})`,
    });

    onClose();
  };

  if (!sourceEntity || !targetEntity) return null;

  const relationTypeInfo = RELATION_TYPES.find((r) => r.value === form.values.type);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Relation"
      size="md"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {/* Visual representation */}
          <Paper
            p="md"
            withBorder
            aria-label="Relation direction preview"
            style={{ backgroundColor: 'var(--mantine-color-default)' }}
          >
            <Group justify="center" gap="md">
              <Badge size="lg" color="blue" variant="filled">
                {sourceEntity.name}
              </Badge>
              <IconArrowRight size={20} aria-hidden="true" />
              <Badge size="lg" color="teal" variant="filled">
                {targetEntity.name}
              </Badge>
            </Group>
          </Paper>

          <Select
            label="Relation Type"
            description={relationTypeInfo?.description}
            data={RELATION_TYPES.map((r) => ({
              value: r.value,
              label: r.label,
            }))}
            {...form.getInputProps('type')}
          />

          <Divider label="Options" labelPosition="center" />

          <Group grow>
            <Select
              label="Fetch Type"
              description="When to load related entities"
              data={[
                { value: 'LAZY', label: 'Lazy (Recommended)' },
                { value: 'EAGER', label: 'Eager' },
              ]}
              {...form.getInputProps('fetchType')}
            />
          </Group>

          <Checkbox
            label="Bidirectional"
            description="Generate inverse relationship on target entity"
            {...form.getInputProps('bidirectional', { type: 'checkbox' })}
          />

          <Checkbox
            label="Nullable"
            description="Allow null values (optional relationship)"
            {...form.getInputProps('nullable', { type: 'checkbox' })}
          />

          <Select
            label="Cascade Operations"
            description="Operations to propagate to related entities"
            data={CASCADE_TYPES.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            multiple
            clearable
            {...form.getInputProps('cascade')}
          />

          {/* Preview */}
          <Divider label="Generated Code Preview" labelPosition="center" />
          <Paper p="sm" withBorder bg="dark.9">
            <Text size="xs" ff="monospace" c="green.4">
              {generateRelationPreview(
                form.values.type,
                sourceEntity.name,
                targetEntity.name,
                form.values,
              )}
            </Text>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Relation</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function generateRelationPreview(
  type: RelationType,
  sourceName: string,
  targetName: string,
  values: FormValues,
): string {
  const fieldName = toCamelCase(targetName);
  const fetchAnnotation = buildFetchAnnotation(values.fetchType);
  const cascadeAnnotation = buildCascadeAnnotation(values.cascade);
  const nullableClause = values.nullable
    ? getOptionalJoinColumnClause()
    : getRequiredJoinColumnClause();

  switch (type) {
    case 'ManyToOne':
      return buildManyToOnePreview(targetName, fieldName, fetchAnnotation, nullableClause);

    case 'OneToMany':
      return buildOneToManyPreview(
        sourceName,
        targetName,
        fieldName,
        fetchAnnotation,
        cascadeAnnotation,
      );

    case 'OneToOne':
      return buildOneToOnePreview(
        targetName,
        fieldName,
        fetchAnnotation,
        cascadeAnnotation,
        nullableClause,
      );

    case 'ManyToMany':
      return buildManyToManyPreview(
        sourceName,
        targetName,
        fieldName,
        fetchAnnotation,
        cascadeAnnotation,
      );

    default:
      return '';
  }
}
