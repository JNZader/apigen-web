// ============================================================================
// Store Index - Re-exports all stores and hooks
// ============================================================================

// Individual stores
export { useCanvasUIStore } from './canvasUIStore';
export { useEntityStore } from './entityStore';
export { useHistoryStore } from './historyStore';
export { useLayoutStore } from './layoutStore';
// Combined store facade (for backward compatibility)
export { useProjectStore, useProjectStoreInternal } from './projectStore';
export { useRelationStore } from './relationStore';
export { useServiceConnectionStore } from './serviceConnectionStore';
export { useServiceStore } from './serviceStore';

// ============================================================================
// Types
// ============================================================================

export type { CanvasView, LayoutPreset } from './layoutStore';

// ============================================================================
// Entity Store Exports
// ============================================================================

export {
  // Atomic selectors
  useEntities,
  // Action selectors
  useEntityActions,
  useEntityById,
  useEntityCount,
  useFieldActions,
  useSelectedEntity,
  useSelectedEntityId,
  useSelectedEntityIds,
} from './entityStore';

// ============================================================================
// Relation Store Exports
// ============================================================================

export {
  // Action selectors
  useRelationActions,
  useRelationCount,
  // Atomic selectors
  useRelations,
} from './relationStore';

// ============================================================================
// Service Store Exports
// ============================================================================

export {
  useEntitiesForService,
  useSelectedService,
  useSelectedServiceId,
  // Action selectors
  useServiceActions,
  useServiceById,
  useServiceCount,
  // Atomic selectors
  useServices,
} from './serviceStore';

// ============================================================================
// Service Connection Store Exports
// ============================================================================

export {
  // Action selectors
  useServiceConnectionActions,
  // Atomic selectors
  useServiceConnections,
} from './serviceConnectionStore';

// ============================================================================
// Layout Store Exports
// ============================================================================

export {
  // Atomic selectors
  useCanvasView,
  // Action selectors
  useCanvasViewActions,
  useLayoutActions,
  useLayoutPreference,
  useNeedsAutoLayout,
} from './layoutStore';

// ============================================================================
// Project Store Exports
// ============================================================================

export {
  useAllConfigActions,
  useFeaturePackActions,
  useFeaturePackConfig,
  useFeatures,
  useGoChiOptions,
  useLanguageOptionsActions,
  // Atomic selectors
  useProject,
  // Action selectors
  useProjectActions,
  useRustOptions,
  useTargetConfig,
  useTargetConfigActions,
} from './projectStore';

// ============================================================================
// History Store Exports
// ============================================================================

export {
  useCanRedo,
  useCanUndo,
  useHistoryActions,
} from './historyStore';

// ============================================================================
// Canvas UI Store Exports
// ============================================================================

export {
  useCanvasUIActions,
  useIsEntityExpanded,
} from './canvasUIStore';
