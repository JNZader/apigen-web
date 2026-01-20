import type { Edge } from '@xyflow/react';
import { useEdgesState } from '@xyflow/react';
import { useCallback, useEffect } from 'react';
import {
  useRelationActions,
  useRelations,
  useServiceConnectionActions,
  useServiceConnections,
} from '../../../store/projectStore';
import { CANVAS_VIEWS, type CanvasView } from '../../../utils/canvasConstants';

interface UseCanvasEdgesOptions {
  canvasView: CanvasView;
  onEditServiceConnection?: (connectionId: string) => void;
}

export function useCanvasEdges(options: UseCanvasEdgesOptions) {
  const { canvasView, onEditServiceConnection } = options;

  const relations = useRelations();
  const serviceConnections = useServiceConnections();
  const { removeRelation } = useRelationActions();
  const { removeServiceConnection } = useServiceConnectionActions();

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Memoized relation delete handler
  const handleRelationDelete = useCallback(
    (id: string) => {
      removeRelation(id);
    },
    [removeRelation],
  );

  // Memoized service connection delete handler
  const handleServiceConnectionDelete = useCallback(
    (id: string) => {
      removeServiceConnection(id);
    },
    [removeServiceConnection],
  );

  // Build relation edges
  const buildRelationEdges = useCallback(() => {
    return relations.map((relation) => ({
      id: relation.id,
      source: relation.sourceEntityId,
      target: relation.targetEntityId,
      type: 'relation' as const,
      data: {
        type: relation.type,
        onDelete: handleRelationDelete,
      },
    }));
  }, [relations, handleRelationDelete]);

  // Build service connection edges
  const buildServiceConnectionEdges = useCallback(() => {
    return serviceConnections.map((connection) => ({
      id: connection.id,
      source: connection.sourceServiceId,
      target: connection.targetServiceId,
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
      type: 'service-connection' as const,
      data: {
        communicationType: connection.communicationType,
        label: connection.label,
        config: connection.config,
        onEdit: onEditServiceConnection,
        onDelete: handleServiceConnectionDelete,
      },
    }));
  }, [serviceConnections, onEditServiceConnection, handleServiceConnectionDelete]);

  // Sync edges based on canvas view
  useEffect(() => {
    if (canvasView === CANVAS_VIEWS.ENTITIES) {
      setEdges(buildRelationEdges());
    } else if (canvasView === CANVAS_VIEWS.SERVICES) {
      setEdges(buildServiceConnectionEdges());
    } else {
      // Both view - show both relations and service connections
      setEdges([...buildRelationEdges(), ...buildServiceConnectionEdges()]);
    }
  }, [canvasView, buildRelationEdges, buildServiceConnectionEdges, setEdges]);

  return {
    edges,
    setEdges,
    onEdgesChange,
    relations,
    serviceConnections,
  };
}
