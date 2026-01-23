/**
 * Store Reset Utilities for Testing
 *
 * This module provides utilities for resetting Zustand stores between tests.
 * Use these in beforeEach hooks to ensure test isolation.
 */

import { useCanvasUIStore } from '../../store/canvasUIStore';
import { useEntityStore } from '../../store/entityStore';
import { useHistoryStore } from '../../store/historyStore';
import { useLayoutStore } from '../../store/layoutStore';
import { useProjectStoreInternal } from '../../store/projectStore';
import { useRelationStore } from '../../store/relationStore';
import { useServiceConnectionStore } from '../../store/serviceConnectionStore';
import { useServiceStore } from '../../store/serviceStore';
import { defaultProjectConfig } from '../../types';
import { CANVAS_VIEWS } from '../../utils/canvasConstants';

/**
 * Resets all Zustand stores to their initial state.
 * Call this in beforeEach to ensure test isolation.
 *
 * @example
 * ```ts
 * import { resetAllStores } from '@/test/utils/storeReset';
 *
 * describe('MyComponent', () => {
 *   beforeEach(() => {
 *     resetAllStores();
 *   });
 *
 *   it('should work', () => {
 *     // Test with clean store state
 *   });
 * });
 * ```
 */
export function resetAllStores(): void {
  // Reset entity store
  useEntityStore.setState({
    entities: [],
    selectedEntityId: null,
    selectedEntityIds: [],
  });

  // Reset relation store
  useRelationStore.setState({
    relations: [],
  });

  // Reset service store
  useServiceStore.setState({
    services: [],
    selectedServiceId: null,
  });

  // Reset service connection store
  useServiceConnectionStore.setState({
    serviceConnections: [],
  });

  // Reset layout store
  useLayoutStore.setState({
    canvasView: CANVAS_VIEWS.ENTITIES,
    layoutPreference: 'compact',
    needsAutoLayout: false,
    entityServiceFilter: 'all',
  });

  // Reset canvas UI store
  useCanvasUIStore.setState({
    expandedEntityIds: new Set(),
  });

  // Reset project store
  useProjectStoreInternal.setState({
    project: defaultProjectConfig,
  });

  // Reset history store
  useHistoryStore.setState({
    past: [],
    future: [],
  });
}

/**
 * Resets only the entity store.
 */
export function resetEntityStore(): void {
  useEntityStore.setState({
    entities: [],
    selectedEntityId: null,
    selectedEntityIds: [],
  });
}

/**
 * Resets only the relation store.
 */
export function resetRelationStore(): void {
  useRelationStore.setState({
    relations: [],
  });
}

/**
 * Resets only the service stores (services and connections).
 */
export function resetServiceStores(): void {
  useServiceStore.setState({
    services: [],
    selectedServiceId: null,
  });
  useServiceConnectionStore.setState({
    serviceConnections: [],
  });
}

/**
 * Resets only the layout and canvas UI stores.
 */
export function resetCanvasStores(): void {
  useLayoutStore.setState({
    canvasView: CANVAS_VIEWS.ENTITIES,
    layoutPreference: 'compact',
    needsAutoLayout: false,
    entityServiceFilter: 'all',
  });
  useCanvasUIStore.setState({
    expandedEntityIds: new Set(),
  });
}

/**
 * Resets the history store, clearing undo/redo state.
 */
export function resetHistoryStore(): void {
  useHistoryStore.setState({
    past: [],
    future: [],
  });
}
