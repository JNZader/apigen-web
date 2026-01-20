import { ActionIcon, Badge, Box, Card, Divider, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconKey, IconTable, IconTrash } from '@tabler/icons-react';
import { memo } from 'react';
import type { EntityDesign } from '../types';
import { TYPE_COLORS } from '../types';

interface EntityCardProps {
  entity: EntityDesign;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const EntityCard = memo(function EntityCard({
  entity,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: EntityCardProps) {
  return (
    <Card
      shadow={isSelected ? 'md' : 'sm'}
      padding="lg"
      radius="md"
      withBorder
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${entity.name} entity with ${entity.fields.length} fields`}
      style={{
        cursor: 'pointer',
        borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
        borderWidth: isSelected ? 2 : 1,
      }}
    >
      <Card.Section withBorder inheritPadding py="xs" bg="blue.6">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <IconTable size={16} color="white" aria-hidden="true" />
            <Text fw={700} c="white">
              {entity.name}
            </Text>
          </Group>
          <Badge color="blue" variant="light" size="sm">
            {entity.tableName}
          </Badge>
        </Group>
      </Card.Section>

      <Stack gap="xs" mt="md">
        {/* ID field (inherited from Base) */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap={4} wrap="nowrap">
            <IconKey size={12} color="var(--mantine-color-yellow-6)" aria-hidden="true" />
            <Text size="sm" c="dimmed">
              id
            </Text>
          </Group>
          <Badge size="xs" variant="outline" color="yellow">
            Long (PK)
          </Badge>
        </Group>

        {entity.fields.length > 0 && <Divider my={4} />}

        {/* Entity fields */}
        {entity.fields.map((field) => (
          <Group key={field.id} justify="space-between" wrap="nowrap">
            <Text size="sm">
              {field.name}
              {!field.nullable && (
                <Text component="span" c="red" size="xs">
                  {' '}
                  *
                </Text>
              )}
            </Text>
            <Badge size="xs" variant="outline" color={TYPE_COLORS[field.type] || 'gray'}>
              {field.type}
            </Badge>
          </Group>
        ))}

        {entity.fields.length === 0 && (
          <Text size="sm" c="dimmed" fs="italic" ta="center">
            No fields yet
          </Text>
        )}

        {/* Inherited fields indicator */}
        <Divider my={4} label="Inherited from Base" labelPosition="center" />
        <Box>
          <Text size="xs" c="dimmed">
            estado, fechaCreacion, fechaActualizacion, creadoPor, modificadoPor, version...
          </Text>
        </Box>
      </Stack>

      <Group mt="md" justify="flex-end" gap="xs" wrap="nowrap">
        <Tooltip label="Edit Entity">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label={`Edit ${entity.name} entity`}
          >
            <IconEdit size={16} aria-hidden="true" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete Entity">
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Delete ${entity.name} entity`}
          >
            <IconTrash size={16} aria-hidden="true" />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
});
