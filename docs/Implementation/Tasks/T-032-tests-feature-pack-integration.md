# T-032: Tests de Integracion Feature Pack

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.6 Integracion

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-032 |
| **Tipo** | Test |
| **Estimado** | 1h |
| **Dependencias** | [[T-031]] |
| **Branch** | `feat/feature-pack-integration` |
| **Estado** | Pending |

---

## Objetivo

Crear tests de integracion para verificar que FeaturePackSection funciona correctamente.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── FeaturePackSection.test.tsx  ← CREAR (~100 lineas)
```

---

## Codigo de Referencia

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { FeaturePackSection } from './FeaturePackSection';
import { useProjectStore } from '@/store';

vi.mock('@/store');

// Mock lazy loaded components
vi.mock('./SocialLoginSettingsForm', () => ({
  SocialLoginSettingsForm: () => <div data-testid="social-form">Social Form</div>,
}));
vi.mock('./MailServiceSettingsForm', () => ({
  MailServiceSettingsForm: () => <div data-testid="mail-form">Mail Form</div>,
}));
vi.mock('./FileStorageSettingsForm', () => ({
  FileStorageSettingsForm: () => <div data-testid="storage-form">Storage Form</div>,
}));
vi.mock('./PasswordResetSettingsForm', () => ({
  PasswordResetSettingsForm: () => <div data-testid="password-form">Password Form</div>,
}));
vi.mock('./JteTemplatesSettingsForm', () => ({
  JteTemplatesSettingsForm: () => <div data-testid="jte-form">JTE Form</div>,
}));

describe('FeaturePackSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tabs for Java', async () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        features: {
          socialLogin: false,
          mailService: false,
          fileUpload: false,
          passwordReset: false,
          jteTemplates: false,
        },
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<FeaturePackSection />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText('Social Login')).toBeInTheDocument();
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByText('Password Reset')).toBeInTheDocument();
    expect(screen.getByText('JTE')).toBeInTheDocument();
  });

  it('hides JTE tab for non-Java languages', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        features: {
          socialLogin: false,
          mailService: false,
          fileUpload: false,
          passwordReset: false,
          jteTemplates: false,
        },
        targetConfig: { language: 'python', framework: 'fastapi' },
      };
      return selector(state);
    });

    render(<FeaturePackSection />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.queryByText('JTE')).not.toBeInTheDocument();
  });

  it('shows correct enabled count', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        features: {
          socialLogin: true,
          mailService: true,
          fileUpload: false,
          passwordReset: false,
          jteTemplates: false,
        },
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<FeaturePackSection />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText('2 enabled')).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    const user = userEvent.setup();

    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        features: {
          socialLogin: false,
          mailService: false,
          fileUpload: false,
          passwordReset: false,
          jteTemplates: false,
        },
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<FeaturePackSection />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    // Default tab is Social
    await waitFor(() => {
      expect(screen.getByTestId('social-form')).toBeInTheDocument();
    });

    // Switch to Mail tab
    await user.click(screen.getByText('Mail'));
    await waitFor(() => {
      expect(screen.getByTestId('mail-form')).toBeInTheDocument();
    });

    // Switch to Storage tab
    await user.click(screen.getByText('Storage'));
    await waitFor(() => {
      expect(screen.getByTestId('storage-form')).toBeInTheDocument();
    });
  });
});
```

---

## Criterios de Completado

- [ ] Tests pasan
- [ ] Cobertura de tabs >80%
- [ ] Tests de switching funcionan
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

[[T-031]] → [[T-032]] | [[Phases/02-FEATURE-PACK]]
