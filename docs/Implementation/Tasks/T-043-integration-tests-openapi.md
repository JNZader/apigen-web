# T-043: Tests E2E de Importacion OpenAPI

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.7 E2E

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-043 |
| **Tipo** | Test |
| **Estimado** | 2h |
| **Dependencias** | [[T-041]], [[T-042]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Crear tests E2E para el flujo completo de importacion OpenAPI.

---

## Archivos a Crear

```
e2e/
└── openapi-import.spec.ts  ← CREAR (~120 lineas)
```

---

## Codigo de Referencia

```typescript
import { test, expect } from '@playwright/test';

test.describe('OpenAPI Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens import modal from toolbar', async ({ page }) => {
    // Click add button
    await page.click('[data-testid="add-button"]');

    // Click import option
    await page.click('text=Import from OpenAPI');

    // Modal should be visible
    await expect(page.locator('text=Import from OpenAPI')).toBeVisible();
  });

  test('imports entities from pasted JSON', async ({ page }) => {
    const openApiDoc = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'Pet Store', version: '1.0.0' },
      components: {
        schemas: {
          Pet: {
            type: 'object',
            properties: {
              id: { type: 'integer', format: 'int64' },
              name: { type: 'string' },
              status: { type: 'string', enum: ['available', 'pending', 'sold'] },
            },
            required: ['name'],
          },
          Order: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              petId: { $ref: '#/components/schemas/Pet' },
              quantity: { type: 'integer' },
            },
          },
        },
      },
    });

    // Open modal
    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');

    // Switch to paste tab
    await page.click('text=Paste Content');

    // Paste content
    await page.fill('textarea', openApiDoc);

    // Parse
    await page.click('button:has-text("Parse Document")');

    // Should show entities
    await expect(page.locator('text=Pet')).toBeVisible();
    await expect(page.locator('text=Order')).toBeVisible();
    await expect(page.locator('text=2 entities')).toBeVisible();

    // Import
    await page.click('button:has-text("Import 2 entities")');

    // Modal should close
    await expect(page.locator('text=Import from OpenAPI').first()).not.toBeVisible();

    // Entities should be on canvas
    await expect(page.locator('[data-testid="entity-node-Pet"]')).toBeVisible();
    await expect(page.locator('[data-testid="entity-node-Order"]')).toBeVisible();
  });

  test('shows error for invalid JSON', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');

    // Switch to paste tab
    await page.click('text=Paste Content');

    // Paste invalid content
    await page.fill('textarea', 'not valid json or yaml');

    // Parse
    await page.click('button:has-text("Parse Document")');

    // Should show error
    await expect(page.locator('text=Parse Error')).toBeVisible();
  });

  test('allows selecting specific entities', async ({ page }) => {
    const openApiDoc = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: { type: 'object', properties: { name: { type: 'string' } } },
          Product: { type: 'object', properties: { title: { type: 'string' } } },
          Category: { type: 'object', properties: { label: { type: 'string' } } },
        },
      },
    });

    // Open modal and parse
    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
    await page.click('text=Paste Content');
    await page.fill('textarea', openApiDoc);
    await page.click('button:has-text("Parse Document")');

    // Wait for entities
    await expect(page.locator('text=User')).toBeVisible();

    // Deselect Category
    await page.click('text=Category');

    // Should now say 2 entities
    await expect(page.locator('button:has-text("Import 2 entities")')).toBeVisible();

    // Import
    await page.click('button:has-text("Import 2 entities")');

    // Only User and Product should be on canvas
    await expect(page.locator('[data-testid="entity-node-User"]')).toBeVisible();
    await expect(page.locator('[data-testid="entity-node-Product"]')).toBeVisible();
    await expect(page.locator('[data-testid="entity-node-Category"]')).not.toBeVisible();
  });

  test('imports from file upload', async ({ page }) => {
    // Create a test file
    const openApiDoc = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'File Test', version: '1.0.0' },
      components: {
        schemas: {
          Item: { type: 'object', properties: { name: { type: 'string' } } },
        },
      },
    });

    // Open modal
    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'openapi.json',
      mimeType: 'application/json',
      buffer: Buffer.from(openApiDoc),
    });

    // Should parse automatically
    await expect(page.locator('text=Item')).toBeVisible();
  });

  test('shows warnings from parser', async ({ page }) => {
    const openApiDoc = JSON.stringify({
      openapi: '2.0', // Old version - should warn
      info: { title: 'Old API', version: '1.0.0' },
      paths: {},
    });

    // Open modal and parse
    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
    await page.click('text=Paste Content');
    await page.fill('textarea', openApiDoc);
    await page.click('button:has-text("Parse Document")');

    // Should show warning
    await expect(page.locator('text=Warnings')).toBeVisible();
    await expect(page.locator('text=/may not be fully supported/')).toBeVisible();
  });

  test('imports YAML format', async ({ page }) => {
    const yamlDoc = `
openapi: '3.0.0'
info:
  title: YAML API
  version: '1.0.0'
components:
  schemas:
    Tag:
      type: object
      properties:
        name:
          type: string
`;

    // Open modal and parse
    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
    await page.click('text=Paste Content');
    await page.fill('textarea', yamlDoc);
    await page.click('button:has-text("Parse Document")');

    // Should parse YAML correctly
    await expect(page.locator('text=Tag')).toBeVisible();
  });
});
```

---

## Criterios de Completado

- [ ] Tests E2E cubren flujo completo
- [ ] Tests cubren upload de archivo
- [ ] Tests cubren paste de contenido
- [ ] Tests cubren seleccion de entidades
- [ ] Tests cubren manejo de errores
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

#task #fase-3 #test #pending

[[T-041]], [[T-042]] → [[T-043]] | [[Phases/03-OPENAPI-IMPORT]]
