# T-053: Crear Wizard Steps Components

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.1 Wizard

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-053 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | [[T-052]] |
| **Branch** | `feat/project-wizard` |
| **Estado** | Pending |

---

## Objetivo

Crear los componentes de cada paso del wizard.

---

## Archivos a Crear

```
src/components/ProjectWizard/steps/
├── LanguageStep.tsx   ← CREAR (~80 lineas)
├── FeaturesStep.tsx   ← CREAR (~120 lineas)
└── SummaryStep.tsx    ← CREAR (~100 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectWizard/steps/LanguageStep.tsx

import { Stack, Text, SimpleGrid, Paper, Group, ThemeIcon, Radio } from '@mantine/core';
import { memo } from 'react';
import { LANGUAGE_CONFIGS } from '@/config/languageConfigs';

interface LanguageStepProps {
  data: { language: string; framework: string };
  errors: Record<string, string>;
  onChange: (updates: Partial<LanguageStepProps['data']>) => void;
}

export const LanguageStep = memo(function LanguageStep({
  data,
  errors,
  onChange,
}: LanguageStepProps) {
  const selectedLanguage = LANGUAGE_CONFIGS.find((l) => l.id === data.language);
  const frameworks = selectedLanguage?.frameworks || [];

  return (
    <Stack gap="md">
      <div>
        <Text fw={500} mb="xs">
          Select Programming Language
        </Text>
        <Radio.Group
          value={data.language}
          onChange={(value) => {
            const lang = LANGUAGE_CONFIGS.find((l) => l.id === value);
            onChange({
              language: value,
              framework: lang?.frameworks[0]?.id || '',
            });
          }}
        >
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
            {LANGUAGE_CONFIGS.map((lang) => (
              <Paper
                key={lang.id}
                withBorder
                p="sm"
                radius="md"
                style={{
                  cursor: 'pointer',
                  borderColor:
                    data.language === lang.id
                      ? `var(--mantine-color-${lang.color}-5)`
                      : undefined,
                }}
                onClick={() => onChange({ language: lang.id, framework: lang.frameworks[0]?.id })}
              >
                <Radio value={lang.id} label="" style={{ display: 'none' }} />
                <Group gap="xs">
                  <ThemeIcon color={lang.color} size="md" variant="light">
                    {lang.icon}
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    {lang.name}
                  </Text>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Radio.Group>
        {errors.language && (
          <Text c="red" size="sm" mt="xs">
            {errors.language}
          </Text>
        )}
      </div>

      {frameworks.length > 1 && (
        <div>
          <Text fw={500} mb="xs">
            Select Framework
          </Text>
          <Radio.Group
            value={data.framework}
            onChange={(value) => onChange({ framework: value })}
          >
            <Stack gap="xs">
              {frameworks.map((fw) => (
                <Radio
                  key={fw.id}
                  value={fw.id}
                  label={
                    <div>
                      <Text size="sm" fw={500}>
                        {fw.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {fw.description}
                      </Text>
                    </div>
                  }
                />
              ))}
            </Stack>
          </Radio.Group>
        </div>
      )}
    </Stack>
  );
});
```

```typescript
// src/components/ProjectWizard/steps/FeaturesStep.tsx

import {
  Stack,
  Text,
  Checkbox,
  Paper,
  Group,
  Badge,
  SimpleGrid,
  Alert,
} from '@mantine/core';
import {
  IconBrandGoogle,
  IconMail,
  IconUpload,
  IconKey,
  IconTemplate,
  IconInfoCircle,
} from '@tabler/icons-react';
import { memo } from 'react';
import { getFeatureCompatibility } from '@/config/featureCompatibility';

interface FeaturesStepProps {
  data: { language: string; features: string[] };
  onChange: (updates: Partial<FeaturesStepProps['data']>) => void;
}

const AVAILABLE_FEATURES = [
  {
    id: 'socialLogin',
    name: 'Social Login',
    description: 'OAuth2 with Google, GitHub, etc.',
    icon: <IconBrandGoogle size={20} />,
  },
  {
    id: 'mailService',
    name: 'Mail Service',
    description: 'SMTP email support',
    icon: <IconMail size={20} />,
  },
  {
    id: 'fileUpload',
    name: 'File Upload',
    description: 'Local, S3, or Azure storage',
    icon: <IconUpload size={20} />,
  },
  {
    id: 'passwordReset',
    name: 'Password Reset',
    description: 'Email-based password recovery',
    icon: <IconKey size={20} />,
  },
  {
    id: 'jteTemplates',
    name: 'JTE Templates',
    description: 'Server-side rendering',
    icon: <IconTemplate size={20} />,
    javaOnly: true,
  },
];

export const FeaturesStep = memo(function FeaturesStep({
  data,
  onChange,
}: FeaturesStepProps) {
  const compatibility = getFeatureCompatibility(data.language);

  const toggleFeature = (featureId: string) => {
    const current = data.features;
    const updated = current.includes(featureId)
      ? current.filter((f) => f !== featureId)
      : [...current, featureId];
    onChange({ features: updated });
  };

  return (
    <Stack gap="md">
      <div>
        <Text fw={500}>Select Initial Features</Text>
        <Text size="sm" c="dimmed">
          You can always enable more features later in Project Settings
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {AVAILABLE_FEATURES.map((feature) => {
          const isSupported = compatibility[feature.id] !== false;
          const isSelected = data.features.includes(feature.id);

          return (
            <Paper
              key={feature.id}
              withBorder
              p="sm"
              radius="md"
              style={{
                cursor: isSupported ? 'pointer' : 'not-allowed',
                opacity: isSupported ? 1 : 0.5,
                borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
              }}
              onClick={() => isSupported && toggleFeature(feature.id)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={!isSupported}
                  />
                  <div>
                    <Group gap="xs">
                      {feature.icon}
                      <Text size="sm" fw={500}>
                        {feature.name}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {feature.description}
                    </Text>
                  </div>
                </Group>
                {!isSupported && (
                  <Badge size="xs" color="gray">
                    N/A
                  </Badge>
                )}
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        <Text size="sm">
          Features can be configured in detail after project creation.
          Select the ones you plan to use.
        </Text>
      </Alert>
    </Stack>
  );
});
```

