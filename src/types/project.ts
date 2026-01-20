// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export interface JwtKeyRotationConfig {
  enabled: boolean;
  currentKeyId: string;
  previousKeyIds: string[];
}

export interface SecurityHeadersConfig {
  contentSecurityPolicy: string;
  referrerPolicy:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
  permissionsPolicy: string;
  hstsEnabled: boolean;
  hstsMaxAgeSeconds: number;
  hstsIncludeSubdomains: boolean;
  hstsPreload: boolean;
}

export interface OAuth2Config {
  issuerUri: string;
  audience: string;
  rolesClaim: string;
  rolePrefix: string;
  usernameClaim: string;
}

export interface PkceConfig {
  enabled: boolean;
  codeExpirationMinutes: number;
  requireS256: boolean;
  minCodeVerifierLength: number;
}

export interface SecurityConfig {
  mode: 'jwt' | 'oauth2';
  jwtSecretLength: 32 | 64 | 128;
  accessTokenExpiration: number; // minutes
  refreshTokenExpiration: number; // days
  enableRefreshToken: boolean;
  enableTokenBlacklist: boolean;
  passwordMinLength: number;
  maxLoginAttempts: number;
  lockoutMinutes: number;
  keyRotation: JwtKeyRotationConfig;
  headers: SecurityHeadersConfig;
  oauth2: OAuth2Config;
  pkce: PkceConfig;
}

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

export interface RateLimitConfig {
  storageMode: 'IN_MEMORY' | 'REDIS';
  requestsPerSecond: number;
  burstCapacity: number;
  authRequestsPerMinute: number;
  authBurstCapacity: number;
  blockDurationSeconds: number;
  enablePerUser: boolean;
  enablePerEndpoint: boolean;
}

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export interface CacheConfig {
  type: 'local' | 'redis';
  entities: {
    maxSize: number;
    expireAfterWriteMinutes: number;
  };
  lists: {
    maxSize: number;
    expireAfterWriteMinutes: number;
  };
  redis: {
    host: string;
    port: number;
    keyPrefix: string;
    ttlMinutes: number;
  };
}

// ============================================================================
// FEATURE FLAGS (TOGGLZ)
// ============================================================================

export type FeatureFlag =
  | 'CACHING'
  | 'CIRCUIT_BREAKER'
  | 'RATE_LIMITING'
  | 'CURSOR_PAGINATION'
  | 'ETAG_SUPPORT'
  | 'SOFT_DELETE'
  | 'DOMAIN_EVENTS'
  | 'HATEOAS'
  | 'AUDIT_LOGGING'
  | 'SSE_UPDATES'
  | 'TRACING'
  | 'METRICS'
  | 'ADVANCED_FILTERING'
  | 'BATCH_OPERATIONS';

export interface FeatureFlagsConfig {
  enabled: boolean;
  consoleEnabled: boolean;
  flags: Record<FeatureFlag, boolean>;
}

// ============================================================================
// INTERNATIONALIZATION (i18n)
// ============================================================================

export type SupportedLocale = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko';

export interface I18nConfig {
  enabled: boolean;
  defaultLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
}

// ============================================================================
// WEBHOOKS
// ============================================================================

export type WebhookEventType =
  | 'entity.created'
  | 'entity.updated'
  | 'entity.deleted'
  | 'entity.restored'
  | 'batch.import_completed'
  | 'batch.export_completed'
  | 'user.login'
  | 'user.logout'
  | 'user.login_failed'
  | 'security.rate_limit_exceeded'
  | 'security.unauthorized_access'
  | 'system.ping'
  | 'system.health_changed';

