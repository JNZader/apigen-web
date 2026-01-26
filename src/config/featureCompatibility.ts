/**
 * Feature Compatibility Configuration
 *
 * This module defines the compatibility matrix for features across different
 * languages and frameworks. It handles:
 * - Feature dependencies (features that require other features)
 * - Feature conflicts (mutually exclusive features)
 * - Language support (which features are available for which languages)
 * - Validation helpers and error/warning messages
 */

import type { FeatureFlag } from '@/types/config/features';
import type { Framework, Language } from '@/types/target';

// ============================================================================
// FEATURE IDENTIFIERS
// ============================================================================

/**
 * All configurable features in the system.
 * This includes both FeatureFlags (Togglz) and other high-level features.
 */
export type Feature =
  | FeatureFlag
  | 'SOCIAL_LOGIN'
  | 'PASSWORD_RESET'
  | 'MAIL_SERVICE'
  | 'FILE_STORAGE'
  | 'JTE_TEMPLATES'
  | 'GRAPHQL'
  | 'GRPC'
  | 'WEBSOCKETS'
  | 'EVENT_SOURCING'
  | 'MULTI_TENANCY'
  | 'BULK_OPERATIONS'
  | 'REDIS_CACHE'
  | 'OAUTH2';

// ============================================================================
// DEPENDENCY DEFINITIONS
// ============================================================================

/**
 * Feature dependency definitions.
 * Maps each feature to the features it requires to function.
 */
export const FEATURE_DEPENDENCIES: Partial<Record<Feature, Feature[]>> = {
  // Password reset requires mail service for sending reset emails
  PASSWORD_RESET: ['MAIL_SERVICE'],

  // JTE templates are used by mail service for email templates
  MAIL_SERVICE: ['JTE_TEMPLATES'],

  // Social login requires OAuth2 security
  SOCIAL_LOGIN: ['OAUTH2'],

  // SSE updates require domain events for event propagation
  SSE_UPDATES: ['DOMAIN_EVENTS'],

  // Tracing requires metrics for full observability
  TRACING: ['METRICS'],

  // Circuit breaker benefits from metrics for monitoring
  CIRCUIT_BREAKER: ['METRICS'],

  // Redis cache requires caching feature flag
  REDIS_CACHE: ['CACHING'],

  // Event sourcing requires domain events
  EVENT_SOURCING: ['DOMAIN_EVENTS'],

  // Batch operations require soft delete for safe bulk deletes
  BATCH_OPERATIONS: ['SOFT_DELETE'],

  // Advanced filtering works better with cursor pagination
  ADVANCED_FILTERING: ['CURSOR_PAGINATION'],
};

// ============================================================================
// CONFLICT DEFINITIONS
// ============================================================================

/**
 * Feature conflict definitions.
 * Maps features to other features they are incompatible with.
 * Conflicts are bidirectional (if A conflicts with B, B conflicts with A).
 */
export const FEATURE_CONFLICTS: Partial<Record<Feature, Feature[]>> = {
  // Event sourcing and soft delete have different data management approaches
  EVENT_SOURCING: ['SOFT_DELETE'],

  // Multi-tenancy conflicts with certain caching strategies
  // (cache isolation is complex with multi-tenancy)
  MULTI_TENANCY: ['REDIS_CACHE'],
};

// ============================================================================
// LANGUAGE SUPPORT MATRIX
// ============================================================================

/**
 * Features supported by each language.
 * If a feature is not listed for a language, it's not supported.
 */
