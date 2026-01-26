# T-023: Tests MailServiceSettingsForm

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.2 Mail Service

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-023 |
| **Tipo** | Test |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-022]] |
| **Branch** | `feat/feature-mail` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para el formulario de Mail Service.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── MailServiceSettingsForm.test.tsx  ← CREAR (~80 lineas)
```

---

## Codigo de Referencia

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { MailServiceSettingsForm } from './MailServiceSettingsForm';
import { useProjectStore } from '@/store';

vi.mock('@/store');

const mockUpdateConfig = vi.fn();

const defaultConfig = {
  enabled: false,
  host: 'smtp.gmail.com',
  port: 587,
  username: '',
  starttls: true,
  fromAddress: '',
  fromName: '',
  generateWelcomeTemplate: true,
  generatePasswordResetTemplate: true,
  generateNotificationTemplate: false,
};

describe('MailServiceSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        mailConfig: defaultConfig,
        updateMailConfig: mockUpdateConfig,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });
  });

  it('renders enable toggle', () => {
    render(<MailServiceSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });
    expect(screen.getByText('Enable Mail Service')).toBeInTheDocument();
  });

  it('shows SMTP fields when enabled', () => {
    (useProjectStore as any).mockImplementation((selector: any) => ({
      mailConfig: { ...defaultConfig, enabled: true },
      updateMailConfig: mockUpdateConfig,
      targetConfig: { language: 'java', framework: 'spring-boot' },
    }[Object.keys({ mailConfig: 1, updateMailConfig: 1, targetConfig: 1 }).find(k => selector({ [k]: 1 })[k] !== undefined) || 'mailConfig']));

    render(<MailServiceSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByLabelText(/SMTP Host/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Port/)).toBeInTheDocument();
  });

  it('shows unavailable for Rust', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        mailConfig: defaultConfig,
        updateMailConfig: mockUpdateConfig,
        targetConfig: { language: 'rust', framework: 'axum' },
      };
      return selector(state);
    });

    render(<MailServiceSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText(/Not Available/)).toBeInTheDocument();
  });

  it('validates email format', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        mailConfig: { ...defaultConfig, enabled: true, fromAddress: 'invalid' },
        updateMailConfig: mockUpdateConfig,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<MailServiceSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText(/Invalid email/)).toBeInTheDocument();
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

[[T-022]] → [[T-023]] | [[Phases/02-FEATURE-PACK]]
