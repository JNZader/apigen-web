import {
  ActionIcon,
  Badge,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconKey,
  IconTable,
  IconTrash,
} from '@tabler/icons-react';
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { memo, useState } from 'react';
import type { EntityDesign, FieldDesign } from '../../types';
import { TYPE_COLORS } from '../../types';

export interface EntityNodeData extends Record<string, unknown> {
  entity: EntityDesign;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

export type EntityNodeType = Node<EntityNodeData, 'entity'>;

const COLLAPSED_FIELD_LIMIT = 5;

function EntityNodeComponent({ data, selected }: NodeProps<EntityNodeType>) {
  const { entity, onEdit, onDelete, isSelected } = data;
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMoreFields = entity.fields.length > COLLAPSED_FIELD_LIMIT;
  const displayedFields = isExpanded
    ? entity.fields
    : entity.fields.slice(0, COLLAPSED_FIELD_LIMIT);
  const hiddenFieldsCount = entity.fields.length - COLLAPSED_FIELD_LIMIT;

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Target handle for incoming relations */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          background: '#228be6',
          border: '2px solid white',
        }}
      />

      <Card
        shadow={selected || isSelected ? 'lg' : 'sm'}
        padding={0}
        radius="md"
        withBorder
        style={{
          width: 220,
          borderColor: selected || isSelected ? 'var(--mantine-color-blue-5)' : undefined,
          borderWidth: selected || isSelected ? 2 : 1,
          cursor: 'grab',
        }}
      >
        <Card.Section withBorder inheritPadding py="xs" bg="blue.6">
          <Group justify="space-between" wrap="nowrap">
            <Group gap={6} wrap="nowrap">
              <IconTable size={14} color="white" />
              <Text fw={700} c="white" size="sm" truncate>
                {entity.name}
              </Text>
            </Group>
            <Badge color="blue" variant="light" size="xs">
              {entity.fields.length}
            </Badge>
          </Group>
        </Card.Section>

        <Stack gap={2} p="xs">
          {/* ID field (inherited from Base) */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap={4} wrap="nowrap">
              <IconKey size={10} color="var(--mantine-color-yellow-6)" />
              <Text size="xs" c="dimmed">
                id
              </Text>
            </Group>
            <Badge size="xs" variant="light" color="yellow">
              Long
            </Badge>
          </Group>

          {entity.fields.length > 0 && <Divider my={2} />}

          {/* Entity fields */}
          {displayedFields.map((field: FieldDesign) => (
            <Group key={field.id} justify="space-between" wrap="nowrap">
              <Text size="xs" truncate style={{ maxWidth: 120 }}>
                {field.name}
                {!field.nullable && (
                  <Text component="span" c="red" size="xs">
                    *
                  </Text>
                )}
              </Text>
              <Badge size="xs" variant="light" color={TYPE_COLORS[field.type] || 'gray'}>
                {field.type}
              </Badge>
            </Group>
          ))}

          {/* Expand/Collapse button */}
          {hasMoreFields && (
            <UnstyledButton onClick={toggleExpanded} style={{ width: '100%' }}>
              <Group justify="center" gap={4} py={2}>
                {isExpanded ? (
                  <>
                    <IconChevronUp size={12} color="var(--mantine-color-blue-5)" />
                    <Text size="xs" c="blue">
                      Show less
                    </Text>
                  </>
                ) : (
                  <>
                    <IconChevronDown size={12} color="var(--mantine-color-blue-5)" />
                    <Text size="xs" c="blue">
                      +{hiddenFieldsCount} more fields
                    </Text>
                  </>
                )}
              </Group>
            </UnstyledButton>
          )}

          {entity.fields.length === 0 && (
            <Text size="xs" c="dimmed" fs="italic" ta="center">
              No fields
            </Text>
          )}
        </Stack>

        <Divider />

        <Group p={4} justify="flex-end" gap={4}>
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entity.id);
              }}
              aria-label={`Edit ${entity.name} entity`}
            >
              <IconEdit size={14} aria-hidden="true" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entity.id);
              }}
              aria-label={`Delete ${entity.name} entity`}
            >
              <IconTrash size={14} aria-hidden="true" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Card>

      {/* Source handle for outgoing relations */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          background: '#228be6',
          border: '2px solid white',
        }}
      />
    </>
  );
}

export const EntityNode = memo(EntityNodeComponent);
