import {
  Badge,
  Group,
  List,
  Paper,
  Radio,
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
