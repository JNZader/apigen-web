import { ActionIcon, Badge, Card, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconCloud, IconDatabase, IconServer, IconSettings, IconTrash } from '@tabler/icons-react';
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, NodeResizer, Position } from '@xyflow/react';
import { memo } from 'react';
import type { ServiceDesign } from '../../types';
import { SERVICE_NODE } from '../../utils/canvasConstants';

export interface ServiceNodeData extends Record<string, unknown> {
  service: ServiceDesign;
  entityCount: number;
  entityNames: string[];
  onDelete: (id: string) => void;
  onConfigure: (id: string) => void;
  isSelected: boolean;
  isDropTarget?: boolean;
}

export type ServiceNodeType = Node<ServiceNodeData, 'service'>;

function ServiceNodeComponent({ id, data, selected }: NodeProps<ServiceNodeType>) {
  const { service, entityCount, entityNames, onDelete, onConfigure, isSelected, isDropTarget } =
    data;
  // Use both ReactFlow's selected prop (required for NodeResizer functionality)
  // and our data.isSelected (for custom styling and state tracking)
  const isHighlighted = selected || isSelected || isDropTarget;

  // Debug: log selection state
  // console.log(`ServiceNode ${service.name}: selected=${selected}, isSelected=${isSelected}, isHighlighted=${isHighlighted}`);

  const handleStyle = {
    width: 14,
    height: 14,
    background: service.color,
    border: '2px solid white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };

  return (
    <>
      {/* Node Resizer for adjusting size */}
      <NodeResizer
        nodeId={id}
        minWidth={SERVICE_NODE.MIN_WIDTH}
        minHeight={SERVICE_NODE.MIN_HEIGHT}
        isVisible={isHighlighted}
        lineStyle={{
          borderWidth: 3,
          borderStyle: 'dashed',
          borderColor: service.color,
          zIndex: 10,
        }}
        handleStyle={{
          width: 14,
          height: 14,
          backgroundColor: service.color,
          border: '3px solid white',
          borderRadius: 3,
          zIndex: 20,
        }}
      />

      {/* Handles for inter-service connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        style={{ ...handleStyle, top: -7 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        style={{ ...handleStyle, left: -7 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        style={{ ...handleStyle, bottom: -7 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        style={{ ...handleStyle, right: -7 }}
      />

      <Card
        shadow={isHighlighted ? 'lg' : 'sm'}
        padding={0}
        radius="md"
        withBorder
        style={{
          width: '100%',
          height: '100%',
          borderColor: isDropTarget
            ? 'var(--mantine-color-green-6)'
            : isHighlighted
              ? service.color
              : 'var(--mantine-color-gray-3)',
          borderWidth: isDropTarget ? 3 : isHighlighted ? 2 : 1,
          cursor: 'grab',
          backgroundColor: isDropTarget
            ? 'var(--mantine-color-green-0)'
            : 'var(--mantine-color-gray-0)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDropTarget ? '0 0 20px rgba(64, 192, 87, 0.4)' : undefined,
          transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
          position: 'relative',
        }}
      >
        {/* Service Header */}
        <Card.Section
          withBorder
          inheritPadding
          py="xs"
          px="sm"
          style={{ backgroundColor: service.color, pointerEvents: 'all', cursor: 'grab' }} // Re-enable pointer events for header
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <IconServer size={16} color="white" />
              <Text fw={700} c="white" size="sm" truncate style={{ maxWidth: 180 }}>
                {service.name}
              </Text>
            </Group>
            <Group gap={4}>
              <Badge color="dark" variant="filled" size="xs">
                <Group gap={4}>
                  <IconDatabase size={10} />
                  <Text size="xs">{service.config.databaseType}</Text>
                </Group>
              </Badge>
              <Badge
                variant="light"
                size="xs"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                {entityCount} {entityCount === 1 ? 'entity' : 'entities'}
              </Badge>
            </Group>
          </Group>
        </Card.Section>

        {/* Service Content Area - This is where entity nodes will be placed */}
        <Stack
          gap="xs"
          p="xs"
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Visual indicator for service boundaries */}
          <div
            style={{
              position: 'absolute',
              inset: 8,
              border: `2px dashed ${service.color}20`,
              borderRadius: 4,
              pointerEvents: 'none',
            }}
          />

          {/* Service info when empty */}
          {entityCount === 0 && (
            <Stack
              align="center"
              justify="center"
              style={{
                flex: 1,
                color: isDropTarget
                  ? 'var(--mantine-color-green-7)'
                  : 'var(--mantine-color-dimmed)',
              }}
            >
              <IconCloud
                size={32}
                opacity={isDropTarget ? 1 : 0.5}
                color={isDropTarget ? 'var(--mantine-color-green-6)' : undefined}
              />
              <Text
                size="xs"
                c={isDropTarget ? 'green' : 'dimmed'}
                ta="center"
                fw={isDropTarget ? 600 : 400}
              >
                {isDropTarget
                  ? 'Drop here to assign entity'
                  : 'Drag entities here or click Configure'}
              </Text>
            </Stack>
          )}

          {/* Show assigned entities */}
          {entityCount > 0 && (
            <Stack gap={4} style={{ zIndex: 1 }}>
              {entityNames.slice(0, 5).map((name, index) => (
                <Badge
                  key={`${name}-${index}`}
                  size="sm"
                  variant="light"
                  color="blue"
                  style={{ alignSelf: 'flex-start' }}
                  leftSection={<IconDatabase size={10} />}
                >
                  {name}
                </Badge>
              ))}
              {entityNames.length > 5 && (
                <Text size="xs" c="dimmed">
                  +{entityNames.length - 5} more entities
                </Text>
              )}
            </Stack>
          )}

          {/* Service description */}
          {service.description && (
            <Text size="xs" c="dimmed" lineClamp={2} style={{ zIndex: 1, marginTop: 'auto' }}>
              {service.description}
            </Text>
          )}
        </Stack>

        {/* Service Footer with actions */}
        <Card.Section withBorder inheritPadding py={4} px="xs" bg="white" style={{ pointerEvents: 'all' }}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap={4}>
              <Badge
                size="xs"
                variant="light"
                color={service.config.enableServiceDiscovery ? 'green' : 'gray'}
              >
                {service.config.serviceDiscoveryType}
              </Badge>
              <Badge size="xs" variant="light" color="blue">
                :{service.config.port}
              </Badge>
            </Group>
            <Group gap={4}>
              <Tooltip label="Configure Service">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigure(service.id);
                  }}
                  aria-label={`Configure ${service.name} service`}
                >
                  <IconSettings size={14} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Delete Service">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(service.id);
                  }}
                  aria-label={`Delete ${service.name} service`}
                >
                  <IconTrash size={14} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Card.Section>
      </Card>
    </>
  );
}

export const ServiceNode = memo(ServiceNodeComponent);
