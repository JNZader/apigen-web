import type { NodeChange, NodePositionChange } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import type { EntityDesign, ServiceDesign } from '../../../types';
import {
  adjustSelectionChanges,
  calculateAbsoluteEntityPosition,
  calculateChildEntityPositions,
  extractServiceDimensions,
  updateDragState,
} from './dragHelpers';

// ============================================================================
// Test Fixtures
// ============================================================================

const createMockService = (overrides: Partial<ServiceDesign> = {}): ServiceDesign => ({
  id: 'service-1',
  name: 'TestService',
  color: '#228be6',
  position: { x: 100, y: 100 },
  width: 400,
  height: 300,
  entityIds: [],
  config: {
    port: 8080,
    contextPath: '/api',
    databaseType: 'postgresql',
    generateDocker: true,
    generateDockerCompose: true,
    enableServiceDiscovery: false,
    serviceDiscoveryType: 'NONE',
    enableCircuitBreaker: true,
    enableRateLimiting: true,
    enableTracing: true,
    enableMetrics: true,
  },
  ...overrides,
});

const createMockEntity = (overrides: Partial<EntityDesign> = {}): EntityDesign => ({
  id: 'entity-1',
  name: 'TestEntity',
  tableName: 'test_entity',
  position: { x: 150, y: 150 },
  fields: [],
  config: {
    generateController: true,
    generateService: true,
    enableCaching: false,
  },
  ...overrides,
});

// ============================================================================
// updateDragState Tests
// ============================================================================

describe('updateDragState', () => {
  it('should set dragging to true when position change has dragging=true', () => {
    const isDraggingRef = { current: false };
    const isDragInProgress = { current: false };

    const changes: NodeChange[] = [
      { type: 'position', id: 'node-1', dragging: true, position: { x: 0, y: 0 } },
    ];

    updateDragState(changes, isDraggingRef, isDragInProgress);

    expect(isDraggingRef.current).toBe(true);
    expect(isDragInProgress.current).toBe(true);
  });

  it('should not change refs when no position changes', () => {
    const isDraggingRef = { current: false };
    const isDragInProgress = { current: false };

    const changes: NodeChange[] = [
      { type: 'select', id: 'node-1', selected: true },
    ];

    updateDragState(changes, isDraggingRef, isDragInProgress);

    expect(isDraggingRef.current).toBe(false);
    expect(isDragInProgress.current).toBe(false);
  });

  it('should not change refs when dragging is false', () => {
    const isDraggingRef = { current: false };
    const isDragInProgress = { current: false };

    const changes: NodeChange[] = [
      { type: 'position', id: 'node-1', dragging: false },
    ];

    updateDragState(changes, isDraggingRef, isDragInProgress);

    expect(isDraggingRef.current).toBe(false);
    expect(isDragInProgress.current).toBe(false);
  });
});

// ============================================================================
// calculateAbsoluteEntityPosition Tests
// ============================================================================

describe('calculateAbsoluteEntityPosition', () => {
  it('should return position as-is when no parent service', () => {
    const change: NodePositionChange = {
      type: 'position',
      id: 'entity-1',
      position: { x: 50, y: 75 },
    };

    const result = calculateAbsoluteEntityPosition(change, undefined);

    expect(result).toEqual({ x: 50, y: 75 });
  });

  it('should calculate absolute position when inside a service', () => {
    const change: NodePositionChange = {
      type: 'position',
      id: 'entity-1',
      position: { x: 50, y: 75 }, // Relative position inside service
    };

    const parentService = createMockService({
      position: { x: 100, y: 200 },
    });

    const result = calculateAbsoluteEntityPosition(change, parentService);

    // Absolute = parent.position + relative.position
    expect(result).toEqual({ x: 150, y: 275 });
  });

  it('should return {0,0} when position is undefined', () => {
    const change: NodePositionChange = {
      type: 'position',
      id: 'entity-1',
      // position is undefined
    };

    const result = calculateAbsoluteEntityPosition(change, undefined);

    expect(result).toEqual({ x: 0, y: 0 });
  });
});

// ============================================================================
// calculateChildEntityPositions Tests
// ============================================================================

describe('calculateChildEntityPositions', () => {
  it('should calculate position updates for child entities when service moves', () => {
    const service = createMockService({
      id: 'service-1',
      entityIds: ['entity-1', 'entity-2'],
    });

    const entities: EntityDesign[] = [
      createMockEntity({ id: 'entity-1', position: { x: 150, y: 150 } }),
      createMockEntity({ id: 'entity-2', position: { x: 200, y: 200 } }),
    ];

    const newServicePosition = { x: 150, y: 150 }; // Moved +50, +50
    const previousPosition = { x: 100, y: 100 };

    const result = calculateChildEntityPositions(
      service,
      newServicePosition,
      previousPosition,
      entities,
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'entity-1', position: { x: 200, y: 200 } });
    expect(result[1]).toEqual({ id: 'entity-2', position: { x: 250, y: 250 } });
  });

  it('should return empty array when service has no entities', () => {
    const service = createMockService({
      entityIds: [],
    });

    const result = calculateChildEntityPositions(
      service,
      { x: 150, y: 150 },
      { x: 100, y: 100 },
      [],
    );

    expect(result).toHaveLength(0);
  });

  it('should skip entities that do not exist in the entities array', () => {
    const service = createMockService({
      entityIds: ['entity-1', 'entity-missing'],
    });

    const entities: EntityDesign[] = [
      createMockEntity({ id: 'entity-1', position: { x: 150, y: 150 } }),
    ];

    const result = calculateChildEntityPositions(
      service,
      { x: 110, y: 110 },
      { x: 100, y: 100 },
      entities,
    );

    // Only entity-1 should be updated
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('entity-1');
  });

  it('should handle negative deltas (moving service backwards)', () => {
    const service = createMockService({
      entityIds: ['entity-1'],
    });

    const entities: EntityDesign[] = [
      createMockEntity({ id: 'entity-1', position: { x: 200, y: 200 } }),
    ];

    const result = calculateChildEntityPositions(
      service,
      { x: 50, y: 50 }, // Moved -50, -50
      { x: 100, y: 100 },
      entities,
    );

    expect(result[0]).toEqual({ id: 'entity-1', position: { x: 150, y: 150 } });
  });
});

