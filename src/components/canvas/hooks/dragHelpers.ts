import type { MutableRefObject } from 'react';
import type { NodeChange, NodePositionChange } from '@xyflow/react';
import type { EntityDesign, ServiceDesign } from '../../../types';

// ============================================================================
// Helper Types
// ============================================================================

export interface PositionUpdate {
  id: string;
  position: { x: number; y: number };
}

export interface DimensionUpdate {
  id: string;
  width: number;
  height: number;
}

// ============================================================================
// Helper Functions - Extracted for clarity and testability
// ============================================================================

/**
 * Updates drag state refs based on position changes in the node changes array
 */
export function updateDragState(
  changes: NodeChange[],
  isDraggingRef: MutableRefObject<boolean>,
  isDragInProgress: MutableRefObject<boolean>,
): void {
  for (const change of changes) {
    if (change.type === 'position') {
      if (change.dragging === true) {
        isDraggingRef.current = true;
        isDragInProgress.current = true;
      }
    }
  }
}

/**
 * Calculates absolute position for an entity that might be inside a service
 */
export function calculateAbsoluteEntityPosition(
  change: NodePositionChange,
  parentService: ServiceDesign | undefined,
): { x: number; y: number } {
  if (!change.position) {
    return { x: 0, y: 0 };
  }

  if (!parentService) {
    return change.position;
  }

  // Convert relative position (inside service) to absolute position (for store)
  return {
    x: parentService.position.x + change.position.x,
    y: parentService.position.y + change.position.y,
  };
}

/**
 * Calculates position updates for entities inside a service when the service moves
 */
export function calculateChildEntityPositions(
  service: ServiceDesign,
  newServicePosition: { x: number; y: number },
  previousPosition: { x: number; y: number },
  entities: EntityDesign[],
): PositionUpdate[] {
  const deltaX = newServicePosition.x - previousPosition.x;
  const deltaY = newServicePosition.y - previousPosition.y;
  const updates: PositionUpdate[] = [];

  for (const entityId of service.entityIds) {
    const entity = entities.find((e) => e.id === entityId);
    if (entity) {
      updates.push({
        id: entityId,
        position: {
          x: entity.position.x + deltaX,
          y: entity.position.y + deltaY,
        },
      });
    }
  }

  return updates;
}

/**
 * Extracts dimension changes from service resize operations
 */
export function extractServiceDimensions(
  changes: NodeChange[],
  services: ServiceDesign[],
): DimensionUpdate[] {
  const dimensions: DimensionUpdate[] = [];

  for (const change of changes) {
    if (change.type === 'dimensions' && change.dimensions) {
      const isService = services.some((s) => s.id === change.id);
      if (
        isService &&
        change.dimensions.width !== undefined &&
        change.dimensions.height !== undefined
      ) {
        dimensions.push({
          id: change.id,
          width: change.dimensions.width,
          height: change.dimensions.height,
        });
      }
    }
  }

  return dimensions;
}

/**
 * Adjusts selection changes to prevent deselecting nodes that should stay selected
 */
export function adjustSelectionChanges(
  changes: NodeChange[],
  currentSelectedEntityId: string | null,
  currentSelectedEntityIds: string[],
  currentSelectedServiceId: string | null,
  services: ServiceDesign[],
): NodeChange[] {
  return changes.map((change) => {
    if (change.type !== 'select') {
      return change;
    }

    // If ReactFlow wants to SELECT, allow it
    if (change.selected) {
      return change;
    }

    // ReactFlow wants to DESELECT - only allow if not in our store's selection
    const isService = services.some((s) => s.id === change.id);

    if (isService) {
      const shouldStaySelected = currentSelectedServiceId === change.id;
      return shouldStaySelected ? { ...change, selected: true } : change;
    }

    // For entities, check both single and multi selection
    const shouldStaySelected =
      currentSelectedEntityId === change.id ||
      currentSelectedEntityIds.includes(change.id);

    return shouldStaySelected ? { ...change, selected: true } : change;
  });
}
