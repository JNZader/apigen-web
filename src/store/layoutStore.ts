import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import { CANVAS_VIEWS, type CanvasView } from '../utils/canvasConstants';
import { useEntityStore } from './entityStore';
import { useServiceStore } from './serviceStore';

// ============================================================================
// Types
// ============================================================================

export type LayoutPreset = 'compact' | 'horizontal' | 'vertical' | 'spacious';

// Re-export CanvasView type from canvasConstants
export type { CanvasView };

// ============================================================================
// Store Interface
// ============================================================================

interface LayoutState {
  // State
  canvasView: CanvasView;
  layoutPreference: LayoutPreset;
  needsAutoLayout: boolean;

  // Actions
  setCanvasView: (view: CanvasView) => void;
  setLayoutPreference: (preset: LayoutPreset) => void;
  setNeedsAutoLayout: (needs: boolean) => void;

  // Layout position updates (delegated to entity/service stores)
  updateEntityPositions: (positions: Map<string, { x: number; y: number }>) => void;
  updateServicePositions: (positions: Map<string, { x: number; y: number }>) => void;
}

// ============================================================================
// Store
// ============================================================================

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // Initial state
      canvasView: CANVAS_VIEWS.ENTITIES,
      layoutPreference: 'compact',
      needsAutoLayout: false,

      // Actions
      setCanvasView: (view) => set({ canvasView: view }),
      setLayoutPreference: (preset) => set({ layoutPreference: preset }),
      setNeedsAutoLayout: (needs) => set({ needsAutoLayout: needs }),

      // Delegate to entity/service stores
      updateEntityPositions: (positions) => {
        useEntityStore.getState().updateEntityPositions(positions);
      },
      updateServicePositions: (positions) => {
        useServiceStore.getState().updateServicePositions(positions);
      },
    }),
    {
      name: 'apigen-layout',
      partialize: (state) => ({
        canvasView: state.canvasView,
        layoutPreference: state.layoutPreference,
      }),
    },
  ),
);

// ============================================================================
// Subscribe to entity setEntities for auto-layout
// ============================================================================

// Set up subscription to entity store to trigger auto-layout
useEntityStore.getState()._setOnSetEntities(() => {
  useLayoutStore.getState().setNeedsAutoLayout(true);
});

// ============================================================================
// Atomic Selectors
// ============================================================================

export const useCanvasView = () => useLayoutStore((state) => state.canvasView);
export const useLayoutPreference = () => useLayoutStore((state) => state.layoutPreference);
export const useNeedsAutoLayout = () => useLayoutStore((state) => state.needsAutoLayout);

// ============================================================================
// Action Selectors
// ============================================================================

export const useCanvasViewActions = () =>
  useLayoutStore(
    useShallow((state) => ({
      setCanvasView: state.setCanvasView,
    })),
  );

export const useLayoutActions = () =>
  useLayoutStore(
    useShallow((state) => ({
      updateEntityPositions: state.updateEntityPositions,
      updateServicePositions: state.updateServicePositions,
      setLayoutPreference: state.setLayoutPreference,
      setNeedsAutoLayout: state.setNeedsAutoLayout,
    })),
  );
