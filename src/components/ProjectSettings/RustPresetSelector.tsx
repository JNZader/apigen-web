import {
  Badge,
  Group,
  List,
  Paper,
  Radio,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconBolt,
  IconBrain,
  IconCheck,
  IconCloud,
  IconRouter,
  IconX,
} from '@tabler/icons-react';
import { memo, useCallback } from 'react';
import type { RustPreset } from '../../types';
import type { SettingsFormProps } from './types';

interface PresetFeature {
  readonly name: string;
  readonly included: boolean;
}

interface PresetInfo {
  readonly id: RustPreset;
  readonly name: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly color: string;
  readonly features: readonly PresetFeature[];
  readonly useCases: readonly string[];
}

const PRESETS: readonly PresetInfo[] = [
  {
    id: 'cloud',
    name: 'Cloud',
    description: 'Full-featured cloud deployment with all capabilities',
    icon: <IconCloud size={24} />,
    color: 'blue',
    features: [
      { name: 'Full API Support', included: true },
      { name: 'Unlimited Memory', included: true },
      { name: 'High Connection Limit', included: true },
      { name: 'All Middleware', included: true },
      { name: 'Full Observability', included: true },
    ],
    useCases: ['Production APIs', 'Enterprise services', 'Complex applications'],
  },
  {
    id: 'edge-gateway',
    name: 'Edge Gateway',
    description: 'Optimized for API routing and load balancing at the edge',
    icon: <IconRouter size={24} />,
    color: 'green',
    features: [
      { name: 'Request Routing', included: true },
      { name: 'Load Balancing', included: true },
      { name: 'Edge Caching', included: true },
      { name: 'Rate Limiting', included: true },
      { name: 'Low Latency', included: true },
    ],
    useCases: ['API Gateways', 'CDN Edge', 'Proxy services'],
  },
  {
    id: 'edge-anomaly',
    name: 'Edge Anomaly',
    description: 'Real-time streaming and anomaly detection at the edge',
    icon: <IconBolt size={24} />,
    color: 'orange',
    features: [
      { name: 'Streaming Processing', included: true },
      { name: 'Real-time Alerts', included: true },
      { name: 'Metric Aggregation', included: true },
      { name: 'Low Memory Footprint', included: true },
      { name: 'Fast Response', included: true },
    ],
    useCases: ['IoT Monitoring', 'Security detection', 'Real-time analytics'],
  },
  {
    id: 'edge-ai',
    name: 'Edge AI',
    description: 'Machine learning model serving at the edge',
    icon: <IconBrain size={24} />,
    color: 'violet',
    features: [
      { name: 'Model Serving', included: true },
      { name: 'Model Caching', included: true },
      { name: 'Batch Inference', included: true },
      { name: 'Multi-threaded', included: true },
      { name: 'Optimized Memory', included: true },
    ],
    useCases: ['ML Inference', 'AI at Edge', 'Smart devices'],
  },
];

interface PresetCardProps {
  readonly preset: PresetInfo;
  readonly selected: boolean;
  readonly onSelect: (id: RustPreset) => void;
}

const PresetCard = memo(function PresetCard({ preset, selected, onSelect }: PresetCardProps) {
  const handleClick = useCallback(() => {
    onSelect(preset.id);
  }, [onSelect, preset.id]);

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        borderColor: selected ? `var(--mantine-color-${preset.color}-5)` : undefined,
        backgroundColor: selected ? `var(--mantine-color-${preset.color}-0)` : undefined,
      }}
    >
      <Radio value={preset.id} style={{ display: 'none' }} />

      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color={preset.color} size="lg" variant="light">
              {preset.icon}
            </ThemeIcon>
            <div>
              <Text fw={600}>{preset.name}</Text>
              <Text size="xs" c="dimmed">
                {preset.description}
              </Text>
            </div>
          </Group>
          {selected && (
            <Badge color={preset.color} variant="filled">
              Selected
            </Badge>
          )}
        </Group>

        <List size="xs" spacing={4}>
          {preset.features.map((feature) => (
            <List.Item
              key={feature.name}
              icon={
                <ThemeIcon
                  size={16}
                  radius="xl"
                  color={feature.included ? 'green' : 'gray'}
                  variant="light"
                >
                  {feature.included ? <IconCheck size={10} /> : <IconX size={10} />}
                </ThemeIcon>
              }
            >
              <Text size="xs" c={feature.included ? undefined : 'dimmed'}>
                {feature.name}
              </Text>
            </List.Item>
          ))}
        </List>

        <div>
          <Text size="xs" fw={500} c="dimmed">
            Best for:
          </Text>
          <Group gap={4} mt={4}>
            {preset.useCases.map((useCase) => (
              <Badge key={useCase} size="xs" variant="outline" color="gray">
                {useCase}
              </Badge>
            ))}
          </Group>
        </div>
      </Stack>
    </Paper>
  );
});

