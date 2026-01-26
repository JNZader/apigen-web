# T-020: Crear SocialLoginSettingsForm.tsx

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.1 Social Login

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-020 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/feature-social` |
| **Estado** | Pending |
| **Paralelo** | SI - con T-022, T-024, T-026, T-028 |

---

## Objetivo

Crear el formulario de configuracion de Social Login que permite habilitar autenticacion via Google, GitHub, y LinkedIn.

---

## Tareas

- [ ] Crear `SocialLoginSettingsForm.tsx`
- [ ] Integrar con projectStore
- [ ] Validacion de URLs de redireccion
- [ ] Tooltips explicativos
- [ ] Tests unitarios

---

## Archivos a Crear

```
src/components/ProjectSettings/
├── SocialLoginSettingsForm.tsx      ← CREAR (~150 lineas)
└── SocialLoginSettingsForm.test.tsx ← CREAR (~80 lineas)
```

**LOC Estimado:** ~230

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/SocialLoginSettingsForm.tsx

import {
  Stack,
  Switch,
  TextInput,
  Checkbox,
  Group,
  Text,
  Paper,
  Tooltip,
  ThemeIcon,
  Divider,
  Alert,
} from '@mantine/core';
import {
  IconBrandGoogle,
  IconBrandGithub,
  IconBrandLinkedin,
  IconInfoCircle,
  IconExternalLink,
} from '@tabler/icons-react';
import { memo, useCallback } from 'react';
import { useProjectStore } from '@/store';
import type { SocialLoginConfig } from '@/types/config/featurepack';

export const SocialLoginSettingsForm = memo(function SocialLoginSettingsForm() {
  const socialLoginConfig = useProjectStore((s) => s.socialLoginConfig);
  const updateSocialLoginConfig = useProjectStore((s) => s.updateSocialLoginConfig);
  const targetConfig = useProjectStore((s) => s.targetConfig);

  // Verificar si social login esta soportado para el lenguaje actual
  const isSupported = targetConfig
    ? ['java', 'kotlin', 'typescript'].includes(targetConfig.language)
    : true;

  const handleChange = useCallback(
    <K extends keyof SocialLoginConfig>(key: K, value: SocialLoginConfig[K]) => {
      updateSocialLoginConfig({ [key]: value });
    },
    [updateSocialLoginConfig]
  );

  if (!isSupported) {
    return (
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Not Available"
        color="yellow"
      >
        Social Login is not available for {targetConfig?.language}. It is only
        supported for Java, Kotlin, and TypeScript/NestJS.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* Master toggle */}
      <Group justify="space-between">
        <div>
          <Text fw={500}>Enable Social Login</Text>
          <Text size="sm" c="dimmed">
            Allow users to sign in with external providers
          </Text>
        </div>
        <Switch
          checked={socialLoginConfig.enabled}
          onChange={(e) => handleChange('enabled', e.currentTarget.checked)}
          size="md"
        />
      </Group>

      {socialLoginConfig.enabled && (
        <>
          <Divider />

          {/* Providers */}
          <Text fw={500}>OAuth Providers</Text>
          <Group gap="lg">
            <ProviderCheckbox
              icon={<IconBrandGoogle size={20} />}
              label="Google"
              checked={socialLoginConfig.google}
              onChange={(checked) => handleChange('google', checked)}
              color="red"
            />
            <ProviderCheckbox
              icon={<IconBrandGithub size={20} />}
              label="GitHub"
              checked={socialLoginConfig.github}
              onChange={(checked) => handleChange('github', checked)}
              color="dark"
            />
            <ProviderCheckbox
              icon={<IconBrandLinkedin size={20} />}
              label="LinkedIn"
              checked={socialLoginConfig.linkedin}
              onChange={(checked) => handleChange('linkedin', checked)}
              color="blue"
            />
          </Group>

          {!socialLoginConfig.google &&
            !socialLoginConfig.github &&
            !socialLoginConfig.linkedin && (
              <Alert color="yellow" icon={<IconInfoCircle size={16} />}>
                Select at least one provider
              </Alert>
            )}

          <Divider />

          {/* Redirect URLs */}
          <Text fw={500}>Redirect URLs</Text>
          <TextInput
            label="Success Redirect URL"
            description="Where to redirect after successful login"
            placeholder="/dashboard"
            value={socialLoginConfig.successRedirectUrl}
            onChange={(e) =>
              handleChange('successRedirectUrl', e.currentTarget.value)
            }
            leftSection={<IconExternalLink size={16} />}
          />
          <TextInput
            label="Failure Redirect URL"
            description="Where to redirect after failed login"
            placeholder="/login?error=true"
            value={socialLoginConfig.failureRedirectUrl}
            onChange={(e) =>
              handleChange('failureRedirectUrl', e.currentTarget.value)
            }
            leftSection={<IconExternalLink size={16} />}
          />

          <Divider />

          {/* Options */}
          <Text fw={500}>Options</Text>
          <Stack gap="xs">
            <Checkbox
              label="Auto-create user on first login"
              description="Create a new user account if it doesn't exist"
              checked={socialLoginConfig.autoCreateUser}
              onChange={(e) =>
                handleChange('autoCreateUser', e.currentTarget.checked)
              }
            />
            <Checkbox
              label="Link accounts by email"
              description="Link social accounts to existing users with the same email"
              checked={socialLoginConfig.linkByEmail}
              onChange={(e) =>
                handleChange('linkByEmail', e.currentTarget.checked)
              }
            />
          </Stack>
        </>
      )}
    </Stack>
  );
});

// Sub-componente para provider checkbox
interface ProviderCheckboxProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: string;
}

const ProviderCheckbox = memo(function ProviderCheckbox({
  icon,
  label,
  checked,
  onChange,
  color,
}: ProviderCheckboxProps) {
  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      style={{
        cursor: 'pointer',
        borderColor: checked ? `var(--mantine-color-${color}-5)` : undefined,
        backgroundColor: checked
          ? `var(--mantine-color-${color}-0)`
          : undefined,
      }}
      onClick={() => onChange(!checked)}
    >
      <Group gap="xs">
        <ThemeIcon variant="light" color={color} size="lg">
          {icon}
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          <Checkbox
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              onChange(e.currentTarget.checked);
            }}
            size="xs"
            styles={{ input: { cursor: 'pointer' } }}
          />
        </div>
      </Group>
    </Paper>
  );
});
```

