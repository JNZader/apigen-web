/**
 * Observability Configuration Types
 *
 * This module contains observability-related type definitions including
 * tracing, metrics, and query analysis configuration.
 */

// ============================================================================
// TRACING CONFIGURATION
// ============================================================================

/**
 * Distributed tracing configuration.
 * Supports OpenTelemetry protocol (OTLP).
 */
export interface TracingConfig {
  /** Enable distributed tracing */
  enabled: boolean;
  /** Sampling probability (0.0 to 1.0) */
  samplingProbability: number;
  /** OpenTelemetry collector endpoint */
  otlpEndpoint: string;
}

// ============================================================================
// METRICS CONFIGURATION
// ============================================================================

/**
 * Metrics collection and export configuration.
 * Supports Prometheus and Micrometer metrics.
 */
export interface MetricsConfig {
  /** Enable metrics collection */
  enabled: boolean;
  /** Threshold in milliseconds for slow query detection */
  slowQueryThresholdMs: number;
  /** Expose HikariCP connection pool metrics */
  exposeHikariMetrics: boolean;
  /** Expose Prometheus metrics endpoint */
  exposePrometheus: boolean;
}

// ============================================================================
// QUERY ANALYSIS CONFIGURATION
// ============================================================================

/**
 * Database query analysis configuration.
 * Helps identify performance issues and N+1 queries.
 */
export interface QueryAnalysisConfig {
  /** Enable query analysis */
  enabled: boolean;
  /** Number of queries to trigger a warning */
  warnThreshold: number;
  /** Number of queries to trigger an error */
  errorThreshold: number;
  /** Log slow queries */
  logSlowQueries: boolean;
  /** Threshold in milliseconds for slow query logging */
  slowQueryThresholdMs: number;
}

// ============================================================================
// MAIN OBSERVABILITY CONFIG
// ============================================================================

/**
 * Main observability configuration interface.
 * Contains tracing, metrics, and query analysis settings.
 */
export interface ObservabilityConfig {
  /** Distributed tracing configuration */
  tracing: TracingConfig;
  /** Metrics configuration */
  metrics: MetricsConfig;
  /** Query analysis configuration */
  queryAnalysis: QueryAnalysisConfig;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default observability configuration values.
 */
export const defaultObservabilityConfig: ObservabilityConfig = {
  tracing: {
    enabled: false,
    samplingProbability: 1,
    otlpEndpoint: 'http://localhost:4317',
  },
  metrics: {
    enabled: true,
    slowQueryThresholdMs: 500,
    exposeHikariMetrics: true,
    exposePrometheus: true,
  },
  queryAnalysis: {
    enabled: true,
    warnThreshold: 5,
    errorThreshold: 10,
    logSlowQueries: true,
    slowQueryThresholdMs: 100,
  },
};
