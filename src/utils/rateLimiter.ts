/**
 * Client-side rate limiter using sliding window algorithm.
 * Prevents excessive API calls from the browser.
 */

export interface RateLimiterConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimiter {
  /** Check if a request can be made without exceeding the rate limit */
  canMakeRequest(): boolean;
  /** Record that a request was made */
  recordRequest(): void;
  /** Get the number of requests remaining in the current window */
  getRemainingRequests(): number;
  /** Get the time in ms until the rate limit resets */
  getTimeUntilReset(): number;
  /** Reset the rate limiter */
  reset(): void;
}

/**
 * Create a rate limiter instance.
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter({ maxRequests: 100, windowMs: 60000 });
 *
 * if (limiter.canMakeRequest()) {
 *   limiter.recordRequest();
 *   await fetch('/api/endpoint');
 * } else {
 *   console.warn('Rate limit exceeded');
 * }
 * ```
 */
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  const { maxRequests, windowMs } = config;
  const requests: number[] = [];

  function cleanupOldRequests(): void {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove requests outside the current window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
  }

  function canMakeRequest(): boolean {
    cleanupOldRequests();
    return requests.length < maxRequests;
  }

  function recordRequest(): void {
    cleanupOldRequests();
    requests.push(Date.now());
  }

  function getRemainingRequests(): number {
    cleanupOldRequests();
    return Math.max(0, maxRequests - requests.length);
  }

  function getTimeUntilReset(): number {
    cleanupOldRequests();
    if (requests.length === 0) {
      return 0;
    }
    const oldestRequest = requests[0];
    const resetTime = oldestRequest + windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  function reset(): void {
    requests.length = 0;
  }

  return {
    canMakeRequest,
    recordRequest,
    getRemainingRequests,
    getTimeUntilReset,
    reset,
  };
}

/**
 * Rate limit error thrown when the rate limit is exceeded.
 */
export class RateLimitError extends Error {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super(`Rate limit exceeded. Retry after ${Math.ceil(retryAfterMs / 1000)} seconds.`);
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * Default rate limiter for API calls.
 * Allows 100 requests per minute.
 */
export const defaultRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
});

/**
 * Strict rate limiter for expensive operations (e.g., code generation).
 * Allows 10 requests per minute.
 */
export const strictRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
});
