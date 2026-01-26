# T-028: Crear JteTemplatesSettingsForm.tsx

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.5 JTE Templates

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-028 |
| **Tipo** | Feature |
| **Estimado** | 1.5h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/feature-jte` |
| **Estado** | Pending |
| **Paralelo** | SI - con T-020, T-022, T-024, T-026 |

---

## Objetivo

Crear formulario para habilitar templates JTE (Java Template Engine) para vistas server-side.

---

## Tareas

- [ ] Crear `JteTemplatesSettingsForm.tsx`
- [ ] Toggle para habilitar
- [ ] Lista de templates disponibles
- [ ] Solo disponible para Java/Kotlin

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── JteTemplatesSettingsForm.tsx  ← CREAR (~100 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/JteTemplatesSettingsForm.tsx

import {
  Stack,
  Switch,
  Group,
  Text,
  Alert,
  Checkbox,
  Paper,
  List,
  ThemeIcon,
} from '@mantine/core';
import {
  IconTemplate,
  IconInfoCircle,
  IconCheck,
} from '@tabler/icons-react';
import { memo } from 'react';
import { useProjectStore } from '@/store';

const AVAILABLE_TEMPLATES = [
  { id: 'login', name: 'Login Page', description: 'User authentication form' },
  { id: 'register', name: 'Registration Page', description: 'New user signup form' },
  { id: 'dashboard', name: 'Dashboard', description: 'Admin dashboard layout' },
  { id: 'error', name: 'Error Pages', description: '404, 500 error templates' },
  { id: 'email', name: 'Email Templates', description: 'Transactional email layouts' },
] as const;

export const JteTemplatesSettingsForm = memo(function JteTemplatesSettingsForm() {
  const jteConfig = useProjectStore((s) => s.jteConfig);
  const updateJteConfig = useProjectStore((s) => s.updateJteConfig);
  const targetConfig = useProjectStore((s) => s.targetConfig);

  const isSupported = targetConfig
    ? ['java', 'kotlin'].includes(targetConfig.language)
    : true;

  if (!isSupported) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} title="Not Available" color="yellow">
        JTE Templates are only available for Java and Kotlin projects.
        <br />
        Current language: {targetConfig?.language}
      </Alert>
    );
  }

  const handleTemplateToggle = (templateId: string, checked: boolean) => {
    const currentTemplates = jteConfig.selectedTemplates || [];
    const newTemplates = checked
      ? [...currentTemplates, templateId]
      : currentTemplates.filter((t) => t !== templateId);
    updateJteConfig({ selectedTemplates: newTemplates });
  };

  return (
    <Stack gap="md">
      {/* Master toggle */}
      <Group justify="space-between">
        <div>
          <Group gap="xs">
            <IconTemplate size={20} />
            <Text fw={500}>Enable JTE Templates</Text>
          </Group>
          <Text size="sm" c="dimmed">
            Generate server-side rendered views using Java Template Engine
          </Text>
        </div>
        <Switch
          checked={jteConfig.enabled}
          onChange={(e) => updateJteConfig({ enabled: e.currentTarget.checked })}
          size="md"
        />
      </Group>

      {/* Template selection */}
      {jteConfig.enabled && (
        <>
          <Paper withBorder p="md" radius="md">
            <Text fw={500} mb="sm">
              Select Templates to Generate:
            </Text>
            <Stack gap="xs">
              {AVAILABLE_TEMPLATES.map((template) => (
                <Checkbox
                  key={template.id}
                  label={
                    <div>
                      <Text size="sm" fw={500}>
                        {template.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {template.description}
                      </Text>
                    </div>
                  }
                  checked={jteConfig.selectedTemplates?.includes(template.id) ?? false}
                  onChange={(e) =>
                    handleTemplateToggle(template.id, e.currentTarget.checked)
                  }
                />
              ))}
            </Stack>
          </Paper>

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
                <Text fw={500}>JTE Configuration</Text>
                <Text size="xs" c="dimmed">
                  Template engine setup in application.properties
                </Text>
              </List.Item>
              <List.Item>
                <Text fw={500}>Base Layout</Text>
                <Text size="xs" c="dimmed">
                  Reusable layout template with header/footer
                </Text>
              </List.Item>
              <List.Item>
                <Text fw={500}>Selected Templates</Text>
                <Text size="xs" c="dimmed">
                  {jteConfig.selectedTemplates?.length || 0} template(s) selected
                </Text>
              </List.Item>
            </List>
          </Paper>
        </>
      )}
    </Stack>
  );
});
```

---

## Criterios de Completado

- [ ] Toggle habilita/deshabilita feature
- [ ] Solo disponible para Java/Kotlin
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

Fase 0 → [[T-028]] → [[T-029]] | [[Phases/02-FEATURE-PACK]]
