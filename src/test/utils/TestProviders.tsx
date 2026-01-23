import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';
import { theme } from '../../theme';

interface TestProvidersProps {
  readonly children: ReactNode;
}

/**
 * Test wrapper component that provides all necessary providers for testing.
 * Use this as a wrapper when rendering components in tests.
 *
 * @example
 * ```tsx
 * import { render } from '@testing-library/react';
 * import { TestProviders } from '@/test/utils/TestProviders';
 *
 * render(<MyComponent />, { wrapper: TestProviders });
 * ```
 */
export function TestProviders({ children }: TestProvidersProps): ReactNode {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <ModalsProvider>
        <Notifications position="bottom-left" />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}

/**
 * Test wrapper component without notifications (for simpler tests).
 */
export function TestProvidersMinimal({ children }: TestProvidersProps): ReactNode {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
