import { create } from 'zustand';

// ============================================================================
// Canvas UI Store
// Manages transient UI state for canvas components (not persisted)
// ============================================================================

interface CanvasUIState {
  // Expanded entity nodes (shows all fields instead of collapsed view)
  expandedEntityIds: Set<string>;

  // Actions
  toggleEntityExpanded: (id: string) => void;
  setEntityExpanded: (id: string, expanded: boolean) => void;
  clearExpandedEntities: () => void;
  cleanupDeletedEntities: (existingIds: string[]) => void;
}

export const useCanvasUIStore = create<CanvasUIState>()((set) => ({
  expandedEntityIds: new Set(),

  toggleEntityExpanded: (id) =>
    set((state) => {
      const newSet = new Set(state.expandedEntityIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { expandedEntityIds: newSet };
    }),

  setEntityExpanded: (id, expanded) =>
    set((state) => {
      const newSet = new Set(state.expandedEntityIds);
      if (expanded) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return { expandedEntityIds: newSet };
    }),

  clearExpandedEntities: () => set({ expandedEntityIds: new Set() }),

  // Remove IDs that no longer exist (called when entities change)
  cleanupDeletedEntities: (existingIds) =>
    set((state) => {
      const existingSet = new Set(existingIds);
      const newSet = new Set<string>();
      for (const id of state.expandedEntityIds) {
        if (existingSet.has(id)) {
          newSet.add(id);
        }
      }
      // Only update if something was removed
      if (newSet.size !== state.expandedEntityIds.size) {
        return { expandedEntityIds: newSet };
      }
      return state;
    }),
}));

// ============================================================================
// Selectors
// ============================================================================

export const useIsEntityExpanded = (id: string) =>
  useCanvasUIStore((state) => state.expandedEntityIds.has(id));

export const useCanvasUIActions = () =>
  useCanvasUIStore((state) => ({
    toggleEntityExpanded: state.toggleEntityExpanded,
    setEntityExpanded: state.setEntityExpanded,
    clearExpandedEntities: state.clearExpandedEntities,
    cleanupDeletedEntities: state.cleanupDeletedEntities,
  }));
