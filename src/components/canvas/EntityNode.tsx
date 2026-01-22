import {
  ActionIcon,
  Badge,
  Card,
  Divider,
  Group,
  Paper,
  Portal,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
// Note: Using custom Paper-based context menu instead of Menu for correct Portal positioning
import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconKey,
  IconServer,
  IconTable,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useClickOutside } from '@mantine/hooks';
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useCanvasUIStore, useIsEntityExpanded } from '../../store/canvasUIStore';
import { useSelectedEntityIds } from '../../store/entityStore';
import { useServiceActions, useServices } from '../../store/projectStore';
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

function EntityNodeComponent({ data, selected }: NodeProps<EntityNodeType>) {
  const { entity, onEdit, onDelete, isSelected } = data;
  const isExpanded = useIsEntityExpanded(entity.id);
  const toggleEntityExpanded = useCanvasUIStore((state) => state.toggleEntityExpanded);
  const theme = useMantineTheme();
  const services = useServices();
  const selectedEntityIds = useSelectedEntityIds();
  const { assignEntityToService, assignEntitiesToService, removeEntityFromService } =
    useServiceActions();

  // Context menu state - using Portal for correct positioning
  const [menuOpened, setMenuOpened] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useClickOutside(() => setMenuOpened(false));

  // Check if this entity is part of a multi-selection
  const isPartOfMultiSelect =
    selectedEntityIds.length > 1 &&
    (selectedEntityIds.includes(entity.id) || isSelected || selected);

  // Find the service this entity is assigned to
  const assignedService = useMemo(
    () => services.find((s) => s.entityIds.includes(entity.id)),
    [services, entity.id],
  );

  const hasMoreFields = entity.fields.length > ENTITY_NODE.COLLAPSED_FIELD_LIMIT;
  const displayedFields = isExpanded
    ? entity.fields
    : entity.fields.slice(0, ENTITY_NODE.COLLAPSED_FIELD_LIMIT);
  const hiddenFieldsCount = entity.fields.length - ENTITY_NODE.COLLAPSED_FIELD_LIMIT;

  const toggleExpanded = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleEntityExpanded(entity.id);
    },
    [entity.id, toggleEntityExpanded],
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

  const handleAssignToService = useCallback(
    (serviceId: string) => {
      assignEntityToService(entity.id, serviceId);
    },
    [assignEntityToService, entity.id],
  );

  const handleRemoveFromService = useCallback(() => {
    if (assignedService) {
      removeEntityFromService(entity.id, assignedService.id);
    }
    setMenuOpened(false);
  }, [removeEntityFromService, entity.id, assignedService]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setMenuOpened(true);
  }, []);

  // Keyboard support for context menu (Shift+F10 or ContextMenu key)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') {
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setMenuOpened(true);
    }
  }, []);

  const handleAssignAndClose = useCallback(
    (serviceId: string) => {
      if (isPartOfMultiSelect) {
        // Assign all selected entities to the service
        assignEntitiesToService(selectedEntityIds, serviceId);
      } else {
        handleAssignToService(serviceId);
      }
      setMenuOpened(false);
    },
    [handleAssignToService, isPartOfMultiSelect, selectedEntityIds, assignEntitiesToService],
  );

  const handleStyle = {
    width: 12,
    height: 12,
    background: theme.colors.blue[6],
    border: '2px solid white',
  };

  // Determine border color: selection takes precedence, then service color
  const getBorderColor = () => {
    if (selected || isSelected) {
      return 'var(--mantine-color-blue-5)';
    }
    if (assignedService) {
      return assignedService.color;
    }
    return undefined;
  };

  const getBorderWidth = () => {
    if (selected || isSelected) return 2;
    if (assignedService) return 2;
    return 1;
  };

  return (
    <>
      <button
        type="button"
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={menuOpened}
        style={{
          all: 'unset',
          display: 'block',
          cursor: 'inherit',
        }}
      >
        {/* Target handle for incoming relations */}
        <Handle type="target" position={Position.Left} style={handleStyle} />

          <Card
            shadow={selected || isSelected ? 'lg' : 'sm'}
            padding={0}
            radius="md"
            withBorder
            style={{
              width: ENTITY_NODE.WIDTH,
              borderColor: getBorderColor(),
              borderWidth: getBorderWidth(),
              cursor: 'grab',
            }}
          >
            <Card.Section withBorder inheritPadding py="xs" bg="blue.6">
              <Group justify="space-between" wrap="nowrap">
                <Group gap={6} wrap="nowrap">
                  <IconTable size={14} color="white" />
                  <Text fw={700} c="white" size="sm" truncate style={{ maxWidth: 100 }}>
                    {entity.name}
                  </Text>
                </Group>
                <Group gap={4} wrap="nowrap">
                  {assignedService && (
                    <Tooltip label={`Assigned to ${assignedService.name}`}>
                      <Badge
                        size="xs"
                        variant="filled"
                        style={{
                          backgroundColor: assignedService.color,
                          maxWidth: 60,
                        }}
                      >
                        <Text size="xs" truncate>
                          {assignedService.name}
                        </Text>
                      </Badge>
                    </Tooltip>
                  )}
                  <Badge color="blue" variant="light" size="xs">
                    {entity.fields.length}
                  </Badge>
                </Group>
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
      </button>

      {/* Context menu for service assignment - using Portal for correct positioning */}
      {menuOpened && (
        <Portal>
          <Paper
            ref={menuRef}
            shadow="md"
            withBorder
            style={{
              position: 'fixed',
              left: menuPosition.x,
              top: menuPosition.y,
              zIndex: 1000,
              minWidth: 220,
              padding: 4,
            }}
          >
            <Text size="xs" c="dimmed" fw={500} px="sm" py={4}>
              {isPartOfMultiSelect
                ? `Assign ${selectedEntityIds.length} entities to Service`
                : 'Assign to Service'}
            </Text>
            {services.length === 0 ? (
              <Text size="sm" c="dimmed" px="sm" py={6}>
                No services available
              </Text>
            ) : (
              services.map((service) => {
                const isCurrentService =
                  !isPartOfMultiSelect && assignedService?.id === service.id;
                return (
                  <UnstyledButton
                    key={service.id}
                    onClick={() => !isCurrentService && handleAssignAndClose(service.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '6px 12px',
                      borderRadius: 4,
                      opacity: isCurrentService ? 0.5 : 1,
                      cursor: isCurrentService ? 'default' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentService) {
                        e.currentTarget.style.backgroundColor =
                          'var(--mantine-color-gray-1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Group gap={8} wrap="nowrap">
                      <IconServer size={14} style={{ color: service.color }} />
                      <Text size="sm">
                        {service.name}
                        {isCurrentService && ' (current)'}
                      </Text>
                    </Group>
                  </UnstyledButton>
                );
              })
            )}
            {!isPartOfMultiSelect && assignedService && (
              <>
                <Divider my={4} />
                <UnstyledButton
                  onClick={handleRemoveFromService}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: 4,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-red-1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Group gap={8} wrap="nowrap">
                    <IconX size={14} color="var(--mantine-color-red-6)" />
                    <Text size="sm" c="red">
                      Remove from service
                    </Text>
                  </Group>
                </UnstyledButton>
              </>
            )}
          </Paper>
        </Portal>
      )}
    </>
  );
}

export const EntityNode = memo(EntityNodeComponent);
