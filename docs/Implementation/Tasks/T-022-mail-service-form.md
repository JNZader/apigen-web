# T-022: Crear MailServiceSettingsForm.tsx

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.2 Mail Service

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-022 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/feature-mail` |
| **Estado** | Pending |
| **Paralelo** | SI - con T-020, T-024, T-026, T-028 |

---

## Objetivo

Crear el formulario de configuracion de Mail Service para envio de emails via SMTP.

---

## Tareas

- [ ] Crear `MailServiceSettingsForm.tsx`
- [ ] Campos SMTP (host, port, username)
- [ ] Opciones de templates
- [ ] Validacion de email
- [ ] Integrar con store

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── MailServiceSettingsForm.tsx  ← CREAR (~180 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/MailServiceSettingsForm.tsx

import {
  Stack,
  Switch,
  TextInput,
  NumberInput,
  Checkbox,
  Group,
  Text,
  Divider,
  Alert,
  SimpleGrid,
} from '@mantine/core';
import {
  IconMail,
  IconServer,
  IconLock,
  IconTemplate,
  IconInfoCircle,
} from '@tabler/icons-react';
import { memo, useCallback } from 'react';
import { useProjectStore } from '@/store';
import type { MailConfig } from '@/types/config/featurepack';

export const MailServiceSettingsForm = memo(function MailServiceSettingsForm() {
  const mailConfig = useProjectStore((s) => s.mailConfig);
  const updateMailConfig = useProjectStore((s) => s.updateMailConfig);
  const targetConfig = useProjectStore((s) => s.targetConfig);

  const isSupported = targetConfig
    ? !['rust'].includes(targetConfig.language)
    : true;

  const handleChange = useCallback(
    <K extends keyof MailConfig>(key: K, value: MailConfig[K]) => {
      updateMailConfig({ [key]: value });
    },
    [updateMailConfig]
  );

  if (!isSupported) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} title="Not Available" color="yellow">
        Mail Service is not available for {targetConfig?.language}.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* Master toggle */}
      <Group justify="space-between">
        <div>
          <Text fw={500}>Enable Mail Service</Text>
          <Text size="sm" c="dimmed">
            Configure SMTP for sending emails
          </Text>
        </div>
        <Switch
          checked={mailConfig.enabled}
          onChange={(e) => handleChange('enabled', e.currentTarget.checked)}
          size="md"
        />
      </Group>

      {mailConfig.enabled && (
        <>
          <Divider label="SMTP Settings" labelPosition="left" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="SMTP Host"
              description="Mail server hostname"
              placeholder="smtp.gmail.com"
              value={mailConfig.host}
              onChange={(e) => handleChange('host', e.currentTarget.value)}
              leftSection={<IconServer size={16} />}
            />

            <Group grow>
              <NumberInput
                label="Port"
                description="SMTP port"
                placeholder="587"
                value={mailConfig.port}
                onChange={(val) => handleChange('port', Number(val) || 587)}
                min={1}
                max={65535}
              />

              <Stack gap="xs" pt="xl">
                <Checkbox
                  label="STARTTLS"
                  description="Secure connection"
                  checked={mailConfig.starttls}
                  onChange={(e) => handleChange('starttls', e.currentTarget.checked)}
                />
              </Stack>
            </Group>
          </SimpleGrid>

          <TextInput
            label="Username"
            description="SMTP authentication username"
            placeholder="your-email@gmail.com"
            value={mailConfig.username}
            onChange={(e) => handleChange('username', e.currentTarget.value)}
            leftSection={<IconLock size={16} />}
          />

          <Alert color="blue" icon={<IconInfoCircle size={16} />}>
            Password will be configured via environment variable MAIL_PASSWORD
          </Alert>

          <Divider label="Sender Settings" labelPosition="left" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="From Address"
              description="Sender email address"
              placeholder="noreply@example.com"
              value={mailConfig.fromAddress}
              onChange={(e) => handleChange('fromAddress', e.currentTarget.value)}
              leftSection={<IconMail size={16} />}
              error={
                mailConfig.fromAddress &&
                !mailConfig.fromAddress.includes('@') &&
                'Invalid email format'
              }
            />

            <TextInput
              label="From Name"
              description="Sender display name"
              placeholder="My Application"
              value={mailConfig.fromName}
              onChange={(e) => handleChange('fromName', e.currentTarget.value)}
            />
          </SimpleGrid>

          <Divider label="Email Templates" labelPosition="left" />

          <Text size="sm" c="dimmed">
            Select which email templates to generate:
          </Text>

          <Stack gap="xs">
            <Checkbox
              label="Welcome Email"
              description="Sent when a new user registers"
              checked={mailConfig.generateWelcomeTemplate}
              onChange={(e) =>
                handleChange('generateWelcomeTemplate', e.currentTarget.checked)
              }
            />

            <Checkbox
              label="Password Reset Email"
              description="Sent when user requests password reset"
              checked={mailConfig.generatePasswordResetTemplate}
              onChange={(e) =>
                handleChange('generatePasswordResetTemplate', e.currentTarget.checked)
              }
            />

            <Checkbox
              label="Notification Email"
              description="Generic notification template"
              checked={mailConfig.generateNotificationTemplate}
              onChange={(e) =>
                handleChange('generateNotificationTemplate', e.currentTarget.checked)
              }
            />
          </Stack>
        </>
      )}
    </Stack>
  );
});
```

---

## Criterios de Completado

- [ ] Toggle habilita/deshabilita formulario
- [ ] Campos SMTP funcionan
- [ ] Validacion de email
- [ ] Templates seleccionables
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

Fase 0 → [[T-022]] → [[T-023]] | [[Phases/02-FEATURE-PACK]]
