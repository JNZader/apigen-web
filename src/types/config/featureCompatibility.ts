/**
 * Feature Compatibility Configuration
 *
 * Defines which features are supported by each language/framework combination.
 * Used to automatically disable incompatible features when language changes.
 */

import type { ProjectFeatures } from '../project';
import type { Framework, Language } from '../target';

// ============================================================================
// FEATURE KEYS TYPE
// ============================================================================

/**
 * Keys of all available project features
 */
export type FeatureKey = keyof ProjectFeatures;

// ============================================================================
// FEATURE COMPATIBILITY MAP
// ============================================================================

/**
 * Map of features supported by each language.
 * If a feature is not in the array, it is not supported by that language.
 */
export const LANGUAGE_SUPPORTED_FEATURES: Record<Language, FeatureKey[]> = {
  java: [
    // Core - all supported
    'hateoas',
    'swagger',
    'softDelete',
    'auditing',
    'virtualThreads',
    'docker',
    // Pagination & Caching
    'caching',
    'cursorPagination',
    'etagSupport',
    // Advanced
    'rateLimiting',
    'i18n',
    'webhooks',
    'bulkOperations',
    'batchOperations',
    'domainEvents',
    'sseUpdates',
    // Architecture
    'multiTenancy',
    'eventSourcing',
    'apiVersioning',
    // Feature Pack 2025
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    'jteTemplates',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ],
  kotlin: [
    // Core - all supported (same as Java)
    'hateoas',
    'swagger',
    'softDelete',
    'auditing',
    'virtualThreads',
    'docker',
    // Pagination & Caching
    'caching',
    'cursorPagination',
    'etagSupport',
    // Advanced
    'rateLimiting',
    'i18n',
    'webhooks',
    'bulkOperations',
    'batchOperations',
    'domainEvents',
    'sseUpdates',
    // Architecture
    'multiTenancy',
    'eventSourcing',
    'apiVersioning',
    // Feature Pack 2025
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    'jteTemplates',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ],
  python: [
    // Core
    'hateoas',
    'swagger',
    'softDelete',
    'auditing',
    'docker',
    // Pagination & Caching
    'caching',
    'cursorPagination',
    'etagSupport',
    // Advanced
    'rateLimiting',
    'i18n',
    'webhooks',
    'bulkOperations',
    'batchOperations',
    'domainEvents',
    'sseUpdates',
    // Architecture
    'multiTenancy',
    'apiVersioning',
    // Feature Pack 2025
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ],
  typescript: [
    // Core
    'hateoas',
    'swagger',
    'softDelete',
    'auditing',
    'docker',
    // Pagination & Caching
    'caching',
    'cursorPagination',
    'etagSupport',
    // Advanced
    'rateLimiting',
    'i18n',
    'webhooks',
    'bulkOperations',
    'batchOperations',
    'domainEvents',
    'sseUpdates',
    // Architecture
    'multiTenancy',
    'apiVersioning',
    // Feature Pack 2025
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ],
  php: [
    // Core
    'hateoas',
    'swagger',
    'softDelete',
    'auditing',
    'docker',
    // Pagination & Caching
    'caching',
    'cursorPagination',
    'etagSupport',
    // Advanced
    'rateLimiting',
    'i18n',
    'webhooks',
    'bulkOperations',
    'batchOperations',
    'domainEvents',
    // Architecture
    'multiTenancy',
    'apiVersioning',
    // Feature Pack 2025
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ],
  go: [
    // Core
    'swagger',
    'softDelete',
    'auditing',
    'docker',
    // Pagination & Caching
    'caching',
    'cursorPagination',
    'etagSupport',
    // Advanced
    'rateLimiting',
    'i18n',
    'webhooks',
    'batchOperations',
    'sseUpdates',
    // Architecture
    'multiTenancy',
    'apiVersioning',
    // Feature Pack 2025
    'passwordReset',
    'mailService',
    'fileStorage',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ],
  rust: [
    // Core
    'swagger',
    'softDelete',
    'auditing',
    'docker',
    // Pagination & Caching
    'caching',
    'cursorPagination',
    'etagSupport',
    // Advanced
    'rateLimiting',
    'webhooks',
    'batchOperations',
    'sseUpdates',
    // Architecture
    'apiVersioning',
    // Feature Pack 2025
    'passwordReset',
    'mailService',
    'fileStorage',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ],
  csharp: [
    // Core
    'hateoas',
    'swagger',
    'softDelete',
    'auditing',
    'docker',
    // Pagination & Caching
    'caching',
    'cursorPagination',
    'etagSupport',
    // Advanced
    'rateLimiting',
    'i18n',
    'webhooks',
    'bulkOperations',
    'batchOperations',
    'domainEvents',
    'sseUpdates',
    // Architecture
    'multiTenancy',
    'eventSourcing',
    'apiVersioning',
    // Feature Pack 2025
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ],
};

// ============================================================================
// FRAMEWORK-SPECIFIC OVERRIDES
// ============================================================================

/**
 * Additional features supported by specific frameworks (extends language support).
 * Use this for framework-specific features not available in the base language.
 */
export const FRAMEWORK_ADDITIONAL_FEATURES: Partial<Record<Framework, FeatureKey[]>> = {
  chi: ['bulkOperations'], // Chi has additional bulk support
};

/**
 * Features NOT supported by specific frameworks (restricts language support).
 * Use this for features that a specific framework doesn't support even if the language does.
 */
export const FRAMEWORK_UNSUPPORTED_FEATURES: Partial<Record<Framework, FeatureKey[]>> = {
  gin: ['domainEvents'], // Gin doesn't have built-in domain events
  chi: ['domainEvents'], // Chi doesn't have built-in domain events
  axum: ['i18n', 'domainEvents', 'bulkOperations'], // Axum has limited i18n and no domain events/bulk
};

