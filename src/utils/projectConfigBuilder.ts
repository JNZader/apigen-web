import type { Language, ProjectConfig, ServiceDesign, TargetConfig } from '../types';
import { getDefaultGoChiOptions } from '../types/config/gochi';
import { defaultRustAxumOptions, getRustPresetDefaults } from '../types/config/rust';
import { createDefaultTargetConfig, isFrameworkCompatible } from '../types/target';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Result of configuration validation.
 */
export interface ValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates that the target configuration is internally consistent.
 *
 * @param targetConfig - The target configuration to validate
 * @returns Validation result with errors and warnings
 */
export function validateTargetConfig(targetConfig: TargetConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check language-framework compatibility
  if (!isFrameworkCompatible(targetConfig.language, targetConfig.framework)) {
    errors.push(
      `Framework '${targetConfig.framework}' is not compatible with language '${targetConfig.language}'`,
    );
  }

  // Validate language version is not empty
  if (!targetConfig.languageVersion || targetConfig.languageVersion.trim() === '') {
    errors.push('Language version cannot be empty');
  }

  // Validate framework version is not empty
  if (!targetConfig.frameworkVersion || targetConfig.frameworkVersion.trim() === '') {
    errors.push('Framework version cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that features are compatible with the target language/framework.
 *
 * @param config - The project configuration to validate
 * @returns Validation result with errors and warnings
 */
export function validateFeatureCompatibility(config: ProjectConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { language, framework } = config.targetConfig;

  // Feature Pack 2025 features are primarily designed for Java/Spring Boot
  const featurePackFeatures = [
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    'jteTemplates',
  ] as const;

  const javaOnlyLanguages = new Set<Language>(['java', 'kotlin']);

  for (const feature of featurePackFeatures) {
    if (config.features[feature] && !javaOnlyLanguages.has(language)) {
      if (feature === 'jteTemplates') {
        errors.push(`JTE Templates feature is only available for Java/Kotlin projects`);
      } else {
        warnings.push(`Feature '${feature}' may have limited support for ${language}/${framework}`);
      }
    }
  }

  // Virtual threads are Java 21+ specific
  if (config.features.virtualThreads && !javaOnlyLanguages.has(language)) {
    errors.push(`Virtual threads feature is only available for Java/Kotlin projects`);
  }

  // Go/Chi specific validations
  if (framework === 'chi' && language !== 'go') {
    errors.push(`Chi framework is only compatible with Go language`);
  }

  // Rust/Axum specific validations
  if (framework === 'axum' && language !== 'rust') {
    errors.push(`Axum framework is only compatible with Rust language`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates the complete project configuration.
 *
 * @param config - The project configuration to validate
 * @returns Validation result combining all checks
 */
export function validateProjectConfig(config: ProjectConfig): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate target configuration
  const targetResult = validateTargetConfig(config.targetConfig);
  allErrors.push(...targetResult.errors);
  allWarnings.push(...targetResult.warnings);

  // Validate feature compatibility
  const featureResult = validateFeatureCompatibility(config);
  allErrors.push(...featureResult.errors);
  allWarnings.push(...featureResult.warnings);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Builds Feature Pack configuration based on enabled features.
 * Only includes configurations for features that are actually enabled.
 *
 * @param baseProject - The base project configuration
 * @returns Feature Pack configuration with enabled features
 */
function buildFeaturePackConfig(baseProject: ProjectConfig) {
  const { features, featurePackConfig } = baseProject;

  return {
    socialLogin: {
      ...featurePackConfig.socialLogin,
      enabled: features.socialLogin,
    },
    passwordReset: {
      ...featurePackConfig.passwordReset,
      enabled: features.passwordReset,
    },
    mail: {
      ...featurePackConfig.mail,
      enabled: features.mailService,
    },
    storage: {
      ...featurePackConfig.storage,
      enabled: features.fileStorage,
    },
    jte: {
      ...featurePackConfig.jte,
      enabled: features.jteTemplates,
    },
  };
}

/**
 * Builds language-specific options based on the target configuration.
 *
 * @param baseProject - The base project configuration
 * @param effectiveTargetConfig - The effective target config (service or project)
 * @returns Object containing language-specific options
 */
function buildLanguageSpecificOptions(
  baseProject: ProjectConfig,
  effectiveTargetConfig: TargetConfig,
) {
  const { language, framework } = effectiveTargetConfig;

  // Rust/Axum options
  let rustOptions = baseProject.rustOptions ?? defaultRustAxumOptions;
  if (language === 'rust' && framework === 'axum') {
    // Apply preset defaults if a preset is specified
    if (rustOptions.preset && rustOptions.preset !== 'cloud') {
      rustOptions = {
        ...getRustPresetDefaults(rustOptions.preset),
        ...rustOptions,
      };
    }
  }

  // Go/Chi options
  let goChiOptions = baseProject.goChiOptions ?? getDefaultGoChiOptions();
  if (language === 'go' && framework === 'chi') {
    // Ensure fresh copy of defaults merged with any customizations
    goChiOptions = {
      ...getDefaultGoChiOptions(),
      ...goChiOptions,
      messaging: {
        ...getDefaultGoChiOptions().messaging,
        ...goChiOptions.messaging,
      },
      cache: {
        ...getDefaultGoChiOptions().cache,
        ...goChiOptions.cache,
      },
    };
  }

  return { rustOptions, goChiOptions };
}

/**
 * Builds target configuration, ensuring consistency with legacy fields.
 *
 * @param baseProject - The base project configuration
 * @returns Validated target configuration
 */
function buildTargetConfig(baseProject: ProjectConfig): TargetConfig {
  // If targetConfig exists and is valid, use it
  if (baseProject.targetConfig) {
    const validation = validateTargetConfig(baseProject.targetConfig);
    if (validation.valid) {
      return baseProject.targetConfig;
    }
  }

  // Fall back to creating from legacy fields (Java/Spring Boot default)
  return createDefaultTargetConfig('java');
}

// ============================================================================
// MAIN BUILDER FUNCTION
// ============================================================================

/**
 * Builds a ProjectConfig object for generation, applying service-specific overrides if provided.
 *
 * This function:
 * - Applies target configuration for multi-language support
 * - Conditionally includes Feature Pack 2025 configurations
 * - Includes language-specific options (Rust/Axum, Go/Chi)
 * - Applies service-specific overrides when generating microservices
 * - Uses service-specific target config if defined, otherwise inherits from project
 *
 * @param baseProject - The base project configuration
 * @param service - Optional service design for microservice-specific overrides
 * @returns Complete ProjectConfig ready for code generation
 */
export function buildProjectConfig(
  baseProject: ProjectConfig,
  service?: ServiceDesign,
): ProjectConfig {
  // Use service target config if defined, otherwise use project target config
  const effectiveTargetConfig = service?.config.targetConfig ?? baseProject.targetConfig;

  // Build target configuration using effective target
  const targetConfig = buildTargetConfig({
    ...baseProject,
    targetConfig: effectiveTargetConfig,
  });

  // Build language-specific options using effective target
  const { rustOptions, goChiOptions } = buildLanguageSpecificOptions(baseProject, targetConfig);

  // Build Feature Pack configuration with feature flag synchronization
  const featurePackConfig = buildFeaturePackConfig(baseProject);

  const baseConfig: ProjectConfig = {
    name: service?.name || baseProject.name,
    groupId: baseProject.groupId,
    packageName: baseProject.packageName,
    artifactId: service?.name
      ? `api-${service.name.toLowerCase().replaceAll(/[^a-z0-9]/g, '-')}`
      : baseProject.artifactId,

    // Legacy Java fields (deprecated but maintained for compatibility)
    javaVersion: baseProject.javaVersion, // NOSONAR S1874 - Intentionally using deprecated field for backward compatibility
    springBootVersion: baseProject.springBootVersion, // NOSONAR S1874 - Intentionally using deprecated field for backward compatibility

    // Target configuration (multi-language support)
    targetConfig,

    // Modules and features
    modules: baseProject.modules,
    features: baseProject.features,

    // Core configurations
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

    // Observability with service-specific overrides
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

    // Resilience with service-specific overrides
    resilienceConfig: service
      ? {
          ...baseProject.resilienceConfig,
          circuitBreaker: {
            ...baseProject.resilienceConfig.circuitBreaker,
            enabled: service.config.enableCircuitBreaker,
          },
        }
      : baseProject.resilienceConfig,

    // API configurations
    corsConfig: baseProject.corsConfig,
    graphqlConfig: baseProject.graphqlConfig,
    grpcConfig: baseProject.grpcConfig,
    gatewayConfig: baseProject.gatewayConfig,

    // Feature Pack 2025 configuration
    featurePackConfig,

    // Language-specific options
    rustOptions,
    goChiOptions,
  };

  return baseConfig;
}
