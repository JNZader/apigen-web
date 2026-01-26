import { describe, expect, it, vi } from 'vitest';
import { detectFormat, parseContent, parseOpenApi, validateOpenApi } from './openApiParser';

// Mock nanoid to return predictable IDs for testing
vi.mock('nanoid', () => ({
  nanoid: () => 'test-id-' + Math.random().toString(36).substring(7),
}));

describe('openApiParser', () => {
  describe('detectFormat', () => {
    it('should detect JSON format when content starts with {', () => {
      const content = '{"openapi": "3.0.0"}';
      expect(detectFormat(content)).toBe('json');
    });

    it('should detect JSON format when content starts with [', () => {
      const content = '[{"name": "test"}]';
      expect(detectFormat(content)).toBe('json');
    });

    it('should detect YAML format when content starts with ---', () => {
      const content = '---\nopenapi: "3.0.0"';
      expect(detectFormat(content)).toBe('yaml');
    });

    it('should detect YAML format when content starts with openapi:', () => {
      const content = 'openapi: "3.0.0"\ninfo:\n  title: Test';
      expect(detectFormat(content)).toBe('yaml');
    });

    it('should detect YAML format when content starts with swagger:', () => {
      const content = 'swagger: "2.0"\ninfo:\n  title: Test';
      expect(detectFormat(content)).toBe('yaml');
    });

    it('should detect YAML format when content starts with #', () => {
      const content = '# OpenAPI document\nopenapi: "3.0.0"';
      expect(detectFormat(content)).toBe('yaml');
    });

    it('should detect JSON format for valid JSON that does not start with { or [', () => {
      const content = '  {"openapi": "3.0.0"}';
      expect(detectFormat(content)).toBe('json');
    });

    it('should default to YAML when content is not valid JSON', () => {
      const content = 'some: yaml\ncontent: here';
      expect(detectFormat(content)).toBe('yaml');
    });

    it('should handle whitespace before content', () => {
      const content = '   \n  {"openapi": "3.0.0"}';
      expect(detectFormat(content)).toBe('json');
    });
  });

  describe('parseContent', () => {
    it('should parse JSON content', () => {
      const content = '{"openapi": "3.0.0", "info": {"title": "Test", "version": "1.0"}}';
      const result = parseContent(content, 'json');
      expect(result.openapi).toBe('3.0.0');
      expect(result.info?.title).toBe('Test');
    });

    it('should parse YAML content', () => {
      const content = `openapi: "3.0.0"
info:
  title: Test API
  version: "1.0"`;
      const result = parseContent(content, 'yaml');
      expect(result.openapi).toBe('3.0.0');
      expect(result.info?.title).toBe('Test API');
    });

    it('should auto-detect format when not specified', () => {
      const jsonContent = '{"openapi": "3.0.0"}';
      const jsonResult = parseContent(jsonContent);
      expect(jsonResult.openapi).toBe('3.0.0');

      const yamlContent = 'openapi: "3.0.0"';
      const yamlResult = parseContent(yamlContent);
      expect(yamlResult.openapi).toBe('3.0.0');
    });

    it('should throw on invalid JSON', () => {
      const content = '{invalid json}';
      expect(() => parseContent(content, 'json')).toThrow();
    });

    it('should parse Swagger 2.x documents', () => {
      const content = '{"swagger": "2.0", "info": {"title": "Test", "version": "1.0"}}';
      const result = parseContent(content, 'json');
      expect(result.swagger).toBe('2.0');
    });
  });

  describe('parseOpenApi', () => {
    const validOpenApi3Doc = `{
			"openapi": "3.0.0",
			"info": {"title": "Test API", "version": "1.0"},
			"components": {
				"schemas": {
					"User": {
						"type": "object",
						"required": ["email"],
						"properties": {
							"id": {"type": "integer", "format": "int64"},
							"email": {"type": "string", "format": "email", "minLength": 5, "maxLength": 100},
							"name": {"type": "string"},
							"active": {"type": "boolean"},
							"createdAt": {"type": "string", "format": "date-time"}
						}
					}
				}
			}
		}`;

    it('should parse entities from OpenAPI 3.x schemas', () => {
      const result = parseOpenApi(validOpenApi3Doc, 'json');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('User');
      expect(result.entities[0].tableName).toBe('user');
    });

    it('should parse fields with correct types', () => {
      const result = parseOpenApi(validOpenApi3Doc, 'json');
      const userEntity = result.entities[0];
      const fields = userEntity.fields;

      const idField = fields.find((f) => f.name === 'id');
      expect(idField?.type).toBe('Long');

      const emailField = fields.find((f) => f.name === 'email');
      expect(emailField?.type).toBe('String');

      const activeField = fields.find((f) => f.name === 'active');
      expect(activeField?.type).toBe('Boolean');

      const createdAtField = fields.find((f) => f.name === 'createdAt');
      expect(createdAtField?.type).toBe('LocalDateTime');
    });

    it('should parse validations from schema constraints', () => {
      const result = parseOpenApi(validOpenApi3Doc, 'json');
      const emailField = result.entities[0].fields.find((f) => f.name === 'email');

      expect(emailField?.validations).toBeDefined();
      const validationTypes = emailField?.validations.map((v) => v.type);
      expect(validationTypes).toContain('NotNull');
      expect(validationTypes).toContain('Size');
      expect(validationTypes).toContain('Email');
    });

    it('should set nullable based on required array', () => {
      const result = parseOpenApi(validOpenApi3Doc, 'json');
      const fields = result.entities[0].fields;

      const emailField = fields.find((f) => f.name === 'email');
      expect(emailField?.nullable).toBe(false);

      const nameField = fields.find((f) => f.name === 'name');
      expect(nameField?.nullable).toBe(true);
    });

    it('should parse Swagger 2.x definitions', () => {
      const swagger2Doc = `{
				"swagger": "2.0",
				"info": {"title": "Test API", "version": "1.0"},
				"definitions": {
					"Product": {
						"type": "object",
						"properties": {
							"id": {"type": "integer"},
							"name": {"type": "string"}
						}
					}
				}
			}`;
      const result = parseOpenApi(swagger2Doc, 'json');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Product');
    });

    it('should handle documents with no schemas', () => {
      const noSchemasDoc = '{"openapi": "3.0.0", "info": {"title": "Test", "version": "1.0"}}';
      const result = parseOpenApi(noSchemasDoc, 'json');
      expect(result.entities).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('No schemas found');
    });

    it('should parse type mappings correctly', () => {
      const typeTestDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"TypeTest": {
							"type": "object",
							"properties": {
								"stringField": {"type": "string"},
								"intField": {"type": "integer"},
								"int32Field": {"type": "integer", "format": "int32"},
								"int64Field": {"type": "integer", "format": "int64"},
								"numberField": {"type": "number"},
								"floatField": {"type": "number", "format": "float"},
								"doubleField": {"type": "number", "format": "double"},
								"boolField": {"type": "boolean"},
								"dateField": {"type": "string", "format": "date"},
								"dateTimeField": {"type": "string", "format": "date-time"},
								"uuidField": {"type": "string", "format": "uuid"},
								"binaryField": {"type": "string", "format": "binary"}
							}
						}
					}
				}
			}`;
      const result = parseOpenApi(typeTestDoc, 'json');
      const fields = result.entities[0].fields;

      expect(fields.find((f) => f.name === 'stringField')?.type).toBe('String');
      expect(fields.find((f) => f.name === 'intField')?.type).toBe('Integer');
      expect(fields.find((f) => f.name === 'int32Field')?.type).toBe('Integer');
      expect(fields.find((f) => f.name === 'int64Field')?.type).toBe('Long');
      expect(fields.find((f) => f.name === 'numberField')?.type).toBe('Double');
      expect(fields.find((f) => f.name === 'floatField')?.type).toBe('Float');
      expect(fields.find((f) => f.name === 'doubleField')?.type).toBe('Double');
      expect(fields.find((f) => f.name === 'boolField')?.type).toBe('Boolean');
      expect(fields.find((f) => f.name === 'dateField')?.type).toBe('LocalDate');
      expect(fields.find((f) => f.name === 'dateTimeField')?.type).toBe('LocalDateTime');
      expect(fields.find((f) => f.name === 'uuidField')?.type).toBe('UUID');
      expect(fields.find((f) => f.name === 'binaryField')?.type).toBe('byte[]');
    });

    it('should handle $ref relations', () => {
      const refDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"Order": {
							"type": "object",
							"properties": {
								"id": {"type": "integer"},
								"customer": {"$ref": "#/components/schemas/Customer"}
							}
						},
						"Customer": {
							"type": "object",
							"properties": {
								"id": {"type": "integer"},
								"name": {"type": "string"}
							}
						}
					}
				}
			}`;
      const result = parseOpenApi(refDoc, 'json');
      expect(result.entities).toHaveLength(2);
      expect(result.relations).toHaveLength(1);
      expect(result.relations[0].type).toBe('ManyToOne');
    });

    it('should handle array of $ref for OneToMany relations', () => {
      const arrayRefDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"Author": {
							"type": "object",
							"properties": {
								"id": {"type": "integer"},
								"books": {
									"type": "array",
									"items": {"$ref": "#/components/schemas/Book"}
								}
							}
						},
						"Book": {
							"type": "object",
							"properties": {
								"id": {"type": "integer"},
								"title": {"type": "string"}
							}
						}
					}
				}
			}`;
      const result = parseOpenApi(arrayRefDoc, 'json');
      expect(result.relations).toHaveLength(1);
      expect(result.relations[0].type).toBe('OneToMany');
    });

    it('should add warnings for unresolved references', () => {
      const unresolvedRefDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"Order": {
							"type": "object",
							"properties": {
								"customer": {"$ref": "#/components/schemas/NonExistent"}
							}
						}
					}
				}
			}`;
      const result = parseOpenApi(unresolvedRefDoc, 'json');
      expect(result.warnings.some((w) => w.includes('NonExistent'))).toBe(true);
    });

    it('should skip array of primitives', () => {
      const primitiveArrayDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"Tags": {
							"type": "object",
							"properties": {
								"id": {"type": "integer"},
								"tags": {"type": "array", "items": {"type": "string"}}
							}
						}
					}
				}
			}`;
      const result = parseOpenApi(primitiveArrayDoc, 'json');
      const fields = result.entities[0].fields;
      expect(fields.find((f) => f.name === 'tags')).toBeUndefined();
    });

    it('should parse Min/Max validations', () => {
      const validationDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"Range": {
							"type": "object",
							"properties": {
								"age": {"type": "integer", "minimum": 0, "maximum": 120}
							}
						}
					}
				}
			}`;
      const result = parseOpenApi(validationDoc, 'json');
      const ageField = result.entities[0].fields.find((f) => f.name === 'age');
      const minValidation = ageField?.validations.find((v) => v.type === 'Min');
      const maxValidation = ageField?.validations.find((v) => v.type === 'Max');
      expect(minValidation?.value).toBe(0);
      expect(maxValidation?.value).toBe(120);
    });

    it('should parse Pattern validation', () => {
      const patternDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"Code": {
							"type": "object",
							"properties": {
								"code": {"type": "string", "pattern": "^[A-Z]{3}$"}
							}
						}
					}
				}
			}`;
      const result = parseOpenApi(patternDoc, 'json');
      const codeField = result.entities[0].fields.find((f) => f.name === 'code');
      const patternValidation = codeField?.validations.find((v) => v.type === 'Pattern');
      expect(patternValidation?.value).toBe('^[A-Z]{3}$');
    });

    it('should calculate grid positions for entities', () => {
      const multiEntityDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"A": {"type": "object", "properties": {"id": {"type": "integer"}}},
						"B": {"type": "object", "properties": {"id": {"type": "integer"}}},
						"C": {"type": "object", "properties": {"id": {"type": "integer"}}},
						"D": {"type": "object", "properties": {"id": {"type": "integer"}}}
					}
				}
			}`;
      const result = parseOpenApi(multiEntityDoc, 'json');
      expect(result.entities).toHaveLength(4);
      result.entities.forEach((entity) => {
        expect(entity.position).toBeDefined();
        expect(typeof entity.position.x).toBe('number');
        expect(typeof entity.position.y).toBe('number');
      });
    });

    it('should parse YAML format', () => {
      const yamlDoc = `
openapi: "3.0.0"
info:
  title: Test API
  version: "1.0"
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string`;
      const result = parseOpenApi(yamlDoc, 'yaml');
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('User');
    });

    it('should set entity config defaults', () => {
      const result = parseOpenApi(validOpenApi3Doc, 'json');
      expect(result.entities[0].config).toEqual({
        generateController: true,
        generateService: true,
        enableCaching: false,
      });
    });

    it('should preserve description from schema', () => {
      const docWithDescription = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {
					"schemas": {
						"User": {
							"type": "object",
							"description": "A user entity",
							"properties": {
								"id": {"type": "integer", "description": "User ID"}
							}
						}
					}
				}
			}`;
      const result = parseOpenApi(docWithDescription, 'json');
      expect(result.entities[0].description).toBe('A user entity');
      expect(result.entities[0].fields[0].description).toBe('User ID');
    });
  });

  describe('validateOpenApi', () => {
    it('should validate a correct OpenAPI 3.x document', () => {
      const validDoc = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {"schemas": {"User": {"type": "object"}}}
			}`;
      const result = validateOpenApi(validDoc, 'json');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing openapi version', () => {
      const noVersion = '{"info": {"title": "Test", "version": "1.0"}}';
      const result = validateOpenApi(noVersion, 'json');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('openapi'))).toBe(true);
    });

    it('should return error for missing info section', () => {
      const noInfo = '{"openapi": "3.0.0"}';
      const result = validateOpenApi(noInfo, 'json');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('info'))).toBe(true);
    });

    it('should return error for empty schemas', () => {
      const emptySchemas = `{
				"openapi": "3.0.0",
				"info": {"title": "Test", "version": "1.0"},
				"components": {"schemas": {}}
			}`;
      const result = validateOpenApi(emptySchemas, 'json');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('schemas'))).toBe(true);
    });

    it('should handle parse errors', () => {
      const invalidJson = '{not valid json}';
      const result = validateOpenApi(invalidJson, 'json');
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Parse error'))).toBe(true);
    });

    it('should validate Swagger 2.x documents', () => {
      const swagger2Doc = `{
				"swagger": "2.0",
				"info": {"title": "Test", "version": "1.0"},
				"definitions": {"User": {"type": "object"}}
			}`;
      const result = validateOpenApi(swagger2Doc, 'json');
      expect(result.valid).toBe(true);
    });
  });
});
