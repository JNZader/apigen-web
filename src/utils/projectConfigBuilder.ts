import type { ProjectConfig } from '../types';
import type { ServiceDesign } from '../types';

/**
 * Builds a ProjectConfig object for generation, applying service-specific overrides if provided
 */
export function buildProjectConfig(
  baseProject: ProjectConfig,
  service?: ServiceDesign,
): ProjectConfig {
  const baseConfig = {
    name: service?.name || baseProject.name,
    groupId: baseProject.groupId,
    artifactId: service?.name
      ? `api-${service.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      : baseProject.artifactId,
    javaVersion: baseProject.javaVersion,
    springBootVersion: baseProject.springBootVersion,
    modules: baseProject.modules,
    features: baseProject.features,
    database: {
      ...baseProject.database,
      type:
        (service?.config.databaseType as typeof baseProject.database.type) ||
        baseProject.database.type,
    },
    securityConfig: baseProject.securityConfig,
    rateLimitConfig: service?.config.enableRateLimiting
      ? baseProject.rateLimitConfig
      : {
          ...baseProject.rateLimitConfig,
          requestsPerSecond: 0,
        },
    cacheConfig: baseProject.cacheConfig,
    featureFlags: baseProject.featureFlags,
    i18nConfig: baseProject.i18nConfig,
    webhooksConfig: baseProject.webhooksConfig,
    bulkConfig: baseProject.bulkConfig,
    batchConfig: baseProject.batchConfig,
    multiTenancyConfig: baseProject.multiTenancyConfig,
    eventSourcingConfig: baseProject.eventSourcingConfig,
    apiVersioningConfig: baseProject.apiVersioningConfig,
    observabilityConfig: service
      ? {
          ...baseProject.observabilityConfig,
          tracing: {
            ...baseProject.observabilityConfig.tracing,
            enabled: service.config.enableTracing,
          },
          metrics: {
            ...baseProject.observabilityConfig.metrics,
            enabled: service.config.enableMetrics,
          },
        }
      : baseProject.observabilityConfig,
    resilienceConfig: service
      ? {
          ...baseProject.resilienceConfig,
          circuitBreaker: {
            ...baseProject.resilienceConfig.circuitBreaker,
            enabled: service.config.enableCircuitBreaker,
          },
        }
      : baseProject.resilienceConfig,
    corsConfig: baseProject.corsConfig,
    graphqlConfig: baseProject.graphqlConfig,
    grpcConfig: baseProject.grpcConfig,
    gatewayConfig: baseProject.gatewayConfig,
  };

  return baseConfig;
}
