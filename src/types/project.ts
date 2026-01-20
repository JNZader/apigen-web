/**
 * Project Configuration Types
 *
 * This module contains the main project configuration interface and default values.
 * Individual configuration modules are imported from the config directory.
 */

// ============================================================================
// IMPORTS FOR DEFAULT CONFIG
// ============================================================================

import { defaultSecurityConfig } from './config/security';
import { defaultDatabaseConfig } from './config/database';
import { defaultCacheConfig } from './config/cache';
import { defaultObservabilityConfig } from './config/observability';
import { defaultResilienceConfig } from './config/resilience';
import { defaultWebhooksConfig, defaultI18nConfig } from './config/messaging';
import {
  defaultFeatureFlagsConfig,
  defaultBulkConfig,
  defaultBatchConfig,
} from './config/features';
import {
  defaultGraphQLConfig,
  defaultGrpcConfig,
  defaultGatewayConfig,
  defaultApiVersioningConfig,
  defaultCorsConfig,
} from './config/api';
import {
  defaultMultiTenancyConfig,
  defaultEventSourcingConfig,
  defaultRateLimitConfig,
} from './config/microservices';

// ============================================================================
// RE-EXPORTS FROM CONFIG MODULES
// ============================================================================

// Security types
export type {
  SecurityMode,
  JwtSecretLength,
  ReferrerPolicy,
  JwtKeyRotationConfig,
  SecurityHeadersConfig,
  OAuth2Config,
  PkceConfig,
  SecurityConfig,
} from './config/security';
export { defaultSecurityConfig } from './config/security';

// Database types
export type {
  DatabaseType,
  HikariConfig,
  DatabaseConfig,
} from './config/database';
export { defaultDatabaseConfig } from './config/database';

// Cache types
export type {
  CacheType,
  EntityCacheSettings,
  ListCacheSettings,
  RedisCacheConfig,
  CacheConfig,
} from './config/cache';
export { defaultCacheConfig } from './config/cache';

// Observability types
export type {
  TracingConfig,
  MetricsConfig,
  QueryAnalysisConfig,
  ObservabilityConfig,
} from './config/observability';
export { defaultObservabilityConfig } from './config/observability';

// Resilience types
export type {
  CircuitBreakerConfig,
  RetryConfig,
  ResilienceConfig,
} from './config/resilience';
export { defaultResilienceConfig } from './config/resilience';

// Messaging types
export type {
  WebhookEventType,
  WebhooksConfig,
  SupportedLocale,
  I18nConfig,
} from './config/messaging';
export { defaultWebhooksConfig, defaultI18nConfig } from './config/messaging';

// Feature types
export type {
  FeatureFlag,
  FeatureFlagsConfig,
  BulkFormat,
  BulkConfig,
  BatchConfig,
} from './config/features';
export {
  defaultFeatureFlagsConfig,
  defaultBulkConfig,
  defaultBatchConfig,
} from './config/features';

// API types
export type {
  GraphQLConfig,
  GrpcConfig,
  GatewayRouteConfig,
  GatewayConfig,
  VersioningStrategy,
  ApiVersioningConfig,
  CorsConfig,
} from './config/api';
export {
  defaultGraphQLConfig,
  defaultGrpcConfig,
  defaultGatewayConfig,
  defaultApiVersioningConfig,
  defaultCorsConfig,
} from './config/api';

// Microservices types
export type {
  TenantStrategy,
  MultiTenancyConfig,
  EventSourcingConfig,
  RateLimitStorageMode,
  RateLimitConfig,
} from './config/microservices';
export {
  defaultMultiTenancyConfig,
  defaultEventSourcingConfig,
  defaultRateLimitConfig,
} from './config/microservices';

// ============================================================================
// PROJECT MODULES
// ============================================================================

/**
 * Project modules configuration.
 * Controls which modules are included in the generated project.
 */
export interface ProjectModules {
  /** Include core REST API module */
  core: boolean;
  /** Include security module (JWT/OAuth2) */
  security: boolean;
  /** Include GraphQL module */
  graphql: boolean;
  /** Include gRPC module */
  grpc: boolean;
  /** Include API Gateway module */
  gateway: boolean;
}

// ============================================================================
// PROJECT FEATURES
// ============================================================================

/**
 * Project features configuration.
 * Controls which features are enabled in the generated project.
 */
