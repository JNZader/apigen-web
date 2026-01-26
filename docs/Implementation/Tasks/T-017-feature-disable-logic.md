# T-017: Logica de Deshabilitacion de Features

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.3 Integracion

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-017 |
| **Tipo** | Feature |
| **Estimado** | 1h |
| **Dependencias** | [[T-015]], [[T-016]] |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Implementar la logica que deshabilita automaticamente features no soportadas cuando cambia el lenguaje seleccionado.

---

## Tareas

- [ ] Hook para manejar cambios de lenguaje
- [ ] Deshabilitar features incompatibles en store
- [ ] Mostrar notificacion de features deshabilitadas
- [ ] Habilitar dependencias automaticamente
- [ ] Actualizar UI de features forms

---

## Archivos a Crear/Modificar

```
src/hooks/
└── useLanguageChange.ts         ← CREAR (~80 lineas)

src/store/
└── projectStore.ts              ← MODIFICAR (agregar logica)

src/components/ProjectSettings/
└── FeaturesSettingsForm.tsx     ← MODIFICAR (indicadores)
```

**LOC Estimado:** ~120

---

## Codigo de Referencia

```typescript
// src/hooks/useLanguageChange.ts

import { useEffect, useRef } from 'react';
import { useProjectStore } from '@/store';
import {
  validateFeatureCompatibility,
  applyFeatureAutoFixes,
} from '@/config/featureCompatibility';
import { notify } from '@/utils/notifications';
import type { Language, Framework } from '@/types/target';

/**
 * Hook que maneja los efectos secundarios de cambiar el lenguaje
 */
export function useLanguageChange() {
  const targetConfig = useProjectStore((s) => s.targetConfig);
  const features = useProjectStore((s) => s.features);
  const setFeatures = useProjectStore((s) => s.setFeatures);
  const previousLanguage = useRef<Language | null>(null);

  useEffect(() => {
    if (!targetConfig) return;

    const currentLanguage = targetConfig.language;

    // Solo ejecutar si el lenguaje cambio
    if (previousLanguage.current === currentLanguage) return;

    // Validar compatibilidad
    const result = validateFeatureCompatibility(
      currentLanguage,
      targetConfig.framework,
      features
    );

    // Si hay features a deshabilitar o habilitar
    if (result.autoDisabled.length > 0 || result.autoEnabled.length > 0) {
      // Aplicar auto-fixes
      const fixedFeatures = applyFeatureAutoFixes(currentLanguage, features);
      setFeatures(fixedFeatures);

      // Notificar al usuario
      if (result.autoDisabled.length > 0) {
        notify.warning({
          title: 'Features adjusted',
          message: `${result.autoDisabled.length} feature(s) disabled for ${currentLanguage}: ${result.autoDisabled.join(', ')}`,
        });
      }

      if (result.autoEnabled.length > 0) {
        notify.info({
          title: 'Dependencies enabled',
          message: `${result.autoEnabled.length} feature(s) auto-enabled: ${result.autoEnabled.join(', ')}`,
        });
      }
    }

    previousLanguage.current = currentLanguage;
  }, [targetConfig, features, setFeatures]);
}

/**
 * Hook para verificar si una feature esta disponible
 */
export function useFeatureAvailability(feature: keyof ProjectFeatures): {
  available: boolean;
  reason?: string;
} {
  const targetConfig = useProjectStore((s) => s.targetConfig);

  if (!targetConfig) {
    return { available: true };
  }

  const restrictions = LANGUAGE_FEATURE_RESTRICTIONS[targetConfig.language] || [];

  if (restrictions.includes(feature)) {
    return {
      available: false,
      reason: `Not available for ${targetConfig.language}`,
    };
  }

  return { available: true };
}
```

```typescript
// src/store/projectStore.ts - AGREGAR al store

// Agregar action para set all features
setFeatures: (features: ProjectFeatures) => {
  set({ features });
},

// Modificar setTargetLanguage para aplicar auto-fixes
setTargetLanguage: (language, framework) => {
  const currentFeatures = get().features;

  // Aplicar auto-fixes inmediatamente
  const fixedFeatures = applyFeatureAutoFixes(language, currentFeatures);

  set({
    targetConfig: { language, framework },
    features: fixedFeatures,
    // Reset language-specific options
    rustOptions: language === 'rust' ? getPresetDefaults('cloud') : null,
    goChiOptions: language === 'go' && framework === 'chi'
      ? getGoChiDefaults()
      : null,
  });
},
```

```typescript
// src/components/ProjectSettings/FeaturesSettingsForm.tsx - MODIFICAR

import { Tooltip, Switch, Text, Group, Badge } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useFeatureAvailability } from '@/hooks/useLanguageChange';

// Componente para switch de feature con indicador de disponibilidad
interface FeatureSwitchProps {
  feature: keyof ProjectFeatures;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const FeatureSwitch = memo(function FeatureSwitch({
  feature,
  label,
  description,
  checked,
  onChange,
}: FeatureSwitchProps) {
  const { available, reason } = useFeatureAvailability(feature);

  if (!available) {
    return (
      <Tooltip label={reason}>
        <Group gap="xs" style={{ opacity: 0.5 }}>
          <Switch
            checked={false}
            disabled
            label={label}
            description={description}
          />
          <Badge size="xs" color="gray" leftSection={<IconLock size={10} />}>
            Unavailable
          </Badge>
        </Group>
      </Tooltip>
    );
  }

  return (
    <Switch
      checked={checked}
      onChange={(e) => onChange(e.currentTarget.checked)}
      label={label}
      description={description}
    />
  );
});

// Usar en el form
export const FeaturesSettingsForm = memo(function FeaturesSettingsForm() {
  const features = useProjectStore((s) => s.features);
  const updateFeature = useProjectStore((s) => s.updateFeature);

  return (
    <Stack gap="md">
      <FeatureSwitch
        feature="socialLogin"
        label="Social Login"
        description="Enable OAuth login with Google, GitHub, LinkedIn"
        checked={features.socialLogin}
        onChange={(checked) => updateFeature('socialLogin', checked)}
      />

      <FeatureSwitch
        feature="passwordReset"
        label="Password Reset"
        description="Enable password reset via email"
        checked={features.passwordReset}
        onChange={(checked) => updateFeature('passwordReset', checked)}
      />

      {/* ... resto de features ... */}
    </Stack>
  );
});
```

---

## Flujo de Deshabilitacion

```
Usuario selecciona Rust
         │
         ▼
┌─────────────────────────┐
│  validateCompatibility  │
│  detecta features       │
│  incompatibles          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  applyAutoFixes         │
│  - socialLogin: false   │
│  - mailService: false   │
│  - jteTemplates: false  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  setFeatures(fixed)     │
│  notify.warning(...)    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  UI actualiza           │
│  - switches disabled    │
│  - badges "Unavailable" │
└─────────────────────────┘
```

---

## Criterios de Completado

- [ ] Cambio de lenguaje deshabilita features automaticamente
- [ ] Notificacion informa al usuario
- [ ] Switches deshabilitados tienen indicador visual
- [ ] Tooltip explica por que esta deshabilitado
- [ ] Dependencias se habilitan automaticamente
- [ ] No hay regresiones
- [ ] `npm run check` pasa

---

## Notas

- Usar notify para feedback al usuario
- Indicador visual claro de features no disponibles
- El tooltip debe explicar el motivo

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

[[T-015]] [[T-016]] → [[T-017]] | [[Phases/01-LANGUAGE-SELECTOR]]
