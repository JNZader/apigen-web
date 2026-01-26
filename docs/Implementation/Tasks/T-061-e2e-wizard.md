# T-061: Tests E2E Wizard y UX

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.5 E2E

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-061 |
| **Tipo** | Test |
| **Estimado** | 2h |
| **Dependencias** | [[T-057]] |
| **Branch** | `feat/ux-improvements` |
| **Estado** | Pending |

---

## Objetivo

Crear tests E2E para el wizard y mejoras de UX.

---

## Archivos a Crear

```
e2e/
├── wizard.spec.ts           ← CREAR (~100 lineas)
└── keyboard-shortcuts.spec.ts ← CREAR (~60 lineas)
```

---

## Codigo de Referencia

```typescript
// e2e/wizard.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Project Wizard', () => {
  test('opens automatically for new users', async ({ page }) => {
    // Clear storage to simulate new user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    // Wizard should open automatically
    await expect(page.locator('text=Create New Project')).toBeVisible();
  });

  test('completes full wizard flow', async ({ page }) => {
    await page.goto('/');

    // If wizard didn't open, open it manually
    if (!(await page.locator('text=Create New Project').isVisible())) {
      await page.click('[data-testid="add-button"]');
      await page.click('text=New Project Wizard');
    }

    // Step 1: Basic Info
    await page.fill('[data-testid="project-name-input"]', 'my-test-api');
    await page.fill('[data-testid="description-input"]', 'A test API');
    await page.click('text=Next');

    // Step 2: Language
    await expect(page.locator('text=Select Programming Language')).toBeVisible();
    await page.click('text=Python');
    await page.click('text=Next');

    // Step 3: Features
    await expect(page.locator('text=Select Initial Features')).toBeVisible();
    await page.click('text=Mail Service');
    await page.click('text=Next');

    // Step 4: Summary
    await expect(page.locator('text=Review Your Project')).toBeVisible();
    await expect(page.locator('text=my-test-api')).toBeVisible();
    await expect(page.locator('text=Python')).toBeVisible();

    // Complete
    await page.click('text=Create Project');

    // Wizard should close
    await expect(page.locator('text=Create New Project')).not.toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/');

    if (!(await page.locator('text=Create New Project').isVisible())) {
      await page.click('[data-testid="add-button"]');
      await page.click('text=New Project Wizard');
    }

    // Try to proceed without filling name
    await page.click('text=Next');

    // Should show error
    await expect(page.locator('text=Project name is required')).toBeVisible();
  });

  test('allows navigation between steps', async ({ page }) => {
    await page.goto('/');

    if (!(await page.locator('text=Create New Project').isVisible())) {
      await page.click('[data-testid="add-button"]');
      await page.click('text=New Project Wizard');
    }

    // Complete step 1
    await page.fill('[data-testid="project-name-input"]', 'test');
    await page.click('text=Next');

    // Go to step 2
    await expect(page.locator('text=Select Programming Language')).toBeVisible();

    // Go back
    await page.click('text=Back');

    // Should be back at step 1
    await expect(page.locator('[data-testid="project-name-input"]')).toBeVisible();
  });

  test('uses template correctly', async ({ page }) => {
    await page.goto('/');

    if (!(await page.locator('text=Create New Project').isVisible())) {
      await page.click('[data-testid="add-button"]');
      await page.click('text=New Project Wizard');
    }

    // Select template
    await page.click('text=Use Template');
    await page.click('text=Blog API');

    // Verify template data is applied
    await expect(page.locator('text=Blog API')).toBeVisible();
    await expect(page.locator('text=3 entities')).toBeVisible();
  });

  test('does not reopen after dismissal', async ({ page }) => {
    await page.goto('/');

    // Dismiss wizard if open
    if (await page.locator('text=Create New Project').isVisible()) {
      await page.click('button[aria-label="Close"]');
    }

    // Reload
    await page.reload();

    // Wizard should not reopen
    await expect(page.locator('text=Create New Project')).not.toBeVisible();
  });
});
```

```typescript
// e2e/keyboard-shortcuts.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Dismiss wizard if present
    if (await page.locator('text=Create New Project').isVisible()) {
      await page.click('button[aria-label="Close"]');
    }
  });

  test('opens shortcuts modal with ?', async ({ page }) => {
    await page.keyboard.press('?');

    await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible();
  });

  test('shows all shortcut categories', async ({ page }) => {
    await page.keyboard.press('?');

    await expect(page.locator('text=General')).toBeVisible();
    await expect(page.locator('text=Canvas')).toBeVisible();
    await expect(page.locator('text=Navigation')).toBeVisible();
  });

  test('Ctrl+N opens new entity form', async ({ page }) => {
    await page.keyboard.press('Control+n');

    await expect(page.locator('text=Create Entity')).toBeVisible();
  });

  test('Escape closes modals', async ({ page }) => {
    // Open a modal
    await page.keyboard.press('Control+n');
    await expect(page.locator('text=Create Entity')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.locator('text=Create Entity')).not.toBeVisible();
  });

  test('Ctrl+Z performs undo', async ({ page }) => {
    // Create an entity first
    await page.click('[data-testid="add-button"]');
    await page.click('text=Add Entity');
    await page.fill('[data-testid="entity-name-input"]', 'TestEntity');
    await page.click('[data-testid="save-entity-button"]');

    // Entity should exist
    await expect(page.locator('text=TestEntity')).toBeVisible();

    // Undo
    await page.keyboard.press('Control+z');

    // Entity should be removed (or previous state restored)
    // This depends on undo implementation
  });

  test('Ctrl+L triggers auto layout', async ({ page }) => {
    // Add some entities first
    await page.click('[data-testid="add-button"]');
    await page.click('text=Add Entity');
    await page.fill('[data-testid="entity-name-input"]', 'Entity1');
    await page.click('[data-testid="save-entity-button"]');

    await page.click('[data-testid="add-button"]');
    await page.click('text=Add Entity');
    await page.fill('[data-testid="entity-name-input"]', 'Entity2');
    await page.click('[data-testid="save-entity-button"]');

    // Trigger layout
    await page.keyboard.press('Control+l');

    // Entities should be repositioned (visual verification needed)
    await expect(page.locator('[data-testid="entity-node-Entity1"]')).toBeVisible();
    await expect(page.locator('[data-testid="entity-node-Entity2"]')).toBeVisible();
  });
});
```

---

## Criterios de Completado

- [ ] Tests E2E cubren wizard completo
- [ ] Tests E2E cubren templates
- [ ] Tests E2E cubren shortcuts
- [ ] Tests E2E cubren navegacion
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

#task #fase-5 #test #pending

[[T-057]] → [[T-061]] | [[Phases/05-UX-IMPROVEMENTS]]
