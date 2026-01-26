# T-059: Crear Empty States

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.4 Polish

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-059 |
| **Tipo** | Feature |
| **Estimado** | 1.5h |
| **Dependencias** | Ninguna |
| **Branch** | `feat/ux-improvements` |
| **Estado** | Pending |

---

## Objetivo

Crear componentes de empty state para mejorar UX cuando no hay datos.

---

## Archivos a Crear

```
src/components/
└── EmptyState.tsx  ← CREAR (~100 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/EmptyState.tsx

import {
  Stack,
  Text,
  Button,
  Paper,
  ThemeIcon,
  Group,
} from '@mantine/core';
import {
  IconDatabase,
  IconArrowsJoin,
  IconServer,
  IconPlus,
  IconWand,
  IconFileImport,
} from '@tabler/icons-react';
import { memo } from 'react';

type EmptyStateVariant = 'entities' | 'relations' | 'services' | 'canvas' | 'search';

interface EmptyStateProps {
  variant: EmptyStateVariant;
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

const EMPTY_STATE_CONFIG: Record<
  EmptyStateVariant,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    secondaryActionLabel?: string;
  }
> = {
  entities: {
    icon: <IconDatabase size={48} />,
    title: 'No Entities Yet',
    description: 'Start by creating your first entity or import from SQL/OpenAPI',
    actionLabel: 'Create Entity',
    secondaryActionLabel: 'Import',
  },
  relations: {
    icon: <IconArrowsJoin size={48} />,
    title: 'No Relations',
    description: 'Create at least two entities to define relationships between them',
    actionLabel: 'Create Entity First',
  },
  services: {
    icon: <IconServer size={48} />,
    title: 'No Services Yet',
    description: 'Services are automatically generated based on your entities',
  },
  canvas: {
    icon: <IconWand size={48} />,
    title: 'Start Designing',
    description: 'Create entities visually on the canvas or use the wizard to get started',
    actionLabel: 'Open Wizard',
    secondaryActionLabel: 'Create Entity',
  },
  search: {
    icon: <IconDatabase size={48} />,
    title: 'No Results',
    description: 'No items match your search criteria',
  },
};

export const EmptyState = memo(function EmptyState({
  variant,
  onAction,
  onSecondaryAction,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[variant];

  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
      }}
    >
      <Stack align="center" gap="md" maw={400}>
        <ThemeIcon size={80} variant="light" color="gray" radius="xl">
          {config.icon}
        </ThemeIcon>

        <div style={{ textAlign: 'center' }}>
          <Text fw={600} size="lg">
            {config.title}
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            {config.description}
          </Text>
        </div>

        {(config.actionLabel || config.secondaryActionLabel) && (
          <Group gap="sm">
            {config.actionLabel && onAction && (
              <Button leftSection={<IconPlus size={16} />} onClick={onAction}>
                {config.actionLabel}
              </Button>
            )}
            {config.secondaryActionLabel && onSecondaryAction && (
              <Button
                variant="light"
                leftSection={<IconFileImport size={16} />}
                onClick={onSecondaryAction}
              >
                {config.secondaryActionLabel}
              </Button>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
});

// Variante inline para listas
interface EmptyListStateProps {
  message?: string;
}

export const EmptyListState = memo(function EmptyListState({
  message = 'No items found',
}: EmptyListStateProps) {
  return (
    <Paper p="md" withBorder ta="center">
      <Text c="dimmed" size="sm">
        {message}
      </Text>
    </Paper>
  );
});
```

---

## Uso en Componentes

```typescript
// En DesignerCanvas.tsx
{entities.length === 0 && (
  <EmptyState
    variant="canvas"
    onAction={openWizard}
    onSecondaryAction={openEntityForm}
  />
)}

// En EntityList.tsx
{filteredEntities.length === 0 && searchQuery && (
  <EmptyState variant="search" />
)}

{entities.length === 0 && !searchQuery && (
  <EmptyState
    variant="entities"
    onAction={openEntityForm}
    onSecondaryAction={openImportModal}
  />
)}
```

---

## Criterios de Completado

- [ ] EmptyState para canvas
- [ ] EmptyState para entidades
- [ ] EmptyState para relaciones
- [ ] EmptyState para busqueda
- [ ] Acciones funcionales
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

[[T-058]] → [[T-059]] → [[T-060]] | [[Phases/05-UX-IMPROVEMENTS]]
