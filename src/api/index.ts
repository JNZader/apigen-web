/**
 * API module exports.
 */

// Client and types
export {
  createApiClient,
  ApiError,
  TimeoutError,
  ValidationError,
  type ApiClient,
  type ApiClientConfig,
  type RequestOptions,
  type ApiResponse,
} from './apiClient';

// Generator API functions
export {
  checkHealth,
  validateSchema,
  generateProject,
  isServerAvailable,
  type ProjectConfig,
  type GenerateRequest,
} from './generatorApi';

// Schemas and response types
export {
  HealthResponseSchema,
  GenerateResponseSchema,
  GenerationStatsSchema,
  type HealthResponse,
  type GenerateResponse,
  type GenerationStats,
} from './schemas';
