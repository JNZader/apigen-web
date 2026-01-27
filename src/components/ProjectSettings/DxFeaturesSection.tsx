import {
  Alert,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconBrandDocker,
  IconBrandGithub,
  IconGitCommit,
  IconInfoCircle,
  IconScript,
  IconTerminal2,
} from '@tabler/icons-react';
import { useFeatures, useProjectStoreInternal } from '../../store';
import type { ProjectFeatures } from '../../types';

/**
 * DX Feature keys type
 */
type DxFeatureKey = 'miseTasks' | 'preCommit' | 'setupScript' | 'githubTemplates' | 'devCompose';

/**
 * DX Feature configuration interface
 */
interface DxFeature {
  key: DxFeatureKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  files: string[];
}

/**
 * DX Features configuration
 */
const DX_FEATURES: DxFeature[] = [
  {
    key: 'miseTasks',
    label: 'Mise Tasks',
    description: 'Universal task runner configuration with dev, test, lint, fmt, build commands',
    icon: <IconTerminal2 size={20} />,
    color: 'blue',
    files: ['mise.toml'],
  },
  {
    key: 'preCommit',
    label: 'Pre-commit Hooks',
    description:
      'Git hooks for code formatting, linting, conventional commits, and secret detection',
    icon: <IconGitCommit size={20} />,
    color: 'violet',
    files: ['.pre-commit-config.yaml', '.secrets.baseline'],
  },
  {
    key: 'setupScript',
    label: 'Setup Scripts',
    description: 'Automated setup for Unix (bash) and Windows (PowerShell) environments',
    icon: <IconScript size={20} />,
    color: 'green',
    files: ['scripts/setup.sh', 'scripts/setup.ps1'],
  },
  {
    key: 'githubTemplates',
    label: 'GitHub Templates',
    description: 'PR and Issue templates for consistent contribution workflow',
    icon: <IconBrandGithub size={20} />,
    color: 'gray',
    files: ['.github/PULL_REQUEST_TEMPLATE.md', '.github/ISSUE_TEMPLATE/'],
  },
  {
    key: 'devCompose',
    label: 'Dev Compose',
    description: 'Enhanced Docker Compose with development profiles and helper services',
    icon: <IconBrandDocker size={20} />,
    color: 'cyan',
    files: ['docker-compose.yml (enhanced)'],
  },
];

/**
 * DX Feature Card component
 */
function DxFeatureCard({
  feature,
  onToggle,
}: {
  readonly feature: DxFeature;
  readonly onToggle: (key: DxFeatureKey, enabled: boolean) => void;
}) {
  const features = useFeatures();
  const isEnabled = features[feature.key];

  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon variant="light" color={feature.color} size="lg" radius="md">
              {feature.icon}
            </ThemeIcon>
            <div>
              <Text fw={500} size="sm">
                {feature.label}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {feature.description}
              </Text>
            </div>
          </Group>
          <Switch
            checked={isEnabled}
            onChange={(event) => onToggle(feature.key, event.currentTarget.checked)}
            aria-label={`Enable ${feature.label}`}
          />
        </Group>

        <Group gap="xs">
          <Text size="xs" c="dimmed">
            Files:
          </Text>
          {feature.files.map((file) => (
            <Badge key={file} size="xs" variant="outline" color={feature.color}>
              {file}
            </Badge>
          ))}
        </Group>
      </Stack>
    </Card>
  );
}

/**
 * DX Features Section component.
 * Provides toggles for Developer Experience features that improve
 * onboarding, enforce consistency, and automate common development tasks.
 */
export function DxFeaturesSection() {
  const features = useFeatures();
  const setFeatures = useProjectStoreInternal((state) => state.setFeatures);

  // Count enabled DX features
  const enabledCount = DX_FEATURES.filter((f) => features[f.key]).length;

  // Toggle a single DX feature
  const handleToggleFeature = (key: DxFeatureKey, enabled: boolean) => {
    setFeatures({ [key]: enabled } as Partial<ProjectFeatures>);
  };

  // Enable/disable all DX features
  const handleToggleAll = (enabled: boolean) => {
    const updates: Partial<ProjectFeatures> = {};
    for (const feature of DX_FEATURES) {
      updates[feature.key] = enabled;
    }
    setFeatures(updates);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="sm">
          <Title order={6}>Developer Experience</Title>
          <Tooltip
            label="DX features improve onboarding, enforce consistency, and automate common tasks"
            withArrow
            multiline
            w={250}
          >
            <ThemeIcon variant="subtle" color="gray" size="sm">
              <IconInfoCircle size={14} />
            </ThemeIcon>
          </Tooltip>
        </Group>
        <Group gap="sm">
          <Badge variant="light" color="blue">
            {enabledCount}/{DX_FEATURES.length} enabled
          </Badge>
          <Switch
            size="xs"
            label="All"
            checked={enabledCount === DX_FEATURES.length}
            onChange={(event) => handleToggleAll(event.currentTarget.checked)}
          />
        </Group>
      </Group>

      <Alert variant="light" color="blue" icon={<IconInfoCircle size={16} />}>
        <Text size="sm">
          These features generate configuration files for development tooling. They work with all 9
          supported languages and help standardize your project setup.
        </Text>
      </Alert>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {DX_FEATURES.map((feature) => (
          <DxFeatureCard key={feature.key} feature={feature} onToggle={handleToggleFeature} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
