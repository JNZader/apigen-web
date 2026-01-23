import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntityStore } from '../store/entityStore';
import { useServiceStore } from '../store/serviceStore';
import { createMockEntity, createMockService } from '../test/factories';
import { render, resetAllStores, screen, userEvent, waitFor } from '../test/utils';
import { EntityForm } from './EntityForm';

// Mock AddFieldForm and FieldEditor to simplify testing
vi.mock('./AddFieldForm', () => ({
  AddFieldForm: vi.fn(() => <div data-testid="add-field-form">Add Field Form</div>),
}));

vi.mock('./FieldEditor', () => ({
  FieldEditor: vi.fn(
    ({ field, onRemove }: { field: { id: string; name: string }; onRemove: () => void }) => (
      <div data-testid={`field-editor-${field.id}`}>
        <span>{field.name}</span>
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
    ),
  ),
}));

describe('EntityForm', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    resetAllStores();
    mockOnClose.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render modal when opened', () => {
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('New Entity')).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(<EntityForm opened={false} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show "Edit Entity" title when editing', () => {
      const entity = createMockEntity({ name: 'Product' });
      useEntityStore.setState({ entities: [entity] });

      render(<EntityForm opened={true} onClose={mockOnClose} entity={entity} />);

      expect(screen.getByText('Edit Entity: Product')).toBeInTheDocument();
    });

    it('should have entity name and table name inputs', () => {
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/entity name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/table name/i)).toBeInTheDocument();
    });

    it('should have configuration checkboxes', () => {
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/generate controller/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/generate service/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/enable caching/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when entity name is empty', async () => {
      const user = userEvent.setup();
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/entity name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when entity name is not PascalCase', async () => {
      const user = userEvent.setup();
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/entity name/i);
      await user.type(nameInput, 'invalid_name');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/entity name must be pascalcase/i)).toBeInTheDocument();
      });
    });

    it('should show error when table name is not snake_case', async () => {
      const user = userEvent.setup();
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/entity name/i);
      await user.type(nameInput, 'Product');

      const tableInput = screen.getByLabelText(/table name/i);
      await user.clear(tableInput);
      await user.type(tableInput, 'InvalidTable');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/table name must be snake_case/i)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-generate Table Name', () => {
    it('should auto-generate table name from entity name for new entities', async () => {
      const user = userEvent.setup();
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/entity name/i);
      await user.type(nameInput, 'Product');

      const tableInput = screen.getByLabelText(/table name/i);
      expect(tableInput).toHaveValue('products');
    });

    it('should auto-generate table name with snake_case for multi-word names', async () => {
      const user = userEvent.setup();
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/entity name/i);
      await user.type(nameInput, 'OrderItem');

      const tableInput = screen.getByLabelText(/table name/i);
      expect(tableInput).toHaveValue('order_items');
    });
  });

  describe('Create Entity', () => {
    it('should create entity and close modal on submit', async () => {
      const user = userEvent.setup();
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText(/entity name/i);
      await user.type(nameInput, 'Product');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // Verify entity was added to store
      const { entities } = useEntityStore.getState();
      expect(entities.some((e) => e.name === 'Product')).toBe(true);
    });

    it('should have checkboxes checked by default', () => {
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/generate controller/i)).toBeChecked();
      expect(screen.getByLabelText(/generate service/i)).toBeChecked();
      expect(screen.getByLabelText(/enable caching/i)).toBeChecked();
    });
  });

  describe('Edit Entity', () => {
    it('should populate form with existing entity values', () => {
      const entity = createMockEntity({
        name: 'Product',
        tableName: 'products',
        description: 'A product entity',
        config: {
          generateController: false,
          generateService: true,
          enableCaching: false,
        },
      });
      useEntityStore.setState({ entities: [entity] });

      render(<EntityForm opened={true} onClose={mockOnClose} entity={entity} />);

      expect(screen.getByLabelText(/entity name/i)).toHaveValue('Product');
      expect(screen.getByLabelText(/table name/i)).toHaveValue('products');
      expect(screen.getByLabelText(/description/i)).toHaveValue('A product entity');
      expect(screen.getByLabelText(/generate controller/i)).not.toBeChecked();
      expect(screen.getByLabelText(/generate service/i)).toBeChecked();
      expect(screen.getByLabelText(/enable caching/i)).not.toBeChecked();
    });

    it('should show "Update" button when editing', () => {
      const entity = createMockEntity({ name: 'Product' });
      useEntityStore.setState({ entities: [entity] });

      render(<EntityForm opened={true} onClose={mockOnClose} entity={entity} />);

      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });

    it('should show fields section when editing', () => {
      const entity = createMockEntity({ name: 'Product' });
      useEntityStore.setState({ entities: [entity] });

      render(<EntityForm opened={true} onClose={mockOnClose} entity={entity} />);

      // Check for divider with "Fields" text and the add field form
      const fieldsDividers = screen.getAllByText(/fields/i);
      expect(fieldsDividers.length).toBeGreaterThan(0);
      expect(screen.getByTestId('add-field-form')).toBeInTheDocument();
    });

    it('should show "No fields yet" message when entity has no fields', () => {
      const entity = createMockEntity({ name: 'Product', fields: [] });
      useEntityStore.setState({ entities: [entity] });

      render(<EntityForm opened={true} onClose={mockOnClose} entity={entity} />);

      expect(screen.getByText(/no fields yet/i)).toBeInTheDocument();
    });
  });

  describe('Service Assignment', () => {
    it('should show service assignment select when editing and services exist', () => {
      const entity = createMockEntity({ name: 'Product' });
      const service = createMockService({ name: 'ProductService' });

      useEntityStore.setState({ entities: [entity] });
      useServiceStore.setState({ services: [service] });

      render(<EntityForm opened={true} onClose={mockOnClose} entity={entity} />);

      // Check for service assignment divider and select
      const serviceAssignmentElements = screen.getAllByText(/service assignment/i);
      expect(serviceAssignmentElements.length).toBeGreaterThan(0);
      // Use getAllByLabelText since Mantine Select creates multiple labeled elements
      const assignedServiceElements = screen.getAllByLabelText(/assigned service/i);
      expect(assignedServiceElements.length).toBeGreaterThan(0);
    });

    it('should not show service assignment for new entities', () => {
      const service = createMockService({ name: 'ProductService' });

      useServiceStore.setState({ services: [service] });

      render(<EntityForm opened={true} onClose={mockOnClose} />);

      expect(screen.queryByText(/service assignment/i)).not.toBeInTheDocument();
    });

    it('should not show service assignment when no services exist', () => {
      const entity = createMockEntity({ name: 'Product' });

      useEntityStore.setState({ entities: [entity] });
      useServiceStore.setState({ services: [] });

      render(<EntityForm opened={true} onClose={mockOnClose} entity={entity} />);

      expect(screen.queryByText(/service assignment/i)).not.toBeInTheDocument();
    });
  });

  describe('Cancel Button', () => {
    it('should call onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should have form inputs with proper labels', () => {
      render(<EntityForm opened={true} onClose={mockOnClose} />);

      // All inputs should be associated with labels
      expect(screen.getByLabelText(/entity name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/table name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/custom endpoint/i)).toBeInTheDocument();
    });
  });
});