export interface WebhooksConfig {
  enabled: boolean;
  events: WebhookEventType[];
  connectTimeoutSeconds: number;
  requestTimeoutSeconds: number;
  maxRetries: number;
  retryBaseDelaySeconds: number;
  retryMaxDelayMinutes: number;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export interface BulkConfig {
  enabled: boolean;
  supportedFormats: ('CSV' | 'EXCEL')[];
  maxImportRows: number;
  streamingThreshold: number;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export interface BatchConfig {
  enabled: boolean;
  defaultBatchSize: number;
  maxConcurrent: number;
  timeoutSeconds: number;
}

// ============================================================================
// MULTI-TENANCY
// ============================================================================

export type TenantStrategy = 'HEADER' | 'SUBDOMAIN' | 'PATH' | 'JWT_CLAIM';

export interface MultiTenancyConfig {
  enabled: boolean;
  requireTenant: boolean;
  strategies: TenantStrategy[];
  tenantHeader: string;
  pathPrefix: string;
  jwtClaim: string;
  defaultTenant: string;
}

// ============================================================================
// EVENT SOURCING
// ============================================================================

export interface EventSourcingConfig {
  enabled: boolean;
  snapshotThreshold: number;
  eventTableName: string;
  snapshotTableName: string;
}

// ============================================================================
// API VERSIONING
// ============================================================================

export type VersioningStrategy = 'HEADER' | 'PATH' | 'QUERY_PARAM' | 'MEDIA_TYPE';

export interface ApiVersioningConfig {
  enabled: boolean;
  defaultVersion: string;
  strategies: VersioningStrategy[];
  versionHeader: string;
  pathPrefix: string;
  queryParam: string;
}

// ============================================================================
// OBSERVABILITY
// ============================================================================

export interface TracingConfig {
  enabled: boolean;
  samplingProbability: number;
  otlpEndpoint: string;
}

export interface MetricsConfig {
  enabled: boolean;
  slowQueryThresholdMs: number;
  exposeHikariMetrics: boolean;
  exposePrometheus: boolean;
}

export interface QueryAnalysisConfig {
  enabled: boolean;
  warnThreshold: number;
  errorThreshold: number;
  logSlowQueries: boolean;
  slowQueryThresholdMs: number;
}

export interface ObservabilityConfig {
  tracing: TracingConfig;
  metrics: MetricsConfig;
  queryAnalysis: QueryAnalysisConfig;
}

// ============================================================================
// RESILIENCE
// ============================================================================

export interface CircuitBreakerConfig {
  enabled: boolean;
  slidingWindowSize: number;
  minimumNumberOfCalls: number;
  failureRateThreshold: number;
  slowCallRateThreshold: number;
  slowCallDurationThresholdSeconds: number;
  waitDurationInOpenStateSeconds: number;
}

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  waitDurationMs: number;
  enableExponentialBackoff: boolean;
  exponentialBackoffMultiplier: number;
}

export interface ResilienceConfig {
  circuitBreaker: CircuitBreakerConfig;
  retry: RetryConfig;
}

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  allowCredentials: boolean;
  maxAgeSeconds: number;
}

// ============================================================================
// MODULE CONFIGURATIONS
// ============================================================================

export interface GraphQLConfig {
  enabled: boolean;
  path: string;
  tracingEnabled: boolean;
  introspectionEnabled: boolean;
  maxQueryDepth: number;
  maxQueryComplexity: number;
}

export interface GrpcConfig {
  enabled: boolean;
  serverPort: number;
  loggingEnabled: boolean;
  maxInboundMessageSizeMb: number;
  clientDeadlineMs: number;
  usePlaintext: boolean;
  healthCheckEnabled: boolean;
}

export interface GatewayRouteConfig {
  id: string;
  path: string;
  uri: string;
  filters: string[];
  predicates: string[];
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitBurst: number;
  circuitBreakerEnabled: boolean;
  authRequired: boolean;
}

export interface GatewayConfig {
  enabled: boolean;
  loggingEnabled: boolean;
  loggingIncludeHeaders: boolean;
  loggingIncludeBody: boolean;
  authEnabled: boolean;
  authExcludedPaths: string[];
  defaultRateLimitRequests: number;
  defaultRateLimitBurst: number;
  circuitBreakerEnabled: boolean;
  circuitBreakerTimeoutSeconds: number;
  routes: GatewayRouteConfig[];
}

// ============================================================================
// PROJECT MODULES
// ============================================================================

export interface ProjectModules {
  core: boolean;
  security: boolean;
  graphql: boolean;
  grpc: boolean;
  gateway: boolean;
}

// ============================================================================
// PROJECT FEATURES
// ============================================================================

export interface ProjectFeatures {
  hateoas: boolean;
  swagger: boolean;
  softDelete: boolean;
  auditing: boolean;
  caching: boolean;
  rateLimiting: boolean;
  virtualThreads: boolean;
  docker: boolean;
  i18n: boolean;
  webhooks: boolean;
  bulkOperations: boolean;
  batchOperations: boolean;
  multiTenancy: boolean;
  eventSourcing: boolean;
  apiVersioning: boolean;
  cursorPagination: boolean;
  etagSupport: boolean;
  domainEvents: boolean;
  sseUpdates: boolean;
}

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mariadb' | 'h2' | 'oracle' | 'sqlserver' | 'mongodb';
  generateMigrations: boolean;
  hikari: {
    maximumPoolSize: number;
    minimumIdle: number;
    connectionTimeoutMs: number;
    idleTimeoutMs: number;
  };
}

