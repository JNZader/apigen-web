import { Button, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconArrowsJoin2,
  IconBrush,
  IconPlus,
  IconSearch,
  IconServer,
  IconTable,
} from '@tabler/icons-react';
import { memo, type ReactNode } from 'react';

type EmptyStateVariant = 'entities' | 'relations' | 'services' | 'canvas' | 'search';

interface EmptyStateConfig {
  readonly icon: ReactNode;
  readonly iconColor: string;
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly actionColor?: string;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateVariant, EmptyStateConfig> = {
  entities: {
    icon: <IconTable size={48} aria-hidden="true" />,
    iconColor: 'blue',
    title: 'No Entities Yet',
    description: 'Create your first entity to start designing your API schema.',
    actionLabel: 'Add Entity',
    actionColor: 'blue',
  },
  relations: {
    icon: <IconArrowsJoin2 size={48} aria-hidden="true" />,
    iconColor: 'grape',
    title: 'No Relations',
    description: 'Connect entities by creating relations between them.',
    actionLabel: 'Add Relation',
    actionColor: 'grape',
  },
  services: {
    icon: <IconServer size={48} aria-hidden="true" />,
    iconColor: 'teal',
    title: 'No Services Yet',
    description: 'Create microservices to organize your entities and define your architecture.',
    actionLabel: 'Add Service',
    actionColor: 'teal',
  },
  canvas: {
    icon: <IconBrush size={48} aria-hidden="true" />,
    iconColor: 'indigo',
    title: 'Start Designing',
    description: 'Add entities to the canvas and connect them to visualize your API design.',
    actionLabel: 'Add Entity',
    actionColor: 'indigo',
  },
  search: {
    icon: <IconSearch size={48} aria-hidden="true" />,
    iconColor: 'gray',
    title: 'No Results',
    description: 'No items match your search criteria. Try a different search term.',
  },
};

interface EmptyStateProps {
  readonly variant: EmptyStateVariant;
  readonly onAction?: () => void;
  readonly customTitle?: string;
  readonly customDescription?: string;
  readonly customActionLabel?: string;
}

export const EmptyState = memo(function EmptyState({
  variant,
  onAction,
  customTitle,
  customDescription,
  customActionLabel,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[variant];

  const title = customTitle ?? config.title;
  const description = customDescription ?? config.description;
  const actionLabel = customActionLabel ?? config.actionLabel;

  return (
    <Stack
      align="center"
      justify="center"
      gap="md"
      py="xl"
      role="region"
      aria-label={title}
    >
      <ThemeIcon
        size={80}
        radius="xl"
        variant="light"
        color={config.iconColor}
        aria-hidden="true"
      >
        {config.icon}
      </ThemeIcon>

      <Text size="lg" fw={600} ta="center">
        {title}
      </Text>

      <Text size="sm" c="dimmed" ta="center" maw={300}>
        {description}
      </Text>

      {actionLabel && onAction && (
        <Button
          leftSection={<IconPlus size={16} aria-hidden="true" />}
          color={config.actionColor}
          onClick={onAction}
          mt="sm"
        >
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
});
