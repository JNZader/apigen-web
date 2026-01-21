import { beforeEach, describe, expect, it } from 'vitest';
import { useCanvasUIStore } from './canvasUIStore';

describe('canvasUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCanvasUIStore.setState({ expandedEntityIds: new Set() });
  });

  describe('toggleEntityExpanded', () => {
    it('should add entity id when not expanded', () => {
      const { toggleEntityExpanded } = useCanvasUIStore.getState();

      toggleEntityExpanded('entity-1');

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.has('entity-1')).toBe(true);
    });

    it('should remove entity id when already expanded', () => {
      // Setup: entity is already expanded
      useCanvasUIStore.setState({
        expandedEntityIds: new Set(['entity-1']),
      });

      const { toggleEntityExpanded } = useCanvasUIStore.getState();
      toggleEntityExpanded('entity-1');

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.has('entity-1')).toBe(false);
    });

    it('should handle multiple entities independently', () => {
      const { toggleEntityExpanded } = useCanvasUIStore.getState();

      toggleEntityExpanded('entity-1');
      toggleEntityExpanded('entity-2');

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.has('entity-1')).toBe(true);
      expect(expandedEntityIds.has('entity-2')).toBe(true);

      // Toggle one off
      toggleEntityExpanded('entity-1');

      const updated = useCanvasUIStore.getState().expandedEntityIds;
      expect(updated.has('entity-1')).toBe(false);
      expect(updated.has('entity-2')).toBe(true);
    });
  });

  describe('setEntityExpanded', () => {
    it('should set entity as expanded when expanded=true', () => {
      const { setEntityExpanded } = useCanvasUIStore.getState();

      setEntityExpanded('entity-1', true);

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.has('entity-1')).toBe(true);
    });

    it('should remove entity when expanded=false', () => {
      // Setup: entity is already expanded
      useCanvasUIStore.setState({
        expandedEntityIds: new Set(['entity-1']),
      });

      const { setEntityExpanded } = useCanvasUIStore.getState();
      setEntityExpanded('entity-1', false);

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.has('entity-1')).toBe(false);
    });

    it('should not duplicate when setting already expanded entity', () => {
      useCanvasUIStore.setState({
        expandedEntityIds: new Set(['entity-1']),
      });

      const { setEntityExpanded } = useCanvasUIStore.getState();
      setEntityExpanded('entity-1', true);

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.size).toBe(1);
    });
  });

  describe('clearExpandedEntities', () => {
    it('should clear all expanded entities', () => {
      // Setup: multiple entities expanded
      useCanvasUIStore.setState({
        expandedEntityIds: new Set(['entity-1', 'entity-2', 'entity-3']),
      });

      const { clearExpandedEntities } = useCanvasUIStore.getState();
      clearExpandedEntities();

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.size).toBe(0);
    });

    it('should work when already empty', () => {
      const { clearExpandedEntities } = useCanvasUIStore.getState();
      clearExpandedEntities();

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.size).toBe(0);
    });
  });

  describe('cleanupDeletedEntities', () => {
    it('should remove ids that no longer exist', () => {
      // Setup: some entities expanded
      useCanvasUIStore.setState({
        expandedEntityIds: new Set(['entity-1', 'entity-2', 'entity-3']),
      });

      const { cleanupDeletedEntities } = useCanvasUIStore.getState();
      // Only entity-1 and entity-3 still exist
      cleanupDeletedEntities(['entity-1', 'entity-3']);

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.has('entity-1')).toBe(true);
      expect(expandedEntityIds.has('entity-2')).toBe(false);
      expect(expandedEntityIds.has('entity-3')).toBe(true);
      expect(expandedEntityIds.size).toBe(2);
    });

    it('should not modify state when all ids still exist', () => {
      const initialSet = new Set(['entity-1', 'entity-2']);
      useCanvasUIStore.setState({
        expandedEntityIds: initialSet,
      });

      const { cleanupDeletedEntities } = useCanvasUIStore.getState();
      cleanupDeletedEntities(['entity-1', 'entity-2', 'entity-3']);

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.size).toBe(2);
    });

    it('should handle empty existing ids (all deleted)', () => {
      useCanvasUIStore.setState({
        expandedEntityIds: new Set(['entity-1', 'entity-2']),
      });

      const { cleanupDeletedEntities } = useCanvasUIStore.getState();
      cleanupDeletedEntities([]);

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.size).toBe(0);
    });

    it('should handle empty expanded set', () => {
      const { cleanupDeletedEntities } = useCanvasUIStore.getState();
      cleanupDeletedEntities(['entity-1', 'entity-2']);

      const { expandedEntityIds } = useCanvasUIStore.getState();
      expect(expandedEntityIds.size).toBe(0);
    });
  });
});
