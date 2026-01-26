# T-021: Tests SocialLoginSettingsForm

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.1 Social Login

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-021 |
| **Tipo** | Test |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-020]] |
| **Branch** | `feat/feature-social` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para el formulario de configuracion de Social Login.

---

## Tareas

- [ ] Tests de renderizado
- [ ] Tests de toggle enable/disable
- [ ] Tests de seleccion de providers
- [ ] Tests de validacion de URLs
- [ ] Tests de warnings

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── SocialLoginSettingsForm.test.tsx  ← CREAR (~80 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/SocialLoginSettingsForm.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { SocialLoginSettingsForm } from './SocialLoginSettingsForm';
import { useProjectStore } from '@/store';

vi.mock('@/store', () => ({
  useProjectStore: vi.fn(),
}));

const mockUpdateConfig = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const defaultConfig = {
  enabled: false,
  google: false,
  github: false,
  linkedin: false,
  successRedirectUrl: '/dashboard',
  failureRedirectUrl: '/login?error=true',
  autoCreateUser: true,
  linkByEmail: true,
};

describe('SocialLoginSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        socialLoginConfig: defaultConfig,
        updateSocialLoginConfig: mockUpdateConfig,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });
  });

  it('renders enable toggle', () => {
    render(<SocialLoginSettingsForm />, { wrapper });
    expect(screen.getByText('Enable Social Login')).toBeInTheDocument();
  });

  it('shows provider options when enabled', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        socialLoginConfig: { ...defaultConfig, enabled: true },
        updateSocialLoginConfig: mockUpdateConfig,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<SocialLoginSettingsForm />, { wrapper });

    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('hides options when disabled', () => {
    render(<SocialLoginSettingsForm />, { wrapper });

    expect(screen.queryByText('Google')).not.toBeInTheDocument();
  });

  it('shows warning when no providers selected', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        socialLoginConfig: { ...defaultConfig, enabled: true },
        updateSocialLoginConfig: mockUpdateConfig,
        targetConfig: { language: 'java', framework: 'spring-boot' },
      };
      return selector(state);
    });

    render(<SocialLoginSettingsForm />, { wrapper });

    expect(screen.getByText(/Select at least one provider/)).toBeInTheDocument();
  });

  it('shows unavailable message for unsupported language', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        socialLoginConfig: defaultConfig,
        updateSocialLoginConfig: mockUpdateConfig,
        targetConfig: { language: 'rust', framework: 'axum' },
      };
      return selector(state);
    });

    render(<SocialLoginSettingsForm />, { wrapper });

    expect(screen.getByText(/Not Available/)).toBeInTheDocument();
  });

  it('calls updateConfig when toggling enabled', () => {
    render(<SocialLoginSettingsForm />, { wrapper });

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    expect(mockUpdateConfig).toHaveBeenCalledWith({ enabled: true });
  });
});
```

---

## Criterios de Completado

- [ ] Tests de renderizado pasan
- [ ] Tests de interaccion pasan
- [ ] Tests de estados edge
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

[[T-020]] → [[T-021]] | [[Phases/02-FEATURE-PACK]]
