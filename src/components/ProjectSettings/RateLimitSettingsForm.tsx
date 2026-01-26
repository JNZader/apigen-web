import { Collapse, Divider, NumberInput, Select, Stack, Switch } from '@mantine/core';
import type { SettingsFormProps } from './types';

export function RateLimitSettingsForm({ form }: Readonly<SettingsFormProps>) {
  return (
    <Stack>
      <Switch
        label="Enable Rate Limiting"
        {...form.getInputProps('features.rateLimiting', { type: 'checkbox' })}
      />

      <Collapse in={form.values.features.rateLimiting}>
        <Stack mt="md">
          <Select
            label="Storage Mode"
            description="Where to store rate limit counters"
            data={[
              { value: 'IN_MEMORY', label: 'In-Memory (single instance)' },
              { value: 'REDIS', label: 'Redis (distributed)' },
            ]}
            {...form.getInputProps('rateLimitConfig.storageMode')}
          />

          <NumberInput
            label="Requests per Second"
            description="Maximum requests per second per client"
            min={1}
            {...form.getInputProps('rateLimitConfig.requestsPerSecond')}
          />

          <NumberInput
            label="Burst Capacity"
            description="Maximum burst requests allowed"
            min={1}
            {...form.getInputProps('rateLimitConfig.burstCapacity')}
          />

          <Divider label="Authentication Endpoints" labelPosition="left" />

          <NumberInput
            label="Auth Requests per Minute"
            description="Maximum authentication requests per minute"
            min={1}
            {...form.getInputProps('rateLimitConfig.authRequestsPerMinute')}
          />

          <NumberInput
            label="Auth Burst Capacity"
            description="Maximum auth burst requests allowed"
            min={1}
            {...form.getInputProps('rateLimitConfig.authBurstCapacity')}
          />

          <NumberInput
            label="Block Duration (seconds)"
            description="How long to block when rate limit exceeded"
            min={1}
            {...form.getInputProps('rateLimitConfig.blockDurationSeconds')}
          />

          <Switch
            label="Enable Per-User Rate Limiting"
            {...form.getInputProps('rateLimitConfig.enablePerUser', { type: 'checkbox' })}
          />

          <Switch
            label="Enable Per-Endpoint Rate Limiting"
            {...form.getInputProps('rateLimitConfig.enablePerEndpoint', { type: 'checkbox' })}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}
