import { expect, test } from '@playwright/test';

test.describe('Rust Configuration E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Skip the onboarding modal by setting localStorage before navigating
    await page.addInitScript(() => {
      localStorage.setItem('apigen-studio-onboarding-completed', 'true');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Language Selection', () => {
    test('should select Rust language from settings', async ({ page }) => {
      // Open project settings
      await page.getByLabel('Open project settings').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Verify Language tab is visible and click Rust
      await expect(page.getByTestId('language-card-rust')).toBeVisible();
      await page.getByTestId('language-card-rust').click();

      // Verify Rust is selected
      await expect(page.getByTestId('language-card-rust')).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      // Verify Axum framework is auto-selected (Rust only has Axum)
      await expect(page.getByText('Axum')).toBeVisible();
    });

    test('should show Rust version in selection display', async ({ page }) => {
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Should show Rust version badge
      await expect(page.getByText(/Rust v/)).toBeVisible();
      await expect(page.getByText(/Axum v/)).toBeVisible();
    });

    test('should switch from Java to Rust', async ({ page }) => {
      await page.getByLabel('Open project settings').click();

      // Java should be selected by default
      await expect(page.getByTestId('language-card-java')).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      // Switch to Rust
      await page.getByTestId('language-card-rust').click();

      // Verify switch
      await expect(page.getByTestId('language-card-rust')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(page.getByTestId('language-card-java')).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });
  });

  test.describe('Settings Persistence', () => {
    test('should persist Rust selection after saving', async ({ page }) => {
      // Open settings and select Rust
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Save settings
      await page.getByRole('button', { name: 'Save Settings' }).click();

      // Wait for modal to close
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Reopen settings
      await page.getByLabel('Open project settings').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Verify Rust is still selected
      await expect(page.getByTestId('language-card-rust')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    test('should persist across page reload', async ({ page }) => {
      // Open settings and select Rust
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();
      await page.getByRole('button', { name: 'Save Settings' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Open settings again
      await page.getByLabel('Open project settings').click();

      // Verify Rust is still selected
      await expect(page.getByTestId('language-card-rust')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });

  test.describe('Settings Tabs Navigation', () => {
    test('should navigate to Database settings for Rust', async ({ page }) => {
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Navigate to Database tab
      await page.getByRole('tab', { name: 'Database' }).click();

      // Verify database settings are visible
      await expect(page.getByText(/Database Type/i)).toBeVisible();
    });

    test('should navigate to Security settings for Rust', async ({ page }) => {
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Navigate to Security tab
      await page.getByRole('tab', { name: 'Security' }).click();

      // Verify security settings are visible
      await expect(page.getByRole('tabpanel')).toBeVisible();
    });

    test('should navigate to Features settings for Rust', async ({ page }) => {
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Navigate to Features tab
      await page.getByRole('tab', { name: 'Features' }).click();

      // Verify features settings are visible
      await expect(page.getByRole('tabpanel')).toBeVisible();
    });
  });

  test.describe('Advanced Options', () => {
    test('should access Cache settings with Rust selected', async ({ page }) => {
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Navigate to Cache tab
      await page.getByRole('tab', { name: 'Cache' }).click();

      // Verify cache settings are accessible
      await expect(page.getByRole('tabpanel')).toBeVisible();
    });

    test('should access Rate Limiting settings with Rust selected', async ({
      page,
    }) => {
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Navigate to Rate Limiting tab
      await page.getByRole('tab', { name: 'Rate Limiting' }).click();

      // Verify rate limiting settings are accessible
      await expect(page.getByRole('tabpanel')).toBeVisible();
    });

    test('should access Observability settings with Rust selected', async ({
      page,
    }) => {
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Navigate to Observability tab
      await page.getByRole('tab', { name: 'Observability' }).click();

      // Verify observability settings are accessible
      await expect(page.getByRole('tabpanel')).toBeVisible();
    });

    test('should access CORS settings with Rust selected', async ({ page }) => {
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Navigate to CORS tab
      await page.getByRole('tab', { name: 'CORS' }).click();

      // Verify CORS settings are accessible
      await expect(page.getByRole('tabpanel')).toBeVisible();
    });
  });

  test.describe('Generation Flow', () => {
    test('should show generate button in header', async ({ page }) => {
      const generateButton = page.getByLabel(/Generate and download project/i);
      await expect(generateButton).toBeVisible();
      await expect(generateButton).toBeEnabled();
    });

    test('should configure Rust and prepare for generation', async ({
      page,
    }) => {
      // Configure Rust
      await page.getByLabel('Open project settings').click();
      await page.getByTestId('language-card-rust').click();

      // Navigate to Basic settings and verify project name
      await page.getByRole('tab', { name: 'Basic' }).click();
      const projectNameInput = page.getByLabel(/Project Name/i);
      await expect(projectNameInput).toBeVisible();

      // Save settings
      await page.getByRole('button', { name: 'Save Settings' }).click();

      // Verify modal closed
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Generate button should be ready
      const generateButton = page.getByLabel(/Generate and download project/i);
      await expect(generateButton).toBeVisible();
      await expect(generateButton).toBeEnabled();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should select Rust with keyboard', async ({ page }) => {
      await page.getByLabel('Open project settings').click();

      // Focus on Rust card and press Enter
      await page.getByTestId('language-card-rust').focus();
      await page.keyboard.press('Enter');

      // Verify selection
      await expect(page.getByTestId('language-card-rust')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    test('should select Rust with Space key', async ({ page }) => {
      await page.getByLabel('Open project settings').click();

      // Focus on Rust card and press Space
      await page.getByTestId('language-card-rust').focus();
      await page.keyboard.press('Space');

      // Verify selection
      await expect(page.getByTestId('language-card-rust')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });

  test.describe('Cancel and Reset', () => {
    test('should close modal when Cancel is clicked', async ({ page }) => {
      await page.getByLabel('Open project settings').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Select Rust
      await page.getByTestId('language-card-rust').click();

      // Click Cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Modal should close
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Note: Language changes are persisted immediately (by design)
      // since language selection directly updates the store
      // This is different from other settings that require Save
    });

    test('should close modal with Escape key', async ({ page }) => {
      await page.getByLabel('Open project settings').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });
});
