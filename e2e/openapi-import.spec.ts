import { expect, test } from '@playwright/test';

test.describe('OpenAPI Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens import modal from toolbar', async ({ page }) => {
    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
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

    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
    await page.click('text=Paste Content');
    await page.fill('textarea', openApiDoc);
    await page.click('button:has-text("Parse Document")');

    await expect(page.locator('text=Pet')).toBeVisible();
    await expect(page.locator('text=Order')).toBeVisible();
    await expect(page.locator('text=2 entities')).toBeVisible();

    await page.click('button:has-text("Import 2 entities")');

    await expect(page.locator('text=Import from OpenAPI').first()).not.toBeVisible();
    await expect(page.locator('[data-testid="entity-node-Pet"]')).toBeVisible();
    await expect(page.locator('[data-testid="entity-node-Order"]')).toBeVisible();
  });

  test('shows error for invalid JSON', async ({ page }) => {
    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
    await page.click('text=Paste Content');
    await page.fill('textarea', 'not valid json or yaml');
    await page.click('button:has-text("Parse Document")');

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

    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
    await page.click('text=Paste Content');
    await page.fill('textarea', openApiDoc);
    await page.click('button:has-text("Parse Document")');

    await expect(page.locator('text=User')).toBeVisible();

    await page.click('text=Category');
    await expect(page.locator('button:has-text("Import 2 entities")')).toBeVisible();

    await page.click('button:has-text("Import 2 entities")');

    await expect(page.locator('[data-testid="entity-node-User"]')).toBeVisible();
    await expect(page.locator('[data-testid="entity-node-Product"]')).toBeVisible();
    await expect(page.locator('[data-testid="entity-node-Category"]')).not.toBeVisible();
  });

  test('imports from file upload', async ({ page }) => {
    const openApiDoc = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'File Test', version: '1.0.0' },
      components: {
        schemas: {
          Item: { type: 'object', properties: { name: { type: 'string' } } },
        },
      },
    });

    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'openapi.json',
      mimeType: 'application/json',
      buffer: Buffer.from(openApiDoc),
    });

    await expect(page.locator('text=Item')).toBeVisible();
  });

  test('shows warnings from parser', async ({ page }) => {
    const openApiDoc = JSON.stringify({
      openapi: '2.0',
      info: { title: 'Old API', version: '1.0.0' },
      paths: {},
    });

    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
    await page.click('text=Paste Content');
    await page.fill('textarea', openApiDoc);
    await page.click('button:has-text("Parse Document")');

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

    await page.click('[data-testid="add-button"]');
    await page.click('text=Import from OpenAPI');
    await page.click('text=Paste Content');
    await page.fill('textarea', yamlDoc);
    await page.click('button:has-text("Parse Document")');

    await expect(page.locator('text=Tag')).toBeVisible();
  });
});
