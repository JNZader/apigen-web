import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntityStore } from '../store/entityStore';
import { createMockEntity } from '../test/factories';
import { resetAllStores, TestProviders } from '../test/utils';
import { RelationForm } from './RelationForm';

// Mock notifications
vi.mock('../utils/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('RelationForm', () => {
  const mockOnClose = vi.fn();
  let sourceEntity: ReturnType<typeof createMockEntity>;
  let targetEntity: ReturnType<typeof createMockEntity>;

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();

    // Create entities for relation
    sourceEntity = createMockEntity({ name: 'User' });
    targetEntity = createMockEntity({ name: 'Order' });

    useEntityStore.setState({
      entities: [sourceEntity, targetEntity],
    });
  });

  describe('Rendering', () => {
    it('should render modal when opened', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={false}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.queryByText('Create Relation')).not.toBeInTheDocument();
    });

    it('should show source and target entity names', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Order')).toBeInTheDocument();
    });

    it('should show relation type selector', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByText('Relation Type')).toBeInTheDocument();
    });

    it('should show fetch type selector', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByText('Fetch Type')).toBeInTheDocument();
    });

    it('should show bidirectional checkbox', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByLabelText(/bidirectional/i)).toBeInTheDocument();
    });

    it('should show nullable checkbox', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByLabelText(/nullable/i)).toBeInTheDocument();
    });

    it('should show code preview section', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByText(/generated code preview/i)).toBeInTheDocument();
    });

    it('should not render if source entity does not exist', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId="non-existent"
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.queryByText('Create Relation')).not.toBeInTheDocument();
    });

    it('should not render if target entity does not exist', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId="non-existent"
          />
        </TestProviders>,
      );

      expect(screen.queryByText('Create Relation')).not.toBeInTheDocument();
    });
  });

  describe('Form Defaults', () => {
    it('should default to ManyToOne relation type', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      // ManyToOne is the default selected option
      expect(screen.getByRole('textbox', { name: /relation type/i })).toHaveValue(
        'Many to One (N:1)',
      );
    });

    it('should default nullable to checked', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      const checkbox = screen.getByLabelText(/nullable/i);
      expect(checkbox).toBeChecked();
    });

    it('should default bidirectional to unchecked', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      const checkbox = screen.getByLabelText(/bidirectional/i);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Form Interaction', () => {
    it('should toggle bidirectional checkbox', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      const checkbox = screen.getByLabelText(/bidirectional/i);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should toggle nullable checkbox', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      const checkbox = screen.getByLabelText(/nullable/i);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Form Submission', () => {
    it('should call onClose when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should submit and close on create', async () => {
      const user = userEvent.setup();
      const { notify } = await import('../utils/notifications');

      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      await user.click(screen.getByRole('button', { name: /create relation/i }));

      await waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Relation Created',
          }),
        );
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Modal Behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
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
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should have relation direction preview with aria-label', () => {
      render(
        <TestProviders>
          <RelationForm
            opened={true}
            onClose={mockOnClose}
            sourceEntityId={sourceEntity.id}
            targetEntityId={targetEntity.id}
          />
        </TestProviders>,
      );

      expect(screen.getByLabelText(/relation direction preview/i)).toBeInTheDocument();
    });
  });
});
