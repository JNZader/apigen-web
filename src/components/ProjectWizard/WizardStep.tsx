import { Box, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface WizardStepProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}

export function WizardStep({ icon, title, description, children }: WizardStepProps) {
  return (
    <Stack gap="lg">
      <Box>
        <ThemeIcon size="xl" radius="md" variant="light" color="blue" mb="sm">
          {icon}
        </ThemeIcon>
        <Title order={4}>{title}</Title>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Box>
      {children}
    </Stack>
  );
}
