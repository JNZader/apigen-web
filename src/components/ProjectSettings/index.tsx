import { Alert, Button, Group, Modal, ScrollArea, Stack, Tabs, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAlertTriangle,
  IconBrandGraphql,
  IconClock,
  IconCode,
  IconDatabase,
  IconEye,
  IconFileText,
  IconFolder,
  IconGlobe,
  IconNetwork,
  IconPackage,
  IconRefresh,
  IconRocket,
  IconRouter,
  IconSettings,
  IconShield,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useProject, useProjectActions } from '../../store';
import type { Framework, Language, ProjectConfig } from '../../types';
import { notify } from '../../utils/notifications';
import { isValidArtifactId, isValidGroupId, isValidPackageName } from '../../utils/validation';
import { LanguageSelector } from '../LanguageSelector';
import { BasicSettingsForm } from './BasicSettingsForm';
import { CacheSettingsForm } from './CacheSettingsForm';
import { CorsSettingsForm } from './CorsSettingsForm';
import { DatabaseSettingsForm } from './DatabaseSettingsForm';
import { FeaturesSettingsForm } from './FeaturesSettingsForm';
import { FileStorageSettingsForm } from './FileStorageSettingsForm';
import { GatewaySettingsForm } from './GatewaySettingsForm';
import { GraphQLSettingsForm } from './GraphQLSettingsForm';
import { GrpcSettingsForm } from './GrpcSettingsForm';
import { FeaturePackSection } from './FeaturePackSection';
import { ObservabilitySettingsForm } from './ObservabilitySettingsForm';
import { RateLimitSettingsForm } from './RateLimitSettingsForm';
import { ResilienceSettingsForm } from './ResilienceSettingsForm';
import { SecuritySettingsForm } from './SecuritySettingsForm';

/**
 * Features that are specific to certain languages/frameworks.
 * Used to show warnings when switching languages.
 */
const LANGUAGE_SPECIFIC_FEATURES: Record<string, { languages: Language[]; label: string }> = {
  virtualThreads: { languages: ['java'], label: 'Virtual Threads (Java 21+)' },
  hateoas: { languages: ['java', 'kotlin'], label: 'HATEOAS' },
};

/**
 * Get list of incompatible features when switching to a new language.
 */
function getIncompatibleFeatures(
  features: ProjectConfig['features'],
  newLanguage: Language,
): string[] {
  const incompatible: string[] = [];

  for (const [featureKey, config] of Object.entries(LANGUAGE_SPECIFIC_FEATURES)) {
    const isEnabled = features[featureKey as keyof typeof features];
    const isCompatible = config.languages.includes(newLanguage);

    if (isEnabled && !isCompatible) {
      incompatible.push(config.label);
    }
  }

  return incompatible;
}

interface ProjectSettingsProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

// =============================================================================
// Feature Pack 2025 Forms - Re-exports for external use
// =============================================================================

// Feature Pack Forms
export { SocialLoginSettingsForm } from './SocialLoginSettingsForm';
export { MailServiceSettingsForm } from './MailServiceSettingsForm';
export { FileStorageSettingsForm } from './FileStorageSettingsForm';
export { PasswordResetSettingsForm } from './PasswordResetSettingsForm';
export { JteTemplatesSettingsForm } from './JteTemplatesSettingsForm';

// Containers
export { FeaturePackSection } from './FeaturePackSection';

// Core Settings Forms
export { BasicSettingsForm } from './BasicSettingsForm';
export { CacheSettingsForm } from './CacheSettingsForm';
export { CorsSettingsForm } from './CorsSettingsForm';
export { DatabaseSettingsForm } from './DatabaseSettingsForm';
export { FeaturesSettingsForm } from './FeaturesSettingsForm';
export { GatewaySettingsForm } from './GatewaySettingsForm';
export { GraphQLSettingsForm } from './GraphQLSettingsForm';
export { GrpcSettingsForm } from './GrpcSettingsForm';
export { ObservabilitySettingsForm } from './ObservabilitySettingsForm';
export { RateLimitSettingsForm } from './RateLimitSettingsForm';
export { ResilienceSettingsForm } from './ResilienceSettingsForm';
export { SecuritySettingsForm } from './SecuritySettingsForm';

// Rust/Axum Settings
export { RustOptionsPanel } from './RustOptionsPanel';

// Types
export type { SettingsFormProps } from './types';

// Future: Language Selector components (Phase 1)
// export { LanguageSelector } from './LanguageSelector';
// export { FrameworkCard } from './FrameworkCard';
// export { FeatureMatrix } from './FeatureMatrix';

// =============================================================================
// Main ProjectSettings Component
// =============================================================================

