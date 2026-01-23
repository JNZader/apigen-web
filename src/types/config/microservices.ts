/**
 * Microservices Configuration Types
 *
 * This module contains microservices-related type definitions including
 * multi-tenancy, event sourcing, and rate limiting configuration.
 */

// ============================================================================
// MULTI-TENANCY
// ============================================================================

/**
 * Tenant identification strategy options.
 */
export type TenantStrategy = 'HEADER' | 'SUBDOMAIN' | 'PATH' | 'JWT_CLAIM';

/**
 * Multi-tenancy configuration.
 * Supports multiple tenant identification strategies.
 */
export interface MultiTenancyConfig {
  /** Enable multi-tenancy support */
  enabled: boolean;
  /** Require tenant identification for all requests */
  requireTenant: boolean;
  /** Enabled tenant identification strategies */
  strategies: TenantStrategy[];
  /** Header name for tenant ID (when using HEADER strategy) */
  tenantHeader: string;
  /** Path prefix for tenant (when using PATH strategy) */
  pathPrefix: string;
  /** JWT claim name for tenant ID (when using JWT_CLAIM strategy) */
  jwtClaim: string;
  /** Default tenant when none specified */
  defaultTenant: string;
}

// ============================================================================
// EVENT SOURCING
// ============================================================================

/**
 * Event sourcing configuration.
 * Enables event-driven state management with snapshots.
 */
export interface EventSourcingConfig {
  /** Enable event sourcing */
  enabled: boolean;
  /** Number of events before creating a snapshot */
  snapshotThreshold: number;
  /** Database table name for events */
  eventTableName: string;
  /** Database table name for snapshots */
  snapshotTableName: string;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Rate limit storage mode.
 * - 'IN_MEMORY': Local rate limiting (single instance)
 * - 'REDIS': Distributed rate limiting (multi-instance)
 */
export type RateLimitStorageMode = 'IN_MEMORY' | 'REDIS';

/**
 * Rate limiting configuration.
 * Protects API from abuse and ensures fair usage.
 */
export interface RateLimitConfig {
  /** Storage mode for rate limit counters */
  storageMode: RateLimitStorageMode;
  /** Maximum requests per second */
  requestsPerSecond: number;
  /** Burst capacity (max requests in a burst) */
  burstCapacity: number;
  /** Authentication endpoint requests per minute */
  authRequestsPerMinute: number;
  /** Authentication endpoint burst capacity */
  authBurstCapacity: number;
  /** Block duration when rate limit exceeded (seconds) */
  blockDurationSeconds: number;
  /** Enable per-user rate limiting */
  enablePerUser: boolean;
  /** Enable per-endpoint rate limiting */
  enablePerEndpoint: boolean;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default multi-tenancy configuration.
 */
export const defaultMultiTenancyConfig: MultiTenancyConfig = {
  enabled: false,
  requireTenant: true,
  strategies: ['HEADER'],
  tenantHeader: 'X-Tenant-ID',
  pathPrefix: 'tenants',
  jwtClaim: 'tenant_id',
  defaultTenant: 'default',
};

/**
 * Default event sourcing configuration.
 */
export const defaultEventSourcingConfig: EventSourcingConfig = {
  enabled: false,
  snapshotThreshold: 100,
  eventTableName: 'event_store',
  snapshotTableName: 'event_snapshots',
};

/**
 * Default rate limiting configuration.
 */
export const defaultRateLimitConfig: RateLimitConfig = {
  storageMode: 'IN_MEMORY',
  requestsPerSecond: 100,
  burstCapacity: 150,
  authRequestsPerMinute: 10,
  authBurstCapacity: 15,
  blockDurationSeconds: 60,
  enablePerUser: true,
  enablePerEndpoint: false,
};
