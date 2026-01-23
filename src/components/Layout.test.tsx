import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetAllStores, TestProviders } from '../test/utils';
import { Layout } from './Layout';

// Mock lazy-loaded components
vi.mock('./ProjectSettings', () => ({
  ProjectSettings: ({ opened, onClose }: { opened: boolean; onClose: () => void }) =>
    opened ? (
      <div data-testid="project-settings">
        <button type="button" onClick={onClose}>
          Close Settings
        </button>
      </div>
    ) : null,
}));

vi.mock('./TemplateSelector', () => ({
  TemplateSelector: ({ opened, onClose }: { opened: boolean; onClose: () => void }) =>
    opened ? (
      <div data-testid="template-selector">
        <button type="button" onClick={onClose}>
          Close Templates
        </button>
      </div>
    ) : null,
}));

vi.mock('./SqlImportExport', () => ({
  SqlImportExport: ({ opened, onClose }: { opened: boolean; onClose: () => void }) =>
    opened ? (
      <div data-testid="sql-import-export">
        <button type="button" onClick={onClose}>
          Close SQL
        </button>
      </div>
    ) : null,
}));

vi.mock('./Onboarding', () => ({
  Onboarding: () => null,
}));

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('Layout', () => {
  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render children content', () => {
      render(
        <TestProviders>
          <Layout>
            <div data-testid="child-content">Test Content</div>
          </Layout>
        </TestProviders>,
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should render header with title', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByText('APiGen Studio')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    it('should render sidebar when provided', () => {
      render(
        <TestProviders>
          <Layout sidebar={<div data-testid="sidebar">Sidebar</div>}>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should show entity/relation count', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByText(/0 entities, 0 relations/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have skip to main content link', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('should have main content with proper id', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      const main = document.getElementById('main-content');
      expect(main).toBeInTheDocument();
    });

    it('should have hidden h1 for screen readers', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByRole('heading', { level: 1, hidden: true })).toHaveTextContent(
        'APiGen Studio - Entity Designer',
      );
    });
  });

  describe('Theme Toggle', () => {
    it('should have theme toggle button', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByLabelText(/switch to (dark|light) mode/i)).toBeInTheDocument();
    });
  });

  describe('Undo/Redo', () => {
    it('should have undo button disabled when no history', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      const undoBtn = screen.getByLabelText(/undo last action/i);
      expect(undoBtn).toBeDisabled();
    });

    it('should have redo button disabled when no history', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      const redoBtn = screen.getByLabelText(/redo last undone action/i);
      expect(redoBtn).toBeDisabled();
    });
  });

  describe('Sidebar Toggle', () => {
    it('should toggle sidebar when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <Layout sidebar={<div>Sidebar Content</div>}>Content</Layout>
        </TestProviders>,
      );

      const toggleBtn = screen.getByLabelText(/hide sidebar/i);
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByLabelText(/show sidebar/i)).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Action Buttons', () => {
    it('should have project settings button', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByLabelText(/open project settings/i)).toBeInTheDocument();
    });

    it('should have SQL import/export button', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByLabelText(/open sql import and export/i)).toBeInTheDocument();
    });

    it('should have import JSON button', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByLabelText(/import project design from json file/i)).toBeInTheDocument();
    });

    it('should have export JSON button', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByLabelText(/export project design to json file/i)).toBeInTheDocument();
    });

    it('should have generate project button', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByLabelText(/generate and download project/i)).toBeInTheDocument();
    });

    it('should have reset project button', () => {
      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      expect(screen.getByLabelText(/reset project and delete all entities/i)).toBeInTheDocument();
    });
  });

  describe('Modal Opening', () => {
    it('should open project settings when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      await user.click(screen.getByLabelText(/open project settings/i));

      await waitFor(() => {
        expect(screen.getByTestId('project-settings')).toBeInTheDocument();
      });
    });

    it('should open SQL import/export when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <Layout>Content</Layout>
        </TestProviders>,
      );

      await user.click(screen.getByLabelText(/open sql import and export/i));

      await waitFor(() => {
        expect(screen.getByTestId('sql-import-export')).toBeInTheDocument();
      });
    });
  });
});
