# T-056: Crear TemplateSelector UI

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.2 Templates

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-056 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | [[T-055]] |
| **Branch** | `feat/project-templates` |
| **Estado** | Pending |

---

## Objetivo

Crear UI para seleccion de templates en el wizard.

---

## Archivos a Crear

```
src/components/ProjectWizard/
└── TemplateSelector.tsx  ← CREAR (~180 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectWizard/TemplateSelector.tsx

import {
  Stack,
  TextInput,
  SimpleGrid,
  Paper,
  Group,
  Text,
  Badge,
  ThemeIcon,
  Tabs,
  ScrollArea,
  Tooltip,
} from '@mantine/core';
import {
  IconSearch,
  IconFile,
  IconArticle,
  IconShoppingCart,
  IconChecklist,
  IconUsers,
  IconServer,
  IconBuilding,
  IconRocket,
} from '@tabler/icons-react';
import { memo, useState, useMemo } from 'react';
import {
  PROJECT_TEMPLATES,
  searchTemplates,
  type ProjectTemplate,
} from '@/config/projectTemplates';

interface TemplateSelectorProps {
  selectedId: string | null;
  onSelect: (template: ProjectTemplate) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  file: <IconFile size={24} />,
  article: <IconArticle size={24} />,
  'shopping-cart': <IconShoppingCart size={24} />,
  checklist: <IconChecklist size={24} />,
  users: <IconUsers size={24} />,
  server: <IconServer size={24} />,
};

const CATEGORY_CONFIG = {
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    let templates = PROJECT_TEMPLATES;

    if (search) {
      templates = searchTemplates(search);
    }

    if (activeCategory) {
      templates = templates.filter((t) => t.category === activeCategory);
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
      />

      <Tabs
        value={activeCategory}
        onChange={setActiveCategory}
        variant="pills"
      >
        <Tabs.List>
          <Tabs.Tab value={null as any}>All</Tabs.Tab>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <Tabs.Tab key={key} value={key} leftSection={config.icon}>
              {config.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <ScrollArea h={350}>
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

        {filteredTemplates.length === 0 && (
          <Paper withBorder p="xl" ta="center">
            <Text c="dimmed">No templates found matching your search</Text>
          </Paper>
        )}
      </ScrollArea>
    </Stack>
  );
});

interface TemplateCardProps {
  template: ProjectTemplate;
  selected: boolean;
  onSelect: () => void;
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
            <Badge color="blue" variant="filled">
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

        <Group gap={4}>
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} size="xs" variant="dot">
              {tag}
            </Badge>
          ))}
        </Group>
      </Stack>
    </Paper>
  );
});
```

---

## Criterios de Completado

- [ ] Busqueda de templates funciona
- [ ] Filtro por categoria funciona
- [ ] Cards muestran info de template
- [ ] Seleccion visual funciona
- [ ] `npm run check` pasa

---

## Pre-Commit Checklist

> **Antes de commitear**, ejecutar en orden:

```bash
npm run check:fix && npm run test:run && gga run
```

- [ ] `npm run build` - Sin errores de tipos
- [ ] `npm run check:fix` - Lint/formato OK
- [ ] `npm run test:run` - Tests pasan
- [ ] `gga run` - STATUS: PASSED

> Ver detalles: [[WORKFLOW-PRECOMMIT]]

---

## Log de Trabajo

| Fecha | Tiempo | Notas |
|-------|--------|-------|
| - | - | - |

---

#task #fase-5 #feature #pending

[[T-055]] → [[T-056]] → [[T-057]] | [[Phases/05-UX-IMPROVEMENTS]]
