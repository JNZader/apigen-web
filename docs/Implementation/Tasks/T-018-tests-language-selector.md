# T-018: Tests LanguageSelector

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.4 Tests

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-018 |
| **Tipo** | Test |
| **Estimado** | 1h |
| **Dependencias** | [[T-011]] |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Crear tests unitarios completos para el componente LanguageSelector y sus sub-componentes.

---

## Tareas

- [ ] Tests para LanguageSelector
- [ ] Tests para FrameworkCard
- [ ] Tests de integracion con store
- [ ] Tests de accesibilidad basicos
- [ ] Cobertura >80%

---

## Archivos a Crear

```
src/components/LanguageSelector/
├── LanguageSelector.test.tsx    ← CREAR (~100 lineas)
└── FrameworkCard.test.tsx       ← CREAR (~80 lineas)
```

**LOC Estimado:** ~180

---

## Codigo de Referencia

```typescript
// src/components/LanguageSelector/LanguageSelector.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { LanguageSelector } from './LanguageSelector';
import { useProjectStore } from '@/store';

// Mock del store
vi.mock('@/store', () => ({
  useProjectStore: vi.fn(),
}));

const mockSetTargetLanguage = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        targetConfig: null,
        setTargetLanguage: mockSetTargetLanguage,
      };
      return selector(state);
    });
  });

  it('renders all 9 language cards', () => {
    render(<LanguageSelector />, { wrapper });

    expect(screen.getByText('Java / Spring Boot')).toBeInTheDocument();
    expect(screen.getByText('Kotlin / Spring Boot')).toBeInTheDocument();
    expect(screen.getByText('Python / FastAPI')).toBeInTheDocument();
    expect(screen.getByText('TypeScript / NestJS')).toBeInTheDocument();
    expect(screen.getByText('PHP / Laravel')).toBeInTheDocument();
    expect(screen.getByText('Go / Gin')).toBeInTheDocument();
    expect(screen.getByText('Go / Chi')).toBeInTheDocument();
    expect(screen.getByText('Rust / Axum')).toBeInTheDocument();
    expect(screen.getByText('C# / ASP.NET Core')).toBeInTheDocument();
  });

  it('calls setTargetLanguage when a card is clicked', () => {
    render(<LanguageSelector />, { wrapper });

    const javaCard = screen.getByText('Java / Spring Boot').closest('[role="button"]');
    fireEvent.click(javaCard!);

    expect(mockSetTargetLanguage).toHaveBeenCalledWith('java', 'spring-boot');
  });

  it('shows selected badge when a language is selected', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        targetConfig: { language: 'java', framework: 'spring-boot' },
        setTargetLanguage: mockSetTargetLanguage,
      };
      return selector(state);
    });

    render(<LanguageSelector />, { wrapper });

    const javaCard = screen.getByText('Java / Spring Boot').closest('[data-selected]');
    expect(javaCard).toBeInTheDocument();
  });

  it('calls onSelect callback when provided', () => {
    const onSelect = vi.fn();
    render(<LanguageSelector onSelect={onSelect} />, { wrapper });

    const pythonCard = screen.getByText('Python / FastAPI').closest('[role="button"]');
    fireEvent.click(pythonCard!);

    expect(onSelect).toHaveBeenCalledWith('python', 'fastapi');
  });

  it('shows feature matrix when showFeatureMatrix is true', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        targetConfig: { language: 'java', framework: 'spring-boot' },
        setTargetLanguage: mockSetTargetLanguage,
      };
      return selector(state);
    });

    render(<LanguageSelector showFeatureMatrix />, { wrapper });

    expect(screen.getByText('Feature Compatibility')).toBeInTheDocument();
  });

  it('hides feature matrix when no language is selected', () => {
    render(<LanguageSelector showFeatureMatrix />, { wrapper });

    expect(screen.queryByText('Feature Compatibility')).not.toBeInTheDocument();
  });

  // Accessibility tests
  it('has correct ARIA attributes on cards', () => {
    render(<LanguageSelector />, { wrapper });

    const cards = screen.getAllByRole('button');
    cards.forEach((card) => {
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('aria-label');
    });
  });

  it('supports keyboard navigation', () => {
    render(<LanguageSelector />, { wrapper });

    const javaCard = screen.getByText('Java / Spring Boot').closest('[role="button"]');
    javaCard?.focus();
    fireEvent.keyDown(javaCard!, { key: 'Enter' });

    expect(mockSetTargetLanguage).toHaveBeenCalledWith('java', 'spring-boot');
  });
});
```

```typescript
// src/components/LanguageSelector/FrameworkCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { FrameworkCard } from './FrameworkCard';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const defaultProps = {
  language: 'java' as const,
  framework: 'spring-boot' as const,
  displayName: 'Java / Spring Boot',
  version: '4.x (Java 25)',
  description: 'Enterprise-grade REST APIs',
  icon: 'IconCoffee',
  features: ['CRUD', 'JWT', 'OAuth2', 'HATEOAS'],
  selected: false,
  onSelect: vi.fn(),
};

describe('FrameworkCard', () => {
  it('renders display name and version', () => {
    render(<FrameworkCard {...defaultProps} />, { wrapper });

    expect(screen.getByText('Java / Spring Boot')).toBeInTheDocument();
    expect(screen.getByText('4.x (Java 25)')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<FrameworkCard {...defaultProps} />, { wrapper });

    expect(screen.getByText('Enterprise-grade REST APIs')).toBeInTheDocument();
  });

  it('renders feature badges (max 3)', () => {
    render(<FrameworkCard {...defaultProps} />, { wrapper });

    expect(screen.getByText('CRUD')).toBeInTheDocument();
    expect(screen.getByText('JWT')).toBeInTheDocument();
    expect(screen.getByText('OAuth2')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument(); // 4th feature as +1
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<FrameworkCard {...defaultProps} onSelect={onSelect} />, { wrapper });

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalled();
  });

  it('shows selected state', () => {
    render(<FrameworkCard {...defaultProps} selected />, { wrapper });

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('data-selected');
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('supports keyboard activation', () => {
    const onSelect = vi.fn();
    render(<FrameworkCard {...defaultProps} onSelect={onSelect} />, { wrapper });

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(onSelect).toHaveBeenCalled();
  });
});
```

---

## Criterios de Completado

- [ ] Tests para LanguageSelector pasan
- [ ] Tests para FrameworkCard pasan
- [ ] Cobertura >80% para ambos componentes
- [ ] Tests de accesibilidad incluidos
- [ ] Tests de integracion con store
- [ ] `npm run test:run` pasa

---

## Comandos

```bash
# Ejecutar tests de estos componentes
npm run test -- LanguageSelector

# Ver cobertura
npm run test:coverage -- --collectCoverageFrom='src/components/LanguageSelector/**'
```

---

## Notas

- Mockear el store de Zustand
- Usar MantineProvider en wrapper
- Probar keyboard navigation

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

#task #fase-1 #test #pending

[[T-011]] → [[T-018]] | [[Phases/01-LANGUAGE-SELECTOR]]
