import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import type { ReactNode } from 'react';

// Wrapper with MantineProvider
function TestWrapper({ children }: { children: ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>;
}

function renderWithMantine(ui: ReactNode) {
  return render(ui, { wrapper: TestWrapper });
}

// Component that throws an error
function ThrowError({ shouldThrow, message }: { shouldThrow: boolean; message?: string }) {
  if (shouldThrow) {
    throw new Error(message || 'Test error');
  }
  return <div data-testid="child">Child content</div>;
}

describe('ErrorBoundary', () => {
  // Suppress React error boundary console.error in tests
  const originalConsoleError = console.error;
  const originalLocation = globalThis.location;

  beforeEach(() => {
    console.error = vi.fn();
    // Mock location.reload
    delete (globalThis as { location?: Location }).location;
    globalThis.location = {
      ...originalLocation,
      reload: vi.fn(),
    } as unknown as Location;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    globalThis.location = originalLocation;
  });

  describe('when no error occurs', () => {
    it('should render children normally', () => {
      renderWithMantine(
        <ErrorBoundary>
          <div data-testid="child">Hello World</div>
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  describe('when an error occurs', () => {
    it('should catch errors and display fallback UI', () => {
      renderWithMantine(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should display error message', () => {
      renderWithMantine(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Custom error message" />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should provide try again button', () => {
      renderWithMantine(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should provide reload page button', () => {
      renderWithMantine(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });

    it('should reset error state when try again is clicked', () => {
      const { rerender } = renderWithMantine(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Click try again button
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      // Rerender with non-throwing component
      rerender(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should reload page when reload button is clicked', () => {
      renderWithMantine(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      fireEvent.click(reloadButton);

      expect(globalThis.location.reload).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;

      renderWithMantine(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('error logging', () => {
    it('should log error to console', () => {
      renderWithMantine(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.anything(),
      );
    });
  });
});
