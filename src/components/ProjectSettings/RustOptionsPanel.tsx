import {
  Accordion,
  Alert,
  Badge,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import {
  IconChartBar,
  IconClock,
  IconDatabase,
  IconInfoCircle,
  IconServer,
  IconShield,
} from '@tabler/icons-react';
import { memo, useCallback } from 'react';
import { useRustOptions } from '../../store';
import { useProjectStoreInternal } from '../../store/projectStore';
import type {
  AxumMiddlewareConfig,
  AxumServerConfig,
  EdgeConfig,
  RustAxumOptions,
} from '../../types';

const LOAD_BALANCING_STRATEGIES = [
  { value: 'round-robin', label: 'Round Robin' },
  { value: 'least-connections', label: 'Least Connections' },
  { value: 'ip-hash', label: 'IP Hash' },
];

export const RustOptionsPanel = memo(function RustOptionsPanel() {
  const rustOptions = useRustOptions();
  const setRustOptions = useProjectStoreInternal((s) => s.setRustOptions);

  const handleServerChange = useCallback(
    <K extends keyof AxumServerConfig>(key: K, value: AxumServerConfig[K]) => {
      setRustOptions({
        server: { ...rustOptions.server, [key]: value },
      });
    },
    [setRustOptions, rustOptions.server],
  );

  const handleMiddlewareChange = useCallback(
    <K extends keyof AxumMiddlewareConfig>(key: K, value: AxumMiddlewareConfig[K]) => {
      setRustOptions({
        middleware: { ...rustOptions.middleware, [key]: value },
      });
    },
    [setRustOptions, rustOptions.middleware],
  );

  const handleEdgeChange = useCallback(
    <K extends keyof EdgeConfig>(key: K, value: EdgeConfig[K]) => {
      setRustOptions({
        edge: { ...rustOptions.edge, [key]: value },
      });
    },
    [setRustOptions, rustOptions.edge],
  );

  const handleEdgeGatewayChange = useCallback(
    <K extends keyof RustAxumOptions['edgeGateway']>(
      key: K,
      value: RustAxumOptions['edgeGateway'][K],
    ) => {
      setRustOptions({
        edgeGateway: { ...rustOptions.edgeGateway, [key]: value },
      });
    },
    [setRustOptions, rustOptions.edgeGateway],
  );

  const isEdgePreset = rustOptions.preset !== 'cloud';
  const isEdgeGateway = rustOptions.preset === 'edge-gateway';

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">
          Rust/Axum Options
        </Text>
        <Badge variant="light" color={isEdgePreset ? 'orange' : 'blue'}>
          {rustOptions.preset} preset
        </Badge>
      </Group>

      {isEdgePreset && (
        <Alert icon={<IconInfoCircle size={16} />} color="yellow" data-testid="edge-preset-alert">
          Edge presets have resource constraints optimized for edge deployment. Some options are
          pre-configured.
        </Alert>
      )}

      <Accordion variant="separated" defaultValue="server">
        {/* Server Configuration */}
        <Accordion.Item value="server">
          <Accordion.Control icon={<IconServer size={20} />}>
            Server Configuration
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <NumberInput
                label="Port"
                description="Server port number"
                value={rustOptions.server.port}
                onChange={(val) => handleServerChange('port', Number(val) || 3000)}
                min={1}
                max={65535}
                data-testid="server-port-input"
              />

              <NumberInput
                label="Worker Threads"
                description="Number of worker threads (0 = auto-detect)"
                value={rustOptions.server.workers}
                onChange={(val) => handleServerChange('workers', Number(val) || 0)}
                min={0}
                max={32}
                data-testid="server-workers-input"
              />

              <NumberInput
                label="Max Body Size (MB)"
                description="Maximum request body size"
                value={rustOptions.server.maxBodySizeMb}
                onChange={(val) => handleServerChange('maxBodySizeMb', Number(val) || 10)}
                min={1}
                max={1000}
                data-testid="server-max-body-input"
              />

              <Switch
                label="Keep-Alive Connections"
                description="Enable HTTP keep-alive"
                checked={rustOptions.server.keepAliveEnabled}
                onChange={(e) => handleServerChange('keepAliveEnabled', e.currentTarget.checked)}
                data-testid="server-keepalive-switch"
              />

              {rustOptions.server.keepAliveEnabled && (
                <NumberInput
                  label="Keep-Alive Timeout (seconds)"
                  description="Connection timeout for keep-alive"
                  value={rustOptions.server.keepAliveTimeoutSeconds}
                  onChange={(val) =>
                    handleServerChange('keepAliveTimeoutSeconds', Number(val) || 75)
                  }
                  min={1}
                  max={3600}
                  data-testid="server-keepalive-timeout-input"
                />
              )}

              <Switch
                label="Graceful Shutdown"
                description="Enable graceful shutdown handling"
                checked={rustOptions.server.gracefulShutdownEnabled}
                onChange={(e) =>
                  handleServerChange('gracefulShutdownEnabled', e.currentTarget.checked)
                }
                data-testid="server-graceful-shutdown-switch"
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Middleware Configuration */}
        <Accordion.Item value="middleware">
          <Accordion.Control icon={<IconShield size={20} />}>Middleware</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Switch
                label="Enable CORS"
                description="Cross-Origin Resource Sharing support"
                checked={rustOptions.middleware.corsEnabled}
                onChange={(e) => handleMiddlewareChange('corsEnabled', e.currentTarget.checked)}
                data-testid="middleware-cors-switch"
              />

              <Switch
                label="Enable Compression"
                description="Gzip/Brotli response compression"
                checked={rustOptions.middleware.compressionEnabled}
                onChange={(e) =>
                  handleMiddlewareChange('compressionEnabled', e.currentTarget.checked)
                }
                data-testid="middleware-compression-switch"
              />

              {rustOptions.middleware.compressionEnabled && (
                <NumberInput
                  label="Compression Level"
                  description="Compression level (1-9)"
                  value={rustOptions.middleware.compressionLevel}
                  onChange={(val) => handleMiddlewareChange('compressionLevel', Number(val) || 6)}
                  min={1}
                  max={9}
                  data-testid="middleware-compression-level-input"
                />
              )}

              <Switch
                label="Enable Request Logging"
                description="Log all HTTP requests"
                checked={rustOptions.middleware.loggingEnabled}
                onChange={(e) => handleMiddlewareChange('loggingEnabled', e.currentTarget.checked)}
                data-testid="middleware-logging-switch"
              />

              <Switch
                label="Request ID Header"
                description="Add X-Request-Id header to responses"
                checked={rustOptions.middleware.requestIdEnabled}
                onChange={(e) =>
                  handleMiddlewareChange('requestIdEnabled', e.currentTarget.checked)
                }
                data-testid="middleware-request-id-switch"
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Edge Configuration */}
        <Accordion.Item value="edge">
          <Accordion.Control icon={<IconClock size={20} />}>Edge Configuration</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <NumberInput
                label="Max Memory (MB)"
                description="Maximum memory usage (0 = unlimited)"
                value={rustOptions.edge.maxMemoryMb}
                onChange={(val) => handleEdgeChange('maxMemoryMb', Number(val) || 0)}
                min={0}
                max={65536}
                data-testid="edge-max-memory-input"
              />

              <NumberInput
                label="Max Connections"
                description="Maximum concurrent connections"
                value={rustOptions.edge.maxConnections}
                onChange={(val) => handleEdgeChange('maxConnections', Number(val) || 10000)}
                min={1}
                max={1000000}
                data-testid="edge-max-connections-input"
              />

              <NumberInput
                label="Connection Timeout (ms)"
                description="Connection timeout in milliseconds"
                value={rustOptions.edge.connectionTimeoutMs}
                onChange={(val) => handleEdgeChange('connectionTimeoutMs', Number(val) || 5000)}
                min={100}
                max={60000}
                data-testid="edge-connection-timeout-input"
              />

              <NumberInput
                label="Request Timeout (ms)"
                description="Request timeout in milliseconds"
                value={rustOptions.edge.requestTimeoutMs}
                onChange={(val) => handleEdgeChange('requestTimeoutMs', Number(val) || 30000)}
                min={100}
                max={600000}
                data-testid="edge-request-timeout-input"
              />

              <Switch
                label="Connection Pooling"
                description="Enable connection pool"
                checked={rustOptions.edge.connectionPoolEnabled}
                onChange={(e) => handleEdgeChange('connectionPoolEnabled', e.currentTarget.checked)}
                data-testid="edge-pool-enabled-switch"
              />

              {rustOptions.edge.connectionPoolEnabled && (
                <NumberInput
                  label="Pool Size"
                  description="Connection pool size"
                  value={rustOptions.edge.connectionPoolSize}
                  onChange={(val) => handleEdgeChange('connectionPoolSize', Number(val) || 100)}
                  min={1}
                  max={10000}
                  data-testid="edge-pool-size-input"
                />
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Edge Gateway Configuration (only for edge-gateway preset) */}
        {isEdgeGateway && (
          <Accordion.Item value="edge-gateway">
            <Accordion.Control icon={<IconDatabase size={20} />}>
              Gateway Configuration
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <Switch
                  label="Enable Routing"
                  description="Enable request routing"
                  checked={rustOptions.edgeGateway.routingEnabled}
                  onChange={(e) =>
                    handleEdgeGatewayChange('routingEnabled', e.currentTarget.checked)
                  }
                  data-testid="gateway-routing-switch"
                />

                <Switch
                  label="Enable Load Balancing"
                  description="Enable load balancing"
                  checked={rustOptions.edgeGateway.loadBalancingEnabled}
                  onChange={(e) =>
                    handleEdgeGatewayChange('loadBalancingEnabled', e.currentTarget.checked)
                  }
                  data-testid="gateway-load-balancing-switch"
                />

                {rustOptions.edgeGateway.loadBalancingEnabled && (
                  <Select
                    label="Load Balancing Strategy"
                    description="Strategy for distributing requests"
                    data={LOAD_BALANCING_STRATEGIES}
                    value={rustOptions.edgeGateway.loadBalancingStrategy}
                    onChange={(val) =>
                      handleEdgeGatewayChange(
                        'loadBalancingStrategy',
                        (val as 'round-robin' | 'least-connections' | 'ip-hash') || 'round-robin',
                      )
                    }
                    data-testid="gateway-load-balancing-strategy-select"
                  />
                )}

                <Switch
                  label="Enable Caching"
                  description="Enable response caching"
                  checked={rustOptions.edgeGateway.cachingEnabled}
                  onChange={(e) =>
                    handleEdgeGatewayChange('cachingEnabled', e.currentTarget.checked)
                  }
                  data-testid="gateway-caching-switch"
                />

                {rustOptions.edgeGateway.cachingEnabled && (
                  <NumberInput
                    label="Cache TTL (seconds)"
                    description="Cache time-to-live"
                    value={rustOptions.edgeGateway.cacheTtlSeconds}
                    onChange={(val) =>
                      handleEdgeGatewayChange('cacheTtlSeconds', Number(val) || 60)
                    }
                    min={1}
                    max={86400}
                    data-testid="gateway-cache-ttl-input"
                  />
                )}

                <Switch
                  label="Enable Rate Limiting"
                  description="Enable rate limiting at edge"
                  checked={rustOptions.edgeGateway.rateLimitingEnabled}
                  onChange={(e) =>
                    handleEdgeGatewayChange('rateLimitingEnabled', e.currentTarget.checked)
                  }
                  data-testid="gateway-rate-limiting-switch"
                />

                {rustOptions.edgeGateway.rateLimitingEnabled && (
                  <NumberInput
                    label="Rate Limit (RPS)"
                    description="Requests per second limit"
                    value={rustOptions.edgeGateway.rateLimitRps}
                    onChange={(val) => handleEdgeGatewayChange('rateLimitRps', Number(val) || 1000)}
                    min={1}
                    max={1000000}
                    data-testid="gateway-rate-limit-input"
                  />
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        )}

        {/* Observability */}
        <Accordion.Item value="observability">
          <Accordion.Control icon={<IconChartBar size={20} />}>Observability</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Switch
                label="Enable Tracing"
                description="Distributed tracing with tokio-tracing"
                checked={rustOptions.middleware.tracingEnabled}
                onChange={(e) => handleMiddlewareChange('tracingEnabled', e.currentTarget.checked)}
                data-testid="observability-tracing-switch"
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Divider />

      {/* Dependencies Preview */}
      <div>
        <Text size="sm" fw={500} mb="xs">
          Dependencies Preview
        </Text>
        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }} data-testid="deps-preview">
          axum, tokio, serde
          {rustOptions.middleware.tracingEnabled && ', tracing'}
          {rustOptions.middleware.compressionEnabled && ', tower-http'}
          {isEdgePreset && ', tower'}
        </Text>
      </div>
    </Stack>
  );
});
