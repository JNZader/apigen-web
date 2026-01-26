import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECT_TEMPLATES, TEMPLATE_CATEGORIES } from '../data/templates';
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

      // Find a template with entities
      const templateWithEntities = PROJECT_TEMPLATES.find((t) => t.entities.length > 0);
      if (templateWithEntities) {
        const entityBadges = screen.getAllByText(
          `${templateWithEntities.entities.length} entities`,
        );
        expect(entityBadges.length).toBeGreaterThan(0);
      }
    });

    it('should render search input', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByLabelText('Search templates')).toBeInTheDocument();
    });

    it('should render category filter', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('should display category badges on templates', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Check that at least one category badge is displayed
      expect(screen.getAllByText('starter').length).toBeGreaterThan(0);
    });

    it('should display tags on templates', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Check for some common tags from templates
      const templateWithTags = PROJECT_TEMPLATES.find((t) => t.tags.length > 0);
      if (templateWithTags) {
        expect(screen.getByText(templateWithTags.tags[0])).toBeInTheDocument();
      }
    });
  });

  describe('Search and Filter', () => {
    it('should filter templates by search term', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByLabelText('Search templates');
      await user.type(searchInput, 'blank');

      await waitFor(() => {
        expect(screen.getByText('Blank Project')).toBeInTheDocument();
      });
    });

    it('should filter templates by category', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Click on a category
      const starterCategory = TEMPLATE_CATEGORIES.find((c) => c.value === 'starter');
      if (starterCategory) {
        await user.click(screen.getByText(starterCategory.label));

        await waitFor(() => {
          expect(screen.getByText('Blank Project')).toBeInTheDocument();
        });
      }
    });

    it('should show no results message when no templates match', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByLabelText('Search templates');
      await user.type(searchInput, 'nonexistent12345');

      await waitFor(() => {
        expect(screen.getByText(/no templates match/i)).toBeInTheDocument();
      });
    });

    it('should reset filters when modal is closed', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByLabelText('Search templates');
      await user.type(searchInput, 'nonexistent');

      // Close and reopen modal
      rerender(
        <TestProviders>
          <TemplateSelector opened={false} onClose={mockOnClose} />
        </TestProviders>,
      );

      rerender(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // All templates should be visible again
      expect(screen.getByText('Blank Project')).toBeInTheDocument();
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

      // Find and click the Blank Project template card
      const buttons = screen.getAllByRole('button');
      const blankCard = buttons.find((btn) =>
        btn.getAttribute('aria-label')?.includes('Blank Project'),
      );

      if (blankCard) {
        await user.click(blankCard);
      }

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      expect(useEntityStore.getState().entities).toHaveLength(0);
    });

    it('should apply template with entities', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Find and click a template that has entities
      const templateWithEntities = PROJECT_TEMPLATES.find((t) => t.entities.length > 0);
      if (templateWithEntities) {
        const buttons = screen.getAllByRole('button');
        const templateCard = buttons.find((btn) =>
          btn.getAttribute('aria-label')?.includes(templateWithEntities.name),
        );

        if (templateCard) {
          await user.click(templateCard);
        }

        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });

        // Template should have entities
        expect(useEntityStore.getState().entities.length).toBeGreaterThan(0);
      }
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

      const buttons = screen.getAllByRole('button');
      const blankCard = buttons.find((btn) =>
        btn.getAttribute('aria-label')?.includes('Blank Project'),
      );

      if (blankCard) {
        await user.click(blankCard);
      }

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

      const buttons = screen.getAllByRole('button');
      // Each template card should be a button with aria-label
      const cardButtons = buttons.filter((btn) =>
        btn.getAttribute('aria-label')?.includes('template'),
      );
      expect(cardButtons.length).toBeGreaterThan(0);
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

      const buttons = screen.getAllByRole('button');
      const blankCard = buttons.find((btn) =>
        btn.getAttribute('aria-label')?.includes('Blank Project'),
      );

      if (blankCard) {
        blankCard.focus();
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
      }
    });

    it('should have accessible search input', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByLabelText('Search templates');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have accessible category filter', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
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
