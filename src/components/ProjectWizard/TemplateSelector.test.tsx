import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECT_TEMPLATES } from '../../config/projectTemplates';
import { resetAllStores, TestProviders } from '../../test/utils';
import { TemplateSelector } from './TemplateSelector';

describe('TemplateSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all templates', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      for (const template of PROJECT_TEMPLATES) {
        expect(screen.getByTestId(`template-card-${template.id}`)).toBeInTheDocument();
      }
    });

    it('should render template names', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      expect(screen.getByText('Blank Project')).toBeInTheDocument();
      expect(screen.getByText('Blog API')).toBeInTheDocument();
      expect(screen.getByText('E-Commerce API')).toBeInTheDocument();
    });

    it('should render template descriptions', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      expect(screen.getByText('Start from scratch with an empty project')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      expect(screen.getByTestId('template-search-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
    });

    it('should render category tabs', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      expect(screen.getByTestId('category-tab-all')).toBeInTheDocument();
      expect(screen.getByTestId('category-tab-starter')).toBeInTheDocument();
      expect(screen.getByTestId('category-tab-full-stack')).toBeInTheDocument();
      expect(screen.getByTestId('category-tab-enterprise')).toBeInTheDocument();
    });

    it('should show entity count for templates with entities', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const ecommerceTemplate = PROJECT_TEMPLATES.find((t) => t.id === 'ecommerce-api');
      if (ecommerceTemplate && ecommerceTemplate.entities.length > 0) {
        const card = screen.getByTestId(`template-card-${ecommerceTemplate.id}`);
        expect(card).toHaveTextContent(`${ecommerceTemplate.entities.length} entities`);
      }
    });

    it('should show feature count for templates with features', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const ecommerceTemplate = PROJECT_TEMPLATES.find((t) => t.id === 'ecommerce-api');
      if (ecommerceTemplate && ecommerceTemplate.features.length > 0) {
        const card = screen.getByTestId(`template-card-${ecommerceTemplate.id}`);
        expect(card).toHaveTextContent(`${ecommerceTemplate.features.length} features`);
      }
    });
  });

  describe('Search Functionality', () => {
    it('should filter templates by name', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const searchInput = screen.getByTestId('template-search-input');
      await user.type(searchInput, 'blog');

      await waitFor(() => {
        expect(screen.getByText('Blog API')).toBeInTheDocument();
        expect(screen.queryByText('E-Commerce API')).not.toBeInTheDocument();
      });
    });

    it('should filter templates by description', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const searchInput = screen.getByTestId('template-search-input');
      await user.type(searchInput, 'scratch');

      await waitFor(() => {
        expect(screen.getByText('Blank Project')).toBeInTheDocument();
        expect(screen.queryByText('Blog API')).not.toBeInTheDocument();
      });
    });

    it('should filter templates by tags', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const searchInput = screen.getByTestId('template-search-input');
      await user.type(searchInput, 'ecommerce');

      await waitFor(() => {
        expect(screen.getByText('E-Commerce API')).toBeInTheDocument();
        expect(screen.queryByText('Blog API')).not.toBeInTheDocument();
      });
    });

    it('should show no results message when search returns empty', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const searchInput = screen.getByTestId('template-search-input');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByTestId('no-templates-message')).toBeInTheDocument();
        expect(screen.getByText('No templates found matching your search')).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const searchInput = screen.getByTestId('template-search-input');
      await user.type(searchInput, 'BLOG');

      await waitFor(() => {
        expect(screen.getByText('Blog API')).toBeInTheDocument();
      });
    });

    it('should clear filter when search is cleared', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const searchInput = screen.getByTestId('template-search-input');
      await user.type(searchInput, 'blog');

      await waitFor(() => {
        expect(screen.queryByText('E-Commerce API')).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Blog API')).toBeInTheDocument();
        expect(screen.getByText('E-Commerce API')).toBeInTheDocument();
      });
    });
  });

  describe('Category Filter', () => {
    it('should filter by Starter category', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      await user.click(screen.getByTestId('category-tab-starter'));

      await waitFor(() => {
        expect(screen.getByText('Blank Project')).toBeInTheDocument();
        expect(screen.getByText('Blog API')).toBeInTheDocument();
        expect(screen.queryByText('SaaS Starter')).not.toBeInTheDocument();
      });
    });

    it('should filter by Full Stack category', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      await user.click(screen.getByTestId('category-tab-full-stack'));

      await waitFor(() => {
        expect(screen.getByText('E-Commerce API')).toBeInTheDocument();
        expect(screen.queryByText('Blank Project')).not.toBeInTheDocument();
      });
    });

    it('should filter by Enterprise category', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      await user.click(screen.getByTestId('category-tab-enterprise'));

      await waitFor(() => {
        expect(screen.getByText('SaaS Starter')).toBeInTheDocument();
        expect(screen.queryByText('Blog API')).not.toBeInTheDocument();
      });
    });

    it('should show all templates when All tab is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      await user.click(screen.getByTestId('category-tab-starter'));

      await waitFor(() => {
        expect(screen.queryByText('SaaS Starter')).not.toBeInTheDocument();
      });

      await user.click(screen.getByTestId('category-tab-all'));

      await waitFor(() => {
        expect(screen.getByText('SaaS Starter')).toBeInTheDocument();
        expect(screen.getByText('Blog API')).toBeInTheDocument();
      });
    });

    it('should combine search and category filter', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      await user.click(screen.getByTestId('category-tab-starter'));
      const searchInput = screen.getByTestId('template-search-input');
      await user.type(searchInput, 'blog');

      await waitFor(() => {
        expect(screen.getByText('Blog API')).toBeInTheDocument();
        expect(screen.queryByText('Blank Project')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('should show selected state', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId="blog-api" onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const blogCard = screen.getByTestId('template-card-blog-api');
      expect(blogCard).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('selected-badge')).toBeInTheDocument();
    });

    it('should not show selected badge when not selected', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      expect(screen.queryByTestId('selected-badge')).not.toBeInTheDocument();
    });

    it('should call onSelect when clicking a template', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      await user.click(screen.getByTestId('template-card-blog-api'));

      expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'blog-api' }));
    });

    it('should pass full template object to onSelect', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      await user.click(screen.getByTestId('template-card-ecommerce-api'));

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ecommerce-api',
          name: 'E-Commerce API',
          category: 'full-stack',
        }),
      );
    });
  });

  describe('Accessibility', () => {
    it('should have accessible template cards', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      for (const template of PROJECT_TEMPLATES) {
        const card = screen.getByTestId(`template-card-${template.id}`);
        expect(card).toHaveAttribute('role', 'button');
        expect(card).toHaveAttribute('tabIndex', '0');
        expect(card).toHaveAttribute('aria-label');
      }
    });

    it('should have aria-pressed on template cards', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId="blog-api" onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const blogCard = screen.getByTestId('template-card-blog-api');
      expect(blogCard).toHaveAttribute('aria-pressed', 'true');

      const blankCard = screen.getByTestId('template-card-blank');
      expect(blankCard).toHaveAttribute('aria-pressed', 'false');
    });

    it('should support keyboard navigation with Enter', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const blogCard = screen.getByTestId('template-card-blog-api');
      blogCard.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'blog-api' }));
    });

    it('should support keyboard navigation with Space', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const blankCard = screen.getByTestId('template-card-blank');
      blankCard.focus();
      await user.keyboard(' ');

      expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'blank' }));
    });
  });

  describe('Visual Elements', () => {
    it('should display category badge', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      expect(screen.getAllByText('Starter').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Full Stack').length).toBeGreaterThan(0);
    });

    it('should display template tags', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      expect(screen.getByText('minimal')).toBeInTheDocument();
      expect(screen.getByText('blog')).toBeInTheDocument();
    });

    it('should limit displayed tags to 3', () => {
      render(
        <TestProviders>
          <TemplateSelector selectedId={null} onSelect={mockOnSelect} />
        </TestProviders>,
      );

      const ecommerceTemplate = PROJECT_TEMPLATES.find((t) => t.id === 'ecommerce-api');
      if (ecommerceTemplate && ecommerceTemplate.tags.length > 3) {
        const card = screen.getByTestId('template-card-ecommerce-api');
        const tagBadges = card.querySelectorAll('[class*="Badge"]');
        const tagTexts = Array.from(tagBadges)
          .map((b) => b.textContent)
          .filter((t) => ecommerceTemplate.tags.includes(t as string));
        expect(tagTexts.length).toBeLessThanOrEqual(3);
      }
    });
  });
});
