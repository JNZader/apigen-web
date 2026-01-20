import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { RelationDesign } from '../types/relation';
import { useEntityStore } from './entityStore';

// ============================================================================
// Store Interface
// ============================================================================

interface RelationState {
  // State
  relations: RelationDesign[];

  // Actions
  addRelation: (relation: Omit<RelationDesign, 'id'>) => void;
  updateRelation: (id: string, updates: Partial<RelationDesign>) => void;
  removeRelation: (id: string) => void;
  setRelations: (relations: RelationDesign[]) => void;

  // Internal: remove relations for entity
  removeRelationsForEntity: (entityId: string) => void;
}

// ============================================================================
// Store
// ============================================================================

export const useRelationStore = create<RelationState>()(
  persist(
    (set) => ({
      // Initial state
      relations: [],

      // Actions
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

      // Internal action
      removeRelationsForEntity: (entityId) =>
        set((state) => ({
          relations: state.relations.filter(
            (r) => r.sourceEntityId !== entityId && r.targetEntityId !== entityId,
          ),
        })),
    }),
    {
      name: 'apigen-relations',
      partialize: (state) => ({
        relations: state.relations,
      }),
    },
  ),
);

// ============================================================================
// Subscribe to entity removal
// ============================================================================

// Set up subscription to entity store for cleanup
useEntityStore.getState()._setOnEntityRemove((entityId) => {
  useRelationStore.getState().removeRelationsForEntity(entityId);
});

// ============================================================================
// Atomic Selectors
// ============================================================================

export const useRelations = () => useRelationStore((state) => state.relations);
export const useRelationCount = () => useRelationStore((state) => state.relations.length);

// ============================================================================
// Action Selectors
// ============================================================================

export const useRelationActions = () =>
  useRelationStore(
    useShallow((state) => ({
      addRelation: state.addRelation,
      updateRelation: state.updateRelation,
      removeRelation: state.removeRelation,
      setRelations: state.setRelations,
    })),
  );
