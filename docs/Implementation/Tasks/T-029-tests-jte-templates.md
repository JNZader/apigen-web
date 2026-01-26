# T-029: Tests JteTemplatesSettingsForm

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.5 JTE Templates

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-029 |
| **Tipo** | Test |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-028]] |
| **Branch** | `feat/feature-jte` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para JteTemplatesSettingsForm.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── JteTemplatesSettingsForm.test.tsx  ← CREAR (~70 lineas)
```

---

## Codigo de Referencia

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { JteTemplatesSettingsForm } from './JteTemplatesSettingsForm';
import { useProjectStore } from '@/store';

vi.mock('@/store');

describe('JteTemplatesSettingsForm', () => {
  const mockUpdateJteConfig = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders enable toggle for Java', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        jteConfig: { enabled: false, selectedTemplates: [] },
        updateJteConfig: mockUpdateJteConfig,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<JteTemplatesSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText('Enable JTE Templates')).toBeInTheDocument();
  });

  it('shows template selection when enabled', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        jteConfig: { enabled: true, selectedTemplates: [] },
        updateJteConfig: mockUpdateJteConfig,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<JteTemplatesSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows unavailable for non-Java/Kotlin', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        jteConfig: { enabled: false, selectedTemplates: [] },
        updateJteConfig: mockUpdateJteConfig,
        targetConfig: { language: 'python', framework: 'fastapi' },
      };
      return selector(state);
    });

    render(<JteTemplatesSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText(/Not Available/)).toBeInTheDocument();
  });

  it('works for Kotlin', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        jteConfig: { enabled: false, selectedTemplates: [] },
        updateJteConfig: mockUpdateJteConfig,
        targetConfig: { language: 'kotlin', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<JteTemplatesSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText('Enable JTE Templates')).toBeInTheDocument();
  });
});
```

---

## Criterios de Completado

- [ ] Tests pasan
- [ ] Cobertura >80%
- [ ] `npm run test:run` pasa

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

#task #fase-2 #test #pending

[[T-028]] → [[T-029]] | [[Phases/02-FEATURE-PACK]]