export interface ProjectFeatures {
  /** Enable HATEOAS links in responses */
  hateoas: boolean;
  /** Enable Swagger/OpenAPI documentation */
  swagger: boolean;
  /** Enable soft delete (logical deletion) */
  softDelete: boolean;
  /** Enable auditing (createdAt, updatedAt, createdBy, updatedBy) */
  auditing: boolean;
  /** Enable response caching */
  caching: boolean;
  /** Enable rate limiting */
  rateLimiting: boolean;
  /** Enable Java 21+ virtual threads */
  virtualThreads: boolean;
  /** Generate Docker configuration */
  docker: boolean;
  /** Enable internationalization */
  i18n: boolean;
  /** Enable webhooks */
  webhooks: boolean;
  /** Enable bulk import/export operations */
  bulkOperations: boolean;
  /** Enable batch CRUD operations */
  batchOperations: boolean;
  /** Enable multi-tenancy support */
  multiTenancy: boolean;
  /** Enable event sourcing */
  eventSourcing: boolean;
  /** Enable API versioning */
  apiVersioning: boolean;
  /** Enable cursor-based pagination */
  cursorPagination: boolean;
  /** Enable ETag support for caching */
  etagSupport: boolean;
  /** Enable domain events */
  domainEvents: boolean;
  /** Enable Server-Sent Events for updates */
  sseUpdates: boolean;
}

// ============================================================================
// MAIN PROJECT CONFIG
// ============================================================================

/**
 * Supported Java versions.
 */
export type JavaVersion = '21' | '25';

/**
 * Supported Spring Boot versions.
 */
export type SpringBootVersion = '4.0.0';

/**
 * Main project configuration interface.
 * Contains all settings for generating a Spring Boot API project.
 */
export interface ProjectConfig {
  /** Project display name */
  name: string;
  /** Maven group ID (e.g., 'com.example') */
  groupId: string;
  /** Maven artifact ID (e.g., 'my-api') */
  artifactId: string;
  /** Java package name (e.g., 'com.example.myapi') */
  packageName: string;
  /** Java version to target */
  javaVersion: JavaVersion;
  /** Spring Boot version to use */
  springBootVersion: SpringBootVersion;
  /** Module selection */
  modules: ProjectModules;
  /** Feature selection */
  features: ProjectFeatures;
  /** Database configuration */
  database: import('./config/database').DatabaseConfig;
  /** Security configuration */
  securityConfig: import('./config/security').SecurityConfig;
  /** Rate limiting configuration */
  rateLimitConfig: import('./config/microservices').RateLimitConfig;
  /** Cache configuration */
  cacheConfig: import('./config/cache').CacheConfig;
  /** Feature flags configuration */
  featureFlags: import('./config/features').FeatureFlagsConfig;
  /** Internationalization configuration */
  i18nConfig: import('./config/messaging').I18nConfig;
  /** Webhooks configuration */
  webhooksConfig: import('./config/messaging').WebhooksConfig;
  /** Bulk operations configuration */
  bulkConfig: import('./config/features').BulkConfig;
  /** Batch operations configuration */
  batchConfig: import('./config/features').BatchConfig;
  /** Multi-tenancy configuration */
  multiTenancyConfig: import('./config/microservices').MultiTenancyConfig;
  /** Event sourcing configuration */
  eventSourcingConfig: import('./config/microservices').EventSourcingConfig;
  /** API versioning configuration */
  apiVersioningConfig: import('./config/api').ApiVersioningConfig;
  /** Observability configuration */
  observabilityConfig: import('./config/observability').ObservabilityConfig;
  /** Resilience configuration */
  resilienceConfig: import('./config/resilience').ResilienceConfig;
  /** CORS configuration */
  corsConfig: import('./config/api').CorsConfig;
  /** GraphQL configuration */
  graphqlConfig: import('./config/api').GraphQLConfig;
  /** gRPC configuration */
  grpcConfig: import('./config/api').GrpcConfig;
  /** API Gateway configuration */
  gatewayConfig: import('./config/api').GatewayConfig;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default project configuration values.
 * Provides sensible defaults for all configuration options.
 */
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
  database: defaultDatabaseConfig,
  securityConfig: defaultSecurityConfig,
  rateLimitConfig: defaultRateLimitConfig,
  cacheConfig: defaultCacheConfig,
  featureFlags: defaultFeatureFlagsConfig,
  i18nConfig: defaultI18nConfig,
  webhooksConfig: defaultWebhooksConfig,
  bulkConfig: defaultBulkConfig,
  batchConfig: defaultBatchConfig,
  multiTenancyConfig: defaultMultiTenancyConfig,
  eventSourcingConfig: defaultEventSourcingConfig,
  apiVersioningConfig: defaultApiVersioningConfig,
  observabilityConfig: defaultObservabilityConfig,
  resilienceConfig: defaultResilienceConfig,
  corsConfig: defaultCorsConfig,
  graphqlConfig: defaultGraphQLConfig,
  grpcConfig: defaultGrpcConfig,
  gatewayConfig: defaultGatewayConfig,
};
