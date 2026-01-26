import {
  Code,
  Collapse,
  Divider,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
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
