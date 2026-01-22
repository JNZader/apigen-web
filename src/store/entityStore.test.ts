import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEntityStore } from './entityStore';

describe('entityStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useEntityStore.setState({
      entities: [],
      selectedEntityId: null,
      selectedEntityIds: [],
      _onEntityRemove: undefined,
      _onSetEntities: undefined,
    });
  });

  describe('addEntity', () => {
    it('should add a new entity with generated id', () => {
      const { addEntity } = useEntityStore.getState();

      const entity = addEntity('User');

      expect(entity.id).toBeDefined();
      expect(entity.name).toBe('User');
    });

    it('should generate table name in snake_case with plural', () => {
      const { addEntity } = useEntityStore.getState();

      const entity = addEntity('UserProfile');

      expect(entity.tableName).toBe('user_profiles');
    });

    it('should set default config values', () => {
      const { addEntity } = useEntityStore.getState();

      const entity = addEntity('Test');

      expect(entity.config.generateController).toBe(true);
      expect(entity.config.generateService).toBe(true);
      expect(entity.config.enableCaching).toBe(true);
    });

    it('should auto-select the new entity', () => {
      const { addEntity } = useEntityStore.getState();

      const entity = addEntity('Test');

      expect(useEntityStore.getState().selectedEntityId).toBe(entity.id);
    });

    it('should position entities in grid pattern', () => {
      const { addEntity } = useEntityStore.getState();

      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');

      // First entity at grid position (0,0)
      expect(entity1.position.x).toBe(50);
      expect(entity1.position.y).toBe(50);

      // Second entity at grid position (1,0)
      expect(entity2.position.x).toBe(370); // 50 + 320
      expect(entity2.position.y).toBe(50);
    });

    it('should wrap to new row after 4 entities', () => {
      const { addEntity } = useEntityStore.getState();

      for (let i = 0; i < 4; i++) {
        addEntity(`Entity${i}`);
      }
      const fifthEntity = addEntity('Fifth');

      // Fifth entity should be at row 1, column 0
      expect(fifthEntity.position.x).toBe(50);
      expect(fifthEntity.position.y).toBe(300); // 50 + 250
    });

    it('should start with empty fields array', () => {
      const { addEntity } = useEntityStore.getState();

      const entity = addEntity('Test');

      expect(entity.fields).toEqual([]);
    });
  });

  describe('updateEntity', () => {
    it('should update entity properties', () => {
      const { addEntity, updateEntity } = useEntityStore.getState();
      const entity = addEntity('Original');

      updateEntity(entity.id, { name: 'Updated' });

      const { entities } = useEntityStore.getState();
      expect(entities[0].name).toBe('Updated');
    });

    it('should preserve other properties when updating', () => {
      const { addEntity, updateEntity } = useEntityStore.getState();
      const entity = addEntity('Original');

      updateEntity(entity.id, { name: 'Updated' });

      const { entities } = useEntityStore.getState();
      expect(entities[0].tableName).toBe('originals');
      expect(entities[0].id).toBe(entity.id);
    });

    it('should not affect other entities', () => {
      const { addEntity, updateEntity } = useEntityStore.getState();
      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');

      updateEntity(entity1.id, { name: 'Updated' });

      const { entities } = useEntityStore.getState();
      expect(entities.find((e) => e.id === entity2.id)?.name).toBe('Second');
    });

    it('should update position', () => {
      const { addEntity, updateEntity } = useEntityStore.getState();
      const entity = addEntity('Test');

      updateEntity(entity.id, { position: { x: 100, y: 200 } });

      const { entities } = useEntityStore.getState();
      expect(entities[0].position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('removeEntity', () => {
    it('should remove the entity from the list', () => {
      const { addEntity, removeEntity } = useEntityStore.getState();
      const entity = addEntity('ToRemove');

      removeEntity(entity.id);

      expect(useEntityStore.getState().entities).toHaveLength(0);
    });

    it('should clear selection if removed entity was selected', () => {
      const { addEntity, removeEntity } = useEntityStore.getState();
      const entity = addEntity('Test');

      expect(useEntityStore.getState().selectedEntityId).toBe(entity.id);
      removeEntity(entity.id);

      expect(useEntityStore.getState().selectedEntityId).toBeNull();
    });

    it('should not clear selection if different entity removed', () => {
      const { addEntity, removeEntity, selectEntity } = useEntityStore.getState();
      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');

      selectEntity(entity1.id);
      removeEntity(entity2.id);

      expect(useEntityStore.getState().selectedEntityId).toBe(entity1.id);
    });

    it('should remove from multi-selection if entity was selected', () => {
      const { addEntity, removeEntity, toggleEntitySelection } = useEntityStore.getState();
      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');

      toggleEntitySelection(entity1.id);
      toggleEntitySelection(entity2.id);

      removeEntity(entity1.id);

      expect(useEntityStore.getState().selectedEntityIds).not.toContain(entity1.id);
      expect(useEntityStore.getState().selectedEntityIds).toContain(entity2.id);
    });

    it('should call _onEntityRemove callback if set', () => {
      const callback = vi.fn();
      const { addEntity, removeEntity, _setOnEntityRemove } = useEntityStore.getState();
      _setOnEntityRemove(callback);

      const entity = addEntity('Test');
      removeEntity(entity.id);

      expect(callback).toHaveBeenCalledWith(entity.id);
    });
  });

  describe('selectEntity', () => {
    it('should select an entity by id', () => {
      const { addEntity, selectEntity } = useEntityStore.getState();
      addEntity('First');
      const entity2 = addEntity('Second');

      selectEntity(entity2.id);

      expect(useEntityStore.getState().selectedEntityId).toBe(entity2.id);
    });

    it('should clear selection when null passed', () => {
      const { addEntity, selectEntity } = useEntityStore.getState();
      addEntity('Test');

      selectEntity(null);

      expect(useEntityStore.getState().selectedEntityId).toBeNull();
    });

    it('should clear multi-selection when selecting', () => {
      const { addEntity, selectEntity, toggleEntitySelection } = useEntityStore.getState();
      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');

      toggleEntitySelection(entity1.id);
      toggleEntitySelection(entity2.id);
      selectEntity(entity1.id);

      expect(useEntityStore.getState().selectedEntityIds).toEqual([]);
    });
  });

  describe('toggleEntitySelection (multi-select)', () => {
    it('should add entity to multi-selection', () => {
      const { addEntity, toggleEntitySelection } = useEntityStore.getState();
      const entity = addEntity('Test');

      toggleEntitySelection(entity.id);

      expect(useEntityStore.getState().selectedEntityIds).toContain(entity.id);
    });

    it('should set primary selection when adding to multi-selection', () => {
      const { addEntity, toggleEntitySelection } = useEntityStore.getState();
      const entity1 = addEntity('First');
      addEntity('Second');

      toggleEntitySelection(entity1.id);

      expect(useEntityStore.getState().selectedEntityId).toBe(entity1.id);
    });

    it('should remove entity from multi-selection if already selected', () => {
      const { addEntity, toggleEntitySelection } = useEntityStore.getState();
      const entity = addEntity('Test');

      toggleEntitySelection(entity.id);
      toggleEntitySelection(entity.id);

      expect(useEntityStore.getState().selectedEntityIds).not.toContain(entity.id);
    });

    it('should clear primary selection if toggled entity was primary', () => {
      const { addEntity, toggleEntitySelection, selectEntity } = useEntityStore.getState();
      const entity = addEntity('Test');

      selectEntity(entity.id);
      toggleEntitySelection(entity.id);
      toggleEntitySelection(entity.id); // Deselect

      expect(useEntityStore.getState().selectedEntityId).toBeNull();
    });

    it('should support multiple entities in multi-selection', () => {
      const { addEntity, toggleEntitySelection } = useEntityStore.getState();
      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');
      const entity3 = addEntity('Third');

      toggleEntitySelection(entity1.id);
      toggleEntitySelection(entity2.id);
      toggleEntitySelection(entity3.id);

      const { selectedEntityIds } = useEntityStore.getState();
      expect(selectedEntityIds).toContain(entity1.id);
      expect(selectedEntityIds).toContain(entity2.id);
      expect(selectedEntityIds).toContain(entity3.id);
    });
  });

  describe('clearEntitySelection', () => {
    it('should clear both primary and multi-selection', () => {
      const { addEntity, toggleEntitySelection, clearEntitySelection } =
        useEntityStore.getState();
      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');

      toggleEntitySelection(entity1.id);
      toggleEntitySelection(entity2.id);

      clearEntitySelection();

      expect(useEntityStore.getState().selectedEntityId).toBeNull();
      expect(useEntityStore.getState().selectedEntityIds).toEqual([]);
    });
  });

  describe('getEntity', () => {
    it('should return entity by id', () => {
      const { addEntity, getEntity } = useEntityStore.getState();
      const entity = addEntity('Test');

      const found = getEntity(entity.id);

      expect(found).toEqual(entity);
    });

    it('should return undefined for non-existent id', () => {
      const { getEntity } = useEntityStore.getState();

      const found = getEntity('non-existent');

      expect(found).toBeUndefined();
    });
  });

  describe('setEntities', () => {
    it('should replace all entities', () => {
      const { addEntity, setEntities } = useEntityStore.getState();
      addEntity('Old1');
      addEntity('Old2');

      setEntities([
        {
          id: 'new-1',
          name: 'New',
          tableName: 'news',
          position: { x: 0, y: 0 },
          fields: [],
          config: { generateController: true, generateService: true, enableCaching: true },
        },
      ]);

      const { entities } = useEntityStore.getState();
      expect(entities).toHaveLength(1);
      expect(entities[0].id).toBe('new-1');
    });

    it('should clear selection', () => {
      const { addEntity, setEntities } = useEntityStore.getState();
      addEntity('Test');

      setEntities([]);

      expect(useEntityStore.getState().selectedEntityId).toBeNull();
      expect(useEntityStore.getState().selectedEntityIds).toEqual([]);
    });

    it('should call _onSetEntities callback if set', () => {
      const callback = vi.fn();
      const { _setOnSetEntities, setEntities } = useEntityStore.getState();
      _setOnSetEntities(callback);

      setEntities([]);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Field operations', () => {
    describe('addField', () => {
      it('should add a field to an entity', () => {
        const { addEntity, addField } = useEntityStore.getState();
        const entity = addEntity('User');

        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: false,
          unique: true,
          validations: [],
        });

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields).toHaveLength(1);
        expect(entities[0].fields[0].name).toBe('email');
      });

      it('should generate field id', () => {
        const { addEntity, addField } = useEntityStore.getState();
        const entity = addEntity('User');

        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields[0].id).toBeDefined();
        expect(entities[0].fields[0].id.length).toBeGreaterThan(0);
      });

      it('should auto-generate columnName from name if not provided', () => {
        const { addEntity, addField } = useEntityStore.getState();
        const entity = addEntity('User');

        addField(entity.id, {
          name: 'firstName',
          columnName: '',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields[0].columnName).toBe('first_name');
      });

      it('should add multiple fields', () => {
        const { addEntity, addField } = useEntityStore.getState();
        const entity = addEntity('User');

        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: false,
          unique: true,
          validations: [],
        });
        addField(entity.id, {
          name: 'age',
          columnName: 'age',
          type: 'Integer',
          nullable: true,
          unique: false,
          validations: [],
        });

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields).toHaveLength(2);
      });

      it('should not affect other entities', () => {
        const { addEntity, addField } = useEntityStore.getState();
        const entity1 = addEntity('User');
        const entity2 = addEntity('Product');

        addField(entity1.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });

        const { entities } = useEntityStore.getState();
        const product = entities.find((e) => e.id === entity2.id);
        expect(product?.fields).toHaveLength(0);
      });
    });

    describe('updateField', () => {
      it('should update field properties', () => {
        const { addEntity, addField, updateField } = useEntityStore.getState();
        const entity = addEntity('User');
        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });

        const fieldId = useEntityStore.getState().entities[0].fields[0].id;
        updateField(entity.id, fieldId, { nullable: false, unique: true });

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields[0].nullable).toBe(false);
        expect(entities[0].fields[0].unique).toBe(true);
      });

      it('should preserve other field properties', () => {
        const { addEntity, addField, updateField } = useEntityStore.getState();
        const entity = addEntity('User');
        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });

        const fieldId = useEntityStore.getState().entities[0].fields[0].id;
        updateField(entity.id, fieldId, { name: 'userEmail' });

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields[0].type).toBe('String');
        expect(entities[0].fields[0].columnName).toBe('email');
      });

      it('should not affect other fields', () => {
        const { addEntity, addField, updateField } = useEntityStore.getState();
        const entity = addEntity('User');
        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });
        addField(entity.id, {
          name: 'name',
          columnName: 'name',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });

        const fieldId = useEntityStore.getState().entities[0].fields[0].id;
        updateField(entity.id, fieldId, { name: 'userEmail' });

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields[1].name).toBe('name');
      });
    });

    describe('removeField', () => {
      it('should remove field from entity', () => {
        const { addEntity, addField, removeField } = useEntityStore.getState();
        const entity = addEntity('User');
        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });

        const fieldId = useEntityStore.getState().entities[0].fields[0].id;
        removeField(entity.id, fieldId);

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields).toHaveLength(0);
      });

      it('should only remove the specified field', () => {
        const { addEntity, addField, removeField } = useEntityStore.getState();
        const entity = addEntity('User');
        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });
        addField(entity.id, {
          name: 'name',
          columnName: 'name',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });

        const fieldId = useEntityStore.getState().entities[0].fields[0].id;
        removeField(entity.id, fieldId);

        const { entities } = useEntityStore.getState();
        expect(entities[0].fields).toHaveLength(1);
        expect(entities[0].fields[0].name).toBe('name');
      });
    });
  });

  describe('updateEntityPositions', () => {
    it('should update positions for multiple entities', () => {
      const { addEntity, updateEntityPositions } = useEntityStore.getState();
      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');

      const positions = new Map([
        [entity1.id, { x: 100, y: 100 }],
        [entity2.id, { x: 200, y: 200 }],
      ]);

      updateEntityPositions(positions);

      const { entities } = useEntityStore.getState();
      expect(entities.find((e) => e.id === entity1.id)?.position).toEqual({
        x: 100,
        y: 100,
      });
      expect(entities.find((e) => e.id === entity2.id)?.position).toEqual({
        x: 200,
        y: 200,
      });
    });

    it('should not affect entities not in positions map', () => {
      const { addEntity, updateEntityPositions } = useEntityStore.getState();
      const entity1 = addEntity('First');
      const entity2 = addEntity('Second');
      const originalPos2 = { ...entity2.position };

      const positions = new Map([[entity1.id, { x: 100, y: 100 }]]);

      updateEntityPositions(positions);

      const { entities } = useEntityStore.getState();
      expect(entities.find((e) => e.id === entity2.id)?.position).toEqual(originalPos2);
    });
  });

  describe('internal callbacks', () => {
    it('should set and clear _onEntityRemove callback', () => {
      const callback = vi.fn();
      const { _setOnEntityRemove } = useEntityStore.getState();

      _setOnEntityRemove(callback);
      expect(useEntityStore.getState()._onEntityRemove).toBe(callback);

      _setOnEntityRemove(undefined);
      expect(useEntityStore.getState()._onEntityRemove).toBeUndefined();
    });

    it('should set and clear _onSetEntities callback', () => {
      const callback = vi.fn();
      const { _setOnSetEntities } = useEntityStore.getState();

      _setOnSetEntities(callback);
      expect(useEntityStore.getState()._onSetEntities).toBe(callback);

      _setOnSetEntities(undefined);
      expect(useEntityStore.getState()._onSetEntities).toBeUndefined();
    });
  });
});
