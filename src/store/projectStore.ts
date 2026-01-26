import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import {
  defaultProjectConfig,
  type EntityDesign,
  type FeaturePackConfig,
  type FieldDesign,
  type GoChiOptions,
  type ProjectConfig,
  type RustAxumOptions,
  type ServiceConnectionDesign,
  type ServiceDesign,
  type TargetConfig,
} from '../types';
import type { RelationDesign } from '../types/relation';
import { CANVAS_VIEWS } from '../utils/canvasConstants';
import { validateProjectImport } from '../utils/validation';

// Import individual stores for cross-store operations
import { useEntityStore } from './entityStore';
import type { CanvasView, LayoutPreset } from './layoutStore';
import { useLayoutStore } from './layoutStore';
import { useRelationStore } from './relationStore';
import { useRustStore } from './rustSlice';
import { useServiceConnectionStore } from './serviceConnectionStore';
import { useServiceStore } from './serviceStore';

// Re-export types for backward compatibility
export type { CanvasView, LayoutPreset } from './layoutStore';

// ============================================================================
// Helper function for deep merge
// ============================================================================

function deepMerge<T extends object>(defaults: T, overrides: Partial<T> | undefined): T {
  if (!overrides) return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const defaultValue = defaults[key];
    const overrideValue = overrides[key];
    if (overrideValue !== undefined) {
      if (
        typeof defaultValue === 'object' &&
        defaultValue !== null &&
        !Array.isArray(defaultValue) &&
        typeof overrideValue === 'object' &&
        overrideValue !== null &&
        !Array.isArray(overrideValue)
      ) {
        result[key] = deepMerge(defaultValue as object, overrideValue as object) as T[keyof T];
      } else {
        result[key] = overrideValue as T[keyof T];
      }
    }
  }
  return result;
}

// ============================================================================
// Store Interface
// ============================================================================

interface ProjectState {
  // State
  project: ProjectConfig;

  // Actions
  setProject: (project: Partial<ProjectConfig>) => void;
  resetProject: () => void;
  exportProject: () => string;
  importProject: (json: string) => void;

  // Target Config Actions
  setTargetConfig: (config: Partial<TargetConfig>) => void;

  // Feature Pack 2025 Actions
  setFeaturePackConfig: (config: Partial<FeaturePackConfig>) => void;

  // Language-specific Options Actions
  setRustOptions: (options: Partial<RustAxumOptions>) => void;
  setGoChiOptions: (options: Partial<GoChiOptions>) => void;
}

// ============================================================================
// Store
// ============================================================================

