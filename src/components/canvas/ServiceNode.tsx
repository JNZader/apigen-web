import { ActionIcon, Badge, Card, Group, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconCloud,
  IconDatabase,
  IconEdit,
  IconServer,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, NodeResizer, Position } from '@xyflow/react';
import { memo } from 'react';
import type { ServiceDesign } from '../../types';

export interface ServiceNodeData extends Record<string, unknown> {
  service: ServiceDesign;
  entityCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onConfigure: (id: string) => void;
  isSelected: boolean;
}

export type ServiceNodeType = Node<ServiceNodeData, 'service'>;

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

function ServiceNodeComponent({ data, selected }: NodeProps<ServiceNodeType>) {
  const { service, entityCount, onEdit, onDelete, onConfigure, isSelected } = data;
  const isHighlighted = selected || isSelected;

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
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        isVisible={isHighlighted}
        lineStyle={{
          border: `2px dashed ${service.color}`,
        }}
        handleStyle={{
          width: 10,
          height: 10,
          backgroundColor: service.color,
          border: '2px solid white',
          borderRadius: 2,
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
          width: service.width,
          height: service.height,
          borderColor: isHighlighted ? service.color : 'var(--mantine-color-gray-3)',
          borderWidth: isHighlighted ? 2 : 1,
          cursor: 'grab',
          backgroundColor: 'var(--mantine-color-gray-0)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Service Header */}
        <Card.Section
          withBorder
          inheritPadding
          py="xs"
          px="sm"
          style={{ backgroundColor: service.color }}
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
                color: 'var(--mantine-color-dimmed)',
              }}
            >
              <IconCloud size={32} opacity={0.5} />
              <Text size="xs" c="dimmed" ta="center">
                Drag entities here to add them to this service
              </Text>
            </Stack>
          )}

          {/* Service description */}
          {service.description && (
            <Text size="xs" c="dimmed" lineClamp={2} style={{ zIndex: 1 }}>
              {service.description}
            </Text>
          )}
        </Stack>

        {/* Service Footer with actions */}
        <Card.Section withBorder inheritPadding py={4} px="xs" bg="white">
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
              <Tooltip label="Edit Service">
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(service.id);
                  }}
                  aria-label={`Edit ${service.name} service`}
                >
                  <IconEdit size={14} aria-hidden="true" />
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
