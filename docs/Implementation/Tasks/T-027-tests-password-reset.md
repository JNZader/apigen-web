# T-027: Tests PasswordResetSettingsForm

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.4 Password Reset

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-027 |
| **Tipo** | Test |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-026]] |
| **Branch** | `feat/feature-password` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para PasswordResetSettingsForm.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── PasswordResetSettingsForm.test.tsx  ← CREAR (~60 lineas)
```

---

## Codigo de Referencia

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { PasswordResetSettingsForm } from './PasswordResetSettingsForm';
import { useProjectStore } from '@/store';

vi.mock('@/store');

describe('PasswordResetSettingsForm', () => {
  const mockUpdateFeature = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders enable toggle', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        features: { passwordReset: false },
        mailConfig: { enabled: false },
        updateFeature: mockUpdateFeature,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<PasswordResetSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText('Enable Password Reset')).toBeInTheDocument();
  });

  it('shows warning when mail is not enabled', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        features: { passwordReset: true },
        mailConfig: { enabled: false },
        updateFeature: mockUpdateFeature,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<PasswordResetSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText(/Mail Service Required/)).toBeInTheDocument();
  });

  it('shows what gets generated when enabled', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        features: { passwordReset: true },
        mailConfig: { enabled: true },
        updateFeature: mockUpdateFeature,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<PasswordResetSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText('PasswordResetToken')).toBeInTheDocument();
    expect(screen.getByText('PasswordResetService')).toBeInTheDocument();
    expect(screen.getByText('PasswordResetController')).toBeInTheDocument();
  });

  it('shows unavailable for Rust', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        features: { passwordReset: false },
        mailConfig: { enabled: false },
        updateFeature: mockUpdateFeature,
        targetConfig: { language: 'rust', framework: 'axum' },
      };
      return selector(state);
    });

    render(<PasswordResetSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText(/Not Available/)).toBeInTheDocument();
  });
});
```

---

## Criterios de Completado

- [ ] Tests pasan
- [ ] Cobertura >80%

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

[[T-026]] → [[T-027]] | [[Phases/02-FEATURE-PACK]]
