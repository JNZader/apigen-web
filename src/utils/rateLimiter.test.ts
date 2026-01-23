import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createRateLimiter,
  defaultRateLimiter,
  RateLimitError,
  strictRateLimiter,
} from './rateLimiter';

describe('rateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createRateLimiter', () => {
    it('should allow requests within the limit', () => {
      const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60000 });

      expect(limiter.canMakeRequest()).toBe(true);
      limiter.recordRequest();

      expect(limiter.canMakeRequest()).toBe(true);
      limiter.recordRequest();

      expect(limiter.canMakeRequest()).toBe(true);
      limiter.recordRequest();

      // Now at limit
      expect(limiter.canMakeRequest()).toBe(false);
    });

    it('should reset after window expires', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.canMakeRequest()).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(1001);

      expect(limiter.canMakeRequest()).toBe(true);
    });

    it('should report remaining requests correctly', () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });

      expect(limiter.getRemainingRequests()).toBe(5);

      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(4);

      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(2);
    });

    it('should calculate time until reset correctly', () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 10000 });

      expect(limiter.getTimeUntilReset()).toBe(0);

      limiter.recordRequest();
      expect(limiter.getTimeUntilReset()).toBe(10000);

      vi.advanceTimersByTime(3000);
      expect(limiter.getTimeUntilReset()).toBe(7000);

      vi.advanceTimersByTime(7001);
      expect(limiter.getTimeUntilReset()).toBe(0);
    });

    it('should reset all requests when reset is called', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });

      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.canMakeRequest()).toBe(false);

      limiter.reset();

      expect(limiter.canMakeRequest()).toBe(true);
      expect(limiter.getRemainingRequests()).toBe(2);
    });

    it('should use sliding window (not fixed window)', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });

      // Record first request at t=0
      limiter.recordRequest();

      // Advance 500ms, record second
      vi.advanceTimersByTime(500);
      limiter.recordRequest();

      // At limit
      expect(limiter.canMakeRequest()).toBe(false);

      // After 500ms more, first request should fall out of window
      vi.advanceTimersByTime(501);
      expect(limiter.canMakeRequest()).toBe(true);
    });
  });

  describe('RateLimitError', () => {
    it('should create error with retry time', () => {
      const error = new RateLimitError(5000);

      expect(error.name).toBe('RateLimitError');
      expect(error.retryAfterMs).toBe(5000);
      expect(error.message).toContain('5 seconds');
    });

    it('should be instanceof Error', () => {
      const error = new RateLimitError(1000);

      expect(error instanceof Error).toBe(true);
      expect(error instanceof RateLimitError).toBe(true);
    });
  });

  describe('default limiters', () => {
    it('defaultRateLimiter should allow 100 requests per minute', () => {
      // Reset the limiter first
      defaultRateLimiter.reset();

      expect(defaultRateLimiter.getRemainingRequests()).toBe(100);
    });

    it('strictRateLimiter should allow 10 requests per minute', () => {
      // Reset the limiter first
      strictRateLimiter.reset();

      expect(strictRateLimiter.getRemainingRequests()).toBe(10);
    });
  });
});
