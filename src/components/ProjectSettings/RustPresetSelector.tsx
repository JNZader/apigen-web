import { Badge, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconBrain, IconCloud, IconRouter, IconTrendingUp } from '@tabler/icons-react';
import { memo, useCallback } from 'react';
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
    description:
      'Full-featured configuration for standard cloud deployments with maximum scalability',
    icon: <IconCloud size={28} />,
    color: 'blue',
    features: [
      'Full middleware stack',
      'Auto-scaling workers',
      'Large request bodies',
      'High connection limit',
    ],
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

const PresetCard = memo(function PresetCard({
  preset,
  metadata,
  isSelected,
  onSelect,
}: PresetCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    },
    [onSelect],
  );

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
      onKeyDown={handleKeyDown}
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
});

interface SelectedPresetSummaryProps {
  readonly preset: RustPreset;
}

const SelectedPresetSummary = memo(function SelectedPresetSummary({
  preset,
}: SelectedPresetSummaryProps) {
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
});

/**
 * RustPresetSelector - Component for selecting Rust deployment presets.
 *
 * Displays a grid of preset cards (Cloud, Edge Gateway, Edge Anomaly, Edge AI)
 * with descriptions and key specifications. Selection updates the Rust options
 * in the project store with preset defaults.
 */
export const RustPresetSelector = memo(function RustPresetSelector() {
  const rustOptions = useRustOptions();
  const { setRustOptions } = useLanguageOptionsActions();

  const handlePresetSelect = useCallback(
    (preset: RustPreset) => {
      const presetDefaults = RUST_PRESET_DEFAULTS[preset];
      setRustOptions(presetDefaults);
    },
    [setRustOptions],
  );

  return (
    <Stack gap="md">
      <div>
        <Text fw={600} size="sm" mb="xs">
          Select Deployment Preset
        </Text>
        <Text size="xs" c="dimmed" mb="md">
          Choose a preset configuration optimized for your deployment scenario. Each preset
          configures server, middleware, and edge-specific settings.
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
});
