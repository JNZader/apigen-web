# T-052: Crear ProjectWizard Component

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.1 Wizard

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-052 |
| **Tipo** | Feature |
| **Estimado** | 4h |
| **Dependencias** | Fase 1 completada |
| **Branch** | `feat/project-wizard` |
| **Estado** | Pending |

---

## Objetivo

Crear wizard paso a paso para configuracion inicial del proyecto, mejorando la experiencia de nuevos usuarios.

---

## Tareas

- [ ] Crear `ProjectWizard.tsx`
- [ ] Step 1: Nombre y descripcion
- [ ] Step 2: Seleccion de lenguaje/framework
- [ ] Step 3: Features iniciales
- [ ] Step 4: Resumen y confirmacion
- [ ] Navegacion entre pasos
- [ ] Validacion por paso

---

## Archivos a Crear

```
src/components/
└── ProjectWizard/
    ├── ProjectWizard.tsx        ← CREAR (~200 lineas)
    ├── WizardStep.tsx           ← CREAR (~50 lineas)
    ├── steps/
    │   ├── BasicInfoStep.tsx    ← CREAR (~80 lineas)
    │   ├── LanguageStep.tsx     ← CREAR (~60 lineas)
    │   ├── FeaturesStep.tsx     ← CREAR (~100 lineas)
    │   └── SummaryStep.tsx      ← CREAR (~80 lineas)
    └── index.ts                 ← CREAR
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectWizard/ProjectWizard.tsx

import {
  Modal,
  Stepper,
  Button,
  Group,
  Stack,
  Text,
  Progress,
} from '@mantine/core';
import {
  IconFileDescription,
  IconCode,
  IconSettings,
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
} from '@tabler/icons-react';
import { memo, useState, useCallback } from 'react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { LanguageStep } from './steps/LanguageStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { SummaryStep } from './steps/SummaryStep';
import { useProjectStore } from '@/store';

interface ProjectWizardProps {
  opened: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface WizardData {
  projectName: string;
  description: string;
  packageName: string;
  language: string;
  framework: string;
  features: string[];
}

const STEPS = [
  { label: 'Basic Info', icon: IconFileDescription },
  { label: 'Language', icon: IconCode },
  { label: 'Features', icon: IconSettings },
  { label: 'Summary', icon: IconCheck },
];

export const ProjectWizard = memo(function ProjectWizard({
  opened,
  onClose,
  onComplete,
}: ProjectWizardProps) {
  const [active, setActive] = useState(0);
  const [data, setData] = useState<WizardData>({
    projectName: '',
    description: '',
    packageName: 'com.example',
    language: 'java',
    framework: 'spring-boot',
    features: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateProjectConfig = useProjectStore((s) => s.updateProjectConfig);
  const setTargetConfig = useProjectStore((s) => s.setTargetConfig);
  const updateFeature = useProjectStore((s) => s.updateFeature);

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    // Clear related errors
    const keys = Object.keys(updates);
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!data.projectName.trim()) {
        newErrors.projectName = 'Project name is required';
      } else if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(data.projectName)) {
        newErrors.projectName = 'Invalid project name format';
      }

      if (!data.packageName.trim()) {
        newErrors.packageName = 'Package name is required';
      }
    }

    if (step === 1) {
      if (!data.language) {
        newErrors.language = 'Please select a language';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  const nextStep = useCallback(() => {
    if (validateStep(active)) {
      setActive((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [active, validateStep]);

  const prevStep = useCallback(() => {
    setActive((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleComplete = useCallback(() => {
    // Apply configuration to store
    updateProjectConfig({
      name: data.projectName,
      description: data.description,
      packageName: data.packageName,
    });

    setTargetConfig({
      language: data.language as any,
      framework: data.framework as any,
    });

    data.features.forEach((feature) => {
      updateFeature(feature as any, true);
    });

    onComplete();
    onClose();
  }, [data, updateProjectConfig, setTargetConfig, updateFeature, onComplete, onClose]);

  const handleClose = useCallback(() => {
    setActive(0);
    setData({
      projectName: '',
      description: '',
      packageName: 'com.example',
      language: 'java',
      framework: 'spring-boot',
      features: [],
    });
    setErrors({});
    onClose();
  }, [onClose]);

  const progress = ((active + 1) / STEPS.length) * 100;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Project"
      size="lg"
      closeOnClickOutside={false}
    >
      <Stack gap="lg">
        <Progress value={progress} size="sm" />

        <Stepper active={active} size="sm">
          {STEPS.map((step, index) => (
            <Stepper.Step
              key={step.label}
              label={step.label}
              icon={<step.icon size={18} />}
            />
          ))}
        </Stepper>

        <div style={{ minHeight: 300 }}>
          {active === 0 && (
            <BasicInfoStep
              data={data}
              errors={errors}
              onChange={updateData}
            />
          )}
          {active === 1 && (
            <LanguageStep
              data={data}
              errors={errors}
              onChange={updateData}
            />
          )}
          {active === 2 && (
            <FeaturesStep
              data={data}
              onChange={updateData}
            />
          )}
          {active === 3 && (
            <SummaryStep data={data} />
          )}
        </div>

        <Group justify="space-between">
          <Button
            variant="default"
            onClick={prevStep}
            disabled={active === 0}
            leftSection={<IconArrowLeft size={16} />}
          >
            Back
          </Button>

          {active < STEPS.length - 1 ? (
            <Button
              onClick={nextStep}
              rightSection={<IconArrowRight size={16} />}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              color="green"
              leftSection={<IconCheck size={16} />}
            >
              Create Project
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
});
```

```typescript
// src/components/ProjectWizard/steps/BasicInfoStep.tsx

import { Stack, TextInput, Textarea } from '@mantine/core';
import { memo } from 'react';

interface BasicInfoStepProps {
  data: { projectName: string; description: string; packageName: string };
  errors: Record<string, string>;
  onChange: (updates: Partial<BasicInfoStepProps['data']>) => void;
}

export const BasicInfoStep = memo(function BasicInfoStep({
  data,
  errors,
  onChange,
}: BasicInfoStepProps) {
  return (
    <Stack gap="md">
      <TextInput
        label="Project Name"
        description="A unique name for your project"
        placeholder="my-awesome-api"
        value={data.projectName}
        onChange={(e) => onChange({ projectName: e.currentTarget.value })}
        error={errors.projectName}
        required
      />

      <Textarea
        label="Description"
        description="Brief description of your project (optional)"
        placeholder="A REST API for..."
        value={data.description}
        onChange={(e) => onChange({ description: e.currentTarget.value })}
        minRows={3}
      />

      <TextInput
        label="Package Name"
        description="Base package for generated code"
        placeholder="com.example.api"
        value={data.packageName}
        onChange={(e) => onChange({ packageName: e.currentTarget.value })}
        error={errors.packageName}
        required
      />
    </Stack>
  );
});
```

---

## Criterios de Completado

- [ ] Wizard modal funciona
- [ ] 4 pasos navegables
- [ ] Validacion por paso
- [ ] Datos se aplican al store
- [ ] Progress indicator funciona
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

Fase 1 → [[T-052]] → [[T-053]] | [[Phases/05-UX-IMPROVEMENTS]]
