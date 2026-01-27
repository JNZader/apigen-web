import { describe, expect, it } from 'vitest';
import { parseOpenAPI } from './openApiParser';

describe('openApiParser', () => {
  describe('parseOpenAPI - Format Detection', () => {
    it('parses valid JSON OpenAPI spec', () => {
      const json = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'integer', format: 'int64' },
                name: { type: 'string' },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(json);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('User');
    });

    it('parses valid YAML OpenAPI spec', () => {
      const yaml = `
openapi: '3.0.0'
components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: integer
          format: int64
        title:
          type: string
`;

      const result = parseOpenAPI(yaml);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Product');
    });

    it('throws on invalid JSON', () => {
      expect(() => parseOpenAPI('{ invalid json')).toThrow('Invalid JSON');
    });

    it('throws on invalid YAML', () => {
      expect(() => parseOpenAPI('invalid: yaml: : :')).toThrow('Invalid YAML');
    });
  });

  describe('parseOpenAPI - Version Validation', () => {
    it('rejects OpenAPI 2.x (Swagger)', () => {
      const spec = JSON.stringify({
        swagger: '2.0',
        definitions: {
          User: { type: 'object', properties: { id: { type: 'integer' } } },
        },
      });

      expect(() => parseOpenAPI(spec)).toThrow('OpenAPI 2.x (Swagger) is not supported');
    });

    it('rejects missing OpenAPI version', () => {
      const spec = JSON.stringify({
        components: {
          schemas: {
            User: { type: 'object', properties: { id: { type: 'integer' } } },
          },
        },
      });

      expect(() => parseOpenAPI(spec)).toThrow('Missing OpenAPI version');
    });

    it('accepts OpenAPI 3.0.x', () => {
      const spec = JSON.stringify({
        openapi: '3.0.3',
        components: {
          schemas: {
            User: { type: 'object', properties: { name: { type: 'string' } } },
          },
        },
      });

      expect(() => parseOpenAPI(spec)).not.toThrow();
    });

    it('accepts OpenAPI 3.1.x', () => {
      const spec = JSON.stringify({
        openapi: '3.1.0',
        components: {
          schemas: {
            User: { type: 'object', properties: { name: { type: 'string' } } },
          },
        },
      });

      expect(() => parseOpenAPI(spec)).not.toThrow();
    });
  });

  describe('parseOpenAPI - Schema Extraction', () => {
    it('throws when no schemas found', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {},
      });

      expect(() => parseOpenAPI(spec)).toThrow('No schemas found');
    });

    it('excludes Request/Response/DTO schemas', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: { type: 'object', properties: { name: { type: 'string' } } },
            UserRequest: { type: 'object', properties: { name: { type: 'string' } } },
            UserResponse: { type: 'object', properties: { id: { type: 'integer' } } },
            UserDTO: { type: 'object', properties: { id: { type: 'integer' } } },
          },
        },
      });

      const result = parseOpenAPI(spec);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('User');
    });

    it('throws when all schemas are excluded', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            UserRequest: { type: 'object', properties: { name: { type: 'string' } } },
            UserResponse: { type: 'object', properties: { id: { type: 'integer' } } },
          },
        },
      });

      expect(() => parseOpenAPI(spec)).toThrow('No valid entity schemas found');
    });

    it('skips schemas without properties', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            Status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
            User: { type: 'object', properties: { name: { type: 'string' } } },
          },
        },
      });

      const result = parseOpenAPI(spec);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('User');
    });
  });

  describe('parseOpenAPI - Field Extraction', () => {
    it('extracts fields with correct types', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'integer', format: 'int32' },
                balance: { type: 'number' },
                active: { type: 'boolean' },
                birthDate: { type: 'string', format: 'date' },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);
      const user = result.entities[0];

      expect(user.fields).toHaveLength(5);

      const nameField = user.fields.find((f) => f.name === 'name');
      expect(nameField?.type).toBe('String');

      const ageField = user.fields.find((f) => f.name === 'age');
      expect(ageField?.type).toBe('Integer');

      const balanceField = user.fields.find((f) => f.name === 'balance');
      expect(balanceField?.type).toBe('BigDecimal');

      const activeField = user.fields.find((f) => f.name === 'active');
      expect(activeField?.type).toBe('Boolean');

      const birthDateField = user.fields.find((f) => f.name === 'birthDate');
      expect(birthDateField?.type).toBe('LocalDate');
    });

    it('skips base fields (id, created_at, etc.)', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'integer', format: 'int64' },
                name: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                version: { type: 'integer' },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);
      const user = result.entities[0];

      expect(user.fields).toHaveLength(1);
      expect(user.fields[0].name).toBe('name');
    });

    it('extracts validations from required array', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', maxLength: 100 },
                nickname: { type: 'string' },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);
      const emailField = result.entities[0].fields.find((f) => f.name === 'email');
      const nicknameField = result.entities[0].fields.find((f) => f.name === 'nickname');

      expect(emailField?.nullable).toBe(false);
      expect(emailField?.validations).toContainEqual({ type: 'NotBlank' });
      expect(emailField?.validations).toContainEqual({ type: 'Size', value: 'max = 100' });

      expect(nicknameField?.nullable).toBe(true);
      expect(nicknameField?.validations).not.toContainEqual({ type: 'NotBlank' });
    });

    it('generates correct column names in snake_case', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);
      const firstNameField = result.entities[0].fields.find((f) => f.name === 'firstName');
      const lastNameField = result.entities[0].fields.find((f) => f.name === 'lastName');

      expect(firstNameField?.columnName).toBe('first_name');
      expect(lastNameField?.columnName).toBe('last_name');
    });
  });

  describe('parseOpenAPI - ManyToOne Relationships', () => {
    it('detects ManyToOne from $ref', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
            Post: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                author: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);

      expect(result.relations).toHaveLength(1);
      const relation = result.relations[0];

      expect(relation.type).toBe('ManyToOne');
      expect(relation.sourceFieldName).toBe('author');
      expect(relation.foreignKey.columnName).toBe('author_id');
    });

    it('does not create field for $ref property', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
            Post: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                author: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);
      const post = result.entities.find((e) => e.name === 'Post');

      expect(post?.fields).toHaveLength(1);
      expect(post?.fields[0].name).toBe('title');
    });
  });

  describe('parseOpenAPI - OneToMany Relationships', () => {
    it('creates bidirectional ManyToOne when inverse OneToMany exists', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                posts: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Post' },
                },
              },
            },
            Post: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                author: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);

      // Should only create one ManyToOne (Post -> User)
      expect(result.relations).toHaveLength(1);

      const relation = result.relations[0];
      expect(relation.type).toBe('ManyToOne');
      expect(relation.bidirectional).toBe(true);
      expect(relation.targetFieldName).toBe('posts');
    });
  });

  describe('parseOpenAPI - ManyToMany Relationships', () => {
    it('detects ManyToMany from mutual arrays', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            Student: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                courses: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Course' },
                },
              },
            },
            Course: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                students: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Student' },
                },
              },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);

      expect(result.relations).toHaveLength(1);

      const relation = result.relations[0];
      expect(relation.type).toBe('ManyToMany');
      expect(relation.bidirectional).toBe(true);
      expect(relation.joinTable).toBeDefined();
      expect(relation.joinTable?.joinColumn).toContain('_id');
      expect(relation.joinTable?.inverseJoinColumn).toContain('_id');
    });
  });

  describe('parseOpenAPI - Complete Example (Pet Store)', () => {
    it('parses simplified Pet Store spec', () => {
      const spec = `
openapi: '3.0.0'
info:
  title: Pet Store
  version: '1.0.0'
components:
  schemas:
    Pet:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          maxLength: 100
        tag:
          type: string
        owner:
          $ref: '#/components/schemas/Owner'
    Owner:
      type: object
      required:
        - email
      properties:
        email:
          type: string
          format: email
          maxLength: 255
        phone:
          type: string
          pattern: '^\\+?[0-9]{10,15}$'
        pets:
          type: array
          items:
            $ref: '#/components/schemas/Pet'
`;

      const result = parseOpenAPI(spec);

      // Should have 2 entities
      expect(result.entities).toHaveLength(2);

      const pet = result.entities.find((e) => e.name === 'Pet');
      const owner = result.entities.find((e) => e.name === 'Owner');

      expect(pet).toBeDefined();
      expect(owner).toBeDefined();

      // Pet should have name and tag fields (owner is relationship)
      expect(pet?.fields).toHaveLength(2);
      expect(pet?.fields.map((f) => f.name)).toContain('name');
      expect(pet?.fields.map((f) => f.name)).toContain('tag');

      // Pet name should be required
      const petNameField = pet?.fields.find((f) => f.name === 'name');
      expect(petNameField?.nullable).toBe(false);
      expect(petNameField?.validations).toContainEqual({ type: 'NotBlank' });
      expect(petNameField?.validations).toContainEqual({ type: 'Size', value: 'max = 100' });

      // Owner should have email and phone fields
      expect(owner?.fields).toHaveLength(2);
      expect(owner?.fields.map((f) => f.name)).toContain('email');
      expect(owner?.fields.map((f) => f.name)).toContain('phone');

      // Owner email validations
      const ownerEmailField = owner?.fields.find((f) => f.name === 'email');
      expect(ownerEmailField?.validations).toContainEqual({ type: 'NotBlank' });
      expect(ownerEmailField?.validations).toContainEqual({ type: 'Email' });

      // Owner phone pattern validation
      const ownerPhoneField = owner?.fields.find((f) => f.name === 'phone');
      expect(ownerPhoneField?.validations).toContainEqual({
        type: 'Pattern',
        value: '^\\+?[0-9]{10,15}$',
      });

      // Should have bidirectional ManyToOne relationship (Pet -> Owner)
      expect(result.relations).toHaveLength(1);
      const relation = result.relations[0];
      expect(relation.type).toBe('ManyToOne');
      expect(relation.bidirectional).toBe(true);
    });
  });

  describe('parseOpenAPI - Entity Naming', () => {
    it('converts schema names to PascalCase entity names', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            user_profile: {
              type: 'object',
              properties: { bio: { type: 'string' } },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);
      expect(result.entities[0].name).toBe('UserProfile');
    });

    it('converts schema names to snake_case table names with plural', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            OrderItem: {
              type: 'object',
              properties: { quantity: { type: 'integer' } },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);
      expect(result.entities[0].tableName).toBe('order_items');
    });
  });

  describe('parseOpenAPI - Entity Configuration', () => {
    it('sets default entity config', () => {
      const spec = JSON.stringify({
        openapi: '3.0.0',
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
          },
        },
      });

      const result = parseOpenAPI(spec);
      expect(result.entities[0].config).toEqual({
        generateController: true,
        generateService: true,
        enableCaching: true,
      });
    });
  });
});
