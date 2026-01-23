import { Alert, NumberInput, Stack, Switch, TagsInput, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { SettingsFormProps } from './types';

export function CorsSettingsForm({ form }: SettingsFormProps) {
  return (
    <Stack>
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mb="md">
        <Text size="sm">
          CORS (Cross-Origin Resource Sharing) settings control which domains can access your API.
        </Text>
      </Alert>

      <TagsInput
        label="Allowed Origins"
        placeholder="Press Enter to add (e.g., https://example.com)"
        description="Use * to allow all origins"
        {...form.getInputProps('corsConfig.allowedOrigins')}
      />

      <TagsInput
        label="Allowed Methods"
        placeholder="Press Enter to add (e.g., GET, POST)"
        {...form.getInputProps('corsConfig.allowedMethods')}
      />

      <TagsInput
        label="Allowed Headers"
        placeholder="Press Enter to add (e.g., Content-Type)"
        {...form.getInputProps('corsConfig.allowedHeaders')}
      />

      <TagsInput
        label="Exposed Headers"
        placeholder="Press Enter to add"
        description="Headers that browsers are allowed to access"
        {...form.getInputProps('corsConfig.exposedHeaders')}
      />

      <Switch
        label="Allow Credentials"
        description="Allow cookies and authorization headers"
        {...form.getInputProps('corsConfig.allowCredentials', { type: 'checkbox' })}
      />

      <NumberInput
        label="Max Age (seconds)"
        description="How long browsers can cache preflight response"
        min={0}
        {...form.getInputProps('corsConfig.maxAgeSeconds')}
      />
    </Stack>
  );
}
