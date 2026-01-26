import { Badge, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconCode, IconFileDescription, IconSettings } from '@tabler/icons-react';
import { memo } from 'react';
import {
  FRAMEWORK_METADATA,
  type Framework,
  LANGUAGE_METADATA,
  type Language,
} from '@/types/target';
import type { WizardData } from '../ProjectWizard';

interface SummaryStepProps {
  readonly data: WizardData;
}

export const SummaryStep = memo(function SummaryStep({ data }: SummaryStepProps) {
  const languageMeta = LANGUAGE_METADATA[data.language as Language];
  const frameworkMeta = FRAMEWORK_METADATA[data.framework as Framework];

  return (
    <Stack gap="md">
      <Text fw={600} size="sm">
        Review Your Project
      </Text>

      <Card withBorder padding="md" radius="md">
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon size="lg" variant="light" color="blue">
              <IconFileDescription size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{data.projectName || 'Unnamed Project'}</Text>
              <Text size="sm" c="dimmed">
                {data.description || 'No description'}
              </Text>
            </div>
          </Group>

          <Group gap="sm">
            <ThemeIcon size="lg" variant="light" color="grape">
              <IconCode size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>
                {languageMeta?.label || data.language} + {frameworkMeta?.label || data.framework}
              </Text>
              <Text size="sm" c="dimmed">
                Package: {data.packageName}
              </Text>
            </div>
          </Group>

          {data.features.length > 0 && (
            <Group gap="sm">
              <ThemeIcon size="lg" variant="light" color="teal">
                <IconSettings size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600}>Features ({data.features.length})</Text>
                <Group gap={4} mt={4}>
                  {data.features.map((feature) => (
                    <Badge key={feature} size="sm" variant="light">
                      {feature}
                    </Badge>
                  ))}
                </Group>
              </div>
            </Group>
          )}
        </Stack>
      </Card>

      <Card withBorder padding="md" radius="md" bg="green.0">
        <Group gap="sm">
          <ThemeIcon size="lg" variant="light" color="green">
            <IconCheck size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600} c="green.8">
              Ready to Create
            </Text>
            <Text size="sm" c="green.7">
              Click &quot;Create Project&quot; to generate your project structure.
            </Text>
          </div>
        </Group>
      </Card>
    </Stack>
  );
});
