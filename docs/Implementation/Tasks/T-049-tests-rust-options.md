# T-049: Tests RustOptionsPanel

> Fase: [[Phases/04-RUST-EDGE]] | Iteracion: 4.3 Tests

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-049 |
| **Tipo** | Test |
| **Estimado** | 1h |
| **Dependencias** | [[T-045]] |
| **Branch** | `feat/rust-support` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para RustOptionsPanel.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── RustOptionsPanel.test.tsx  ← CREAR (~100 lineas)
```

---

## Codigo de Referencia

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { RustOptionsPanel } from './RustOptionsPanel';
import { useProjectStore } from '@/store';

vi.mock('@/store');

describe('RustOptionsPanel', () => {
  const mockUpdateRustOptions = vi.fn();

  const defaultOptions = {
    preset: 'standard',
    database: 'sqlx-postgres',
    poolSize: 10,
    queryLogging: false,
    cors: true,
    rateLimiting: false,
    rateLimit: 100,
    securityHeaders: true,
    compression: true,
    caching: false,
    cacheTtl: 300,
    tracing: true,
    metrics: false,
    healthCheck: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        rustOptions: defaultOptions,
        updateRustOptions: mockUpdateRustOptions,
      };
      return selector(state);
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
  );

  it('renders all accordion sections', () => {
    render(<RustOptionsPanel />, { wrapper });

    expect(screen.getByText('Database Configuration')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Observability')).toBeInTheDocument();
  });

  it('shows database options when expanded', async () => {
    const user = userEvent.setup();
    render(<RustOptionsPanel />, { wrapper });

    await user.click(screen.getByText('Database Configuration'));

    expect(screen.getByText('Database Driver')).toBeInTheDocument();
    expect(screen.getByText('Connection Pool Size')).toBeInTheDocument();
  });

  it('updates database option', async () => {
    const user = userEvent.setup();
    render(<RustOptionsPanel />, { wrapper });

    await user.click(screen.getByText('Database Configuration'));

    // Find and interact with select
    const databaseSelect = screen.getByRole('combobox');
    await user.click(databaseSelect);
    await user.click(screen.getByText('SeaORM'));

    expect(mockUpdateRustOptions).toHaveBeenCalledWith({ database: 'sea-orm' });
  });

  it('shows security options', async () => {
    const user = userEvent.setup();
    render(<RustOptionsPanel />, { wrapper });

    await user.click(screen.getByText('Security'));

    expect(screen.getByText('Enable CORS')).toBeInTheDocument();
    expect(screen.getByText('Enable Rate Limiting')).toBeInTheDocument();
  });

  it('shows rate limit input when rate limiting is enabled', async () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        rustOptions: { ...defaultOptions, rateLimiting: true },
        updateRustOptions: mockUpdateRustOptions,
      };
      return selector(state);
    });

    const user = userEvent.setup();
    render(<RustOptionsPanel />, { wrapper });

    await user.click(screen.getByText('Security'));

    expect(screen.getByText('Requests per minute')).toBeInTheDocument();
  });

  it('disables options for minimal preset', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        rustOptions: { ...defaultOptions, preset: 'minimal' },
        updateRustOptions: mockUpdateRustOptions,
      };
      return selector(state);
    });

    render(<RustOptionsPanel />, { wrapper });

    expect(screen.getByText(/Advanced options are limited/)).toBeInTheDocument();
  });

  it('shows dependencies preview', () => {
    render(<RustOptionsPanel />, { wrapper });

    expect(screen.getByText('Dependencies Preview')).toBeInTheDocument();
    expect(screen.getByText(/axum, tokio, sqlx, serde/)).toBeInTheDocument();
  });

  it('updates tracing toggle', async () => {
    const user = userEvent.setup();
    render(<RustOptionsPanel />, { wrapper });

    await user.click(screen.getByText('Observability'));

    const tracingSwitch = screen.getByLabelText(/Enable Tracing/);
    await user.click(tracingSwitch);

    expect(mockUpdateRustOptions).toHaveBeenCalledWith({ tracing: false });
  });

  it('shows cache TTL when caching is enabled', async () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        rustOptions: { ...defaultOptions, caching: true },
        updateRustOptions: mockUpdateRustOptions,
      };
      return selector(state);
    });

    const user = userEvent.setup();
    render(<RustOptionsPanel />, { wrapper });

    await user.click(screen.getByText('Performance'));

    expect(screen.getByText('Cache TTL (seconds)')).toBeInTheDocument();
  });
});
```

---

## Criterios de Completado

- [ ] Tests cubren todas las secciones
- [ ] Tests cubren condicionales
- [ ] Tests cubren interacciones
- [ ] Tests cubren preset minimal
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

[[T-045]] → [[T-049]] → [[T-050]] | [[Phases/04-RUST-EDGE]]
