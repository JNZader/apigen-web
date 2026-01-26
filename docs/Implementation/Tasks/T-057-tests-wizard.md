# T-057: Tests Project Wizard

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.3 Tests

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-057 |
| **Tipo** | Test |
| **Estimado** | 2h |
| **Dependencias** | [[T-054]] |
| **Branch** | `feat/project-wizard` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para el ProjectWizard y sus componentes.

---

## Archivos a Crear

```
src/components/ProjectWizard/
├── ProjectWizard.test.tsx     ← CREAR (~120 lineas)
└── TemplateSelector.test.tsx  ← CREAR (~80 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectWizard/ProjectWizard.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ProjectWizard } from './ProjectWizard';
import { useProjectStore } from '@/store';

vi.mock('@/store');

describe('ProjectWizard', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();
  const mockUpdateProjectConfig = vi.fn();
  const mockSetTargetConfig = vi.fn();
  const mockUpdateFeature = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        updateProjectConfig: mockUpdateProjectConfig,
        setTargetConfig: mockSetTargetConfig,
        updateFeature: mockUpdateFeature,
      };
      return selector(state);
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
  );

  it('renders when opened', () => {
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ProjectWizard opened={false} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  it('shows all steps', () => {
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    expect(screen.getByText('Basic Info')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('starts at step 1', () => {
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    expect(screen.getByLabelText(/Project Name/)).toBeInTheDocument();
  });

  it('validates project name before advancing', async () => {
    const user = userEvent.setup();
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    await user.click(screen.getByText('Next'));

    expect(screen.getByText('Project name is required')).toBeInTheDocument();
  });

  it('advances to next step after valid input', async () => {
    const user = userEvent.setup();
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    await user.type(screen.getByLabelText(/Project Name/), 'my-project');
    await user.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Select Programming Language')).toBeInTheDocument();
    });
  });

  it('allows going back to previous step', async () => {
    const user = userEvent.setup();
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    // Go to step 2
    await user.type(screen.getByLabelText(/Project Name/), 'my-project');
    await user.click(screen.getByText('Next'));

    // Go back
    await user.click(screen.getByText('Back'));

    expect(screen.getByLabelText(/Project Name/)).toBeInTheDocument();
  });

  it('calls onComplete when finished', async () => {
    const user = userEvent.setup();
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    // Step 1
    await user.type(screen.getByLabelText(/Project Name/), 'my-project');
    await user.click(screen.getByText('Next'));

    // Step 2
    await waitFor(() => screen.getByText('Select Programming Language'));
    await user.click(screen.getByText('Next'));

    // Step 3
    await waitFor(() => screen.getByText('Select Initial Features'));
    await user.click(screen.getByText('Next'));

    // Step 4 - Summary
    await waitFor(() => screen.getByText('Review Your Project'));
    await user.click(screen.getByText('Create Project'));

    expect(mockOnComplete).toHaveBeenCalled();
    expect(mockUpdateProjectConfig).toHaveBeenCalled();
    expect(mockSetTargetConfig).toHaveBeenCalled();
  });

  it('disables back button on first step', () => {
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    expect(screen.getByText('Back')).toBeDisabled();
  });

  it('shows progress indicator', () => {
    render(
      <ProjectWizard opened={true} onClose={mockOnClose} onComplete={mockOnComplete} />,
      { wrapper }
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

```typescript
// src/components/ProjectWizard/TemplateSelector.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { TemplateSelector } from './TemplateSelector';

describe('TemplateSelector', () => {
  const mockOnSelect = vi.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
  );

  it('renders all templates', () => {
    render(<TemplateSelector selectedId={null} onSelect={mockOnSelect} />, { wrapper });

    expect(screen.getByText('Blank Project')).toBeInTheDocument();
    expect(screen.getByText('Blog API')).toBeInTheDocument();
    expect(screen.getByText('E-Commerce API')).toBeInTheDocument();
  });

  it('filters by search', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector selectedId={null} onSelect={mockOnSelect} />, { wrapper });

    await user.type(screen.getByPlaceholderText('Search templates...'), 'blog');

    expect(screen.getByText('Blog API')).toBeInTheDocument();
    expect(screen.queryByText('E-Commerce API')).not.toBeInTheDocument();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector selectedId={null} onSelect={mockOnSelect} />, { wrapper });

    await user.click(screen.getByText('Starter'));

    expect(screen.getByText('Blank Project')).toBeInTheDocument();
    expect(screen.getByText('Blog API')).toBeInTheDocument();
    // Full stack templates should be hidden
  });

  it('shows selected state', () => {
    render(<TemplateSelector selectedId="blog-api" onSelect={mockOnSelect} />, { wrapper });

    const blogCard = screen.getByText('Blog API').closest('[class*="Paper"]');
    expect(blogCard).toContainElement(screen.getByText('Selected'));
  });

  it('calls onSelect when clicking a template', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector selectedId={null} onSelect={mockOnSelect} />, { wrapper });

    await user.click(screen.getByText('Blog API'));

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'blog-api' })
    );
  });

  it('shows entity and feature counts', () => {
    render(<TemplateSelector selectedId={null} onSelect={mockOnSelect} />, { wrapper });

    // E-Commerce has 5 entities
    expect(screen.getByText('5 entities')).toBeInTheDocument();
  });

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector selectedId={null} onSelect={mockOnSelect} />, { wrapper });

    await user.type(screen.getByPlaceholderText('Search templates...'), 'nonexistent');

    expect(screen.getByText('No templates found matching your search')).toBeInTheDocument();
  });
});
```

---

## Criterios de Completado

- [ ] Tests cubren navegacion del wizard
- [ ] Tests cubren validacion
- [ ] Tests cubren template selector
- [ ] Tests cubren busqueda/filtro
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

#task #fase-5 #test #pending

[[T-054]] → [[T-057]] → [[T-058]] | [[Phases/05-UX-IMPROVEMENTS]]
