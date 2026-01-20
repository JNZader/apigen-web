import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { ProjectConfig, ServiceConnectionDesign, ServiceDesign } from '../types';
import { defaultProjectConfig } from '../types';
import { CANVAS_VIEWS } from '../utils/canvasConstants';
import { validateProjectImport } from '../utils/validation';

// Import individual stores for cross-store operations
import { useEntityStore } from './entityStore';
import { type CanvasView, type LayoutPreset, useLayoutStore } from './layoutStore';
import { useRelationStore } from './relationStore';
import { useServiceConnectionStore } from './serviceConnectionStore';
import { useServiceStore } from './serviceStore';

// Re-export types for backward compatibility
export type { LayoutPreset, CanvasView };

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
      setProject: (updates) =>
        set((state) => ({
          project: { ...state.project, ...updates },
        })),

      resetProject: () => {
        // Reset all stores
        useEntityStore.setState({ entities: [], selectedEntityId: null });
        useRelationStore.setState({ relations: [] });
        useServiceStore.setState({ services: [], selectedServiceId: null });
        useServiceConnectionStore.setState({ serviceConnections: [] });
        useLayoutStore.setState({ canvasView: CANVAS_VIEWS.ENTITIES, needsAutoLayout: false });
        set({ project: defaultProjectConfig });
      },

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

// This provides the same interface as the original useProjectStore
// by combining all individual stores
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

import type { EntityDesign, FieldDesign } from '../types';
import type { RelationDesign } from '../types/relation';

interface CombinedProjectState {
  // Project
  project: ProjectConfig;
  setProject: (project: Partial<ProjectConfig>) => void;
  resetProject: () => void;
  exportProject: () => string;
  importProject: (json: string) => void;

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
} from './entityStore';
// Re-export from layoutStore
export {
  useCanvasView,
  useCanvasViewActions,
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

// Project-specific selectors
export const useProject = () => useProjectStoreInternal((state) => state.project);

export const useProjectActions = () =>
  useProjectStoreInternal(
    useShallow((state) => ({
      setProject: state.setProject,
      resetProject: state.resetProject,
      exportProject: state.exportProject,
      importProject: state.importProject,
    })),
  );