export function ProjectSettings({ opened, onClose }: ProjectSettingsProps) {
  const project = useProject();
  const { setProject } = useProjectActions();
  const [incompatibleFeatures, setIncompatibleFeatures] = useState<string[]>([]);

  const form = useForm<ProjectConfig>({
    initialValues: project,
    validate: {
      name: (v) => (v ? null : 'Project name is required'),
      groupId: (v) => (isValidGroupId(v) ? null : 'Invalid group ID (e.g., com.example)'),
      artifactId: (v) =>
        isValidArtifactId(v) ? null : 'Invalid artifact ID (lowercase, hyphens allowed)',
      packageName: (v) =>
        isValidPackageName(v) ? null : 'Invalid package name (e.g., com.example.myapi)',
    },
  });

  const handleLanguageChange = (language: Language, framework: Framework) => {
    // Check for incompatible features
    const incompatible = getIncompatibleFeatures(form.values.features, language);
    setIncompatibleFeatures(incompatible);

    // Update form with new target config
    form.setFieldValue('targetConfig.language', language);
    form.setFieldValue('targetConfig.framework', framework);
  };

  const handleSubmit = (values: ProjectConfig) => {
    setProject(values);
    notify.success({
      title: 'Saved',
      message: 'Project settings updated',
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconSettings size={20} />
          <Text fw={500}>Project Settings</Text>
        </Group>
      }
      size="xl"
      padding="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs defaultValue="language" orientation="vertical">
          <Tabs.List>
            <Tabs.Tab value="language" leftSection={<IconCode size={16} />}>
              Language
            </Tabs.Tab>
            <Tabs.Tab value="basic" leftSection={<IconFileText size={16} />}>
              Basic
            </Tabs.Tab>
            <Tabs.Tab value="database" leftSection={<IconDatabase size={16} />}>
              Database
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
              Security
            </Tabs.Tab>
            <Tabs.Tab value="rate-limit" leftSection={<IconClock size={16} />}>
              Rate Limiting
            </Tabs.Tab>
            <Tabs.Tab value="cache" leftSection={<IconRefresh size={16} />}>
              Cache
            </Tabs.Tab>
            <Tabs.Tab value="file-storage" leftSection={<IconFolder size={16} />}>
              File Storage
            </Tabs.Tab>
            <Tabs.Tab value="features" leftSection={<IconRocket size={16} />}>
              Features
            </Tabs.Tab>
            <Tabs.Tab value="observability" leftSection={<IconEye size={16} />}>
              Observability
            </Tabs.Tab>
            <Tabs.Tab value="resilience" leftSection={<IconShieldCheck size={16} />}>
              Resilience
            </Tabs.Tab>
            <Tabs.Tab value="cors" leftSection={<IconGlobe size={16} />}>
              CORS
            </Tabs.Tab>
            <Tabs.Tab value="graphql" leftSection={<IconBrandGraphql size={16} />}>
              GraphQL
            </Tabs.Tab>
            <Tabs.Tab value="grpc" leftSection={<IconNetwork size={16} />}>
              gRPC
            </Tabs.Tab>
            <Tabs.Tab value="gateway" leftSection={<IconRouter size={16} />}>
              Gateway
            </Tabs.Tab>
            <Tabs.Tab value="feature-pack" leftSection={<IconPackage size={16} />}>
              Feature Pack
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="language" pl="md">
            <ScrollArea h={600}>
              <Stack>
                <LanguageSelector onLanguageChange={handleLanguageChange} />
                {incompatibleFeatures.length > 0 && (
                  <Alert
                    icon={<IconAlertTriangle size={16} />}
                    title="Incompatible Features Detected"
                    color="yellow"
                    variant="light"
                  >
                    <Text size="sm">
                      The following features are not available for the selected language and will be
                      disabled:
                    </Text>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      {incompatibleFeatures.map((feature) => (
                        <li key={feature}>
                          <Text size="sm">{feature}</Text>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="basic" pl="md">
            <ScrollArea h={600}>
              <BasicSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="database" pl="md">
            <ScrollArea h={600}>
              <DatabaseSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="security" pl="md">
            <ScrollArea h={600}>
              <SecuritySettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="rate-limit" pl="md">
            <ScrollArea h={600}>
              <RateLimitSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="cache" pl="md">
            <ScrollArea h={600}>
              <CacheSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="file-storage" pl="md">
            <ScrollArea h={600}>
              <FileStorageSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="features" pl="md">
            <ScrollArea h={600}>
              <FeaturesSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="observability" pl="md">
            <ScrollArea h={600}>
              <ObservabilitySettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="resilience" pl="md">
            <ScrollArea h={600}>
              <ResilienceSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="cors" pl="md">
            <ScrollArea h={600}>
              <CorsSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="graphql" pl="md">
            <ScrollArea h={600}>
              <GraphQLSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="grpc" pl="md">
            <ScrollArea h={600}>
              <GrpcSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="gateway" pl="md">
            <ScrollArea h={600}>
              <GatewaySettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="feature-pack" pl="md">
            <ScrollArea h={600}>
              <FeaturePackSection form={form} />
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" color="blue">
            Save Settings
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
