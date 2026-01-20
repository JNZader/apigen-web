/**
 * Cache Configuration Types
 *
 * This module contains caching-related type definitions including
 * local cache and Redis configuration.
 */

// ============================================================================
// CACHE TYPE
// ============================================================================

/**
 * Cache storage type.
 * - 'local': In-memory cache using Caffeine
 * - 'redis': Distributed cache using Redis
 */
export type CacheType = 'local' | 'redis';

// ============================================================================
// CACHE SETTINGS
// ============================================================================

/**
 * Configuration for entity cache settings.
 */
export interface EntityCacheSettings {
  /** Maximum number of cached entries */
  maxSize: number;
  /** Cache entry expiration time in minutes */
  expireAfterWriteMinutes: number;
}

/**
 * Configuration for list/collection cache settings.
 */
export interface ListCacheSettings {
  /** Maximum number of cached list entries */
  maxSize: number;
  /** Cache entry expiration time in minutes */
  expireAfterWriteMinutes: number;
}

// ============================================================================
// REDIS CONFIGURATION
// ============================================================================

/**
 * Redis cache configuration.
 * Used when cache type is 'redis'.
 */
export interface RedisCacheConfig {
  /** Redis server hostname */
  host: string;
  /** Redis server port */
  port: number;
  /** Prefix for all cache keys */
  keyPrefix: string;
  /** Default TTL for cache entries in minutes */
  ttlMinutes: number;
}

// ============================================================================
// MAIN CACHE CONFIG
// ============================================================================

/**
 * Main cache configuration interface.
 * Supports both local (Caffeine) and distributed (Redis) caching.
 */
export interface CacheConfig {
  /** Cache storage type */
  type: CacheType;
  /** Entity cache settings */
  entities: EntityCacheSettings;
  /** List/collection cache settings */
  lists: ListCacheSettings;
  /** Redis-specific configuration */
  redis: RedisCacheConfig;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default cache configuration values.
 */
export const defaultCacheConfig: CacheConfig = {
  type: 'local',
  entities: {
    maxSize: 1000,
    expireAfterWriteMinutes: 10,
  },
  lists: {
    maxSize: 100,
    expireAfterWriteMinutes: 5,
  },
  redis: {
    host: 'localhost',
    port: 6379,
    keyPrefix: 'apigen:',
    ttlMinutes: 10,
  },
};
