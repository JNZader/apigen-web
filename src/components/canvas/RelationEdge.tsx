import { ActionIcon, Badge, Group, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { Edge, EdgeProps } from '@xyflow/react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { memo } from 'react';
import type { RelationType } from '../../types/relation';

export interface RelationEdgeData extends Record<string, unknown> {
  type: RelationType;
  label?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export type RelationEdgeType = Edge<RelationEdgeData, 'relation'>;

const RELATION_LABELS: Record<RelationType, string> = {
  OneToOne: '1:1',
  OneToMany: '1:N',
  ManyToOne: 'N:1',
  ManyToMany: 'N:N',
};

const RELATION_COLORS: Record<RelationType, string> = {
  OneToOne: 'grape',
  OneToMany: 'blue',
  ManyToOne: 'teal',
  ManyToMany: 'orange',
};

function RelationEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<RelationEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relationType: RelationType = data?.type || 'ManyToOne';
  const color = selected ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-5)';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
        }}
      />
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
              color={RELATION_COLORS[relationType]}
              variant={selected ? 'filled' : 'light'}
              style={{ cursor: 'pointer' }}
            >
              {RELATION_LABELS[relationType]}
            </Badge>
            {selected && data?.onDelete && (
              <Tooltip label="Delete relation">
                <ActionIcon
                  size="xs"
                  color="red"
                  variant="filled"
                  onClick={() => data.onDelete?.(id)}
                  aria-label="Delete this relation"
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

export const RelationEdge = memo(RelationEdgeComponent);
