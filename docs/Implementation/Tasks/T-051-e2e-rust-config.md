# T-051: Tests E2E Configuracion Rust

> Fase: [[Phases/04-RUST-EDGE]] | Iteracion: 4.4 E2E

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-051 |
| **Tipo** | Test |
| **Estimado** | 2h |
| **Dependencias** | [[T-047]] |
| **Branch** | `feat/rust-support` |
| **Estado** | Pending |

---

## Objetivo

Crear tests E2E para el flujo completo de configuracion de Rust.

---

## Archivos a Crear

```
e2e/
└── rust-configuration.spec.ts  ← CREAR (~100 lineas)
```

---

## Codigo de Referencia

```typescript
import { test, expect } from '@playwright/test';

test.describe('Rust Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows Rust configuration when Rust is selected', async ({ page }) => {
    // Open project settings
    await page.click('[data-testid="project-settings-button"]');

    // Select Rust language
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');

    // Rust configuration section should appear
    await expect(page.locator('text=Rust Configuration')).toBeVisible();
    await expect(page.locator('text=Axum')).toBeVisible();
  });

  test('hides Rust configuration for other languages', async ({ page }) => {
    // Open project settings
    await page.click('[data-testid="project-settings-button"]');

    // Select Java
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Java');

    // Rust configuration should not be visible
    await expect(page.locator('text=Rust Configuration')).not.toBeVisible();
  });

  test('allows selecting Rust presets', async ({ page }) => {
    // Setup: Select Rust
    await page.click('[data-testid="project-settings-button"]');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');

    // Expand Rust configuration
    await page.click('text=Rust Configuration');

    // All presets should be visible
    await expect(page.locator('text=Minimal')).toBeVisible();
    await expect(page.locator('text=Standard')).toBeVisible();
    await expect(page.locator('text=Full')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();

    // Select Performance preset
    await page.click('text=Performance');

    // Should show selected badge
    await expect(page.locator('text=Selected').last()).toBeVisible();
  });

  test('expands advanced options panel', async ({ page }) => {
    // Setup: Select Rust
    await page.click('[data-testid="project-settings-button"]');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');
    await page.click('text=Rust Configuration');

    // Expand Database Configuration
    await page.click('text=Database Configuration');

    // Should show database options
    await expect(page.locator('text=Database Driver')).toBeVisible();
    await expect(page.locator('text=Connection Pool Size')).toBeVisible();
  });

  test('updates database configuration', async ({ page }) => {
    // Setup: Select Rust
    await page.click('[data-testid="project-settings-button"]');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');
    await page.click('text=Rust Configuration');
    await page.click('text=Database Configuration');

    // Change database driver
    await page.click('[data-testid="database-select"]');
    await page.click('text=SeaORM');

    // Should update selection
    await expect(page.locator('text=SeaORM')).toBeVisible();
  });

  test('shows rate limit input when enabled', async ({ page }) => {
    // Setup: Select Rust with standard preset
    await page.click('[data-testid="project-settings-button"]');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');
    await page.click('text=Rust Configuration');

    // Expand Security section
    await page.click('text=Security');

    // Rate limit input should not be visible
    await expect(page.locator('text=Requests per minute')).not.toBeVisible();

    // Enable rate limiting
    await page.click('text=Enable Rate Limiting');

    // Rate limit input should now be visible
    await expect(page.locator('text=Requests per minute')).toBeVisible();
  });

  test('minimal preset shows limitation warning', async ({ page }) => {
    // Setup: Select Rust
    await page.click('[data-testid="project-settings-button"]');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');
    await page.click('text=Rust Configuration');

    // Select Minimal preset
    await page.click('text=Minimal');

    // Warning should appear
    await expect(page.locator('text=/Advanced options are limited/')).toBeVisible();
  });

  test('shows dependencies preview', async ({ page }) => {
    // Setup: Select Rust
    await page.click('[data-testid="project-settings-button"]');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');
    await page.click('text=Rust Configuration');

    // Dependencies preview should be visible
    await expect(page.locator('text=Dependencies Preview')).toBeVisible();
    await expect(page.locator('text=/axum, tokio/')).toBeVisible();
  });

  test('persists Rust configuration after refresh', async ({ page }) => {
    // Setup: Select Rust and change preset
    await page.click('[data-testid="project-settings-button"]');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');
    await page.click('text=Rust Configuration');
    await page.click('text=Full');

    // Reload page
    await page.reload();

    // Open settings again
    await page.click('[data-testid="project-settings-button"]');
    await page.click('text=Rust Configuration');

    // Full preset should still be selected
    await expect(page.locator('[data-preset="full"]').locator('text=Selected')).toBeVisible();
  });

  test('generates project with Rust configuration', async ({ page }) => {
    // Setup: Select Rust with specific configuration
    await page.click('[data-testid="project-settings-button"]');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Rust');

    // Add an entity
    await page.click('[data-testid="add-entity-button"]');
    await page.fill('[data-testid="entity-name-input"]', 'User');
    await page.click('[data-testid="save-entity-button"]');

    // Generate project
    await page.click('[data-testid="generate-button"]');

    // Should show generation success
    await expect(page.locator('text=/Generated successfully|Download/')).toBeVisible({ timeout: 30000 });
  });
});
```

---

## Criterios de Completado

- [ ] Tests E2E cubren seleccion de lenguaje
- [ ] Tests E2E cubren seleccion de preset
- [ ] Tests E2E cubren opciones avanzadas
- [ ] Tests E2E cubren persistencia
- [ ] Tests E2E cubren generacion
- [ ] `npm run test:e2e` pasa

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

[[T-047]] → [[T-051]] | [[Phases/04-RUST-EDGE]]
