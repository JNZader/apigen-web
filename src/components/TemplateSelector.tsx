import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconCheckbox,
  IconFile,
  IconNews,
  IconPackage,
  IconShoppingCart,
} from '@tabler/icons-react';
import type { ProjectTemplate } from '../data/templates';
import { applyTemplate, PROJECT_TEMPLATES } from '../data/templates';
import { useEntities, useEntityActions, useRelationActions } from '../store';

interface TemplateSelectorProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  IconFile: <IconFile size={24} />,
  IconShoppingCart: <IconShoppingCart size={24} />,
  IconNews: <IconNews size={24} />,
  IconCheckbox: <IconCheckbox size={24} />,
  IconPackage: <IconPackage size={24} />,
};

const COLOR_MAP: Record<string, string> = {
  blank: 'gray',
  ecommerce: 'blue',
  blog: 'orange',
  'task-manager': 'teal',
  inventory: 'violet',
};

export function TemplateSelector({ opened, onClose }: Readonly<TemplateSelectorProps>) {
  const entities = useEntities();
  const { setEntities } = useEntityActions();
  const { setRelations } = useRelationActions();

  const applySelectedTemplate = (template: ProjectTemplate) => {
    if (template.id === 'blank') {
      setEntities([]);
      setRelations([]);
      notifications.show({
        title: 'Template Applied',
        message: 'Started with a blank project',
        color: 'blue',
      });
    } else {
      try {
        const { entities: newEntities, relations: newRelations } = applyTemplate(template);
        setEntities(newEntities);
        setRelations(newRelations);
        notifications.show({
          title: 'Template Applied',
          message: `Loaded ${template.name} template with ${newEntities.length} entities`,
          color: 'green',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        notifications.show({
          title: 'Template Error',
          message: `Failed to apply template: ${errorMessage}`,
          color: 'red',
        });
      }
    }
    onClose();
  };

  const handleSelectTemplate = (template: ProjectTemplate) => {
    if (entities.length > 0) {
      modals.openConfirmModal({
        title: 'Replace Current Project',
        children: 'This will replace all existing entities and relations. Continue?',
        labels: { confirm: 'Replace', cancel: 'Cancel' },
        confirmProps: { color: 'orange' },
        onConfirm: () => applySelectedTemplate(template),
      });
    } else {
      applySelectedTemplate(template);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          Choose a Template
        </Text>
      }
      size="xl"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Text c="dimmed" size="sm" mb="lg">
        Start with a pre-configured template or create from scratch.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {PROJECT_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => handleSelectTemplate(template)}
          />
        ))}
      </SimpleGrid>
    </Modal>
  );
}

interface TemplateCardProps {
  readonly template: ProjectTemplate;
  readonly onSelect: () => void;
}

function TemplateCard({ template, onSelect }: Readonly<TemplateCardProps>) {
  const color = COLOR_MAP[template.id] || 'blue';

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ cursor: 'pointer' }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${template.name} template: ${template.description}. ${template.entities.length} entities, ${template.relations.length} relations`}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size="lg" radius="md" color={color} variant="light">
              {ICON_MAP[template.icon] || <IconFile size={24} />}
            </ThemeIcon>
            <div>
              <Text fw={600}>{template.name}</Text>
              <Text size="xs" c="dimmed">
                {template.description}
              </Text>
            </div>
          </Group>
        </Group>

        {template.entities.length > 0 && (
          <Group gap={4} wrap="nowrap">
            <Badge size="sm" variant="light" color={color}>
              {template.entities.length} entities
            </Badge>
            <Badge size="sm" variant="outline" color="gray">
              {template.relations.length} relations
            </Badge>
          </Group>
        )}

        {template.entities.length > 0 && (
          <Text size="xs" c="dimmed">
            Includes: {template.entities.map((e) => e.name).join(', ')}
          </Text>
        )}

        <Button
          variant="light"
          color={color}
          size="xs"
          rightSection={<IconArrowRight size={14} />}
          fullWidth
        >
          Use Template
        </Button>
      </Stack>
    </Card>
  );
}
