import { Collapse, Divider, NumberInput, Stack, Switch, TextInput, Title } from '@mantine/core';
import type { SettingsFormProps } from './types';

export function ObservabilitySettingsForm({ form }: SettingsFormProps) {
  return (
    <Stack>
      <Title order={6}>Distributed Tracing</Title>

      <Switch
        label="Enable Tracing"
        description="Enable distributed tracing with OpenTelemetry"
        {...form.getInputProps('observabilityConfig.tracing.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.observabilityConfig.tracing.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Sampling Probability"
            description="0.0 to 1.0 (1.0 = 100%)"
            min={0}
            max={1}
            step={0.1}
            decimalScale={2}
            {...form.getInputProps('observabilityConfig.tracing.samplingProbability')}
          />
          <TextInput
            label="OTLP Endpoint"
            placeholder="http://localhost:4317"
            description="OpenTelemetry collector endpoint"
            {...form.getInputProps('observabilityConfig.tracing.otlpEndpoint')}
          />
        </Stack>
      </Collapse>

      <Divider label="Metrics" labelPosition="left" />

      <Switch
        label="Enable Metrics"
        description="Enable metrics collection with Micrometer"
        {...form.getInputProps('observabilityConfig.metrics.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.observabilityConfig.metrics.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Slow Query Threshold (ms)"
            description="Threshold for slow query detection"
            min={1}
            {...form.getInputProps('observabilityConfig.metrics.slowQueryThresholdMs')}
          />
          <Switch
            label="Expose HikariCP Metrics"
            description="Expose connection pool metrics"
            {...form.getInputProps('observabilityConfig.metrics.exposeHikariMetrics', {
              type: 'checkbox',
            })}
          />
          <Switch
            label="Expose Prometheus Metrics"
            description="Expose /actuator/prometheus endpoint"
            {...form.getInputProps('observabilityConfig.metrics.exposePrometheus', {
              type: 'checkbox',
            })}
          />
        </Stack>
      </Collapse>

      <Divider label="Query Analysis" labelPosition="left" />

      <Switch
        label="Enable Query Analysis"
        description="Detect N+1 queries and log slow queries"
        {...form.getInputProps('observabilityConfig.queryAnalysis.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.observabilityConfig.queryAnalysis?.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Warning Threshold"
            description="Number of queries to trigger a warning"
            min={1}
            {...form.getInputProps('observabilityConfig.queryAnalysis.warnThreshold')}
          />
          <NumberInput
            label="Error Threshold"
            description="Number of queries to trigger an error"
            min={1}
            {...form.getInputProps('observabilityConfig.queryAnalysis.errorThreshold')}
          />
          <Switch
            label="Log Slow Queries"
            description="Log queries exceeding the threshold"
            {...form.getInputProps('observabilityConfig.queryAnalysis.logSlowQueries', {
              type: 'checkbox',
            })}
          />
          <NumberInput
            label="Slow Query Threshold (ms)"
            min={1}
            {...form.getInputProps('observabilityConfig.queryAnalysis.slowQueryThresholdMs')}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}