export const useProjectStoreInternal = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial state
      project: defaultProjectConfig,

      // Actions
      /**
       * Updates the project configuration with partial updates
       * @param updates - Partial project configuration to merge
       */
      setProject: (updates) =>
        set((state) => ({
          project: { ...state.project, ...updates },
        })),

      /**
       * Updates the target configuration (language, framework, versions)
       * @param config - Partial target configuration to merge
       */
      setTargetConfig: (config) =>
        set((state) => ({
          project: {
            ...state.project,
            targetConfig: { ...state.project.targetConfig, ...config },
          },
        })),

      /**
       * Updates the Feature Pack 2025 configuration
       * @param config - Partial feature pack configuration to merge
       */
      setFeaturePackConfig: (config) =>
        set((state) => ({
          project: {
            ...state.project,
            featurePackConfig: { ...state.project.featurePackConfig, ...config },
          },
        })),

      /**
       * Updates Rust/Axum specific options
       * @param options - Partial Rust options to merge
       */
      setRustOptions: (options) => {
        // Sync with rust slice store
        useRustStore.getState().setOptions(options);
        set((state) => ({
          project: {
            ...state.project,
            rustOptions: { ...state.project.rustOptions, ...options },
          },
        }));
      },

      /**
       * Updates Go/Chi specific options
       * @param options - Partial Go/Chi options to merge
       */
      setGoChiOptions: (options) =>
        set((state) => ({
          project: {
            ...state.project,
            goChiOptions: { ...state.project.goChiOptions, ...options },
          },
        })),

      /**
       * Resets the entire project to default state, clearing all entities, relations, and services
       */
      resetProject: () => {
        // Reset all stores
        useEntityStore.setState({ entities: [], selectedEntityId: null });
        useRelationStore.setState({ relations: [] });
        useServiceStore.setState({ services: [], selectedServiceId: null });
        useServiceConnectionStore.setState({ serviceConnections: [] });
        useLayoutStore.setState({ canvasView: CANVAS_VIEWS.ENTITIES, needsAutoLayout: false });
        useRustStore.getState().reset();
        set({ project: defaultProjectConfig });
      },

      /**
       * Exports the entire project state as a JSON string for persistence
       * @returns JSON string containing project, entities, relations, services, and connections
       */
      exportProject: () => {
        const state = get();
        const entityState = useEntityStore.getState();
        const relationState = useRelationStore.getState();
        const serviceState = useServiceStore.getState();
        const connectionState = useServiceConnectionStore.getState();

        return JSON.stringify(
          {
            project: state.project,
            entities: entityState.entities,
            relations: relationState.relations,
            services: serviceState.services,
            serviceConnections: connectionState.serviceConnections,
          },
          null,
          2,
        );
      },

      importProject: (json) => {
        const data = validateProjectImport(json);

        // Update all stores
        useEntityStore.setState({
          entities: data.entities,
          selectedEntityId: null,
        });
        useRelationStore.setState({ relations: data.relations });
        useServiceStore.setState({
          services: (data as { services?: ServiceDesign[] }).services ?? [],
          selectedServiceId: null,
        });
        useServiceConnectionStore.setState({
          serviceConnections:
            (data as { serviceConnections?: ServiceConnectionDesign[] }).serviceConnections ?? [],
        });
        useLayoutStore.setState({ needsAutoLayout: true });

        set({
          project: deepMerge(
            defaultProjectConfig,
            data.project as unknown as Partial<ProjectConfig>,
          ),
        });
      },
    }),
    {
      name: 'apigen-project',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ProjectState> | undefined;
        if (!persisted) return currentState;

        return {
          ...currentState,
          ...persisted,
          project: deepMerge(defaultProjectConfig, persisted.project),
        };
      },
    },
  ),
);

// ============================================================================
// Combined Store Facade (for backward compatibility)
// ============================================================================

/**
 * Combined store facade that provides access to all project state.
 *
 * ⚠️ PERFORMANCE WARNING: This hook subscribes to ALL stores simultaneously.
 * Using it without a selector will cause re-renders on ANY state change.
 *
 * RECOMMENDED: Use atomic selectors from individual stores instead:
 * - `useEntities()`, `useEntityActions()` from entityStore
 * - `useServices()`, `useServiceActions()` from serviceStore
 * - `useRelations()` from relationStore
 * - `useLayoutState()`, `useLayoutActions()` from layoutStore
 *
 * Use this store ONLY when you need to access multiple domains simultaneously
 * (e.g., exporting the entire project state).
 *
 * @example
 * // ❌ BAD - re-renders on any change
 * const state = useProjectStore((s) => s);
 *
 * // ✅ GOOD - re-renders only when entities change
 * const entities = useEntities();
 *
 * // ✅ GOOD - selective access when needed
 * const { project, exportProject } = useDesignerPageData();
 */
