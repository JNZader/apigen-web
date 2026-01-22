/**
 * API client for the APiGen Server.
 * Uses centralized API client with AbortController, retry, and Zod validation.
 */
import type {
  ApiVersioningConfig,
  BatchConfig,
  BulkConfig,
  CacheConfig,
  CorsConfig,
  DatabaseConfig,
  EventSourcingConfig,
  FeatureFlagsConfig,
  GatewayConfig,
  GraphQLConfig,
  GrpcConfig,
  I18nConfig,
  MultiTenancyConfig,
  ObservabilityConfig,
  ProjectFeatures,
  ProjectModules,
  RateLimitConfig,
  ResilienceConfig,
  SecurityConfig,
  WebhooksConfig,
} from '../types';
import { createApiClient, type ApiClient } from './apiClient';
import {
  GenerateResponseSchema,
  HealthResponseSchema,
  type GenerateResponse,
  type HealthResponse,
} from './schemas';
import { API_CONFIG } from '../config/constants';

// Use centralized API configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

// Create the API client instance
const apiClient: ApiClient = createApiClient({
  baseUrl: API_BASE_URL,
  timeoutMs: API_CONFIG.GENERATION_REQUEST_TIMEOUT,
  maxRetries: 2,
  defaultHeaders: {
    Accept: 'application/json',
  },
});

export interface ProjectConfig {
  name: string;
  groupId: string;
  artifactId: string;
  javaVersion?: string;
  springBootVersion?: string;
  modules?: Partial<ProjectModules>;
  features?: Partial<ProjectFeatures>;
  database?: Partial<DatabaseConfig>;
  securityConfig?: Partial<SecurityConfig>;
  rateLimitConfig?: Partial<RateLimitConfig>;
  cacheConfig?: Partial<CacheConfig>;
  featureFlags?: Partial<FeatureFlagsConfig>;
  i18nConfig?: Partial<I18nConfig>;
  webhooksConfig?: Partial<WebhooksConfig>;
  bulkConfig?: Partial<BulkConfig>;
  batchConfig?: Partial<BatchConfig>;
  multiTenancyConfig?: Partial<MultiTenancyConfig>;
  eventSourcingConfig?: Partial<EventSourcingConfig>;
  apiVersioningConfig?: Partial<ApiVersioningConfig>;
  observabilityConfig?: Partial<ObservabilityConfig>;
  resilienceConfig?: Partial<ResilienceConfig>;
  corsConfig?: Partial<CorsConfig>;
  graphqlConfig?: Partial<GraphQLConfig>;
  grpcConfig?: Partial<GrpcConfig>;
  gatewayConfig?: Partial<GatewayConfig>;
}

export interface GenerateRequest {
  project: ProjectConfig;
  sql: string;
}

// Re-export types from schemas for backwards compatibility
export type { GenerateResponse, HealthResponse } from './schemas';
export type { GenerationStats } from './schemas';

/**
 * Check if the APiGen Server is available.
 * Uses Zod validation to ensure response structure.
 */
export async function checkHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/api/health', {
    schema: HealthResponseSchema,
    signal,
    timeoutMs: API_CONFIG.HEALTH_CHECK_TIMEOUT,
    maxRetries: 1,
  });

  return response.data;
}

/**
 * Validate SQL schema without generating code.
 * Uses Zod validation to ensure response structure.
 */
export async function validateSchema(
  request: GenerateRequest,
  signal?: AbortSignal,
): Promise<GenerateResponse> {
  const response = await apiClient.post<GenerateResponse>('/api/validate', request, {
    schema: GenerateResponseSchema,
    signal,
  });

  return response.data;
}

/**
 * Generate a Spring Boot project and download as ZIP.
 * Returns raw blob (no Zod validation for binary data).
 */
export async function generateProject(
  request: GenerateRequest,
  signal?: AbortSignal,
): Promise<Blob> {
  const response = await apiClient.post<Blob>('/api/generate', request, {
    responseType: 'blob',
    signal,
    timeoutMs: API_CONFIG.GENERATION_TIMEOUT,
    skipRetry: true, // Don't retry generation requests (could cause duplicate work)
  });

  return response.data;
}

/**
 * Check if the server is available.
 */
export async function isServerAvailable(signal?: AbortSignal): Promise<boolean> {
  try {
    await checkHealth(signal);
    return true;
  } catch {
    return false;
  }
}

// Export error types for use in components
export { ApiError, TimeoutError } from './apiClient';
