import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { EntityDesign, FieldDesign } from '../types';
import { toSnakeCase } from '../types';
import { ENTITY_GRID } from '../utils/canvasConstants';

// ============================================================================
// Helper functions
// ============================================================================

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

function removeFieldFromEntity(entity: EntityDesign, fieldId: string): EntityDesign {
  return {
    ...entity,
    fields: entity.fields.filter((f) => f.id !== fieldId),
  };
}

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

// ============================================================================
// Store Interface
// ============================================================================

interface EntityState {
  // State
  entities: EntityDesign[];
  selectedEntityId: string | null;
  selectedEntityIds: string[]; // Multi-selection for Ctrl+Click

  // Entity actions
  addEntity: (name: string) => EntityDesign;
  updateEntity: (id: string, updates: Partial<EntityDesign>) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;
  toggleEntitySelection: (id: string) => void; // Ctrl+Click toggle
  clearEntitySelection: () => void;
  getEntity: (id: string) => EntityDesign | undefined;
  setEntities: (entities: EntityDesign[]) => void;

  // Field actions
  addField: (entityId: string, field: Omit<FieldDesign, 'id'>) => void;
  updateField: (entityId: string, fieldId: string, updates: Partial<FieldDesign>) => void;
  removeField: (entityId: string, fieldId: string) => void;

  // Layout
  updateEntityPositions: (positions: Map<string, { x: number; y: number }>) => void;

  // Internal: callback for entity removal (set by relation store)
  _onEntityRemove?: (entityId: string) => void;
  _setOnEntityRemove: (callback: ((entityId: string) => void) | undefined) => void;

  // Internal: callback for setEntities (set by layout store)
  _onSetEntities?: () => void;
  _setOnSetEntities: (callback: (() => void) | undefined) => void;
}

// ============================================================================
// Store
// ============================================================================

export const useEntityStore = create<EntityState>()(
  persist(
    (set, get) => ({
      // Initial state
      entities: [],
      selectedEntityId: null,
      selectedEntityIds: [],

      // Entity actions
      addEntity: (name) => {
        const entityCount = get().entities.length;
        const gridX =
          (entityCount % ENTITY_GRID.COLUMNS) * ENTITY_GRID.SPACING_X + ENTITY_GRID.PADDING;
        const gridY =
          Math.floor(entityCount / ENTITY_GRID.COLUMNS) * ENTITY_GRID.SPACING_Y +
          ENTITY_GRID.PADDING;

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

      removeEntity: (id) => {
        const { _onEntityRemove } = get();
        set((state) => ({
          entities: state.entities.filter((e) => e.id !== id),
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
          selectedEntityIds: state.selectedEntityIds.filter((eid) => eid !== id),
        }));
        // Notify relation store to remove related relations
        _onEntityRemove?.(id);
      },

      selectEntity: (id) => set({ selectedEntityId: id, selectedEntityIds: [] }),

      toggleEntitySelection: (id) =>
        set((state) => {
          const isAlreadySelected = state.selectedEntityIds.includes(id);
          if (isAlreadySelected) {
            // Remove from multi-selection
            return {
              selectedEntityIds: state.selectedEntityIds.filter((eid) => eid !== id),
              // If this was also the primary selection, clear it
              selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
            };
          }
          // Add to multi-selection
          return {
            selectedEntityIds: [...state.selectedEntityIds, id],
            selectedEntityId: id, // Also set as primary for detail panel
          };
        }),

      clearEntitySelection: () => set({ selectedEntityIds: [], selectedEntityId: null }),

      getEntity: (id) => get().entities.find((e) => e.id === id),

      setEntities: (entities) => {
        const { _onSetEntities } = get();
        set({ entities, selectedEntityId: null, selectedEntityIds: [] });
        _onSetEntities?.();
      },

      // Field actions
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

      // Layout
      updateEntityPositions: (positions) =>
        set((state) => ({
          entities: state.entities.map((e) => {
            const newPos = positions.get(e.id);
            return newPos ? { ...e, position: newPos } : e;
          }),
        })),

      // Internal callbacks
      _onEntityRemove: undefined,
      _setOnEntityRemove: (callback) => set({ _onEntityRemove: callback }),
      _onSetEntities: undefined,
      _setOnSetEntities: (callback) => set({ _onSetEntities: callback }),
    }),
    {
      name: 'apigen-entities',
      partialize: (state) => ({
        entities: state.entities,
        selectedEntityId: state.selectedEntityId,
      }),
    },
  ),
);

// ============================================================================
// Atomic Selectors
// ============================================================================

/** Returns all entities in the store. Updates when entities array changes. */
export const useEntities = () => useEntityStore((state) => state.entities);

/** Returns the currently selected entity ID (single selection). */
export const useSelectedEntityId = () => useEntityStore((state) => state.selectedEntityId);

/** Returns array of selected entity IDs (multi-selection via Ctrl+Click). */
export const useSelectedEntityIds = () => useEntityStore((state) => state.selectedEntityIds);

// Derived selectors

/** Returns the selected entity object, or undefined if none selected. */
export const useSelectedEntity = () =>
  useEntityStore((state) =>
    state.selectedEntityId
      ? state.entities.find((e) => e.id === state.selectedEntityId)
      : undefined,
  );

/** Returns entity by ID, or undefined if not found. */
export const useEntityById = (id: string) =>
  useEntityStore((state) => state.entities.find((e) => e.id === id));

/** Returns the total count of entities. */
export const useEntityCount = () => useEntityStore((state) => state.entities.length);

// ============================================================================
// Action Selectors
// ============================================================================

/** Returns entity CRUD and selection actions. Uses useShallow to prevent unnecessary re-renders. */
export const useEntityActions = () =>
  useEntityStore(
    useShallow((state) => ({
      addEntity: state.addEntity,
      updateEntity: state.updateEntity,
      removeEntity: state.removeEntity,
      selectEntity: state.selectEntity,
      toggleEntitySelection: state.toggleEntitySelection,
      clearEntitySelection: state.clearEntitySelection,
      getEntity: state.getEntity,
      setEntities: state.setEntities,
    })),
  );

/** Returns field CRUD actions. Uses useShallow to prevent unnecessary re-renders. */
export const useFieldActions = () =>
  useEntityStore(
    useShallow((state) => ({
      addField: state.addField,
      updateField: state.updateField,
      removeField: state.removeField,
    })),
  );
