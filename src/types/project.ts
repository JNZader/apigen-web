/**
 * Project Configuration Types
 *
 * This module contains the main project configuration interface and default values.
 * Individual configuration modules are imported from the config directory.
 */

// ============================================================================
// IMPORTS FOR DEFAULT CONFIG
// ============================================================================

import {
  defaultApiVersioningConfig,
  defaultCorsConfig,
  defaultGatewayConfig,
  defaultGraphQLConfig,
  defaultGrpcConfig,
} from './config/api';
import { defaultCacheConfig } from './config/cache';
import { defaultDatabaseConfig } from './config/database';
import { defaultFeaturePackConfig } from './config/featurepack';
import {
  defaultBatchConfig,
  defaultBulkConfig,
  defaultFeatureFlagsConfig,
} from './config/features';
import { defaultGoChiOptions } from './config/gochi';
import { defaultI18nConfig, defaultWebhooksConfig } from './config/messaging';
import {
  defaultEventSourcingConfig,
  defaultMultiTenancyConfig,
  defaultRateLimitConfig,
} from './config/microservices';
import { defaultObservabilityConfig } from './config/observability';
import { defaultResilienceConfig } from './config/resilience';
import { defaultRustAxumOptions } from './config/rust';
import { defaultSecurityConfig } from './config/security';
import { defaultTargetConfig } from './target';

// ============================================================================
// RE-EXPORTS FROM CONFIG MODULES
// ============================================================================

// API types
export type {
  ApiVersioningConfig,
  CorsConfig,
  GatewayConfig,
  GatewayRouteConfig,
  GraphQLConfig,
  GrpcConfig,
  VersioningStrategy,
} from './config/api';
export {
  defaultApiVersioningConfig,
  defaultCorsConfig,
  defaultGatewayConfig,
  defaultGraphQLConfig,
  defaultGrpcConfig,
} from './config/api';
// Cache types
export type {
  CacheConfig,
  CacheType,
  EntityCacheSettings,
  ListCacheSettings,
  RedisCacheConfig,
} from './config/cache';
export { defaultCacheConfig } from './config/cache';
// Database types
export type {
  DatabaseConfig,
  DatabaseType,
  HikariConfig,
} from './config/database';
export { defaultDatabaseConfig } from './config/database';
// Feature Pack 2025 types
export type {
  AzureStorageConfig,
  FeaturePackConfig,
  GcsStorageConfig,
  JteConfig,
  LocalStorageConfig,
  MailConfig,
  PasswordResetConfig,
  S3StorageConfig,
  SmtpEncryption,
  SocialLoginConfig,
  SocialProvider,
  SocialProviderConfig,
  StorageConfig,
  StorageProvider,
} from './config/featurepack';
export {
  defaultFeaturePackConfig,
  defaultJteConfig,
  defaultMailConfig,
  defaultPasswordResetConfig,
  defaultSocialLoginConfig,
  defaultStorageConfig,
} from './config/featurepack';
// Feature types
export type {
  BatchConfig,
  BulkConfig,
  BulkFormat,
  FeatureFlag,
  FeatureFlagsConfig,
} from './config/features';
export {
  defaultBatchConfig,
  defaultBulkConfig,
  defaultFeatureFlagsConfig,
} from './config/features';
// Go/Chi types
export type {
  GoChiCacheConfig,
  GoChiCacheType,
  GoChiMessagingConfig,
  GoChiMessagingType,
  GoChiOptions,
  GoChiRedisConfig,
  KafkaConfig,
  MemcachedConfig,
  MemoryCacheConfig,
  NatsConfig,
  RabbitMQConfig,
} from './config/gochi';
export {
  defaultGoChiCacheConfig,
  defaultGoChiMessagingConfig,
  defaultGoChiOptions,
  defaultGoChiRedisConfig,
  defaultKafkaConfig,
  defaultMemcachedConfig,
  defaultMemoryCacheConfig,
  defaultNatsConfig,
  defaultRabbitMQConfig,
  getDefaultGoChiOptions,
} from './config/gochi';
// Messaging types
export type {
  I18nConfig,
  SupportedLocale,
  WebhookEventType,
  WebhooksConfig,
} from './config/messaging';
export { defaultI18nConfig, defaultWebhooksConfig } from './config/messaging';
// Microservices types
export type {
  EventSourcingConfig,
  MultiTenancyConfig,
  RateLimitConfig,
  RateLimitStorageMode,
  TenantStrategy,
} from './config/microservices';
export {
  defaultEventSourcingConfig,
  defaultMultiTenancyConfig,
  defaultRateLimitConfig,
} from './config/microservices';
// Observability types
export type {
  MetricsConfig,
  ObservabilityConfig,
  QueryAnalysisConfig,
  TracingConfig,
} from './config/observability';
export { defaultObservabilityConfig } from './config/observability';
// Resilience types
export type {
  CircuitBreakerConfig,
  ResilienceConfig,
  RetryConfig,
} from './config/resilience';
export { defaultResilienceConfig } from './config/resilience';
// Rust/Axum types
export type {
  AxumMiddlewareConfig,
  AxumServerConfig,
  EdgeAiConfig,
  EdgeAnomalyConfig,
  EdgeConfig,
  EdgeGatewayConfig,
  RustAxumOptions,
  RustPreset,
} from './config/rust';
export {
  cloudPresetDefaults,
  defaultAxumMiddlewareConfig,
  defaultAxumServerConfig,
  defaultEdgeAiConfig,
  defaultEdgeAnomalyConfig,
  defaultEdgeConfig,
  defaultEdgeGatewayConfig,
  defaultRustAxumOptions,
  edgeAiPresetDefaults,
  edgeAnomalyPresetDefaults,
  edgeGatewayPresetDefaults,
  getRustPresetDefaults,
  RUST_PRESET_DEFAULTS,
} from './config/rust';
// Security types
export type {
  JwtKeyRotationConfig,
  JwtSecretLength,
  OAuth2Config,
  PkceConfig,
  ReferrerPolicy,
  SecurityConfig,
  SecurityHeadersConfig,
  SecurityMode,
} from './config/security';
export { defaultSecurityConfig } from './config/security';
// Target types
export type {
  Framework,
  FrameworkMetadata,
  Language,
  LanguageFrameworkMap,
  LanguageMetadata,
  TargetConfig,
} from './target';
export {
  createDefaultTargetConfig,
  defaultTargetConfig,
  FRAMEWORK_METADATA,
  FRAMEWORKS,
  getDefaultFramework,
  getFrameworksForLanguage,
  isFrameworkCompatible,
  LANGUAGE_METADATA,
  LANGUAGES,
} from './target';

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

  // ============================================================================
  // FEATURE PACK 2025
  // ============================================================================

  /** Enable social login (OAuth2: Google, GitHub, Facebook, Apple, Microsoft) */
  socialLogin: boolean;
  /** Enable password reset functionality */
  passwordReset: boolean;
  /** Enable mail service (SMTP email sending) */
  mailService: boolean;
  /** Enable file storage (local, S3, GCS, Azure) */
  fileStorage: boolean;
  /** Enable JTE templates for email rendering */
  jteTemplates: boolean;

  // ============================================================================
  // DEVELOPER EXPERIENCE FEATURES (v2.19.0+)
  // ============================================================================

  /** Enable mise task runner configuration (mise.toml) */
  miseTasks: boolean;
  /** Enable pre-commit hooks (.pre-commit-config.yaml) */
  preCommit: boolean;
  /** Enable automated setup scripts (scripts/setup.sh, scripts/setup.ps1) */
  setupScript: boolean;
  /** Enable GitHub PR and Issue templates (.github/) */
  githubTemplates: boolean;
  /** Enable enhanced docker-compose for development */
  devCompose: boolean;
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
 * Contains all settings for generating an API project.
 * Supports multiple languages and frameworks through the target configuration.
 */
