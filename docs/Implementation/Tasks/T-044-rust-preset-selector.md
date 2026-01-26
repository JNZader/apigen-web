# T-044: Crear RustPresetSelector Component

> Fase: [[Phases/04-RUST-EDGE]] | Iteracion: 4.1 Core Components

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-044 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | [[T-002]], [[T-011]] |
| **Branch** | `feat/rust-support` |
| **Estado** | Pending |

---

## Objetivo

Crear componente para seleccionar presets de Rust con diferentes configuraciones optimizadas.

---

## Tareas

- [ ] Crear `RustPresetSelector.tsx`
- [ ] Cards para cada preset
- [ ] Descripcion de cada preset
- [ ] Indicadores de features incluidas

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── RustPresetSelector.tsx  ← CREAR (~180 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/RustPresetSelector.tsx

import {
  Stack,
  SimpleGrid,
  Paper,
  Text,
  Group,
  Badge,
  ThemeIcon,
  List,
  Radio,
} from '@mantine/core';
import {
  IconRocket,
  IconServer,
  IconCloud,
  IconBolt,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { memo, useCallback } from 'react';
import { useProjectStore } from '@/store';
import type { RustPreset } from '@/types/config/rust';

interface PresetInfo {
  id: RustPreset;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: {
    name: string;
    included: boolean;
  }[];
  useCases: string[];
}

const PRESETS: PresetInfo[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Bare-bones API with minimal dependencies',
    icon: <IconBolt size={24} />,
    color: 'gray',
    features: [
      { name: 'Basic CRUD', included: true },
      { name: 'JSON Serialization', included: true },
      { name: 'Validation', included: false },
      { name: 'OpenAPI Docs', included: false },
      { name: 'Database Pool', included: false },
    ],
    useCases: ['Prototyping', 'Simple microservices', 'Learning Rust'],
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced setup for production APIs',
    icon: <IconServer size={24} />,
    color: 'blue',
    features: [
      { name: 'Basic CRUD', included: true },
      { name: 'JSON Serialization', included: true },
      { name: 'Validation', included: true },
      { name: 'OpenAPI Docs', included: true },
      { name: 'Database Pool', included: true },
    ],
    useCases: ['Production APIs', 'Web services', 'Backend applications'],
  },
  {
    id: 'full',
    name: 'Full',
    description: 'Complete setup with all features enabled',
    icon: <IconCloud size={24} />,
    color: 'green',
    features: [
      { name: 'Basic CRUD', included: true },
      { name: 'JSON Serialization', included: true },
      { name: 'Validation', included: true },
      { name: 'OpenAPI Docs', included: true },
      { name: 'Database Pool', included: true },
      { name: 'Caching', included: true },
      { name: 'Rate Limiting', included: true },
      { name: 'Metrics', included: true },
    ],
    useCases: ['Enterprise APIs', 'High-traffic services', 'Complex applications'],
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Optimized for maximum throughput',
    icon: <IconRocket size={24} />,
    color: 'orange',
    features: [
      { name: 'Basic CRUD', included: true },
      { name: 'JSON Serialization', included: true },
      { name: 'Validation', included: true },
      { name: 'Connection Pool', included: true },
      { name: 'Zero-Copy Parsing', included: true },
      { name: 'Async I/O', included: true },
    ],
    useCases: ['High-performance APIs', 'Real-time systems', 'Low-latency services'],
  },
];

export const RustPresetSelector = memo(function RustPresetSelector() {
  const rustOptions = useProjectStore((s) => s.rustOptions);
  const updateRustOptions = useProjectStore((s) => s.updateRustOptions);

  const handlePresetChange = useCallback(
    (preset: RustPreset) => {
      updateRustOptions({ preset });
    },
    [updateRustOptions]
  );

  return (
    <Stack gap="md">
      <div>
        <Text fw={600} size="lg">
          Select Rust Preset
        </Text>
        <Text size="sm" c="dimmed">
          Choose a configuration that matches your project requirements
        </Text>
      </div>

      <Radio.Group
        value={rustOptions.preset}
        onChange={(val) => handlePresetChange(val as RustPreset)}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              selected={rustOptions.preset === preset.id}
            />
          ))}
        </SimpleGrid>
      </Radio.Group>
    </Stack>
  );
});

interface PresetCardProps {
  preset: PresetInfo;
  selected: boolean;
}

const PresetCard = memo(function PresetCard({ preset, selected }: PresetCardProps) {
  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{
        cursor: 'pointer',
        borderColor: selected ? `var(--mantine-color-${preset.color}-5)` : undefined,
        backgroundColor: selected ? `var(--mantine-color-${preset.color}-0)` : undefined,
      }}
    >
      <Radio value={preset.id} label="" style={{ display: 'none' }} />

      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color={preset.color} size="lg" variant="light">
              {preset.icon}
            </ThemeIcon>
            <div>
              <Text fw={600}>{preset.name}</Text>
              <Text size="xs" c="dimmed">
                {preset.description}
              </Text>
            </div>
          </Group>
          {selected && (
            <Badge color={preset.color} variant="filled">
              Selected
            </Badge>
          )}
        </Group>

        <List size="xs" spacing={4}>
          {preset.features.map((feature) => (
            <List.Item
              key={feature.name}
              icon={
                <ThemeIcon
                  size={16}
                  radius="xl"
                  color={feature.included ? 'green' : 'gray'}
                  variant="light"
                >
                  {feature.included ? <IconCheck size={10} /> : <IconX size={10} />}
                </ThemeIcon>
              }
            >
              <Text size="xs" c={feature.included ? undefined : 'dimmed'}>
                {feature.name}
              </Text>
            </List.Item>
          ))}
        </List>

        <div>
          <Text size="xs" fw={500} c="dimmed">
            Best for:
          </Text>
          <Group gap={4} mt={4}>
            {preset.useCases.map((useCase) => (
              <Badge key={useCase} size="xs" variant="outline" color="gray">
                {useCase}
              </Badge>
            ))}
          </Group>
        </div>
      </Stack>
    </Paper>
  );
});
```

---

## Criterios de Completado

- [ ] 4 presets visibles
- [ ] Seleccion funciona
- [ ] Features listadas correctamente
- [ ] Descripcion clara de cada preset
- [ ] Config se guarda en store
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

#task #fase-4 #feature #pending

[[T-002]], [[T-011]] → [[T-044]] → [[T-045]] | [[Phases/04-RUST-EDGE]]