---

## UI Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Social Login Configuration                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Enable Social Login                              [Toggle]  │
│  Allow users to sign in with external providers             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  OAuth Providers                                            │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ G Google │  │  GitHub  │  │ LinkedIn │                   │
│  │   [x]    │  │   [x]    │  │   [ ]    │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Redirect URLs                                              │
│                                                             │
│  Success Redirect URL                                       │
│  Where to redirect after successful login                   │
│  [🔗 /dashboard_______________________________________]     │
│                                                             │
│  Failure Redirect URL                                       │
│  Where to redirect after failed login                       │
│  [🔗 /login?error=true________________________________]     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Options                                                    │
│                                                             │
│  [x] Auto-create user on first login                        │
│      Create a new user account if it doesn't exist          │
│                                                             │
│  [x] Link accounts by email                                 │
│      Link social accounts to existing users with same email │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Store Integration

```typescript
// Agregar a projectStore.ts o crear slice

interface ProjectState {
  // ... existing ...
  socialLoginConfig: SocialLoginConfig;
  updateSocialLoginConfig: (updates: Partial<SocialLoginConfig>) => void;
}

// Implementacion
socialLoginConfig: DEFAULT_SOCIAL_LOGIN_CONFIG,

updateSocialLoginConfig: (updates) => {
  set((state) => ({
    socialLoginConfig: { ...state.socialLoginConfig, ...updates },
  }));
},
```

---

## Criterios de Completado

- [ ] Toggle master habilita/deshabilita seccion
- [ ] Providers se pueden seleccionar individualmente
- [ ] URLs validan formato
- [ ] Warning si no hay providers seleccionados
- [ ] Alert si lenguaje no soportado
- [ ] Config se guarda en store
- [ ] Tests pasan (>80% cobertura)
- [ ] `npm run check` pasa

---

## Paralelizacion

Esta tarea puede ejecutarse **simultaneamente** con:
- [[T-022]] MailServiceSettingsForm
- [[T-024]] FileStorageSettingsForm
- [[T-026]] PasswordResetSettingsForm
- [[T-028]] JteTemplatesSettingsForm

**Archivos compartidos:** Ninguno (cada form es independiente)

---

## Notas

- Usar `memo` para evitar re-renders
- Provider icons de Tabler Icons
- Mantener consistencia visual con otros forms

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

#task #fase-2 #feature #pending

[[Phases/02-FEATURE-PACK]] | [[T-021]]
