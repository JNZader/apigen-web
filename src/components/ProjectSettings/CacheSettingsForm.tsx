import { Collapse, Divider, NumberInput, Select, Stack, Switch, TextInput } from '@mantine/core';
import type { SettingsFormProps } from './types';

export function CacheSettingsForm({ form }: SettingsFormProps) {
  return (
    <Stack>
      <Switch
        label="Enable Caching"
        {...form.getInputProps('features.caching', { type: 'checkbox' })}
      />

      <Collapse in={form.values.features.caching}>
        <Stack mt="md">
          <Select
            label="Cache Provider"
            data={[
              { value: 'local', label: 'Caffeine (In-memory)' },
              { value: 'redis', label: 'Redis' },
            ]}
            {...form.getInputProps('cacheConfig.type')}
          />

          <Divider label="Entity Cache Settings" labelPosition="left" />

          <NumberInput
            label="Entity Cache Max Size"
            description="Maximum number of cached entries"
            min={100}
            {...form.getInputProps('cacheConfig.entities.maxSize')}
          />

          <NumberInput
            label="Entity TTL (minutes)"
            description="Time-to-live for entity cache entries"
            min={1}
            {...form.getInputProps('cacheConfig.entities.expireAfterWriteMinutes')}
          />

          <Divider label="List Cache Settings" labelPosition="left" />

          <NumberInput
            label="List Cache Max Size"
            description="Maximum number of cached list entries"
            min={10}
            {...form.getInputProps('cacheConfig.lists.maxSize')}
          />

          <NumberInput
            label="List TTL (minutes)"
            description="Time-to-live for list cache entries"
            min={1}
            {...form.getInputProps('cacheConfig.lists.expireAfterWriteMinutes')}
          />

          <Collapse in={form.values.cacheConfig.type === 'redis'}>
            <Stack mt="md">
              <Divider label="Redis Configuration" labelPosition="left" />
              <TextInput
                label="Redis Host"
                placeholder="localhost"
                {...form.getInputProps('cacheConfig.redis.host')}
              />
              <NumberInput
                label="Redis Port"
                min={1}
                max={65535}
                {...form.getInputProps('cacheConfig.redis.port')}
              />
              <TextInput
                label="Key Prefix"
                placeholder="apigen:"
                description="Prefix for all cache keys"
                {...form.getInputProps('cacheConfig.redis.keyPrefix')}
              />
              <NumberInput
                label="Default TTL (minutes)"
                description="Default time-to-live for cache entries"
                min={1}
                {...form.getInputProps('cacheConfig.redis.ttlMinutes')}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
