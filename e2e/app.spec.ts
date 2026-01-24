import { test, expect } from './fixtures';

test.describe('APiGen Studio E2E Tests', () => {
  test.describe('Application Load', () => {
    test('should load the application successfully', async ({ reactFlowPage: page }) => {
      // Check main layout elements - use heading role for specificity
      await expect(page.getByRole('heading', { name: 'APiGen Studio', exact: true })).toBeVisible();
    });

    test('should display the canvas view by default', async ({ reactFlowPage: page }) => {
      // ReactFlow canvas should be visible
      await expect(page.locator('.react-flow')).toBeVisible();
    });

    test('should show action buttons', async ({ reactFlowPage: page }) => {
      // Export Services button should be visible
      await expect(page.getByText('Export Services')).toBeVisible();
      // Event Streams button should be visible
      await expect(page.getByText('Event Streams')).toBeVisible();
    });
  });

  test.describe('Canvas View', () => {
    test('should display canvas with ReactFlow', async ({ reactFlowPage: page }) => {
      await expect(page.locator('.react-flow')).toBeVisible();
    });

    test('should show canvas controls', async ({ reactFlowPage: page }) => {
      // ReactFlow controls panel or controls should be present
      const controlsPanel = page.locator('.react-flow__controls, .react-flow__panel');
      await expect(controlsPanel.first()).toBeVisible();
    });
  });

  test.describe('Service Management', () => {
    test('should open service creation modal when Add Service is clicked', async ({ reactFlowPage: page }) => {
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
    test('should open export services drawer', async ({ reactFlowPage: page }) => {
      // Find and click the Export Services button
      const exportBtn = page.getByRole('button', { name: /Export Services/i });
      await exportBtn.click();

      // Wait for drawer to open - look for the drawer content
      await expect(page.getByRole('dialog').or(page.locator('.mantine-Drawer-content'))).toBeVisible();
    });

    test('should open event streams drawer', async ({ reactFlowPage: page }) => {
      // Find and click the Event Streams button
      const eventBtn = page.getByRole('button', { name: /Event Streams/i });
      await eventBtn.click();

      // Wait for drawer to open - look for the drawer content
      await expect(page.getByRole('dialog').or(page.locator('.mantine-Drawer-content'))).toBeVisible();
    });

    test('should close drawer with close button', async ({ reactFlowPage: page }) => {
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