export const useProjectStore = Object.assign(
  // The main hook returns combined state for components that subscribe to everything
  <T>(selector: (state: CombinedProjectState) => T): T => {
    const projectState = useProjectStoreInternal((s) => s);
    const entityState = useEntityStore((s) => s);
    const relationState = useRelationStore((s) => s);
    const serviceState = useServiceStore((s) => s);
    const connectionState = useServiceConnectionStore((s) => s);
    const layoutState = useLayoutStore((s) => s);

    const combined: CombinedProjectState = {
      // Project state
      project: projectState.project,
      setProject: projectState.setProject,
      resetProject: projectState.resetProject,
      exportProject: projectState.exportProject,
      importProject: projectState.importProject,

      // Target Config Actions
      setTargetConfig: projectState.setTargetConfig,

      // Feature Pack 2025 Actions
      setFeaturePackConfig: projectState.setFeaturePackConfig,

      // Language-specific Options Actions
      setRustOptions: projectState.setRustOptions,
      setGoChiOptions: projectState.setGoChiOptions,

      // Entity state
      entities: entityState.entities,
      selectedEntityId: entityState.selectedEntityId,
      addEntity: entityState.addEntity,
      updateEntity: entityState.updateEntity,
      removeEntity: entityState.removeEntity,
      selectEntity: entityState.selectEntity,
      getEntity: entityState.getEntity,
      setEntities: entityState.setEntities,
      addField: entityState.addField,
      updateField: entityState.updateField,
      removeField: entityState.removeField,

      // Relation state
      relations: relationState.relations,
      addRelation: relationState.addRelation,
      updateRelation: relationState.updateRelation,
      removeRelation: relationState.removeRelation,
      setRelations: relationState.setRelations,

      // Service state
      services: serviceState.services,
      selectedServiceId: serviceState.selectedServiceId,
      addService: serviceState.addService,
      updateService: serviceState.updateService,
      removeService: serviceState.removeService,
      selectService: serviceState.selectService,
      assignEntityToService: serviceState.assignEntityToService,
      assignEntitiesToService: serviceState.assignEntitiesToService,
      removeEntityFromService: serviceState.removeEntityFromService,

      // Service connection state
      serviceConnections: connectionState.serviceConnections,
      addServiceConnection: connectionState.addServiceConnection,
      updateServiceConnection: connectionState.updateServiceConnection,
      removeServiceConnection: connectionState.removeServiceConnection,

      // Layout state
      canvasView: layoutState.canvasView,
      layoutPreference: layoutState.layoutPreference,
      needsAutoLayout: layoutState.needsAutoLayout,
      setCanvasView: layoutState.setCanvasView,
      setLayoutPreference: layoutState.setLayoutPreference,
      setNeedsAutoLayout: layoutState.setNeedsAutoLayout,
      updateEntityPositions: layoutState.updateEntityPositions,
      updateServicePositions: layoutState.updateServicePositions,
    };

    return selector(combined);
  },
  {
    // Static getState method for non-reactive access
    getState: (): CombinedProjectState => {
      const projectState = useProjectStoreInternal.getState();
      const entityState = useEntityStore.getState();
      const relationState = useRelationStore.getState();
      const serviceState = useServiceStore.getState();
      const connectionState = useServiceConnectionStore.getState();
      const layoutState = useLayoutStore.getState();

      return {
        // Project state
        project: projectState.project,
        setProject: projectState.setProject,
        resetProject: projectState.resetProject,
        exportProject: projectState.exportProject,
        importProject: projectState.importProject,

        // Target Config Actions
        setTargetConfig: projectState.setTargetConfig,

        // Feature Pack 2025 Actions
        setFeaturePackConfig: projectState.setFeaturePackConfig,

        // Language-specific Options Actions
        setRustOptions: projectState.setRustOptions,
        setGoChiOptions: projectState.setGoChiOptions,

        // Entity state
        entities: entityState.entities,
        selectedEntityId: entityState.selectedEntityId,
        addEntity: entityState.addEntity,
        updateEntity: entityState.updateEntity,
        removeEntity: entityState.removeEntity,
        selectEntity: entityState.selectEntity,
        getEntity: entityState.getEntity,
        setEntities: entityState.setEntities,
        addField: entityState.addField,
        updateField: entityState.updateField,
        removeField: entityState.removeField,

        // Relation state
        relations: relationState.relations,
        addRelation: relationState.addRelation,
        updateRelation: relationState.updateRelation,
        removeRelation: relationState.removeRelation,
        setRelations: relationState.setRelations,

        // Service state
        services: serviceState.services,
        selectedServiceId: serviceState.selectedServiceId,
        addService: serviceState.addService,
        updateService: serviceState.updateService,
        removeService: serviceState.removeService,
        selectService: serviceState.selectService,
        assignEntityToService: serviceState.assignEntityToService,
        assignEntitiesToService: serviceState.assignEntitiesToService,
        removeEntityFromService: serviceState.removeEntityFromService,

        // Service connection state
        serviceConnections: connectionState.serviceConnections,
        addServiceConnection: connectionState.addServiceConnection,
        updateServiceConnection: connectionState.updateServiceConnection,
        removeServiceConnection: connectionState.removeServiceConnection,

        // Layout state
        canvasView: layoutState.canvasView,
        layoutPreference: layoutState.layoutPreference,
        needsAutoLayout: layoutState.needsAutoLayout,
        setCanvasView: layoutState.setCanvasView,
        setLayoutPreference: layoutState.setLayoutPreference,
        setNeedsAutoLayout: layoutState.setNeedsAutoLayout,
        updateEntityPositions: layoutState.updateEntityPositions,
        updateServicePositions: layoutState.updateServicePositions,
      };
    },
    // Static setState for direct state manipulation (used in tests)
    setState: (partial: Partial<CombinedProjectState>) => {
      if (partial.project !== undefined) {
        useProjectStoreInternal.setState({ project: partial.project });
      }
      if (partial.entities !== undefined || partial.selectedEntityId !== undefined) {
        useEntityStore.setState({
          ...(partial.entities !== undefined && { entities: partial.entities }),
          ...(partial.selectedEntityId !== undefined && {
            selectedEntityId: partial.selectedEntityId,
          }),
        });
      }
      if (partial.relations !== undefined) {
        useRelationStore.setState({ relations: partial.relations });
      }
      if (partial.services !== undefined || partial.selectedServiceId !== undefined) {
        useServiceStore.setState({
          ...(partial.services !== undefined && { services: partial.services }),
          ...(partial.selectedServiceId !== undefined && {
            selectedServiceId: partial.selectedServiceId,
          }),
        });
      }
      if (partial.serviceConnections !== undefined) {
        useServiceConnectionStore.setState({ serviceConnections: partial.serviceConnections });
      }
      if (
        partial.canvasView !== undefined ||
        partial.layoutPreference !== undefined ||
        partial.needsAutoLayout !== undefined
      ) {
        useLayoutStore.setState({
          ...(partial.canvasView !== undefined && { canvasView: partial.canvasView }),
          ...(partial.layoutPreference !== undefined && {
            layoutPreference: partial.layoutPreference,
          }),
          ...(partial.needsAutoLayout !== undefined && {
            needsAutoLayout: partial.needsAutoLayout,
          }),
        });
      }
    },
  },
);

