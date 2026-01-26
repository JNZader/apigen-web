# T-054: Integrar Wizard en App

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.1 Wizard

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-054 |
| **Tipo** | Integration |
| **Estimado** | 1h |
| **Dependencias** | [[T-053]] |
| **Branch** | `feat/project-wizard` |
| **Estado** | Pending |

---

## Objetivo

Integrar el wizard en la aplicacion, mostrarlo al inicio o desde boton.

---

## Archivos a Modificar

```
src/pages/
└── DesignerPage.tsx  ← MODIFICAR (agregar wizard)

src/components/canvas/
└── CanvasToolbar.tsx ← MODIFICAR (agregar boton)
```

---

## Codigo de Referencia

```typescript
// En DesignerPage.tsx

import { useState, useEffect } from 'react';
import { ProjectWizard } from '@/components/ProjectWizard';
import { useProjectStore } from '@/store';

// Dentro del componente:
const [wizardOpened, setWizardOpened] = useState(false);
const projectName = useProjectStore((s) => s.projectConfig.name);
const entities = useProjectStore((s) => s.entities);

// Mostrar wizard automaticamente si es proyecto nuevo
useEffect(() => {
  const isNewProject = !projectName && entities.length === 0;
  const hasSeenWizard = sessionStorage.getItem('wizard-dismissed');

  if (isNewProject && !hasSeenWizard) {
    setWizardOpened(true);
  }
}, []);

const handleWizardComplete = () => {
  sessionStorage.setItem('wizard-dismissed', 'true');
};

const handleWizardClose = () => {
  sessionStorage.setItem('wizard-dismissed', 'true');
  setWizardOpened(false);
};

// En el JSX:
<ProjectWizard
  opened={wizardOpened}
  onClose={handleWizardClose}
  onComplete={handleWizardComplete}
/>
```

```typescript
// En CanvasToolbar.tsx - agregar boton "New Project"

<Menu position="bottom-start" shadow="md">
  <Menu.Target>
    <ActionIcon variant="default" size="lg">
      <IconPlus size={18} />
    </ActionIcon>
  </Menu.Target>
  <Menu.Dropdown>
    <Menu.Item
      leftSection={<IconWand size={16} />}
      onClick={() => setWizardOpened(true)}
    >
      New Project Wizard
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item
      leftSection={<IconDatabase size={16} />}
      onClick={() => setEntityFormOpened(true)}
    >
      Add Entity
    </Menu.Item>
    {/* ... otros items ... */}
  </Menu.Dropdown>
</Menu>
```

---

## Logica de Persistencia

```typescript
// Guardar que el usuario ya vio el wizard
const WIZARD_STORAGE_KEY = 'apigen-wizard-seen';

// En localStorage para persistir entre sesiones
const markWizardSeen = () => {
  localStorage.setItem(WIZARD_STORAGE_KEY, 'true');
};

const hasSeenWizard = () => {
  return localStorage.getItem(WIZARD_STORAGE_KEY) === 'true';
};

// Reset cuando se crea nuevo proyecto desde menu
const resetWizardState = () => {
  localStorage.removeItem(WIZARD_STORAGE_KEY);
};
```

---

## Criterios de Completado

- [ ] Wizard se abre automaticamente en proyecto nuevo
- [ ] Wizard no se abre si ya fue visto
- [ ] Boton "New Project Wizard" en toolbar
- [ ] Wizard aplica configuracion al completar
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

#task #fase-5 #integration #pending

[[T-053]] → [[T-054]] → [[T-055]] | [[Phases/05-UX-IMPROVEMENTS]]
