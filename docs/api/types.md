# Type Definitions

TypeScript type definitions for APiGen Studio.

## Entity Types

### EntityDesign

Represents an entity in the design.

```typescript
interface EntityDesign {
  id: string;
  name: string;                    // PascalCase (e.g., "Product")
  tableName: string;               // snake_case (e.g., "products")
  description?: string;
  position: { x: number; y: number };
  fields: FieldDesign[];
  config: EntityConfig;
}

interface EntityConfig {
  generateController: boolean;
  generateService: boolean;
  enableCaching: boolean;
  customEndpoint?: string;
}
```

### FieldDesign

Represents a field within an entity.

```typescript
interface FieldDesign {
  id: string;
  name: string;                    // camelCase (e.g., "firstName")
  columnName: string;              // snake_case (e.g., "first_name")
  type: JavaType;
  nullable: boolean;
  unique: boolean;
  indexed: boolean;
  defaultValue?: string;
  description?: string;
  validations: Validation[];
}
```

### JavaType

Supported Java types for fields.

```typescript
type JavaType =
  | 'String'
  | 'Long'
  | 'Integer'
  | 'Double'
  | 'Float'
  | 'BigDecimal'
  | 'Boolean'
  | 'LocalDate'
  | 'LocalDateTime'
  | 'LocalTime'
  | 'Instant'
  | 'UUID'
  | 'byte[]';
```

### Validation

Field validation rules.

```typescript
interface Validation {
  type: ValidationType;
  value?: string | number;
  message?: string;
}

type ValidationType =
  | 'NotNull'
  | 'NotBlank'
  | 'NotEmpty'
  | 'Size'
  | 'Min'
  | 'Max'
  | 'Email'
  | 'Pattern'
  | 'Positive'
  | 'PositiveOrZero'
  | 'Negative'
  | 'NegativeOrZero'
  | 'Past'
  | 'PastOrPresent'
  | 'Future'
  | 'FutureOrPresent';
```

---

## Relation Types

### RelationDesign

Represents a relationship between entities.

```typescript
interface RelationDesign {
  id: string;
  type: RelationType;
  sourceEntityId: string;
  sourceFieldName: string;
  targetEntityId: string;
  targetFieldName?: string;        // For bidirectional
  bidirectional: boolean;
  fetchType: FetchType;
  cascade: CascadeType[];
  foreignKey: ForeignKeyConfig;
  joinTable?: JoinTableConfig;     // For ManyToMany
}
```

### RelationType

```typescript
type RelationType =
  | 'OneToOne'
  | 'OneToMany'
  | 'ManyToOne'
  | 'ManyToMany';
```

### FetchType

```typescript
type FetchType = 'LAZY' | 'EAGER';
```

### CascadeType

```typescript
type CascadeType =
  | 'ALL'
  | 'PERSIST'
  | 'MERGE'
  | 'REMOVE'
  | 'REFRESH'
  | 'DETACH';
```

### ForeignKeyConfig

```typescript
interface ForeignKeyConfig {
  columnName: string;
  nullable: boolean;
  onDelete: ForeignKeyAction;
  onUpdate: ForeignKeyAction;
}

type ForeignKeyAction =
  | 'CASCADE'
  | 'SET_NULL'
  | 'SET_DEFAULT'
  | 'RESTRICT'
  | 'NO_ACTION';
```

---

## Service Types

### ServiceDesign

Represents a microservice definition.

```typescript
interface ServiceDesign {
  id: string;
  name: string;
  description?: string;
  entityIds: string[];             // Entities in this service
  port: number;
  position: { x: number; y: number };
  config: ServiceConfig;
  connections: ServiceConnection[];
}

interface ServiceConfig {
  enableDiscovery: boolean;
  enableCircuitBreaker: boolean;
  enableTracing: boolean;
}

interface ServiceConnection {
  id: string;
  targetServiceId: string;
  protocol: 'REST' | 'gRPC' | 'Messaging';
  description?: string;
}
```

