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

function validateRustOptions(options: RustAxumOptions): RustValidationResult {
  const errors: RustValidationError[] = [];

  // Server validation
  if (options.server.port < 1 || options.server.port > 65535) {
    errors.push({
      field: 'server.port',
      message: 'Port must be between 1 and 65535',
    });
  }

  if (options.server.workers < 0) {
    errors.push({
      field: 'server.workers',
      message: 'Workers must be 0 or greater (0 = auto-detect)',
    });
  }

  if (options.server.maxBodySizeMb < 1) {
    errors.push({
      field: 'server.maxBodySizeMb',
      message: 'Max body size must be at least 1 MB',
    });
  }

  if (options.server.keepAliveTimeoutSeconds < 1) {
    errors.push({
      field: 'server.keepAliveTimeoutSeconds',
      message: 'Keep-alive timeout must be at least 1 second',
    });
  }

  if (options.server.gracefulShutdownTimeoutSeconds < 1) {
    errors.push({
      field: 'server.gracefulShutdownTimeoutSeconds',
      message: 'Graceful shutdown timeout must be at least 1 second',
    });
  }

  // Middleware validation
  if (options.middleware.compressionLevel < 1 || options.middleware.compressionLevel > 9) {
    errors.push({
      field: 'middleware.compressionLevel',
      message: 'Compression level must be between 1 and 9',
    });
  }

  // Edge validation
  if (options.edge.maxMemoryMb < 0) {
    errors.push({
      field: 'edge.maxMemoryMb',
      message: 'Max memory must be 0 or greater (0 = unlimited)',
    });
  }

  if (options.edge.maxConnections < 1) {
    errors.push({
      field: 'edge.maxConnections',
      message: 'Max connections must be at least 1',
    });
  }

  if (options.edge.connectionTimeoutMs < 100) {
    errors.push({
      field: 'edge.connectionTimeoutMs',
      message: 'Connection timeout must be at least 100ms',
    });
  }

  if (options.edge.requestTimeoutMs < 100) {
    errors.push({
      field: 'edge.requestTimeoutMs',
      message: 'Request timeout must be at least 100ms',
    });
  }

  if (options.edge.connectionPoolSize < 1) {
    errors.push({
      field: 'edge.connectionPoolSize',
      message: 'Connection pool size must be at least 1',
    });
  }

  // Edge Gateway validation (when preset is edge-gateway)
  if (options.preset === 'edge-gateway') {
    if (options.edgeGateway.cacheTtlSeconds < 0) {
      errors.push({
        field: 'edgeGateway.cacheTtlSeconds',
        message: 'Cache TTL must be 0 or greater',
      });
    }

    if (options.edgeGateway.rateLimitRps < 1) {
      errors.push({
        field: 'edgeGateway.rateLimitRps',
        message: 'Rate limit must be at least 1 request per second',
      });
    }
  }

  // Edge Anomaly validation (when preset is edge-anomaly)
  if (options.preset === 'edge-anomaly') {
    if (options.edgeAnomaly.bufferSizeKb < 1) {
      errors.push({
        field: 'edgeAnomaly.bufferSizeKb',
        message: 'Buffer size must be at least 1 KB',
      });
    }

    if (options.edgeAnomaly.alertThreshold < 0 || options.edgeAnomaly.alertThreshold > 1) {
      errors.push({
        field: 'edgeAnomaly.alertThreshold',
        message: 'Alert threshold must be between 0.0 and 1.0',
      });
    }

    if (options.edgeAnomaly.windowSizeSeconds < 1) {
      errors.push({
        field: 'edgeAnomaly.windowSizeSeconds',
        message: 'Window size must be at least 1 second',
      });
    }
  }

  // Edge AI validation (when preset is edge-ai)
  if (options.preset === 'edge-ai') {
    if (options.edgeAi.maxModelSizeMb < 1) {
      errors.push({
        field: 'edgeAi.maxModelSizeMb',
        message: 'Max model size must be at least 1 MB',
      });
    }

    if (options.edgeAi.inferenceThreads < 1) {
      errors.push({
        field: 'edgeAi.inferenceThreads',
        message: 'Inference threads must be at least 1',
      });
    }

    if (options.edgeAi.maxBatchSize < 1) {
      errors.push({
        field: 'edgeAi.maxBatchSize',
        message: 'Max batch size must be at least 1',
      });
    }

    if (options.edgeAi.inferenceTimeoutMs < 100) {
      errors.push({
        field: 'edgeAi.inferenceTimeoutMs',
        message: 'Inference timeout must be at least 100ms',
      });
    }
  }

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
