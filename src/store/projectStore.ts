import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type {
  EntityDesign,
  FieldDesign,
  ProjectConfig,
  ServiceConnectionDesign,
  ServiceDesign,
} from '../types';
import {
  defaultProjectConfig,
  defaultServiceConfig,
  defaultServiceConnectionConfig,
  getNextServiceColor,
  toSnakeCase,
} from '../types';
import type { RelationDesign } from '../types/relation';
import { type CanvasView, CANVAS_VIEWS } from '../utils/canvasConstants';
import { validateProjectImport } from '../utils/validation';

type LayoutPreset = 'compact' | 'horizontal' | 'vertical' | 'spacious';

// Re-export CanvasView type from canvasConstants
export type { CanvasView };

// ============================================================================
// Helper functions to reduce nesting depth
// ============================================================================

// Update a field within an entity
function updateFieldInEntity(
  entity: EntityDesign,
  fieldId: string,
  updates: Partial<FieldDesign>,
): EntityDesign {
  return {
    ...entity,
    fields: entity.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
  };
}

// Remove a field from an entity
function removeFieldFromEntity(entity: EntityDesign, fieldId: string): EntityDesign {
  return {
    ...entity,
    fields: entity.fields.filter((f) => f.id !== fieldId),
  };
}

// Add a field to an entity
function addFieldToEntity(entity: EntityDesign, field: Omit<FieldDesign, 'id'>): EntityDesign {
  return {
    ...entity,
    fields: [
      ...entity.fields,
      {
        ...field,
        id: nanoid(),
        columnName: field.columnName || toSnakeCase(field.name),
      },
    ],
  };
}

// Helper to update entity assignment in a service
function updateServiceEntityIds(
  service: ServiceDesign,
  entityId: string,
  targetServiceId: string,
): ServiceDesign {
  const filteredIds = service.entityIds.filter((id) => id !== entityId);
  const newEntityIds = service.id === targetServiceId ? [...filteredIds, entityId] : filteredIds;
  return { ...service, entityIds: newEntityIds };
}

// Helper to remove entity from a specific service
function removeEntityFromServiceHelper(
  service: ServiceDesign,
  entityId: string,
  targetServiceId: string,
): ServiceDesign {
  if (service.id !== targetServiceId) return service;
  return { ...service, entityIds: service.entityIds.filter((id) => id !== entityId) };
}

// Deep merge helper for nested objects (used in import and persist merge)
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

interface ProjectStore {
  // State
  project: ProjectConfig;
  entities: EntityDesign[];
  relations: RelationDesign[];
  services: ServiceDesign[];
  serviceConnections: ServiceConnectionDesign[];
  selectedEntityId: string | null;
  selectedServiceId: string | null;
  canvasView: CanvasView;
  layoutPreference: LayoutPreset;
  needsAutoLayout: boolean;

  // Project actions
  setProject: (project: Partial<ProjectConfig>) => void;
  resetProject: () => void;

  // Entity actions
  addEntity: (name: string) => EntityDesign;
  updateEntity: (id: string, updates: Partial<EntityDesign>) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;
  getEntity: (id: string) => EntityDesign | undefined;
  setEntities: (entities: EntityDesign[]) => void;

  // Field actions
  addField: (entityId: string, field: Omit<FieldDesign, 'id'>) => void;
  updateField: (entityId: string, fieldId: string, updates: Partial<FieldDesign>) => void;
  removeField: (entityId: string, fieldId: string) => void;

  // Relation actions
  addRelation: (relation: Omit<RelationDesign, 'id'>) => void;
  updateRelation: (id: string, updates: Partial<RelationDesign>) => void;
  removeRelation: (id: string) => void;
  setRelations: (relations: RelationDesign[]) => void;

  // Service actions
  addService: (name: string) => ServiceDesign;
  updateService: (id: string, updates: Partial<ServiceDesign>) => void;
  removeService: (id: string) => void;
  selectService: (id: string | null) => void;
  assignEntityToService: (entityId: string, serviceId: string) => void;
  removeEntityFromService: (entityId: string, serviceId: string) => void;

