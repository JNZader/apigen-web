import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconArrowRight,
  IconCheckbox,
  IconFile,
  IconNews,
  IconSearch,
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import {
  applyTemplate,
  filterTemplates,
  PROJECT_TEMPLATES,
  type ProjectTemplate,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from '../data/templates';
import { useEntities, useEntityActions, useRelationActions, useServiceActions } from '../store';
import { notify } from '../utils/notifications';

interface TemplateSelectorProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  IconFile: <IconFile size={24} />,
  IconShoppingCart: <IconShoppingCart size={24} />,
  IconNews: <IconNews size={24} />,
  IconCheckbox: <IconCheckbox size={24} />,
  IconUsers: <IconUsers size={24} />,
};

const COLOR_MAP: Record<string, string> = {
  blank: 'gray',
  ecommerce: 'blue',
  blog: 'orange',
  'task-manager': 'teal',
  'user-management': 'violet',
};

const CATEGORY_COLOR_MAP: Record<TemplateCategory, string> = {
  starter: 'green',
  'full-stack': 'blue',
  microservice: 'violet',
};

export function TemplateSelector({ opened, onClose }: Readonly<TemplateSelectorProps>) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 200);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const entities = useEntities();
  const { setEntities } = useEntityActions();
  const { setRelations } = useRelationActions();
  const { clearServices } = useServiceActions();

  const filteredTemplates = useMemo(() => {
    return filterTemplates(PROJECT_TEMPLATES, {
      search: debouncedSearch,
      category: selectedCategory,
    });
  }, [debouncedSearch, selectedCategory]);

  const applySelectedTemplate = (template: ProjectTemplate) => {
    // Clear services and their connections when applying any template
    clearServices();

    if (template.id === 'blank') {
      setEntities([]);
      setRelations([]);
      notify.info({
        title: 'Template Applied',
        message: 'Started with a blank project',
      });
    } else {
      try {
        const { entities: newEntities, relations: newRelations } = applyTemplate(template);
        setEntities(newEntities);
        setRelations(newRelations);
        notify.success({
          title: 'Template Applied',
          message: `Loaded ${template.name} template with ${newEntities.length} entities`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        notify.error({
          title: 'Template Error',
          message: `Failed to apply template: ${errorMessage}`,
        });
      }
    }
    onClose();
    setSearch('');
    setSelectedCategory('all');
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

  const handleClose = () => {
    onClose();
    setSearch('');
    setSelectedCategory('all');
  };

  const categoryOptions = [
    { value: 'all', label: 'All' },
    ...TEMPLATE_CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label })),
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="lg">
          Choose a Template
        </Text>
      }
      size="xl"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Stack gap="md">
        <Text c="dimmed" size="sm">
          Start with a pre-configured template or create from scratch.
        </Text>

        <TextInput
          placeholder="Search templates..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          aria-label="Search templates"
        />

        <SegmentedControl
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value as TemplateCategory | 'all')}
          data={categoryOptions}
          fullWidth
          aria-label="Filter by category"
        />

        {filteredTemplates.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No templates match your search criteria.
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => handleSelectTemplate(template)}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Modal>
  );
}

interface TemplateCardProps {
  readonly template: ProjectTemplate;
  readonly onSelect: () => void;
}

function TemplateCard({ template, onSelect }: Readonly<TemplateCardProps>) {
  const color = COLOR_MAP[template.id] || 'blue';
  const categoryColor = CATEGORY_COLOR_MAP[template.category];

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
      aria-label={`${template.name} template: ${template.description}. ${template.entities.length} entities, ${template.relations.length} relations. Category: ${template.category}`}
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

        <Group gap={4}>
          <Badge size="xs" variant="filled" color={categoryColor}>
            {template.category}
          </Badge>
          {template.entities.length > 0 && (
            <>
              <Badge size="xs" variant="light" color={color}>
                {template.entities.length} entities
              </Badge>
              <Badge size="xs" variant="outline" color="gray">
                {template.relations.length} relations
              </Badge>
            </>
          )}
        </Group>

        {template.tags.length > 0 && (
          <Group gap={4}>
            {template.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} size="xs" variant="dot" color="gray">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 4 && (
              <Text size="xs" c="dimmed">
                +{template.tags.length - 4} more
              </Text>
            )}
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
