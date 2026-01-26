import {
  Badge,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconArticle,
  IconBuilding,
  IconChecklist,
  IconFile,
  IconRocket,
  IconSearch,
  IconServer,
  IconShoppingCart,
} from '@tabler/icons-react';
import { memo, useMemo, useState } from 'react';
import {
  filterTemplatesByCategory,
  PROJECT_TEMPLATES,
  type ProjectTemplate,
  searchTemplates,
  type TemplateCategory,
} from '@/config/projectTemplates';

interface TemplateSelectorProps {
  readonly selectedId: string | null;
  readonly onSelect: (template: ProjectTemplate) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  file: <IconFile size={24} />,
  article: <IconArticle size={24} />,
  'shopping-cart': <IconShoppingCart size={24} />,
  checklist: <IconChecklist size={24} />,
  server: <IconServer size={24} />,
};

const CATEGORY_CONFIG: Record<
  TemplateCategory,
  { label: string; color: string; icon: React.ReactNode }
> = {
  starter: { label: 'Starter', color: 'blue', icon: <IconRocket size={16} /> },
  'full-stack': { label: 'Full Stack', color: 'green', icon: <IconServer size={16} /> },
  microservice: { label: 'Microservice', color: 'violet', icon: <IconServer size={16} /> },
  enterprise: { label: 'Enterprise', color: 'orange', icon: <IconBuilding size={16} /> },
};

export const TemplateSelector = memo(function TemplateSelector({
  selectedId,
  onSelect,
}: TemplateSelectorProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    let templates = search ? searchTemplates(search) : PROJECT_TEMPLATES;

    if (activeCategory && activeCategory !== 'all') {
      templates = filterTemplatesByCategory(templates, activeCategory as TemplateCategory);
    }

    return templates;
  }, [search, activeCategory]);

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Search templates..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        data-testid="template-search-input"
      />

      <Tabs
        value={activeCategory}
        onChange={(value) => setActiveCategory(value ?? 'all')}
        variant="pills"
      >
        <Tabs.List>
          <Tabs.Tab value="all" data-testid="category-tab-all">
            All
          </Tabs.Tab>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <Tabs.Tab
              key={key}
              value={key}
              leftSection={config.icon}
              data-testid={`category-tab-${key}`}
            >
              {config.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <ScrollArea h={350}>
        {filteredTemplates.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedId === template.id}
                onSelect={() => onSelect(template)}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Paper withBorder p="xl" ta="center" data-testid="no-templates-message">
            <Text c="dimmed">No templates found matching your search</Text>
          </Paper>
        )}
      </ScrollArea>
    </Stack>
  );
});

interface TemplateCardProps {
  readonly template: ProjectTemplate;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

const TemplateCard = memo(function TemplateCard({
  template,
  selected,
  onSelect,
}: TemplateCardProps) {
  const categoryConfig = CATEGORY_CONFIG[template.category];
  const icon = ICON_MAP[template.icon] || <IconFile size={24} />;

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{
        cursor: 'pointer',
        borderColor: selected ? 'var(--mantine-color-blue-5)' : undefined,
        backgroundColor: selected ? 'var(--mantine-color-blue-0)' : undefined,
      }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`${template.name}: ${template.description}`}
      data-testid={`template-card-${template.id}`}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size="lg" variant="light" color={categoryConfig.color}>
              {icon}
            </ThemeIcon>
            <div>
              <Text fw={600} size="sm">
                {template.name}
              </Text>
              <Badge size="xs" color={categoryConfig.color} variant="light">
                {categoryConfig.label}
              </Badge>
            </div>
          </Group>
          {selected && (
            <Badge color="blue" variant="filled" data-testid="selected-badge">
              Selected
            </Badge>
          )}
        </Group>

        <Text size="xs" c="dimmed" lineClamp={2}>
          {template.description}
        </Text>

        <Group gap={4}>
          <Tooltip label="Entities">
            <Badge size="xs" variant="outline" color="gray">
              {template.entities.length} entities
            </Badge>
          </Tooltip>
          {template.features.length > 0 && (
            <Tooltip label="Features included">
              <Badge size="xs" variant="outline" color="gray">
                {template.features.length} features
              </Badge>
            </Tooltip>
          )}
        </Group>

        {template.tags.length > 0 && (
          <Group gap={4}>
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="xs" variant="dot">
                {tag}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>
    </Paper>
  );
});
