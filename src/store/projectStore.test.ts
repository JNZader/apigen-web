import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ForeignKeyConfig, RelationDesign } from '../types/relation';
import { useProjectStore } from './projectStore';

// Helper to create foreign key config
const createForeignKey = (
  columnName: string,
  overrides: Partial<ForeignKeyConfig> = {},
): ForeignKeyConfig => ({
  columnName,
  nullable: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  ...overrides,
});

// Helper to create relation config for tests
const createRelationConfig = (
  sourceEntityId: string,
  targetEntityId: string,
  sourceFieldName: string,
  overrides: Partial<Omit<RelationDesign, 'id'>> = {},
): Omit<RelationDesign, 'id'> => ({
  type: 'ManyToOne',
  sourceEntityId,
  targetEntityId,
  sourceFieldName,
  bidirectional: false,
  fetchType: 'LAZY',
  cascade: [],
  foreignKey: createForeignKey(`${sourceFieldName}_id`),
  ...overrides,
});

describe('projectStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetProject, setEntities, setRelations } = useProjectStore.getState();
    act(() => {
      resetProject();
      setEntities([]);
      setRelations([]);
    });
  });

  describe('Entity actions', () => {
    it('should add an entity', () => {
      const { addEntity } = useProjectStore.getState();

      act(() => {
        addEntity('User');
      });

      const state = useProjectStore.getState();
      expect(state.entities).toHaveLength(1);
      expect(state.entities[0].name).toBe('User');
      expect(state.entities[0].tableName).toBe('users');
    });

    it('should update an entity', () => {
      const { addEntity } = useProjectStore.getState();

      let entity: ReturnType<typeof addEntity>;
      act(() => {
        entity = addEntity('Product');
      });

      const { updateEntity } = useProjectStore.getState();
      act(() => {
        updateEntity(entity.id, { description: 'A product entity' });
      });

      const state = useProjectStore.getState();
      expect(state.entities[0].description).toBe('A product entity');
    });

    it('should remove an entity', () => {
      const { addEntity } = useProjectStore.getState();

      let entity: ReturnType<typeof addEntity>;
      act(() => {
        entity = addEntity('Order');
      });

      expect(useProjectStore.getState().entities).toHaveLength(1);

      const { removeEntity } = useProjectStore.getState();
      act(() => {
        removeEntity(entity.id);
      });

      expect(useProjectStore.getState().entities).toHaveLength(0);
    });

    it('should select an entity', () => {
      const { addEntity } = useProjectStore.getState();

      let entity!: ReturnType<typeof addEntity>;
      act(() => {
        entity = addEntity('Customer');
      });

      const { selectEntity } = useProjectStore.getState();
      act(() => {
        selectEntity(entity.id);
      });

      expect(useProjectStore.getState().selectedEntityId).toBe(entity.id);

      act(() => {
        selectEntity(null);
      });

      expect(useProjectStore.getState().selectedEntityId).toBeNull();
    });

    it('should get an entity by id', () => {
      const { addEntity } = useProjectStore.getState();

      let entity!: ReturnType<typeof addEntity>;
      act(() => {
        entity = addEntity('Item');
      });

      const { getEntity } = useProjectStore.getState();
      const found = getEntity(entity.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Item');
    });

    it('should return undefined for non-existent entity', () => {
      const { getEntity } = useProjectStore.getState();
      const found = getEntity('non-existent-id');

      expect(found).toBeUndefined();
    });
  });

  describe('Field actions', () => {
    it('should add a field to an entity', () => {
      const { addEntity } = useProjectStore.getState();

      let entity: ReturnType<typeof addEntity>;
      act(() => {
        entity = addEntity('Person');
      });

      const { addField } = useProjectStore.getState();
      act(() => {
        addField(entity.id, {
          name: 'firstName',
          columnName: 'first_name',
          type: 'String',
          nullable: false,
          unique: false,
          validations: [],
        });
      });

      const state = useProjectStore.getState();
      expect(state.entities[0].fields).toHaveLength(1);
      expect(state.entities[0].fields[0].name).toBe('firstName');
    });

    it('should update a field', () => {
      const { addEntity, addField } = useProjectStore.getState();

      let entity: ReturnType<typeof addEntity>;
      act(() => {
        entity = addEntity('Account');
        addField(entity.id, {
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        });
      });

      const fieldId = useProjectStore.getState().entities[0].fields[0].id;

      const { updateField } = useProjectStore.getState();
      act(() => {
        updateField(entity.id, fieldId, { unique: true, nullable: false });
      });

      const updatedField = useProjectStore.getState().entities[0].fields[0];
      expect(updatedField.unique).toBe(true);
      expect(updatedField.nullable).toBe(false);
    });

    it('should remove a field', () => {
      const { addEntity, addField } = useProjectStore.getState();

      let entity: ReturnType<typeof addEntity>;
      act(() => {
        entity = addEntity('Task');
        addField(entity.id, {
          name: 'title',
          columnName: 'title',
          type: 'String',
          nullable: false,
          unique: false,
          validations: [],
        });
      });

      expect(useProjectStore.getState().entities[0].fields).toHaveLength(1);

      const fieldId = useProjectStore.getState().entities[0].fields[0].id;
      const { removeField } = useProjectStore.getState();

      act(() => {
        removeField(entity.id, fieldId);
      });

      expect(useProjectStore.getState().entities[0].fields).toHaveLength(0);
    });
  });

  describe('Relation actions', () => {
    it('should add a relation', () => {
      const { addEntity, addRelation } = useProjectStore.getState();

      let sourceEntity: ReturnType<typeof addEntity>;
      let targetEntity: ReturnType<typeof addEntity>;

      act(() => {
        sourceEntity = addEntity('Order');
        targetEntity = addEntity('Customer');
        addRelation(createRelationConfig(sourceEntity.id, targetEntity.id, 'customer'));
      });

      const state = useProjectStore.getState();
      expect(state.relations).toHaveLength(1);
      expect(state.relations[0].type).toBe('ManyToOne');
    });

    it('should update a relation', () => {
      const { addEntity, addRelation } = useProjectStore.getState();

      let sourceEntity: ReturnType<typeof addEntity>;
      let targetEntity: ReturnType<typeof addEntity>;

      act(() => {
        sourceEntity = addEntity('Post');
        targetEntity = addEntity('Author');
        addRelation(
          createRelationConfig(sourceEntity.id, targetEntity.id, 'author', {
            foreignKey: createForeignKey('author_id', { nullable: true, onDelete: 'SET_NULL' }),
          }),
        );
      });

      const relationId = useProjectStore.getState().relations[0].id;
      const { updateRelation } = useProjectStore.getState();

      act(() => {
        updateRelation(relationId, { bidirectional: true, fetchType: 'EAGER' });
      });

      const state = useProjectStore.getState();
      expect(state.relations[0].bidirectional).toBe(true);
      expect(state.relations[0].fetchType).toBe('EAGER');
    });

    it('should remove a relation', () => {
      const { addEntity, addRelation } = useProjectStore.getState();

      let sourceEntity: ReturnType<typeof addEntity>;
      let targetEntity: ReturnType<typeof addEntity>;

      act(() => {
        sourceEntity = addEntity('Comment');
        targetEntity = addEntity('Article');
        addRelation(createRelationConfig(sourceEntity.id, targetEntity.id, 'article'));
      });

      expect(useProjectStore.getState().relations).toHaveLength(1);

      const relationId = useProjectStore.getState().relations[0].id;
      const { removeRelation } = useProjectStore.getState();

      act(() => {
        removeRelation(relationId);
      });

      expect(useProjectStore.getState().relations).toHaveLength(0);
    });

    it('should remove relations when entity is removed', () => {
      const { addEntity, addRelation } = useProjectStore.getState();

      let sourceEntity: ReturnType<typeof addEntity>;
      let targetEntity: ReturnType<typeof addEntity>;

      act(() => {
        sourceEntity = addEntity('Review');
        targetEntity = addEntity('Product');
        addRelation(createRelationConfig(sourceEntity.id, targetEntity.id, 'product'));
      });

      expect(useProjectStore.getState().relations).toHaveLength(1);

      const { removeEntity } = useProjectStore.getState();
      act(() => {
        removeEntity(sourceEntity.id);
      });

      // Relations involving the removed entity should be deleted
      expect(useProjectStore.getState().relations).toHaveLength(0);
    });
  });

  describe('Project actions', () => {
    it('should update project config', () => {
      const { setProject } = useProjectStore.getState();

      act(() => {
        setProject({
          name: 'My New API',
          groupId: 'com.example',
          artifactId: 'my-api',
        });
      });

      const state = useProjectStore.getState();
      expect(state.project.name).toBe('My New API');
      expect(state.project.groupId).toBe('com.example');
      expect(state.project.artifactId).toBe('my-api');
    });

    it('should reset project to defaults', () => {
      const { setProject, addEntity, resetProject } = useProjectStore.getState();

      act(() => {
        setProject({ name: 'Custom Project' });
        addEntity('TestEntity');
      });

      expect(useProjectStore.getState().project.name).toBe('Custom Project');
      expect(useProjectStore.getState().entities).toHaveLength(1);

      act(() => {
        resetProject();
      });

      const state = useProjectStore.getState();
      expect(state.project.name).toBe('My API');
      expect(state.entities).toHaveLength(0);
    });
  });

  describe('Import/Export', () => {
    it('should export project as JSON', () => {
      const { addEntity, exportProject } = useProjectStore.getState();

      act(() => {
        addEntity('ExportTest');
      });

      const json = exportProject();
      const parsed = JSON.parse(json);

      expect(parsed.entities).toHaveLength(1);
      expect(parsed.entities[0].name).toBe('ExportTest');
      expect(parsed.project).toBeDefined();
      expect(parsed.relations).toBeDefined();
    });

    it('should import project from JSON', () => {
      const projectData = {
        project: {
          name: 'Imported Project',
          groupId: 'com.imported',
          artifactId: 'imported-api',
          packageName: 'com.imported.api',
          javaVersion: '21',
          springBootVersion: '4.0.0',
          database: { type: 'postgresql', generateMigrations: true },
          modules: { core: true, security: false },
          features: {
            docker: true,
            hateoas: true,
            swagger: true,
            softDelete: true,
            auditing: true,
            caching: true,
            rateLimiting: false,
            virtualThreads: true,
          },
          securityConfig: {
            jwtSecretLength: 64,
            accessTokenExpiration: 30,
            refreshTokenExpiration: 7,
            enableRefreshToken: true,
            enableTokenBlacklist: true,
            passwordMinLength: 8,
            maxLoginAttempts: 5,
          },
          rateLimitConfig: {
            requestsPerSecond: 10,
            burstCapacity: 20,
            enablePerUser: true,
            enablePerEndpoint: false,
          },
        },
        entities: [
          {
            id: 'imported-1',
            name: 'ImportedEntity',
            tableName: 'imported_entities',
            description: '',
            position: { x: 100, y: 100 },
            fields: [],
            config: {
              generateController: true,
              generateService: true,
              enableCaching: false,
            },
          },
        ],
        relations: [],
      };

      const { importProject } = useProjectStore.getState();

      act(() => {
        importProject(JSON.stringify(projectData));
      });

      const state = useProjectStore.getState();
      expect(state.project.name).toBe('Imported Project');
      expect(state.entities).toHaveLength(1);
      expect(state.entities[0].name).toBe('ImportedEntity');
    });
  });

  describe('Layout actions', () => {
    it('should update entity positions', () => {
      const { addEntity } = useProjectStore.getState();

      let entity!: ReturnType<typeof addEntity>;
      act(() => {
        entity = addEntity('PositionTest');
      });

      const { updateEntityPositions } = useProjectStore.getState();
      const positions = new Map([[entity.id, { x: 200, y: 300 }]]);

      act(() => {
        updateEntityPositions(positions);
      });

      const state = useProjectStore.getState();
      expect(state.entities[0].position).toEqual({ x: 200, y: 300 });
    });

    it('should set layout preference', () => {
      const { setLayoutPreference } = useProjectStore.getState();

      act(() => {
        setLayoutPreference('horizontal');
      });

      expect(useProjectStore.getState().layoutPreference).toBe('horizontal');
    });

    it('should set needsAutoLayout flag', () => {
      const { setNeedsAutoLayout } = useProjectStore.getState();

      act(() => {
        setNeedsAutoLayout(true);
      });

      expect(useProjectStore.getState().needsAutoLayout).toBe(true);

      act(() => {
        setNeedsAutoLayout(false);
      });

      expect(useProjectStore.getState().needsAutoLayout).toBe(false);
    });
  });
});
