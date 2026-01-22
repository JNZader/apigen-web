/**
 * Centralized API client with AbortController, retry logic, and Zod validation.
 */
import type { ZodType } from 'zod';

// Default API configuration
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000; // 1 second base delay

// HTTP status codes that should trigger a retry
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay between retries in ms, uses exponential backoff (default: 1000) */
  retryDelayMs?: number;
  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions<T = unknown> {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Request body (will be JSON-stringified) */
  body?: unknown;
  /** Additional headers for this request */
  headers?: Record<string, string>;
  /** Override timeout for this request */
  timeoutMs?: number;
  /** Override max retries for this request */
  maxRetries?: number;
  /** Zod schema for response validation */
  schema?: ZodType<T>;
  /** External AbortSignal for request cancellation */
  signal?: AbortSignal;
  /** Skip retry logic for this request */
  skipRetry?: boolean;
  /** Expected response type */
  responseType?: 'json' | 'blob' | 'text';
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body?: unknown;

  constructor(message: string, status: number, statusText: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends Error {
  readonly errors: unknown;

  constructor(message: string, errors: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Sleep for a specified duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter.
 */
function calculateBackoffDelay(attempt: number, baseDelayMs: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelayMs * 2 ** attempt;
  // Add jitter (random value between 0-25% of the delay)
  const jitter = exponentialDelay * Math.random() * 0.25;
  return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
}

/**
 * Check if an error is retryable.
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return RETRYABLE_STATUS_CODES.includes(error.status);
  }
  // Network errors are retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  return false;
}

/**
 * Create an API client instance with the given configuration.
 */
export function createApiClient(config: ApiClientConfig) {
  const {
    baseUrl,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    defaultHeaders = {},
  } = config;

  /**
   * Make an HTTP request with timeout, retry, and optional validation.
   */
  async function request<T>(
    endpoint: string,
    options: RequestOptions<T> = {},
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeoutMs: requestTimeout = timeoutMs,
      maxRetries: requestMaxRetries = maxRetries,
      schema,
      signal: externalSignal,
      skipRetry = false,
      responseType = 'json',
    } = options;

    const url = `${baseUrl}${endpoint}`;
    const effectiveMaxRetries = skipRetry ? 0 : requestMaxRetries;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= effectiveMaxRetries; attempt++) {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      // Combine external signal with timeout signal
      const signal = externalSignal
        ? combineSignals(externalSignal, controller.signal)
        : controller.signal;

      try {
        const requestHeaders: Record<string, string> = {
          ...defaultHeaders,
          ...headers,
        };

        // Add Content-Type for JSON body
        if (body !== undefined && !requestHeaders['Content-Type']) {
          requestHeaders['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Try to parse error body
          let errorBody: unknown;
          try {
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              errorBody = await response.json();
            } else {
              errorBody = await response.text();
            }
          } catch {
            // Ignore parse errors
          }

          const error = new ApiError(
            errorBody && typeof errorBody === 'object' && 'message' in errorBody
              ? String((errorBody as { message: unknown }).message)
              : `Request failed: ${response.status} ${response.statusText}`,
            response.status,
            response.statusText,
            errorBody,
          );

          // Check if we should retry
          if (attempt < effectiveMaxRetries && isRetryableError(error)) {
            lastError = error;
            const delay = calculateBackoffDelay(attempt, retryDelayMs);
            await sleep(delay);
            continue;
          }

          throw error;
        }

        // Parse response based on type
        let data: unknown;
        if (responseType === 'blob') {
          data = await response.blob();
        } else if (responseType === 'text') {
          data = await response.text();
        } else {
          data = await response.json();
        }

        // Validate response with Zod schema if provided
        if (schema && responseType === 'json') {
          const result = schema.safeParse(data);
          if (!result.success) {
            throw new ValidationError('Response validation failed', result.error);
          }
          data = result.data;
        }

        return {
          data: data as T,
          status: response.status,
          headers: response.headers,
        };
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort from external signal
        if (externalSignal?.aborted) {
          throw new Error('Request was cancelled');
        }

        // Handle timeout
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new TimeoutError(`Request timed out after ${requestTimeout}ms`);
        }

        // Check if we should retry on network errors
        if (attempt < effectiveMaxRetries && isRetryableError(error)) {
          lastError = error as Error;
          const delay = calculateBackoffDelay(attempt, retryDelayMs);
          await sleep(delay);
          continue;
        }

        throw error;
      }
    }

    // Should not reach here, but throw last error just in case
    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Convenience method for GET requests.
   */
  function get<T>(endpoint: string, options?: Omit<RequestOptions<T>, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Convenience method for POST requests.
   */
  function post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions<T>, 'method'>) {
    return request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * Convenience method for PUT requests.
   */
  function put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions<T>, 'method'>) {
    return request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * Convenience method for DELETE requests.
   */
  function del<T>(endpoint: string, options?: Omit<RequestOptions<T>, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Convenience method for PATCH requests.
   */
  function patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions<T>, 'method'>) {
    return request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  return {
    request,
    get,
    post,
    put,
    delete: del,
    patch,
  };
}

/**
 * Combine multiple AbortSignals into one.
 * The resulting signal will abort if any of the input signals abort.
 */
function combineSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}

// Export types for external use
export type ApiClient = ReturnType<typeof createApiClient>;
