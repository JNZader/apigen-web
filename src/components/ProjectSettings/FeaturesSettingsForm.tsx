import { Divider, Stack, Switch, Title } from '@mantine/core';
import type { SettingsFormProps } from './types';

export function FeaturesSettingsForm({ form }: SettingsFormProps) {
  return (
    <Stack>
      <Title order={6}>Core Features</Title>

      <Switch
        label="HATEOAS Links"
        description="Include hypermedia links in responses"
        {...form.getInputProps('features.hateoas', { type: 'checkbox' })}
      />

      <Switch
        label="Swagger/OpenAPI"
        description="Generate API documentation"
        {...form.getInputProps('features.swagger', { type: 'checkbox' })}
      />

      <Switch
        label="Soft Delete"
        description="Logical deletion instead of physical"
        {...form.getInputProps('features.softDelete', { type: 'checkbox' })}
      />

      <Switch
        label="Auditing"
        description="Track createdAt, updatedAt, createdBy, updatedBy"
        {...form.getInputProps('features.auditing', { type: 'checkbox' })}
      />

      <Switch
        label="Virtual Threads"
        description="Use Java 21+ virtual threads"
        {...form.getInputProps('features.virtualThreads', { type: 'checkbox' })}
      />

      <Divider label="Pagination & Caching" labelPosition="left" />

      <Switch
        label="Caching"
        description="Enable response caching"
        {...form.getInputProps('features.caching', { type: 'checkbox' })}
      />

      <Switch
        label="Cursor Pagination"
        description="Enable cursor-based pagination"
        {...form.getInputProps('features.cursorPagination', { type: 'checkbox' })}
      />

      <Switch
        label="ETag Support"
        description="Enable ETags for caching"
        {...form.getInputProps('features.etagSupport', { type: 'checkbox' })}
      />

      <Divider label="Advanced Features" labelPosition="left" />

      <Switch
        label="Rate Limiting"
        description="Enable request rate limiting"
        {...form.getInputProps('features.rateLimiting', { type: 'checkbox' })}
      />

      <Switch
        label="Internationalization (i18n)"
        description="Multi-language support"
        {...form.getInputProps('features.i18n', { type: 'checkbox' })}
      />

      <Switch
        label="Webhooks"
        description="Send event notifications"
        {...form.getInputProps('features.webhooks', { type: 'checkbox' })}
      />

      <Switch
        label="Bulk Operations"
        description="Import/export in bulk"
        {...form.getInputProps('features.bulkOperations', { type: 'checkbox' })}
      />

      <Switch
        label="Batch Operations"
        description="Batch CRUD operations"
        {...form.getInputProps('features.batchOperations', { type: 'checkbox' })}
      />

      <Switch
        label="Domain Events"
        description="Publish domain events"
        {...form.getInputProps('features.domainEvents', { type: 'checkbox' })}
      />

      <Switch
        label="SSE Updates"
        description="Server-Sent Events for real-time updates"
        {...form.getInputProps('features.sseUpdates', { type: 'checkbox' })}
      />

      <Divider label="Architecture" labelPosition="left" />

      <Switch
        label="Multi-Tenancy"
        description="Support multiple tenants"
        {...form.getInputProps('features.multiTenancy', { type: 'checkbox' })}
      />

      <Switch
        label="Event Sourcing"
        description="Store events as source of truth"
        {...form.getInputProps('features.eventSourcing', { type: 'checkbox' })}
      />

      <Switch
        label="API Versioning"
        description="Support multiple API versions"
        {...form.getInputProps('features.apiVersioning', { type: 'checkbox' })}
      />

      <Divider label="Deployment" labelPosition="left" />

      <Switch
        label="Docker"
        description="Generate Dockerfile"
        {...form.getInputProps('features.docker', { type: 'checkbox' })}
      />
    </Stack>
  );
}
