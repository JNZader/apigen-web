import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SectionErrorBoundary } from './SectionErrorBoundary';
import type { ReactNode } from 'react';

// Wrapper with MantineProvider
function TestWrapper({ children }: { children: ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>;
}

function renderWithMantine(ui: ReactNode) {
  return render(ui, { wrapper: TestWrapper });
}

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div data-testid="child">Child content</div>;
}

describe('SectionErrorBoundary', () => {
  // Suppress React error boundary console.error in tests
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('when no error occurs', () => {
    it('should render children normally', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Test Section">
          <div data-testid="child">Hello World</div>
        </SectionErrorBoundary>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  describe('when an error occurs', () => {
    it('should catch errors and display fallback UI', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Test Section">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
      // Check for the alert role which indicates the error UI is displayed
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should display section name in error message', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Canvas">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      // Check for section name in the title
      expect(screen.getByText('Canvas Error')).toBeInTheDocument();
    });

    it('should display error message', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Test">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should call onError callback when provided', () => {
      const onError = vi.fn();

      renderWithMantine(
        <SectionErrorBoundary section="Test" onError={onError}>
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        }),
      );
    });

    it('should allow retry after error', () => {
      const { rerender } = renderWithMantine(
        <SectionErrorBoundary section="Test">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Rerender with non-throwing component
      rerender(
        <TestWrapper>
          <SectionErrorBoundary section="Test">
            <ThrowError shouldThrow={false} />
          </SectionErrorBoundary>
        </TestWrapper>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('variant rendering', () => {
    it('should render inline variant with minimal UI', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Sidebar" variant="inline">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      // Inline variant has text "Error loading"
      expect(screen.getByText(/error loading sidebar/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should render panel variant for sidebars', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Details" variant="panel">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      expect(screen.getByText(/failed to load details/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should render modal variant for dialogs', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Form" variant="modal">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      expect(screen.getByText(/error in form/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should render full variant by default', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Main Content">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      expect(screen.getByText(/main content error/i)).toBeInTheDocument();
      expect(screen.getByText(/other parts of the app/i)).toBeInTheDocument();
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;

      renderWithMantine(
        <SectionErrorBoundary section="Test" fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });
  });

  describe('error logging', () => {
    it('should log error with section name to console', () => {
      renderWithMantine(
        <SectionErrorBoundary section="Canvas">
          <ThrowError shouldThrow={true} />
        </SectionErrorBoundary>,
      );

      expect(console.error).toHaveBeenCalledWith(
        '[Canvas] Error:',
        expect.any(Error),
        expect.anything(),
      );
    });
  });
});
