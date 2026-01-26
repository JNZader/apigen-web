import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStoreInternal } from '../../store/projectStore';
import { resetAllStores, TestProviders } from '../../test/utils';
import { cloudPresetDefaults, defaultProjectConfig, edgeGatewayPresetDefaults } from '../../types';
import { RustOptionsPanel } from './RustOptionsPanel';

describe('RustOptionsPanel', () => {
  beforeEach(() => {
    resetAllStores();
  });

  describe('Rendering', () => {
    it('renders all accordion sections', () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.getByText('Server Configuration')).toBeInTheDocument();
      expect(screen.getByText('Middleware')).toBeInTheDocument();
      expect(screen.getByText('Edge Configuration')).toBeInTheDocument();
      expect(screen.getByText('Observability')).toBeInTheDocument();
    });

    it('displays cloud preset badge for cloud preset', () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.getByText('cloud preset')).toBeInTheDocument();
    });

    it('displays edge preset badge for edge-gateway preset', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.getByText('edge-gateway preset')).toBeInTheDocument();
    });

    it('shows edge preset alert for non-cloud presets', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.getByTestId('edge-preset-alert')).toBeInTheDocument();
      expect(screen.getByText(/Edge presets have resource constraints/)).toBeInTheDocument();
    });

    it('does not show edge alert for cloud preset', () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.queryByTestId('edge-preset-alert')).not.toBeInTheDocument();
    });

    it('shows dependencies preview', () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.getByText('Dependencies Preview')).toBeInTheDocument();
      const depsPreview = screen.getByTestId('deps-preview');
      expect(depsPreview).toHaveTextContent('axum, tokio, serde');
    });
  });

  describe('Server Configuration Section', () => {
    it('shows server options in expanded accordion', async () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      // Server section is default expanded
      expect(screen.getByTestId('server-port-input')).toBeInTheDocument();
      expect(screen.getByTestId('server-workers-input')).toBeInTheDocument();
      expect(screen.getByTestId('server-keepalive-switch')).toBeInTheDocument();
    });

    it('updates server port', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      // Mantine NumberInput places data-testid directly on the input element
      const portInput = screen.getByTestId('server-port-input');
      expect(portInput).toBeInTheDocument();

      await user.clear(portInput);
      await user.type(portInput, '8080');

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.rustOptions.server.port).toBe(8080);
      });
    });

    it('shows keep-alive timeout when keep-alive is enabled', () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      // Keep-alive is enabled by default
      expect(screen.getByTestId('server-keepalive-timeout-input')).toBeInTheDocument();
    });

    it('hides keep-alive timeout when keep-alive is disabled', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: {
            ...cloudPresetDefaults,
            server: {
              ...cloudPresetDefaults.server,
              keepAliveEnabled: false,
            },
          },
        },
      });

      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.queryByTestId('server-keepalive-timeout-input')).not.toBeInTheDocument();
    });
  });

  describe('Middleware Section', () => {
    it('shows middleware options when expanded', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Middleware'));

      await waitFor(() => {
        expect(screen.getByTestId('middleware-cors-switch')).toBeInTheDocument();
        expect(screen.getByTestId('middleware-compression-switch')).toBeInTheDocument();
        expect(screen.getByTestId('middleware-logging-switch')).toBeInTheDocument();
      });
    });

    it('toggles CORS setting', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Middleware'));

      const corsSwitch = screen.getByTestId('middleware-cors-switch');
      await user.click(corsSwitch);

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.rustOptions.middleware.corsEnabled).toBe(false);
      });
    });

    it('shows compression level when compression is enabled', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Middleware'));

      await waitFor(() => {
        // Compression is enabled by default
        expect(screen.getByTestId('middleware-compression-level-input')).toBeInTheDocument();
      });
    });

    it('hides compression level when compression is disabled', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: {
            ...cloudPresetDefaults,
            middleware: {
              ...cloudPresetDefaults.middleware,
              compressionEnabled: false,
            },
          },
        },
      });

      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Middleware'));

      await waitFor(() => {
        expect(screen.queryByTestId('middleware-compression-level-input')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Configuration Section', () => {
    it('shows edge options when expanded', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Edge Configuration'));

      await waitFor(() => {
        expect(screen.getByTestId('edge-max-memory-input')).toBeInTheDocument();
        expect(screen.getByTestId('edge-max-connections-input')).toBeInTheDocument();
        expect(screen.getByTestId('edge-pool-enabled-switch')).toBeInTheDocument();
      });
    });

    it('shows pool size when connection pooling is enabled', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Edge Configuration'));

      await waitFor(() => {
        // Connection pooling is enabled by default
        expect(screen.getByTestId('edge-pool-size-input')).toBeInTheDocument();
      });
    });

    it('hides pool size when connection pooling is disabled', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: {
            ...cloudPresetDefaults,
            edge: {
              ...cloudPresetDefaults.edge,
              connectionPoolEnabled: false,
            },
          },
        },
      });

      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Edge Configuration'));

      await waitFor(() => {
        expect(screen.queryByTestId('edge-pool-size-input')).not.toBeInTheDocument();
      });
    });

    it('updates max connections value', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Edge Configuration'));

      await waitFor(() => {
        expect(screen.getByTestId('edge-max-connections-input')).toBeInTheDocument();
      });

      // Mantine NumberInput places data-testid directly on the input element
      const maxConnInput = screen.getByTestId('edge-max-connections-input');

      // Use Ctrl+A to select all content before typing (user.clear and tripleClick don't work reliably with Mantine NumberInput)
      await user.click(maxConnInput);
      await user.keyboard('{Control>}a{/Control}5000');

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.rustOptions.edge.maxConnections).toBe(5000);
      });
    });
  });

  describe('Edge Gateway Section', () => {
    it('does not show gateway section for cloud preset', () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.queryByText('Gateway Configuration')).not.toBeInTheDocument();
    });

    it('shows gateway section for edge-gateway preset', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      expect(screen.getByText('Gateway Configuration')).toBeInTheDocument();
    });

    it('shows gateway options when expanded', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Gateway Configuration'));

      await waitFor(() => {
        expect(screen.getByTestId('gateway-routing-switch')).toBeInTheDocument();
        expect(screen.getByTestId('gateway-load-balancing-switch')).toBeInTheDocument();
        expect(screen.getByTestId('gateway-caching-switch')).toBeInTheDocument();
        expect(screen.getByTestId('gateway-rate-limiting-switch')).toBeInTheDocument();
      });
    });

    it('shows load balancing strategy when load balancing is enabled', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Gateway Configuration'));

      await waitFor(() => {
        // Load balancing is enabled by default in edge-gateway preset
        expect(screen.getByTestId('gateway-load-balancing-strategy-select')).toBeInTheDocument();
      });
    });

    it('shows cache TTL when caching is enabled', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Gateway Configuration'));

      await waitFor(() => {
        // Caching is enabled by default in edge-gateway preset
        expect(screen.getByTestId('gateway-cache-ttl-input')).toBeInTheDocument();
      });
    });

    it('shows rate limit input when rate limiting is enabled', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Gateway Configuration'));

      await waitFor(() => {
        // Rate limiting is enabled by default in edge-gateway preset
        expect(screen.getByTestId('gateway-rate-limit-input')).toBeInTheDocument();
      });
    });

    it('toggles gateway caching', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Gateway Configuration'));

      await waitFor(() => {
        expect(screen.getByTestId('gateway-caching-switch')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('gateway-caching-switch'));

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.rustOptions.edgeGateway.cachingEnabled).toBe(false);
      });
    });
  });

  describe('Observability Section', () => {
    it('shows observability options when expanded', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Observability'));

      await waitFor(() => {
        expect(screen.getByTestId('observability-tracing-switch')).toBeInTheDocument();
      });
    });

    it('toggles tracing setting', async () => {
      const user = userEvent.setup();
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      await user.click(screen.getByText('Observability'));

      await waitFor(() => {
        expect(screen.getByTestId('observability-tracing-switch')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('observability-tracing-switch'));

      await waitFor(() => {
        const state = useProjectStoreInternal.getState();
        expect(state.project.rustOptions.middleware.tracingEnabled).toBe(false);
      });
    });

    it('updates dependencies preview when tracing is disabled', async () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: {
            ...cloudPresetDefaults,
            middleware: {
              ...cloudPresetDefaults.middleware,
              tracingEnabled: false,
              compressionEnabled: false,
            },
          },
        },
      });

      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      const depsPreview = screen.getByTestId('deps-preview');
      expect(depsPreview).not.toHaveTextContent('tracing');
      expect(depsPreview).not.toHaveTextContent('tower-http');
    });

    it('shows tracing and tower-http in dependencies when enabled', () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      const depsPreview = screen.getByTestId('deps-preview');
      // Both tracing and compression are enabled by default
      expect(depsPreview).toHaveTextContent('tracing');
      expect(depsPreview).toHaveTextContent('tower-http');
    });
  });

  describe('Dependencies Preview', () => {
    it('shows tower for edge presets', () => {
      useProjectStoreInternal.setState({
        project: {
          ...defaultProjectConfig,
          rustOptions: edgeGatewayPresetDefaults,
        },
      });

      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      const depsPreview = screen.getByTestId('deps-preview');
      expect(depsPreview).toHaveTextContent('tower');
    });

    it('does not show tower for cloud preset', () => {
      render(
        <TestProviders>
          <RustOptionsPanel />
        </TestProviders>,
      );

      const depsPreview = screen.getByTestId('deps-preview');
      // Cloud preset doesn't add tower specifically (tower-http is different)
      const content = depsPreview.textContent || '';
      // Only check that it doesn't end with ", tower" which is the edge-specific dependency
      expect(content.endsWith(', tower')).toBe(false);
    });
  });
});
