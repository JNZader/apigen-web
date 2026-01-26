import {
  Badge,
  Divider,
  Group,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconCheck, IconCode, IconPackage, IconSettings } from '@tabler/icons-react';
import { memo, createElement } from 'react';
import { LANGUAGE_CONFIGS, FRAMEWORK_CONFIGS } from '@/config/languageConfigs';
import type { Language, Framework } from '@/types/target';

interface SummaryStepProps {
  readonly data: {
    projectName: string;
    description: string;
    packageName: string;
    language: string;
    framework: string;
    features: string[];
  };
}

const FEATURE_LABELS: Record<string, string> = {
  SOCIAL_LOGIN: 'Social Login',
  MAIL_SERVICE: 'Mail Service',
  FILE_STORAGE: 'File Storage',
  PASSWORD_RESET: 'Password Reset',
  JTE_TEMPLATES: 'JTE Templates',
};

export const SummaryStep = memo(function SummaryStep({ data }: SummaryStepProps) {
  const languageConfig = LANGUAGE_CONFIGS[data.language as Language];
  const frameworkConfig = FRAMEWORK_CONFIGS[data.framework as Framework];

  return (
    <Stack gap="md">
      <Text fw={500} size="lg">
        Review Your Project
      </Text>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <IconPackage size={20} />
              <Text fw={500}>Project Info</Text>
            </Group>
          </Group>
          <Divider />
          <div>
            <Text size="sm" c="dimmed">
              Name
            </Text>
            <Text fw={500}>{data.projectName}</Text>
          </div>
          {data.description && (
            <div>
              <Text size="sm" c="dimmed">
                Description
              </Text>
              <Text size="sm">{data.description}</Text>
            </div>
          )}
          <div>
            <Text size="sm" c="dimmed">
              Package
            </Text>
            <Text size="sm" style={{ fontFamily: 'monospace' }}>
              {data.packageName}
            </Text>
          </div>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group gap="xs">
            <IconCode size={20} />
            <Text fw={500}>Technology Stack</Text>
          </Group>
          <Divider />
          <Group gap="xs">
            {languageConfig && (
              <Badge color={languageConfig.color} size="lg" leftSection={
                createElement(languageConfig.icon, { size: 14 })
              }>
                {languageConfig.label}
              </Badge>
            )}
            {frameworkConfig && (
              <Badge variant="outline" size="lg" leftSection={
                createElement(frameworkConfig.icon, { size: 14 })
              }>
                {frameworkConfig.label}
              </Badge>
            )}
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group gap="xs">
            <IconSettings size={20} />
            <Text fw={500}>Selected Features</Text>
          </Group>
          <Divider />
          {data.features.length > 0 ? (
            <List
              spacing="xs"
              icon={
                <ThemeIcon color="green" size={20} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              {data.features.map((feature) => (
                <List.Item key={feature}>
                  <Text size="sm">
                    {FEATURE_LABELS[feature] || feature}
                  </Text>
                </List.Item>
              ))}
            </List>
          ) : (
            <Text size="sm" c="dimmed">
              No additional features selected
            </Text>
          )}
        </Stack>
      </Paper>

      <Text size="sm" c="dimmed" ta="center">
        Click "Create Project" to generate your project with these settings. You can modify
        settings anytime from Project Settings.
      </Text>
    </Stack>
  );
});
