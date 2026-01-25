/**
 * Rust/Axum Configuration Types
 *
 * This module contains Rust-specific type definitions including
 * Axum framework options and edge computing presets.
 */

// ============================================================================
// RUST PRESET TYPES
// ============================================================================

/**
 * Available Rust deployment presets.
 * Each preset optimizes for different deployment scenarios.
 *
 * - cloud: Standard cloud deployment with full features
 * - edge-gateway: Edge API gateway with minimal latency
 * - edge-anomaly: Edge anomaly detection with streaming support
 * - edge-ai: Edge AI inference with model serving capabilities
 */
export type RustPreset = 'cloud' | 'edge-gateway' | 'edge-anomaly' | 'edge-ai';

// ============================================================================
// EDGE CONFIGURATION
// ============================================================================

/**
 * Edge-specific configuration options.
 * Controls resource constraints and optimization strategies for edge deployments.
 */
export interface EdgeConfig {
  /** Maximum memory usage in MB (0 = unlimited) */
  maxMemoryMb: number;
  /** Maximum number of concurrent connections */
  maxConnections: number;
  /** Enable response compression */
  compressionEnabled: boolean;
  /** Connection timeout in milliseconds */
  connectionTimeoutMs: number;
  /** Request timeout in milliseconds */
  requestTimeoutMs: number;
  /** Enable connection pooling */
  connectionPoolEnabled: boolean;
  /** Connection pool size (when pooling is enabled) */
  connectionPoolSize: number;
}

/**
 * Edge gateway specific configuration.
 * Optimized for API routing and load balancing at the edge.
 */
export interface EdgeGatewayConfig {
  /** Enable request routing */
  routingEnabled: boolean;
  /** Enable load balancing */
  loadBalancingEnabled: boolean;
  /** Load balancing strategy */
  loadBalancingStrategy: 'round-robin' | 'least-connections' | 'ip-hash';
  /** Enable request caching */
  cachingEnabled: boolean;
  /** Cache TTL in seconds */
  cacheTtlSeconds: number;
  /** Enable rate limiting at edge */
  rateLimitingEnabled: boolean;
  /** Requests per second limit */
  rateLimitRps: number;
}

/**
 * Edge anomaly detection configuration.
 * Optimized for real-time streaming and anomaly detection.
 */
export interface EdgeAnomalyConfig {
  /** Enable streaming processing */
  streamingEnabled: boolean;
  /** Streaming buffer size in KB */
  bufferSizeKb: number;
  /** Enable real-time alerts */
  alertsEnabled: boolean;
  /** Alert threshold (0.0 - 1.0) */
  alertThreshold: number;
  /** Window size for anomaly detection in seconds */
  windowSizeSeconds: number;
  /** Enable metric aggregation */
  aggregationEnabled: boolean;
}

/**
 * Edge AI inference configuration.
 * Optimized for machine learning model serving at the edge.
 */
export interface EdgeAiConfig {
  /** Enable model serving */
  modelServingEnabled: boolean;
  /** Maximum model size in MB */
  maxModelSizeMb: number;
  /** Enable model caching */
  modelCachingEnabled: boolean;
  /** Number of inference threads */
  inferenceThreads: number;
  /** Enable batch inference */
  batchInferenceEnabled: boolean;
  /** Maximum batch size */
  maxBatchSize: number;
  /** Inference timeout in milliseconds */
  inferenceTimeoutMs: number;
}

// ============================================================================
// AXUM FRAMEWORK CONFIGURATION
// ============================================================================

/**
 * Axum server configuration options.
 */
export interface AxumServerConfig {
  /** Server host address */
  host: string;
  /** Server port */
  port: number;
  /** Number of worker threads (0 = auto-detect) */
  workers: number;
  /** Enable keep-alive connections */
  keepAliveEnabled: boolean;
  /** Keep-alive timeout in seconds */
  keepAliveTimeoutSeconds: number;
  /** Maximum request body size in MB */
  maxBodySizeMb: number;
  /** Enable graceful shutdown */
  gracefulShutdownEnabled: boolean;
  /** Graceful shutdown timeout in seconds */
  gracefulShutdownTimeoutSeconds: number;
}

