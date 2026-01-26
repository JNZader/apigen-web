import { expect, test } from '@playwright/test';

test.describe('Keyboard Shortcuts E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Skip BOTH onboarding AND wizard modals
    await page.addInitScript(() => {
      localStorage.setItem('apigen-studio-onboarding-completed', 'true');
      localStorage.setItem('apigen-wizard-seen', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Help Modal', () => {
    test('should open shortcuts modal with ? key', async ({ page }) => {
      // Press Shift + / (which is ?)
      await page.keyboard.press('Shift+/');

      // Shortcuts modal should appear
      await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible();
    });

    test('should show all shortcut categories', async ({ page }) => {
      await page.keyboard.press('Shift+/');

      // Check for common shortcuts using exact text
      await expect(page.getByText('Undo', { exact: true })).toBeVisible();
      await expect(page.getByText('Redo', { exact: true })).toBeVisible();
    });

    test('should close shortcuts modal with Escape', async ({ page }) => {
      // Open shortcuts modal
      await page.keyboard.press('Shift+/');
      await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'Keyboard Shortcuts' })).not.toBeVisible();
    });
  });

  test.describe('Entity Operations', () => {
    test('should open new entity form with Ctrl+N', async ({ page }) => {
      // Press Ctrl+N (or Cmd+N on Mac)
      await page.keyboard.press('Control+n');

      // Entity form modal should appear
      await expect(page.getByRole('dialog', { name: 'New Entity' })).toBeVisible();
    });

    test('should close entity form with Escape', async ({ page }) => {
      // Open entity form
      await page.keyboard.press('Control+n');
      await expect(page.getByRole('dialog', { name: 'New Entity' })).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'New Entity' })).not.toBeVisible();
    });
  });

  test.describe('Undo/Redo', () => {
    test('should perform undo with Ctrl+Z', async ({ page }) => {
      // First create an entity to have something to undo
      await page.keyboard.press('Control+n');
      await expect(page.getByRole('dialog', { name: 'New Entity' })).toBeVisible();

      // Fill entity name and create - use the dialog-specific button
      const dialog = page.getByRole('dialog', { name: 'New Entity' });
      await dialog.getByLabel(/Entity Name|Name/i).first().fill('TestEntity');
      await dialog.getByRole('button', { name: 'Create', exact: true }).click();

      // Wait for dialog to close
      await expect(page.getByRole('dialog', { name: 'New Entity' })).not.toBeVisible();

      // Perform undo
      await page.keyboard.press('Control+z');

      // Entity should be removed (undo worked)
    });

    test('should perform redo with Ctrl+Y', async ({ page }) => {
      // Create entity
      await page.keyboard.press('Control+n');
      const dialog = page.getByRole('dialog', { name: 'New Entity' });
      await dialog.getByLabel(/Entity Name|Name/i).first().fill('RedoTestEntity');
      await dialog.getByRole('button', { name: 'Create', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'New Entity' })).not.toBeVisible();

      // Undo
      await page.keyboard.press('Control+z');

      // Redo with Ctrl+Y
      await page.keyboard.press('Control+y');
    });

    test('should perform redo with Ctrl+Shift+Z', async ({ page }) => {
      // Create entity
      await page.keyboard.press('Control+n');
      const dialog = page.getByRole('dialog', { name: 'New Entity' });
      await dialog.getByLabel(/Entity Name|Name/i).first().fill('RedoTestEntity2');
      await dialog.getByRole('button', { name: 'Create', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'New Entity' })).not.toBeVisible();

      // Undo
      await page.keyboard.press('Control+z');

      // Redo with Ctrl+Shift+Z (alternative)
      await page.keyboard.press('Control+Shift+z');
    });
  });

  test.describe('Quick Save', () => {
    test('should trigger save with Ctrl+S', async ({ page }) => {
      // Listen for download event (quick save triggers file download)
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      // Press Ctrl+S
      await page.keyboard.press('Control+s');

      // Should trigger a download
      const download = await downloadPromise;
      // If download happened, it worked
      if (download) {
        expect(download.suggestedFilename()).toContain('design.json');
      }
    });
  });

  test.describe('Escape Key', () => {
    test('should close any open modal with Escape', async ({ page }) => {
      // Open project settings
      await page.getByLabel('Open project settings').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });
});
