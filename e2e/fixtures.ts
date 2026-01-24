import { test as base, expect, type Page } from '@playwright/test';

/**
 * Wait for React Flow to be fully initialized.
 * This is necessary because React Flow renders asynchronously
 * and its internal elements may not be immediately available.
 */
async function waitForReactFlow(page: Page): Promise<void> {
  // Wait for the main React Flow container with longer timeout for CI
  await page.waitForSelector('.react-flow', { state: 'visible', timeout: 30000 });

  // Wait for React Flow to render its internal components
  // The viewport indicates React Flow has initialized
  await page.waitForSelector('.react-flow__viewport', { state: 'attached', timeout: 15000 });

  // Give React Flow a moment to finish initializing controls and other elements
  await page.waitForTimeout(500);
}

/**
 * Close any modal or welcome dialog that may appear on page load.
 */
async function closeModals(page: Page): Promise<void> {
  // Try close button first
  const closeBtn = page.getByRole('button', { name: /close/i });
  if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await closeBtn.click();
  }

  // Press Escape as fallback
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Extended test fixture with React Flow helpers.
 */
export const test = base.extend<{
  reactFlowPage: Page;
}>({
  reactFlowPage: async ({ page }, use) => {
    // Navigate to the page
    await page.goto('/');

    // Wait for the page to be fully loaded (network idle)
    await page.waitForLoadState('networkidle');

    // Close any modals that might appear
    await closeModals(page);

    // Wait for React Flow to be ready
    await waitForReactFlow(page);

    await use(page);
  },
});

export { expect };

/**
 * Helper to wait for React Flow in existing tests.
 * Use this in beforeEach if not using the reactFlowPage fixture.
 */
export async function setupReactFlowPage(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await closeModals(page);
  await waitForReactFlow(page);
}