```typescript
// src/components/ProjectWizard/steps/SummaryStep.tsx

import {
  Stack,
  Paper,
  Text,
  Group,
  Badge,
  List,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import { IconCheck, IconCode, IconPackage, IconSettings } from '@tabler/icons-react';
import { memo } from 'react';
import { LANGUAGE_CONFIGS } from '@/config/languageConfigs';

interface SummaryStepProps {
  data: {
    projectName: string;
    description: string;
    packageName: string;
    language: string;
    framework: string;
    features: string[];
  };
}

export const SummaryStep = memo(function SummaryStep({ data }: SummaryStepProps) {
  const languageConfig = LANGUAGE_CONFIGS.find((l) => l.id === data.language);
  const frameworkConfig = languageConfig?.frameworks.find((f) => f.id === data.framework);

  return (
    <Stack gap="md">
      <Text fw={500} size="lg">
        Review Your Project
      </Text>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <IconPackage size={20} />
              <Text fw={500}>Project Info</Text>
            </Group>
          </Group>
          <Divider />
          <div>
            <Text size="sm" c="dimmed">
              Name
            </Text>
            <Text fw={500}>{data.projectName}</Text>
          </div>
          {data.description && (
            <div>
              <Text size="sm" c="dimmed">
                Description
              </Text>
              <Text size="sm">{data.description}</Text>
            </div>
          )}
          <div>
            <Text size="sm" c="dimmed">
              Package
            </Text>
            <Text size="sm" style={{ fontFamily: 'monospace' }}>
              {data.packageName}
            </Text>
          </div>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group gap="xs">
            <IconCode size={20} />
            <Text fw={500}>Technology Stack</Text>
          </Group>
          <Divider />
          <Group gap="xs">
            <Badge color={languageConfig?.color || 'gray'} size="lg">
              {languageConfig?.name || data.language}
            </Badge>
            <Badge variant="outline" size="lg">
              {frameworkConfig?.name || data.framework}
            </Badge>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group gap="xs">
            <IconSettings size={20} />
            <Text fw={500}>Selected Features</Text>
          </Group>
          <Divider />
          {data.features.length > 0 ? (
            <List
              spacing="xs"
              icon={
                <ThemeIcon color="green" size={20} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              {data.features.map((feature) => (
                <List.Item key={feature}>
                  <Text size="sm" tt="capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                </List.Item>
              ))}
            </List>
          ) : (
            <Text size="sm" c="dimmed">
              No additional features selected
            </Text>
          )}
        </Stack>
      </Paper>

      <Text size="sm" c="dimmed" ta="center">
        Click "Create Project" to generate your project with these settings.
        You can modify settings anytime from Project Settings.
      </Text>
    </Stack>
  );
});
```

---

## Criterios de Completado

- [ ] LanguageStep muestra todos los lenguajes
- [ ] LanguageStep muestra frameworks condicionales
- [ ] FeaturesStep respeta compatibilidad
- [ ] SummaryStep muestra resumen correcto
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

#task #fase-5 #feature #pending

[[T-052]] → [[T-053]] → [[T-054]] | [[Phases/05-UX-IMPROVEMENTS]]
