import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EntityDesign } from '../types';
import type { RelationDesign } from '../types/relation';
import { useHistoryStore } from './historyStore';

// Helper to create mock entity state
function createMockState(
  entitiesCount: number = 1,
  relationsCount: number = 0,
): { entities: EntityDesign[]; relations: RelationDesign[] } {
  const entities: EntityDesign[] = [];
  for (let i = 0; i < entitiesCount; i++) {
    entities.push({
      id: `entity-${i}`,
      name: `Entity${i}`,
      tableName: `entity_${i}`,
      fields: [],
      position: { x: i * 100, y: 0 },
      config: { generateController: true, generateService: true, enableCaching: true },
    });
  }

  const relations: RelationDesign[] = [];
  for (let i = 0; i < relationsCount; i++) {
    relations.push({
      id: `relation-${i}`,
      type: 'OneToMany',
      sourceEntityId: 'entity-0',
      targetEntityId: `entity-${i + 1}`,
      sourceFieldName: 'items',
      targetFieldName: 'parent',
      bidirectional: false,
      fetchType: 'LAZY',
      cascade: [],
      foreignKey: {
        columnName: 'parent_id',
        nullable: true,
        onDelete: 'NO_ACTION',
        onUpdate: 'NO_ACTION',
      },
    });
  }

  return { entities, relations };
}

