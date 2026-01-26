import { expect, test } from '@playwright/test';

test.describe('Project Wizard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Skip both onboarding and wizard modals
    await page.addInitScript(() => {
      localStorage.setItem('apigen-studio-onboarding-completed', 'true');
      localStorage.setItem('apigen-wizard-seen', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Manual Wizard Opening', () => {
    test('should open wizard from New Project button', async ({ page }) => {
      // Click the "New Project" button in canvas toolbar
      await page.getByRole('button', { name: 'New Project' }).click();

      // Wizard should open
      await expect(page.getByRole('dialog', { name: 'Project Setup Wizard' })).toBeVisible();
    });

    test('should not reopen wizard after it was dismissed', async ({ page }) => {
      // No dialog should be visible initially
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('Wizard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Open wizard manually
      await page.getByRole('button', { name: 'New Project' }).click();
      await expect(page.getByRole('dialog', { name: 'Project Setup Wizard' })).toBeVisible();
    });

    test('should navigate through all wizard steps', async ({ page }) => {
      // Step 1: Basic Info - fill required fields
      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
      await page.getByLabel(/Project Name/i).fill('TestProject');
      await page.getByLabel(/Group ID/i).fill('com.test');
      await page.getByLabel(/Artifact ID/i).fill('test-project');
      await page.getByLabel(/Package Name/i).fill('com.test.project');

      // Go to Step 2: Language
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByText('Language', { exact: true })).toBeVisible();

      // Go to Step 3: Features
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByText('Features', { exact: true })).toBeVisible();

      // Go to Step 4: Summary
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByText('Summary', { exact: true })).toBeVisible();
    });

    test('should navigate back through steps', async ({ page }) => {
      // Fill Step 1 and go forward
      await page.getByLabel(/Project Name/i).fill('TestProject');
      await page.getByLabel(/Group ID/i).fill('com.test');
      await page.getByLabel(/Artifact ID/i).fill('test-project');
      await page.getByLabel(/Package Name/i).fill('com.test.project');
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      // Now go back
      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText('Language', { exact: true })).toBeVisible();

      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'New Project' }).click();
      await expect(page.getByRole('dialog', { name: 'Project Setup Wizard' })).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Clear the project name field and try to proceed
      await page.getByLabel(/Project Name/i).clear();

      // Try to proceed without filling required fields
      await page.getByRole('button', { name: 'Next' }).click();

      // Should show validation errors - still on step 1
      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
      await expect(page.getByText(/required/i)).toBeVisible();
    });

    test('should allow proceeding after filling required fields', async ({ page }) => {
      // Fill all required fields
      await page.getByLabel(/Project Name/i).fill('ValidProject');
      await page.getByLabel(/Group ID/i).fill('com.valid');
      await page.getByLabel(/Artifact ID/i).fill('valid-project');
      await page.getByLabel(/Package Name/i).fill('com.valid.project');

      // Should be able to proceed
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByText('Language', { exact: true })).toBeVisible();
    });
  });

  test.describe('Wizard Completion', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'New Project' }).click();
      await expect(page.getByRole('dialog', { name: 'Project Setup Wizard' })).toBeVisible();
    });

    test('should complete full wizard flow', async ({ page }) => {
      // Step 1: Basic Info
      await page.getByLabel(/Project Name/i).fill('MyNewProject');
      await page.getByLabel(/Group ID/i).fill('com.example');
      await page.getByLabel(/Artifact ID/i).fill('my-new-project');
      await page.getByLabel(/Package Name/i).fill('com.example.mynewproject');
      await page.getByRole('button', { name: 'Next' }).click();

      // Step 2: Language
      await page.getByRole('button', { name: 'Next' }).click();

      // Step 3: Features
      await page.getByRole('button', { name: 'Next' }).click();

      // Step 4: Summary - Create Project
      await expect(page.getByText('Summary', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Create Project' }).click();

      // Wizard should close
      await expect(page.getByRole('dialog', { name: 'Project Setup Wizard' })).not.toBeVisible();
    });

    test('should cancel wizard and close modal', async ({ page }) => {
      // Click Cancel button
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Wizard should close
      await expect(page.getByRole('dialog', { name: 'Project Setup Wizard' })).not.toBeVisible();
    });

    test('should close wizard with Escape key', async ({ page }) => {
      await page.keyboard.press('Escape');

      // Wizard should close
      await expect(page.getByRole('dialog', { name: 'Project Setup Wizard' })).not.toBeVisible();
    });
  });
});
