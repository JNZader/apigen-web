import { Collapse, Divider, NumberInput, Stack, Switch, Title } from '@mantine/core';
import type { SettingsFormProps } from './types';

export function ResilienceSettingsForm({ form }: SettingsFormProps) {
  return (
    <Stack>
      <Title order={6}>Circuit Breaker</Title>

      <Switch
        label="Enable Circuit Breaker"
        {...form.getInputProps('resilienceConfig.circuitBreaker.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.resilienceConfig.circuitBreaker.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Sliding Window Size"
            description="Number of calls to evaluate"
            min={1}
            {...form.getInputProps('resilienceConfig.circuitBreaker.slidingWindowSize')}
          />

          <NumberInput
            label="Minimum Number of Calls"
            description="Minimum calls before circuit breaker can trip"
            min={1}
            {...form.getInputProps('resilienceConfig.circuitBreaker.minimumNumberOfCalls')}
          />

          <NumberInput
            label="Failure Rate Threshold (%)"
            description="Percentage of failures to open circuit"
            min={1}
            max={100}
            {...form.getInputProps('resilienceConfig.circuitBreaker.failureRateThreshold')}
          />

          <NumberInput
            label="Slow Call Rate Threshold (%)"
            description="Percentage of slow calls to open circuit"
            min={1}
            max={100}
            {...form.getInputProps('resilienceConfig.circuitBreaker.slowCallRateThreshold')}
          />

          <NumberInput
            label="Slow Call Duration Threshold (seconds)"
            description="Duration threshold for slow calls"
            min={1}
            {...form.getInputProps(
              'resilienceConfig.circuitBreaker.slowCallDurationThresholdSeconds',
            )}
          />

          <NumberInput
            label="Wait Duration in Open State (seconds)"
            description="Time to wait before transitioning from OPEN to HALF_OPEN"
            min={1}
            {...form.getInputProps(
              'resilienceConfig.circuitBreaker.waitDurationInOpenStateSeconds',
            )}
          />
        </Stack>
      </Collapse>

      <Divider label="Retry" labelPosition="left" />

      <Switch
        label="Enable Retry"
        {...form.getInputProps('resilienceConfig.retry.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.resilienceConfig.retry.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Max Attempts"
            min={1}
            max={10}
            {...form.getInputProps('resilienceConfig.retry.maxAttempts')}
          />

          <NumberInput
            label="Wait Duration (ms)"
            description="Initial wait duration between retries"
            min={100}
            {...form.getInputProps('resilienceConfig.retry.waitDurationMs')}
          />

          <Switch
            label="Enable Exponential Backoff"
            {...form.getInputProps('resilienceConfig.retry.enableExponentialBackoff', {
              type: 'checkbox',
            })}
          />

          <Collapse in={form.values.resilienceConfig.retry.enableExponentialBackoff}>
            <NumberInput
              label="Backoff Multiplier"
              description="Exponential backoff multiplier"
              min={1}
              step={0.1}
              decimalScale={1}
              mt="sm"
              {...form.getInputProps('resilienceConfig.retry.exponentialBackoffMultiplier')}
            />
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
