import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EntityDesign } from '../types';
import { EntityCard } from './EntityCard';

// Helper to wrap components with Mantine provider
function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

function createMockEntity(overrides: Partial<EntityDesign> = {}): EntityDesign {
  return {
    id: 'entity-1',
    name: 'User',
    tableName: 'users',
    position: { x: 0, y: 0 },
    fields: [],
    config: {
      generateController: true,
      generateService: true,
      enableCaching: true,
    },
    ...overrides,
  };
}

describe('EntityCard', () => {
  const defaultProps = {
    entity: createMockEntity(),
    isSelected: false,
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render entity name', () => {
    renderWithMantine(<EntityCard {...defaultProps} />);

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should render table name as badge', () => {
    renderWithMantine(<EntityCard {...defaultProps} />);

    expect(screen.getByText('users')).toBeInTheDocument();
  });

  it('should show "No fields yet" when entity has no fields', () => {
    renderWithMantine(<EntityCard {...defaultProps} />);

    expect(screen.getByText('No fields yet')).toBeInTheDocument();
  });

  it('should render fields when entity has fields', () => {
    const entity = createMockEntity({
      fields: [
        {
          id: 'field-1',
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: false,
          unique: true,
          validations: [],
        },
        {
          id: 'field-2',
          name: 'age',
          columnName: 'age',
          type: 'Integer',
          nullable: true,
          unique: false,
          validations: [],
        },
      ],
    });

    renderWithMantine(<EntityCard {...defaultProps} entity={entity} />);

    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('String')).toBeInTheDocument();
    expect(screen.getByText('Integer')).toBeInTheDocument();
  });

  it('should show required indicator for non-nullable fields', () => {
    const entity = createMockEntity({
      fields: [
        {
          id: 'field-1',
          name: 'requiredField',
          columnName: 'required_field',
          type: 'String',
          nullable: false,
          unique: false,
          validations: [],
        },
      ],
    });

    renderWithMantine(<EntityCard {...defaultProps} entity={entity} />);

    // Check for the asterisk indicating required
    const fieldText = screen.getByText('requiredField');
    const container = fieldText.parentElement;
    expect(container?.textContent).toContain('*');
  });

  it('should call onSelect when card is clicked', () => {
    const onSelect = vi.fn();
    renderWithMantine(<EntityCard {...defaultProps} onSelect={onSelect} />);

    // Get the card by its aria-label with field count
    const card = screen.getByRole('button', { name: /User entity with 0 fields/i });
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect when Enter key is pressed', () => {
    const onSelect = vi.fn();
    renderWithMantine(<EntityCard {...defaultProps} onSelect={onSelect} />);

    const card = screen.getByRole('button', { name: /User entity with 0 fields/i });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect when Space key is pressed', () => {
    const onSelect = vi.fn();
    renderWithMantine(<EntityCard {...defaultProps} onSelect={onSelect} />);

    const card = screen.getByRole('button', { name: /User entity with 0 fields/i });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    const onSelect = vi.fn();
    renderWithMantine(<EntityCard {...defaultProps} onEdit={onEdit} onSelect={onSelect} />);

    const editButton = screen.getByRole('button', { name: /Edit User entity/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    // onSelect should NOT be called due to stopPropagation
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    const onSelect = vi.fn();
    renderWithMantine(<EntityCard {...defaultProps} onDelete={onDelete} onSelect={onSelect} />);

    const deleteButton = screen.getByRole('button', {
      name: /Delete User entity/i,
    });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    // onSelect should NOT be called due to stopPropagation
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should have correct aria-pressed attribute when selected', () => {
    renderWithMantine(<EntityCard {...defaultProps} isSelected={true} />);

    const card = screen.getByRole('button', { name: /User entity with 0 fields/i });
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('should have correct aria-pressed attribute when not selected', () => {
    renderWithMantine(<EntityCard {...defaultProps} isSelected={false} />);

    const card = screen.getByRole('button', { name: /User entity with 0 fields/i });
    expect(card).toHaveAttribute('aria-pressed', 'false');
  });

  it('should display field count in aria-label', () => {
    const entity = createMockEntity({
      fields: [
        {
          id: 'field-1',
          name: 'email',
          columnName: 'email',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        },
        {
          id: 'field-2',
          name: 'name',
          columnName: 'name',
          type: 'String',
          nullable: true,
          unique: false,
          validations: [],
        },
      ],
    });

    renderWithMantine(<EntityCard {...defaultProps} entity={entity} />);

    const card = screen.getByRole('button', { name: /User entity with 2 fields/i });
    expect(card).toBeInTheDocument();
  });

  it('should always show id field indicator', () => {
    renderWithMantine(<EntityCard {...defaultProps} />);

    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('Long (PK)')).toBeInTheDocument();
  });

  it('should show inherited fields section', () => {
    renderWithMantine(<EntityCard {...defaultProps} />);

    expect(screen.getByText('Inherited from Base')).toBeInTheDocument();
  });
});
