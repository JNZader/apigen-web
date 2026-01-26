import {
  Badge,
  Card,
  Checkbox,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconApi,
  IconBox,
  IconBrandDocker,
  IconCheck,
  IconClock,
  IconDatabase,
  IconLanguage,
  IconLock,
  IconRefresh,
  IconServer,
  IconWebhook,
} from '@tabler/icons-react';
import { useCallback } from 'react';
import { useLanguageFeatureSync } from '../../../hooks';
import { useFeatures, useTargetConfig } from '../../../store';
import {
  FEATURE_LABELS,
  type FeatureKey,
  getFeatureDependencies,
} from '../../../types/config/featureCompatibility';
import { LANGUAGE_METADATA } from '../../../types/target';

interface FeatureCategory {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly features: {
    readonly key: FeatureKey;
    readonly description: string;
  }[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: 'Core Features',
    icon: <IconServer size={18} />,
    features: [
      { key: 'hateoas', description: 'Include hypermedia links in API responses' },
      { key: 'swagger', description: 'Generate OpenAPI/Swagger documentation' },
      { key: 'softDelete', description: 'Logical deletion instead of physical removal' },
      { key: 'auditing', description: 'Track createdAt, updatedAt, createdBy, updatedBy' },
      { key: 'virtualThreads', description: 'Use Java 21+ virtual threads for concurrency' },
    ],
  },
  {
    title: 'Pagination & Caching',
    icon: <IconDatabase size={18} />,
    features: [
      { key: 'caching', description: 'Enable response caching for better performance' },
      { key: 'cursorPagination', description: 'Cursor-based pagination for large datasets' },
      { key: 'etagSupport', description: 'ETag headers for cache validation' },
    ],
  },
  {
    title: 'Advanced Features',
    icon: <IconApi size={18} />,
    features: [
      { key: 'rateLimiting', description: 'Protect API from excessive requests' },
      { key: 'i18n', description: 'Multi-language support for responses' },
      { key: 'webhooks', description: 'Send event notifications to external systems' },
      { key: 'bulkOperations', description: 'Import/export data in bulk' },
      { key: 'batchOperations', description: 'Batch multiple CRUD operations' },
      { key: 'domainEvents', description: 'Publish domain events for event-driven architecture' },
      { key: 'sseUpdates', description: 'Server-Sent Events for real-time updates' },
    ],
  },
  {
    title: 'Architecture',
    icon: <IconBox size={18} />,
    features: [
      { key: 'multiTenancy', description: 'Support multiple tenants in one instance' },
      { key: 'eventSourcing', description: 'Store events as the source of truth' },
      { key: 'apiVersioning', description: 'Support multiple API versions simultaneously' },
    ],
  },
  {
    title: 'Security & Authentication',
    icon: <IconLock size={18} />,
    features: [
      { key: 'socialLogin', description: 'OAuth2 login with Google, GitHub, etc.' },
      { key: 'passwordReset', description: 'Password reset via email' },
    ],
  },
  {
    title: 'Services',
    icon: <IconWebhook size={18} />,
    features: [
      { key: 'mailService', description: 'SMTP email sending service' },
      { key: 'fileStorage', description: 'File storage (local, S3, GCS, Azure)' },
      { key: 'jteTemplates', description: 'JTE templates for email rendering' },
    ],
  },
  {
    title: 'Deployment',
    icon: <IconBrandDocker size={18} />,
    features: [{ key: 'docker', description: 'Generate Dockerfile and docker-compose' }],
  },
];

const FEATURE_ICONS: Partial<Record<FeatureKey, React.ReactNode>> = {
  hateoas: <IconApi size={16} />,
  swagger: <IconApi size={16} />,
  softDelete: <IconRefresh size={16} />,
  auditing: <IconClock size={16} />,
  virtualThreads: <IconServer size={16} />,
  caching: <IconDatabase size={16} />,
  cursorPagination: <IconDatabase size={16} />,
  etagSupport: <IconDatabase size={16} />,
  rateLimiting: <IconLock size={16} />,
  i18n: <IconLanguage size={16} />,
  webhooks: <IconWebhook size={16} />,
  bulkOperations: <IconBox size={16} />,
  batchOperations: <IconBox size={16} />,
  domainEvents: <IconServer size={16} />,
  sseUpdates: <IconServer size={16} />,
  multiTenancy: <IconBox size={16} />,
  eventSourcing: <IconDatabase size={16} />,
  apiVersioning: <IconApi size={16} />,
  socialLogin: <IconLock size={16} />,
  passwordReset: <IconLock size={16} />,
  mailService: <IconWebhook size={16} />,
  fileStorage: <IconDatabase size={16} />,
  jteTemplates: <IconBox size={16} />,
  docker: <IconBrandDocker size={16} />,
};

interface FeatureCheckboxProps {
  readonly featureKey: FeatureKey;
  readonly description: string;
  readonly isSupported: boolean;
  readonly isEnabled: boolean;
  readonly languageLabel: string;
  readonly dependencies: FeatureKey[];
  readonly onToggle: (key: FeatureKey, enabled: boolean) => void;
}

