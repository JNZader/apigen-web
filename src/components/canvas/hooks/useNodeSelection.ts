import type { Node } from '@xyflow/react';
import { useCallback } from 'react';
import type { EntityDesign, ServiceDesign } from '../../../types';

interface UseNodeSelectionOptions {
  entities: EntityDesign[];
  services: ServiceDesign[];
  onSelectEntity: (id: string | null) => void;
  selectService: (id: string | null) => void;
  toggleEntitySelection: (id: string) => void;
  clearEntitySelection: () => void;
}

interface UseNodeSelectionReturn {
  /** Handler for node click events (supports Ctrl+Click for multi-select) */
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  /** Handler for canvas/pane click events (deselects all) */
  onPaneClick: () => void;
}

/**
 * Hook that manages node selection behavior in the canvas.
 * Supports single selection, multi-selection with Ctrl+Click, and deselection.
 */
export function useNodeSelection({
  entities,
  services,
  onSelectEntity,
  selectService,
  toggleEntitySelection,
  clearEntitySelection,
}: UseNodeSelectionOptions): UseNodeSelectionReturn {
  // Handle node selection (supports Ctrl+Click for multi-select)
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const isEntity = entities.some((e) => e.id === node.id);
      const isService = services.some((s) => s.id === node.id);

      if (isEntity) {
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Click: Toggle multi-selection
          toggleEntitySelection(node.id);
          selectService(null);
        } else {
          // Normal click: Single selection (clears multi-selection)
          onSelectEntity(node.id);
          selectService(null);
        }
      } else if (isService) {
        selectService(node.id);
        onSelectEntity(null);
        clearEntitySelection();
      }
    },
    [
      entities,
      services,
      onSelectEntity,
      selectService,
      toggleEntitySelection,
      clearEntitySelection,
    ],
  );

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    onSelectEntity(null);
    selectService(null);
    clearEntitySelection();
  }, [onSelectEntity, selectService, clearEntitySelection]);

  return {
    onNodeClick,
    onPaneClick,
  };
}
