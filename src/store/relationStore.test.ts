import { describe, it, expect, beforeEach } from 'vitest';
import { useRelationStore } from './relationStore';
import type { RelationDesign } from '../types/relation';

// Helper to create a mock relation without id
function createMockRelation(
  sourceEntityId: string,
  targetEntityId: string,
): Omit<RelationDesign, 'id'> {
  return {
    type: 'oneToMany',
    sourceEntityId,
    targetEntityId,
    sourceFieldName: 'items',
    targetFieldName: 'parent',
  };
}

describe('relationStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useRelationStore.setState({
      relations: [],
    });
  });

  describe('addRelation', () => {
    it('should add a new relation with generated id', () => {
      const { addRelation } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));

      const { relations } = useRelationStore.getState();
      expect(relations).toHaveLength(1);
      expect(relations[0].id).toBeDefined();
      expect(relations[0].sourceEntityId).toBe('entity-1');
      expect(relations[0].targetEntityId).toBe('entity-2');
    });

    it('should add multiple relations', () => {
      const { addRelation } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-2', 'entity-3'));

      const { relations } = useRelationStore.getState();
      expect(relations).toHaveLength(2);
    });

    it('should generate unique ids for each relation', () => {
      const { addRelation } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-1', 'entity-3'));

      const { relations } = useRelationStore.getState();
      expect(relations[0].id).not.toBe(relations[1].id);
    });
  });

  describe('updateRelation', () => {
    it('should update relation properties', () => {
      const { addRelation, updateRelation } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      const { relations: [relation] } = useRelationStore.getState();

      updateRelation(relation.id, { type: 'manyToMany', sourceFieldName: 'updatedField' });

      const { relations } = useRelationStore.getState();
      expect(relations[0].type).toBe('manyToMany');
      expect(relations[0].sourceFieldName).toBe('updatedField');
    });

    it('should not affect other relations', () => {
      const { addRelation, updateRelation } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-2', 'entity-3'));

      const { relations } = useRelationStore.getState();
      updateRelation(relations[0].id, { sourceFieldName: 'changed' });

      const updatedRelations = useRelationStore.getState().relations;
      expect(updatedRelations[1].sourceFieldName).toBe('items');
    });
  });

  describe('removeRelation', () => {
    it('should remove the relation from the list', () => {
      const { addRelation, removeRelation } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      const { relations: [relation] } = useRelationStore.getState();

      removeRelation(relation.id);

      expect(useRelationStore.getState().relations).toHaveLength(0);
    });

    it('should only remove the specified relation', () => {
      const { addRelation, removeRelation } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-2', 'entity-3'));

      const { relations } = useRelationStore.getState();
      removeRelation(relations[0].id);

      const updatedRelations = useRelationStore.getState().relations;
      expect(updatedRelations).toHaveLength(1);
      expect(updatedRelations[0].sourceEntityId).toBe('entity-2');
    });
  });

  describe('setRelations', () => {
    it('should replace all relations', () => {
      const { addRelation, setRelations } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-2', 'entity-3'));

      const newRelations: RelationDesign[] = [
        {
          id: 'new-relation-1',
          type: 'oneToOne',
          sourceEntityId: 'entity-a',
          targetEntityId: 'entity-b',
          sourceFieldName: 'item',
        },
      ];

      setRelations(newRelations);

      const { relations } = useRelationStore.getState();
      expect(relations).toHaveLength(1);
      expect(relations[0].id).toBe('new-relation-1');
    });

    it('should clear all relations when set to empty array', () => {
      const { addRelation, setRelations } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));

      setRelations([]);

      expect(useRelationStore.getState().relations).toHaveLength(0);
    });
  });

  describe('removeRelationsForEntity', () => {
    it('should remove relations where entity is source', () => {
      const { addRelation, removeRelationsForEntity } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-1', 'entity-3'));
      addRelation(createMockRelation('entity-2', 'entity-3'));

      removeRelationsForEntity('entity-1');

      const { relations } = useRelationStore.getState();
      expect(relations).toHaveLength(1);
      expect(relations[0].sourceEntityId).toBe('entity-2');
    });

    it('should remove relations where entity is target', () => {
      const { addRelation, removeRelationsForEntity } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-3', 'entity-2'));
      addRelation(createMockRelation('entity-1', 'entity-3'));

      removeRelationsForEntity('entity-2');

      const { relations } = useRelationStore.getState();
      expect(relations).toHaveLength(1);
      expect(relations[0].sourceEntityId).toBe('entity-1');
      expect(relations[0].targetEntityId).toBe('entity-3');
    });

    it('should remove all relations for entity in both directions', () => {
      const { addRelation, removeRelationsForEntity } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-2', 'entity-1'));

      removeRelationsForEntity('entity-1');

      expect(useRelationStore.getState().relations).toHaveLength(0);
    });

    it('should not affect relations not involving the entity', () => {
      const { addRelation, removeRelationsForEntity } = useRelationStore.getState();

      addRelation(createMockRelation('entity-1', 'entity-2'));
      addRelation(createMockRelation('entity-3', 'entity-4'));

      removeRelationsForEntity('entity-1');

      const { relations } = useRelationStore.getState();
      expect(relations).toHaveLength(1);
      expect(relations[0].sourceEntityId).toBe('entity-3');
    });
  });
});
