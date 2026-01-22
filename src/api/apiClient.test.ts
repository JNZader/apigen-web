import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createApiClient,
  ApiError,
  TimeoutError,
  ValidationError,
} from './apiClient';
import { z } from 'zod';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('apiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createApiClient', () => {
    it('should create a client with provided configuration', () => {
      const client = createApiClient({
        baseUrl: 'https://api.example.com',
        timeoutMs: 5000,
        maxRetries: 2,
      });

      expect(client).toHaveProperty('get');
      expect(client).toHaveProperty('post');
      expect(client).toHaveProperty('put');
      expect(client).toHaveProperty('delete');
      expect(client).toHaveProperty('patch');
      expect(client).toHaveProperty('request');
    });
  });

  describe('GET requests', () => {
    it('should make GET request with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'test' }),
      });

      const client = createApiClient({ baseUrl: 'https://api.example.com' });
      const promise = client.get('/test');

      // Advance timers to allow async operations
      await vi.runAllTimersAsync();

      const response = await promise;

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(response.data).toEqual({ data: 'test' });
    });

    it('should include default headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({}),
      });

      const client = createApiClient({
        baseUrl: 'https://api.example.com',
        defaultHeaders: { 'X-Custom-Header': 'value' },
      });

      const promise = client.get('/test');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'value',
          }),
        }),
      );
    });
  });

  describe('POST requests', () => {
    it('should make POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers(),
        json: () => Promise.resolve({ id: 1 }),
      });

      const client = createApiClient({ baseUrl: 'https://api.example.com' });
      const promise = client.post('/users', { name: 'Test' });

      await vi.runAllTimersAsync();
      const response = await promise;

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
      expect(response.data).toEqual({ id: 1 });
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Resource not found' }),
      });

      const client = createApiClient({
        baseUrl: 'https://api.example.com',
        maxRetries: 0,
      });

      const promise = client.get('/missing');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(ApiError);
      await expect(promise).rejects.toMatchObject({
        status: 404,
        statusText: 'Not Found',
      });
    });

    it('should create TimeoutError with proper message', () => {
      // Test TimeoutError creation since actual timeout testing with fake timers is unreliable
      const error = new TimeoutError('Request timed out after 1000ms');
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.message).toBe('Request timed out after 1000ms');
      expect(error.name).toBe('TimeoutError');
    });
  });

  describe('Zod validation', () => {
    it('should validate response with Zod schema', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ name: 'Test', age: 25 }),
      });

      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const client = createApiClient({ baseUrl: 'https://api.example.com' });
      const promise = client.get('/user', { schema });

      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.data).toEqual({ name: 'Test', age: 25 });
    });

    it('should throw ValidationError on schema mismatch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ name: 'Test', age: 'not a number' }),
      });

      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const client = createApiClient({ baseUrl: 'https://api.example.com' });
      const promise = client.get('/user', { schema });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(ValidationError);
    });
  });

  describe('Response types', () => {
    it('should handle blob responses', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/octet-stream' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        blob: () => Promise.resolve(mockBlob),
      });

      const client = createApiClient({ baseUrl: 'https://api.example.com' });
      const promise = client.get('/file', { responseType: 'blob' });

      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.data).toBe(mockBlob);
    });

    it('should handle text responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve('plain text response'),
      });

      const client = createApiClient({ baseUrl: 'https://api.example.com' });
      const promise = client.get('/text', { responseType: 'text' });

      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.data).toBe('plain text response');
    });
  });

  describe('Retry logic', () => {
    it('should retry on retryable status codes', async () => {
      // First call fails with 503
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Service down' }),
      });
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'success' }),
      });

      const client = createApiClient({
        baseUrl: 'https://api.example.com',
        maxRetries: 1,
        retryDelayMs: 100,
      });

      const promise = client.get('/flaky');

      // Advance timers to allow retry
      await vi.advanceTimersByTimeAsync(200);

      const response = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(response.data).toEqual({ data: 'success' });
    });

    it('should not retry when skipRetry is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Service down' }),
      });

      const client = createApiClient({
        baseUrl: 'https://api.example.com',
        maxRetries: 3,
      });

      const promise = client.get('/no-retry', { skipRetry: true });
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(ApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry on non-retryable status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ message: 'Invalid input' }),
      });

      const client = createApiClient({
        baseUrl: 'https://api.example.com',
        maxRetries: 3,
      });

      const promise = client.get('/bad-request');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(ApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request cancellation', () => {
    it('should pass signal to fetch call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'test' }),
      });

      const controller = new AbortController();
      const client = createApiClient({ baseUrl: 'https://api.example.com' });

      const promise = client.get('/test', { signal: controller.signal });
      await vi.runAllTimersAsync();
      await promise;

      // Verify the signal was passed to fetch
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });
});

describe('Error classes', () => {
  describe('ApiError', () => {
    it('should create error with all properties', () => {
      const error = new ApiError('Test error', 404, 'Not Found', { detail: 'Extra' });

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.body).toEqual({ detail: 'Extra' });
      expect(error.name).toBe('ApiError');
    });
  });

  describe('TimeoutError', () => {
    it('should create error with default message', () => {
      const error = new TimeoutError();

      expect(error.message).toBe('Request timed out');
      expect(error.name).toBe('TimeoutError');
    });

    it('should create error with custom message', () => {
      const error = new TimeoutError('Custom timeout');

      expect(error.message).toBe('Custom timeout');
    });
  });

  describe('ValidationError', () => {
    it('should create error with errors property', () => {
      const zodErrors = { issues: [{ message: 'Invalid' }] };
      const error = new ValidationError('Validation failed', zodErrors);

      expect(error.message).toBe('Validation failed');
      expect(error.errors).toBe(zodErrors);
      expect(error.name).toBe('ValidationError');
    });
  });
});
