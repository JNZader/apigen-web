import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import {
  type AxumMiddlewareConfig,
  type AxumServerConfig,
  defaultRustAxumOptions,
  type EdgeAiConfig,
  type EdgeAnomalyConfig,
  type EdgeConfig,
  type EdgeGatewayConfig,
  getRustPresetDefaults,
  type RustAxumOptions,
  type RustPreset,
} from '@/types';

// ============================================================================
// Validation Types
// ============================================================================

interface RustValidationError {
  readonly field: string;
  readonly message: string;
}

interface RustValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly RustValidationError[];
}

// ============================================================================
// Store Interface
// ============================================================================

interface RustSliceState {
  // State
  options: RustAxumOptions;

  // Actions
  setOptions: (options: Partial<RustAxumOptions>) => void;
  setPreset: (preset: RustPreset) => void;
  applyPreset: (preset: RustPreset) => void;
  setServer: (config: Partial<AxumServerConfig>) => void;
  setMiddleware: (config: Partial<AxumMiddlewareConfig>) => void;
  setEdge: (config: Partial<EdgeConfig>) => void;
  setEdgeGateway: (config: Partial<EdgeGatewayConfig>) => void;
  setEdgeAnomaly: (config: Partial<EdgeAnomalyConfig>) => void;
  setEdgeAi: (config: Partial<EdgeAiConfig>) => void;
  reset: () => void;

  // Validation
  validate: () => RustValidationResult;
}

// ============================================================================
// Validation Logic
// ============================================================================

// Validation rule type for declarative validation
interface ValidationRule {
  field: string;
  isValid: boolean;
  message: string;
}

// Helper: Validate server options
function validateServerOptions(server: AxumServerConfig): RustValidationError[] {
  const rules: ValidationRule[] = [
    {
      field: 'server.port',
      isValid: server.port >= 1 && server.port <= 65535,
      message: 'Port must be between 1 and 65535',
    },
    {
      field: 'server.workers',
      isValid: server.workers >= 0,
      message: 'Workers must be 0 or greater (0 = auto-detect)',
    },
    {
      field: 'server.maxBodySizeMb',
      isValid: server.maxBodySizeMb >= 1,
      message: 'Max body size must be at least 1 MB',
    },
    {
      field: 'server.keepAliveTimeoutSeconds',
      isValid: server.keepAliveTimeoutSeconds >= 1,
      message: 'Keep-alive timeout must be at least 1 second',
    },
    {
      field: 'server.gracefulShutdownTimeoutSeconds',
      isValid: server.gracefulShutdownTimeoutSeconds >= 1,
      message: 'Graceful shutdown timeout must be at least 1 second',
    },
  ];
  return rules.filter((r) => !r.isValid).map(({ field, message }) => ({ field, message }));
}

// Helper: Validate middleware options
function validateMiddlewareOptions(middleware: AxumMiddlewareConfig): RustValidationError[] {
  const rules: ValidationRule[] = [
    {
      field: 'middleware.compressionLevel',
      isValid: middleware.compressionLevel >= 1 && middleware.compressionLevel <= 9,
      message: 'Compression level must be between 1 and 9',
    },
  ];
  return rules.filter((r) => !r.isValid).map(({ field, message }) => ({ field, message }));
}

// Helper: Validate edge options
function validateEdgeOptions(edge: EdgeConfig): RustValidationError[] {
  const rules: ValidationRule[] = [
    {
      field: 'edge.maxMemoryMb',
      isValid: edge.maxMemoryMb >= 0,
      message: 'Max memory must be 0 or greater (0 = unlimited)',
    },
    {
      field: 'edge.maxConnections',
      isValid: edge.maxConnections >= 1,
      message: 'Max connections must be at least 1',
    },
    {
      field: 'edge.connectionTimeoutMs',
      isValid: edge.connectionTimeoutMs >= 100,
      message: 'Connection timeout must be at least 100ms',
    },
    {
      field: 'edge.requestTimeoutMs',
      isValid: edge.requestTimeoutMs >= 100,
      message: 'Request timeout must be at least 100ms',
    },
    {
      field: 'edge.connectionPoolSize',
      isValid: edge.connectionPoolSize >= 1,
      message: 'Connection pool size must be at least 1',
    },
  ];
  return rules.filter((r) => !r.isValid).map(({ field, message }) => ({ field, message }));
}

// Helper: Validate edge gateway options
function validateEdgeGatewayOptions(edgeGateway: EdgeGatewayConfig): RustValidationError[] {
  const rules: ValidationRule[] = [
    {
      field: 'edgeGateway.cacheTtlSeconds',
      isValid: edgeGateway.cacheTtlSeconds >= 0,
      message: 'Cache TTL must be 0 or greater',
    },
    {
      field: 'edgeGateway.rateLimitRps',
      isValid: edgeGateway.rateLimitRps >= 1,
      message: 'Rate limit must be at least 1 request per second',
    },
  ];
  return rules.filter((r) => !r.isValid).map(({ field, message }) => ({ field, message }));
}

