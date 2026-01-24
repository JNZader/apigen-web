import { defineConfig, devices } from '@playwright/experimental-ct-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.ct.tsx',
  snapshotDir: './__snapshots__',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
          '@components': resolve(__dirname, 'src/components'),
          '@hooks': resolve(__dirname, 'src/hooks'),
          '@store': resolve(__dirname, 'src/store'),
          '@types': resolve(__dirname, 'src/types'),
          '@utils': resolve(__dirname, 'src/utils'),
          '@api': resolve(__dirname, 'src/api'),
        },
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
