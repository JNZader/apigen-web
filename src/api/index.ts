/**
 * API module exports.
 */

// Client and types
export {
  type ApiClient,
  type ApiClientConfig,
  ApiError,
  type ApiResponse,
  createApiClient,
  type RequestOptions,
  TimeoutError,
  ValidationError,
} from './apiClient';

// Generator API functions
export {
  checkHealth,
  type GenerateRequest,
  generateProject,
  isServerAvailable,
  type ProjectConfig,
  validateSchema,
} from './generatorApi';

// Schemas and response types
export {
  type GenerateResponse,
  GenerateResponseSchema,
  type GenerationStats,
  GenerationStatsSchema,
  type HealthResponse,
  HealthResponseSchema,
} from './schemas';
