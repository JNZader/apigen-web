import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconAt,
  IconCalendar,
  IconCheck,
  IconNumber,
  IconPlus,
  IconRegex,
  IconRuler,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { ValidationRule, ValidationType } from '../types';

interface ValidationEditorProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly validations: ValidationRule[];
  readonly onChange: (validations: ValidationRule[]) => void;
  readonly fieldType: string;
}

// Extracted union type alias
type ValidationValueType = 'number' | 'string' | 'range';

interface ValidationDef {
  type: ValidationType;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresValue: boolean;
  valueType?: ValidationValueType;
  applicableTo: string[];
}

// Helper to get label text for value input based on validation type
function getValueLabel(valueType?: ValidationValueType): string {
  if (valueType === 'range') {
    return 'Min, Max (e.g., 0,255)';
  }
  if (valueType === 'number') {
    return 'Value';
  }
  return 'Pattern (Regex)';
}

// Helper to get placeholder text for value input based on validation type
function getValuePlaceholder(valueType?: ValidationValueType): string {
  if (valueType === 'range') {
    return '0,255';
  }
  if (valueType === 'number') {
    return '0';
  }
  return '^[a-z]+$';
}

const VALIDATION_DEFS: ValidationDef[] = [
  {
    type: 'NotNull',
    label: 'Not Null',
    description: 'Field cannot be null',
    icon: <IconAlertCircle size={16} />,
    requiresValue: false,
    applicableTo: ['all'],
  },
  {
    type: 'NotBlank',
    label: 'Not Blank',
    description: 'String cannot be empty or whitespace',
    icon: <IconCheck size={16} />,
    requiresValue: false,
    applicableTo: ['String'],
  },
  {
    type: 'NotEmpty',
    label: 'Not Empty',
    description: 'Collection/String cannot be empty',
    icon: <IconCheck size={16} />,
    requiresValue: false,
    applicableTo: ['String'],
  },
  {
    type: 'Size',
    label: 'Size',
    description: 'String/Collection size constraints',
    icon: <IconRuler size={16} />,
    requiresValue: true,
    valueType: 'range',
    applicableTo: ['String'],
  },
  {
    type: 'Min',
    label: 'Minimum',
    description: 'Minimum numeric value',
    icon: <IconNumber size={16} />,
    requiresValue: true,
    valueType: 'number',
    applicableTo: ['Long', 'Integer', 'Double', 'Float', 'BigDecimal'],
  },
  {
    type: 'Max',
    label: 'Maximum',
    description: 'Maximum numeric value',
    icon: <IconNumber size={16} />,
    requiresValue: true,
    valueType: 'number',
    applicableTo: ['Long', 'Integer', 'Double', 'Float', 'BigDecimal'],
  },
  {
    type: 'Positive',
    label: 'Positive',
    description: 'Value must be positive (> 0)',
    icon: <IconNumber size={16} />,
    requiresValue: false,
    applicableTo: ['Long', 'Integer', 'Double', 'Float', 'BigDecimal'],
  },
  {
    type: 'PositiveOrZero',
    label: 'Positive or Zero',
    description: 'Value must be >= 0',
    icon: <IconNumber size={16} />,
    requiresValue: false,
    applicableTo: ['Long', 'Integer', 'Double', 'Float', 'BigDecimal'],
  },
  {
    type: 'Email',
    label: 'Email',
    description: 'Must be valid email format',
    icon: <IconAt size={16} />,
    requiresValue: false,
    applicableTo: ['String'],
  },
  {
    type: 'Pattern',
    label: 'Pattern (Regex)',
    description: 'Must match regex pattern',
    icon: <IconRegex size={16} />,
    requiresValue: true,
    valueType: 'string',
    applicableTo: ['String'],
  },
  {
    type: 'Past',
    label: 'Past',
    description: 'Date must be in the past',
    icon: <IconCalendar size={16} />,
    requiresValue: false,
    applicableTo: ['LocalDate', 'LocalDateTime', 'Instant'],
  },
  {
    type: 'Future',
    label: 'Future',
    description: 'Date must be in the future',
    icon: <IconCalendar size={16} />,
    requiresValue: false,
    applicableTo: ['LocalDate', 'LocalDateTime', 'Instant'],
  },
];

