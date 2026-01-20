/**
 * API client for the APiGen Server.
 */
import type {
  ProjectModules,
  ProjectFeatures,
  DatabaseConfig,
  SecurityConfig,
  RateLimitConfig,
  CacheConfig,
  FeatureFlagsConfig,
  I18nConfig,
  WebhooksConfig,
  BulkConfig,
  BatchConfig,
  MultiTenancyConfig,
  EventSourcingConfig,
  ApiVersioningConfig,
  ObservabilityConfig,
  ResilienceConfig,
  CorsConfig,
  GraphQLConfig,
  GrpcConfig,
  GatewayConfig,
} from '../types';

// Default to localhost:8081, can be overridden via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

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

export interface GenerationStats {
  tablesProcessed: number;
  entitiesGenerated: number;
  filesGenerated: number;
  generationTimeMs: number;
}

export interface GenerateResponse {
  success: boolean;
  message: string;
  generatedFiles: string[];
  warnings: string[];
  errors: string[];
  stats?: GenerationStats;
}

export interface HealthResponse {
  status: string;
  message: string;
}

/**
 * Check if the APiGen Server is available.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Validate SQL schema without generating code.
 */
export async function validateSchema(request: GenerateRequest): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Validation failed');
  }

  return response.json();
}

/**
 * Generate a Spring Boot project and download as ZIP.
 */
export async function generateProject(request: GenerateRequest): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    // Try to get error message from response body
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || error.errors?.join(', ') || 'Generation failed');
    }
    throw new Error(`Generation failed: ${response.status} ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Check if the server is available.
 */
export async function isServerAvailable(): Promise<boolean> {
  try {
    await checkHealth();
    return true;
  } catch {
    return false;
  }
}
