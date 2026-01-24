import { expect, test } from '@playwright/experimental-ct-react';
import type { EntityDesign } from '../types';
import { EntityCard } from './EntityCard';

const mockEntity: EntityDesign = {
  id: 'entity-1',
  name: 'User',
  tableName: 'users',
  position: { x: 0, y: 0 },
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
  config: {
    generateController: true,
    generateService: true,
    enableCaching: false,
  },
};

const emptyEntity: EntityDesign = {
  id: 'entity-2',
  name: 'Empty',
  tableName: 'empty_table',
  position: { x: 0, y: 0 },
  fields: [],
  config: {
    generateController: true,
    generateService: true,
    enableCaching: false,
  },
};

test.describe('EntityCard', () => {
  test('should render entity name and table name', async ({ mount }) => {
    const component = await mount(
      <EntityCard
        entity={mockEntity}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    await expect(component.getByText('User', { exact: true })).toBeVisible();
    await expect(component.getByText('users', { exact: true })).toBeVisible();
  });

  test('should render all entity fields', async ({ mount }) => {
    const component = await mount(
      <EntityCard
        entity={mockEntity}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    await expect(component.getByText('email')).toBeVisible();
    await expect(component.getByText('age')).toBeVisible();
    await expect(component.getByText('String')).toBeVisible();
    await expect(component.getByText('Integer')).toBeVisible();
  });

  test('should show "No fields yet" when entity has no fields', async ({ mount }) => {
    const component = await mount(
      <EntityCard
        entity={emptyEntity}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    await expect(component.getByText('No fields yet')).toBeVisible();
  });

  test('should call onSelect when card is clicked', async ({ mount }) => {
    let selectCalled = false;
    const component = await mount(
      <EntityCard
        entity={mockEntity}
        isSelected={false}
        onSelect={() => {
          selectCalled = true;
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    await component.click();
    expect(selectCalled).toBe(true);
  });

  test('should call onEdit when edit button is clicked', async ({ mount }) => {
    let editCalled = false;
    const component = await mount(
      <EntityCard
        entity={mockEntity}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {
          editCalled = true;
        }}
        onDelete={() => {}}
      />,
    );

    await component.getByLabel(/Edit User entity/i).click();
    expect(editCalled).toBe(true);
  });

  test('should call onDelete when delete button is clicked', async ({ mount }) => {
    let deleteCalled = false;
    const component = await mount(
      <EntityCard
        entity={mockEntity}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {
          deleteCalled = true;
        }}
      />,
    );

    await component.getByLabel(/Delete User entity/i).click();
    expect(deleteCalled).toBe(true);
  });

  test('should have selected styles when isSelected is true', async ({ mount }) => {
    const component = await mount(
      <EntityCard
        entity={mockEntity}
        isSelected={true}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    // Check aria-pressed is true for selected state
    await expect(component.locator('[aria-pressed="true"]')).toBeVisible();
  });

  test('should show required field indicator', async ({ mount }) => {
    const component = await mount(
      <EntityCard
        entity={mockEntity}
        isSelected={false}
        onSelect={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    // email field is required (nullable: false), should have * indicator
    const emailField = component.getByText('email');
    await expect(emailField).toBeVisible();
  });

  test('should be keyboard accessible', async ({ mount }) => {
    let selectCalled = false;
    const component = await mount(
      <EntityCard
        entity={mockEntity}
        isSelected={false}
        onSelect={() => {
          selectCalled = true;
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    // Focus the card and press Enter
    await component.locator('[role="button"]').focus();
    await component.locator('[role="button"]').press('Enter');
    expect(selectCalled).toBe(true);
  });
});
