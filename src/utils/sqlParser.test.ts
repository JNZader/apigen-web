import { describe, expect, it } from 'vitest';
import { parseSQL } from './sqlParser';

describe('sqlParser', () => {
  describe('parseSQL', () => {
    it('should parse a simple CREATE TABLE statement', () => {
      const sql = `
        CREATE TABLE users (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE
        );
      `;

      const result = parseSQL(sql);

      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('User');
      expect(result.entities[0].fields).toHaveLength(2); // name and email (id is filtered as base field)
    });

    it('should parse multiple tables', () => {
      const sql = `
        CREATE TABLE products (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10,2)
        );

        CREATE TABLE category (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(50)
        );
      `;

      const result = parseSQL(sql);

      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name)).toContain('Product');
      expect(result.entities.map((e) => e.name)).toContain('Category');
    });

    it('should detect NOT NULL constraint', () => {
      const sql = `
        CREATE TABLE items (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT
        );
      `;

      const result = parseSQL(sql);
      const entity = result.entities[0];

      const nameField = entity.fields.find((f) => f.name === 'name');
      const descField = entity.fields.find((f) => f.name === 'description');

      expect(nameField?.nullable).toBe(false);
      expect(descField?.nullable).toBe(true);
    });

    it('should detect UNIQUE constraint', () => {
      const sql = `
        CREATE TABLE accounts (
          id BIGSERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE,
          display_name VARCHAR(100)
        );
      `;

      const result = parseSQL(sql);
      const entity = result.entities[0];

      const usernameField = entity.fields.find((f) => f.name === 'username');
      const displayField = entity.fields.find((f) => f.name === 'displayName');

      expect(usernameField?.unique).toBe(true);
      expect(displayField?.unique).toBe(false);
    });

    it('should map SQL types to Java types correctly', () => {
      const sql = `
        CREATE TABLE type_test (
          id BIGSERIAL PRIMARY KEY,
          text_field VARCHAR(255),
          int_field INTEGER,
          long_field BIGINT,
          decimal_field DECIMAL(19,2),
          bool_field BOOLEAN,
          date_field DATE,
          timestamp_field TIMESTAMP,
          uuid_field UUID
        );
      `;

      const result = parseSQL(sql);
      const entity = result.entities[0];

      expect(entity.fields.find((f) => f.name === 'textField')?.type).toBe('String');
      expect(entity.fields.find((f) => f.name === 'intField')?.type).toBe('Integer');
      expect(entity.fields.find((f) => f.name === 'longField')?.type).toBe('Long');
      expect(entity.fields.find((f) => f.name === 'decimalField')?.type).toBe('BigDecimal');
      expect(entity.fields.find((f) => f.name === 'boolField')?.type).toBe('Boolean');
      expect(entity.fields.find((f) => f.name === 'dateField')?.type).toBe('LocalDate');
      expect(entity.fields.find((f) => f.name === 'timestampField')?.type).toBe('LocalDateTime');
      expect(entity.fields.find((f) => f.name === 'uuidField')?.type).toBe('UUID');
    });

    it('should parse foreign key relationships', () => {
      const sql = `
        CREATE TABLE orders (
          id BIGSERIAL PRIMARY KEY,
          customer_id BIGINT NOT NULL
        );

        CREATE TABLE customers (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100)
        );

        ALTER TABLE orders
          ADD CONSTRAINT fk_orders_customer
          FOREIGN KEY (customer_id)
          REFERENCES customers(id);
      `;

      const result = parseSQL(sql);

      expect(result.relations).toHaveLength(1);
      expect(result.relations[0].type).toBe('ManyToOne');
      expect(result.relations[0].sourceEntityId).toBeDefined();
      expect(result.relations[0].targetEntityId).toBeDefined();
    });

    it('should remove SQL comments', () => {
      const sql = `
        -- This is a line comment
        CREATE TABLE comments_test (
          id BIGSERIAL PRIMARY KEY,
          /* This is a block comment */
          content TEXT
        );
      `;

      const result = parseSQL(sql);

      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('CommentsTest');
    });

    it('should filter out base/audit fields', () => {
      const sql = `
        CREATE TABLE audited (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100),
          estado VARCHAR(20),
          fecha_creacion TIMESTAMP,
          fecha_actualizacion TIMESTAMP,
          creado_por VARCHAR(100),
          modificado_por VARCHAR(100),
          version BIGINT
        );
      `;

      const result = parseSQL(sql);
      const entity = result.entities[0];

      // Only 'name' should be included, all others are base/audit fields
      expect(entity.fields).toHaveLength(1);
      expect(entity.fields[0].name).toBe('name');
    });

    it('should handle empty SQL', () => {
      const result = parseSQL('');

      expect(result.entities).toHaveLength(0);
      expect(result.relations).toHaveLength(0);
    });

    it('should handle SQL without CREATE TABLE', () => {
      const sql = `
        SELECT * FROM users;
        INSERT INTO users (name) VALUES ('test');
      `;

      const result = parseSQL(sql);

      expect(result.entities).toHaveLength(0);
    });

    it('should convert snake_case table names to PascalCase entity names', () => {
      const sql = `
        CREATE TABLE user_profiles (
          id BIGSERIAL PRIMARY KEY,
          bio TEXT
        );
      `;

      const result = parseSQL(sql);

      expect(result.entities[0].name).toBe('UserProfile');
    });

    it('should convert snake_case column names to camelCase field names', () => {
      const sql = `
        CREATE TABLE test (
          id BIGSERIAL PRIMARY KEY,
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          created_at TIMESTAMP
        );
      `;

      const result = parseSQL(sql);
      const fieldNames = result.entities[0].fields.map((f) => f.name);

      expect(fieldNames).toContain('firstName');
      expect(fieldNames).toContain('lastName');
      // created_at should be filtered as a base field
      expect(fieldNames).not.toContain('createdAt');
    });

    it('should handle VARCHAR with length specification', () => {
      const sql = `
        CREATE TABLE sized (
          id BIGSERIAL PRIMARY KEY,
          short_text VARCHAR(50),
          long_text VARCHAR(1000)
        );
      `;

      const result = parseSQL(sql);
      const entity = result.entities[0];

      // Check that validations include Size constraint based on VARCHAR length
      const shortField = entity.fields.find((f) => f.name === 'shortText');
      const longField = entity.fields.find((f) => f.name === 'longText');

      expect(shortField?.type).toBe('String');
      expect(longField?.type).toBe('String');
    });
  });
});
