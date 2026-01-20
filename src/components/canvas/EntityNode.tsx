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
  useMantineTheme,
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
import { memo, useCallback, useState } from 'react';
import type { EntityDesign, FieldDesign } from '../../types';
import { TYPE_COLORS } from '../../types';
import { ENTITY_NODE } from '../../utils/canvasConstants';

export interface EntityNodeData extends Record<string, unknown> {
  entity: EntityDesign;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

export type EntityNodeType = Node<EntityNodeData, 'entity'>;

const COLLAPSED_FIELD_LIMIT = 5;

// Static Set to persist expanded state across node reconstructions
const expandedEntities = new Set<string>();

function EntityNodeComponent({ data, selected }: NodeProps<EntityNodeType>) {
  const { entity, onEdit, onDelete, isSelected } = data;
  const [isExpanded, setIsExpanded] = useState(() => expandedEntities.has(entity.id));
  const theme = useMantineTheme();

  const hasMoreFields = entity.fields.length > COLLAPSED_FIELD_LIMIT;
  const displayedFields = isExpanded
    ? entity.fields
    : entity.fields.slice(0, COLLAPSED_FIELD_LIMIT);
  const hiddenFieldsCount = entity.fields.length - COLLAPSED_FIELD_LIMIT;

  const toggleExpanded = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded((prev) => {
        const newValue = !prev;
        if (newValue) {
          expandedEntities.add(entity.id);
        } else {
          expandedEntities.delete(entity.id);
        }
        return newValue;
      });
    },
    [entity.id],
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(entity.id);
    },
    [onEdit, entity.id],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(entity.id);
    },
    [onDelete, entity.id],
  );

  const handleStyle = {
    width: 12,
    height: 12,
    background: theme.colors.blue[6],
    border: '2px solid white',
  };

  return (
    <>
      {/* Target handle for incoming relations */}
      <Handle type="target" position={Position.Left} style={handleStyle} />

      <Card
        shadow={selected || isSelected ? 'lg' : 'sm'}
        padding={0}
        radius="md"
        withBorder
        style={{
          width: ENTITY_NODE.WIDTH,
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
          <div id={`entity-fields-${entity.id}`}>
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
          </div>

          {/* Expand/Collapse button */}
          {hasMoreFields && (
            <UnstyledButton
              onClick={toggleExpanded}
              style={{ width: '100%' }}
              aria-expanded={isExpanded}
              aria-controls={`entity-fields-${entity.id}`}
            >
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
              onClick={handleEdit}
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
              onClick={handleDelete}
              aria-label={`Delete ${entity.name} entity`}
            >
              <IconTrash size={14} aria-hidden="true" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Card>

      {/* Source handle for outgoing relations */}
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  );
}

export const EntityNode = memo(EntityNodeComponent);
