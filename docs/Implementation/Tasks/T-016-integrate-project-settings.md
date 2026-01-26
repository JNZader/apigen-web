# T-016: Integrar LanguageSelector en ProjectSettings

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.3 Integracion

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-016 |
| **Tipo** | Feature |
| **Estimado** | 1h |
| **Dependencias** | [[T-011]], [[T-012]], [[T-013]], [[T-014]], [[T-015]] |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Integrar el LanguageSelector como primera tab en ProjectSettings, permitiendo cambiar el lenguaje del proyecto.

---

## Tareas

- [ ] Agregar tab "Language" en ProjectSettings
- [ ] Importar LanguageSelector
- [ ] Posicionar como primera tab
- [ ] Manejar cambio de lenguaje
- [ ] Mostrar warning si hay features incompatibles

---

## Archivos a Modificar

```
src/components/ProjectSettings/
└── index.tsx                    ← MODIFICAR (~30 lineas adicionales)
```

**LOC Estimado:** ~30 adicionales

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/index.tsx - MODIFICAR

import { Tabs, Alert, Text } from '@mantine/core';
import { IconLanguage, IconAlertCircle } from '@tabler/icons-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useProjectStore } from '@/store';
import { validateFeatureCompatibility } from '@/config/featureCompatibility';
import { memo, useMemo } from 'react';

// ... existing imports ...

export const ProjectSettings = memo(function ProjectSettings() {
  const targetConfig = useProjectStore((s) => s.targetConfig);
  const features = useProjectStore((s) => s.features);

  // Validar compatibilidad cuando cambia lenguaje o features
  const compatibility = useMemo(() => {
    if (!targetConfig) return null;
    return validateFeatureCompatibility(
      targetConfig.language,
      targetConfig.framework,
      features
    );
  }, [targetConfig, features]);

  return (
    <Tabs defaultValue="language" orientation="vertical">
      <Tabs.List>
        {/* NEW: Language tab - first position */}
        <Tabs.Tab
          value="language"
          leftSection={<IconLanguage size={16} />}
        >
          Language
        </Tabs.Tab>

        {/* Existing tabs */}
        <Tabs.Tab value="basic" leftSection={<IconSettings size={16} />}>
          Basic
        </Tabs.Tab>
        <Tabs.Tab value="database" leftSection={<IconDatabase size={16} />}>
          Database
        </Tabs.Tab>
        <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
          Security
        </Tabs.Tab>
        {/* ... rest of existing tabs ... */}

        {/* Feature Pack 2025 tabs (condicionales) */}
        {targetConfig && isFeatureAvailable(targetConfig.language, 'socialLogin') && (
          <Tabs.Tab value="social-login" leftSection={<IconBrandGoogle size={16} />}>
            Social Login
          </Tabs.Tab>
        )}
        {/* ... etc ... */}
      </Tabs.List>

      {/* Compatibility warnings */}
      {compatibility && compatibility.warnings.length > 0 && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Compatibility Notice"
          color="yellow"
          mb="md"
        >
          <Text size="sm">
            {compatibility.warnings.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </Text>
        </Alert>
      )}

      {/* NEW: Language panel */}
      <Tabs.Panel value="language" p="md">
        <LanguageSelector
          showFeatureMatrix
          onSelect={(language, framework) => {
            // El selector ya actualiza el store
            // Aqui podemos agregar logica adicional si es necesario
          }}
        />
      </Tabs.Panel>

      {/* Existing panels */}
      <Tabs.Panel value="basic" p="md">
        <BasicSettingsForm />
      </Tabs.Panel>

      {/* ... rest of existing panels ... */}
    </Tabs>
  );
});
```

---

## UI Preview

```
┌─────────────────────────────────────────────────────────────────┐
│  Project Settings                                                │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  [Language]  │  Select Target Language                          │
│   Basic      │  Choose the language and framework for your API  │
│   Database   │                                                  │
│   Security   │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│   Cache      │  │  Java   │ │ Kotlin  │ │ Python  │ ...        │
│   Features   │  └─────────┘ └─────────┘ └─────────┘            │
│   ...        │                                                  │
│              │  Feature Compatibility Matrix                    │
│  Social*     │  [Matrix table...]                              │
│  Mail*       │                                                  │
│              │  * Only shown if supported by language           │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## Logica de Tabs Condicionales

```typescript
// Tabs que dependen del lenguaje seleccionado
const conditionalTabs = useMemo(() => {
  if (!targetConfig) return [];

  const tabs = [];

  if (isFeatureAvailable(targetConfig.language, 'socialLogin')) {
    tabs.push({ value: 'social-login', label: 'Social Login', icon: IconBrandGoogle });
  }
  if (isFeatureAvailable(targetConfig.language, 'mailService')) {
    tabs.push({ value: 'mail', label: 'Mail Service', icon: IconMail });
  }
  if (isFeatureAvailable(targetConfig.language, 'fileUpload')) {
    tabs.push({ value: 'storage', label: 'File Storage', icon: IconUpload });
  }
  if (isFeatureAvailable(targetConfig.language, 'jteTemplates')) {
    tabs.push({ value: 'jte', label: 'jte Templates', icon: IconTemplate });
  }
  if (targetConfig.language === 'rust') {
    tabs.push({ value: 'rust', label: 'Rust Options', icon: IconBrandRust });
  }

  return tabs;
}, [targetConfig]);
```

---

## Criterios de Completado

- [ ] Tab "Language" aparece primero
- [ ] LanguageSelector renderiza correctamente
- [ ] Cambio de lenguaje actualiza store
- [ ] Tabs condicionales aparecen/desaparecen
- [ ] Warnings de compatibilidad visibles
- [ ] No hay regresiones en tabs existentes
- [ ] `npm run check` pasa

---

## Notas

- Language debe ser la primera tab
- Los tabs de Feature Pack 2025 son condicionales
- El tab de Rust solo aparece si language === 'rust'

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

[[T-011]] → [[T-016]] → [[T-017]] | [[Phases/01-LANGUAGE-SELECTOR]]
