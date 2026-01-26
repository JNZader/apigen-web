import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECT_TEMPLATES, TEMPLATE_CATEGORIES } from '../../config/projectTemplates';
import { resetAllStores, TestProviders } from '../../test/utils';
import { TemplateSelector } from './TemplateSelector';

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

    it('should render template names', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByText('Blank Project')).toBeInTheDocument();
    });

    it('should render template descriptions', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const blankTemplate = PROJECT_TEMPLATES.find((t) => t.id === 'blank');
      if (blankTemplate) {
        expect(screen.getByText(blankTemplate.description)).toBeInTheDocument();
      }
    });

    it('should render search input', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByLabelText('Search templates')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
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

    it('should show entity count for templates with entities', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const templateWithEntities = PROJECT_TEMPLATES.find((t) => t.entities.length > 0);
      if (templateWithEntities) {
        const entityBadges = screen.getAllByText(
          `${templateWithEntities.entities.length} entities`,
        );
        expect(entityBadges.length).toBeGreaterThan(0);
      }
    });

    it('should show relation count for templates with relations', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const templateWithRelations = PROJECT_TEMPLATES.find((t) => t.relations.length > 0);
      if (templateWithRelations) {
        const relationBadges = screen.getAllByText(
          `${templateWithRelations.relations.length} relations`,
        );
        expect(relationBadges.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Search Functionality', () => {
    it('should filter templates by name', async () => {
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

    it('should be case insensitive', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByLabelText('Search templates');
      await user.type(searchInput, 'BLANK');

      await waitFor(() => {
        expect(screen.getByText('Blank Project')).toBeInTheDocument();
      });
    });

    it('should show no results message when search returns empty', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByLabelText('Search templates');
      await user.type(searchInput, 'nonexistenttemplate12345');

      await waitFor(() => {
        expect(screen.getByText('No templates match your search criteria.')).toBeInTheDocument();
      });
    });

    it('should clear filter when search is cleared', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByLabelText('Search templates');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No templates match your search criteria.')).toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Blank Project')).toBeInTheDocument();
      });
    });
  });

  describe('Category Filter', () => {
    it('should filter by category when selected', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Click on a category
      const starterCategory = TEMPLATE_CATEGORIES.find((c) => c.value === 'starter');
      if (starterCategory) {
        const categoryLabel = screen.getByText(starterCategory.label);
        await user.click(categoryLabel);

        await waitFor(() => {
          // Blank Project should be visible (it's a starter template)
          expect(screen.getByText('Blank Project')).toBeInTheDocument();
        });
      }
    });

    it('should show all templates when All is selected', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Click on a category first
      const starterCategory = TEMPLATE_CATEGORIES.find((c) => c.value === 'starter');
      if (starterCategory) {
        await user.click(screen.getByText(starterCategory.label));
      }

      // Then click All
      await user.click(screen.getByText('All'));

      await waitFor(() => {
        expect(screen.getByText('Blank Project')).toBeInTheDocument();
      });
    });
  });

  describe('Template Selection', () => {
    it('should call onClose when selecting a template', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Click on Use Template button for blank project
      const useTemplateButtons = screen.getAllByText('Use Template');
      await user.click(useTemplateButtons[0]);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should have accessible template cards', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Cards have role="button" and aria-label
      const buttons = screen.getAllByRole('button');
      const cardButtons = buttons.filter((btn) =>
        btn.getAttribute('aria-label')?.includes('template'),
      );
      expect(cardButtons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation with Enter', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Find a card with role="button"
      const buttons = screen.getAllByRole('button');
      const cardButton = buttons.find((btn) =>
        btn.getAttribute('aria-label')?.includes('template'),
      );

      if (cardButton) {
        cardButton.focus();
        await user.keyboard('{Enter}');

        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Visual Elements', () => {
    it('should display category badge', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Check that category badges are displayed
      expect(screen.getAllByText('starter').length).toBeGreaterThan(0);
    });

    it('should display template tags', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Check for some common tags from templates
      const blankTemplate = PROJECT_TEMPLATES.find((t) => t.id === 'blank');
      if (blankTemplate && blankTemplate.tags.length > 0) {
        expect(screen.getByText(blankTemplate.tags[0])).toBeInTheDocument();
      }
    });

    it('should limit displayed tags to 4', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const templateWithManyTags = PROJECT_TEMPLATES.find((t) => t.tags.length > 4);
      if (templateWithManyTags) {
        // The component shows +N more text for extra tags
        // Multiple templates may show the same "+N more" text
        const moreTagsElements = screen.queryAllByText(
          `+${templateWithManyTags.tags.length - 4} more`,
        );
        expect(moreTagsElements.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Modal Behavior', () => {
    it('should render as a modal dialog', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have close button', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
