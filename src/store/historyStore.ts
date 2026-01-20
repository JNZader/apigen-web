import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { EntityDesign } from '../types';
import type { RelationDesign } from '../types/relation';

/**
 * History state for undo/redo functionality.
 * Stores snapshots of entities and relations state.
 */

interface HistoryState {
  entities: EntityDesign[];
  relations: RelationDesign[];
}

interface HistoryStore {
  // History stacks
  past: HistoryState[];
  future: HistoryState[];

  // Current state snapshot (for comparison)
  current: HistoryState | null;

  // Whether we're in the middle of an undo/redo operation
  isTimeTravel: boolean;

  // Actions
  saveSnapshot: (state: HistoryState) => void;
  undo: () => HistoryState | null;
  redo: () => HistoryState | null;
  clearHistory: () => void;

  // Computed
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY_SIZE = 50;

export const useHistoryStore = create<HistoryStore>()(
  subscribeWithSelector((set, get) => ({
    past: [],
    future: [],
    current: null,
    isTimeTravel: false,

    saveSnapshot: (state: HistoryState) => {
      const { current, isTimeTravel } = get();

      // Don't save during time travel (undo/redo operations)
      if (isTimeTravel) return;

      // Don't save if state hasn't changed
      if (
        current &&
        JSON.stringify(current.entities) === JSON.stringify(state.entities) &&
        JSON.stringify(current.relations) === JSON.stringify(state.relations)
      ) {
        return;
      }

      set((prev) => {
        const newPast = current ? [...prev.past, current].slice(-MAX_HISTORY_SIZE) : prev.past;

        return {
          past: newPast,
          current: state,
          future: [], // Clear future when new change is made
        };
      });
    },

    undo: () => {
      const { past, current } = get();
      if (past.length === 0 || !current) return null;

      const previous = past.at(-1);
      if (!previous) return null;
      const newPast = past.slice(0, -1);

      set({
        past: newPast,
        future: [current, ...get().future],
        current: previous,
        isTimeTravel: true,
      });

      // Reset time travel flag after a short delay
      setTimeout(() => set({ isTimeTravel: false }), 100);

      return previous;
    },

    redo: () => {
      const { future, current } = get();
      if (future.length === 0 || !current) return null;

      const next = future[0];
      const newFuture = future.slice(1);

      set({
        past: [...get().past, current],
        future: newFuture,
        current: next,
        isTimeTravel: true,
      });

      // Reset time travel flag after a short delay
      setTimeout(() => set({ isTimeTravel: false }), 100);

      return next;
    },

    clearHistory: () => {
      set({
        past: [],
        future: [],
        current: null,
        isTimeTravel: false,
      });
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
  })),
);

// Selectors
export const useCanUndo = () => useHistoryStore((state) => state.past.length > 0);
export const useCanRedo = () => useHistoryStore((state) => state.future.length > 0);
export const useHistoryActions = () =>
  useHistoryStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    saveSnapshot: state.saveSnapshot,
    clearHistory: state.clearHistory,
  }));