export const LANGUAGE_FEATURE_SUPPORT: Record<Language, Feature[]> = {
  java: [
    'CACHING',
    'CIRCUIT_BREAKER',
    'RATE_LIMITING',
    'CURSOR_PAGINATION',
    'ETAG_SUPPORT',
    'SOFT_DELETE',
    'DOMAIN_EVENTS',
    'HATEOAS',
    'AUDIT_LOGGING',
    'SSE_UPDATES',
    'TRACING',
    'METRICS',
    'ADVANCED_FILTERING',
    'BATCH_OPERATIONS',
    'SOCIAL_LOGIN',
    'PASSWORD_RESET',
    'MAIL_SERVICE',
    'FILE_STORAGE',
    'JTE_TEMPLATES',
    'GRAPHQL',
    'GRPC',
    'WEBSOCKETS',
    'EVENT_SOURCING',
    'MULTI_TENANCY',
    'BULK_OPERATIONS',
    'REDIS_CACHE',
    'OAUTH2',
  ],
  kotlin: [
    'CACHING',
    'CIRCUIT_BREAKER',
    'RATE_LIMITING',
    'CURSOR_PAGINATION',
    'ETAG_SUPPORT',
    'SOFT_DELETE',
    'DOMAIN_EVENTS',
    'HATEOAS',
    'AUDIT_LOGGING',
    'SSE_UPDATES',
    'TRACING',
    'METRICS',
    'ADVANCED_FILTERING',
    'BATCH_OPERATIONS',
    'SOCIAL_LOGIN',
    'PASSWORD_RESET',
    'MAIL_SERVICE',
    'FILE_STORAGE',
    'JTE_TEMPLATES',
    'GRAPHQL',
    'GRPC',
    'WEBSOCKETS',
    'EVENT_SOURCING',
    'MULTI_TENANCY',
    'BULK_OPERATIONS',
    'REDIS_CACHE',
    'OAUTH2',
  ],
  python: [
    'CACHING',
    'RATE_LIMITING',
    'CURSOR_PAGINATION',
    'SOFT_DELETE',
    'DOMAIN_EVENTS',
    'AUDIT_LOGGING',
    'TRACING',
    'METRICS',
    'ADVANCED_FILTERING',
    'BATCH_OPERATIONS',
    'PASSWORD_RESET',
    'MAIL_SERVICE',
    'FILE_STORAGE',
    'WEBSOCKETS',
    'MULTI_TENANCY',
    'REDIS_CACHE',
    'OAUTH2',
  ],
  typescript: [
    'CACHING',
    'RATE_LIMITING',
    'CURSOR_PAGINATION',
    'SOFT_DELETE',
    'DOMAIN_EVENTS',
    'AUDIT_LOGGING',
    'TRACING',
    'METRICS',
    'ADVANCED_FILTERING',
    'BATCH_OPERATIONS',
    'PASSWORD_RESET',
    'MAIL_SERVICE',
    'FILE_STORAGE',
    'GRAPHQL',
    'WEBSOCKETS',
    'MULTI_TENANCY',
    'REDIS_CACHE',
    'OAUTH2',
  ],
  php: [
    'CACHING',
    'RATE_LIMITING',
    'CURSOR_PAGINATION',
    'SOFT_DELETE',
    'DOMAIN_EVENTS',
    'AUDIT_LOGGING',
    'ADVANCED_FILTERING',
    'BATCH_OPERATIONS',
    'SOCIAL_LOGIN',
    'PASSWORD_RESET',
    'MAIL_SERVICE',
    'FILE_STORAGE',
    'WEBSOCKETS',
    'MULTI_TENANCY',
    'REDIS_CACHE',
    'OAUTH2',
  ],
  go: [
    'CACHING',
    'CIRCUIT_BREAKER',
    'RATE_LIMITING',
    'CURSOR_PAGINATION',
    'ETAG_SUPPORT',
    'SOFT_DELETE',
    'DOMAIN_EVENTS',
    'AUDIT_LOGGING',
    'SSE_UPDATES',
    'TRACING',
    'METRICS',
    'ADVANCED_FILTERING',
    'BATCH_OPERATIONS',
    'PASSWORD_RESET',
    'MAIL_SERVICE',
    'FILE_STORAGE',
    'GRPC',
    'WEBSOCKETS',
    'REDIS_CACHE',
    'OAUTH2',
  ],
  rust: [
    'CACHING',
    'CIRCUIT_BREAKER',
    'RATE_LIMITING',
    'CURSOR_PAGINATION',
    'ETAG_SUPPORT',
    'SOFT_DELETE',
    'DOMAIN_EVENTS',
    'AUDIT_LOGGING',
    'SSE_UPDATES',
    'TRACING',
    'METRICS',
    'ADVANCED_FILTERING',
    'BATCH_OPERATIONS',
    'FILE_STORAGE',
    'GRPC',
    'WEBSOCKETS',
    'REDIS_CACHE',
  ],
  csharp: [
    'CACHING',
    'CIRCUIT_BREAKER',
    'RATE_LIMITING',
    'CURSOR_PAGINATION',
    'ETAG_SUPPORT',
    'SOFT_DELETE',
    'DOMAIN_EVENTS',
    'HATEOAS',
    'AUDIT_LOGGING',
    'SSE_UPDATES',
    'TRACING',
    'METRICS',
    'ADVANCED_FILTERING',
    'BATCH_OPERATIONS',
    'SOCIAL_LOGIN',
    'PASSWORD_RESET',
    'MAIL_SERVICE',
    'FILE_STORAGE',
    'GRAPHQL',
    'GRPC',
    'WEBSOCKETS',
    'EVENT_SOURCING',
    'MULTI_TENANCY',
    'BULK_OPERATIONS',
    'REDIS_CACHE',
    'OAUTH2',
  ],
};