// ============================================================================
// Combined State Type (for backward compatibility)
// ============================================================================

interface CombinedProjectState {
  // Project
  project: ProjectConfig;
  setProject: (project: Partial<ProjectConfig>) => void;
  resetProject: () => void;
  exportProject: () => string;
  importProject: (json: string) => void;

  // Target Config Actions
  setTargetConfig: (config: Partial<TargetConfig>) => void;

  // Feature Pack 2025 Actions
  setFeaturePackConfig: (config: Partial<FeaturePackConfig>) => void;

  // Language-specific Options Actions
  setRustOptions: (options: Partial<RustAxumOptions>) => void;
  setGoChiOptions: (options: Partial<GoChiOptions>) => void;

  // Entity
  entities: EntityDesign[];
  selectedEntityId: string | null;
  addEntity: (name: string) => EntityDesign;
  updateEntity: (id: string, updates: Partial<EntityDesign>) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;
  getEntity: (id: string) => EntityDesign | undefined;
  setEntities: (entities: EntityDesign[]) => void;
  addField: (entityId: string, field: Omit<FieldDesign, 'id'>) => void;
  updateField: (entityId: string, fieldId: string, updates: Partial<FieldDesign>) => void;
  removeField: (entityId: string, fieldId: string) => void;

  // Relation
  relations: RelationDesign[];
  addRelation: (relation: Omit<RelationDesign, 'id'>) => void;
  updateRelation: (id: string, updates: Partial<RelationDesign>) => void;
  removeRelation: (id: string) => void;
  setRelations: (relations: RelationDesign[]) => void;

  // Service
  services: ServiceDesign[];
  selectedServiceId: string | null;
  addService: (name: string) => ServiceDesign;
  updateService: (id: string, updates: Partial<ServiceDesign>) => void;
  removeService: (id: string) => void;
  selectService: (id: string | null) => void;
  assignEntityToService: (entityId: string, serviceId: string) => void;
  assignEntitiesToService: (entityIds: string[], serviceId: string) => void;
  removeEntityFromService: (entityId: string, serviceId: string) => void;

  // Service Connection
  serviceConnections: ServiceConnectionDesign[];
  addServiceConnection: (connection: Omit<ServiceConnectionDesign, 'id'>) => void;
  updateServiceConnection: (id: string, updates: Partial<ServiceConnectionDesign>) => void;
  removeServiceConnection: (id: string) => void;

  // Layout
  canvasView: CanvasView;
  layoutPreference: LayoutPreset;
  needsAutoLayout: boolean;
  setCanvasView: (view: CanvasView) => void;
  setLayoutPreference: (preset: LayoutPreset) => void;
  setNeedsAutoLayout: (needs: boolean) => void;
  updateEntityPositions: (positions: Map<string, { x: number; y: number }>) => void;
  updateServicePositions: (positions: Map<string, { x: number; y: number }>) => void;
}

