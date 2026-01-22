import { describe, it, expect } from 'vitest';
import {
  createDefaultRelation,
  RELATION_TYPES,
  CASCADE_TYPES,
  FK_ACTIONS,
} from './relation';

describe('relation type utilities', () => {
  describe('createDefaultRelation', () => {
    it('should create relation with source and target entity ids', () => {
      const relation = createDefaultRelation('source-1', 'target-1');

      expect(relation.sourceEntityId).toBe('source-1');
      expect(relation.targetEntityId).toBe('target-1');
    });

    it('should have empty id by default', () => {
      const relation = createDefaultRelation('source-1', 'target-1');

      expect(relation.id).toBe('');
    });

    it('should default to ManyToOne type', () => {
      const relation = createDefaultRelation('source-1', 'target-1');

      expect(relation.type).toBe('ManyToOne');
    });

    it('should have empty source field name by default', () => {
      const relation = createDefaultRelation('source-1', 'target-1');

      expect(relation.sourceFieldName).toBe('');
    });

    it('should not be bidirectional by default', () => {
      const relation = createDefaultRelation('source-1', 'target-1');

      expect(relation.bidirectional).toBe(false);
    });

    it('should default to LAZY fetch type', () => {
      const relation = createDefaultRelation('source-1', 'target-1');

      expect(relation.fetchType).toBe('LAZY');
    });

    it('should have empty cascade array by default', () => {
      const relation = createDefaultRelation('source-1', 'target-1');

      expect(relation.cascade).toEqual([]);
    });

    it('should have default foreign key configuration', () => {
      const relation = createDefaultRelation('source-1', 'target-1');

      expect(relation.foreignKey).toEqual({
        columnName: '',
        nullable: true,
        onDelete: 'NO_ACTION',
        onUpdate: 'NO_ACTION',
      });
    });

    it('should create new object each time', () => {
      const relation1 = createDefaultRelation('a', 'b');
      const relation2 = createDefaultRelation('c', 'd');

      expect(relation1).not.toBe(relation2);
      expect(relation1.foreignKey).not.toBe(relation2.foreignKey);
    });
  });

  describe('RELATION_TYPES constant', () => {
    it('should have all relation types', () => {
      const values = RELATION_TYPES.map((r) => r.value);

      expect(values).toContain('OneToOne');
      expect(values).toContain('OneToMany');
      expect(values).toContain('ManyToOne');
      expect(values).toContain('ManyToMany');
    });

    it('should have 4 relation types', () => {
      expect(RELATION_TYPES).toHaveLength(4);
    });

    it('should have labels and descriptions for each type', () => {
      for (const type of RELATION_TYPES) {
        expect(type.label).toBeDefined();
        expect(type.label.length).toBeGreaterThan(0);
        expect(type.description).toBeDefined();
        expect(type.description.length).toBeGreaterThan(0);
      }
    });

    it('should have human-readable labels', () => {
      const manyToOne = RELATION_TYPES.find((r) => r.value === 'ManyToOne');
      expect(manyToOne?.label).toContain('N:1');

      const oneToMany = RELATION_TYPES.find((r) => r.value === 'OneToMany');
      expect(oneToMany?.label).toContain('1:N');
    });
  });

  describe('CASCADE_TYPES constant', () => {
    it('should have all cascade types', () => {
      const values = CASCADE_TYPES.map((c) => c.value);

      expect(values).toContain('ALL');
      expect(values).toContain('PERSIST');
      expect(values).toContain('MERGE');
      expect(values).toContain('REMOVE');
      expect(values).toContain('REFRESH');
      expect(values).toContain('DETACH');
    });

    it('should have 6 cascade types', () => {
      expect(CASCADE_TYPES).toHaveLength(6);
    });

    it('should have labels for each type', () => {
      for (const type of CASCADE_TYPES) {
        expect(type.label).toBeDefined();
        expect(type.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('FK_ACTIONS constant', () => {
    it('should have all FK actions', () => {
      const values = FK_ACTIONS.map((f) => f.value);

      expect(values).toContain('CASCADE');
      expect(values).toContain('SET_NULL');
      expect(values).toContain('RESTRICT');
      expect(values).toContain('NO_ACTION');
    });

    it('should have 4 FK actions', () => {
      expect(FK_ACTIONS).toHaveLength(4);
    });

    it('should have labels for each action', () => {
      for (const action of FK_ACTIONS) {
        expect(action.label).toBeDefined();
        expect(action.label.length).toBeGreaterThan(0);
      }
    });

    it('should have human-readable labels', () => {
      const setNull = FK_ACTIONS.find((a) => a.value === 'SET_NULL');
      expect(setNull?.label).toBe('Set Null');

      const noAction = FK_ACTIONS.find((a) => a.value === 'NO_ACTION');
      expect(noAction?.label).toBe('No Action');
    });
  });
});
