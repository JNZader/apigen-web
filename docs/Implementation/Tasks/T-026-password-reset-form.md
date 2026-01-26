# T-026: Crear PasswordResetSettingsForm.tsx

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.4 Password Reset

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-026 |
| **Tipo** | Feature |
| **Estimado** | 1.5h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/feature-password` |
| **Estado** | Pending |
| **Paralelo** | SI - con T-020, T-022, T-024, T-028 |

---

## Objetivo

Crear formulario simple para habilitar Password Reset con warning de dependencia en Mail Service.

---

## Tareas

- [ ] Crear `PasswordResetSettingsForm.tsx`
- [ ] Toggle para habilitar
- [ ] Warning si Mail no esta habilitado
- [ ] Descripcion de lo que genera

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── PasswordResetSettingsForm.tsx  ← CREAR (~80 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/PasswordResetSettingsForm.tsx

import {
  Stack,
  Switch,
  Group,
  Text,
  Alert,
  List,
  ThemeIcon,
  Paper,
} from '@mantine/core';
import {
  IconKey,
  IconMail,
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { memo } from 'react';
import { useProjectStore } from '@/store';

export const PasswordResetSettingsForm = memo(function PasswordResetSettingsForm() {
  const passwordReset = useProjectStore((s) => s.features.passwordReset);
  const mailEnabled = useProjectStore((s) => s.mailConfig.enabled);
  const updateFeature = useProjectStore((s) => s.updateFeature);
  const targetConfig = useProjectStore((s) => s.targetConfig);

  const isSupported = targetConfig
    ? !['rust'].includes(targetConfig.language)
    : true;

  if (!isSupported) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} title="Not Available" color="yellow">
        Password Reset is not available for {targetConfig?.language}.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* Master toggle */}
      <Group justify="space-between">
        <div>
          <Group gap="xs">
            <IconKey size={20} />
            <Text fw={500}>Enable Password Reset</Text>
          </Group>
          <Text size="sm" c="dimmed">
            Allow users to reset their password via email
          </Text>
        </div>
        <Switch
          checked={passwordReset}
          onChange={(e) => updateFeature('passwordReset', e.currentTarget.checked)}
          size="md"
        />
      </Group>

      {/* Dependency warning */}
      {passwordReset && !mailEnabled && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Mail Service Required"
          color="yellow"
        >
          <Text size="sm">
            Password Reset requires Mail Service to send reset emails.
            <br />
            Please enable Mail Service in the Mail tab.
          </Text>
        </Alert>
      )}

      {/* What gets generated */}
      {passwordReset && (
        <Paper withBorder p="md" radius="md">
          <Text fw={500} mb="sm">
            This will generate:
          </Text>

          <List
            spacing="xs"
            size="sm"
            icon={
              <ThemeIcon color="green" size={20} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <Text fw={500}>PasswordResetToken</Text>
              <Text size="xs" c="dimmed">
                Entity to store reset tokens with expiration
              </Text>
            </List.Item>
            <List.Item>
              <Text fw={500}>PasswordResetService</Text>
              <Text size="xs" c="dimmed">
                Service to handle token generation and validation
              </Text>
            </List.Item>
            <List.Item>
              <Text fw={500}>PasswordResetController</Text>
              <Text size="xs" c="dimmed">
                REST endpoints for password reset flow
              </Text>
            </List.Item>
          </List>

          <Text size="sm" mt="md" c="dimmed">
            <strong>Endpoints:</strong>
          </Text>
          <List size="xs" c="dimmed">
            <List.Item>POST /api/auth/password/forgot - Request reset email</List.Item>
            <List.Item>POST /api/auth/password/reset - Reset with token</List.Item>
          </List>
        </Paper>
      )}
    </Stack>
  );
});
```

---

## Criterios de Completado

- [ ] Toggle habilita/deshabilita feature
- [ ] Warning si Mail Service no esta habilitado
- [ ] Descripcion clara de lo que genera
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

#task #fase-2 #feature #pending

Fase 0 → [[T-026]] → [[T-027]] | [[Phases/02-FEATURE-PACK]]