function FeatureCheckbox({
  featureKey,
  description,
  isSupported,
  isEnabled,
  languageLabel,
  dependencies,
  onToggle,
}: FeatureCheckboxProps) {
  const label = FEATURE_LABELS[featureKey];
  const icon = FEATURE_ICONS[featureKey] || <IconCheck size={16} />;

  if (!isSupported) {
    return (
      <Tooltip
        label={`${label} is not available for ${languageLabel}`}
        position="top"
        withArrow
        multiline
        w={220}
      >
        <Card
          padding="sm"
          radius="md"
          withBorder
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
          data-testid={`wizard-feature-${featureKey}-unsupported`}
        >
          <Group wrap="nowrap" gap="sm">
            <ThemeIcon size="md" radius="md" color="gray" variant="light">
              {icon}
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {label}
                </Text>
                <Badge size="xs" color="gray" variant="light">
                  N/A
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            </div>
            <IconAlertCircle size={16} color="var(--mantine-color-gray-5)" />
          </Group>
        </Card>
      </Tooltip>
    );
  }

  const hasDependencies = dependencies.length > 0;
  const dependencyLabels = dependencies.map((d) => FEATURE_LABELS[d]).join(', ');

  return (
    <Tooltip
      label={hasDependencies ? `Requires: ${dependencyLabels}` : description}
      position="top"
      withArrow
      multiline
      w={250}
      openDelay={500}
    >
      <Card
        padding="sm"
        radius="md"
        withBorder
        bd={isEnabled ? '2px solid var(--mantine-color-blue-6)' : undefined}
        bg={isEnabled ? 'var(--mantine-color-blue-light)' : undefined}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => onToggle(featureKey, !isEnabled)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(featureKey, !isEnabled);
          }
        }}
        tabIndex={0}
        role="checkbox"
        aria-checked={isEnabled}
        aria-label={`${label}: ${description}`}
        data-testid={`wizard-feature-${featureKey}`}
      >
        <Group wrap="nowrap" gap="sm">
          <ThemeIcon
            size="md"
            radius="md"
            color={isEnabled ? 'blue' : 'gray'}
            variant={isEnabled ? 'filled' : 'light'}
          >
            {icon}
          </ThemeIcon>
          <div style={{ flex: 1 }}>
            <Group gap="xs">
              <Text size="sm" fw={isEnabled ? 600 : 500}>
                {label}
              </Text>
              {hasDependencies && (
                <Badge size="xs" color="orange" variant="light">
                  +deps
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {description}
            </Text>
          </div>
          <Checkbox
            checked={isEnabled}
            onChange={() => {}}
            tabIndex={-1}
            aria-hidden
            styles={{ input: { cursor: 'pointer' } }}
          />
        </Group>
      </Card>
    </Tooltip>
  );
}

export function FeaturesStep() {
  const targetConfig = useTargetConfig();
  const features = useFeatures();
  const {
    isFeatureSupported,
    enableFeatureWithDependencies,
    disableFeatureWithDependents,
    unsupportedFeatures,
  } = useLanguageFeatureSync();

  const languageLabel = LANGUAGE_METADATA[targetConfig.language].label;

  const handleFeatureToggle = useCallback(
    (key: FeatureKey, enabled: boolean) => {
      if (enabled) {
        enableFeatureWithDependencies(key);
      } else {
        disableFeatureWithDependents(key);
      }
    },
    [enableFeatureWithDependencies, disableFeatureWithDependents],
  );

  const enabledCount = Object.values(features).filter(Boolean).length;
  const supportedCount = Object.keys(features).length - unsupportedFeatures.length;

  return (
    <Stack gap="xl">
      <div>
        <Group justify="space-between" align="flex-start" mb="md">
          <div>
            <Text fw={600} size="lg">
              Select Features
            </Text>
            <Text size="sm" c="dimmed">
              Choose the features you want in your {languageLabel} API project.
            </Text>
          </div>
          <Badge size="lg" variant="light" color="blue">
            {enabledCount} / {supportedCount} enabled
          </Badge>
        </Group>

        {unsupportedFeatures.length > 0 && (
          <Card withBorder padding="sm" radius="md" bg="var(--mantine-color-yellow-light)" mb="lg">
            <Group gap="xs">
              <IconAlertCircle size={16} color="var(--mantine-color-yellow-6)" />
              <Text size="sm">
                Some features are not available for {languageLabel}. They are shown as disabled.
              </Text>
            </Group>
          </Card>
        )}
      </div>

      {FEATURE_CATEGORIES.map((category) => {
        const supportedInCategory = category.features.filter((f) =>
          isFeatureSupported(f.key),
        ).length;
        const enabledInCategory = category.features.filter(
          (f) => isFeatureSupported(f.key) && features[f.key],
        ).length;

        return (
          <div key={category.title}>
            <Divider
              label={
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="gray">
                    {category.icon}
                  </ThemeIcon>
                  <Text fw={500}>{category.title}</Text>
                  <Badge size="xs" variant="light" color="gray">
                    {enabledInCategory}/{supportedInCategory}
                  </Badge>
                </Group>
              }
              labelPosition="left"
              mb="md"
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {category.features.map(({ key, description }) => (
                <FeatureCheckbox
                  key={key}
                  featureKey={key}
                  description={description}
                  isSupported={isFeatureSupported(key)}
                  isEnabled={features[key]}
                  languageLabel={languageLabel}
                  dependencies={getFeatureDependencies(key)}
                  onToggle={handleFeatureToggle}
                />
              ))}
            </SimpleGrid>
          </div>
        );
      })}
    </Stack>
  );
}
