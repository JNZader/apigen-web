import { describe, expect, it } from 'vitest';
import { applyTemplate, PROJECT_TEMPLATES, type ProjectTemplate } from '../data/templates';

describe('templates', () => {
  describe('PROJECT_TEMPLATES', () => {
    it('should have correct number of templates', () => {
      expect(PROJECT_TEMPLATES).toHaveLength(5);
    });

    it('should contain all required template IDs', () => {
      const templateIds = PROJECT_TEMPLATES.map((t) => t.id);
      expect(templateIds).toEqual(
        expect.arrayContaining(['blank', 'ecommerce', 'blog', 'task-manager', 'inventory']),
      );
    });

    it('should have blank template with empty entities and relations', () => {
      const blankTemplate = PROJECT_TEMPLATES.find((t) => t.id === 'blank');

      expect(blankTemplate).toBeDefined();
      expect(blankTemplate?.name).toBe('Blank Project');
      expect(blankTemplate?.entities).toEqual([]);
      expect(blankTemplate?.relations).toEqual([]);
    });

    it('should have all required fields in each template', () => {
      PROJECT_TEMPLATES.forEach((template: ProjectTemplate) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('icon');
        expect(template).toHaveProperty('entities');
        expect(template).toHaveProperty('relations');
      });
    });

    it('should have unique template IDs', () => {
      const templateIds = PROJECT_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(templateIds);
      expect(uniqueIds.size).toBe(templateIds.length);
    });

    it('should have e-commerce template with correct structure', () => {
      const ecommerce = PROJECT_TEMPLATES.find((t) => t.id === 'ecommerce');

      expect(ecommerce).toBeDefined();
      expect(ecommerce?.name).toBe('E-commerce');
      expect(ecommerce?.entities.length).toBeGreaterThan(0);
      expect(ecommerce?.relations.length).toBeGreaterThan(0);

      // Verify expected entities
      const entityNames = ecommerce?.entities.map((e) => e.name) || [];
      expect(entityNames).toContain('Product');
      expect(entityNames).toContain('Category');
      expect(entityNames).toContain('Customer');
      expect(entityNames).toContain('Order');
    });

    it('should have blog template with correct structure', () => {
      const blog = PROJECT_TEMPLATES.find((t) => t.id === 'blog');

      expect(blog).toBeDefined();
      expect(blog?.name).toBe('Blog');
      expect(blog?.entities.length).toBeGreaterThan(0);
      expect(blog?.relations.length).toBeGreaterThan(0);

      const entityNames = blog?.entities.map((e) => e.name) || [];
      expect(entityNames).toContain('Post');
      expect(entityNames).toContain('Author');
      expect(entityNames).toContain('Comment');
      expect(entityNames).toContain('Category');
      expect(entityNames).toContain('Tag');
    });

    it('should have task manager template with correct structure', () => {
      const taskManager = PROJECT_TEMPLATES.find((t) => t.id === 'task-manager');

      expect(taskManager).toBeDefined();
      expect(taskManager?.name).toBe('Task Manager');
      expect(taskManager?.entities.length).toBeGreaterThan(0);
      expect(taskManager?.relations.length).toBeGreaterThan(0);

      const entityNames = taskManager?.entities.map((e) => e.name) || [];
      expect(entityNames).toContain('Project');
      expect(entityNames).toContain('Task');
      expect(entityNames).toContain('User');
      expect(entityNames).toContain('Label');
    });

    it('should have inventory template with correct structure', () => {
      const inventory = PROJECT_TEMPLATES.find((t) => t.id === 'inventory');

      expect(inventory).toBeDefined();
      expect(inventory?.name).toBe('Inventory');
      expect(inventory?.entities.length).toBeGreaterThan(0);
      expect(inventory?.relations.length).toBeGreaterThan(0);

      const entityNames = inventory?.entities.map((e) => e.name) || [];
      expect(entityNames).toContain('Product');
      expect(entityNames).toContain('Warehouse');
      expect(entityNames).toContain('Stock');
      expect(entityNames).toContain('StockMovement');
    });

    it('should have valid entity structure in all templates', () => {
      PROJECT_TEMPLATES.forEach((template) => {
        template.entities.forEach((entity) => {
          expect(entity).toHaveProperty('name');
          expect(entity).toHaveProperty('tableName');
          expect(entity).toHaveProperty('position');
          expect(entity).toHaveProperty('fields');
          expect(entity).toHaveProperty('config');
          expect(Array.isArray(entity.fields)).toBe(true);
          expect(typeof entity.name).toBe('string');
          expect(typeof entity.tableName).toBe('string');
          expect(typeof entity.position).toBe('object');
          expect(entity.position).toHaveProperty('x');
          expect(entity.position).toHaveProperty('y');
        });
      });
    });

    it('should have valid relation structure in all templates', () => {
      PROJECT_TEMPLATES.forEach((template) => {
        if (template.id === 'blank') return; // Skip blank template

        template.relations.forEach((relation) => {
          expect(relation).toHaveProperty('sourceEntityName');
          expect(relation).toHaveProperty('targetEntityName');
          expect(relation).toHaveProperty('type');
          expect(relation).toHaveProperty('bidirectional');
          expect(relation).toHaveProperty('fetchType');
          expect(relation).toHaveProperty('cascade');
          expect(relation).toHaveProperty('foreignKey');
          expect(typeof relation.sourceEntityName).toBe('string');
          expect(typeof relation.targetEntityName).toBe('string');
          expect(relation.type).toMatch(/^(OneToOne|OneToMany|ManyToOne|ManyToMany)$/);
        });
      });
    });

    it('should have valid field structure in all entities', () => {
      PROJECT_TEMPLATES.forEach((template) => {
        template.entities.forEach((entity) => {
          entity.fields.forEach((field) => {
            expect(field).toHaveProperty('id');
            expect(field).toHaveProperty('name');
            expect(field).toHaveProperty('columnName');
            expect(field).toHaveProperty('type');
            expect(field).toHaveProperty('nullable');
            expect(field).toHaveProperty('unique');
            expect(field).toHaveProperty('validations');
            expect(typeof field.name).toBe('string');
            expect(typeof field.type).toBe('string');
            expect(typeof field.nullable).toBe('boolean');
            expect(typeof field.unique).toBe('boolean');
            expect(Array.isArray(field.validations)).toBe(true);
          });
        });
      });
    });
  });

  describe('applyTemplate', () => {
    it('should add IDs to all entities', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      expect(result.entities).toHaveLength(template.entities.length);
      result.entities.forEach((entity) => {
        expect(entity.id).toBeDefined();
        expect(typeof entity.id).toBe('string');
        expect(entity.id.length).toBeGreaterThan(0);
      });
    });

    it('should preserve all entity properties except ID', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      result.entities.forEach((entity, index) => {
        const original = template.entities[index];
        expect(entity.name).toBe(original.name);
        expect(entity.tableName).toBe(original.tableName);
        expect(entity.description).toBe(original.description);
        expect(entity.position).toEqual(original.position);
        expect(entity.fields).toEqual(original.fields);
        expect(entity.config).toEqual(original.config);
      });
    });

    it('should add IDs to all relations', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      expect(result.relations).toHaveLength(template.relations.length);
      result.relations.forEach((relation) => {
        expect(relation.id).toBeDefined();
        expect(typeof relation.id).toBe('string');
        expect(relation.id.length).toBeGreaterThan(0);
      });
    });

    it('should map entity names to IDs in relations', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      result.relations.forEach((relation) => {
        expect(relation.sourceEntityId).toBeDefined();
        expect(relation.targetEntityId).toBeDefined();
        expect(typeof relation.sourceEntityId).toBe('string');
        expect(typeof relation.targetEntityId).toBe('string');

        // Verify IDs match actual entities
        const sourceExists = result.entities.some((e) => e.id === relation.sourceEntityId);
        const targetExists = result.entities.some((e) => e.id === relation.targetEntityId);
        expect(sourceExists).toBe(true);
        expect(targetExists).toBe(true);
      });
    });

    it('should generate unique IDs for all entities', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      const entityIds = result.entities.map((e) => e.id);
      const uniqueIds = new Set(entityIds);
      expect(uniqueIds.size).toBe(entityIds.length);
    });

    it('should generate unique IDs for all relations', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      const relationIds = result.relations.map((r) => r.id);
      const uniqueIds = new Set(relationIds);
      expect(uniqueIds.size).toBe(relationIds.length);
    });

    it('should generate unique IDs for all fields', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      const allFieldIds = result.entities.flatMap((e) => e.fields.map((f) => f.id));
      const uniqueFieldIds = new Set(allFieldIds);
      expect(uniqueFieldIds.size).toBe(allFieldIds.length);
    });

    it('should throw error when relation references non-existent entity', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const invalidRelation = {
        sourceEntityName: 'Product',
        targetEntityName: 'NonExistentEntity',
        type: 'ManyToOne' as const,
        bidirectional: true,
        fetchType: 'LAZY' as const,
        cascade: [],
        foreignKey: {
          columnName: 'test_id',
          nullable: false,
          onDelete: 'CASCADE' as const,
          onUpdate: 'CASCADE' as const,
        },
      };

      const modifiedTemplate = {
        ...template,
        relations: [...template.relations, invalidRelation],
      };

      expect(() => applyTemplate(modifiedTemplate)).toThrowError('Entity not found for relation');
    });

    it('should handle blank template correctly', () => {
      const blankTemplate = PROJECT_TEMPLATES[0];
      const result = applyTemplate(blankTemplate);

      expect(result.entities).toEqual([]);
      expect(result.relations).toEqual([]);
    });

    it('should preserve relation properties', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      result.relations.forEach((relation, index) => {
        const original = template.relations[index];
        expect(relation.type).toBe(original.type);
        expect(relation.bidirectional).toBe(original.bidirectional);
        expect(relation.fetchType).toBe(original.fetchType);
        expect(relation.cascade).toEqual(original.cascade);
        expect(relation.foreignKey).toEqual(original.foreignKey);
        expect(relation.joinTable).toEqual(original.joinTable);
      });
    });

    it('should set sourceFieldName correctly', () => {
      const template = PROJECT_TEMPLATES[1]; // e-commerce
      const result = applyTemplate(template);

      result.relations.forEach((relation, index) => {
        expect(relation.sourceFieldName).toBeDefined();
        expect(typeof relation.sourceFieldName).toBe('string');
        expect(relation.sourceFieldName).toBe(
          template.relations[index].targetEntityName.toLowerCase(),
        );
      });
    });
  });
});
