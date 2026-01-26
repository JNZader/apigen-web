import { Checkbox, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconCloud,
  IconDatabase,
  IconLock,
  IconMail,
  IconPhoto,
  IconShieldLock,
} from '@tabler/icons-react';
import { memo } from 'react';
import type { WizardData } from '../ProjectWizard';

interface FeaturesStepProps {
  readonly data: Pick<WizardData, 'features'>;
  readonly onChange: (updates: Partial<WizardData>) => void;
}

interface FeatureOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const FEATURE_OPTIONS: FeatureOption[] = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'JWT-based user authentication',
    icon: <IconLock size={20} />,
    color: 'blue',
  },
  {
    id: 'socialLogin',
    name: 'Social Login',
    description: 'OAuth providers (Google, GitHub)',
    icon: <IconShieldLock size={20} />,
    color: 'violet',
  },
  {
    id: 'mailService',
    name: 'Mail Service',
    description: 'Email sending capabilities',
    icon: <IconMail size={20} />,
    color: 'teal',
  },
  {
    id: 'fileStorage',
    name: 'File Storage',
    description: 'File upload and storage',
    icon: <IconPhoto size={20} />,
    color: 'orange',
  },
  {
    id: 'caching',
    name: 'Caching',
    description: 'Redis-based caching',
    icon: <IconDatabase size={20} />,
    color: 'red',
  },
  {
    id: 'cloudStorage',
    name: 'Cloud Storage',
    description: 'S3-compatible storage',
    icon: <IconCloud size={20} />,
    color: 'cyan',
  },
];

export const FeaturesStep = memo(function FeaturesStep({ data, onChange }: FeaturesStepProps) {
  const handleToggleFeature = (featureId: string) => {
    const newFeatures = data.features.includes(featureId)
      ? data.features.filter((f) => f !== featureId)
      : [...data.features, featureId];
    onChange({ features: newFeatures });
  };

  return (
    <Stack gap="md">
      <div>
        <Text fw={600} size="sm" mb="xs">
          Select Initial Features
        </Text>
        <Text c="dimmed" size="sm" mb="md">
          Choose features to include in your project. You can add more later.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {FEATURE_OPTIONS.map((feature) => {
          const isSelected = data.features.includes(feature.id);

          return (
            <Paper
              key={feature.id}
              withBorder
              p="md"
              radius="md"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? `var(--mantine-color-${feature.color}-5)` : undefined,
                backgroundColor: isSelected
                  ? `var(--mantine-color-${feature.color}-light)`
                  : undefined,
              }}
              onClick={() => handleToggleFeature(feature.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleFeature(feature.id);
                }
              }}
              tabIndex={0}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={`${feature.name}: ${feature.description}`}
              data-testid={`feature-card-${feature.id}`}
            >
              <Group wrap="nowrap">
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleToggleFeature(feature.id)}
                  tabIndex={-1}
                  aria-hidden
                />
                <ThemeIcon
                  size="lg"
                  radius="md"
                  color={feature.color}
                  variant={isSelected ? 'filled' : 'light'}
                >
                  {feature.icon}
                </ThemeIcon>
                <div>
                  <Text fw={600} size="sm">
                    {feature.name}
                  </Text>
                  <Text c="dimmed" size="xs">
                    {feature.description}
                  </Text>
                </div>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
});