// Helper: Validate edge anomaly options
function validateEdgeAnomalyOptions(edgeAnomaly: EdgeAnomalyConfig): RustValidationError[] {
  const rules: ValidationRule[] = [
    {
      field: 'edgeAnomaly.bufferSizeKb',
      isValid: edgeAnomaly.bufferSizeKb >= 1,
      message: 'Buffer size must be at least 1 KB',
    },
    {
      field: 'edgeAnomaly.alertThreshold',
      isValid: edgeAnomaly.alertThreshold >= 0 && edgeAnomaly.alertThreshold <= 1,
      message: 'Alert threshold must be between 0.0 and 1.0',
    },
    {
      field: 'edgeAnomaly.windowSizeSeconds',
      isValid: edgeAnomaly.windowSizeSeconds >= 1,
      message: 'Window size must be at least 1 second',
    },
  ];
  return rules.filter((r) => !r.isValid).map(({ field, message }) => ({ field, message }));
}

// Helper: Validate edge AI options
function validateEdgeAiOptions(edgeAi: EdgeAiConfig): RustValidationError[] {
  const rules: ValidationRule[] = [
    {
      field: 'edgeAi.maxModelSizeMb',
      isValid: edgeAi.maxModelSizeMb >= 1,
      message: 'Max model size must be at least 1 MB',
    },
    {
      field: 'edgeAi.inferenceThreads',
      isValid: edgeAi.inferenceThreads >= 1,
      message: 'Inference threads must be at least 1',
    },
    {
      field: 'edgeAi.maxBatchSize',
      isValid: edgeAi.maxBatchSize >= 1,
      message: 'Max batch size must be at least 1',
    },
    {
      field: 'edgeAi.inferenceTimeoutMs',
      isValid: edgeAi.inferenceTimeoutMs >= 100,
      message: 'Inference timeout must be at least 100ms',
    },
  ];
  return rules.filter((r) => !r.isValid).map(({ field, message }) => ({ field, message }));
}

function validateRustOptions(options: RustAxumOptions): RustValidationResult {
  const errors: RustValidationError[] = [
    ...validateServerOptions(options.server),
    ...validateMiddlewareOptions(options.middleware),
    ...validateEdgeOptions(options.edge),
    ...(options.preset === 'edge-gateway' ? validateEdgeGatewayOptions(options.edgeGateway) : []),
    ...(options.preset === 'edge-anomaly' ? validateEdgeAnomalyOptions(options.edgeAnomaly) : []),
    ...(options.preset === 'edge-ai' ? validateEdgeAiOptions(options.edgeAi) : []),
  ];

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Store
// ============================================================================

export const useRustStore = create<RustSliceState>()(
  persist(
    (set, get) => ({
      // Initial state
      options: defaultRustAxumOptions,

      // Actions
      setOptions: (updates) =>
        set((state) => ({
          options: { ...state.options, ...updates },
        })),

      setPreset: (preset) =>
        set((state) => ({
          options: { ...state.options, preset },
        })),

      applyPreset: (preset) =>
        set(() => ({
          options: getRustPresetDefaults(preset),
        })),

      setServer: (config) =>
        set((state) => ({
          options: {
            ...state.options,
            server: { ...state.options.server, ...config },
          },
        })),

      setMiddleware: (config) =>
        set((state) => ({
          options: {
            ...state.options,
            middleware: { ...state.options.middleware, ...config },
          },
        })),

      setEdge: (config) =>
        set((state) => ({
          options: {
            ...state.options,
            edge: { ...state.options.edge, ...config },
          },
        })),

      setEdgeGateway: (config) =>
        set((state) => ({
          options: {
            ...state.options,
            edgeGateway: { ...state.options.edgeGateway, ...config },
          },
        })),

      setEdgeAnomaly: (config) =>
        set((state) => ({
          options: {
            ...state.options,
            edgeAnomaly: { ...state.options.edgeAnomaly, ...config },
          },
        })),

      setEdgeAi: (config) =>
        set((state) => ({
          options: {
            ...state.options,
            edgeAi: { ...state.options.edgeAi, ...config },
          },
        })),

      reset: () =>
        set(() => ({
          options: defaultRustAxumOptions,
        })),

      // Validation
      validate: () => validateRustOptions(get().options),
    }),
    {
      name: 'apigen-rust',
    },
  ),
);

// ============================================================================
// Atomic Selectors
// ============================================================================

export const useRustOptions = () => useRustStore((state) => state.options);
export const useRustPreset = () => useRustStore((state) => state.options.preset);
export const useRustServer = () => useRustStore((state) => state.options.server);
export const useRustMiddleware = () => useRustStore((state) => state.options.middleware);
export const useRustEdge = () => useRustStore((state) => state.options.edge);
export const useRustEdgeGateway = () => useRustStore((state) => state.options.edgeGateway);
export const useRustEdgeAnomaly = () => useRustStore((state) => state.options.edgeAnomaly);
export const useRustEdgeAi = () => useRustStore((state) => state.options.edgeAi);

// ============================================================================
// Action Selectors
// ============================================================================

export const useRustActions = () =>
  useRustStore(
    useShallow((state) => ({
      setOptions: state.setOptions,
      setPreset: state.setPreset,
      applyPreset: state.applyPreset,
      setServer: state.setServer,
      setMiddleware: state.setMiddleware,
      setEdge: state.setEdge,
      setEdgeGateway: state.setEdgeGateway,
      setEdgeAnomaly: state.setEdgeAnomaly,
      setEdgeAi: state.setEdgeAi,
      reset: state.reset,
      validate: state.validate,
    })),
  );

// ============================================================================
// Validation Selector
// ============================================================================

export const useRustValidation = () => {
  const options = useRustStore((state) => state.options);
  return validateRustOptions(options);
};

// ============================================================================
// Type Exports
// ============================================================================

export type { RustValidationError, RustValidationResult };