// ============================================================================
// extractServiceDimensions Tests
// ============================================================================

describe('extractServiceDimensions', () => {
  it('should extract dimensions from service resize changes', () => {
    const services = [createMockService({ id: 'service-1' })];

    const changes: NodeChange[] = [
      {
        type: 'dimensions',
        id: 'service-1',
        dimensions: { width: 500, height: 400 },
        resizing: false,
      },
    ];

    const result = extractServiceDimensions(changes, services);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: 'service-1', width: 500, height: 400 });
  });

  it('should ignore dimension changes for non-service nodes', () => {
    const services = [createMockService({ id: 'service-1' })];

    const changes: NodeChange[] = [
      {
        type: 'dimensions',
        id: 'entity-1', // Not a service
        dimensions: { width: 200, height: 150 },
        resizing: false,
      },
    ];

    const result = extractServiceDimensions(changes, services);

    expect(result).toHaveLength(0);
  });

  it('should ignore changes without dimensions', () => {
    const services = [createMockService({ id: 'service-1' })];

    const changes: NodeChange[] = [
      {
        type: 'dimensions',
        id: 'service-1',
        resizing: true,
        // dimensions is undefined during resize start
      },
    ];

    const result = extractServiceDimensions(changes, services);

    expect(result).toHaveLength(0);
  });

  it('should handle multiple dimension changes', () => {
    const services = [
      createMockService({ id: 'service-1' }),
      createMockService({ id: 'service-2' }),
    ];

    const changes: NodeChange[] = [
      {
        type: 'dimensions',
        id: 'service-1',
        dimensions: { width: 500, height: 400 },
        resizing: false,
      },
      {
        type: 'dimensions',
        id: 'service-2',
        dimensions: { width: 600, height: 500 },
        resizing: false,
      },
    ];

    const result = extractServiceDimensions(changes, services);

    expect(result).toHaveLength(2);
  });
});

// ============================================================================
// adjustSelectionChanges Tests
// ============================================================================

describe('adjustSelectionChanges', () => {
  const services = [createMockService({ id: 'service-1' })];

  it('should allow select changes to pass through', () => {
    const changes: NodeChange[] = [
      { type: 'select', id: 'entity-1', selected: true },
    ];

    const result = adjustSelectionChanges(changes, null, [], null, services);

    expect(result[0]).toEqual({ type: 'select', id: 'entity-1', selected: true });
  });

  it('should prevent deselection of currently selected entity', () => {
    const changes: NodeChange[] = [
      { type: 'select', id: 'entity-1', selected: false },
    ];

    const result = adjustSelectionChanges(
      changes,
      'entity-1', // Currently selected
      [],
      null,
      services,
    );

    expect(result[0]).toEqual({ type: 'select', id: 'entity-1', selected: true });
  });

  it('should prevent deselection of entity in multi-selection', () => {
    const changes: NodeChange[] = [
      { type: 'select', id: 'entity-2', selected: false },
    ];

    const result = adjustSelectionChanges(
      changes,
      null,
      ['entity-1', 'entity-2'], // Multi-selected
      null,
      services,
    );

    expect(result[0]).toEqual({ type: 'select', id: 'entity-2', selected: true });
  });

  it('should prevent deselection of currently selected service', () => {
    const changes: NodeChange[] = [
      { type: 'select', id: 'service-1', selected: false },
    ];

    const result = adjustSelectionChanges(
      changes,
      null,
      [],
      'service-1', // Currently selected
      services,
    );

    expect(result[0]).toEqual({ type: 'select', id: 'service-1', selected: true });
  });

  it('should allow deselection of non-selected nodes', () => {
    const changes: NodeChange[] = [
      { type: 'select', id: 'entity-2', selected: false },
    ];

    const result = adjustSelectionChanges(
      changes,
      'entity-1', // Different entity selected
      [],
      null,
      services,
    );

    expect(result[0]).toEqual({ type: 'select', id: 'entity-2', selected: false });
  });

  it('should pass through non-select changes unchanged', () => {
    const changes: NodeChange[] = [
      { type: 'position', id: 'entity-1', position: { x: 100, y: 100 } },
    ];

    const result = adjustSelectionChanges(changes, null, [], null, services);

    expect(result[0]).toEqual(changes[0]);
  });
});
