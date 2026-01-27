/**
 * API client for the APiGen Server.
 * Uses centralized API client with AbortController, retry, and Zod validation.
 * Includes client-side rate limiting to prevent API abuse.
 */

import { z } from 'zod';

import { API_CONFIG } from '../config/constants';
import type { ProjectConfig } from '../types';
import { RateLimitError, strictRateLimiter } from '../utils/rateLimiter';
import { type ApiClient, createApiClient } from './apiClient';
import {
  type GenerateResponse,
  GenerateResponseSchema,
  type HealthResponse,
  HealthResponseSchema,
} from './schemas';

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

// ============================================================================
// ZOD SCHEMAS FOR REQUEST VALIDATION
// ============================================================================

/**
 * Target configuration schema for multi-language support.
 */
const TargetConfigSchema = z.object({
  language: z.enum(['java', 'kotlin', 'python', 'typescript', 'php', 'go', 'rust', 'csharp']),
  framework: z.enum([
    'spring-boot',
    'fastapi',
    'nestjs',
    'laravel',
    'gin',
    'chi',
    'axum',
    'aspnet-core',
  ]),
  languageVersion: z.string(),
  frameworkVersion: z.string(),
});

/**
 * Project modules schema.
 */
const ProjectModulesSchema = z.object({
  core: z.boolean(),
  security: z.boolean(),
  graphql: z.boolean(),
  grpc: z.boolean(),
  gateway: z.boolean(),
});

/**
 * Project features schema (includes Feature Pack 2025).
 */
const ProjectFeaturesSchema = z.object({
  hateoas: z.boolean(),
  swagger: z.boolean(),
  softDelete: z.boolean(),
  auditing: z.boolean(),
  caching: z.boolean(),
  rateLimiting: z.boolean(),
  virtualThreads: z.boolean(),
  docker: z.boolean(),
  i18n: z.boolean(),
  webhooks: z.boolean(),
  bulkOperations: z.boolean(),
  batchOperations: z.boolean(),
  multiTenancy: z.boolean(),
  eventSourcing: z.boolean(),
  apiVersioning: z.boolean(),
  cursorPagination: z.boolean(),
  etagSupport: z.boolean(),
  domainEvents: z.boolean(),
  sseUpdates: z.boolean(),
  // Feature Pack 2025
  socialLogin: z.boolean(),
  passwordReset: z.boolean(),
  mailService: z.boolean(),
  fileStorage: z.boolean(),
  jteTemplates: z.boolean(),
});

/**
 * Minimal project config schema for request validation.
 * Uses passthrough() to allow additional configuration fields.
 */
const ProjectConfigSchema = z
  .object({
    name: z.string().min(1),
    groupId: z.string().min(1),
    artifactId: z.string().min(1),
    packageName: z.string().min(1),
    javaVersion: z.enum(['21', '25']).optional(),
    springBootVersion: z.literal('4.0.0').optional(),
    targetConfig: TargetConfigSchema.optional(),
    modules: ProjectModulesSchema.partial().optional(),
    features: ProjectFeaturesSchema.partial().optional(),
  })
  .passthrough();

/**
 * Target configuration schema for backend API (simpler than frontend TargetConfigSchema).
 */
const BackendTargetConfigSchema = z
  .object({
    language: z.string(),
    framework: z.string(),
  })
  .optional();

/**
 * Generate request schema with Zod validation.
 */
export const GenerateRequestSchema = z.object({
  project: ProjectConfigSchema,
  target: BackendTargetConfigSchema,
  sql: z.string().min(1, 'SQL schema is required'),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Target configuration for the backend API.
 */
export interface TargetConfigDTO {
  language: string;
  framework: string;
}

/**
 * Generate request type inferred from Zod schema.
 * Uses the centralized ProjectConfig type for full type safety.
 */
export interface GenerateRequest {
  /** Project configuration with all settings */
  project: Partial<ProjectConfig> & {
    name: string;
    groupId: string;
    artifactId: string;
    packageName: string;
  };
  /** Target language/framework configuration (sent at request level for backend) */
  target?: TargetConfigDTO;
  /** SQL schema for code generation */
  sql: string;
}

/**
 * @deprecated Use GenerateRequest instead. This type alias is kept for backward compatibility.
 */
export type LegacyGenerateRequest = GenerateRequest;

// Re-export types from schemas for backwards compatibility
export type { GenerateResponse, GenerationStats, HealthResponse } from './schemas';

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Validate a GenerateRequest using the Zod schema.
 * @param request - The request to validate
 * @returns The validated request
 * @throws ZodError if validation fails
 */
export function validateGenerateRequest(request: GenerateRequest): GenerateRequest {
  return GenerateRequestSchema.parse(request) as GenerateRequest;
}

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
  // Validate request before sending
  const validatedRequest = validateGenerateRequest(request);

  const response = await apiClient.post<GenerateResponse>('/api/validate', validatedRequest, {
    schema: GenerateResponseSchema,
    signal,
  });

  return response.data;
}

/**
 * Generate a Spring Boot project and download as ZIP.
 * Returns raw blob (no Zod validation for binary data).
 * Rate limited to prevent API abuse (10 requests per minute).
 */
export async function generateProject(
  request: GenerateRequest,
  signal?: AbortSignal,
): Promise<Blob> {
  // Validate request before sending
  const validatedRequest = validateGenerateRequest(request);

  // Check rate limit before making expensive generation request
  if (!strictRateLimiter.canMakeRequest()) {
    const retryAfter = strictRateLimiter.getTimeUntilReset();
    throw new RateLimitError(retryAfter);
  }

  // Record the request before making it
  strictRateLimiter.recordRequest();

  const response = await apiClient.post<Blob>('/api/generate', validatedRequest, {
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

// ============================================================================
// EXPORTS
// ============================================================================

export { RateLimitError } from '../utils/rateLimiter';
// Export error types for use in components
export { ApiError, TimeoutError } from './apiClient';