describe('historyStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset the store before each test
    useHistoryStore.setState({
      past: [],
      future: [],
      current: null,
      isTimeTravel: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('saveSnapshot', () => {
    it('should save the first snapshot as current', () => {
      const { saveSnapshot } = useHistoryStore.getState();
      const state = createMockState(1);

      saveSnapshot(state);

      const { current, past } = useHistoryStore.getState();
      expect(current).toEqual(state);
      expect(past).toHaveLength(0);
    });

    it('should push previous current to past when saving new snapshot', () => {
      const { saveSnapshot } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);

      saveSnapshot(state1);
      saveSnapshot(state2);

      const { current, past } = useHistoryStore.getState();
      expect(current).toEqual(state2);
      expect(past).toHaveLength(1);
      expect(past[0]).toEqual(state1);
    });

    it('should not save if state has not changed', () => {
      const { saveSnapshot } = useHistoryStore.getState();
      const state = createMockState(1);

      saveSnapshot(state);
      saveSnapshot({ ...state }); // Same content, different reference

      const { past } = useHistoryStore.getState();
      expect(past).toHaveLength(0);
    });

    it('should clear future when new snapshot is saved', () => {
      const { saveSnapshot, undo } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);
      const state3 = createMockState(3);

      saveSnapshot(state1);
      saveSnapshot(state2);
      undo();
      vi.advanceTimersByTime(150);

      saveSnapshot(state3);

      const { future } = useHistoryStore.getState();
      expect(future).toHaveLength(0);
    });

    it('should not save during time travel', () => {
      useHistoryStore.setState({ isTimeTravel: true });

      const { saveSnapshot } = useHistoryStore.getState();
      const state = createMockState(1);

      saveSnapshot(state);

      const { current } = useHistoryStore.getState();
      expect(current).toBeNull();
    });

    it('should limit history size to MAX_HISTORY_SIZE', () => {
      const { saveSnapshot } = useHistoryStore.getState();

      // Save more than MAX_HISTORY_SIZE snapshots
      for (let i = 0; i < 55; i++) {
        saveSnapshot(createMockState(i + 1));
      }

      const { past } = useHistoryStore.getState();
      expect(past.length).toBeLessThanOrEqual(50);
    });
  });

  describe('undo', () => {
    it('should return null if past is empty', () => {
      const { undo } = useHistoryStore.getState();

      const result = undo();

      expect(result).toBeNull();
    });

    it('should return null if current is null', () => {
      useHistoryStore.setState({
        past: [createMockState(1)],
        current: null,
      });

      const { undo } = useHistoryStore.getState();
      const result = undo();

      expect(result).toBeNull();
    });

    it('should restore previous state', () => {
      const { saveSnapshot, undo } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);

      saveSnapshot(state1);
      saveSnapshot(state2);

      const result = undo();

      expect(result).toEqual(state1);
      const { current } = useHistoryStore.getState();
      expect(current).toEqual(state1);
    });

    it('should push current to future', () => {
      const { saveSnapshot, undo } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);

      saveSnapshot(state1);
      saveSnapshot(state2);

      undo();

      const { future } = useHistoryStore.getState();
      expect(future).toHaveLength(1);
      expect(future[0]).toEqual(state2);
    });

    it('should set isTimeTravel during operation', () => {
      const { saveSnapshot, undo } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);

      saveSnapshot(state1);
      saveSnapshot(state2);
      undo();

      expect(useHistoryStore.getState().isTimeTravel).toBe(true);

      vi.advanceTimersByTime(150);

      expect(useHistoryStore.getState().isTimeTravel).toBe(false);
    });
  });

  describe('redo', () => {
    it('should return null if future is empty', () => {
      const { redo } = useHistoryStore.getState();

      const result = redo();

      expect(result).toBeNull();
    });

    it('should return null if current is null', () => {
      useHistoryStore.setState({
        future: [createMockState(1)],
        current: null,
      });

      const { redo } = useHistoryStore.getState();
      const result = redo();

      expect(result).toBeNull();
    });

    it('should restore next state from future', () => {
      const { saveSnapshot, undo, redo } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);

      saveSnapshot(state1);
      saveSnapshot(state2);
      undo();
      vi.advanceTimersByTime(150);

      const result = redo();

      expect(result).toEqual(state2);
      const { current } = useHistoryStore.getState();
      expect(current).toEqual(state2);
    });

    it('should push current to past', () => {
      const { saveSnapshot, undo, redo } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);

      saveSnapshot(state1);
      saveSnapshot(state2);
      undo();
      vi.advanceTimersByTime(150);

      redo();

      const { past } = useHistoryStore.getState();
      expect(past[past.length - 1]).toEqual(state1);
    });

    it('should set isTimeTravel during operation', () => {
      const { saveSnapshot, undo, redo } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);

      saveSnapshot(state1);
      saveSnapshot(state2);
      undo();
      vi.advanceTimersByTime(150);

      redo();

      expect(useHistoryStore.getState().isTimeTravel).toBe(true);

      vi.advanceTimersByTime(150);

      expect(useHistoryStore.getState().isTimeTravel).toBe(false);
    });
  });

  describe('clearHistory', () => {
    it('should reset all state', () => {
      const { saveSnapshot, clearHistory } = useHistoryStore.getState();
      const state1 = createMockState(1);
      const state2 = createMockState(2);

      saveSnapshot(state1);
      saveSnapshot(state2);

      clearHistory();

      const { past, future, current, isTimeTravel } = useHistoryStore.getState();
      expect(past).toHaveLength(0);
      expect(future).toHaveLength(0);
      expect(current).toBeNull();
      expect(isTimeTravel).toBe(false);
    });
  });

  describe('canUndo', () => {
    it('should return false when past is empty', () => {
      const { canUndo } = useHistoryStore.getState();

      expect(canUndo()).toBe(false);
    });

    it('should return true when past has items', () => {
      const { saveSnapshot, canUndo } = useHistoryStore.getState();

      saveSnapshot(createMockState(1));
      saveSnapshot(createMockState(2));

      expect(canUndo()).toBe(true);
    });
  });

  describe('canRedo', () => {
    it('should return false when future is empty', () => {
      const { canRedo } = useHistoryStore.getState();

      expect(canRedo()).toBe(false);
    });

    it('should return true when future has items', () => {
      const { saveSnapshot, undo, canRedo } = useHistoryStore.getState();

      saveSnapshot(createMockState(1));
      saveSnapshot(createMockState(2));
      undo();

      expect(canRedo()).toBe(true);
    });
  });
});