/**
 * Axum middleware configuration.
 */
export interface AxumMiddlewareConfig {
  /** Enable request tracing */
  tracingEnabled: boolean;
  /** Enable CORS middleware */
  corsEnabled: boolean;
  /** Enable compression middleware */
  compressionEnabled: boolean;
  /** Compression level (1-9) */
  compressionLevel: number;
  /** Enable request logging */
  loggingEnabled: boolean;
  /** Enable request ID middleware */
  requestIdEnabled: boolean;
}

// ============================================================================
// MAIN RUST/AXUM OPTIONS
// ============================================================================

/**
 * Main Rust/Axum configuration interface.
 * Contains all Rust-specific settings for code generation.
 */
export interface RustAxumOptions {
  /** Deployment preset */
  preset: RustPreset;
  /** Axum server configuration */
  server: AxumServerConfig;
  /** Axum middleware configuration */
  middleware: AxumMiddlewareConfig;
  /** Base edge configuration */
  edge: EdgeConfig;
  /** Edge gateway configuration (when preset is 'edge-gateway') */
  edgeGateway: EdgeGatewayConfig;
  /** Edge anomaly configuration (when preset is 'edge-anomaly') */
  edgeAnomaly: EdgeAnomalyConfig;
  /** Edge AI configuration (when preset is 'edge-ai') */
  edgeAi: EdgeAiConfig;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default Axum server configuration.
 */
export const defaultAxumServerConfig: AxumServerConfig = {
  host: '0.0.0.0',
  port: 3000,
  workers: 0,
  keepAliveEnabled: true,
  keepAliveTimeoutSeconds: 75,
  maxBodySizeMb: 10,
  gracefulShutdownEnabled: true,
  gracefulShutdownTimeoutSeconds: 30,
};

/**
 * Default Axum middleware configuration.
 */
export const defaultAxumMiddlewareConfig: AxumMiddlewareConfig = {
  tracingEnabled: true,
  corsEnabled: true,
  compressionEnabled: true,
  compressionLevel: 6,
  loggingEnabled: true,
  requestIdEnabled: true,
};

/**
 * Default edge configuration.
 */
export const defaultEdgeConfig: EdgeConfig = {
  maxMemoryMb: 0,
  maxConnections: 10000,
  compressionEnabled: true,
  connectionTimeoutMs: 5000,
  requestTimeoutMs: 30000,
  connectionPoolEnabled: true,
  connectionPoolSize: 100,
};

/**
 * Default edge gateway configuration.
 */
export const defaultEdgeGatewayConfig: EdgeGatewayConfig = {
  routingEnabled: true,
  loadBalancingEnabled: true,
  loadBalancingStrategy: 'round-robin',
  cachingEnabled: true,
  cacheTtlSeconds: 60,
  rateLimitingEnabled: true,
  rateLimitRps: 1000,
};

/**
 * Default edge anomaly configuration.
 */
export const defaultEdgeAnomalyConfig: EdgeAnomalyConfig = {
  streamingEnabled: true,
  bufferSizeKb: 64,
  alertsEnabled: true,
  alertThreshold: 0.8,
  windowSizeSeconds: 60,
  aggregationEnabled: true,
};

/**
 * Default edge AI configuration.
 */
export const defaultEdgeAiConfig: EdgeAiConfig = {
  modelServingEnabled: true,
  maxModelSizeMb: 100,
  modelCachingEnabled: true,
  inferenceThreads: 4,
  batchInferenceEnabled: false,
  maxBatchSize: 32,
  inferenceTimeoutMs: 5000,
};

// ============================================================================
// PRESET DEFAULTS
// ============================================================================

/**
 * Cloud preset defaults.
 * Full-featured configuration for standard cloud deployments.
 */
export const cloudPresetDefaults: RustAxumOptions = {
  preset: 'cloud',
  server: {
    ...defaultAxumServerConfig,
    workers: 0,
    maxBodySizeMb: 50,
  },
  middleware: {
    ...defaultAxumMiddlewareConfig,
  },
  edge: {
    ...defaultEdgeConfig,
    maxMemoryMb: 0,
    maxConnections: 50000,
  },
  edgeGateway: defaultEdgeGatewayConfig,
  edgeAnomaly: defaultEdgeAnomalyConfig,
  edgeAi: defaultEdgeAiConfig,
};

/**
 * Edge gateway preset defaults.
 * Optimized for low-latency API routing at the edge.
 */
export const edgeGatewayPresetDefaults: RustAxumOptions = {
  preset: 'edge-gateway',
  server: {
    ...defaultAxumServerConfig,
    workers: 2,
    keepAliveTimeoutSeconds: 30,
    maxBodySizeMb: 5,
  },
  middleware: {
    ...defaultAxumMiddlewareConfig,
    compressionLevel: 4,
  },
  edge: {
    ...defaultEdgeConfig,
    maxMemoryMb: 256,
    maxConnections: 5000,
    connectionTimeoutMs: 2000,
    requestTimeoutMs: 10000,
  },
  edgeGateway: {
    ...defaultEdgeGatewayConfig,
    cacheTtlSeconds: 30,
    rateLimitRps: 500,
  },
  edgeAnomaly: defaultEdgeAnomalyConfig,
  edgeAi: defaultEdgeAiConfig,
};

/**
 * Edge anomaly detection preset defaults.
 * Optimized for real-time streaming and anomaly detection.
 */
export const edgeAnomalyPresetDefaults: RustAxumOptions = {
  preset: 'edge-anomaly',
  server: {
    ...defaultAxumServerConfig,
    workers: 2,
    keepAliveTimeoutSeconds: 120,
    maxBodySizeMb: 2,
  },
  middleware: {
    ...defaultAxumMiddlewareConfig,
    compressionEnabled: false,
  },
  edge: {
    ...defaultEdgeConfig,
    maxMemoryMb: 512,
    maxConnections: 2000,
    connectionTimeoutMs: 1000,
    requestTimeoutMs: 5000,
  },
  edgeGateway: defaultEdgeGatewayConfig,
  edgeAnomaly: {
    ...defaultEdgeAnomalyConfig,
    bufferSizeKb: 128,
    windowSizeSeconds: 30,
  },
  edgeAi: defaultEdgeAiConfig,
};

/**
 * Edge AI inference preset defaults.
 * Optimized for machine learning model serving at the edge.
 */
export const edgeAiPresetDefaults: RustAxumOptions = {
  preset: 'edge-ai',
  server: {
    ...defaultAxumServerConfig,
    workers: 4,
    keepAliveTimeoutSeconds: 60,
    maxBodySizeMb: 20,
  },
  middleware: {
    ...defaultAxumMiddlewareConfig,
    compressionLevel: 3,
  },
  edge: {
    ...defaultEdgeConfig,
    maxMemoryMb: 1024,
    maxConnections: 1000,
    connectionTimeoutMs: 3000,
    requestTimeoutMs: 60000,
  },
  edgeGateway: defaultEdgeGatewayConfig,
  edgeAnomaly: defaultEdgeAnomalyConfig,
  edgeAi: {
    ...defaultEdgeAiConfig,
    maxModelSizeMb: 500,
    inferenceThreads: 4,
    batchInferenceEnabled: true,
    inferenceTimeoutMs: 30000,
  },
};

/**
 * Map of preset names to their default configurations.
 */
export const RUST_PRESET_DEFAULTS: Record<RustPreset, RustAxumOptions> = {
  cloud: cloudPresetDefaults,
  'edge-gateway': edgeGatewayPresetDefaults,
  'edge-anomaly': edgeAnomalyPresetDefaults,
  'edge-ai': edgeAiPresetDefaults,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get default configuration for a specific preset.
 *
 * @param preset - The Rust preset to get defaults for
 * @returns The default RustAxumOptions for the specified preset
 *
 * @example
 * const edgeConfig = getRustPresetDefaults('edge-gateway');
 * console.log(edgeConfig.edge.maxMemoryMb); // 256
 */
export function getRustPresetDefaults(preset: RustPreset): RustAxumOptions {
  return RUST_PRESET_DEFAULTS[preset];
}

/**
 * Default Rust/Axum options (cloud preset).
 */
export const defaultRustAxumOptions: RustAxumOptions = cloudPresetDefaults;