---

## Project Types

### ProjectConfig

Project-wide configuration.

```typescript
interface ProjectConfig {
  // Maven coordinates
  groupId: string;
  artifactId: string;
  version: string;
  name: string;
  description: string;

  // Java configuration
  javaVersion: JavaVersion;
  springBootVersion: string;
  packageName: string;

  // Feature configurations
  database: DatabaseConfig;
  api: ApiConfig;
  security: SecurityConfig;
  cache: CacheConfig;
  messaging: MessagingConfig;
  observability: ObservabilityConfig;
  resilience: ResilienceConfig;
  microservices: MicroservicesConfig;
}
```

### DatabaseConfig

```typescript
interface DatabaseConfig {
  type: DatabaseType;
  enableAuditing: boolean;
  enableSoftDelete: boolean;
  namingStrategy: NamingStrategy;
  connectionPool: ConnectionPoolConfig;
}

type DatabaseType =
  | 'PostgreSQL'
  | 'MySQL'
  | 'MariaDB'
  | 'H2'
  | 'Oracle'
  | 'SQLServer';
```

### ApiConfig

```typescript
interface ApiConfig {
  basePath: string;
  enableSwagger: boolean;
  enableHateoas: boolean;
  enableVersioning: boolean;
  versioningStrategy: VersioningStrategy;
  defaultPageSize: number;
  maxPageSize: number;
}
```

### SecurityConfig

```typescript
interface SecurityConfig {
  enabled: boolean;
  authType: AuthType;
  enableCors: boolean;
  corsOrigins: string[];
  jwtSecret?: string;
  jwtExpiration?: number;
}

type AuthType = 'none' | 'basic' | 'jwt' | 'oauth2';
```

### CacheConfig

```typescript
interface CacheConfig {
  enabled: boolean;
  provider: CacheProvider;
  ttl: number;
  maxEntries: number;
}

type CacheProvider = 'none' | 'caffeine' | 'redis' | 'hazelcast';
```

### MessagingConfig

```typescript
interface MessagingConfig {
  enabled: boolean;
  broker: MessageBroker;
  enableDomainEvents: boolean;
}

type MessageBroker = 'none' | 'rabbitmq' | 'kafka' | 'activemq';
```

---

## Canvas Types

### CanvasView

```typescript
type CanvasView = 'entities' | 'services';
```

### Position

```typescript
interface Position {
  x: number;
  y: number;
}
```

---

## Usage Examples

### Creating an Entity

```typescript
const entity: EntityDesign = {
  id: nanoid(),
  name: 'Product',
  tableName: 'products',
  position: { x: 100, y: 100 },
  fields: [
    {
      id: nanoid(),
      name: 'name',
      columnName: 'name',
      type: 'String',
      nullable: false,
      unique: false,
      indexed: true,
      validations: [
        { type: 'NotBlank' },
        { type: 'Size', value: 'max=100' },
      ],
    },
  ],
  config: {
    generateController: true,
    generateService: true,
    enableCaching: true,
  },
};
```

### Creating a Relation

```typescript
const relation: RelationDesign = {
  id: nanoid(),
  type: 'ManyToOne',
  sourceEntityId: orderEntity.id,
  sourceFieldName: 'customer',
  targetEntityId: customerEntity.id,
  bidirectional: true,
  fetchType: 'LAZY',
  cascade: ['PERSIST', 'MERGE'],
  foreignKey: {
    columnName: 'customer_id',
    nullable: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  },
};
```

---

## Type Guards

```typescript
// Check if a type is a Java type
function isJavaType(type: string): type is JavaType {
  return JAVA_TYPES.includes(type as JavaType);
}

// Check if relation is bidirectional
function isBidirectional(relation: RelationDesign): boolean {
  return relation.bidirectional && !!relation.targetFieldName;
}
```
