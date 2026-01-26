# T-013: Crear FeatureMatrix.tsx

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.1 Componentes

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-013 |
| **Tipo** | Feature |
| **Estimado** | 1.5h |
| **Dependencias** | [[T-011]] |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Crear una matriz visual que muestra que features estan soportadas por cada lenguaje/framework.

---

## Tareas

- [ ] Crear `FeatureMatrix.tsx`
- [ ] Tabla con lenguajes vs features
- [ ] Indicadores de soporte (check/x/partial)
- [ ] Resaltar columna del lenguaje seleccionado
- [ ] Responsive para mobile

---

## Archivos a Crear

```
src/components/LanguageSelector/
└── FeatureMatrix.tsx            ← CREAR (~150 lineas)
```

**LOC Estimado:** ~150

---

## Codigo de Referencia

```typescript
// src/components/LanguageSelector/FeatureMatrix.tsx

import {
  Table,
  ScrollArea,
  Text,
  ThemeIcon,
  Tooltip,
  Box,
  Title,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconMinus,
} from '@tabler/icons-react';
import { memo, useMemo } from 'react';
import type { Language, Framework, FeatureSupport } from '@/types/target';
import { LANGUAGE_METADATA } from '@/types/target';
import classes from './FeatureMatrix.module.css';

interface FeatureMatrixProps {
  /** Currently selected language */
  selectedLanguage?: Language;
  /** Currently selected framework */
  selectedFramework?: Framework;
  /** Callback when clicking on a language column */
  onLanguageClick?: (language: Language, framework: Framework) => void;
}

// Feature groups for better organization
const FEATURE_GROUPS = {
  'Security': ['jwt', 'oauth2', 'socialLogin'],
  'Feature Pack 2025': ['passwordReset', 'mailService', 'fileUpload', 'jteTemplates'],
  'API Features': ['graphql', 'grpc', 'rateLimit'],
  'Infrastructure': ['circuitBreaker', 'caching'],
  'Edge Computing': ['mqtt', 'modbus', 'serial', 'onnx'],
} as const;

// Feature display names
const FEATURE_LABELS: Record<keyof FeatureSupport, string> = {
  jwt: 'JWT Auth',
  oauth2: 'OAuth 2.0',
  socialLogin: 'Social Login',
  passwordReset: 'Password Reset',
  mailService: 'Mail Service',
  fileUpload: 'File Upload',
  jteTemplates: 'jte Templates',
  graphql: 'GraphQL',
  grpc: 'gRPC',
  rateLimit: 'Rate Limiting',
  circuitBreaker: 'Circuit Breaker',
  caching: 'Caching',
  mqtt: 'MQTT',
  modbus: 'Modbus',
  serial: 'Serial',
  onnx: 'ONNX Runtime',
};

export const FeatureMatrix = memo(function FeatureMatrix({
  selectedLanguage,
  selectedFramework,
  onLanguageClick,
}: FeatureMatrixProps) {
  // Build column headers from language metadata
  const columns = useMemo(() => {
    return LANGUAGE_METADATA.map((meta) => ({
      language: meta.language,
      framework: meta.framework,
      displayName: meta.displayName.split('/')[0].trim(), // Just language name
      fullName: meta.displayName,
      features: meta.supportedFeatures,
    }));
  }, []);

  const isSelected = (language: Language, framework: Framework) => {
    return selectedLanguage === language && selectedFramework === framework;
  };

  return (
    <Box className={classes.container}>
      <Title order={4} mb="md">
        Feature Compatibility
      </Title>

      <ScrollArea>
        <Table
          className={classes.table}
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th className={classes.featureHeader}>Feature</Table.Th>
              {columns.map((col) => (
                <Table.Th
                  key={`${col.language}-${col.framework}`}
                  className={classes.languageHeader}
                  data-selected={isSelected(col.language, col.framework) || undefined}
                  onClick={() => onLanguageClick?.(col.language, col.framework)}
                  style={{ cursor: onLanguageClick ? 'pointer' : 'default' }}
                >
                  <Tooltip label={col.fullName}>
                    <Text size="xs" fw={600} ta="center">
                      {col.displayName}
                    </Text>
                  </Tooltip>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {Object.entries(FEATURE_GROUPS).map(([groupName, features]) => (
              <>
                {/* Group header */}
                <Table.Tr key={groupName} className={classes.groupRow}>
                  <Table.Td colSpan={columns.length + 1}>
                    <Text size="xs" fw={700} c="dimmed">
                      {groupName}
                    </Text>
                  </Table.Td>
                </Table.Tr>

                {/* Features in group */}
                {features.map((feature) => (
                  <Table.Tr key={feature}>
                    <Table.Td className={classes.featureCell}>
                      <Text size="xs">
                        {FEATURE_LABELS[feature as keyof FeatureSupport]}
                      </Text>
                    </Table.Td>
                    {columns.map((col) => (
                      <Table.Td
                        key={`${col.language}-${col.framework}-${feature}`}
                        className={classes.supportCell}
                        data-selected={isSelected(col.language, col.framework) || undefined}
                      >
                        <SupportIndicator
                          supported={col.features[feature as keyof FeatureSupport]}
                        />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Text size="xs" c="dimmed" mt="sm">
        Legend: ✓ Supported &nbsp; ✗ Not available
      </Text>
    </Box>
  );
});

// Support indicator component
interface SupportIndicatorProps {
  supported: boolean;
}

const SupportIndicator = memo(function SupportIndicator({
  supported,
}: SupportIndicatorProps) {
  if (supported) {
    return (
      <ThemeIcon size="xs" radius="xl" color="green" variant="light">
        <IconCheck size={10} />
      </ThemeIcon>
    );
  }

  return (
    <ThemeIcon size="xs" radius="xl" color="red" variant="light">
      <IconX size={10} />
    </ThemeIcon>
  );
});
```

