import { useCallback, useEffect } from 'react';
import { useCanRedo, useCanUndo, useHistoryStore } from '../store/historyStore';
import { useProjectStore } from '../store/projectStore';
import { notify } from '../utils/notifications';

/**
 * Hook that integrates undo/redo functionality with the project store.
 * Automatically tracks state changes and provides undo/redo actions.
 */
export function useHistory() {
  const entities = useProjectStore((state) => state.entities);
  const relations = useProjectStore((state) => state.relations);

  const saveSnapshot = useHistoryStore((state) => state.saveSnapshot);
  const undoAction = useHistoryStore((state) => state.undo);
  const redoAction = useHistoryStore((state) => state.redo);
  const isTimeTravel = useHistoryStore((state) => state.isTimeTravel);

  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // Save snapshot whenever entities or relations change
  useEffect(() => {
    if (!isTimeTravel) {
      saveSnapshot({ entities, relations });
    }
  }, [entities, relations, saveSnapshot, isTimeTravel]);

  const undo = useCallback(() => {
    const previous = undoAction();
    if (previous) {
      // Use the store's internal method to avoid triggering needsAutoLayout
      useProjectStore.setState({
        entities: previous.entities,
        relations: previous.relations,
        needsAutoLayout: false,
      });
      notify.info({ message: 'Undone', title: 'Undo' });
    }
  }, [undoAction]);

  const redo = useCallback(() => {
    const next = redoAction();
    if (next) {
      useProjectStore.setState({
        entities: next.entities,
        relations: next.relations,
        needsAutoLayout: false,
      });
      notify.info({ message: 'Redone', title: 'Redo' });
    }
  }, [redoAction]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
