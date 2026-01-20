/**
 * Feature Flags Configuration Types
 *
 * This module contains feature flag, bulk operations, and batch operations
 * type definitions.
 */

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Available feature flags using Togglz.
 * Feature flags enable runtime feature toggling.
 */
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

/**
 * Feature flags configuration using Togglz.
 * Allows runtime feature toggling without redeployment.
 */
export interface FeatureFlagsConfig {
  /** Enable Togglz feature flags */
  enabled: boolean;
  /** Enable Togglz admin console */
  consoleEnabled: boolean;
  /** Map of feature flags to their enabled state */
  flags: Record<FeatureFlag, boolean>;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Supported file formats for bulk import/export.
 */
export type BulkFormat = 'CSV' | 'EXCEL';

/**
 * Bulk operations configuration.
 * Enables CSV/Excel import and export functionality.
 */
export interface BulkConfig {
  /** Enable bulk operations */
  enabled: boolean;
  /** Supported file formats */
  supportedFormats: BulkFormat[];
  /** Maximum rows allowed for import */
  maxImportRows: number;
  /** Row count threshold to switch to streaming mode */
  streamingThreshold: number;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch operations configuration.
 * Enables bulk CRUD operations in single requests.
 */
export interface BatchConfig {
  /** Enable batch operations */
  enabled: boolean;
  /** Default batch size for operations */
  defaultBatchSize: number;
  /** Maximum concurrent batch operations */
  maxConcurrent: number;
  /** Batch operation timeout in seconds */
  timeoutSeconds: number;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default feature flags configuration.
 */
export const defaultFeatureFlagsConfig: FeatureFlagsConfig = {
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
};

/**
 * Default bulk operations configuration.
 */
export const defaultBulkConfig: BulkConfig = {
  enabled: false,
  supportedFormats: ['CSV', 'EXCEL'],
  maxImportRows: 10000,
  streamingThreshold: 1000,
};

/**
 * Default batch operations configuration.
 */
export const defaultBatchConfig: BatchConfig = {
  enabled: false,
  defaultBatchSize: 100,
  maxConcurrent: 50,
  timeoutSeconds: 30,
};
