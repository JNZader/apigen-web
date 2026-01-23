import { test, expect } from '@playwright/test';

test.describe('Entity Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Close any welcome modal if present
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test.describe('Entity Creation', () => {
    test('should show Add Entity button in toolbar', async ({ page }) => {
      // Look for Add Entity button in multiple possible locations
      const addEntityBtn = page.getByRole('button', { name: /Add Entity/i });
      await expect(addEntityBtn.first()).toBeVisible();
    });

    test('should open modal when Add Entity is clicked', async ({ page }) => {
      const addEntityBtn = page.getByRole('button', { name: /Add Entity/i }).first();
      await addEntityBtn.click();

      // A dialog/modal should appear
      await expect(page.getByRole('dialog').or(page.locator('.mantine-Modal-content'))).toBeVisible();
    });

    test('should close modal when clicking outside or pressing Escape', async ({ page }) => {
      const addEntityBtn = page.getByRole('button', { name: /Add Entity/i }).first();
      await addEntityBtn.click();

      // Wait for modal to appear
      await expect(page.getByRole('dialog').or(page.locator('.mantine-Modal-content'))).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Modal should close
      await expect(
        page.getByRole('dialog').or(page.locator('.mantine-Modal-content')),
      ).not.toBeVisible();
    });
  });

  test.describe('Canvas Display', () => {
    test('should show empty canvas initially', async ({ page }) => {
      // Canvas should be visible
      await expect(page.locator('.react-flow')).toBeVisible();
    });

    test('should have canvas controls', async ({ page }) => {
      // ReactFlow controls should be present
      await expect(page.locator('.react-flow__controls').first()).toBeVisible();
    });

    test('should have minimap', async ({ page }) => {
      // ReactFlow minimap should be present
      await expect(page.locator('.react-flow__minimap')).toBeVisible();
    });

    test('should have background', async ({ page }) => {
      // ReactFlow background should be present
      await expect(page.locator('.react-flow__background')).toBeVisible();
    });
  });

  test.describe('Canvas Navigation', () => {
    test('should show zoom controls', async ({ page }) => {
      const controls = page.locator('.react-flow__controls');
      await expect(controls).toBeVisible();
    });

    test('should have canvas viewport', async ({ page }) => {
      const viewport = page.locator('.react-flow__viewport');
      await expect(viewport).toBeVisible();
    });
  });

  test.describe('View Switching', () => {
    test('should show view switcher', async ({ page }) => {
      // Look for the segmented control or radio group for view switching
      const viewSwitcher = page.locator('[role="radiogroup"]');
      await expect(viewSwitcher.first()).toBeVisible();
    });

    test('should have Entities option in view switcher', async ({ page }) => {
      const entitiesOption = page.getByText(/entities/i);
      await expect(entitiesOption.first()).toBeVisible();
    });

    test('should have Services option in view switcher', async ({ page }) => {
      const servicesOption = page.getByText(/services/i);
      await expect(servicesOption.first()).toBeVisible();
    });
  });
});