export interface ProjectConfig {
  /** Project display name */
  name: string;
  /** Maven group ID (e.g., 'com.example') - for Java/Kotlin projects */
  groupId: string;
  /** Maven artifact ID (e.g., 'my-api') - for Java/Kotlin projects */
  artifactId: string;
  /** Java package name (e.g., 'com.example.myapi') - for Java/Kotlin projects */
  packageName: string;
  /**
   * Java version to target
   * @deprecated Use targetConfig.languageVersion instead for multi-language support
   */
  javaVersion: JavaVersion;
  /**
   * Spring Boot version to use
   * @deprecated Use targetConfig.frameworkVersion instead for multi-language support
   */
  springBootVersion: SpringBootVersion;

  // ============================================================================
  // TARGET CONFIGURATION (Multi-language support)
  // ============================================================================

  /** Target language and framework configuration */
  targetConfig: import('./target').TargetConfig;

  // ============================================================================
  // MODULE & FEATURE SELECTION
  // ============================================================================

  /** Module selection */
  modules: ProjectModules;
  /** Feature selection */
  features: ProjectFeatures;

  // ============================================================================
  // CORE CONFIGURATIONS
  // ============================================================================

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

  // ============================================================================
  // FEATURE PACK 2025
  // ============================================================================

  /** Feature Pack 2025 configuration (social login, password reset, mail, storage, JTE) */
  featurePackConfig: import('./config/featurepack').FeaturePackConfig;

  // ============================================================================
  // LANGUAGE-SPECIFIC OPTIONS
  // ============================================================================

  /** Rust/Axum specific options (only used when target.language is 'rust') */
  rustOptions: import('./config/rust').RustAxumOptions;
  /** Go/Chi specific options (only used when target.framework is 'chi') */
  goChiOptions: import('./config/gochi').GoChiOptions;
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

  // Target configuration (multi-language support)
  targetConfig: defaultTargetConfig,

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
    // Feature Pack 2025
    socialLogin: false,
    passwordReset: false,
    mailService: false,
    fileStorage: false,
    jteTemplates: false,
    // Developer Experience (DX) Features
    miseTasks: true,
    preCommit: true,
    setupScript: true,
    githubTemplates: true,
    devCompose: true,
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

  // Feature Pack 2025 configuration
  featurePackConfig: defaultFeaturePackConfig,

  // Language-specific options
  rustOptions: defaultRustAxumOptions,
  goChiOptions: defaultGoChiOptions,
};
