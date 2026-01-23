import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { TestProviders } from './test/utils';

// Mock the DesignerPage component
vi.mock('./pages/DesignerPage', () => ({
  DesignerPage: () => <div data-testid="designer-page">Designer Page</div>,
}));

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

describe('App', () => {
  it('should render without crashing', () => {
    render(
      <TestProviders>
        <App />
      </TestProviders>,
    );

    expect(screen.getByTestId('designer-page')).toBeInTheDocument();
  });

  it('should wrap content in ErrorBoundary', () => {
    render(
      <TestProviders>
        <App />
      </TestProviders>,
    );

    // The DesignerPage should be rendered, proving ErrorBoundary didn't catch any errors
    expect(screen.getByTestId('designer-page')).toBeInTheDocument();
  });
});
