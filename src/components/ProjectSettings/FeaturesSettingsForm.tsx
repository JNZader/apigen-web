import { Badge, Divider, Group, Stack, Switch, Text, Title, Tooltip } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useLanguageFeatureSync } from '../../hooks';
import { useTargetConfig } from '../../store';
import type { FeatureKey } from '../../types/config/featureCompatibility';
import { LANGUAGE_METADATA } from '../../types/target';
import type { SettingsFormProps } from './types';

interface FeatureSwitchProps {
  readonly form: SettingsFormProps['form'];
  readonly feature: FeatureKey;
  readonly label: string;
  readonly description: string;
  readonly isSupported: boolean;
  readonly languageLabel: string;
}

function FeatureSwitch({
  form,
  feature,
  label,
  description,
  isSupported,
  languageLabel,
}: FeatureSwitchProps) {
  if (!isSupported) {
    return (
      <Tooltip
        label={`${label} is not available for ${languageLabel}`}
        position="left"
        withArrow
        multiline
        w={220}
      >
        <Group wrap="nowrap" gap="xs" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <Switch
            label={
              <Group gap="xs">
                <Text>{label}</Text>
                <Badge size="xs" color="gray" variant="light">
                  N/A
                </Badge>
              </Group>
            }
            description={description}
            disabled
            checked={false}
          />
          <IconAlertCircle size={16} color="var(--mantine-color-gray-5)" />
        </Group>
      </Tooltip>
    );
  }

  return (
    <Switch
      label={label}
      description={description}
      {...form.getInputProps(`features.${feature}`, { type: 'checkbox' })}
    />
  );
}

export function FeaturesSettingsForm({ form }: Readonly<SettingsFormProps>) {
  const targetConfig = useTargetConfig();
  const { isFeatureSupported } = useLanguageFeatureSync();
  const languageLabel = LANGUAGE_METADATA[targetConfig.language].label;

  return (
    <Stack>
      <Title order={6}>Core Features</Title>

      <FeatureSwitch
        form={form}
        feature="hateoas"
        label="HATEOAS Links"
        description="Include hypermedia links in responses"
        isSupported={isFeatureSupported('hateoas')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="swagger"
        label="Swagger/OpenAPI"
        description="Generate API documentation"
        isSupported={isFeatureSupported('swagger')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="softDelete"
        label="Soft Delete"
        description="Logical deletion instead of physical"
        isSupported={isFeatureSupported('softDelete')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="auditing"
        label="Auditing"
        description="Track createdAt, updatedAt, createdBy, updatedBy"
        isSupported={isFeatureSupported('auditing')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="virtualThreads"
        label="Virtual Threads"
        description="Use Java 21+ virtual threads"
        isSupported={isFeatureSupported('virtualThreads')}
        languageLabel={languageLabel}
      />

      <Divider label="Pagination & Caching" labelPosition="left" />

      <FeatureSwitch
        form={form}
        feature="caching"
        label="Caching"
        description="Enable response caching"
        isSupported={isFeatureSupported('caching')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="cursorPagination"
        label="Cursor Pagination"
        description="Enable cursor-based pagination"
        isSupported={isFeatureSupported('cursorPagination')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="etagSupport"
        label="ETag Support"
        description="Enable ETags for caching"
        isSupported={isFeatureSupported('etagSupport')}
        languageLabel={languageLabel}
      />

      <Divider label="Advanced Features" labelPosition="left" />

      <FeatureSwitch
        form={form}
        feature="rateLimiting"
        label="Rate Limiting"
        description="Enable request rate limiting"
        isSupported={isFeatureSupported('rateLimiting')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="i18n"
        label="Internationalization (i18n)"
        description="Multi-language support"
        isSupported={isFeatureSupported('i18n')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="webhooks"
        label="Webhooks"
        description="Send event notifications"
        isSupported={isFeatureSupported('webhooks')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="bulkOperations"
        label="Bulk Operations"
        description="Import/export in bulk"
        isSupported={isFeatureSupported('bulkOperations')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="batchOperations"
        label="Batch Operations"
        description="Batch CRUD operations"
        isSupported={isFeatureSupported('batchOperations')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="domainEvents"
        label="Domain Events"
        description="Publish domain events"
        isSupported={isFeatureSupported('domainEvents')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="sseUpdates"
        label="SSE Updates"
        description="Server-Sent Events for real-time updates"
        isSupported={isFeatureSupported('sseUpdates')}
        languageLabel={languageLabel}
      />

      <Divider label="Architecture" labelPosition="left" />

      <FeatureSwitch
        form={form}
        feature="multiTenancy"
        label="Multi-Tenancy"
        description="Support multiple tenants"
        isSupported={isFeatureSupported('multiTenancy')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="eventSourcing"
        label="Event Sourcing"
        description="Store events as source of truth"
        isSupported={isFeatureSupported('eventSourcing')}
        languageLabel={languageLabel}
      />

      <FeatureSwitch
        form={form}
        feature="apiVersioning"
        label="API Versioning"
        description="Support multiple API versions"
        isSupported={isFeatureSupported('apiVersioning')}
        languageLabel={languageLabel}
      />

      <Divider label="Deployment" labelPosition="left" />

      <FeatureSwitch
        form={form}
        feature="docker"
        label="Docker"
        description="Generate Dockerfile"
        isSupported={isFeatureSupported('docker')}
        languageLabel={languageLabel}
      />
    </Stack>
  );
}
