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
  SecurityMode,
  JwtSecretLength,
  ReferrerPolicy,
  JwtKeyRotationConfig,
  SecurityHeadersConfig,
  OAuth2Config,
  PkceConfig,
  SecurityConfig,
} from './security';

export { defaultSecurityConfig } from './security';

// ============================================================================
// DATABASE EXPORTS
// ============================================================================

export type {
  DatabaseType,
  HikariConfig,
  DatabaseConfig,
} from './database';

export { defaultDatabaseConfig } from './database';

// ============================================================================
// CACHE EXPORTS
// ============================================================================

export type {
  CacheType,
  EntityCacheSettings,
  ListCacheSettings,
  RedisCacheConfig,
  CacheConfig,
} from './cache';

export { defaultCacheConfig } from './cache';

// ============================================================================
// OBSERVABILITY EXPORTS
// ============================================================================

export type {
  TracingConfig,
  MetricsConfig,
  QueryAnalysisConfig,
  ObservabilityConfig,
} from './observability';

export { defaultObservabilityConfig } from './observability';

// ============================================================================
// RESILIENCE EXPORTS
// ============================================================================

export type {
  CircuitBreakerConfig,
  RetryConfig,
  ResilienceConfig,
} from './resilience';

export { defaultResilienceConfig } from './resilience';

// ============================================================================
// MESSAGING EXPORTS
// ============================================================================

export type {
  WebhookEventType,
  WebhooksConfig,
  SupportedLocale,
  I18nConfig,
} from './messaging';

export { defaultWebhooksConfig, defaultI18nConfig } from './messaging';

// ============================================================================
// FEATURES EXPORTS
// ============================================================================

export type {
  FeatureFlag,
  FeatureFlagsConfig,
  BulkFormat,
  BulkConfig,
  BatchConfig,
} from './features';

export {
  defaultFeatureFlagsConfig,
  defaultBulkConfig,
  defaultBatchConfig,
} from './features';

// ============================================================================
// API EXPORTS
// ============================================================================

export type {
  GraphQLConfig,
  GrpcConfig,
  GatewayRouteConfig,
  GatewayConfig,
  VersioningStrategy,
  ApiVersioningConfig,
  CorsConfig,
} from './api';

export {
  defaultGraphQLConfig,
  defaultGrpcConfig,
  defaultGatewayConfig,
  defaultApiVersioningConfig,
  defaultCorsConfig,
} from './api';

// ============================================================================
// MICROSERVICES EXPORTS
// ============================================================================

export type {
  TenantStrategy,
  MultiTenancyConfig,
  EventSourcingConfig,
  RateLimitStorageMode,
  RateLimitConfig,
} from './microservices';

export {
  defaultMultiTenancyConfig,
  defaultEventSourcingConfig,
  defaultRateLimitConfig,
} from './microservices';
