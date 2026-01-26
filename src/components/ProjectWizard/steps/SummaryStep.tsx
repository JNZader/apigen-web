import {
  Badge,
  Card,
  Divider,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconApi,
  IconBrandDocker,
  IconBrandGolang,
  IconBrandPhp,
  IconBrandPython,
  IconBrandRust,
  IconBrandTypescript,
  IconCheck,
  IconCode,
  IconCoffee,
  IconDatabase,
  IconDiamond,
  IconHash,
  IconPackage,
  IconServer,
  IconSettings,
} from '@tabler/icons-react';
import { useFeatures, useProject, useTargetConfig } from '../../../store';
import { FEATURE_LABELS, type FeatureKey } from '../../../types/config/featureCompatibility';
import type { ProjectFeatures } from '../../../types/project';
import { FRAMEWORK_METADATA, LANGUAGE_METADATA, type Language } from '../../../types/target';

const LANGUAGE_ICONS: Record<Language, React.ReactNode> = {
  java: <IconCoffee size={24} />,
  kotlin: <IconDiamond size={24} />,
  python: <IconBrandPython size={24} />,
  typescript: <IconBrandTypescript size={24} />,
  php: <IconBrandPhp size={24} />,
  go: <IconBrandGolang size={24} />,
  rust: <IconBrandRust size={24} />,
  csharp: <IconHash size={24} />,
};

const LANGUAGE_COLORS: Record<Language, string> = {
  java: 'orange',
  kotlin: 'grape',
  python: 'yellow',
  typescript: 'blue',
  php: 'indigo',
  go: 'cyan',
  rust: 'orange.8',
  csharp: 'violet',
};

interface FeatureGroup {
  title: string;
  icon: React.ReactNode;
  color: string;
  features: FeatureKey[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: 'Core',
    icon: <IconServer size={16} />,
    color: 'blue',
    features: ['hateoas', 'swagger', 'softDelete', 'auditing', 'virtualThreads'],
  },
  {
    title: 'Data',
    icon: <IconDatabase size={16} />,
    color: 'green',
    features: ['caching', 'cursorPagination', 'etagSupport'],
  },
  {
    title: 'Advanced',
    icon: <IconApi size={16} />,
    color: 'violet',
    features: [
      'rateLimiting',
      'i18n',
      'webhooks',
      'bulkOperations',
      'batchOperations',
      'domainEvents',
      'sseUpdates',
    ],
  },
  {
    title: 'Architecture',
    icon: <IconSettings size={16} />,
    color: 'orange',
    features: ['multiTenancy', 'eventSourcing', 'apiVersioning'],
  },
  {
    title: 'Security',
    icon: <IconPackage size={16} />,
    color: 'red',
    features: ['socialLogin', 'passwordReset'],
  },
  {
    title: 'Services',
    icon: <IconCode size={16} />,
    color: 'cyan',
    features: ['mailService', 'fileStorage', 'jteTemplates'],
  },
  {
    title: 'Deployment',
    icon: <IconBrandDocker size={16} />,
    color: 'gray',
    features: ['docker'],
  },
];

