import { useCallback, useMemo } from 'react';
import { useProjectStore } from '../store/projectStore';
import type { FieldDesign } from '../types';

/**
 * Custom hook for managing selected entity state and actions.
 * Centralizes entity selection logic and provides memoized callbacks.
 */
export function useSelectedEntity() {
  const selectedEntityId = useProjectStore((state) => state.selectedEntityId);
  const entities = useProjectStore((state) => state.entities);
  const selectEntity = useProjectStore((state) => state.selectEntity);
  const updateField = useProjectStore((state) => state.updateField);
  const removeField = useProjectStore((state) => state.removeField);

  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    return entities.find((e) => e.id === selectedEntityId) || null;
  }, [selectedEntityId, entities]);

  const updateSelectedField = useCallback(
    (fieldId: string, updates: Partial<FieldDesign>) => {
      if (selectedEntityId) {
        updateField(selectedEntityId, fieldId, updates);
      }
    },
    [selectedEntityId, updateField],
  );

  const removeSelectedField = useCallback(
    (fieldId: string) => {
      if (selectedEntityId) {
        removeField(selectedEntityId, fieldId);
      }
    },
    [selectedEntityId, removeField],
  );

  const clearSelection = useCallback(() => {
    selectEntity(null);
  }, [selectEntity]);

  return {
    selectedEntity,
    selectedEntityId,
    selectEntity,
    clearSelection,
    updateSelectedField,
    removeSelectedField,
  };
}
