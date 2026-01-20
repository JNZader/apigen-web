import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Paper,
  Select,
  Stack,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { memo, useState } from 'react';
import type { FieldDesign, JavaType } from '../types';
import { JAVA_TYPES, toSnakeCase } from '../types';
import { isValidJavaIdentifier } from '../utils/validation';
import { ValidationEditor } from './ValidationEditor';

interface FieldEditorProps {
  field: FieldDesign;
  onChange: (updates: Partial<FieldDesign>) => void;
  onRemove: () => void;
}

export const FieldEditor = memo(function FieldEditor({
  field,
  onChange,
  onRemove,
}: FieldEditorProps) {
  const [validationEditorOpened, { open: openValidationEditor, close: closeValidationEditor }] =
    useDisclosure(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleNameChange = (name: string) => {
    if (name && !isValidJavaIdentifier(name)) {
      setNameError('Must be a valid Java identifier (camelCase)');
    } else if (name && !/^[a-z]/.test(name)) {
      setNameError('Field name should start with lowercase (camelCase)');
    } else {
      setNameError(null);
    }
    onChange({
      name,
      columnName: toSnakeCase(name),
    });
  };

  return (
    <Paper p="sm" withBorder>
      <Stack gap="xs">
        <Group wrap="nowrap">
          <TextInput
            placeholder="fieldName"
            value={field.name}
            onChange={(e) => handleNameChange(e.target.value)}
            style={{ flex: 1 }}
            size="sm"
            label="Field Name"
            error={nameError}
          />
          <Select
            data={JAVA_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            value={field.type}
            onChange={(type) => onChange({ type: type as JavaType })}
            style={{ width: 150 }}
            size="sm"
            label="Type"
          />
          <Group gap={4} mt={24} wrap="nowrap">
            <Checkbox
              label="Nullable"
              checked={field.nullable}
              onChange={(e) => onChange({ nullable: e.target.checked })}
              size="xs"
            />
            <Checkbox
              label="Unique"
              checked={field.unique}
              onChange={(e) => onChange({ unique: e.target.checked })}
              size="xs"
            />
          </Group>
          <Tooltip label="Remove field">
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={onRemove}
              mt={24}
              aria-label={`Remove ${field.name} field`}
            >
              <IconTrash size={16} aria-hidden="true" />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconCheck size={14} aria-hidden="true" />}
            onClick={openValidationEditor}
            aria-label={`Edit validations for ${field.name} field`}
          >
            Validations
          </Button>
          {field.validations.length > 0 && (
            <Group gap={4} wrap="nowrap">
              {field.validations.slice(0, 3).map((v) => (
                <Badge key={v.type} size="xs" variant="light">
                  @{v.type}
                </Badge>
              ))}
              {field.validations.length > 3 && (
                <Badge size="xs" variant="outline" color="gray">
                  +{field.validations.length - 3} more
                </Badge>
              )}
            </Group>
          )}
        </Group>
      </Stack>

      <ValidationEditor
        opened={validationEditorOpened}
        onClose={closeValidationEditor}
        validations={field.validations}
        onChange={(validations) => onChange({ validations })}
        fieldType={field.type}
      />
    </Paper>
  );
});
