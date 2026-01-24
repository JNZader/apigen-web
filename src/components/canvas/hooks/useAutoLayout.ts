import { useEffect } from 'react';
import type { LayoutPreset } from '../../../store/layoutStore';
import type { EntityDesign } from '../../../types';
import type { RelationDesign } from '../../../types/relation';
import { calculateAutoLayout, LAYOUT_PRESETS } from '../../../utils/canvasLayout';

interface UseAutoLayoutOptions {
  entities: EntityDesign[];
  relations: RelationDesign[];
  layoutPreference: LayoutPreset;
  needsAutoLayout: boolean;
  updateEntityPositions: (positions: Map<string, { x: number; y: number }>) => void;
  setNeedsAutoLayout: (needs: boolean) => void;
}

/**
 * Hook that automatically applies layout when needed (e.g., after importing entities).
 * Triggers layout calculation using ELK algorithm when needsAutoLayout flag is set.
 */
export function useAutoLayout({
  entities,
  relations,
  layoutPreference,
  needsAutoLayout,
  updateEntityPositions,
  setNeedsAutoLayout,
}: UseAutoLayoutOptions): void {
  useEffect(() => {
    if (needsAutoLayout && entities.length > 0) {
      // Run async layout and update positions
      calculateAutoLayout(entities, relations, LAYOUT_PRESETS[layoutPreference])
        .then((positions) => {
          updateEntityPositions(positions);
          setNeedsAutoLayout(false);
        })
        .catch((error) => {
          console.error('Auto layout failed:', error);
          setNeedsAutoLayout(false);
        });
    }
  }, [
    needsAutoLayout,
    entities,
    relations,
    layoutPreference,
    updateEntityPositions,
    setNeedsAutoLayout,
  ]);
}