  // Service connection actions
  addServiceConnection: (connection: Omit<ServiceConnectionDesign, 'id'>) => void;
  updateServiceConnection: (id: string, updates: Partial<ServiceConnectionDesign>) => void;
  removeServiceConnection: (id: string) => void;

  // Canvas view
  setCanvasView: (view: CanvasView) => void;

  // Import/Export
  exportProject: () => string;
  importProject: (json: string) => void;

  // Layout
  updateEntityPositions: (positions: Map<string, { x: number; y: number }>) => void;
  updateServicePositions: (positions: Map<string, { x: number; y: number }>) => void;
  setLayoutPreference: (preset: LayoutPreset) => void;
  setNeedsAutoLayout: (needs: boolean) => void;
}

export type { LayoutPreset };

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Initial state
      project: defaultProjectConfig,
      entities: [],
      relations: [],
      services: [],
      serviceConnections: [],
      selectedEntityId: null,
      selectedServiceId: null,
      canvasView: CANVAS_VIEWS.ENTITIES,
      layoutPreference: 'compact',
      needsAutoLayout: false,

      // Project actions
      setProject: (updates) =>
        set((state) => ({
          project: { ...state.project, ...updates },
        })),

      resetProject: () =>
        set({
          project: defaultProjectConfig,
          entities: [],
          relations: [],
          services: [],
          serviceConnections: [],
          selectedEntityId: null,
          selectedServiceId: null,
          canvasView: CANVAS_VIEWS.ENTITIES,
          needsAutoLayout: false,
        }),

      // Entity actions
      addEntity: (name) => {
        // Calculate position based on entity count for deterministic grid placement
        const entityCount = get().entities.length;
        const gridX = (entityCount % 4) * 320 + 50;
        const gridY = Math.floor(entityCount / 4) * 250 + 50;

        const entity: EntityDesign = {
          id: nanoid(),
          name,
          tableName: `${toSnakeCase(name)}s`,
          position: { x: gridX, y: gridY },
          fields: [],
          config: {
            generateController: true,
            generateService: true,
            enableCaching: true,
          },
        };
        set((state) => ({
          entities: [...state.entities, entity],
          selectedEntityId: entity.id,
        }));
        return entity;
      },

      updateEntity: (id, updates) =>
        set((state) => ({
          entities: state.entities.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      removeEntity: (id) =>
        set((state) => ({
          entities: state.entities.filter((e) => e.id !== id),
          relations: state.relations.filter(
            (r) => r.sourceEntityId !== id && r.targetEntityId !== id,
          ),
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        })),

      selectEntity: (id) => set({ selectedEntityId: id }),

      getEntity: (id) => get().entities.find((e) => e.id === id),

      setEntities: (entities) => set({ entities, selectedEntityId: null, needsAutoLayout: true }),

      // Field actions - using helper functions to reduce nesting
      addField: (entityId, field) =>
        set((state) => ({
          entities: state.entities.map((e) => (e.id === entityId ? addFieldToEntity(e, field) : e)),
        })),

      updateField: (entityId, fieldId, updates) =>
        set((state) => ({
          entities: state.entities.map((e) =>
            e.id === entityId ? updateFieldInEntity(e, fieldId, updates) : e,
          ),
        })),

      removeField: (entityId, fieldId) =>
        set((state) => ({
          entities: state.entities.map((e) =>
            e.id === entityId ? removeFieldFromEntity(e, fieldId) : e,
          ),
        })),

      // Relation actions
      addRelation: (relation) =>
        set((state) => ({
          relations: [...state.relations, { ...relation, id: nanoid() }],
        })),

      updateRelation: (id, updates) =>
        set((state) => ({
          relations: state.relations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      removeRelation: (id) =>
        set((state) => ({
          relations: state.relations.filter((r) => r.id !== id),
        })),

      setRelations: (relations) => set({ relations }),

      // Service actions
      addService: (name) => {
        const serviceCount = get().services.length;
        const usedColors = get().services.map((s) => s.color);
        const color = getNextServiceColor(usedColors);

        const service: ServiceDesign = {
          id: nanoid(),
          name,
          description: '',
          color,
          position: { x: serviceCount * 450 + 50, y: 50 },
          width: 400,
          height: 300,
          entityIds: [],
          config: { ...defaultServiceConfig, port: 8080 + serviceCount },
        };
        set((state) => ({
          services: [...state.services, service],
          selectedServiceId: service.id,
        }));
        return service;
      },

      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      removeService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
          serviceConnections: state.serviceConnections.filter(
            (c) => c.sourceServiceId !== id && c.targetServiceId !== id,
          ),
          selectedServiceId: state.selectedServiceId === id ? null : state.selectedServiceId,
        })),

      selectService: (id) => set({ selectedServiceId: id }),

      assignEntityToService: (entityId, serviceId) =>
        set((state) => ({
          services: state.services.map((s) => updateServiceEntityIds(s, entityId, serviceId)),
        })),

      removeEntityFromService: (entityId, serviceId) =>
        set((state) => ({
          services: state.services.map((s) =>
            removeEntityFromServiceHelper(s, entityId, serviceId),
          ),
        })),

      // Service connection actions
      addServiceConnection: (connection) =>
        set((state) => ({
          serviceConnections: [
            ...state.serviceConnections,
            {
              ...connection,
              id: nanoid(),
              config: { ...defaultServiceConnectionConfig, ...connection.config },
            },
          ],
        })),

      updateServiceConnection: (id, updates) =>
        set((state) => ({
          serviceConnections: state.serviceConnections.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      removeServiceConnection: (id) =>
        set((state) => ({
          serviceConnections: state.serviceConnections.filter((c) => c.id !== id),
        })),

      // Canvas view
      setCanvasView: (view) => set({ canvasView: view }),

      // Import/Export
      exportProject: () => {
        const state = get();
        return JSON.stringify(
          {
            project: state.project,
            entities: state.entities,
            relations: state.relations,
            services: state.services,
            serviceConnections: state.serviceConnections,
          },
          null,
          2,
        );
      },

      importProject: (json) => {
        const data = validateProjectImport(json);
        set({
          project: deepMerge(
            defaultProjectConfig,
            data.project as unknown as Partial<ProjectConfig>,
          ),
          entities: data.entities,
          relations: data.relations,
          services: (data as { services?: ServiceDesign[] }).services ?? [],
          serviceConnections:
            (data as { serviceConnections?: ServiceConnectionDesign[] }).serviceConnections ?? [],
          selectedEntityId: null,
          selectedServiceId: null,
          needsAutoLayout: true,
        });
      },

      // Layout
      updateEntityPositions: (positions) =>
        set((state) => ({
          entities: state.entities.map((e) => {
            const newPos = positions.get(e.id);
            return newPos ? { ...e, position: newPos } : e;
          }),
        })),

      updateServicePositions: (positions) =>
        set((state) => ({
          services: state.services.map((s) => {
            const newPos = positions.get(s.id);
            return newPos ? { ...s, position: newPos } : s;
          }),
        })),

      setLayoutPreference: (preset) => set({ layoutPreference: preset }),

      setNeedsAutoLayout: (needs) => set({ needsAutoLayout: needs }),
    }),
    {
      name: 'apigen-studio',
      // Merge persisted state with defaults to handle schema migrations
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ProjectStore> | undefined;
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
// Atomic Selectors - Use these to prevent unnecessary re-renders
// ============================================================================

// State selectors
export const useProject = () => useProjectStore((state) => state.project);
export const useEntities = () => useProjectStore((state) => state.entities);
export const useRelations = () => useProjectStore((state) => state.relations);
export const useServices = () => useProjectStore((state) => state.services);
export const useServiceConnections = () => useProjectStore((state) => state.serviceConnections);
export const useSelectedEntityId = () => useProjectStore((state) => state.selectedEntityId);
export const useSelectedServiceId = () => useProjectStore((state) => state.selectedServiceId);
export const useCanvasView = () => useProjectStore((state) => state.canvasView);
export const useLayoutPreference = () => useProjectStore((state) => state.layoutPreference);
export const useNeedsAutoLayout = () => useProjectStore((state) => state.needsAutoLayout);

// Derived state selectors
export const useSelectedEntity = () =>
  useProjectStore((state) =>
    state.selectedEntityId
      ? state.entities.find((e) => e.id === state.selectedEntityId)
      : undefined,
  );

export const useSelectedService = () =>
  useProjectStore((state) =>
    state.selectedServiceId
      ? state.services.find((s) => s.id === state.selectedServiceId)
      : undefined,
  );

export const useEntityById = (id: string) =>
  useProjectStore((state) => state.entities.find((e) => e.id === id));

export const useServiceById = (id: string) =>
  useProjectStore((state) => state.services.find((s) => s.id === id));

// Optimized selector using Set for O(n) instead of O(n*m)
export const useEntitiesForService = (serviceId: string) =>
  useProjectStore((state) => {
    const service = state.services.find((s) => s.id === serviceId);
    if (!service) return [];
    const entityIdSet = new Set(service.entityIds);
    return state.entities.filter((e) => entityIdSet.has(e.id));
  });

export const useEntityCount = () => useProjectStore((state) => state.entities.length);
export const useRelationCount = () => useProjectStore((state) => state.relations.length);
export const useServiceCount = () => useProjectStore((state) => state.services.length);

// Action selectors - grouped by domain for stable references
// Using useShallow to prevent infinite loops from object recreation
export const useProjectActions = () =>
  useProjectStore(
    useShallow((state) => ({
      setProject: state.setProject,
      resetProject: state.resetProject,
      exportProject: state.exportProject,
      importProject: state.importProject,
    })),
  );

export const useEntityActions = () =>
  useProjectStore(
    useShallow((state) => ({
      addEntity: state.addEntity,
      updateEntity: state.updateEntity,
      removeEntity: state.removeEntity,
      selectEntity: state.selectEntity,
      getEntity: state.getEntity,
      setEntities: state.setEntities,
    })),
  );

export const useFieldActions = () =>
  useProjectStore(
    useShallow((state) => ({
      addField: state.addField,
      updateField: state.updateField,
      removeField: state.removeField,
    })),
  );

export const useRelationActions = () =>
  useProjectStore(
    useShallow((state) => ({
      addRelation: state.addRelation,
      updateRelation: state.updateRelation,
      removeRelation: state.removeRelation,
      setRelations: state.setRelations,
    })),
  );

export const useServiceActions = () =>
  useProjectStore(
    useShallow((state) => ({
      addService: state.addService,
      updateService: state.updateService,
      removeService: state.removeService,
      selectService: state.selectService,
      assignEntityToService: state.assignEntityToService,
      removeEntityFromService: state.removeEntityFromService,
    })),
  );

export const useServiceConnectionActions = () =>
  useProjectStore(
    useShallow((state) => ({
      addServiceConnection: state.addServiceConnection,
      updateServiceConnection: state.updateServiceConnection,
      removeServiceConnection: state.removeServiceConnection,
    })),
  );

export const useCanvasViewActions = () =>
  useProjectStore(
    useShallow((state) => ({
      setCanvasView: state.setCanvasView,
    })),
  );

export const useLayoutActions = () =>
  useProjectStore(
    useShallow((state) => ({
      updateEntityPositions: state.updateEntityPositions,
      updateServicePositions: state.updateServicePositions,
      setLayoutPreference: state.setLayoutPreference,
      setNeedsAutoLayout: state.setNeedsAutoLayout,
    })),
  );
