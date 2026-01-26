import { Badge, Card, Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import {
  IconCheck,
  IconClipboardList,
  IconCode,
  IconPackage,
  IconRocket,
} from '@tabler/icons-react';
import type { ProjectConfig, ProjectFeatures } from '../../../types';
import { FRAMEWORK_METADATA, LANGUAGE_METADATA } from '../../../types/target';
import { WizardStep } from '../WizardStep';

interface SummaryStepProps {
  readonly form: UseFormReturnType<ProjectConfig>;
}

function getEnabledFeatures(features: ProjectFeatures): string[] {
  const featureLabels: Record<keyof ProjectFeatures, string> = {
    hateoas: 'HATEOAS',
    swagger: 'Swagger/OpenAPI',
    softDelete: 'Soft Delete',
    auditing: 'Auditing',
    caching: 'Caching',
    rateLimiting: 'Rate Limiting',
    virtualThreads: 'Virtual Threads',
    docker: 'Docker',
    i18n: 'i18n',
    webhooks: 'Webhooks',
    bulkOperations: 'Bulk Operations',
    batchOperations: 'Batch Operations',
    multiTenancy: 'Multi-Tenancy',
    eventSourcing: 'Event Sourcing',
    apiVersioning: 'API Versioning',
    cursorPagination: 'Cursor Pagination',
    etagSupport: 'ETag Support',
    domainEvents: 'Domain Events',
    sseUpdates: 'SSE Updates',
    socialLogin: 'Social Login',
    passwordReset: 'Password Reset',
    mailService: 'Mail Service',
    fileStorage: 'File Storage',
    jteTemplates: 'JTE Templates',
  };

  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => featureLabels[key as keyof ProjectFeatures])
    .filter(Boolean);
}

export function SummaryStep({ form }: SummaryStepProps) {
  const { values } = form;
  const languageMeta = LANGUAGE_METADATA[values.targetConfig?.language ?? 'java'];
  const frameworkMeta = FRAMEWORK_METADATA[values.targetConfig?.framework ?? 'spring-boot'];
  const enabledFeatures = getEnabledFeatures(values.features);

  return (
    <WizardStep
      icon={<IconClipboardList size={24} />}
      title="Summary"
      description="Review your project configuration before creating"
    >
      <Stack gap="md">
        <Card withBorder padding="md" radius="md">
          <Group gap="sm" mb="sm">
            <ThemeIcon size="sm" color="blue" variant="light">
              <IconPackage size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              Project Details
            </Text>
          </Group>
          <SimpleGrid cols={2} spacing="xs">
            <Text size="sm" c="dimmed">
              Name:
            </Text>
            <Text size="sm" fw={500}>
              {values.name || '-'}
            </Text>
            <Text size="sm" c="dimmed">
              Group ID:
            </Text>
            <Text size="sm" fw={500}>
              {values.groupId || '-'}
            </Text>
            <Text size="sm" c="dimmed">
              Artifact ID:
            </Text>
            <Text size="sm" fw={500}>
              {values.artifactId || '-'}
            </Text>
            <Text size="sm" c="dimmed">
              Package:
            </Text>
            <Text size="sm" fw={500}>
              {values.packageName || '-'}
            </Text>
          </SimpleGrid>
        </Card>

        <Card withBorder padding="md" radius="md">
          <Group gap="sm" mb="sm">
            <ThemeIcon size="sm" color="grape" variant="light">
              <IconCode size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              Language & Framework
            </Text>
          </Group>
          <Group gap="sm">
            <Badge variant="light" color="orange">
              {languageMeta.label} v{values.targetConfig?.languageVersion ?? languageMeta.defaultVersion}
            </Badge>
            <Badge variant="light" color="blue">
              {frameworkMeta.label} v{values.targetConfig?.frameworkVersion ?? frameworkMeta.defaultVersion}
            </Badge>
          </Group>
        </Card>

        <Card withBorder padding="md" radius="md">
          <Group gap="sm" mb="sm">
            <ThemeIcon size="sm" color="teal" variant="light">
              <IconRocket size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              Enabled Features ({enabledFeatures.length})
            </Text>
          </Group>
          {enabledFeatures.length > 0 ? (
            <Group gap="xs">
              {enabledFeatures.map((feature) => (
                <Badge
                  key={feature}
                  size="sm"
                  variant="dot"
                  color="teal"
                  leftSection={<IconCheck size={10} />}
                >
                  {feature}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              No features selected
            </Text>
          )}
        </Card>
      </Stack>
    </WizardStep>
  );
}
