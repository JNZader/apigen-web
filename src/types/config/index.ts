/**
 * Configuration Types Index
 *
 * This module re-exports all configuration types from their respective modules.
 * Import types from this module for convenience.
 *
 * @example
 * import { SecurityConfig, DatabaseConfig, CacheConfig } from '@/types/config';
 */

// ============================================================================
// SECURITY EXPORTS
// ============================================================================

export type {
  JwtKeyRotationConfig,
  JwtSecretLength,
  OAuth2Config,
  PkceConfig,
  ReferrerPolicy,
  SecurityConfig,
  SecurityHeadersConfig,
  SecurityMode,
} from './security';

export { defaultSecurityConfig } from './security';

// ============================================================================
// DATABASE EXPORTS
// ============================================================================

export type {
  DatabaseConfig,
  DatabaseType,
  HikariConfig,
} from './database';

export { defaultDatabaseConfig } from './database';

// ============================================================================
// CACHE EXPORTS
// ============================================================================

export type {
  CacheConfig,
  CacheType,
  EntityCacheSettings,
  ListCacheSettings,
  RedisCacheConfig,
} from './cache';

export { defaultCacheConfig } from './cache';

// ============================================================================
// OBSERVABILITY EXPORTS
// ============================================================================

export type {
  MetricsConfig,
  ObservabilityConfig,
  QueryAnalysisConfig,
  TracingConfig,
} from './observability';

export { defaultObservabilityConfig } from './observability';

// ============================================================================
// RESILIENCE EXPORTS
// ============================================================================

export type {
  CircuitBreakerConfig,
  ResilienceConfig,
  RetryConfig,
} from './resilience';

export { defaultResilienceConfig } from './resilience';

// ============================================================================
// MESSAGING EXPORTS
// ============================================================================

export type {
  I18nConfig,
  SupportedLocale,
  WebhookEventType,
  WebhooksConfig,
} from './messaging';

export { defaultI18nConfig, defaultWebhooksConfig } from './messaging';

// ============================================================================
// FEATURES EXPORTS
// ============================================================================

export type {
  BatchConfig,
  BulkConfig,
  BulkFormat,
  FeatureFlag,
  FeatureFlagsConfig,
} from './features';

export {
  defaultBatchConfig,
  defaultBulkConfig,
  defaultFeatureFlagsConfig,
} from './features';

// ============================================================================
// API EXPORTS
// ============================================================================

export type {
  ApiVersioningConfig,
  CorsConfig,
  GatewayConfig,
  GatewayRouteConfig,
  GraphQLConfig,
  GrpcConfig,
  VersioningStrategy,
} from './api';

export {
  defaultApiVersioningConfig,
  defaultCorsConfig,
  defaultGatewayConfig,
  defaultGraphQLConfig,
  defaultGrpcConfig,
} from './api';

// ============================================================================
// MICROSERVICES EXPORTS
// ============================================================================

export type {
  EventSourcingConfig,
  MultiTenancyConfig,
  RateLimitConfig,
  RateLimitStorageMode,
  TenantStrategy,
} from './microservices';

export {
  defaultEventSourcingConfig,
  defaultMultiTenancyConfig,
  defaultRateLimitConfig,
} from './microservices';

// ============================================================================
// FEATURE PACK 2025 EXPORTS
// ============================================================================

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
} from './featurepack';

export {
  defaultFeaturePackConfig,
  defaultJteConfig,
  defaultMailConfig,
  defaultPasswordResetConfig,
  defaultSocialLoginConfig,
  defaultStorageConfig,
} from './featurepack';
// GO/CHI EXPORTS
// ============================================================================

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
} from './gochi';

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
} from './gochi';
// RUST/AXUM EXPORTS
// ============================================================================

export type {
  AxumMiddlewareConfig,
  AxumServerConfig,
  EdgeAiConfig,
  EdgeAnomalyConfig,
  EdgeConfig,
  EdgeGatewayConfig,
  RustAxumOptions,
  RustPreset,
} from './rust';

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
} from './rust';
