import { z } from 'zod';

// Java identifier validation regex
const JAVA_IDENTIFIER_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export const javaIdentifierSchema = z
  .string()
  .regex(
    JAVA_IDENTIFIER_REGEX,
    'Must be a valid Java identifier (letters, digits, _, $; cannot start with digit)',
  );

// Field validation schema
const validationRuleSchema = z.object({
  type: z.enum([
    'NotNull',
    'NotBlank',
    'NotEmpty',
    'Size',
    'Min',
    'Max',
    'DecimalMin',
    'DecimalMax',
    'Positive',
    'PositiveOrZero',
    'Negative',
    'NegativeOrZero',
    'Email',
    'Pattern',
    'Past',
    'PastOrPresent',
    'Future',
    'FutureOrPresent',
  ]),
  value: z.union([z.string(), z.number()]).optional(),
  message: z.string().optional(),
});

const fieldDesignSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required'),
  columnName: z.string(),
  type: z.enum([
    'String',
    'Long',
    'Integer',
    'Double',
    'Float',
    'BigDecimal',
    'Boolean',
    'LocalDate',
    'LocalDateTime',
    'LocalTime',
    'Instant',
    'UUID',
    'byte[]',
  ]),
  nullable: z.boolean(),
  unique: z.boolean(),
  validations: z.array(validationRuleSchema),
  defaultValue: z.string().optional(),
  description: z.string().optional(),
});

// Entity schema
const entityDesignSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Entity name is required'),
  tableName: z.string(),
  description: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  fields: z.array(fieldDesignSchema),
  config: z.object({
    generateController: z.boolean(),
    generateService: z.boolean(),
    customEndpoint: z.string().optional(),
    enableCaching: z.boolean(),
  }),
});

// Relation schema
const relationDesignSchema = z.object({
  id: z.string(),
  type: z.enum(['OneToOne', 'OneToMany', 'ManyToOne', 'ManyToMany']),
  sourceEntityId: z.string(),
  sourceFieldName: z.string(),
  targetEntityId: z.string(),
  targetFieldName: z.string().optional(),
  foreignKey: z.object({
    columnName: z.string(),
    nullable: z.boolean(),
    onDelete: z.enum(['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION']),
    onUpdate: z.enum(['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION']),
  }),
  joinTable: z
    .object({
      name: z.string(),
      joinColumn: z.string(),
      inverseJoinColumn: z.string(),
    })
    .optional(),
  bidirectional: z.boolean(),
  mappedBy: z.string().optional(),
  fetchType: z.enum(['LAZY', 'EAGER']),
  cascade: z.array(z.enum(['ALL', 'PERSIST', 'MERGE', 'REMOVE', 'REFRESH', 'DETACH'])),
});

// Project config schema - uses passthrough for forward/backward compatibility
const projectConfigSchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    groupId: z.string().min(1, 'Group ID is required'),
    artifactId: z.string().min(1, 'Artifact ID is required'),
    packageName: z.string().min(1, 'Package name is required'),
    javaVersion: z.enum(['21', '25']),
    springBootVersion: z.literal('4.0.0'),
    modules: z
      .object({
        core: z.boolean(),
        security: z.boolean(),
        graphql: z.boolean().optional(),
        grpc: z.boolean().optional(),
        gateway: z.boolean().optional(),
      })
      .catchall(z.unknown()),
    features: z
      .object({
        hateoas: z.boolean(),
        swagger: z.boolean(),
        softDelete: z.boolean(),
        auditing: z.boolean(),
        caching: z.boolean(),
        rateLimiting: z.boolean().optional(),
        virtualThreads: z.boolean().optional(),
        docker: z.boolean(),
        i18n: z.boolean().optional(),
        webhooks: z.boolean().optional(),
        bulkOperations: z.boolean().optional(),
        batchOperations: z.boolean().optional(),
        multiTenancy: z.boolean().optional(),
        eventSourcing: z.boolean().optional(),
        apiVersioning: z.boolean().optional(),
        cursorPagination: z.boolean().optional(),
        etagSupport: z.boolean().optional(),
        domainEvents: z.boolean().optional(),
        sseUpdates: z.boolean().optional(),
      })
      .catchall(z.unknown()),
    database: z
      .object({
        type: z.enum(['postgresql', 'mysql', 'mariadb', 'h2', 'oracle', 'sqlserver', 'mongodb']),
        generateMigrations: z.boolean(),
      })
      .catchall(z.unknown()),
  })
  .catchall(z.unknown());

// Full project import schema
export const projectImportSchema = z.object({
  project: projectConfigSchema,
  entities: z.array(entityDesignSchema),
  relations: z.array(relationDesignSchema),
});

export type ProjectImport = z.infer<typeof projectImportSchema>;

// Validation helper with detailed error messages
export function validateProjectImport(json: string): ProjectImport {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON format');
  }

  const result = projectImportSchema.safeParse(parsed);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Validation failed: ${errors}`);
  }

  return result.data;
}

// Validate Java identifier
export function isValidJavaIdentifier(name: string): boolean {
  return JAVA_IDENTIFIER_REGEX.test(name);
}

// Validate package name (e.g., com.example.myapi)
// Uses string splitting to avoid regex DoS from nested quantifiers
export function isValidPackageName(name: string): boolean {
  if (!name) return false;
  const parts = name.split('.');
  if (parts.length === 0) return false;
  // Each part must match: lowercase letter followed by lowercase letters/digits
  const PACKAGE_PART_REGEX = /^[a-z][a-z0-9]*$/;
  return parts.every((part) => PACKAGE_PART_REGEX.test(part));
}

// Validate Maven group ID (e.g., com.example)
// Same rules as package name
export function isValidGroupId(value: string): boolean {
  return isValidPackageName(value);
}

// Validate Maven artifact ID (e.g., my-api)
// Must start with lowercase letter, followed by lowercase letters, digits, or hyphens
export function isValidArtifactId(value: string): boolean {
  if (!value) return false;
  // Simple regex without nested quantifiers
  const ARTIFACT_ID_REGEX = /^[a-z][a-z0-9-]*$/;
  return ARTIFACT_ID_REGEX.test(value);
}