// ============================================================================
// MAIN PROJECT CONFIG
// ============================================================================

export interface ProjectConfig {
  name: string;
  groupId: string;
  artifactId: string;
  packageName: string;
  javaVersion: '21' | '25';
  springBootVersion: '4.0.0';
  modules: ProjectModules;
  features: ProjectFeatures;
  database: DatabaseConfig;
  securityConfig: SecurityConfig;
  rateLimitConfig: RateLimitConfig;
  cacheConfig: CacheConfig;
  featureFlags: FeatureFlagsConfig;
  i18nConfig: I18nConfig;
  webhooksConfig: WebhooksConfig;
  bulkConfig: BulkConfig;
  batchConfig: BatchConfig;
  multiTenancyConfig: MultiTenancyConfig;
  eventSourcingConfig: EventSourcingConfig;
  apiVersioningConfig: ApiVersioningConfig;
  observabilityConfig: ObservabilityConfig;
  resilienceConfig: ResilienceConfig;
  corsConfig: CorsConfig;
  graphqlConfig: GraphQLConfig;
  grpcConfig: GrpcConfig;
  gatewayConfig: GatewayConfig;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const defaultProjectConfig: ProjectConfig = {
  name: 'My API',
  groupId: 'com.example',
  artifactId: 'my-api',
  packageName: 'com.example.myapi',
  javaVersion: '25',
  springBootVersion: '4.0.0',
  modules: {
    core: true,
    security: false,
    graphql: false,
    grpc: false,
    gateway: false,
  },
  features: {
    hateoas: true,
    swagger: true,
    softDelete: true,
    auditing: true,
    caching: true,
    rateLimiting: false,
    virtualThreads: true,
    docker: true,
    i18n: false,
    webhooks: false,
    bulkOperations: false,
    batchOperations: false,
    multiTenancy: false,
    eventSourcing: false,
    apiVersioning: false,
    cursorPagination: true,
    etagSupport: true,
    domainEvents: true,
    sseUpdates: false,
  },
  database: {
    type: 'postgresql',
    generateMigrations: true,
    hikari: {
      maximumPoolSize: 20,
      minimumIdle: 5,
      connectionTimeoutMs: 30000,
      idleTimeoutMs: 600000,
    },
  },
  securityConfig: {
    mode: 'jwt',
    jwtSecretLength: 64,
    accessTokenExpiration: 30,
    refreshTokenExpiration: 7,
    enableRefreshToken: true,
    enableTokenBlacklist: true,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockoutMinutes: 15,
    keyRotation: {
      enabled: false,
      currentKeyId: 'key-2025-01',
      previousKeyIds: [],
    },
    headers: {
      contentSecurityPolicy: "default-src 'self'",
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: 'geolocation=(), camera=(), microphone=()',
      hstsEnabled: true,
      hstsMaxAgeSeconds: 31536000,
      hstsIncludeSubdomains: true,
      hstsPreload: false,
    },
    oauth2: {
      issuerUri: '',
      audience: '',
      rolesClaim: 'permissions',
      rolePrefix: 'ROLE_',
      usernameClaim: 'sub',
    },
    pkce: {
      enabled: false,
      codeExpirationMinutes: 10,
      requireS256: true,
      minCodeVerifierLength: 43,
    },
  },
  rateLimitConfig: {
    storageMode: 'IN_MEMORY',
    requestsPerSecond: 100,
    burstCapacity: 150,
    authRequestsPerMinute: 10,
    authBurstCapacity: 15,
    blockDurationSeconds: 60,
    enablePerUser: true,
    enablePerEndpoint: false,
  },
  cacheConfig: {
    type: 'local',
    entities: {
      maxSize: 1000,
      expireAfterWriteMinutes: 10,
    },
    lists: {
      maxSize: 100,
      expireAfterWriteMinutes: 5,
    },
    redis: {
      host: 'localhost',
      port: 6379,
      keyPrefix: 'apigen:',
      ttlMinutes: 10,
    },
  },
  featureFlags: {
    enabled: false,
    consoleEnabled: true,
    flags: {
      CACHING: true,
      CIRCUIT_BREAKER: true,
      RATE_LIMITING: true,
      CURSOR_PAGINATION: true,
      ETAG_SUPPORT: true,
      SOFT_DELETE: true,
      DOMAIN_EVENTS: true,
      HATEOAS: true,
      AUDIT_LOGGING: true,
      SSE_UPDATES: false,
      TRACING: true,
      METRICS: true,
      ADVANCED_FILTERING: true,
      BATCH_OPERATIONS: true,
    },
  },
  i18nConfig: {
    enabled: false,
    defaultLocale: 'en',
    supportedLocales: ['en', 'es'],
  },
  webhooksConfig: {
    enabled: false,
    events: [
      'entity.created',
      'entity.updated',
      'entity.deleted',
      'user.login',
      'user.logout',
      'system.ping',
    ],
    connectTimeoutSeconds: 5,
    requestTimeoutSeconds: 30,
    maxRetries: 3,
    retryBaseDelaySeconds: 1,
    retryMaxDelayMinutes: 5,
  },
  bulkConfig: {
    enabled: false,
    supportedFormats: ['CSV', 'EXCEL'],
    maxImportRows: 10000,
    streamingThreshold: 1000,
  },
  batchConfig: {
    enabled: false,
    defaultBatchSize: 100,
    maxConcurrent: 50,
    timeoutSeconds: 30,
  },
  multiTenancyConfig: {
    enabled: false,
    requireTenant: true,
    strategies: ['HEADER'],
    tenantHeader: 'X-Tenant-ID',
    pathPrefix: 'tenants',
    jwtClaim: 'tenant_id',
    defaultTenant: 'default',
  },
  eventSourcingConfig: {
    enabled: false,
    snapshotThreshold: 100,
    eventTableName: 'event_store',
    snapshotTableName: 'event_snapshots',
  },
  apiVersioningConfig: {
    enabled: false,
    defaultVersion: '1',
    strategies: ['HEADER', 'PATH'],
    versionHeader: 'X-Api-Version',
    pathPrefix: 'v',
    queryParam: 'version',
  },
  observabilityConfig: {
    tracing: {
      enabled: false,
      samplingProbability: 1,
      otlpEndpoint: 'http://localhost:4317',
    },
    metrics: {
      enabled: true,
      slowQueryThresholdMs: 500,
      exposeHikariMetrics: true,
      exposePrometheus: true,
    },
    queryAnalysis: {
      enabled: true,
      warnThreshold: 5,
      errorThreshold: 10,
      logSlowQueries: true,
      slowQueryThresholdMs: 100,
    },
  },
  resilienceConfig: {
    circuitBreaker: {
      enabled: false,
      slidingWindowSize: 100,
      minimumNumberOfCalls: 10,
      failureRateThreshold: 50,
      slowCallRateThreshold: 80,
      slowCallDurationThresholdSeconds: 2,
      waitDurationInOpenStateSeconds: 60,
    },
    retry: {
      enabled: false,
      maxAttempts: 3,
      waitDurationMs: 500,
      enableExponentialBackoff: true,
      exponentialBackoffMultiplier: 2,
    },
  },
  corsConfig: {
    allowedOrigins: ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
    exposedHeaders: ['Authorization', 'X-Total-Count', 'X-Page-Number', 'X-Page-Size'],
    allowCredentials: true,
    maxAgeSeconds: 3600,
  },
  graphqlConfig: {
    enabled: false,
    path: '/graphql',
    tracingEnabled: false,
    introspectionEnabled: true,
    maxQueryDepth: 10,
    maxQueryComplexity: 100,
  },
  grpcConfig: {
    enabled: false,
    serverPort: 9090,
    loggingEnabled: true,
    maxInboundMessageSizeMb: 4,
    clientDeadlineMs: 10000,
    usePlaintext: false,
    healthCheckEnabled: true,
  },
  gatewayConfig: {
    enabled: false,
    loggingEnabled: true,
    loggingIncludeHeaders: false,
    loggingIncludeBody: false,
    authEnabled: true,
    authExcludedPaths: ['/public/**', '/health', '/actuator/**'],
    defaultRateLimitRequests: 100,
    defaultRateLimitBurst: 200,
    circuitBreakerEnabled: true,
    circuitBreakerTimeoutSeconds: 10,
    routes: [],
  },
};