export function ValidationEditor({
  opened,
  onClose,
  validations,
  onChange,
  fieldType,
}: Readonly<ValidationEditorProps>) {
  const [newValidationType, setNewValidationType] = useState<ValidationType | null>(null);
  const [newValue, setNewValue] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Filter validations applicable to this field type
  const applicableValidations = VALIDATION_DEFS.filter(
    (v) => v.applicableTo.includes('all') || v.applicableTo.includes(fieldType),
  );

  // Get validation types not yet added
  const availableTypes = applicableValidations.filter(
    (v) => !validations.some((val) => val.type === v.type),
  );

  const handleAddValidation = () => {
    if (!newValidationType) return;

    const def = VALIDATION_DEFS.find((d) => d.type === newValidationType);
    if (!def) return;

    const newValidation: ValidationRule = {
      type: newValidationType,
      value: def.requiresValue ? newValue : undefined,
      message: newMessage || undefined,
    };

    onChange([...validations, newValidation]);
    setNewValidationType(null);
    setNewValue('');
    setNewMessage('');
  };

  const handleRemoveValidation = (type: ValidationType) => {
    onChange(validations.filter((v) => v.type !== type));
  };

  const selectedDef = newValidationType
    ? VALIDATION_DEFS.find((d) => d.type === newValidationType)
    : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconCheck size={20} />
          <Text fw={600}>Field Validations</Text>
        </Group>
      }
      size="lg"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Stack>
        {/* Current validations */}
        <Text size="sm" fw={500}>
          Active Validations
        </Text>

        {validations.length === 0 ? (
          <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-default)' }}>
            <Text size="sm" c="dimmed" ta="center">
              No validations configured for this field.
            </Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {validations.map((validation) => {
              const def = VALIDATION_DEFS.find((d) => d.type === validation.type);
              return (
                <Paper key={validation.type} p="sm" withBorder>
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon size="sm" variant="light" color="blue">
                        {def?.icon || <IconCheck size={14} />}
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>
                          @{validation.type}
                          {validation.value && (
                            <Badge size="xs" variant="light" ml="xs">
                              {validation.value}
                            </Badge>
                          )}
                        </Text>
                        {validation.message && (
                          <Text size="xs" c="dimmed">
                            Message: {validation.message}
                          </Text>
                        )}
                      </div>
                    </Group>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      size="sm"
                      onClick={() => handleRemoveValidation(validation.type)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        )}

        <Divider label="Add Validation" labelPosition="center" />

        {/* Add new validation */}
        {availableTypes.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center">
            All applicable validations have been added.
          </Text>
        ) : (
          <Stack gap="sm">
            <Select
              label="Validation Type"
              placeholder="Select validation"
              data={availableTypes.map((v) => ({
                value: v.type,
                label: `@${v.type} - ${v.description}`,
              }))}
              value={newValidationType}
              onChange={(v) => setNewValidationType(v as ValidationType)}
              searchable
            />

            {selectedDef?.requiresValue && (
              <TextInput
                label={getValueLabel(selectedDef.valueType)}
                placeholder={getValuePlaceholder(selectedDef.valueType)}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            )}

            <TextInput
              label="Custom Error Message (optional)"
              placeholder="e.g., Name is required"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAddValidation}
              disabled={!newValidationType || (selectedDef?.requiresValue && !newValue)}
            >
              Add Validation
            </Button>
          </Stack>
        )}

        {/* Quick add buttons */}
        <Divider label="Quick Add" labelPosition="center" />

        <SimpleGrid cols={3}>
          {availableTypes.slice(0, 6).map((v) => (
            <Button
              key={v.type}
              variant="light"
              size="xs"
              leftSection={v.icon}
              onClick={() => {
                if (v.requiresValue) {
                  setNewValidationType(v.type);
                } else {
                  onChange([...validations, { type: v.type }]);
                }
              }}
              disabled={v.requiresValue && !newValue}
            >
              {v.label}
            </Button>
          ))}
        </SimpleGrid>

        <Group justify="flex-end" mt="md">
          <Button onClick={onClose}>Done</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
