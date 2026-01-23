import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntityStore } from '../store/entityStore';
import { createMockEntity } from '../test/factories';
import { resetAllStores, TestProviders } from '../test/utils';
import { SqlImportExport } from './SqlImportExport';

// Mock modals
vi.mock('@mantine/modals', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/modals')>();
  return {
    ...actual,
    modals: {
      openConfirmModal: vi.fn(({ onConfirm }) => {
        onConfirm?.();
      }),
    },
  };
});

// Mock notifications
vi.mock('../utils/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('SqlImportExport', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when opened', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByText('SQL Import / Export')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={false} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.queryByText('SQL Import / Export')).not.toBeInTheDocument();
    });

    it('should render export and import tabs', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('tab', { name: /export sql/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /import sql/i })).toBeInTheDocument();
    });

    it('should show export tab by default', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('tab', { name: /export sql/i })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });

  describe('Export Tab', () => {
    it('should show entity count text', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Shows 0 entities when empty
      expect(screen.getByText(/0 entities/)).toBeInTheDocument();
    });

    it('should show entity count when entities exist', () => {
      useEntityStore.setState({
        entities: [createMockEntity({ name: 'User' }), createMockEntity({ name: 'Product' })],
      });

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByText(/2 entities/)).toBeInTheDocument();
    });

    it('should have download button disabled when no entities', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const downloadBtn = screen.getByRole('button', { name: /download/i });
      expect(downloadBtn).toBeDisabled();
    });

    it('should have download button enabled when entities exist', () => {
      useEntityStore.setState({
        entities: [createMockEntity({ name: 'User' })],
      });

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const downloadBtn = screen.getByRole('button', { name: /download/i });
      expect(downloadBtn).not.toBeDisabled();
    });

    it('should show copy and download actions', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Check that download button exists
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });
  });

  describe('Import Tab', () => {
    it('should switch to import tab when clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('tab', { name: /import sql/i }));

      expect(screen.getByRole('tab', { name: /import sql/i })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('should show dropzone in import tab', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('tab', { name: /import sql/i }));

      expect(screen.getByText(/drag sql file here/i)).toBeInTheDocument();
    });

    it('should show textarea for pasting SQL', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('tab', { name: /import sql/i }));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should have import button disabled when no SQL entered', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('tab', { name: /import sql/i }));

      const importBtn = screen.getByRole('button', { name: /import sql/i });
      expect(importBtn).toBeDisabled();
    });

    it('should enable import button when SQL is entered', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('tab', { name: /import sql/i }));

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'CREATE TABLE users (id BIGSERIAL PRIMARY KEY);');

      const importBtn = screen.getByRole('button', { name: /import sql/i });
      expect(importBtn).not.toBeDisabled();
    });

    it('should show error when trying to import invalid SQL', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('tab', { name: /import sql/i }));

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'SELECT * FROM users;');

      await user.click(screen.getByRole('button', { name: /import sql/i }));

      await waitFor(() => {
        expect(screen.getByText(/no valid create table statements/i)).toBeInTheDocument();
      });
    });

    it('should show clear button when SQL is entered', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('tab', { name: /import sql/i }));

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'CREATE TABLE test (id INT);');

      // Clear button should appear when SQL is entered
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('tab', { name: /import sql/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('button', { name: /close/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have close button with aria-label', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should have properly labeled tabs', () => {
      render(
        <TestProviders>
          <SqlImportExport opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const exportTab = screen.getByRole('tab', { name: /export sql/i });
      const importTab = screen.getByRole('tab', { name: /import sql/i });

      expect(exportTab).toHaveAttribute('aria-selected');
      expect(importTab).toHaveAttribute('aria-selected');
    });
  });
});
