import type { Connection } from '@xyflow/react';
import { useCallback } from 'react';
import { useServiceConnectionActions } from '../../../store/projectStore';
import type { CommunicationType, EntityDesign, ServiceDesign } from '../../../types';
import { defaultServiceConnectionConfig } from '../../../types';

interface UseCanvasConnectionsOptions {
  entities: EntityDesign[];
  services: ServiceDesign[];
  onAddRelation: (sourceId: string, targetId: string) => void;
}

export function useCanvasConnections(options: UseCanvasConnectionsOptions) {
  const { entities, services, onAddRelation } = options;
  const { addServiceConnection } = useServiceConnectionActions();

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
          // Create service connection with default REST type
          addServiceConnection({
            sourceServiceId: connection.source,
            targetServiceId: connection.target,
            communicationType: 'REST' as CommunicationType,
            config: { ...defaultServiceConnectionConfig },
          });
        }
        // Mixed connections (entity to service) are not supported
      }
    },
    [entities, services, onAddRelation, addServiceConnection],
  );

  return {
    onConnect,
  };
}