export function SummaryStep() {
  const project = useProject();
  const targetConfig = useTargetConfig();
  const features = useFeatures();

  const languageMeta = LANGUAGE_METADATA[targetConfig.language];
  const frameworkMeta = FRAMEWORK_METADATA[targetConfig.framework];
  const languageColor = LANGUAGE_COLORS[targetConfig.language];

  const enabledFeatures = (Object.keys(features) as FeatureKey[]).filter(
    (key) => features[key as keyof ProjectFeatures],
  );

  const getEnabledFeaturesForGroup = (group: FeatureGroup) =>
    group.features.filter((f) => features[f as keyof ProjectFeatures]);

  return (
    <Stack gap="xl">
      <div>
        <Text fw={600} size="lg" mb="md">
          Project Summary
        </Text>
        <Text size="sm" c="dimmed" mb="lg">
          Review your configuration before completing the wizard.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Card withBorder padding="lg" radius="md">
          <Group gap="md" mb="md">
            <ThemeIcon size="xl" radius="md" color={languageColor} variant="filled">
              {LANGUAGE_ICONS[targetConfig.language]}
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">
                {languageMeta.label}
              </Text>
              <Text size="sm" c="dimmed">
                Version {targetConfig.languageVersion}
              </Text>
            </div>
          </Group>
          <Divider mb="md" />
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Package Manager
              </Text>
              <Badge variant="light" color="gray">
                {languageMeta.packageManager}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                File Extension
              </Text>
              <Badge variant="light" color="gray">
                {languageMeta.fileExtension}
              </Badge>
            </Group>
          </Stack>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Group gap="md" mb="md">
            <ThemeIcon size="xl" radius="md" color="blue" variant="filled">
              <IconCode size={24} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">
                {frameworkMeta.label}
              </Text>
              <Text size="sm" c="dimmed">
                Version {targetConfig.frameworkVersion}
              </Text>
            </div>
          </Group>
          <Divider mb="md" />
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Documentation
              </Text>
              <Badge
                component="a"
                href={frameworkMeta.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
                color="blue"
                style={{ cursor: 'pointer' }}
              >
                View Docs
              </Badge>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder padding="lg" radius="md">
        <Group gap="md" mb="md">
          <ThemeIcon size="lg" radius="md" color="green" variant="filled">
            <IconCheck size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="md">
              Enabled Features
            </Text>
            <Text size="sm" c="dimmed">
              {enabledFeatures.length} features selected
            </Text>
          </div>
        </Group>
        <Divider mb="md" />

        {enabledFeatures.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No features selected. You can always enable them later in Project Settings.
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {FEATURE_GROUPS.map((group) => {
              const enabled = getEnabledFeaturesForGroup(group);
              if (enabled.length === 0) return null;

              return (
                <Card key={group.title} withBorder padding="sm" radius="md">
                  <Group gap="xs" mb="xs">
                    <ThemeIcon size="sm" radius="sm" color={group.color} variant="light">
                      {group.icon}
                    </ThemeIcon>
                    <Text size="sm" fw={500}>
                      {group.title}
                    </Text>
                    <Badge size="xs" variant="light" color={group.color}>
                      {enabled.length}
                    </Badge>
                  </Group>
                  <List
                    size="xs"
                    spacing={2}
                    icon={
                      <ThemeIcon size={14} radius="xl" color="green" variant="light">
                        <IconCheck size={8} />
                      </ThemeIcon>
                    }
                  >
                    {enabled.map((feature) => (
                      <List.Item key={feature}>
                        <Text size="xs">{FEATURE_LABELS[feature]}</Text>
                      </List.Item>
                    ))}
                  </List>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Card>

      <Card withBorder padding="lg" radius="md" bg="var(--mantine-color-gray-light)">
        <Group gap="md" mb="md">
          <ThemeIcon size="lg" radius="md" color="gray" variant="filled">
            <IconPackage size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="md">
              Project Details
            </Text>
            <Text size="sm" c="dimmed">
              Basic project configuration
            </Text>
          </div>
        </Group>
        <Divider mb="md" />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Project Name
            </Text>
            <Text size="sm" fw={500}>
              {project.name}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Group ID
            </Text>
            <Text size="sm" fw={500}>
              {project.groupId}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Artifact ID
            </Text>
            <Text size="sm" fw={500}>
              {project.artifactId}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Package Name
            </Text>
            <Text size="sm" fw={500}>
              {project.packageName}
            </Text>
          </Group>
        </SimpleGrid>
      </Card>

      <Card withBorder padding="md" radius="md" bg="var(--mantine-color-blue-light)">
        <Group gap="md" align="flex-start">
          <ThemeIcon size="lg" radius="md" color="blue" variant="filled">
            <IconCheck size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="sm">
              Ready to Start
            </Text>
            <Text size="xs" c="dimmed">
              Click "Complete" to finish the wizard and start designing your API. You can always
              modify these settings later in Project Settings.
            </Text>
          </div>
        </Group>
      </Card>
    </Stack>
  );
}
