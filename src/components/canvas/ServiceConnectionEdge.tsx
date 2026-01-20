import { ActionIcon, Badge, Group, Tooltip } from '@mantine/core';
import { IconApi, IconCloud, IconCode, IconPlugConnected, IconTrash } from '@tabler/icons-react';
import type { Edge, EdgeProps } from '@xyflow/react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { memo } from 'react';
import type { CommunicationType, ServiceConnectionConfig } from '../../types';
import { COMMUNICATION_COLORS, COMMUNICATION_LABELS } from '../../types';

export interface ServiceConnectionEdgeData extends Record<string, unknown> {
  communicationType: CommunicationType;
  label?: string;
  config?: ServiceConnectionConfig;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export type ServiceConnectionEdgeType = Edge<ServiceConnectionEdgeData, 'service-connection'>;

const COMMUNICATION_ICONS: Record<CommunicationType, typeof IconApi> = {
  REST: IconApi,
  gRPC: IconCode,
  Kafka: IconPlugConnected,
  RabbitMQ: IconCloud,
  WebSocket: IconPlugConnected,
};

function ServiceConnectionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<ServiceConnectionEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.3,
  });

  const communicationType: CommunicationType = data?.communicationType || 'REST';
  const color = selected ? COMMUNICATION_COLORS[communicationType] : 'var(--mantine-color-gray-5)';
  const Icon = COMMUNICATION_ICONS[communicationType];

  // Use unique marker ID per edge to avoid conflicts
  const markerId = `arrow-${id}`;

  // Determine line style based on communication type
  const getStrokeStyle = () => {
    switch (communicationType) {
      case 'Kafka':
      case 'RabbitMQ':
        // Dashed line for async/event-based
        return { strokeDasharray: '8,4' };
      case 'WebSocket':
        // Dotted line for WebSocket
        return { strokeDasharray: '4,4' };
      default:
        // Solid line for REST/gRPC
        return {};
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          ...getStrokeStyle(),
        }}
        markerEnd={`url(#${markerId})`}
      />

      {/* Arrow marker definition with unique ID per edge */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        </defs>
      </svg>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <Group gap={4}>
            <Badge
              size="sm"
              color={selected ? undefined : 'gray'}
              style={{
                backgroundColor: selected ? COMMUNICATION_COLORS[communicationType] : undefined,
                cursor: 'pointer',
              }}
              variant={selected ? 'filled' : 'light'}
              leftSection={<Icon size={12} />}
            >
              {COMMUNICATION_LABELS[communicationType]}
            </Badge>

            {/* Show topic/path info when selected */}
            {selected && data?.config && (
              <>
                {data.config.topicName && (
                  <Badge size="xs" variant="outline" color="dark">
                    {data.config.topicName}
                  </Badge>
                )}
                {data.config.restPath && (
                  <Badge size="xs" variant="outline" color="dark">
                    {data.config.restPath}
                  </Badge>
                )}
                {data.config.grpcServiceName && (
                  <Badge size="xs" variant="outline" color="dark">
                    {data.config.grpcServiceName}
                  </Badge>
                )}
              </>
            )}

            {/* Delete button when selected */}
            {selected && data?.onDelete && (
              <Tooltip label="Delete connection">
                <ActionIcon
                  size="xs"
                  color="red"
                  variant="filled"
                  onClick={() => data.onDelete?.(id)}
                  aria-label="Delete this connection"
                >
                  <IconTrash size={10} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const ServiceConnectionEdge = memo(ServiceConnectionEdgeComponent);
