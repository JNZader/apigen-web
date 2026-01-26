import { Divider, SimpleGrid, Stack, Switch, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconRocket } from '@tabler/icons-react';
import type { ProjectConfig, ProjectFeatures } from '../../../types';
import { WizardStep } from '../WizardStep';

interface FeaturesStepProps {
  readonly form: UseFormReturnType<ProjectConfig>;
}

interface FeatureOption {
  readonly key: keyof ProjectFeatures;
  readonly label: string;
  readonly description: string;
}

const CORE_FEATURES: FeatureOption[] = [
  { key: 'swagger', label: 'Swagger/OpenAPI', description: 'API documentation' },
  { key: 'hateoas', label: 'HATEOAS Links', description: 'Hypermedia links' },
  { key: 'softDelete', label: 'Soft Delete', description: 'Logical deletion' },
  { key: 'auditing', label: 'Auditing', description: 'Track changes' },
];

const PERFORMANCE_FEATURES: FeatureOption[] = [
  { key: 'caching', label: 'Caching', description: 'Response caching' },
  { key: 'cursorPagination', label: 'Cursor Pagination', description: 'Efficient pagination' },
  { key: 'etagSupport', label: 'ETag Support', description: 'Cache validation' },
  { key: 'virtualThreads', label: 'Virtual Threads', description: 'Java 21+ threads' },
];

const ADVANCED_FEATURES: FeatureOption[] = [
  { key: 'rateLimiting', label: 'Rate Limiting', description: 'Request throttling' },
  { key: 'domainEvents', label: 'Domain Events', description: 'Event publishing' },
  { key: 'batchOperations', label: 'Batch Operations', description: 'Bulk CRUD' },
  { key: 'docker', label: 'Docker', description: 'Containerization' },
];

function FeatureGrid({
  features,
  form,
}: {
  readonly features: readonly FeatureOption[];
  readonly form: UseFormReturnType<ProjectConfig>;
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      {features.map((feature) => (
        <Switch
          key={feature.key}
          label={feature.label}
          description={feature.description}
          {...form.getInputProps(`features.${feature.key}`, { type: 'checkbox' })}
        />
      ))}
    </SimpleGrid>
  );
}

export function FeaturesStep({ form }: FeaturesStepProps) {
  return (
    <WizardStep
      icon={<IconRocket size={24} />}
      title="Features"
      description="Select the features you want to include in your project"
    >
      <Stack gap="md">
        <div>
          <Text fw={600} size="sm" mb="xs">
            Core Features
          </Text>
          <FeatureGrid features={CORE_FEATURES} form={form} />
        </div>

        <Divider />

        <div>
          <Text fw={600} size="sm" mb="xs">
            Performance
          </Text>
          <FeatureGrid features={PERFORMANCE_FEATURES} form={form} />
        </div>

        <Divider />

        <div>
          <Text fw={600} size="sm" mb="xs">
            Advanced
          </Text>
          <FeatureGrid features={ADVANCED_FEATURES} form={form} />
        </div>
      </Stack>
    </WizardStep>
  );
}
