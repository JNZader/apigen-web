import { type RenderOptions, type RenderResult, render as rtlRender } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { TestProviders, TestProvidersMinimal } from './TestProviders';

/**
 * Extended render options for custom render function.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Whether to use minimal providers (no notifications/modals). Default: false */
  minimal?: boolean;
}

/**
 * Custom render function that wraps components with test providers.
 * Use this instead of the default render from @testing-library/react.
 *
 * @example
 * ```tsx
 * import { render, screen } from '@/test/utils';
 *
 * render(<MyComponent />);
 * expect(screen.getByText('Hello')).toBeInTheDocument();
 * ```
 *
 * @example
 * ```tsx
 * // Use minimal providers for simpler tests
 * render(<MyComponent />, { minimal: true });
 * ```
 */
export function render(ui: ReactElement, options: CustomRenderOptions = {}): RenderResult {
  const { minimal = false, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    if (minimal) {
      return <TestProvidersMinimal>{children}</TestProvidersMinimal>;
    }
    return <TestProviders>{children}</TestProviders>;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export specific utilities from @testing-library/react (excluding render to avoid conflict)
export {
  act,
  cleanup,
  fireEvent,
  type RenderResult,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
