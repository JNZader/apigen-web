import { Button, Checkbox, Group, Paper, Select, Stack, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import type { JavaType } from '../types';
import { JAVA_TYPES, toCamelCase, toSnakeCase } from '../types';
import { notify } from '../utils/notifications';
import { isValidJavaIdentifier } from '../utils/validation';

interface AddFieldFormProps {
  readonly entityId: string;
}

export function AddFieldForm({ entityId }: Readonly<AddFieldFormProps>) {
  // Use atomic selectors to prevent unnecessary re-renders
  const addField = useProjectStore((state) => state.addField);
  const getEntity = useProjectStore((state) => state.getEntity);
  const [name, setName] = useState('');
  const [type, setType] = useState<JavaType>('String');
  const [nullable, setNullable] = useState(true);
  const [unique, setUnique] = useState(false);
  const [touched, setTouched] = useState(false);

  // Real-time validation
  const nameError = useMemo(() => {
    if (!touched) return null;
    if (!name.trim()) return 'Field name is required';
    if (!isValidJavaIdentifier(name)) {
      return 'Must be a valid Java identifier (camelCase recommended)';
    }
    if (!/^[a-z]/.test(name)) {
      return 'Field name should start with lowercase (camelCase)';
    }
    const entity = getEntity(entityId);
    if (entity?.fields.some((f) => f.name === toCamelCase(name))) {
      return 'Field with this name already exists';
    }
    return null;
  }, [name, touched, entityId, getEntity]);

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!touched) setTouched(true);
    },
    [touched],
  );

  const handleSubmit = useCallback(() => {
    setTouched(true);

    if (!name.trim()) {
      notify.error({ message: 'Field name is required' });
      return;
    }

    if (!isValidJavaIdentifier(name)) {
      notify.error({ message: 'Invalid field name. Use camelCase format.' });
      return;
    }

    const entity = getEntity(entityId);
    if (!entity) return;

    // Check for duplicate field names
    const fieldName = toCamelCase(name);
    if (entity.fields.some((f) => f.name === fieldName)) {
      notify.error({ message: 'Field with this name already exists' });
      return;
    }

    addField(entityId, {
      name: fieldName,
      columnName: toSnakeCase(name),
      type,
      nullable,
      unique,
      validations: nullable ? [] : [{ type: 'NotNull' }],
    });

    // Reset form
    setName('');
    setType('String');
    setNullable(true);
    setUnique(false);
    setTouched(false);

    notify.success({ title: 'Added', message: `Field ${fieldName} added successfully` });
  }, [name, type, nullable, unique, entityId, addField, getEntity]);

  return (
    <Paper
      p="sm"
      withBorder
      style={{
        backgroundColor: 'var(--mantine-color-default)',
      }}
    >
      <Stack gap="xs">
        <Group wrap="nowrap">
          <TextInput
            placeholder="fieldName"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            style={{ flex: 1 }}
            size="sm"
            label="New Field"
            error={nameError}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'field-name-error' : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            onBlur={() => setTouched(true)}
          />
          <Select
            data={JAVA_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            value={type}
            onChange={(v) => setType(v as JavaType)}
            style={{ width: 150 }}
            size="sm"
            label="Type"
          />
        </Group>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Checkbox
              label="Nullable"
              checked={nullable}
              onChange={(e) => setNullable(e.target.checked)}
              size="xs"
            />
            <Checkbox
              label="Unique"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              size="xs"
            />
          </Group>
          <Button
            size="xs"
            leftSection={<IconPlus size={14} aria-hidden="true" />}
            onClick={handleSubmit}
          >
            Add Field
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
