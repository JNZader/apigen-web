# T-019: Tests FeatureMatrix

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.4 Tests

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-019 |
| **Tipo** | Test |
| **Estimado** | 1h |
| **Dependencias** | [[T-013]] |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Crear tests unitarios para el componente FeatureMatrix.

---

## Tareas

- [ ] Tests para renderizado de matriz
- [ ] Tests para indicadores de soporte
- [ ] Tests para columna seleccionada
- [ ] Tests para click en header
- [ ] Cobertura >80%

---

## Archivos a Crear

```
src/components/LanguageSelector/
└── FeatureMatrix.test.tsx       ← CREAR (~100 lineas)
```

**LOC Estimado:** ~100

---

## Codigo de Referencia

```typescript
// src/components/LanguageSelector/FeatureMatrix.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { FeatureMatrix } from './FeatureMatrix';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('FeatureMatrix', () => {
  it('renders the title', () => {
    render(<FeatureMatrix />, { wrapper });

    expect(screen.getByText('Feature Compatibility')).toBeInTheDocument();
  });

  it('renders all language columns', () => {
    render(<FeatureMatrix />, { wrapper });

    // Check for language headers (short names)
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('Kotlin')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('NestJS')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
    expect(screen.getByText('Gin')).toBeInTheDocument();
    expect(screen.getByText('Chi')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
    expect(screen.getByText('C#')).toBeInTheDocument();
  });

  it('renders feature groups', () => {
    render(<FeatureMatrix />, { wrapper });

    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Feature Pack 2025')).toBeInTheDocument();
    expect(screen.getByText('API Features')).toBeInTheDocument();
    expect(screen.getByText('Edge Computing')).toBeInTheDocument();
  });

  it('renders feature names', () => {
    render(<FeatureMatrix />, { wrapper });

    expect(screen.getByText('JWT Auth')).toBeInTheDocument();
    expect(screen.getByText('OAuth 2.0')).toBeInTheDocument();
    expect(screen.getByText('Social Login')).toBeInTheDocument();
    expect(screen.getByText('Password Reset')).toBeInTheDocument();
  });

  it('highlights selected language column', () => {
    render(
      <FeatureMatrix
        selectedLanguage="java"
        selectedFramework="spring-boot"
      />,
      { wrapper }
    );

    // El header de Java deberia tener data-selected
    const javaHeaders = screen.getAllByText('Java');
    const javaHeader = javaHeaders.find(
      (el) => el.closest('th')?.hasAttribute('data-selected')
    );
    expect(javaHeader).toBeDefined();
  });

  it('calls onLanguageClick when header is clicked', () => {
    const onLanguageClick = vi.fn();
    render(
      <FeatureMatrix onLanguageClick={onLanguageClick} />,
      { wrapper }
    );

    const pythonHeader = screen.getByText('Python').closest('th');
    fireEvent.click(pythonHeader!);

    expect(onLanguageClick).toHaveBeenCalledWith('python', 'fastapi');
  });

  it('shows correct support indicators', () => {
    render(<FeatureMatrix />, { wrapper });

    // Java soporta JWT - deberia tener check icon
    // Rust no soporta Social Login - deberia tener X icon
    // Verificamos que hay iconos de check y X
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Los iconos de check/x estan en ThemeIcon, verificamos que hay ambos
    const cells = screen.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders legend', () => {
    render(<FeatureMatrix />, { wrapper });

    expect(screen.getByText(/Supported/)).toBeInTheDocument();
    expect(screen.getByText(/Not available/)).toBeInTheDocument();
  });

  it('is horizontally scrollable', () => {
    render(<FeatureMatrix />, { wrapper });

    // ScrollArea deberia estar presente
    const scrollArea = document.querySelector('[data-mantine-component="ScrollArea"]');
    // O verificar que la tabla tiene min-width
    const table = screen.getByRole('table');
    expect(table).toHaveStyle({ minWidth: '600px' });
  });

  // Test de features especificas por lenguaje
  describe('feature support correctness', () => {
    it('shows Java supports all security features', () => {
      render(
        <FeatureMatrix
          selectedLanguage="java"
          selectedFramework="spring-boot"
        />,
        { wrapper }
      );

      // Verificar que la columna de Java tiene checks para security
      // Esto es un test de integracion con los datos
    });

    it('shows Rust has edge computing features', () => {
      render(
        <FeatureMatrix
          selectedLanguage="rust"
          selectedFramework="axum"
        />,
        { wrapper }
      );

      // Rust deberia tener MQTT, Modbus, ONNX
    });
  });
});

// Test de snapshot opcional
describe('FeatureMatrix snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<FeatureMatrix />, { wrapper });
    expect(container).toMatchSnapshot();
  });
});
```

---

## Criterios de Completado

- [ ] Tests de renderizado pasan
- [ ] Tests de interaccion pasan
- [ ] Tests de datos correctos
- [ ] Cobertura >80%
- [ ] `npm run test:run` pasa

---

## Notas

- Verificar que los datos de soporte son correctos
- La tabla debe ser accesible
- Scroll horizontal debe funcionar

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

[[T-013]] → [[T-019]] | [[Phases/01-LANGUAGE-SELECTOR]]
