import { useDebouncedCallback } from '@mantine/hooks';
import type { Node, NodeChange } from '@xyflow/react';
import { type RefObject, useCallback, useEffect, useRef } from 'react';
import { useEntityStore } from '../../../store/entityStore';
import { useLayoutActions, useServiceActions } from '../../../store/projectStore';
import { useServiceStore } from '../../../store/serviceStore';
import type { EntityDesign, ServiceDesign } from '../../../types';
import { type CanvasView, ENTITY_NODE } from '../../../utils/canvasConstants';
import {
  type PositionUpdate,
  adjustSelectionChanges,
  extractServiceDimensions,
  updateDragState,
} from './dragHelpers';

interface UseNodeDragHandlersOptions {
  canvasView: CanvasView;
  entities: EntityDesign[];
  services: ServiceDesign[];
  selectedEntityId: string | null;
  selectedEntityIds: string[];
  selectedServiceId: string | null;
  isDraggingRef: RefObject<boolean>;
  setNodes: (updater: Node[] | ((nodes: Node[]) => Node[])) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  setDropTargetServiceId: (id: string | null) => void;
}

export function useNodeDragHandlers(options: UseNodeDragHandlersOptions) {
  const {
    canvasView: _canvasView, // Not used after BOTH view removal
    entities,
    services,
    selectedEntityId: _selectedEntityId, // Kept for interface compatibility; fresh value read from store
    selectedEntityIds: _selectedEntityIds, // Kept for interface compatibility
    selectedServiceId: _selectedServiceId, // Kept for interface compatibility; fresh value read from store
    isDraggingRef,
    setNodes: _setNodes, // Kept for interface compatibility
    onNodesChange,
    setDropTargetServiceId,
  } = options;

  const { updateService } = useServiceActions();
  const { updateEntityPositions, updateServicePositions } = useLayoutActions();

  // Collect position changes during drag
  const pendingPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Track previous service positions to calculate movement delta during drag
  const previousServicePositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Track whether a drag is in progress to avoid overwriting positions during drag
  const isDragInProgress = useRef(false);

  // Sync previousServicePositions with store positions when not dragging
  // This ensures deltas are calculated correctly after external position changes (e.g., auto-layout)
  useEffect(() => {
    // Don't update during drag - we're tracking movement delta
    if (isDragInProgress.current) {
      return;
    }

    const currentServiceIds = new Set(services.map((s) => s.id));

    // Remove positions for deleted services (prevents memory leak)
    for (const id of previousServicePositions.current.keys()) {
      if (!currentServiceIds.has(id)) {
        previousServicePositions.current.delete(id);
      }
    }

    // Update all service positions from store
    for (const service of services) {
      previousServicePositions.current.set(service.id, { ...service.position });
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
  // Refactored to use helper functions for clarity and testability
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Track drag state
      updateDragState(changes, isDraggingRef, isDragInProgress);

      // Collect position updates
      const entityPositions: PositionUpdate[] = [];
      const servicePositions: PositionUpdate[] = [];

      // Process position changes
      for (const change of changes) {
        if (change.type !== 'position' || !change.position) continue;

        pendingPositions.current.set(change.id, change.position);

        const isEntity = entities.some((e) => e.id === change.id);
        const service = services.find((s) => s.id === change.id);

        if (isEntity) {
          // Entity positions are always absolute (no parent-child relationship)
          entityPositions.push({ id: change.id, position: change.position });
        } else if (service) {
          servicePositions.push({ id: change.id, position: change.position });
        }
      }

      // Extract dimension changes from resize operations
      const serviceDimensions = extractServiceDimensions(changes, services);

      // Adjust selection changes to prevent unwanted deselection
      const entityState = useEntityStore.getState();
      const serviceState = useServiceStore.getState();

      const adjustedChanges = adjustSelectionChanges(
        changes,
        entityState.selectedEntityId,
        entityState.selectedEntityIds,
        serviceState.selectedServiceId,
        services,
      );

      // Apply the adjusted changes to ReactFlow
      onNodesChange(adjustedChanges);

      // Debounce store updates
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
      entities,
      services,
      isDraggingRef,
      debouncedEntityPositionUpdate,
      debouncedServicePositionUpdate,
      debouncedServiceDimensionsUpdate,
    ],
  );

  // Handle entity drag - no-op now that BOTH view is removed
  const handleNodeDrag = useCallback((_event: React.MouseEvent, _node: Node) => {
    // No-op - drag-to-assign was only available in BOTH view which has been removed
  }, []);

  // Handle entity drag stop - just mark drag as ended
  // Service assignment is now done via context menu instead of drag-and-drop
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node) => {
      // Mark drag as ended
      isDraggingRef.current = false;
      isDragInProgress.current = false;

      // Clear drop target visual feedback
      setDropTargetServiceId(null);
    },
    [isDraggingRef, setDropTargetServiceId],
  );

  return {
    handleNodesChange,
    handleNodeDrag,
    handleNodeDragStop,
    findServiceAtPosition,
  };
}