```css
/* src/components/LanguageSelector/FeatureMatrix.module.css */

.container {
  margin-top: var(--mantine-spacing-xl);
}

.table {
  min-width: 600px;
}

.featureHeader {
  min-width: 120px;
  position: sticky;
  left: 0;
  background: var(--mantine-color-body);
  z-index: 1;
}

.languageHeader {
  min-width: 70px;
  text-align: center;
  transition: background-color 150ms ease;
}

.languageHeader[data-selected] {
  background-color: var(--mantine-color-blue-1);
}

.featureCell {
  position: sticky;
  left: 0;
  background: var(--mantine-color-body);
  z-index: 1;
}

.supportCell {
  text-align: center;
  vertical-align: middle;
}

.supportCell[data-selected] {
  background-color: var(--mantine-color-blue-0);
}

.groupRow {
  background-color: var(--mantine-color-gray-1);
}

.groupRow td {
  padding-top: var(--mantine-spacing-xs);
  padding-bottom: var(--mantine-spacing-xs);
}
```

---

## UI Preview

```
┌─────────────────────────────────────────────────────────────────┐
│  Feature Compatibility                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Feature          │Java│Kotlin│Python│NestJS│PHP│Go│Rust│C#    │
│  ─────────────────┼────┼──────┼──────┼──────┼───┼──┼────┼──    │
│  Security                                                       │
│  ├─ JWT Auth      │ ✓  │  ✓   │  ✓   │  ✓   │ ✓ │✓ │ ✓  │ ✓    │
│  ├─ OAuth 2.0     │ ✓  │  ✓   │  ✓   │  ✓   │ ✓ │✓ │ ✗  │ ✓    │
│  └─ Social Login  │ ✓  │  ✓   │  ✗   │  ✓   │ ✗ │✗ │ ✗  │ ✗    │
│                                                                 │
│  Feature Pack 2025                                              │
│  ├─ Password Reset│ ✓  │  ✓   │  ✓   │  ✓   │ ✓ │✓ │ ✗  │ ✓    │
│  ...                                                            │
│                                                                 │
│  Legend: ✓ Supported  ✗ Not available                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Criterios de Completado

- [ ] Tabla renderiza todos los lenguajes
- [ ] Features agrupadas por categoria
- [ ] Indicadores visuales claros
- [ ] Columna seleccionada resaltada
- [ ] Click en header selecciona lenguaje
- [ ] ScrollArea para mobile
- [ ] Feature column sticky en scroll
- [ ] `npm run check` pasa

---

## Notas

- Usar ScrollArea para scroll horizontal en mobile
- Primera columna sticky para mantener contexto
- Agrupar features para mejor organizacion

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

[[T-011]] → [[T-013]] → [[T-019]] | [[Phases/01-LANGUAGE-SELECTOR]]
