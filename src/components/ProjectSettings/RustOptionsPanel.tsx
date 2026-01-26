import {
  Accordion,
  Alert,
  Badge,
  Collapse,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import {
  IconBolt,
  IconChartBar,
  IconClock,
  IconInfoCircle,
  IconServer,
  IconShield,
} from '@tabler/icons-react';
import { memo } from 'react';
import type { SettingsFormProps } from './types';

const LOAD_BALANCING_STRATEGIES = [
  { value: 'round-robin', label: 'Round Robin' },
  { value: 'least-connections', label: 'Least Connections' },
  { value: 'ip-hash', label: 'IP Hash' },
];

export const RustOptionsPanel = memo(function RustOptionsPanel({ form }: SettingsFormProps) {
  const preset = form.values.rustOptions.preset;
  const isEdgePreset = preset !== 'cloud';

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">
          Advanced Options
        </Text>
        <Badge variant="light" color={isEdgePreset ? 'orange' : 'blue'}>
          {preset} preset
        </Badge>
      </Group>

      {isEdgePreset && (
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          Edge presets have optimized defaults for resource-constrained environments.
        </Alert>
      )}

      <Accordion variant="separated">
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
                {...form.getInputProps('rustOptions.server.port')}
                min={1}
                max={65535}
              />

              <NumberInput
                label="Workers"
                description="Number of worker threads (0 = auto-detect)"
                {...form.getInputProps('rustOptions.server.workers')}
                min={0}
                max={128}
              />

              <NumberInput
                label="Max Body Size (MB)"
                description="Maximum request body size"
                {...form.getInputProps('rustOptions.server.maxBodySizeMb')}
                min={1}
                max={500}
              />

              <Switch
                label="Keep-Alive Connections"
                description="Enable HTTP keep-alive"
                {...form.getInputProps('rustOptions.server.keepAliveEnabled', { type: 'checkbox' })}
              />

              <Collapse in={form.values.rustOptions.server.keepAliveEnabled}>
                <NumberInput
                  label="Keep-Alive Timeout (seconds)"
                  {...form.getInputProps('rustOptions.server.keepAliveTimeoutSeconds')}
                  min={1}
                  max={600}
                  mt="sm"
                />
              </Collapse>

              <Switch
                label="Graceful Shutdown"
                description="Enable graceful shutdown on termination"
                {...form.getInputProps('rustOptions.server.gracefulShutdownEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.server.gracefulShutdownEnabled}>
                <NumberInput
                  label="Shutdown Timeout (seconds)"
                  {...form.getInputProps('rustOptions.server.gracefulShutdownTimeoutSeconds')}
                  min={1}
                  max={300}
                  mt="sm"
                />
              </Collapse>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Middleware Configuration */}
        <Accordion.Item value="middleware">
          <Accordion.Control icon={<IconShield size={20} />}>
            Middleware
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Switch
                label="Enable Tracing"
                description="Distributed tracing with tokio-tracing"
                {...form.getInputProps('rustOptions.middleware.tracingEnabled', {
                  type: 'checkbox',
                })}
              />

              <Switch
                label="Enable CORS"
                description="Cross-Origin Resource Sharing middleware"
                {...form.getInputProps('rustOptions.middleware.corsEnabled', { type: 'checkbox' })}
              />

              <Switch
                label="Enable Compression"
                description="Response compression (gzip/brotli)"
                {...form.getInputProps('rustOptions.middleware.compressionEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.middleware.compressionEnabled}>
                <NumberInput
                  label="Compression Level (1-9)"
                  description="Higher = better compression, slower"
                  {...form.getInputProps('rustOptions.middleware.compressionLevel')}
                  min={1}
                  max={9}
                  mt="sm"
                />
              </Collapse>

              <Switch
                label="Enable Logging"
                description="Request/response logging"
                {...form.getInputProps('rustOptions.middleware.loggingEnabled', {
                  type: 'checkbox',
                })}
              />

              <Switch
                label="Enable Request ID"
                description="Add unique request ID to each request"
                {...form.getInputProps('rustOptions.middleware.requestIdEnabled', {
                  type: 'checkbox',
                })}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Edge Configuration */}
        <Accordion.Item value="edge">
          <Accordion.Control icon={<IconBolt size={20} />}>
            Edge Configuration
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <NumberInput
                label="Max Memory (MB)"
                description="Memory limit (0 = unlimited)"
                {...form.getInputProps('rustOptions.edge.maxMemoryMb')}
                min={0}
                max={8192}
              />

              <NumberInput
                label="Max Connections"
                description="Maximum concurrent connections"
                {...form.getInputProps('rustOptions.edge.maxConnections')}
                min={100}
                max={100000}
              />

              <NumberInput
                label="Connection Timeout (ms)"
                description="Connection establishment timeout"
                {...form.getInputProps('rustOptions.edge.connectionTimeoutMs')}
                min={100}
                max={30000}
              />

              <NumberInput
                label="Request Timeout (ms)"
                description="Maximum request processing time"
                {...form.getInputProps('rustOptions.edge.requestTimeoutMs')}
                min={1000}
                max={300000}
              />

              <Switch
                label="Enable Compression"
                description="Response compression at edge"
                {...form.getInputProps('rustOptions.edge.compressionEnabled', { type: 'checkbox' })}
              />

              <Switch
                label="Enable Connection Pooling"
                description="Pool upstream connections"
                {...form.getInputProps('rustOptions.edge.connectionPoolEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.edge.connectionPoolEnabled}>
                <NumberInput
                  label="Pool Size"
                  {...form.getInputProps('rustOptions.edge.connectionPoolSize')}
                  min={1}
                  max={1000}
                  mt="sm"
                />
              </Collapse>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Edge Gateway Options (visible when preset is edge-gateway) */}
        <Accordion.Item value="edge-gateway" disabled={preset !== 'edge-gateway'}>
          <Accordion.Control icon={<IconClock size={20} />}>
            Gateway Options
            {preset !== 'edge-gateway' && (
              <Badge ml="xs" size="xs" color="gray">
                edge-gateway only
              </Badge>
            )}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Switch
                label="Enable Routing"
                description="Request routing based on rules"
                {...form.getInputProps('rustOptions.edgeGateway.routingEnabled', {
                  type: 'checkbox',
                })}
              />

              <Switch
                label="Enable Load Balancing"
                description="Distribute requests across backends"
                {...form.getInputProps('rustOptions.edgeGateway.loadBalancingEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.edgeGateway.loadBalancingEnabled}>
                <Select
                  label="Load Balancing Strategy"
                  data={LOAD_BALANCING_STRATEGIES}
                  {...form.getInputProps('rustOptions.edgeGateway.loadBalancingStrategy')}
                  mt="sm"
                />
              </Collapse>

              <Switch
                label="Enable Caching"
                description="Cache responses at the edge"
                {...form.getInputProps('rustOptions.edgeGateway.cachingEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.edgeGateway.cachingEnabled}>
                <NumberInput
                  label="Cache TTL (seconds)"
                  {...form.getInputProps('rustOptions.edgeGateway.cacheTtlSeconds')}
                  min={1}
                  max={86400}
                  mt="sm"
                />
              </Collapse>

              <Switch
                label="Enable Rate Limiting"
                description="Limit requests at the edge"
                {...form.getInputProps('rustOptions.edgeGateway.rateLimitingEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.edgeGateway.rateLimitingEnabled}>
                <NumberInput
                  label="Rate Limit (RPS)"
                  description="Requests per second limit"
                  {...form.getInputProps('rustOptions.edgeGateway.rateLimitRps')}
                  min={1}
                  max={100000}
                  mt="sm"
                />
              </Collapse>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Edge Anomaly Options */}
        <Accordion.Item value="edge-anomaly" disabled={preset !== 'edge-anomaly'}>
          <Accordion.Control icon={<IconChartBar size={20} />}>
            Anomaly Detection
            {preset !== 'edge-anomaly' && (
              <Badge ml="xs" size="xs" color="gray">
                edge-anomaly only
              </Badge>
            )}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Switch
                label="Enable Streaming"
                description="Process data as streams"
                {...form.getInputProps('rustOptions.edgeAnomaly.streamingEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.edgeAnomaly.streamingEnabled}>
                <NumberInput
                  label="Buffer Size (KB)"
                  {...form.getInputProps('rustOptions.edgeAnomaly.bufferSizeKb')}
                  min={1}
                  max={1024}
                  mt="sm"
                />
              </Collapse>

              <Switch
                label="Enable Alerts"
                description="Real-time anomaly alerts"
                {...form.getInputProps('rustOptions.edgeAnomaly.alertsEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.edgeAnomaly.alertsEnabled}>
                <NumberInput
                  label="Alert Threshold"
                  description="Anomaly score threshold (0.0 - 1.0)"
                  {...form.getInputProps('rustOptions.edgeAnomaly.alertThreshold')}
                  min={0}
                  max={1}
                  step={0.1}
                  decimalScale={2}
                  mt="sm"
                />
              </Collapse>

              <NumberInput
                label="Window Size (seconds)"
                description="Time window for anomaly detection"
                {...form.getInputProps('rustOptions.edgeAnomaly.windowSizeSeconds')}
                min={1}
                max={3600}
              />

              <Switch
                label="Enable Aggregation"
                description="Aggregate metrics over time windows"
                {...form.getInputProps('rustOptions.edgeAnomaly.aggregationEnabled', {
                  type: 'checkbox',
                })}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Edge AI Options */}
        <Accordion.Item value="edge-ai" disabled={preset !== 'edge-ai'}>
          <Accordion.Control icon={<IconChartBar size={20} />}>
            AI Inference
            {preset !== 'edge-ai' && (
              <Badge ml="xs" size="xs" color="gray">
                edge-ai only
              </Badge>
            )}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Switch
                label="Enable Model Serving"
                description="Serve ML models via API"
                {...form.getInputProps('rustOptions.edgeAi.modelServingEnabled', {
                  type: 'checkbox',
                })}
              />

              <NumberInput
                label="Max Model Size (MB)"
                description="Maximum model file size"
                {...form.getInputProps('rustOptions.edgeAi.maxModelSizeMb')}
                min={1}
                max={2048}
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
                description="Threads for model inference"
                {...form.getInputProps('rustOptions.edgeAi.inferenceThreads')}
                min={1}
                max={32}
              />

              <Switch
                label="Enable Batch Inference"
                description="Process multiple inputs in batches"
                {...form.getInputProps('rustOptions.edgeAi.batchInferenceEnabled', {
                  type: 'checkbox',
                })}
              />

              <Collapse in={form.values.rustOptions.edgeAi.batchInferenceEnabled}>
                <NumberInput
                  label="Max Batch Size"
                  {...form.getInputProps('rustOptions.edgeAi.maxBatchSize')}
                  min={1}
                  max={256}
                  mt="sm"
                />
              </Collapse>

              <NumberInput
                label="Inference Timeout (ms)"
                description="Maximum time for inference"
                {...form.getInputProps('rustOptions.edgeAi.inferenceTimeoutMs')}
                min={100}
                max={300000}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Divider />

      {/* Dependencies Preview */}
      <div>
        <Text size="sm" fw={500} mb="xs">
          Core Dependencies
        </Text>
        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
          axum, tokio, serde
          {form.values.rustOptions.middleware.tracingEnabled && ', tracing'}
          {form.values.rustOptions.middleware.compressionEnabled && ', tower-http'}
          {form.values.rustOptions.middleware.corsEnabled && ', tower-cors'}
        </Text>
      </div>
    </Stack>
  );
});
