# T-030: Integrar Formularios en ProjectSettings

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.6 Integracion

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-030 |
| **Tipo** | Integration |
| **Estimado** | 1h |
| **Dependencias** | [[T-021]], [[T-023]], [[T-025]], [[T-027]], [[T-029]] |
| **Branch** | `feat/feature-pack-integration` |
| **Estado** | Pending |

---

## Objetivo

Integrar todos los formularios de Feature Pack 2025 en ProjectSettings con una nueva seccion de tabs.

---

## Tareas

- [ ] Crear componente `FeaturePackSection.tsx`
- [ ] Agregar tabs para cada feature
- [ ] Integrar en ProjectSettings existente
- [ ] Asegurar lazy loading de tabs

---

## Archivos a Crear/Modificar

```
src/components/ProjectSettings/
├── FeaturePackSection.tsx     ← CREAR (~80 lineas)
└── index.ts                   ← MODIFICAR (agregar exports)

src/components/
└── ProjectSettings.tsx        ← MODIFICAR (agregar tab)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/FeaturePackSection.tsx

import { Tabs, Stack, Text, Badge, Group } from '@mantine/core';
import {
  IconBrandGoogle,
  IconMail,
  IconUpload,
  IconKey,
  IconTemplate,
} from '@tabler/icons-react';
import { memo, lazy, Suspense } from 'react';
import { useProjectStore } from '@/store';

// Lazy load forms para mejor performance
const SocialLoginSettingsForm = lazy(() =>
  import('./SocialLoginSettingsForm').then((m) => ({
    default: m.SocialLoginSettingsForm,
  }))
);
const MailServiceSettingsForm = lazy(() =>
  import('./MailServiceSettingsForm').then((m) => ({
    default: m.MailServiceSettingsForm,
  }))
);
const FileStorageSettingsForm = lazy(() =>
  import('./FileStorageSettingsForm').then((m) => ({
    default: m.FileStorageSettingsForm,
  }))
);
const PasswordResetSettingsForm = lazy(() =>
  import('./PasswordResetSettingsForm').then((m) => ({
    default: m.PasswordResetSettingsForm,
  }))
);
const JteTemplatesSettingsForm = lazy(() =>
  import('./JteTemplatesSettingsForm').then((m) => ({
    default: m.JteTemplatesSettingsForm,
  }))
);

const LoadingFallback = () => (
  <Stack align="center" py="xl">
    <Text c="dimmed">Loading...</Text>
  </Stack>
);

export const FeaturePackSection = memo(function FeaturePackSection() {
  const features = useProjectStore((s) => s.features);
  const targetConfig = useProjectStore((s) => s.targetConfig);

  const isJavaKotlin = targetConfig
    ? ['java', 'kotlin'].includes(targetConfig.language)
    : false;

  const enabledCount = [
    features.socialLogin,
    features.mailService,
    features.fileUpload,
    features.passwordReset,
    features.jteTemplates,
  ].filter(Boolean).length;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">
          Feature Pack 2025
        </Text>
        <Badge variant="light" color={enabledCount > 0 ? 'green' : 'gray'}>
          {enabledCount} enabled
        </Badge>
      </Group>

      <Tabs defaultValue="social" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="social" leftSection={<IconBrandGoogle size={16} />}>
            Social Login
          </Tabs.Tab>
          <Tabs.Tab value="mail" leftSection={<IconMail size={16} />}>
            Mail
          </Tabs.Tab>
          <Tabs.Tab value="storage" leftSection={<IconUpload size={16} />}>
            Storage
          </Tabs.Tab>
          <Tabs.Tab value="password" leftSection={<IconKey size={16} />}>
            Password Reset
          </Tabs.Tab>
          {isJavaKotlin && (
            <Tabs.Tab value="jte" leftSection={<IconTemplate size={16} />}>
              JTE
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="social" pt="md">
          <Suspense fallback={<LoadingFallback />}>
            <SocialLoginSettingsForm />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="mail" pt="md">
          <Suspense fallback={<LoadingFallback />}>
            <MailServiceSettingsForm />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="storage" pt="md">
          <Suspense fallback={<LoadingFallback />}>
            <FileStorageSettingsForm />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="password" pt="md">
          <Suspense fallback={<LoadingFallback />}>
            <PasswordResetSettingsForm />
          </Suspense>
        </Tabs.Panel>

        {isJavaKotlin && (
          <Tabs.Panel value="jte" pt="md">
            <Suspense fallback={<LoadingFallback />}>
              <JteTemplatesSettingsForm />
            </Suspense>
          </Tabs.Panel>
        )}
      </Tabs>
    </Stack>
  );
});
```

```typescript
// Agregar a ProjectSettings.tsx en el Accordion principal

<Accordion.Item value="feature-pack">
  <Accordion.Control icon={<IconPackage size={20} />}>
    Feature Pack 2025
  </Accordion.Control>
  <Accordion.Panel>
    <FeaturePackSection />
  </Accordion.Panel>
</Accordion.Item>
```

---

## Criterios de Completado

- [ ] Nueva seccion visible en ProjectSettings
- [ ] Tabs funcionan correctamente
- [ ] Lazy loading implementado
- [ ] Badge muestra cantidad habilitada
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

#task #fase-2 #integration #pending

[[T-021]], [[T-023]], [[T-025]], [[T-027]], [[T-029]] → [[T-030]] → [[T-031]] | [[Phases/02-FEATURE-PACK]]
