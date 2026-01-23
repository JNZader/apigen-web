/**
 * API Configuration Types
 *
 * This module contains API-related type definitions including
 * GraphQL, gRPC, Gateway, API versioning, and CORS configuration.
 */

// ============================================================================
// GRAPHQL CONFIGURATION
// ============================================================================

/**
 * GraphQL API configuration.
 * Enables GraphQL endpoint alongside REST API.
 */
export interface GraphQLConfig {
  /** Enable GraphQL API */
  enabled: boolean;
  /** GraphQL endpoint path */
  path: string;
  /** Enable query tracing */
  tracingEnabled: boolean;
  /** Enable GraphQL introspection (disable in production) */
  introspectionEnabled: boolean;
  /** Maximum query nesting depth */
  maxQueryDepth: number;
  /** Maximum query complexity score */
  maxQueryComplexity: number;
}

// ============================================================================
// GRPC CONFIGURATION
// ============================================================================

/**
 * gRPC API configuration.
 * Enables gRPC service alongside REST API.
 */
export interface GrpcConfig {
  /** Enable gRPC server */
  enabled: boolean;
  /** gRPC server port */
  serverPort: number;
  /** Enable gRPC request/response logging */
  loggingEnabled: boolean;
  /** Maximum inbound message size in megabytes */
  maxInboundMessageSizeMb: number;
  /** Client deadline timeout in milliseconds */
  clientDeadlineMs: number;
  /** Use plaintext (no TLS) - only for development */
  usePlaintext: boolean;
  /** Enable gRPC health check service */
  healthCheckEnabled: boolean;
}

// ============================================================================
// API GATEWAY CONFIGURATION
// ============================================================================

/**
 * Gateway route configuration.
 * Defines routing rules for the API gateway.
 */
export interface GatewayRouteConfig {
  /** Unique route identifier */
  id: string;
  /** Request path pattern */
  path: string;
  /** Target service URI */
  uri: string;
  /** List of gateway filters to apply */
  filters: string[];
  /** List of route predicates */
  predicates: string[];
  /** Enable rate limiting for this route */
  rateLimitEnabled: boolean;
  /** Rate limit requests per second */
  rateLimitRequests: number;
  /** Rate limit burst capacity */
  rateLimitBurst: number;
  /** Enable circuit breaker for this route */
  circuitBreakerEnabled: boolean;
  /** Require authentication for this route */
  authRequired: boolean;
}

/**
 * API Gateway configuration.
 * Configures Spring Cloud Gateway for API routing.
 */
export interface GatewayConfig {
  /** Enable API gateway */
  enabled: boolean;
  /** Enable request/response logging */
  loggingEnabled: boolean;
  /** Include headers in logs */
  loggingIncludeHeaders: boolean;
  /** Include request body in logs */
  loggingIncludeBody: boolean;
  /** Enable global authentication */
  authEnabled: boolean;
  /** Paths excluded from authentication */
  authExcludedPaths: string[];
  /** Default rate limit requests per second */
  defaultRateLimitRequests: number;
  /** Default rate limit burst capacity */
  defaultRateLimitBurst: number;
  /** Enable global circuit breaker */
  circuitBreakerEnabled: boolean;
  /** Circuit breaker timeout in seconds */
  circuitBreakerTimeoutSeconds: number;
  /** List of gateway routes */
  routes: GatewayRouteConfig[];
}

// ============================================================================
// API VERSIONING CONFIGURATION
// ============================================================================

/**
 * API versioning strategy options.
 */
export type VersioningStrategy = 'HEADER' | 'PATH' | 'QUERY_PARAM' | 'MEDIA_TYPE';

/**
 * API versioning configuration.
 * Supports multiple versioning strategies.
 */
export interface ApiVersioningConfig {
  /** Enable API versioning */
  enabled: boolean;
  /** Default API version */
  defaultVersion: string;
  /** Enabled versioning strategies */
  strategies: VersioningStrategy[];
  /** Header name for version (when using HEADER strategy) */
  versionHeader: string;
  /** Path prefix for version (when using PATH strategy) */
  pathPrefix: string;
  /** Query parameter name (when using QUERY_PARAM strategy) */
  queryParam: string;
}

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

/**
 * Cross-Origin Resource Sharing (CORS) configuration.
 * Controls browser access from different origins.
 */
export interface CorsConfig {
  /** List of allowed origins (use '*' for all) */
  allowedOrigins: string[];
  /** List of allowed HTTP methods */
  allowedMethods: string[];
  /** List of allowed request headers */
  allowedHeaders: string[];
  /** List of headers exposed to the client */
  exposedHeaders: string[];
  /** Allow credentials (cookies, authorization headers) */
  allowCredentials: boolean;
  /** Preflight request cache duration in seconds */
  maxAgeSeconds: number;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default GraphQL configuration.
 */
export const defaultGraphQLConfig: GraphQLConfig = {
  enabled: false,
  path: '/graphql',
  tracingEnabled: false,
  introspectionEnabled: true,
  maxQueryDepth: 10,
  maxQueryComplexity: 100,
};

/**
 * Default gRPC configuration.
 */
export const defaultGrpcConfig: GrpcConfig = {
  enabled: false,
  serverPort: 9090,
  loggingEnabled: true,
  maxInboundMessageSizeMb: 4,
  clientDeadlineMs: 10000,
  usePlaintext: false,
  healthCheckEnabled: true,
};

/**
 * Default Gateway configuration.
 */
export const defaultGatewayConfig: GatewayConfig = {
  enabled: false,
  loggingEnabled: true,
  loggingIncludeHeaders: false,
  loggingIncludeBody: false,
  authEnabled: true,
  authExcludedPaths: ['/public/**', '/health', '/actuator/**'],
  defaultRateLimitRequests: 100,
  defaultRateLimitBurst: 200,
  circuitBreakerEnabled: true,
  circuitBreakerTimeoutSeconds: 10,
  routes: [],
};

/**
 * Default API versioning configuration.
 */
export const defaultApiVersioningConfig: ApiVersioningConfig = {
  enabled: false,
  defaultVersion: '1',
  strategies: ['HEADER', 'PATH'],
  versionHeader: 'X-Api-Version',
  pathPrefix: 'v',
  queryParam: 'version',
};

/**
 * Default CORS configuration.
 */
export const defaultCorsConfig: CorsConfig = {
  allowedOrigins: ['http://localhost:3000'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
  exposedHeaders: ['Authorization', 'X-Total-Count', 'X-Page-Number', 'X-Page-Size'],
  allowCredentials: true,
  maxAgeSeconds: 3600,
};
