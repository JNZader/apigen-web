import { modals } from '@mantine/modals';
import { useCallback } from 'react';
import { useProjectStore } from '../store/projectStore';
import { notify } from '../utils/notifications';

/**
 * Custom hook for entity deletion with confirmation modal.
 * Provides consistent deletion UX across the application.
 */
export function useEntityDeletion() {
  const entities = useProjectStore((state) => state.entities);
  const removeEntity = useProjectStore((state) => state.removeEntity);

  const confirmDelete = useCallback(
    (entityId: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;

      modals.openConfirmModal({
        title: 'Delete Entity',
        children: `Are you sure you want to delete "${entity.name}"? This will also remove all its relations.`,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red', 'aria-label': 'Confirm deletion' },
        cancelProps: { 'aria-label': 'Cancel deletion' },
        onConfirm: () => {
          removeEntity(entityId);
          notify.success({
            title: 'Deleted',
            message: `Entity ${entity.name} deleted successfully`,
          });
        },
      });
    },
    [entities, removeEntity],
  );

  const deleteWithoutConfirm = useCallback(
    (entityId: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (!entity) return;

      removeEntity(entityId);
      notify.success({
        title: 'Deleted',
        message: `Entity ${entity.name} deleted successfully`,
      });
    },
    [entities, removeEntity],
  );

  return {
    confirmDelete,
    deleteWithoutConfirm,
  };
}
