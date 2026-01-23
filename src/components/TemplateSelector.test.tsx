import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECT_TEMPLATES } from '../data/templates';
import { useEntityStore } from '../store/entityStore';
import { createMockEntity } from '../test/factories';
import { resetAllStores, TestProviders } from '../test/utils';
import { TemplateSelector } from './TemplateSelector';

// Mock modals - use importOriginal to keep ModalsProvider working
vi.mock('@mantine/modals', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/modals')>();
  return {
    ...actual,
    modals: {
      openConfirmModal: vi.fn(({ onConfirm }) => {
        // Simulate user clicking confirm
        onConfirm?.();
      }),
    },
  };
});

describe('TemplateSelector', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when opened', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByText('Choose a Template')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={false} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.queryByText('Choose a Template')).not.toBeInTheDocument();
    });

    it('should render all templates', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      for (const template of PROJECT_TEMPLATES) {
        expect(screen.getByText(template.name)).toBeInTheDocument();
      }
    });

    it('should render template descriptions', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      for (const template of PROJECT_TEMPLATES) {
        expect(screen.getByText(template.description)).toBeInTheDocument();
      }
    });

    it('should show entity count for templates with entities', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // E-commerce template has entities
      const ecommerceTemplate = PROJECT_TEMPLATES.find((t) => t.id === 'ecommerce');
      if (ecommerceTemplate && ecommerceTemplate.entities.length > 0) {
        expect(
          screen.getByText(`${ecommerceTemplate.entities.length} entities`),
        ).toBeInTheDocument();
      }
    });
  });

  describe('Template Selection', () => {
    it('should apply blank template and close modal', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Find and click the Blank Project template
      const blankCard = screen.getByRole('button', { name: /blank project/i });
      await user.click(blankCard);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      expect(useEntityStore.getState().entities).toHaveLength(0);
    });

    it('should apply ecommerce template', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const ecommerceCard = screen.getByRole('button', { name: /e-commerce/i });
      await user.click(ecommerceCard);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // E-commerce template should have entities
      expect(useEntityStore.getState().entities.length).toBeGreaterThan(0);
    });

    it('should show confirmation when entities exist', async () => {
      const user = userEvent.setup();
      const { modals } = await import('@mantine/modals');

      // Add an entity first
      useEntityStore.setState({
        entities: [createMockEntity({ name: 'ExistingEntity' })],
      });

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const blankCard = screen.getByRole('button', { name: /blank project/i });
      await user.click(blankCard);

      expect(modals.openConfirmModal).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Replace Current Project',
        }),
      );
    });
  });

  describe('Accessibility', () => {
    it('should have accessible template cards', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const cards = screen.getAllByRole('button');
      // Each template card should be a button
      expect(cards.length).toBeGreaterThanOrEqual(PROJECT_TEMPLATES.length);
    });

    it('should have close button with aria-label', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation on cards', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const blankCard = screen.getByRole('button', { name: /blank project/i });
      blankCard.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const closeBtn = screen.getByRole('button', { name: /close/i });
      await user.click(closeBtn);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
