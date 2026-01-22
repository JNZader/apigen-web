import { describe, it, expect } from 'vitest';
import {
  validateProjectImport,
  isValidJavaIdentifier,
  isValidPackageName,
  isValidGroupId,
  isValidArtifactId,
} from './validation';

describe('validation utils', () => {
  describe('isValidJavaIdentifier', () => {
    it('should return true for valid identifiers', () => {
      expect(isValidJavaIdentifier('myVariable')).toBe(true);
      expect(isValidJavaIdentifier('MyClass')).toBe(true);
      expect(isValidJavaIdentifier('_privateField')).toBe(true);
      expect(isValidJavaIdentifier('$special')).toBe(true);
      expect(isValidJavaIdentifier('name123')).toBe(true);
      expect(isValidJavaIdentifier('a')).toBe(true);
    });

    it('should return false for identifiers starting with digit', () => {
      expect(isValidJavaIdentifier('123name')).toBe(false);
      expect(isValidJavaIdentifier('1abc')).toBe(false);
    });

    it('should return false for identifiers with invalid characters', () => {
      expect(isValidJavaIdentifier('my-variable')).toBe(false);
      expect(isValidJavaIdentifier('my.variable')).toBe(false);
      expect(isValidJavaIdentifier('my variable')).toBe(false);
      expect(isValidJavaIdentifier('name!')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidJavaIdentifier('')).toBe(false);
    });
  });

  describe('isValidPackageName', () => {
    it('should return true for valid package names', () => {
      expect(isValidPackageName('com')).toBe(true);
      expect(isValidPackageName('com.example')).toBe(true);
      expect(isValidPackageName('com.example.myapi')).toBe(true);
      expect(isValidPackageName('org.company.project')).toBe(true);
      expect(isValidPackageName('a1.b2.c3')).toBe(true);
    });

    it('should return false for package names with uppercase', () => {
      expect(isValidPackageName('Com.example')).toBe(false);
      expect(isValidPackageName('com.Example')).toBe(false);
      expect(isValidPackageName('COM.EXAMPLE')).toBe(false);
    });

    it('should return false for package names starting with digit', () => {
      expect(isValidPackageName('1com.example')).toBe(false);
      expect(isValidPackageName('com.1example')).toBe(false);
    });

    it('should return false for package names with invalid characters', () => {
      expect(isValidPackageName('com-example')).toBe(false);
      expect(isValidPackageName('com_example')).toBe(false);
      expect(isValidPackageName('com example')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidPackageName('')).toBe(false);
    });

    it('should return false for package with empty parts', () => {
      expect(isValidPackageName('com..example')).toBe(false);
      expect(isValidPackageName('.com.example')).toBe(false);
      expect(isValidPackageName('com.example.')).toBe(false);
    });
  });

  describe('isValidGroupId', () => {
    it('should return true for valid group IDs (same as package name)', () => {
      expect(isValidGroupId('com.example')).toBe(true);
      expect(isValidGroupId('org.apache')).toBe(true);
    });

    it('should return false for invalid group IDs', () => {
      expect(isValidGroupId('Com.Example')).toBe(false);
      expect(isValidGroupId('')).toBe(false);
    });
  });

  describe('isValidArtifactId', () => {
    it('should return true for valid artifact IDs', () => {
      expect(isValidArtifactId('myapi')).toBe(true);
      expect(isValidArtifactId('my-api')).toBe(true);
      expect(isValidArtifactId('api123')).toBe(true);
      expect(isValidArtifactId('my-cool-api')).toBe(true);
      expect(isValidArtifactId('a')).toBe(true);
    });

    it('should return false for artifact IDs starting with digit', () => {
      expect(isValidArtifactId('123api')).toBe(false);
      expect(isValidArtifactId('1-api')).toBe(false);
    });

    it('should return false for artifact IDs with uppercase', () => {
      expect(isValidArtifactId('MyApi')).toBe(false);
      expect(isValidArtifactId('myAPI')).toBe(false);
    });

    it('should return false for artifact IDs with invalid characters', () => {
      expect(isValidArtifactId('my_api')).toBe(false);
      expect(isValidArtifactId('my.api')).toBe(false);
      expect(isValidArtifactId('my api')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidArtifactId('')).toBe(false);
    });
  });

  describe('validateProjectImport', () => {
    const validProject = {
      project: {
        name: 'Test Project',
        groupId: 'com.example',
        artifactId: 'test-api',
        packageName: 'com.example.test',
        javaVersion: '21',
        springBootVersion: '4.0.0',
        modules: {
          core: true,
          security: true,
        },
        features: {
          hateoas: true,
          swagger: true,
          softDelete: false,
          auditing: true,
          caching: false,
          docker: true,
        },
        database: {
          type: 'postgresql',
          generateMigrations: true,
        },
      },
      entities: [
        {
          id: 'entity-1',
          name: 'User',
          tableName: 'users',
          position: { x: 0, y: 0 },
          fields: [
            {
              id: 'field-1',
              name: 'email',
              columnName: 'email',
              type: 'String',
              nullable: false,
              unique: true,
              validations: [],
            },
          ],
          config: {
            generateController: true,
            generateService: true,
            enableCaching: false,
          },
        },
      ],
      relations: [],
    };

    it('should validate correct project import', () => {
      const result = validateProjectImport(JSON.stringify(validProject));

      expect(result.project.name).toBe('Test Project');
      expect(result.entities).toHaveLength(1);
      expect(result.relations).toHaveLength(0);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => validateProjectImport('not valid json')).toThrow('Invalid JSON format');
      expect(() => validateProjectImport('{')).toThrow('Invalid JSON format');
    });

    it('should throw error for missing required project fields', () => {
      const invalid = { ...validProject, project: { name: '' } };
      expect(() => validateProjectImport(JSON.stringify(invalid))).toThrow('Validation failed');
    });

    it('should throw error for missing entities array', () => {
      const invalid = { project: validProject.project, relations: [] };
      expect(() => validateProjectImport(JSON.stringify(invalid))).toThrow('Validation failed');
    });

    it('should throw error for invalid entity structure', () => {
      const invalid = {
        ...validProject,
        entities: [{ id: 'entity-1', name: '' }], // missing required fields
      };
      expect(() => validateProjectImport(JSON.stringify(invalid))).toThrow('Validation failed');
    });

    it('should validate project with relations', () => {
      const projectWithRelations = {
        ...validProject,
        entities: [
          ...validProject.entities,
          {
            id: 'entity-2',
            name: 'Order',
            tableName: 'orders',
            position: { x: 200, y: 0 },
            fields: [],
            config: {
              generateController: true,
              generateService: true,
              enableCaching: false,
            },
          },
        ],
        relations: [
          {
            id: 'relation-1',
            type: 'OneToMany',
            sourceEntityId: 'entity-1',
            sourceFieldName: 'orders',
            targetEntityId: 'entity-2',
            foreignKey: {
              columnName: 'user_id',
              nullable: false,
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE',
            },
            bidirectional: true,
            fetchType: 'LAZY',
            cascade: ['ALL'],
          },
        ],
      };

      const result = validateProjectImport(JSON.stringify(projectWithRelations));
      expect(result.relations).toHaveLength(1);
      expect(result.relations[0].type).toBe('OneToMany');
    });

    it('should allow passthrough of unknown fields', () => {
      const withExtras = {
        ...validProject,
        project: {
          ...validProject.project,
          customField: 'custom value',
          features: {
            ...validProject.project.features,
            newFeature: true,
          },
        },
      };

      // Should not throw - passthrough allows extra fields
      const result = validateProjectImport(JSON.stringify(withExtras));
      expect(result.project.name).toBe('Test Project');
    });

    it('should validate field validations', () => {
      const projectWithValidations = {
        ...validProject,
        entities: [
          {
            ...validProject.entities[0],
            fields: [
              {
                id: 'field-1',
                name: 'email',
                columnName: 'email',
                type: 'String',
                nullable: false,
                unique: true,
                validations: [
                  { type: 'NotBlank' },
                  { type: 'Email', message: 'Must be valid email' },
                  { type: 'Size', value: 100 },
                ],
              },
            ],
          },
        ],
      };

      const result = validateProjectImport(JSON.stringify(projectWithValidations));
      expect(result.entities[0].fields[0].validations).toHaveLength(3);
    });

    it('should throw error for invalid database type', () => {
      const invalid = {
        ...validProject,
        project: {
          ...validProject.project,
          database: {
            type: 'invalid-db',
            generateMigrations: true,
          },
        },
      };

      expect(() => validateProjectImport(JSON.stringify(invalid))).toThrow('Validation failed');
    });

    it('should throw error for invalid java version', () => {
      const invalid = {
        ...validProject,
        project: {
          ...validProject.project,
          javaVersion: '17', // Not supported
        },
      };

      expect(() => validateProjectImport(JSON.stringify(invalid))).toThrow('Validation failed');
    });
  });
});