// ============================================================================
// Atomic Selectors (re-exported from individual stores for backward compatibility)
// ============================================================================

// Re-export from entityStore
export {
  useEntities,
  useEntityActions,
  useEntityById,
  useEntityCount,
  useFieldActions,
  useSelectedEntity,
  useSelectedEntityId,
  useSelectedEntityIds,
} from './entityStore';
export type { EntityServiceFilter } from './layoutStore';
// Re-export from layoutStore
export {
  useCanvasView,
  useCanvasViewActions,
  useEntityServiceFilter,
  useLayoutActions,
  useLayoutPreference,
  useNeedsAutoLayout,
} from './layoutStore';
// Re-export from relationStore
export {
  useRelationActions,
  useRelationCount,
  useRelations,
} from './relationStore';

// Re-export from serviceConnectionStore
export {
  useServiceConnectionActions,
  useServiceConnections,
} from './serviceConnectionStore';
// Re-export from serviceStore
export {
  useEntitiesForService,
  useSelectedService,
  useSelectedServiceId,
  useServiceActions,
  useServiceById,
  useServiceCount,
  useServices,
} from './serviceStore';

/**
 * Selector for accessing the current project configuration
 * @returns The current project configuration
 */
export const useProject = () => useProjectStoreInternal((state) => state.project);

// Optimized selectors for DesignerPage to reduce re-renders
export const useDesignerPageData = () => {
  const project = useProjectStoreInternal((state) => state.project);
  const exportProject = useProjectStoreInternal((state) => state.exportProject);

  return {
    project,
    exportProject,
  };
};

/**
 * Selector for project actions that don't cause unnecessary re-renders
 * @returns Object containing project action functions: setProject, resetProject, exportProject, importProject
 */
export const useProjectActions = () =>
  useProjectStoreInternal(
    useShallow((state) => ({
      setProject: state.setProject,
      resetProject: state.resetProject,
      exportProject: state.exportProject,
      importProject: state.importProject,
    })),
  );

// ============================================================================
// Atomic Selectors for Target Config & Feature Pack 2025
// ============================================================================

/**
 * Selector for accessing the target configuration (language, framework, versions)
 * @returns The current target configuration
 */
export const useTargetConfig = () => useProjectStoreInternal((state) => state.project.targetConfig);

/**
 * Selector for accessing the Feature Pack 2025 configuration
 * @returns The current Feature Pack configuration
 */
export const useFeaturePackConfig = () =>
  useProjectStoreInternal((state) => state.project.featurePackConfig);

/**
 * Selector for accessing Rust/Axum specific options
 * @returns The current Rust/Axum options
 */
export const useRustOptions = () => useProjectStoreInternal((state) => state.project.rustOptions);

/**
 * Selector for accessing Go/Chi specific options
 * @returns The current Go/Chi options
 */
export const useGoChiOptions = () => useProjectStoreInternal((state) => state.project.goChiOptions);

/**
 * Selector for target config actions that don't cause unnecessary re-renders
 * @returns Object containing setTargetConfig action
 */
export const useTargetConfigActions = () =>
  useProjectStoreInternal(
    useShallow((state) => ({
      setTargetConfig: state.setTargetConfig,
    })),
  );

/**
 * Selector for Feature Pack 2025 actions that don't cause unnecessary re-renders
 * @returns Object containing setFeaturePackConfig action
 */
export const useFeaturePackActions = () =>
  useProjectStoreInternal(
    useShallow((state) => ({
      setFeaturePackConfig: state.setFeaturePackConfig,
    })),
  );

/**
 * Selector for language-specific option actions that don't cause unnecessary re-renders
 * @returns Object containing setRustOptions and setGoChiOptions actions
 */
export const useLanguageOptionsActions = () =>
  useProjectStoreInternal(
    useShallow((state) => ({
      setRustOptions: state.setRustOptions,
      setGoChiOptions: state.setGoChiOptions,
    })),
  );

/**
 * Combined selector for all config-related actions (for convenience)
 * @returns Object containing all config update actions
 */
export const useAllConfigActions = () =>
  useProjectStoreInternal(
    useShallow((state) => ({
      setProject: state.setProject,
      setTargetConfig: state.setTargetConfig,
      setFeaturePackConfig: state.setFeaturePackConfig,
      setRustOptions: state.setRustOptions,
      setGoChiOptions: state.setGoChiOptions,
    })),
  );
