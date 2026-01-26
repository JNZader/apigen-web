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

    it('should render search input', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('textbox', { name: /search templates/i })).toBeInTheDocument();
    });

    it('should render category filter', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('radio', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /starter/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /full-stack/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /microservice/i })).toBeInTheDocument();
    });

    it('should display category badges on templates', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getAllByText('starter').length).toBeGreaterThan(0);
      expect(screen.getAllByText('full-stack').length).toBeGreaterThan(0);
      expect(screen.getAllByText('microservice').length).toBeGreaterThan(0);
    });

    it('should display tags on templates', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Check for some common tags
      expect(screen.getAllByText('blog').length).toBeGreaterThan(0);
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

      const searchInput = screen.getByRole('textbox', { name: /search templates/i });
      await user.type(searchInput, 'blog');

      await waitFor(() => {
        expect(screen.getByText('Blog API')).toBeInTheDocument();
        expect(screen.queryByText('E-Commerce API')).not.toBeInTheDocument();
      });
    });

    it('should filter templates by category', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const microserviceRadio = screen.getByRole('radio', { name: /microservice/i });
      await user.click(microserviceRadio);

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.queryByText('Blog API')).not.toBeInTheDocument();
      });
    });

    it('should show no results message when no templates match', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByRole('textbox', { name: /search templates/i });
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

      const searchInput = screen.getByRole('textbox', { name: /search templates/i });
      await user.type(searchInput, 'blog');

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
      expect(screen.getByText('E-Commerce API')).toBeInTheDocument();
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

    it('should apply user management template', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const userManagementCard = screen.getByRole('button', { name: /user management/i });
      await user.click(userManagementCard);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // User management template should have entities
      const entities = useEntityStore.getState().entities;
      expect(entities.length).toBeGreaterThan(0);
      expect(entities.some((e) => e.name === 'User')).toBe(true);
      expect(entities.some((e) => e.name === 'Role')).toBe(true);
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
      // Each template card should be a button plus close button and use template buttons
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

    it('should have accessible search input', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const searchInput = screen.getByRole('textbox', { name: /search templates/i });
      expect(searchInput).toBeInTheDocument();
    });

    it('should have accessible category filter', () => {
      render(
        <TestProviders>
          <TemplateSelector opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('radiogroup', { name: /filter by category/i })).toBeInTheDocument();
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
