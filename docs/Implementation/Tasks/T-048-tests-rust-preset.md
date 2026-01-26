# T-048: Tests RustPresetSelector

> Fase: [[Phases/04-RUST-EDGE]] | Iteracion: 4.3 Tests

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-048 |
| **Tipo** | Test |
| **Estimado** | 1h |
| **Dependencias** | [[T-044]] |
| **Branch** | `feat/rust-support` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para RustPresetSelector.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── RustPresetSelector.test.tsx  ← CREAR (~80 lineas)
```

---

## Codigo de Referencia

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { RustPresetSelector } from './RustPresetSelector';
import { useProjectStore } from '@/store';

vi.mock('@/store');

describe('RustPresetSelector', () => {
  const mockUpdateRustOptions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        rustOptions: {
          preset: 'standard',
          database: 'sqlx-postgres',
        },
        updateRustOptions: mockUpdateRustOptions,
      };
      return selector(state);
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
  );

  it('renders all presets', () => {
    render(<RustPresetSelector />, { wrapper });

    expect(screen.getByText('Minimal')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('shows selected badge for current preset', () => {
    render(<RustPresetSelector />, { wrapper });

    const standardCard = screen.getByText('Standard').closest('div');
    expect(standardCard).toContainElement(screen.getByText('Selected'));
  });

  it('calls updateRustOptions when preset is clicked', async () => {
    const user = userEvent.setup();
    render(<RustPresetSelector />, { wrapper });

    await user.click(screen.getByText('Performance'));

    expect(mockUpdateRustOptions).toHaveBeenCalledWith({ preset: 'performance' });
  });

  it('displays features for each preset', () => {
    render(<RustPresetSelector />, { wrapper });

    // Standard preset should show validation as included
    expect(screen.getAllByText('Validation').length).toBeGreaterThan(0);
    // Should show use cases
    expect(screen.getByText('Prototyping')).toBeInTheDocument();
    expect(screen.getByText('Production APIs')).toBeInTheDocument();
  });

  it('shows descriptions for presets', () => {
    render(<RustPresetSelector />, { wrapper });

    expect(screen.getByText(/Bare-bones API/)).toBeInTheDocument();
    expect(screen.getByText(/Balanced setup/)).toBeInTheDocument();
    expect(screen.getByText(/Complete setup/)).toBeInTheDocument();
    expect(screen.getByText(/maximum throughput/)).toBeInTheDocument();
  });

  it('updates selected preset styling', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        rustOptions: { preset: 'minimal' },
        updateRustOptions: mockUpdateRustOptions,
      };
      return selector(state);
    });

    render(<RustPresetSelector />, { wrapper });

    const minimalCard = screen.getByText('Minimal').closest('[class*="Paper"]');
    expect(minimalCard).toHaveStyle({ cursor: 'pointer' });
  });
});
```

---

## Criterios de Completado

- [ ] Tests cubren renderizado de presets
- [ ] Tests cubren seleccion
- [ ] Tests cubren indicadores visuales
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

#task #fase-4 #test #pending

[[T-044]] → [[T-048]] → [[T-049]] | [[Phases/04-RUST-EDGE]]
