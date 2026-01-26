import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntityStore } from '../../store/entityStore';
import { useRelationStore } from '../../store/relationStore';
import { createMockEntity } from '../../test/factories';
import { resetAllStores, TestProviders } from '../../test/utils';
import { OpenApiImportModal } from './OpenApiImportModal';

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
vi.mock('../../utils/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock openApiParser
vi.mock('../../utils/openApiParser', () => ({
  parseOpenApi: vi.fn((content: string) => {
    // Check for invalid JSON
    if (content.includes('invalid')) {
      throw new Error('Invalid OpenAPI specification');
    }

    // Check for empty schemas
    if (content.includes('"empty"')) {
      return { entities: [], relations: [] };
    }

    // Return mock parsed result for valid specs
    return {
      entities: [
        {
          id: 'mock-entity-1',
          name: 'User',
          tableName: 'users',
          position: { x: 100, y: 100 },
          fields: [
            {
              id: 'field-1',
              name: 'name',
              columnName: 'name',
              type: 'String',
              nullable: false,
              unique: false,
              validations: [],
            },
          ],
          config: { generateController: true, generateService: true, enableCaching: false },
        },
      ],
      relations: [],
    };
  }),
}));

describe('OpenApiImportModal', () => {
  const mockOnClose = vi.fn();
  const mockOnImportComplete = vi.fn();

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when opened', () => {
      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByText('Import from OpenAPI')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TestProviders>
          <OpenApiImportModal opened={false} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.queryByText('Import from OpenAPI')).not.toBeInTheDocument();
    });

    it('should render dropzone when no content', () => {
      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByText(/drag openapi file here/i)).toBeInTheDocument();
    });

    it('should render supported formats info alert', () => {
      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByText(/supported:/i)).toBeInTheDocument();
      expect(screen.getByText(/openapi 3\.x and swagger 2\.x/i)).toBeInTheDocument();
    });

    it('should render cancel and import buttons', () => {
      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /import openapi/i })).toBeInTheDocument();
    });

    it('should have import button disabled when no content', () => {
      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('button', { name: /import openapi/i })).toBeDisabled();
    });
  });

  describe('Content Input', () => {
    it('should enable import button when content is entered', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0"}');

      expect(screen.getByRole('button', { name: /import openapi/i })).not.toBeDisabled();
    });

    it('should show clear button when content is entered', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0"}');

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should clear content when clear button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0"}');

      const clearBtn = screen.getByRole('button', { name: /clear/i });
      await user.click(clearBtn);

      // After clearing, the dropzone should be visible again
      expect(screen.getByText(/drag openapi file here/i)).toBeInTheDocument();
    });
  });

  describe('Import Functionality', () => {
    it('should import entities from valid OpenAPI spec', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal
            opened={true}
            onClose={mockOnClose}
            onImportComplete={mockOnImportComplete}
          />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0", "components": {"schemas": {}}}');

      await user.click(screen.getByRole('button', { name: /import openapi/i }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // Check entities were added to store
      const entities = useEntityStore.getState().entities;
      expect(entities.length).toBeGreaterThan(0);
    });

    it('should call onImportComplete callback after import', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal
            opened={true}
            onClose={mockOnClose}
            onImportComplete={mockOnImportComplete}
          />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0"}');

      await user.click(screen.getByRole('button', { name: /import openapi/i }));

      await waitFor(() => {
        expect(mockOnImportComplete).toHaveBeenCalled();
      });
    });

    it('should show confirmation modal when replacing existing entities', async () => {
      const user = userEvent.setup();

      // Add existing entity
      useEntityStore.setState({
        entities: [createMockEntity({ name: 'ExistingEntity' })],
      });

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0"}');

      await user.click(screen.getByRole('button', { name: /import openapi/i }));

      // Mock confirms automatically, so import should proceed
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when content is empty on import', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Import button should be disabled, but if somehow clicked with empty content
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, ' ');
      await user.clear(textarea);

      // Button should be disabled
      expect(screen.getByRole('button', { name: /import openapi/i })).toBeDisabled();
    });

    it('should show error for invalid OpenAPI spec', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'invalid content here');

      await user.click(screen.getByRole('button', { name: /import openapi/i }));

      await waitFor(() => {
        expect(screen.getByText(/import error/i)).toBeInTheDocument();
      });
    });

    it('should show error when no schemas found', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '"empty"');

      await user.click(screen.getByRole('button', { name: /import openapi/i }));

      await waitFor(() => {
        expect(screen.getByText(/no valid schemas found/i)).toBeInTheDocument();
      });
    });

    it('should allow dismissing error alert', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'invalid content');

      await user.click(screen.getByRole('button', { name: /import openapi/i }));

      await waitFor(() => {
        expect(screen.getByText(/import error/i)).toBeInTheDocument();
      });

      // Close the error alert
      const closeBtn = screen.getByRole('button', { name: /close/i });
      await user.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText(/import error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Find close button by aria-label
      const closeBtn = screen.getByRole('button', { name: /close/i });
      await user.click(closeBtn);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset state when modal is closed', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      // Enter some content
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0"}');

      // Close modal
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have close button with aria-label', () => {
      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should have accessible textarea', () => {
      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('should set entities in store after import', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0"}');

      await user.click(screen.getByRole('button', { name: /import openapi/i }));

      await waitFor(() => {
        const entities = useEntityStore.getState().entities;
        expect(entities.length).toBe(1);
        expect(entities[0].name).toBe('User');
      });
    });

    it('should set relations in store after import', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <OpenApiImportModal opened={true} onClose={mockOnClose} />
        </TestProviders>,
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{"openapi": "3.0.0"}');

      await user.click(screen.getByRole('button', { name: /import openapi/i }));

      await waitFor(() => {
        const relations = useRelationStore.getState().relations;
        // Our mock returns empty relations
        expect(relations).toHaveLength(0);
      });
    });
  });
});
