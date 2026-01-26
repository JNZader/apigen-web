import {
  Badge,
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  useMantineTheme,
} from '@mantine/core';
import {
  IconCheckbox,
  IconFile,
  IconNews,
  IconPackage,
  IconSearch,
  IconShoppingCart,
  IconTemplate,
} from '@tabler/icons-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { PROJECT_TEMPLATES, type ProjectTemplate } from '@/data/templates';

type TemplateCategory = 'all' | 'blank' | 'starter';

interface TemplateSelectorProps {
  readonly selectedId: string | null;
  readonly onSelect: (template: ProjectTemplate) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  IconFile: IconFile,
  IconShoppingCart: IconShoppingCart,
  IconNews: IconNews,
  IconCheckbox: IconCheckbox,
  IconPackage: IconPackage,
};

const CATEGORY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Blank', value: 'blank' },
  { label: 'Starter', value: 'starter' },
];

function getTemplateCategory(template: ProjectTemplate): TemplateCategory {
  return template.entities.length === 0 ? 'blank' : 'starter';
}

function getTemplateIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || IconTemplate;
}

interface TemplateCardProps {
  readonly template: ProjectTemplate;
  readonly isSelected: boolean;
  readonly onSelect: (template: ProjectTemplate) => void;
}

const TemplateCard = memo(function TemplateCard({
  template,
  isSelected,
  onSelect,
}: TemplateCardProps) {
  const theme = useMantineTheme();
  const IconComponent = getTemplateIcon(template.icon);
  const entityCount = template.entities.length;
  const relationCount = template.relations.length;

  const handleClick = useCallback(() => {
    onSelect(template);
  }, [onSelect, template]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(template);
      }
    },
    [onSelect, template],
  );

  return (
    <Card
      shadow={isSelected ? 'md' : 'sm'}
      padding="lg"
      radius="md"
      withBorder
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${template.name} template`}
      style={{
        cursor: 'pointer',
        borderColor: isSelected ? theme.colors.blue[5] : undefined,
        borderWidth: isSelected ? 2 : 1,
        backgroundColor: isSelected ? theme.colors.blue[0] : undefined,
        transition: 'all 150ms ease',
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <ThemeIcon
            size="lg"
            radius="md"
            variant={isSelected ? 'filled' : 'light'}
            color="blue"
          >
            <IconComponent size={20} />
          </ThemeIcon>
          {entityCount > 0 && (
            <Badge size="sm" variant="light" color="gray">
              {entityCount} {entityCount === 1 ? 'entity' : 'entities'}
            </Badge>
          )}
        </Group>

        <div>
          <Text fw={600} size="sm">
            {template.name}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={2}>
            {template.description}
          </Text>
        </div>

        {relationCount > 0 && (
          <Text size="xs" c="dimmed">
            {relationCount} {relationCount === 1 ? 'relation' : 'relations'}
          </Text>
        )}
      </Stack>
    </Card>
  );
});

export const TemplateSelector = memo(function TemplateSelector({
  selectedId,
  onSelect,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('all');

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.currentTarget.value);
    },
    [],
  );

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value as TemplateCategory);
  }, []);

  const filteredTemplates = useMemo(() => {
    return PROJECT_TEMPLATES.filter((template) => {
      const matchesSearch =
        searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        category === 'all' || getTemplateCategory(template) === category;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, category]);

  return (
    <Stack gap="md">
      <Group gap="md" grow>
        <TextInput
          placeholder="Search templates..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search templates"
        />
        <SegmentedControl
          data={CATEGORY_OPTIONS}
          value={category}
          onChange={handleCategoryChange}
          size="sm"
        />
      </Group>

      {filteredTemplates.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No templates found matching your criteria
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedId === template.id}
              onSelect={onSelect}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
});