// ============================================================================
// FEATURE DEPENDENCIES
// ============================================================================

/**
 * Feature dependencies - when enabling a feature, these must also be enabled.
 * Key: feature that requires dependencies, Value: array of required features
 */
export const FEATURE_DEPENDENCIES: Partial<Record<FeatureKey, FeatureKey[]>> = {
  // Password reset requires mail service
  passwordReset: ['mailService'],
  // JTE templates require mail service (for email templates)
  jteTemplates: ['mailService'],
  // Event sourcing requires domain events
  eventSourcing: ['domainEvents'],
  // SSE updates work better with domain events
  sseUpdates: ['domainEvents'],
};

/**
 * Reverse dependencies - when disabling a feature, these should also be disabled.
 * Key: feature being disabled, Value: array of features that depend on it
 */
export const FEATURE_DEPENDENTS: Partial<Record<FeatureKey, FeatureKey[]>> = {
  // If mail service is disabled, password reset and JTE templates should be disabled
  mailService: ['passwordReset', 'jteTemplates'],
  // If domain events are disabled, event sourcing should be disabled
  domainEvents: ['eventSourcing'],
};

// ============================================================================
// FEATURE METADATA FOR UI
// ============================================================================

/**
 * Human-readable labels for features (used in notifications)
 */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  hateoas: 'HATEOAS Links',
  swagger: 'Swagger/OpenAPI',
  softDelete: 'Soft Delete',
  auditing: 'Auditing',
  virtualThreads: 'Virtual Threads',
  docker: 'Docker',
  caching: 'Caching',
  cursorPagination: 'Cursor Pagination',
  etagSupport: 'ETag Support',
  rateLimiting: 'Rate Limiting',
  i18n: 'Internationalization',
  webhooks: 'Webhooks',
  bulkOperations: 'Bulk Operations',
  batchOperations: 'Batch Operations',
  domainEvents: 'Domain Events',
  sseUpdates: 'SSE Updates',
  multiTenancy: 'Multi-Tenancy',
  eventSourcing: 'Event Sourcing',
  apiVersioning: 'API Versioning',
  socialLogin: 'Social Login',
  passwordReset: 'Password Reset', // NOSONAR S2068 - Feature label, not a credential
  mailService: 'Mail Service',
  fileStorage: 'File Storage',
  jteTemplates: 'JTE Templates',
  // Developer Experience (DX) Features
  miseTasks: 'Mise Tasks',
  preCommit: 'Pre-commit Hooks',
  setupScript: 'Setup Scripts',
  githubTemplates: 'GitHub Templates',
  devCompose: 'Dev Compose',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a feature is supported by a language
 */
export function isFeatureSupportedByLanguage(language: Language, feature: FeatureKey): boolean {
  return LANGUAGE_SUPPORTED_FEATURES[language].includes(feature);
}

/**
 * Check if a feature is supported by a specific framework
 */
export function isFeatureSupportedByFramework(
  language: Language,
  framework: Framework,
  feature: FeatureKey,
): boolean {
  // First check language support
  const languageSupports = isFeatureSupportedByLanguage(language, feature);

  // Check if framework adds this feature
  const frameworkAdds = FRAMEWORK_ADDITIONAL_FEATURES[framework]?.includes(feature) ?? false;

  // Check if framework removes this feature
  const frameworkRemoves = FRAMEWORK_UNSUPPORTED_FEATURES[framework]?.includes(feature) ?? false;

  return (languageSupports || frameworkAdds) && !frameworkRemoves;
}

/**
 * Get all features NOT supported by a language/framework combination
 */
export function getUnsupportedFeatures(language: Language, framework: Framework): FeatureKey[] {
  const allFeatures: FeatureKey[] = [
    'hateoas',
    'swagger',
    'softDelete',
    'auditing',
    'virtualThreads',
    'docker',
    'caching',
    'cursorPagination',
    'etagSupport',
    'rateLimiting',
    'i18n',
    'webhooks',
    'bulkOperations',
    'batchOperations',
    'domainEvents',
    'sseUpdates',
    'multiTenancy',
    'eventSourcing',
    'apiVersioning',
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    'jteTemplates',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ];

  return allFeatures.filter(
    (feature) => !isFeatureSupportedByFramework(language, framework, feature),
  );
}

/**
 * Get all supported features for a language/framework combination
 */
export function getSupportedFeatures(language: Language, framework: Framework): FeatureKey[] {
  const allFeatures: FeatureKey[] = [
    'hateoas',
    'swagger',
    'softDelete',
    'auditing',
    'virtualThreads',
    'docker',
    'caching',
    'cursorPagination',
    'etagSupport',
    'rateLimiting',
    'i18n',
    'webhooks',
    'bulkOperations',
    'batchOperations',
    'domainEvents',
    'sseUpdates',
    'multiTenancy',
    'eventSourcing',
    'apiVersioning',
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileStorage',
    'jteTemplates',
    // Developer Experience (DX) Features
    'miseTasks',
    'preCommit',
    'setupScript',
    'githubTemplates',
    'devCompose',
  ];

  return allFeatures.filter((feature) =>
    isFeatureSupportedByFramework(language, framework, feature),
  );
}

/**
 * Get the dependencies that need to be enabled for a feature
 */
export function getFeatureDependencies(feature: FeatureKey): FeatureKey[] {
  return FEATURE_DEPENDENCIES[feature] ?? [];
}

/**
 * Get features that depend on a given feature (would be affected if disabled)
 */
export function getFeatureDependents(feature: FeatureKey): FeatureKey[] {
  return FEATURE_DEPENDENTS[feature] ?? [];
}
