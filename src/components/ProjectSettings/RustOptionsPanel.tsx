import {
  Accordion,
  Alert,
  Badge,
  Divider,
  Group,
  Code,
  Collapse,
  Divider,
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
  RustPreset,
} from '../../types';

const LOAD_BALANCING_STRATEGIES = [
  { value: 'round-robin', label: 'Round Robin' },
  { value: 'least-connections', label: 'Least Connections' },
  { value: 'ip-hash', label: 'IP Hash' },
];

export const RustOptionsPanel = memo(function RustOptionsPanel() {
  const rustOptions = useRustOptions();
  const setRustOptions = useProjectStoreInternal((s) => s.setRustOptions);

  const handlePresetChange = useCallback(
    (preset: RustPreset) => {
      setRustOptions({ preset });
    },
    [setRustOptions],
  );

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
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="yellow"
          data-testid="edge-preset-alert"
        >
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
                onChange={(e) =>
                  handleEdgeChange('connectionPoolEnabled', e.currentTarget.checked)
                }
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
                    onChange={(val) =>
                      handleEdgeGatewayChange('rateLimitRps', Number(val) || 1000)
                    }
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
  Title,
} from '@mantine/core';
import type { SettingsFormProps } from './types';

/**
 * Dependencies that will be added based on configuration.
 */
function getDependenciesPreview(form: SettingsFormProps['form']): string[] {
  const deps: string[] = ['axum', 'tokio', 'serde', 'serde_json'];
  const opts = form.values.rustOptions;

  // Database dependencies
  if (form.values.databaseConfig.type !== 'none') {
    deps.push('sqlx');
    if (form.values.databaseConfig.type === 'postgresql') {
      deps.push('sqlx { features = ["postgres"] }');
    } else if (form.values.databaseConfig.type === 'mysql') {
      deps.push('sqlx { features = ["mysql"] }');
    }
  }

  // Security dependencies
  if (form.values.modules.security) {
    deps.push('jsonwebtoken', 'argon2', 'tower-http { features = ["auth"] }');
  }

  // Middleware dependencies
  if (opts.middleware.tracingEnabled) {
    deps.push('tracing', 'tracing-subscriber');
  }
  if (opts.middleware.compressionEnabled) {
    deps.push('tower-http { features = ["compression-gzip"] }');
  }
  if (opts.middleware.corsEnabled) {
    deps.push('tower-http { features = ["cors"] }');
  }

  // Edge-specific dependencies
  if (opts.preset === 'edge-ai' && opts.edgeAi.modelServingEnabled) {
    deps.push('ort', 'ndarray');
  }
  if (opts.preset === 'edge-anomaly' && opts.edgeAnomaly.streamingEnabled) {
    deps.push('tokio-stream', 'futures');
  }
  if (opts.preset === 'edge-gateway' && opts.edgeGateway.rateLimitingEnabled) {
    deps.push('governor');
  }

  // Observability
  if (form.values.observabilityConfig.tracing.enabled) {
    deps.push('opentelemetry', 'opentelemetry-otlp');
  }
  if (form.values.observabilityConfig.metrics.enabled) {
    deps.push('metrics', 'metrics-exporter-prometheus');
  }

  return [...new Set(deps)];
}

export function RustOptionsPanel({ form }: SettingsFormProps) {
  const preset = form.values.rustOptions.preset;
  const dependencies = getDependenciesPreview(form);

  return (
    <Stack>
      {/* Preset Selection */}
      <Select
        label="Deployment Preset"
        description="Select deployment target to optimize configuration"
        data={[
          { value: 'cloud', label: 'Cloud - Full-featured deployment' },
          { value: 'edge-gateway', label: 'Edge Gateway - Low-latency routing' },
          { value: 'edge-anomaly', label: 'Edge Anomaly - Streaming detection' },
          { value: 'edge-ai', label: 'Edge AI - Model inference' },
        ]}
        {...form.getInputProps('rustOptions.preset')}
      />

      {/* Database Section */}
      <Divider label="Database" labelPosition="left" mt="md" />

      <Switch
        label="Enable Connection Pooling"
        description="Use SQLx connection pool for database connections"
        {...form.getInputProps('rustOptions.edge.connectionPoolEnabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.rustOptions.edge.connectionPoolEnabled}>
        <Stack mt="sm">
          <NumberInput
            label="Pool Size"
            description="Maximum number of connections in the pool"
            min={1}
            max={1000}
            {...form.getInputProps('rustOptions.edge.connectionPoolSize')}
          />
          <NumberInput
            label="Connection Timeout (ms)"
            description="Timeout for acquiring a connection from the pool"
            min={100}
            max={60000}
            {...form.getInputProps('rustOptions.edge.connectionTimeoutMs')}
          />
        </Stack>
      </Collapse>

      {/* Security Section */}
      <Divider label="Security" labelPosition="left" mt="md" />

      <Switch
        label="Enable CORS Middleware"
        description="Cross-Origin Resource Sharing support"
        {...form.getInputProps('rustOptions.middleware.corsEnabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Request ID"
        description="Add unique request ID header for tracing"
        {...form.getInputProps('rustOptions.middleware.requestIdEnabled', { type: 'checkbox' })}
      />

      <NumberInput
        label="Max Body Size (MB)"
        description="Maximum request body size limit"
        min={1}
        max={100}
        {...form.getInputProps('rustOptions.server.maxBodySizeMb')}
      />

      <NumberInput
        label="Max Connections"
        description="Maximum concurrent connections allowed"
        min={100}
        max={100000}
        {...form.getInputProps('rustOptions.edge.maxConnections')}
      />

      {/* Performance Section */}
      <Divider label="Performance" labelPosition="left" mt="md" />

      <NumberInput
        label="Worker Threads"
        description="Number of async runtime workers (0 = auto-detect)"
        min={0}
        max={64}
        {...form.getInputProps('rustOptions.server.workers')}
      />

      <Switch
        label="Enable Keep-Alive"
        description="Reuse TCP connections between requests"
        {...form.getInputProps('rustOptions.server.keepAliveEnabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.rustOptions.server.keepAliveEnabled}>
        <NumberInput
          label="Keep-Alive Timeout (seconds)"
          description="Timeout for idle keep-alive connections"
          min={1}
          max={300}
          mt="sm"
          {...form.getInputProps('rustOptions.server.keepAliveTimeoutSeconds')}
        />
      </Collapse>

      <Switch
        label="Enable Compression"
        description="Gzip compression for responses"
        {...form.getInputProps('rustOptions.middleware.compressionEnabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.rustOptions.middleware.compressionEnabled}>
        <NumberInput
          label="Compression Level"
          description="1 (fastest) to 9 (smallest)"
          min={1}
          max={9}
          mt="sm"
          {...form.getInputProps('rustOptions.middleware.compressionLevel')}
        />
      </Collapse>

      <Switch
        label="Enable Graceful Shutdown"
        description="Finish in-flight requests before stopping"
        {...form.getInputProps('rustOptions.server.gracefulShutdownEnabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.rustOptions.server.gracefulShutdownEnabled}>
        <NumberInput
          label="Shutdown Timeout (seconds)"
          description="Maximum time to wait for requests to complete"
          min={1}
          max={120}
          mt="sm"
          {...form.getInputProps('rustOptions.server.gracefulShutdownTimeoutSeconds')}
        />
      </Collapse>

      {/* Observability Section */}
      <Divider label="Observability" labelPosition="left" mt="md" />

      <Switch
        label="Enable Tracing Middleware"
        description="Request tracing with spans"
        {...form.getInputProps('rustOptions.middleware.tracingEnabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Request Logging"
        description="Log incoming requests and responses"
        {...form.getInputProps('rustOptions.middleware.loggingEnabled', { type: 'checkbox' })}
      />

      {/* Edge-specific sections based on preset */}
      <Collapse in={preset === 'edge-gateway'}>
        <Stack mt="md">
          <Divider label="Edge Gateway Options" labelPosition="left" />

          <Switch
            label="Enable Load Balancing"
            {...form.getInputProps('rustOptions.edgeGateway.loadBalancingEnabled', {
              type: 'checkbox',
            })}
          />

          <Collapse in={form.values.rustOptions.edgeGateway.loadBalancingEnabled}>
            <Select
              label="Load Balancing Strategy"
              data={[
                { value: 'round-robin', label: 'Round Robin' },
                { value: 'least-connections', label: 'Least Connections' },
                { value: 'ip-hash', label: 'IP Hash' },
              ]}
              mt="sm"
              {...form.getInputProps('rustOptions.edgeGateway.loadBalancingStrategy')}
            />
          </Collapse>

          <Switch
            label="Enable Edge Caching"
            {...form.getInputProps('rustOptions.edgeGateway.cachingEnabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.rustOptions.edgeGateway.cachingEnabled}>
            <NumberInput
              label="Cache TTL (seconds)"
              min={1}
              max={3600}
              mt="sm"
              {...form.getInputProps('rustOptions.edgeGateway.cacheTtlSeconds')}
            />
          </Collapse>

          <Switch
            label="Enable Rate Limiting"
            {...form.getInputProps('rustOptions.edgeGateway.rateLimitingEnabled', {
              type: 'checkbox',
            })}
          />

          <Collapse in={form.values.rustOptions.edgeGateway.rateLimitingEnabled}>
            <NumberInput
              label="Requests per Second"
              min={1}
              max={100000}
              mt="sm"
              {...form.getInputProps('rustOptions.edgeGateway.rateLimitRps')}
            />
          </Collapse>
        </Stack>
      </Collapse>

      <Collapse in={preset === 'edge-anomaly'}>
        <Stack mt="md">
          <Divider label="Edge Anomaly Detection Options" labelPosition="left" />

          <Switch
            label="Enable Streaming"
            description="Process data as continuous stream"
            {...form.getInputProps('rustOptions.edgeAnomaly.streamingEnabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.rustOptions.edgeAnomaly.streamingEnabled}>
            <NumberInput
              label="Buffer Size (KB)"
              min={1}
              max={1024}
              mt="sm"
              {...form.getInputProps('rustOptions.edgeAnomaly.bufferSizeKb')}
            />
          </Collapse>

          <Switch
            label="Enable Real-time Alerts"
            {...form.getInputProps('rustOptions.edgeAnomaly.alertsEnabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.rustOptions.edgeAnomaly.alertsEnabled}>
            <NumberInput
              label="Alert Threshold"
              description="0.0 to 1.0 sensitivity"
              min={0}
              max={1}
              step={0.1}
              decimalScale={2}
              mt="sm"
              {...form.getInputProps('rustOptions.edgeAnomaly.alertThreshold')}
            />
          </Collapse>

          <NumberInput
            label="Detection Window (seconds)"
            description="Time window for anomaly detection"
            min={1}
            max={3600}
            {...form.getInputProps('rustOptions.edgeAnomaly.windowSizeSeconds')}
          />

          <Switch
            label="Enable Metric Aggregation"
            {...form.getInputProps('rustOptions.edgeAnomaly.aggregationEnabled', {
              type: 'checkbox',
            })}
          />
        </Stack>
      </Collapse>

      <Collapse in={preset === 'edge-ai'}>
        <Stack mt="md">
          <Divider label="Edge AI Options" labelPosition="left" />

          <Switch
            label="Enable Model Serving"
            description="Serve ML models via HTTP endpoints"
            {...form.getInputProps('rustOptions.edgeAi.modelServingEnabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.rustOptions.edgeAi.modelServingEnabled}>
            <Stack mt="sm">
              <NumberInput
                label="Max Model Size (MB)"
                description="Maximum model file size"
                min={1}
                max={10000}
                {...form.getInputProps('rustOptions.edgeAi.maxModelSizeMb')}
              />

              <Switch
                label="Enable Model Caching"
                description="Cache loaded models in memory"
                {...form.getInputProps('rustOptions.edgeAi.modelCachingEnabled', {
                  type: 'checkbox',
                })}
              />

              <NumberInput
                label="Inference Threads"
                description="Threads dedicated to inference"
                min={1}
                max={32}
                {...form.getInputProps('rustOptions.edgeAi.inferenceThreads')}
              />

              <Switch
                label="Enable Batch Inference"
                description="Process multiple inputs in a single call"
                {...form.getInputProps('rustOptions.edgeAi.batchInferenceEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.edgeAi.batchInferenceEnabled}>
                <NumberInput
                  label="Max Batch Size"
                  min={1}
                  max={256}
                  mt="sm"
                  {...form.getInputProps('rustOptions.edgeAi.maxBatchSize')}
                />
              </Collapse>

              <NumberInput
                label="Inference Timeout (ms)"
                description="Maximum time for inference request"
                min={100}
                max={120000}
                {...form.getInputProps('rustOptions.edgeAi.inferenceTimeoutMs')}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>

      {/* Dependencies Preview */}
      <Divider label="Dependencies Preview" labelPosition="left" mt="md" />

      <Title order={6}>Cargo.toml Dependencies</Title>
      <Text size="sm" c="dimmed" mb="xs">
        Based on current configuration, these dependencies will be added:
      </Text>
      <Code block>{dependencies.join('\n')}</Code>
    </Stack>
  );
}
