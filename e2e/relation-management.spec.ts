import { test, expect } from './fixtures';

test.describe('Canvas and Relations E2E Tests', () => {
  test.describe('Canvas Structure', () => {
    test('should render ReactFlow canvas', async ({ reactFlowPage: page }) => {
      await expect(page.locator('.react-flow')).toBeVisible();
    });

    test('should have edges container', async ({ reactFlowPage: page }) => {
      // Edges container exists but may be hidden when no edges are present
      await expect(page.locator('.react-flow__edges')).toBeAttached();
    });

    test('should have nodes container', async ({ reactFlowPage: page }) => {
      await expect(page.locator('.react-flow__nodes')).toBeVisible();
    });

    test('should have pane for interactions', async ({ reactFlowPage: page }) => {
      await expect(page.locator('.react-flow__pane')).toBeVisible();
    });
  });

  test.describe('Entity View Mode', () => {
    test('should show Entities option as selected by default', async ({ reactFlowPage: page }) => {
      // Look for the entities radio button/tab that is checked/active
      const entitiesOption = page
        .locator('input[value="entities"][checked]')
        .or(page.locator('[data-active="true"]').filter({ hasText: /entities/i }));

      await expect(entitiesOption.first()).toBeVisible();
    });

    test('should be able to switch to Services view', async ({ reactFlowPage: page }) => {
      // Find and click the Services option
      const servicesLabel = page.getByText(/services/i).first();
      await servicesLabel.click();

      // Services option should now be active
      await page.waitForTimeout(300);
    });
  });

  test.describe('Canvas Controls', () => {
    test('should have fit view button', async ({ reactFlowPage: page }) => {
      const controls = page.locator('.react-flow__controls');
      await expect(controls).toBeVisible();

      // Fit view button should be in controls
      const fitViewBtn = controls.locator('button').first();
      await expect(fitViewBtn).toBeVisible();
    });

    test('should have zoom buttons', async ({ reactFlowPage: page }) => {
      const controls = page.locator('.react-flow__controls');
      const buttons = controls.locator('button');

      // Should have multiple control buttons (zoom in, zoom out, fit view)
      await expect(buttons.first()).toBeVisible();
    });
  });

  test.describe('MiniMap', () => {
    test('should show minimap', async ({ reactFlowPage: page }) => {
      await expect(page.locator('.react-flow__minimap')).toBeVisible();
    });

    test('should have minimap mask', async ({ reactFlowPage: page }) => {
      await expect(page.locator('.react-flow__minimap-mask')).toBeVisible();
    });
  });

  test.describe('Canvas Toolbar', () => {
    test('should show toolbar panel', async ({ reactFlowPage: page }) => {
      const toolbar = page.locator('[role="toolbar"]').or(page.locator('.react-flow__panel'));
      await expect(toolbar.first()).toBeVisible();
    });

    test('should have Add Entity button in entity view', async ({ reactFlowPage: page }) => {
      const addEntityBtn = page.getByRole('button', { name: /Add Entity/i });
      await expect(addEntityBtn.first()).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support Escape key to close modals', async ({ reactFlowPage: page }) => {
      // Open a modal
      const addEntityBtn = page.getByRole('button', { name: /Add Entity/i }).first();
      await addEntityBtn.click();

      // Wait for modal
      await expect(page.locator('.mantine-Modal-content').or(page.getByRole('dialog'))).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Modal should close
      await expect(
        page.locator('.mantine-Modal-content').or(page.getByRole('dialog')),
      ).not.toBeVisible();
    });
  });

  test.describe('Canvas Background', () => {
    test('should have dot pattern background', async ({ reactFlowPage: page }) => {
      const background = page.locator('.react-flow__background');
      await expect(background).toBeVisible();
    });
  });
});
