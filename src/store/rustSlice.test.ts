import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  defaultRustAxumOptions,
  getRustPresetDefaults,
  RUST_PRESET_DEFAULTS,
  type RustPreset,
} from '../types';
import { useProjectStoreInternal } from './projectStore';

describe('Rust Store Slice', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetProject } = useProjectStoreInternal.getState();
    act(() => {
      resetProject();
    });
  });

  describe('initial state', () => {
    it('should have default rust options on initialization', () => {
      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions).toEqual(defaultRustAxumOptions);
    });

    it('should have cloud preset by default', () => {
      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.preset).toBe('cloud');
    });

    it('should have default server configuration', () => {
      const state = useProjectStoreInternal.getState();
      const { server } = state.project.rustOptions;

      expect(server.host).toBe('0.0.0.0');
      expect(server.port).toBe(3000);
      expect(server.workers).toBe(0);
      expect(server.keepAliveEnabled).toBe(true);
      expect(server.gracefulShutdownEnabled).toBe(true);
    });

    it('should have default middleware configuration', () => {
      const state = useProjectStoreInternal.getState();
      const { middleware } = state.project.rustOptions;

      expect(middleware.tracingEnabled).toBe(true);
      expect(middleware.corsEnabled).toBe(true);
      expect(middleware.compressionEnabled).toBe(true);
      expect(middleware.loggingEnabled).toBe(true);
      expect(middleware.requestIdEnabled).toBe(true);
    });
  });

  describe('updateRustOptions (setRustOptions)', () => {
    it('should update rust options partially', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();

      act(() => {
        setRustOptions({
          preset: 'edge-gateway',
        });
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.preset).toBe('edge-gateway');
      // Other options should remain unchanged
      expect(state.project.rustOptions.middleware).toEqual(defaultRustAxumOptions.middleware);
    });

    it('should update nested server configuration', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();

      act(() => {
        setRustOptions({
          server: {
            ...defaultRustAxumOptions.server,
            port: 8080,
            workers: 4,
          },
        });
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.server.port).toBe(8080);
      expect(state.project.rustOptions.server.workers).toBe(4);
      expect(state.project.rustOptions.server.host).toBe('0.0.0.0');
    });

    it('should update nested middleware configuration', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();

      act(() => {
        setRustOptions({
          middleware: {
            ...defaultRustAxumOptions.middleware,
            corsEnabled: false,
            compressionLevel: 9,
          },
        });
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.middleware.corsEnabled).toBe(false);
      expect(state.project.rustOptions.middleware.compressionLevel).toBe(9);
    });

    it('should update edge configuration', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();

      act(() => {
        setRustOptions({
          edge: {
            ...defaultRustAxumOptions.edge,
            maxMemoryMb: 512,
            maxConnections: 5000,
          },
        });
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.edge.maxMemoryMb).toBe(512);
      expect(state.project.rustOptions.edge.maxConnections).toBe(5000);
    });
  });

  describe('applyRustPreset', () => {
    it('should apply edge-gateway preset correctly', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();
      const edgeGatewayDefaults = getRustPresetDefaults('edge-gateway');

      act(() => {
        setRustOptions(edgeGatewayDefaults);
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.preset).toBe('edge-gateway');
      expect(state.project.rustOptions.server.workers).toBe(2);
      expect(state.project.rustOptions.edge.maxMemoryMb).toBe(256);
      expect(state.project.rustOptions.edge.maxConnections).toBe(5000);
    });

    it('should apply edge-anomaly preset correctly', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();
      const edgeAnomalyDefaults = getRustPresetDefaults('edge-anomaly');

      act(() => {
        setRustOptions(edgeAnomalyDefaults);
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.preset).toBe('edge-anomaly');
      expect(state.project.rustOptions.server.workers).toBe(2);
      expect(state.project.rustOptions.middleware.compressionEnabled).toBe(false);
      expect(state.project.rustOptions.edge.maxMemoryMb).toBe(512);
      expect(state.project.rustOptions.edgeAnomaly.bufferSizeKb).toBe(128);
    });

    it('should apply edge-ai preset correctly', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();
      const edgeAiDefaults = getRustPresetDefaults('edge-ai');

      act(() => {
        setRustOptions(edgeAiDefaults);
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.preset).toBe('edge-ai');
      expect(state.project.rustOptions.server.workers).toBe(4);
      expect(state.project.rustOptions.edge.maxMemoryMb).toBe(1024);
      expect(state.project.rustOptions.edgeAi.maxModelSizeMb).toBe(500);
      expect(state.project.rustOptions.edgeAi.batchInferenceEnabled).toBe(true);
    });

    it('should apply cloud preset correctly', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();
      // First change to a different preset
      const edgeGatewayDefaults = getRustPresetDefaults('edge-gateway');

      act(() => {
        setRustOptions(edgeGatewayDefaults);
      });

      // Then apply cloud preset
      const cloudDefaults = getRustPresetDefaults('cloud');

      act(() => {
        setRustOptions(cloudDefaults);
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.preset).toBe('cloud');
      expect(state.project.rustOptions.server.maxBodySizeMb).toBe(50);
      expect(state.project.rustOptions.edge.maxConnections).toBe(50000);
    });

    it('should have all presets defined in RUST_PRESET_DEFAULTS', () => {
      const presets: RustPreset[] = ['cloud', 'edge-gateway', 'edge-anomaly', 'edge-ai'];

      presets.forEach((preset) => {
        expect(RUST_PRESET_DEFAULTS[preset]).toBeDefined();
        expect(RUST_PRESET_DEFAULTS[preset].preset).toBe(preset);
      });
    });
  });

  describe('resetRustOptions', () => {
    it('should reset rust options to defaults after modification', () => {
      const { setRustOptions, resetProject } = useProjectStoreInternal.getState();

      // Modify options
      act(() => {
        setRustOptions({
          preset: 'edge-ai',
          server: {
            ...defaultRustAxumOptions.server,
            port: 9000,
          },
        });
      });

      // Verify modification
      let state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.preset).toBe('edge-ai');
      expect(state.project.rustOptions.server.port).toBe(9000);

      // Reset project (which resets all options including rust)
      act(() => {
        resetProject();
      });

      // Verify reset
      state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions).toEqual(defaultRustAxumOptions);
      expect(state.project.rustOptions.preset).toBe('cloud');
      expect(state.project.rustOptions.server.port).toBe(3000);
    });

    it('should reset to defaults after applying preset', () => {
      const { setRustOptions, resetProject } = useProjectStoreInternal.getState();

      // Apply a preset
      act(() => {
        setRustOptions(getRustPresetDefaults('edge-gateway'));
      });

      expect(useProjectStoreInternal.getState().project.rustOptions.preset).toBe('edge-gateway');

      // Reset
      act(() => {
        resetProject();
      });

      expect(useProjectStoreInternal.getState().project.rustOptions.preset).toBe('cloud');
    });
  });

  describe('validateRustOptions', () => {
    it('should have valid default options', () => {
      const state = useProjectStoreInternal.getState();
      const options = state.project.rustOptions;

      // Validate server config
      expect(options.server.port).toBeGreaterThan(0);
      expect(options.server.port).toBeLessThanOrEqual(65535);
      expect(options.server.workers).toBeGreaterThanOrEqual(0);
      expect(options.server.maxBodySizeMb).toBeGreaterThan(0);

      // Validate middleware config
      expect(options.middleware.compressionLevel).toBeGreaterThanOrEqual(1);
      expect(options.middleware.compressionLevel).toBeLessThanOrEqual(9);

      // Validate edge config
      expect(options.edge.maxConnections).toBeGreaterThan(0);
      expect(options.edge.connectionTimeoutMs).toBeGreaterThan(0);
      expect(options.edge.requestTimeoutMs).toBeGreaterThan(0);
    });

    it('should validate edge-gateway preset options', () => {
      const options = getRustPresetDefaults('edge-gateway');

      expect(options.edge.maxMemoryMb).toBeGreaterThan(0);
      expect(options.edgeGateway.rateLimitRps).toBeGreaterThan(0);
      expect(options.edgeGateway.cacheTtlSeconds).toBeGreaterThan(0);
    });

    it('should validate edge-anomaly preset options', () => {
      const options = getRustPresetDefaults('edge-anomaly');

      expect(options.edgeAnomaly.alertThreshold).toBeGreaterThanOrEqual(0);
      expect(options.edgeAnomaly.alertThreshold).toBeLessThanOrEqual(1);
      expect(options.edgeAnomaly.windowSizeSeconds).toBeGreaterThan(0);
      expect(options.edgeAnomaly.bufferSizeKb).toBeGreaterThan(0);
    });

    it('should validate edge-ai preset options', () => {
      const options = getRustPresetDefaults('edge-ai');

      expect(options.edgeAi.maxModelSizeMb).toBeGreaterThan(0);
      expect(options.edgeAi.inferenceThreads).toBeGreaterThan(0);
      expect(options.edgeAi.maxBatchSize).toBeGreaterThan(0);
      expect(options.edgeAi.inferenceTimeoutMs).toBeGreaterThan(0);
    });

    it('should ensure timeouts are positive across all presets', () => {
      const presets: RustPreset[] = ['cloud', 'edge-gateway', 'edge-anomaly', 'edge-ai'];

      presets.forEach((preset) => {
        const options = getRustPresetDefaults(preset);
        expect(options.server.keepAliveTimeoutSeconds).toBeGreaterThan(0);
        expect(options.server.gracefulShutdownTimeoutSeconds).toBeGreaterThan(0);
        expect(options.edge.connectionTimeoutMs).toBeGreaterThan(0);
        expect(options.edge.requestTimeoutMs).toBeGreaterThan(0);
      });
    });
  });

  describe('edge configurations', () => {
    it('should update edgeGateway configuration', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();

      act(() => {
        setRustOptions({
          edgeGateway: {
            ...defaultRustAxumOptions.edgeGateway,
            loadBalancingStrategy: 'least-connections',
            rateLimitRps: 2000,
          },
        });
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.edgeGateway.loadBalancingStrategy).toBe('least-connections');
      expect(state.project.rustOptions.edgeGateway.rateLimitRps).toBe(2000);
    });

    it('should update edgeAnomaly configuration', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();

      act(() => {
        setRustOptions({
          edgeAnomaly: {
            ...defaultRustAxumOptions.edgeAnomaly,
            alertThreshold: 0.95,
            streamingEnabled: false,
          },
        });
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.edgeAnomaly.alertThreshold).toBe(0.95);
      expect(state.project.rustOptions.edgeAnomaly.streamingEnabled).toBe(false);
    });

    it('should update edgeAi configuration', () => {
      const { setRustOptions } = useProjectStoreInternal.getState();

      act(() => {
        setRustOptions({
          edgeAi: {
            ...defaultRustAxumOptions.edgeAi,
            inferenceThreads: 8,
            batchInferenceEnabled: true,
          },
        });
      });

      const state = useProjectStoreInternal.getState();
      expect(state.project.rustOptions.edgeAi.inferenceThreads).toBe(8);
      expect(state.project.rustOptions.edgeAi.batchInferenceEnabled).toBe(true);
    });
  });
});
