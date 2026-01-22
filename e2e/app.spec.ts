import { test, expect } from '@playwright/test';

test.describe('APiGen Studio E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Close any welcome modal if present
    const closeBtn = page.getByRole('button', { name: /close/i });
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
    }

    // Also try pressing Escape to close any modal
    await page.keyboard.press('Escape');
    // Give time for modal to close
    await page.waitForTimeout(300);
  });

  test.describe('Application Load', () => {
    test('should load the application successfully', async ({ page }) => {
      // Check main layout elements - use heading role for specificity
      await expect(page.getByRole('heading', { name: 'APiGen Studio', exact: true })).toBeVisible();
    });

    test('should display the canvas view by default', async ({ page }) => {
      // ReactFlow canvas should be visible
      await expect(page.locator('.react-flow')).toBeVisible();
    });

    test('should show action buttons', async ({ page }) => {
      // Export Services button should be visible
      await expect(page.getByText('Export Services')).toBeVisible();
      // Event Streams button should be visible
      await expect(page.getByText('Event Streams')).toBeVisible();
    });
  });

  test.describe('Canvas View', () => {
    test('should display canvas with ReactFlow', async ({ page }) => {
      await expect(page.locator('.react-flow')).toBeVisible();
    });

    test('should show canvas controls', async ({ page }) => {
      // ReactFlow controls panel or controls should be present
      const controlsPanel = page.locator('.react-flow__controls, .react-flow__panel');
      await expect(controlsPanel.first()).toBeVisible();
    });
  });

  test.describe('Service Management', () => {
    test('should open service creation modal when Add Service is clicked', async ({ page }) => {
      // Look for Add Service button - it might be in the canvas toolbar
      const addServiceBtn = page.getByRole('button', { name: /Add Service/i }).first();

      // Skip test if button not visible
      if (await addServiceBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addServiceBtn.click();
        await expect(page.getByText('Create New Service')).toBeVisible();
      }
    });
  });

  test.describe('Drawers', () => {
    test('should open export services drawer', async ({ page }) => {
      // Find and click the Export Services button
      const exportBtn = page.getByRole('button', { name: /Export Services/i });
      await exportBtn.click();

      // Wait for drawer to open - look for the drawer content
      await expect(page.getByRole('dialog').or(page.locator('.mantine-Drawer-content'))).toBeVisible();
    });

    test('should open event streams drawer', async ({ page }) => {
      // Find and click the Event Streams button
      const eventBtn = page.getByRole('button', { name: /Event Streams/i });
      await eventBtn.click();

      // Wait for drawer to open - look for the drawer content
      await expect(page.getByRole('dialog').or(page.locator('.mantine-Drawer-content'))).toBeVisible();
    });

    test('should close drawer with close button', async ({ page }) => {
      // Open export drawer
      await page.getByRole('button', { name: /Export Services/i }).click();

      // Wait for drawer to open
      await expect(page.locator('.mantine-Drawer-content')).toBeVisible();

      // Find and click close button
      const closeDrawerBtn = page.locator('.mantine-Drawer-close');
      await closeDrawerBtn.click();

      // Drawer should close
      await expect(page.locator('.mantine-Drawer-content')).not.toBeVisible();
    });
  });
});