/**
 * Framework-specific feature restrictions.
 * Some features may only work with specific frameworks within a language.
 */
export const FRAMEWORK_FEATURE_RESTRICTIONS: Partial<
  Record<Framework, { unsupported: Feature[]; exclusive: Feature[] }>
> = {
  gin: {
    unsupported: ['EVENT_SOURCING', 'MULTI_TENANCY'],
    exclusive: [],
  },
  chi: {
    unsupported: ['EVENT_SOURCING'],
    exclusive: [],
  },
  axum: {
    unsupported: ['MAIL_SERVICE', 'SOCIAL_LOGIN', 'PASSWORD_RESET', 'OAUTH2'],
    exclusive: [],
  },
  fastapi: {
    unsupported: ['HATEOAS', 'CIRCUIT_BREAKER', 'JTE_TEMPLATES'],
    exclusive: [],
  },
  nestjs: {
    unsupported: ['JTE_TEMPLATES', 'HATEOAS', 'CIRCUIT_BREAKER'],
    exclusive: [],
  },
  laravel: {
    unsupported: ['TRACING', 'METRICS', 'CIRCUIT_BREAKER', 'JTE_TEMPLATES'],
    exclusive: [],
  },
};

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

/**
 * Severity level for validation issues.
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * A single validation issue.
 */
export interface ValidationIssue {
  /** Unique code for this issue type */
  code: string;
  /** Severity of the issue */
  severity: ValidationSeverity;
  /** The feature that has the issue */
  feature: Feature;
  /** Human-readable message */
  message: string;
  /** Suggested resolution */
  suggestion?: string;
  /** Related features involved in this issue */
  relatedFeatures?: Feature[];
}

/**
 * Result of feature validation.
 */
export interface ValidationResult {
  /** Whether validation passed (no errors) */
  valid: boolean;
  /** All validation issues found */
  issues: ValidationIssue[];
  /** Quick access to error-level issues */
  errors: ValidationIssue[];
  /** Quick access to warning-level issues */
  warnings: ValidationIssue[];
}

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

/**
 * Error and warning message templates.
 */
export const VALIDATION_MESSAGES = {
  MISSING_DEPENDENCY: (feature: Feature, dependency: Feature) =>
    `Feature "${feature}" requires "${dependency}" to be enabled.`,

  FEATURE_CONFLICT: (feature1: Feature, feature2: Feature) =>
    `Features "${feature1}" and "${feature2}" cannot be enabled together.`,

  UNSUPPORTED_BY_LANGUAGE: (feature: Feature, language: Language) =>
    `Feature "${feature}" is not supported for ${language}.`,

  UNSUPPORTED_BY_FRAMEWORK: (feature: Feature, framework: Framework) =>
    `Feature "${feature}" is not supported by ${framework}.`,

  DEPRECATED_FEATURE: (feature: Feature, alternative?: Feature) =>
    alternative
      ? `Feature "${feature}" is deprecated. Consider using "${alternative}" instead.`
      : `Feature "${feature}" is deprecated and may be removed in future versions.`,

  EXPERIMENTAL_FEATURE: (feature: Feature) =>
    `Feature "${feature}" is experimental and may have breaking changes.`,

  PERFORMANCE_WARNING: (feature: Feature, reason: string) =>
    `Feature "${feature}" may impact performance: ${reason}.`,

  SECURITY_RECOMMENDATION: (feature: Feature, recommendation: string) =>
    `Security recommendation for "${feature}": ${recommendation}.`,
} as const;

