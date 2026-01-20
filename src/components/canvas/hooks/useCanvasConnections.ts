import type { Connection } from '@xyflow/react';
import { useCallback } from 'react';
import type { EntityDesign, ServiceDesign } from '../../../types';

interface PendingServiceConnection {
  sourceServiceId: string;
  targetServiceId: string;
}

interface UseCanvasConnectionsOptions {
  entities: EntityDesign[];
  services: ServiceDesign[];
  onAddRelation: (sourceId: string, targetId: string) => void;
  onPendingServiceConnection?: (pending: PendingServiceConnection) => void;
}

export function useCanvasConnections(options: UseCanvasConnectionsOptions) {
  const { entities, services, onAddRelation, onPendingServiceConnection } = options;

  // Handle new connections (creating relations or service connections)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target && connection.source !== connection.target) {
        // Determine if this is an entity or service connection
        const sourceIsEntity = entities.some((e) => e.id === connection.source);
        const targetIsEntity = entities.some((e) => e.id === connection.target);
        const sourceIsService = services.some((s) => s.id === connection.source);
        const targetIsService = services.some((s) => s.id === connection.target);

        if (sourceIsEntity && targetIsEntity) {
          // Create entity relation
          onAddRelation(connection.source, connection.target);
        } else if (sourceIsService && targetIsService) {
          // Instead of auto-creating REST, open the form for user to choose type
          if (onPendingServiceConnection) {
            onPendingServiceConnection({
              sourceServiceId: connection.source,
              targetServiceId: connection.target,
            });
          }
        }
        // Mixed connections (entity to service) are not supported
      }
    },
    [entities, services, onAddRelation, onPendingServiceConnection],
  );

  return {
    onConnect,
  };
}
