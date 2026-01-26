import {
  Alert,
  Badge,
  Checkbox,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconBrandGoogle,
  IconInfoCircle,
  IconKey,
  IconMail,
  IconTemplate,
  IconUpload,
} from '@tabler/icons-react';
import { memo } from 'react';
import { isFeatureSupportedByLanguage } from '@/config/featureCompatibility';
import type { Language } from '@/types/target';

interface FeaturesStepProps {
  readonly data: { language: string; features: string[] };
  readonly onChange: (updates: Partial<FeaturesStepProps['data']>) => void;
}

const AVAILABLE_FEATURES = [
  {
    id: 'SOCIAL_LOGIN',
    name: 'Social Login',
    description: 'OAuth2 with Google, GitHub, etc.',
    icon: <IconBrandGoogle size={20} />,
  },
  {
    id: 'MAIL_SERVICE',
    name: 'Mail Service',
    description: 'SMTP email support',
    icon: <IconMail size={20} />,
  },
  {
    id: 'FILE_STORAGE',
    name: 'File Upload',
    description: 'Local, S3, or Azure storage',
    icon: <IconUpload size={20} />,
  },
  {
    id: 'PASSWORD_RESET',
    name: 'Password Reset',
    description: 'Email-based password recovery',
    icon: <IconKey size={20} />,
  },
  {
    id: 'JTE_TEMPLATES',
    name: 'JTE Templates',
    description: 'Server-side rendering (Java/Kotlin only)',
    icon: <IconTemplate size={20} />,
  },
] as const;

export const FeaturesStep = memo(function FeaturesStep({
  data,
  onChange,
}: FeaturesStepProps) {
  const toggleFeature = (featureId: string) => {
    const current = data.features;
    const updated = current.includes(featureId)
      ? current.filter((f) => f !== featureId)
      : [...current, featureId];
    onChange({ features: updated });
  };

  return (
    <Stack gap="md">
      <div>
        <Text fw={500}>Select Initial Features</Text>
        <Text size="sm" c="dimmed">
          You can always enable more features later in Project Settings
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {AVAILABLE_FEATURES.map((feature) => {
          const isSupported = isFeatureSupportedByLanguage(
            feature.id as Parameters<typeof isFeatureSupportedByLanguage>[0],
            data.language as Language
          );
          const isSelected = data.features.includes(feature.id);

          return (
            <Paper
              key={feature.id}
              withBorder
              p="sm"
              radius="md"
              style={{
                cursor: isSupported ? 'pointer' : 'not-allowed',
                opacity: isSupported ? 1 : 0.5,
                borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
                borderWidth: isSelected ? 2 : 1,
              }}
              onClick={() => isSupported && toggleFeature(feature.id)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={!isSupported}
                    aria-label={`Select ${feature.name}`}
                  />
                  <div>
                    <Group gap="xs">
                      {feature.icon}
                      <Text size="sm" fw={500}>
                        {feature.name}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {feature.description}
                    </Text>
                  </div>
                </Group>
                {!isSupported && (
                  <Badge size="xs" color="gray">
                    N/A
                  </Badge>
                )}
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        <Text size="sm">
          Features can be configured in detail after project creation. Select the ones you plan
          to use.
        </Text>
      </Alert>
    </Stack>
  );
});
