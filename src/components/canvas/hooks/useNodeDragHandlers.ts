import { useDebouncedCallback, useThrottledCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import type { Node, NodeChange } from '@xyflow/react';
import { type MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { useLayoutActions, useServiceActions } from '../../../store/projectStore';
import type { EntityDesign, ServiceDesign } from '../../../types';
import { CANVAS_VIEWS, type CanvasView, ENTITY_NODE } from '../../../utils/canvasConstants';

interface UseNodeDragHandlersOptions {
  canvasView: CanvasView;
  entities: EntityDesign[];
  services: ServiceDesign[];
  isDraggingRef: MutableRefObject<boolean>;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  setDropTargetServiceId: (id: string | null) => void;
}

export function useNodeDragHandlers(options: UseNodeDragHandlersOptions) {
  const {
    canvasView,
    entities,
    services,
    isDraggingRef,
    setNodes,
    onNodesChange,
    setDropTargetServiceId,
  } = options;

  const { updateService, assignEntityToService, removeEntityFromService } = useServiceActions();
  const { updateEntityPositions, updateServicePositions } = useLayoutActions();

  // Collect position changes during drag
  const pendingPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Track previous service positions to calculate movement delta
  const previousServicePositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Initialize previousServicePositions with current service positions
  // This prevents race condition where first drag uses potentially stale store positions
  useEffect(() => {
    for (const service of services) {
      if (!previousServicePositions.current.has(service.id)) {
        previousServicePositions.current.set(service.id, service.position);
      }
    }
  }, [services]);

  // Check if a position is inside a service's bounds
  // Uses the center of the entity node for more intuitive detection
  const findServiceAtPosition = useCallback(
    (position: { x: number; y: number }): ServiceDesign | null => {
      // Calculate the center of the entity node
      const centerX = position.x + ENTITY_NODE.WIDTH / 2;
      const centerY = position.y + ENTITY_NODE.MIN_HEIGHT / 2;

      for (const service of services) {
        const isInside =
          centerX >= service.position.x &&
          centerX <= service.position.x + service.width &&
          centerY >= service.position.y &&
          centerY <= service.position.y + service.height;
        if (isInside) {
          return service;
        }
      }
      return null;
    },
    [services],
  );

  // Debounced position update to avoid excessive store updates during drag
  // Uses batch update pattern to update all positions in a single store operation
  const debouncedEntityPositionUpdate = useDebouncedCallback(
    (positions: Array<{ id: string; position: { x: number; y: number } }>) => {
      const positionMap = new Map(positions.map(({ id, position }) => [id, position]));
      updateEntityPositions(positionMap);
    },
    100,
  );

  const debouncedServicePositionUpdate = useDebouncedCallback(
    (positions: Array<{ id: string; position: { x: number; y: number } }>) => {
      const positionMap = new Map(positions.map(({ id, position }) => [id, position]));
      updateServicePositions(positionMap);
    },
    100,
  );

  // Debounced callback to update service dimensions after resize
  // Uses batch update pattern to update all dimensions in a single operation
  const debouncedServiceDimensionsUpdate = useDebouncedCallback(
    (dimensions: Array<{ id: string; width: number; height: number }>) => {
      for (const { id, width, height } of dimensions) {
        updateService(id, { width, height });
      }
    },
    100,
  );

  // Cleanup debounced callbacks on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      debouncedEntityPositionUpdate.cancel();
      debouncedServicePositionUpdate.cancel();
      debouncedServiceDimensionsUpdate.cancel();
    };
  }, [
    debouncedEntityPositionUpdate,
    debouncedServicePositionUpdate,
    debouncedServiceDimensionsUpdate,
  ]);

  // Handle node position changes with debouncing
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Collect position changes
      const entityPositions: Array<{ id: string; position: { x: number; y: number } }> = [];
      const servicePositions: Array<{ id: string; position: { x: number; y: number } }> = [];
      const serviceDimensions: Array<{ id: string; width: number; height: number }> = [];
      const additionalEntityMoves: Array<{ id: string; position: { x: number; y: number } }> = [];

      // Check if any change is a drag start or drag end
      for (const change of changes) {
        if (change.type === 'position') {
          if (change.dragging === true) {
            isDraggingRef.current = true;
          } else if (change.dragging === false) {
            // Drag ended - will be handled in handleNodeDragStop
          }
        }
      }

      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          pendingPositions.current.set(change.id, change.position);

          // Determine if this is an entity or service
          const isEntity = entities.some((e) => e.id === change.id);
          const service = services.find((s) => s.id === change.id);

          if (isEntity) {
            entityPositions.push({ id: change.id, position: change.position });
          } else if (service) {
            servicePositions.push({ id: change.id, position: change.position });

            // When a service moves in 'both' view, move its assigned entities too
            if (canvasView === CANVAS_VIEWS.BOTH && service.entityIds.length > 0) {
              const prevPos = previousServicePositions.current.get(service.id) || service.position;
              const deltaX = change.position.x - prevPos.x;
              const deltaY = change.position.y - prevPos.y;

              // Move all entities assigned to this service
              for (const entityId of service.entityIds) {
                const entity = entities.find((e) => e.id === entityId);
                if (entity) {
                  const currentEntityPos =
                    pendingPositions.current.get(entityId) || entity.position;
                  const newEntityPos = {
                    x: currentEntityPos.x + deltaX,
                    y: currentEntityPos.y + deltaY,
                  };
                  pendingPositions.current.set(entityId, newEntityPos);
                  additionalEntityMoves.push({ id: entityId, position: newEntityPos });
                }
              }
            }

            // Update previous position for next delta calculation
            previousServicePositions.current.set(service.id, change.position);
          }
        }

        // Capture dimension changes (from NodeResizer)
        if (change.type === 'dimensions' && change.dimensions) {
          const isService = services.some((s) => s.id === change.id);
          if (
            isService &&
            change.dimensions.width !== undefined &&
            change.dimensions.height !== undefined
          ) {
            serviceDimensions.push({
              id: change.id,
              width: change.dimensions.width,
              height: change.dimensions.height,
            });
          }
        }
      }

      // Apply the original changes
      onNodesChange(changes);

      // If we have additional entity moves from service dragging, update those nodes too
      if (additionalEntityMoves.length > 0) {
        setNodes((currentNodes) =>
          currentNodes.map((node) => {
            const move = additionalEntityMoves.find((m) => m.id === node.id);
            if (move) {
              return { ...node, position: move.position };
            }
            return node;
          }),
        );
        // Also update the store
        debouncedEntityPositionUpdate(additionalEntityMoves);
      }

      // Debounce the store updates
      if (entityPositions.length > 0) {
        debouncedEntityPositionUpdate(entityPositions);
      }
      if (servicePositions.length > 0) {
        debouncedServicePositionUpdate(servicePositions);
      }
      if (serviceDimensions.length > 0) {
        debouncedServiceDimensionsUpdate(serviceDimensions);
      }
    },
    [
      onNodesChange,
      setNodes,
      entities,
      services,
      canvasView,
      isDraggingRef,
      debouncedEntityPositionUpdate,
      debouncedServicePositionUpdate,
      debouncedServiceDimensionsUpdate,
    ],
  );

  // Throttled drop target update to reduce re-renders during drag (every 50ms)
  const throttledSetDropTarget = useThrottledCallback((serviceId: string | null) => {
    setDropTargetServiceId(serviceId);
  }, 50);

  // Handle entity drag - update drop target for visual feedback (throttled)
  const handleNodeDrag = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Only track drop target in 'both' view for entities
      if (canvasView !== CANVAS_VIEWS.BOTH) return;

      const isEntity = entities.some((e) => e.id === node.id);
      if (!isEntity) {
        throttledSetDropTarget(null);
        return;
      }

      const targetService = findServiceAtPosition(node.position);
      throttledSetDropTarget(targetService?.id ?? null);
    },
    [canvasView, entities, findServiceAtPosition, throttledSetDropTarget],
  );

  // Handle entity drag stop - check if dropped inside a service
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Mark drag as ended
      isDraggingRef.current = false;

      // Clear drop target visual feedback
      setDropTargetServiceId(null);

      // Clear previous positions tracking
      previousServicePositions.current.clear();

      // Only check for entity-to-service assignment in 'both' view
      if (canvasView !== CANVAS_VIEWS.BOTH) return;

      // Check if the dragged node is an entity
      const isEntity = entities.some((e) => e.id === node.id);
      if (!isEntity) return;

      const entityPosition = node.position;
      const targetService = findServiceAtPosition(entityPosition);

      if (targetService) {
        // Check if entity is already in this service
        if (!targetService.entityIds.includes(node.id)) {
          assignEntityToService(node.id, targetService.id);
          notifications.show({
            title: 'Entity assigned',
            message: `Entity added to ${targetService.name}`,
            color: 'green',
          });
        }
      } else {
        // Entity was dragged outside all services - remove from any service
        const currentService = services.find((s) => s.entityIds.includes(node.id));
        if (currentService) {
          removeEntityFromService(node.id, currentService.id);
          notifications.show({
            title: 'Entity removed',
            message: `Entity removed from ${currentService.name}`,
            color: 'blue',
          });
        }
      }
    },
    [
      canvasView,
      entities,
      services,
      isDraggingRef,
      setDropTargetServiceId,
      findServiceAtPosition,
      assignEntityToService,
      removeEntityFromService,
    ],
  );

  return {
    handleNodesChange,
    handleNodeDrag,
    handleNodeDragStop,
    findServiceAtPosition,
  };
}