/**
 * Suggestion messages for resolving issues.
 */
export const VALIDATION_SUGGESTIONS = {
  ENABLE_DEPENDENCY: (dependency: Feature) =>
    `Enable the "${dependency}" feature to use this functionality.`,

  DISABLE_CONFLICTING: (conflicting: Feature) =>
    `Disable "${conflicting}" to resolve this conflict.`,

  CHOOSE_ALTERNATIVE: (alternatives: Feature[]) =>
    `Consider using one of these alternatives: ${alternatives.join(', ')}.`,

  CHANGE_LANGUAGE: (supportedLanguages: Language[]) =>
    `This feature is supported in: ${supportedLanguages.join(', ')}.`,

  CHANGE_FRAMEWORK: (supportedFrameworks: Framework[]) =>
    `This feature is supported by: ${supportedFrameworks.join(', ')}.`,
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a feature is supported by a language.
 */
export function isFeatureSupportedByLanguage(feature: Feature, language: Language): boolean {
  return LANGUAGE_FEATURE_SUPPORT[language]?.includes(feature) ?? false;
}

/**
 * Check if a feature is supported by a framework.
 */
export function isFeatureSupportedByFramework(feature: Feature, framework: Framework): boolean {
  const restrictions = FRAMEWORK_FEATURE_RESTRICTIONS[framework];
  if (!restrictions) return true;
  return !restrictions.unsupported.includes(feature);
}

/**
 * Get all dependencies for a feature (including transitive dependencies).
 */
export function getFeatureDependencies(feature: Feature): Feature[] {
  const visited = new Set<Feature>();
  const dependencies: Feature[] = [];

  function collectDependencies(f: Feature) {
    const deps = FEATURE_DEPENDENCIES[f];
    if (!deps) return;

    for (const dep of deps) {
      if (!visited.has(dep)) {
        visited.add(dep);
        dependencies.push(dep);
        collectDependencies(dep);
      }
    }
  }

  collectDependencies(feature);
  return dependencies;
}

/**
 * Get all features that conflict with a given feature.
 */
export function getFeatureConflicts(feature: Feature): Feature[] {
  const conflicts: Feature[] = [];

  // Direct conflicts
  const directConflicts = FEATURE_CONFLICTS[feature];
  if (directConflicts) {
    conflicts.push(...directConflicts);
  }

  // Reverse conflicts (check if other features list this one as conflicting)
  for (const [otherFeature, otherConflicts] of Object.entries(FEATURE_CONFLICTS)) {
    if (otherConflicts?.includes(feature) && !conflicts.includes(otherFeature as Feature)) {
      conflicts.push(otherFeature as Feature);
    }
  }

  return conflicts;
}

/**
 * Get all features supported by a language.
 */
export function getSupportedFeatures(language: Language): Feature[] {
  return LANGUAGE_FEATURE_SUPPORT[language] ?? [];
}

/**
 * Get all languages that support a feature.
 */
export function getLanguagesForFeature(feature: Feature): Language[] {
  return (Object.entries(LANGUAGE_FEATURE_SUPPORT) as [Language, Feature[]][])
    .filter(([, features]) => features.includes(feature))
    .map(([language]) => language);
}

/**
 * Validate a set of enabled features for a given language and framework.
 */
export function validateFeatures(
  enabledFeatures: Feature[],
  language: Language,
  framework: Framework,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const feature of enabledFeatures) {
    // Check language support
    if (!isFeatureSupportedByLanguage(feature, language)) {
      issues.push({
        code: 'UNSUPPORTED_BY_LANGUAGE',
        severity: 'error',
        feature,
        message: VALIDATION_MESSAGES.UNSUPPORTED_BY_LANGUAGE(feature, language),
        suggestion: VALIDATION_SUGGESTIONS.CHANGE_LANGUAGE(getLanguagesForFeature(feature)),
      });
    }

    // Check framework support
    if (!isFeatureSupportedByFramework(feature, framework)) {
      issues.push({
        code: 'UNSUPPORTED_BY_FRAMEWORK',
        severity: 'error',
        feature,
        message: VALIDATION_MESSAGES.UNSUPPORTED_BY_FRAMEWORK(feature, framework),
      });
    }

    // Check dependencies
    const dependencies = FEATURE_DEPENDENCIES[feature];
    if (dependencies) {
      for (const dependency of dependencies) {
        if (!enabledFeatures.includes(dependency)) {
          issues.push({
            code: 'MISSING_DEPENDENCY',
            severity: 'error',
            feature,
            message: VALIDATION_MESSAGES.MISSING_DEPENDENCY(feature, dependency),
            suggestion: VALIDATION_SUGGESTIONS.ENABLE_DEPENDENCY(dependency),
            relatedFeatures: [dependency],
          });
        }
      }
    }

    // Check conflicts
    const conflicts = getFeatureConflicts(feature);
    for (const conflict of conflicts) {
      if (enabledFeatures.includes(conflict)) {
        // Only add if we haven't already added this conflict pair
        const existingConflict = issues.find(
          (i) =>
            i.code === 'FEATURE_CONFLICT' &&
            ((i.feature === feature && i.relatedFeatures?.includes(conflict)) ||
              (i.feature === conflict && i.relatedFeatures?.includes(feature))),
        );

        if (!existingConflict) {
          issues.push({
            code: 'FEATURE_CONFLICT',
            severity: 'error',
            feature,
            message: VALIDATION_MESSAGES.FEATURE_CONFLICT(feature, conflict),
            suggestion: VALIDATION_SUGGESTIONS.DISABLE_CONFLICTING(conflict),
            relatedFeatures: [conflict],
          });
        }
      }
    }
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return {
    valid: errors.length === 0,
    issues,
    errors,
    warnings,
  };
}

/**
 * Get missing dependencies for a feature.
 * Returns features that need to be enabled along with the requested feature.
 */
export function getMissingDependencies(feature: Feature, enabledFeatures: Feature[]): Feature[] {
  const allDependencies = getFeatureDependencies(feature);
  return allDependencies.filter((dep) => !enabledFeatures.includes(dep));
}

/**
 * Check if enabling a feature would cause conflicts with currently enabled features.
 */
export function wouldCauseConflict(
  featureToEnable: Feature,
  enabledFeatures: Feature[],
): Feature[] {
  const conflicts = getFeatureConflicts(featureToEnable);
  return conflicts.filter((conflict) => enabledFeatures.includes(conflict));
}

/**
 * Get all features that can be enabled given current selection and constraints.
 */
export function getAvailableFeatures(
  enabledFeatures: Feature[],
  language: Language,
  framework: Framework,
): Feature[] {
  const supported = getSupportedFeatures(language);

  return supported.filter((feature) => {
    // Already enabled
    if (enabledFeatures.includes(feature)) return false;

    // Check framework support
    if (!isFeatureSupportedByFramework(feature, framework)) return false;

    // Check if would cause conflicts
    if (wouldCauseConflict(feature, enabledFeatures).length > 0) return false;

    return true;
  });
}

/**
 * Auto-resolve dependencies for a feature.
 * Returns all features that should be enabled (including the original and its dependencies).
 */
export function resolveFeatureWithDependencies(
  feature: Feature,
  currentFeatures: Feature[],
  language: Language,
): Feature[] {
  const toEnable: Feature[] = [feature];
  const dependencies = getFeatureDependencies(feature);

  for (const dep of dependencies) {
    if (!currentFeatures.includes(dep) && isFeatureSupportedByLanguage(dep, language)) {
      toEnable.push(dep);
    }
  }

  return toEnable;
}

// ============================================================================
// FEATURE METADATA
// ============================================================================

/**
 * Metadata for features including display information.
 */
export interface FeatureMetadata {
  /** Display label */
  label: string;
  /** Short description */
  description: string;
  /** Category for grouping */
  category: FeatureCategory;
  /** Whether this is an experimental feature */
  experimental?: boolean;
  /** Whether this feature is deprecated */
  deprecated?: boolean;
  /** Documentation URL */
  docsUrl?: string;
}

/**
 * Feature categories for grouping in UI.
 */
export type FeatureCategory =
  | 'core'
  | 'security'
  | 'performance'
  | 'observability'
  | 'api'
  | 'data'
  | 'messaging'
  | 'storage';

/**
 * Feature metadata registry.
 */
export const FEATURE_METADATA: Partial<Record<Feature, FeatureMetadata>> = {
  CACHING: {
    label: 'Caching',
    description: 'Enable response and entity caching',
    category: 'performance',
  },
  CIRCUIT_BREAKER: {
    label: 'Circuit Breaker',
    description: 'Prevent cascading failures with circuit breaker pattern',
    category: 'performance',
  },
  RATE_LIMITING: {
    label: 'Rate Limiting',
    description: 'Limit request rates to protect against abuse',
    category: 'security',
  },
  CURSOR_PAGINATION: {
    label: 'Cursor Pagination',
    description: 'Efficient pagination using cursors instead of offsets',
    category: 'api',
  },
  ETAG_SUPPORT: {
    label: 'ETag Support',
    description: 'Enable HTTP caching with ETags',
    category: 'performance',
  },
  SOFT_DELETE: {
    label: 'Soft Delete',
    description: 'Mark records as deleted instead of removing them',
    category: 'data',
  },
  DOMAIN_EVENTS: {
    label: 'Domain Events',
    description: 'Publish events when entities change',
    category: 'messaging',
  },
  HATEOAS: {
    label: 'HATEOAS',
    description: 'Hypermedia as the Engine of Application State',
    category: 'api',
  },
  AUDIT_LOGGING: {
    label: 'Audit Logging',
    description: 'Track all data changes for compliance',
    category: 'security',
  },
  SSE_UPDATES: {
    label: 'SSE Updates',
    description: 'Real-time updates via Server-Sent Events',
    category: 'api',
  },
  TRACING: {
    label: 'Distributed Tracing',
    description: 'Trace requests across services',
    category: 'observability',
  },
  METRICS: {
    label: 'Metrics',
    description: 'Expose application metrics for monitoring',
    category: 'observability',
  },
  ADVANCED_FILTERING: {
    label: 'Advanced Filtering',
    description: 'Complex query filters for API endpoints',
    category: 'api',
  },
  BATCH_OPERATIONS: {
    label: 'Batch Operations',
    description: 'Bulk CRUD operations in single requests',
    category: 'api',
  },
  SOCIAL_LOGIN: {
    label: 'Social Login',
    description: 'OAuth2 authentication with social providers',
    category: 'security',
  },
  PASSWORD_RESET: {
    label: 'Password Reset',
    description: 'Email-based password recovery flow',
    category: 'security',
  },
  MAIL_SERVICE: {
    label: 'Mail Service',
    description: 'SMTP email sending capabilities',
    category: 'messaging',
  },
  FILE_STORAGE: {
    label: 'File Storage',
    description: 'File upload and storage support',
    category: 'storage',
  },
  JTE_TEMPLATES: {
    label: 'JTE Templates',
    description: 'Java Template Engine for email templates',
    category: 'messaging',
  },
  GRAPHQL: {
    label: 'GraphQL',
    description: 'GraphQL API alongside REST',
    category: 'api',
  },
  GRPC: {
    label: 'gRPC',
    description: 'High-performance RPC with Protocol Buffers',
    category: 'api',
  },
  WEBSOCKETS: {
    label: 'WebSockets',
    description: 'Bidirectional real-time communication',
    category: 'api',
  },
  EVENT_SOURCING: {
    label: 'Event Sourcing',
    description: 'Store events instead of current state',
    category: 'data',
    experimental: true,
  },
  MULTI_TENANCY: {
    label: 'Multi-Tenancy',
    description: 'Support multiple tenants in single deployment',
    category: 'core',
  },
  BULK_OPERATIONS: {
    label: 'Bulk Operations',
    description: 'CSV/Excel import and export',
    category: 'data',
  },
  REDIS_CACHE: {
    label: 'Redis Cache',
    description: 'Distributed caching with Redis',
    category: 'performance',
  },
  OAUTH2: {
    label: 'OAuth2',
    description: 'OAuth 2.0 authentication',
    category: 'security',
  },
};

/**
 * Get features grouped by category.
 */
export function getFeaturesByCategory(): Record<FeatureCategory, Feature[]> {
  const result: Record<FeatureCategory, Feature[]> = {
    core: [],
    security: [],
    performance: [],
    observability: [],
    api: [],
    data: [],
    messaging: [],
    storage: [],
  };

  for (const [feature, metadata] of Object.entries(FEATURE_METADATA)) {
    if (metadata) {
      result[metadata.category].push(feature as Feature);
    }
  }

  return result;
}