export const RustPresetSelector = memo(function RustPresetSelector({ form }: SettingsFormProps) {
  const currentPreset = form.values.rustOptions.preset;

  const handlePresetChange = useCallback(
    (preset: RustPreset) => {
      form.setFieldValue('rustOptions.preset', preset);
    },
    [form],
  );
  Tooltip,
} from '@mantine/core';
import {
  IconBrain,
  IconCloud,
  IconRouter,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useLanguageOptionsActions, useRustOptions } from '../../store';
import { RUST_PRESET_DEFAULTS, type RustPreset } from '../../types/config/rust';

/**
 * Metadata for each Rust deployment preset.
 * Contains display information and key specifications.
 */
interface PresetMetadata {
  readonly label: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly color: string;
  readonly features: readonly string[];
  readonly specs: {
    readonly memory: string;
    readonly connections: string;
    readonly workers: string;
  };
}

const PRESET_METADATA: Record<RustPreset, PresetMetadata> = {
  cloud: {
    label: 'Cloud',
    description: 'Full-featured configuration for standard cloud deployments with maximum scalability',
    icon: <IconCloud size={28} />,
    color: 'blue',
    features: ['Full middleware stack', 'Auto-scaling workers', 'Large request bodies', 'High connection limit'],
    specs: {
      memory: 'Unlimited',
      connections: '50,000',
      workers: 'Auto-detect',
    },
  },
  'edge-gateway': {
    label: 'Edge Gateway',
    description: 'Optimized for low-latency API routing and load balancing at the edge',
    icon: <IconRouter size={28} />,
    color: 'cyan',
    features: ['Request routing', 'Load balancing', 'Response caching', 'Rate limiting'],
    specs: {
      memory: '256 MB',
      connections: '5,000',
      workers: '2',
    },
  },
  'edge-anomaly': {
    label: 'Edge Anomaly',
    description: 'Real-time streaming and anomaly detection with optimized buffer handling',
    icon: <IconTrendingUp size={28} />,
    color: 'orange',
    features: ['Streaming processing', 'Real-time alerts', 'Metric aggregation', 'Low latency'],
    specs: {
      memory: '512 MB',
      connections: '2,000',
      workers: '2',
    },
  },
  'edge-ai': {
    label: 'Edge AI',
    description: 'Machine learning model serving at the edge with batch inference support',
    icon: <IconBrain size={28} />,
    color: 'grape',
    features: ['Model serving', 'Model caching', 'Batch inference', 'Multi-threaded'],
    specs: {
      memory: '1,024 MB',
      connections: '1,000',
      workers: '4',
    },
  },
};

const PRESETS: readonly RustPreset[] = ['cloud', 'edge-gateway', 'edge-anomaly', 'edge-ai'];

interface PresetCardProps {
  readonly preset: RustPreset;
  readonly metadata: PresetMetadata;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

function PresetCard({ preset, metadata, isSelected, onSelect }: PresetCardProps) {
  return (
    <Card
      style={{
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease',
      }}
      shadow={isSelected ? 'md' : 'sm'}
      padding="md"
      radius="md"
      withBorder
      bd={isSelected ? `2px solid var(--mantine-color-${metadata.color}-6)` : undefined}
      bg={isSelected ? `var(--mantine-color-${metadata.color}-light)` : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${metadata.label} preset`}
      data-testid={`rust-preset-card-${preset}`}
    >
      <Stack gap="sm">
        <Group gap="sm">
          <ThemeIcon
            size="xl"
            radius="md"
            color={metadata.color}
            variant={isSelected ? 'filled' : 'light'}
          >
            {metadata.icon}
          </ThemeIcon>
          <div>
            <Text fw={isSelected ? 700 : 600} size="md">
              {metadata.label}
            </Text>
            {isSelected && (
              <Badge size="xs" variant="light" color={metadata.color}>
                Selected
              </Badge>
            )}
          </div>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {metadata.description}
        </Text>

        <Stack gap="xs">
          <Text size="xs" fw={500} c="dimmed">
            Key Features:
          </Text>
          <Group gap="xs" wrap="wrap">
            {metadata.features.map((feature) => (
              <Badge key={feature} size="xs" variant="outline" color="gray">
                {feature}
              </Badge>
            ))}
          </Group>
        </Stack>

        <Stack gap={4}>
          <Text size="xs" fw={500} c="dimmed">
            Specifications:
          </Text>
          <Group gap="xs" wrap="wrap">
            <Tooltip label="Maximum memory allocation" withArrow>
              <Badge size="xs" variant="light" color={metadata.color}>
                Mem: {metadata.specs.memory}
              </Badge>
            </Tooltip>
            <Tooltip label="Maximum concurrent connections" withArrow>
              <Badge size="xs" variant="light" color={metadata.color}>
                Conn: {metadata.specs.connections}
              </Badge>
            </Tooltip>
            <Tooltip label="Worker threads" withArrow>
              <Badge size="xs" variant="light" color={metadata.color}>
                Workers: {metadata.specs.workers}
              </Badge>
            </Tooltip>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

/**
 * RustPresetSelector - Component for selecting Rust deployment presets.
 *
 * Displays a grid of preset cards (Cloud, Edge Gateway, Edge Anomaly, Edge AI)
 * with descriptions and key specifications. Selection updates the Rust options
 * in the project store with preset defaults.
 */
export function RustPresetSelector() {
  const rustOptions = useRustOptions();
  const { setRustOptions } = useLanguageOptionsActions();

  const handlePresetSelect = (preset: RustPreset) => {
    const presetDefaults = RUST_PRESET_DEFAULTS[preset];
    setRustOptions(presetDefaults);
  };

  return (
    <Stack gap="md">
      <div>
        <Text fw={600} size="lg">
          Select Rust Preset
        </Text>
        <Text size="sm" c="dimmed">
          Choose a configuration that matches your deployment scenario
        </Text>
      </div>

      <Radio.Group
        value={currentPreset}
        onChange={(val) => handlePresetChange(val as RustPreset)}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              selected={currentPreset === preset.id}
              onSelect={handlePresetChange}
            />
          ))}
        </SimpleGrid>
      </Radio.Group>
    </Stack>
  );
});
        <Text fw={600} size="sm" mb="xs">
          Select Deployment Preset
        </Text>
        <Text size="xs" c="dimmed" mb="md">
          Choose a preset configuration optimized for your deployment scenario.
          Each preset configures server, middleware, and edge-specific settings.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {PRESETS.map((preset) => {
          const metadata = PRESET_METADATA[preset];
          const isSelected = rustOptions.preset === preset;

          return (
            <PresetCard
              key={preset}
              preset={preset}
              metadata={metadata}
              isSelected={isSelected}
              onSelect={() => handlePresetSelect(preset)}
            />
          );
        })}
      </SimpleGrid>

      <SelectedPresetSummary preset={rustOptions.preset} />
    </Stack>
  );
}

interface SelectedPresetSummaryProps {
  readonly preset: RustPreset;
}

function SelectedPresetSummary({ preset }: SelectedPresetSummaryProps) {
  const metadata = PRESET_METADATA[preset];

  return (
    <Card withBorder padding="sm" radius="md" bg="var(--mantine-color-gray-light)">
      <Group gap="xs" justify="center" wrap="wrap">
        <Text size="sm" c="dimmed">
          Active Preset:
        </Text>
        <Badge variant="filled" color={metadata.color} leftSection={metadata.icon}>
          {metadata.label}
        </Badge>
        <Text size="sm" c="dimmed">
          |
        </Text>
        <Badge variant="light" color={metadata.color}>
          {metadata.specs.memory} RAM
        </Badge>
        <Badge variant="light" color={metadata.color}>
          {metadata.specs.connections} connections
        </Badge>
      </Group>
    </Card>
  );
}
