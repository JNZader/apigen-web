/**
 * Database Configuration Types
 *
 * This module contains database-related type definitions including
 * connection pool settings and supported database types.
 */

// ============================================================================
// DATABASE TYPE
// ============================================================================

/**
 * Supported database types.
 * Each type has specific driver and dialect configurations.
 */
export type DatabaseType =
  | 'postgresql'
  | 'mysql'
  | 'mariadb'
  | 'h2'
  | 'oracle'
  | 'sqlserver'
  | 'mongodb';

// ============================================================================
// HIKARI CONNECTION POOL
// ============================================================================

/**
 * HikariCP connection pool configuration.
 * HikariCP is the default connection pool for Spring Boot.
 */
export interface HikariConfig {
  /** Maximum number of connections in the pool */
  maximumPoolSize: number;
  /** Minimum number of idle connections to maintain */
  minimumIdle: number;
  /** Maximum time to wait for a connection from the pool (ms) */
  connectionTimeoutMs: number;
  /** Maximum time a connection can remain idle before being closed (ms) */
  idleTimeoutMs: number;
}

// ============================================================================
// MAIN DATABASE CONFIG
// ============================================================================

/**
 * Database configuration interface.
 * Contains all database-related settings including type and connection pool.
 */
export interface DatabaseConfig {
  /** Database type/vendor */
  type: DatabaseType;
  /** Generate Flyway/Liquibase migrations */
  generateMigrations: boolean;
  /** HikariCP connection pool settings */
  hikari: HikariConfig;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default database configuration values.
 */
export const defaultDatabaseConfig: DatabaseConfig = {
  type: 'postgresql',
  generateMigrations: true,
  hikari: {
    maximumPoolSize: 20,
    minimumIdle: 5,
    connectionTimeoutMs: 30000,
    idleTimeoutMs: 600000,
  },
};
