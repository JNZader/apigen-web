/**
 * Resilience Configuration Types
 *
 * This module contains resilience-related type definitions including
 * circuit breaker and retry configuration.
 */

// ============================================================================
// CIRCUIT BREAKER CONFIGURATION
// ============================================================================

/**
 * Circuit breaker configuration using Resilience4j.
 * Prevents cascading failures in distributed systems.
 */
export interface CircuitBreakerConfig {
  /** Enable circuit breaker pattern */
  enabled: boolean;
  /** Size of the sliding window for failure rate calculation */
  slidingWindowSize: number;
  /** Minimum number of calls before the circuit breaker can trip */
  minimumNumberOfCalls: number;
  /** Failure rate threshold percentage to trip the circuit */
  failureRateThreshold: number;
  /** Slow call rate threshold percentage */
  slowCallRateThreshold: number;
  /** Duration threshold in seconds for slow calls */
  slowCallDurationThresholdSeconds: number;
  /** Time to wait before transitioning from OPEN to HALF_OPEN state (seconds) */
  waitDurationInOpenStateSeconds: number;
}

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

/**
 * Retry configuration using Resilience4j.
 * Automatically retries failed operations.
 */
export interface RetryConfig {
  /** Enable retry mechanism */
  enabled: boolean;
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial wait duration between retries in milliseconds */
  waitDurationMs: number;
  /** Enable exponential backoff for retry delays */
  enableExponentialBackoff: boolean;
  /** Multiplier for exponential backoff calculation */
  exponentialBackoffMultiplier: number;
}

// ============================================================================
// MAIN RESILIENCE CONFIG
// ============================================================================

/**
 * Main resilience configuration interface.
 * Contains circuit breaker and retry settings.
 */
export interface ResilienceConfig {
  /** Circuit breaker configuration */
  circuitBreaker: CircuitBreakerConfig;
  /** Retry configuration */
  retry: RetryConfig;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default resilience configuration values.
 */
export const defaultResilienceConfig: ResilienceConfig = {
  circuitBreaker: {
    enabled: false,
    slidingWindowSize: 100,
    minimumNumberOfCalls: 10,
    failureRateThreshold: 50,
    slowCallRateThreshold: 80,
    slowCallDurationThresholdSeconds: 2,
    waitDurationInOpenStateSeconds: 60,
  },
  retry: {
    enabled: false,
    maxAttempts: 3,
    waitDurationMs: 500,
    enableExponentialBackoff: true,
    exponentialBackoffMultiplier: 2,
  },
};
