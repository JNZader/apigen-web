# T-041: Tests OpenAPI Import Modal

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.5 Tests

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-041 |
| **Tipo** | Test |
| **Estimado** | 2h |
| **Dependencias** | [[T-038]], [[T-040]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para OpenApiImportModal.

---

## Archivos a Crear

```
src/components/
└── OpenApiImportModal.test.tsx  ← CREAR (~150 lineas)
```

---

## Codigo de Referencia

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { OpenApiImportModal } from './OpenApiImportModal';

// Mock the parser
vi.mock('@/utils/openApiParser', () => ({
  openApiParser: {
    parse: vi.fn(),
  },
}));

import { openApiParser } from '@/utils/openApiParser';

describe('OpenApiImportModal', () => {
  const mockOnClose = vi.fn();
  const mockOnImport = vi.fn();

  const defaultProps = {
    opened: true,
    onClose: mockOnClose,
    onImport: mockOnImport,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with tabs', () => {
    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    expect(screen.getByText('Import from OpenAPI')).toBeInTheDocument();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('Paste Content')).toBeInTheDocument();
    expect(screen.getByText('From URL')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<OpenApiImportModal {...defaultProps} opened={false} />, { wrapper });

    expect(screen.queryByText('Import from OpenAPI')).not.toBeInTheDocument();
  });

  it('shows paste textarea when tab is selected', async () => {
    const user = userEvent.setup();
    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    await user.click(screen.getByText('Paste Content'));

    expect(
      screen.getByPlaceholderText(/Paste your OpenAPI JSON/)
    ).toBeInTheDocument();
  });

  it('parses pasted content', async () => {
    const user = userEvent.setup();
    const mockResult = {
      projectName: 'TestAPI',
      version: '1.0.0',
      entities: [
        { id: '1', name: 'User', fields: [{ name: 'id' }] },
      ],
      relations: [],
      warnings: [],
    };

    (openApiParser.parse as any).mockReturnValue(mockResult);

    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    await user.click(screen.getByText('Paste Content'));

    const textarea = screen.getByPlaceholderText(/Paste your OpenAPI JSON/);
    await user.type(textarea, '{"openapi": "3.0.0"}');

    await user.click(screen.getByText('Parse Document'));

    await waitFor(() => {
      expect(openApiParser.parse).toHaveBeenCalled();
    });

    expect(screen.getByText('TestAPI')).toBeInTheDocument();
  });

  it('shows entity selection after parsing', async () => {
    const user = userEvent.setup();
    const mockResult = {
      projectName: 'TestAPI',
      version: '1.0.0',
      entities: [
        { id: '1', name: 'User', fields: [{ name: 'id' }, { name: 'email' }] },
        { id: '2', name: 'Product', fields: [{ name: 'id' }] },
      ],
      relations: [],
      warnings: [],
    };

    (openApiParser.parse as any).mockReturnValue(mockResult);

    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    await user.click(screen.getByText('Paste Content'));
    const textarea = screen.getByPlaceholderText(/Paste your OpenAPI JSON/);
    await user.type(textarea, '{"openapi": "3.0.0"}');
    await user.click(screen.getByText('Parse Document'));

    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Product')).toBeInTheDocument();
    });

    expect(screen.getByText('2 entities')).toBeInTheDocument();
  });

  it('allows toggling entity selection', async () => {
    const user = userEvent.setup();
    const mockResult = {
      projectName: 'TestAPI',
      version: '1.0.0',
      entities: [
        { id: '1', name: 'User', fields: [] },
        { id: '2', name: 'Product', fields: [] },
      ],
      relations: [],
      warnings: [],
    };

    (openApiParser.parse as any).mockReturnValue(mockResult);

    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    // Parse first
    await user.click(screen.getByText('Paste Content'));
    const textarea = screen.getByPlaceholderText(/Paste your OpenAPI JSON/);
    await user.type(textarea, '{"openapi": "3.0.0"}');
    await user.click(screen.getByText('Parse Document'));

    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    // Toggle off User
    const userCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(userCheckbox);

    // Should now say "Import 1 entities"
    expect(screen.getByText(/Import 1 entities/)).toBeInTheDocument();
  });

  it('calls onImport with selected entities', async () => {
    const user = userEvent.setup();
    const mockResult = {
      projectName: 'TestAPI',
      version: '1.0.0',
      entities: [
        { id: '1', name: 'User', fields: [] },
      ],
      relations: [],
      warnings: [],
    };

    (openApiParser.parse as any).mockReturnValue(mockResult);

    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    await user.click(screen.getByText('Paste Content'));
    const textarea = screen.getByPlaceholderText(/Paste your OpenAPI JSON/);
    await user.type(textarea, '{"openapi": "3.0.0"}');
    await user.click(screen.getByText('Parse Document'));

    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Import 1 entities/));

    expect(mockOnImport).toHaveBeenCalledWith(
      mockResult.entities,
      mockResult.relations
    );
  });

  it('shows error on parse failure', async () => {
    const user = userEvent.setup();
    (openApiParser.parse as any).mockImplementation(() => {
      throw new Error('Invalid JSON');
    });

    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    await user.click(screen.getByText('Paste Content'));
    const textarea = screen.getByPlaceholderText(/Paste your OpenAPI JSON/);
    await user.type(textarea, 'invalid');
    await user.click(screen.getByText('Parse Document'));

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/)).toBeInTheDocument();
    });
  });

  it('shows warnings from parse result', async () => {
    const user = userEvent.setup();
    const mockResult = {
      projectName: 'TestAPI',
      version: '1.0.0',
      entities: [],
      relations: [],
      warnings: ['Missing schema definitions'],
    };

    (openApiParser.parse as any).mockReturnValue(mockResult);

    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    await user.click(screen.getByText('Paste Content'));
    const textarea = screen.getByPlaceholderText(/Paste your OpenAPI JSON/);
    await user.type(textarea, '{"openapi": "3.0.0"}');
    await user.click(screen.getByText('Parse Document'));

    await waitFor(() => {
      expect(screen.getByText('Missing schema definitions')).toBeInTheDocument();
    });
  });

  it('resets state on close', async () => {
    const user = userEvent.setup();
    render(<OpenApiImportModal {...defaultProps} />, { wrapper });

    await user.click(screen.getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
```

---

## Criterios de Completado

- [ ] Tests cubren todos los tabs
- [ ] Tests cubren parse success/failure
- [ ] Tests cubren seleccion de entidades
- [ ] Tests cubren import
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

#task #fase-3 #test #pending

[[T-038]], [[T-040]] → [[T-041]] | [[Phases/03-OPENAPI-IMPORT]]
