# T-012: Crear FrameworkCard.tsx

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.1 Componentes

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-012 |
| **Tipo** | Feature |
| **Estimado** | 1h |
| **Dependencias** | [[T-011]] |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Crear el componente de tarjeta individual para cada lenguaje/framework en el selector.

---

## Tareas

- [ ] Crear `FrameworkCard.tsx`
- [ ] Implementar estados: default, hover, selected
- [ ] Mostrar icono, nombre, version
- [ ] Mostrar lista de features soportadas
- [ ] Animaciones de transicion

---

## Archivos a Crear

```
src/components/LanguageSelector/
└── FrameworkCard.tsx            ← CREAR (~100 lineas)
```

**LOC Estimado:** ~100

---

## Codigo de Referencia

```typescript
// src/components/LanguageSelector/FrameworkCard.tsx

import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  ThemeIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { memo } from 'react';
import type { Language, Framework } from '@/types/target';
import { getIconComponent } from '@/utils/icons';
import classes from './FrameworkCard.module.css';

export interface FrameworkCardProps {
  /** Language identifier */
  language: Language;
  /** Framework identifier */
  framework: Framework;
  /** Display name (e.g., "Java / Spring Boot") */
  displayName: string;
  /** Version string (e.g., "4.x (Java 25)") */
  version: string;
  /** Short description */
  description: string;
  /** Icon name from Tabler Icons */
  icon: string;
  /** List of key features */
  features: string[];
  /** Whether this card is currently selected */
  selected: boolean;
  /** Callback when card is clicked */
  onSelect: () => void;
}

export const FrameworkCard = memo(function FrameworkCard({
  language,
  framework,
  displayName,
  version,
  description,
  icon,
  features,
  selected,
  onSelect,
}: FrameworkCardProps) {
  const IconComponent = getIconComponent(icon);

  return (
    <Card
      className={classes.card}
      data-selected={selected || undefined}
      withBorder
      padding="md"
      radius="md"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      aria-label={`Select ${displayName}`}
    >
      {/* Selection indicator */}
      {selected && (
        <Box className={classes.selectedBadge}>
          <ThemeIcon size="sm" radius="xl" color="blue">
            <IconCheck size={12} />
          </ThemeIcon>
        </Box>
      )}

      <Stack gap="xs">
        {/* Header: Icon + Name */}
        <Group gap="sm">
          <ThemeIcon
            size="lg"
            radius="md"
            variant={selected ? 'filled' : 'light'}
            color={selected ? 'blue' : 'gray'}
          >
            <IconComponent size={20} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="sm">
              {displayName}
            </Text>
            <Text size="xs" c="dimmed">
              {version}
            </Text>
          </div>
        </Group>

        {/* Description */}
        <Text size="xs" c="dimmed" lineClamp={2}>
          {description}
        </Text>

        {/* Features badges */}
        <Group gap={4} wrap="wrap">
          {features.slice(0, 3).map((feature) => (
            <Badge
              key={feature}
              size="xs"
              variant="dot"
              color={selected ? 'blue' : 'gray'}
            >
              {feature}
            </Badge>
          ))}
          {features.length > 3 && (
            <Tooltip label={features.slice(3).join(', ')}>
              <Badge size="xs" variant="outline" color="gray">
                +{features.length - 3}
              </Badge>
            </Tooltip>
          )}
        </Group>
      </Stack>
    </Card>
  );
});
```

```css
/* src/components/LanguageSelector/FrameworkCard.module.css */

.card {
  cursor: pointer;
  transition: all 150ms ease;
  position: relative;
  min-height: 140px;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--mantine-shadow-md);
  border-color: var(--mantine-color-blue-4);
}

.card:focus-visible {
  outline: 2px solid var(--mantine-color-blue-5);
  outline-offset: 2px;
}

.card[data-selected] {
  border-color: var(--mantine-color-blue-5);
  background-color: var(--mantine-color-blue-0);
}

.selectedBadge {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

---

## UI States

### Default
```
┌─────────────────┐
│  ☕ Java        │
│  Spring Boot 4.x│
│                 │
│  Enterprise API │
│                 │
│  [CRUD] [JWT].. │
└─────────────────┘
```

### Hover
```
┌─────────────────┐  ← Slight shadow + lift
│  ☕ Java        │  ← Blue border
│  Spring Boot 4.x│
│                 │
│  Enterprise API │
│                 │
│  [CRUD] [JWT].. │
└─────────────────┘
```

### Selected
```
┌─────────────────┐  ← Blue background
│              ✓  │  ← Check badge
│  ☕ Java        │
│  Spring Boot 4.x│
│                 │
│  Enterprise API │
│                 │
│  [CRUD] [JWT].. │
└─────────────────┘
```

---

## Criterios de Completado

- [ ] Componente renderiza correctamente
- [ ] Estados hover/selected funcionan
- [ ] Click selecciona el framework
- [ ] Keyboard accessible (Enter/Space)
- [ ] Features se muestran con truncation
- [ ] Tooltip para features adicionales
- [ ] CSS module creado
- [ ] `npm run check` pasa

---

## Notas

- Usar CSS modules para estilos
- Accesibilidad: role="button", tabIndex, aria-pressed
- Features: mostrar max 3, resto en tooltip

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

#task #fase-1 #feature #pending

[[T-011]] → [[T-012]] → [[T-016]] | [[Phases/01-LANGUAGE-SELECTOR]]
