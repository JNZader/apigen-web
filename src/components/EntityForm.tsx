import {
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import type { EntityDesign } from '../types';
import { toPascalCase, toSnakeCase } from '../types';
import { AddFieldForm } from './AddFieldForm';
import { FieldEditor } from './FieldEditor';

interface EntityFormProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly entity?: EntityDesign;
}

interface FormValues {
  name: string;
  tableName: string;
  description: string;
  generateController: boolean;
  generateService: boolean;
  enableCaching: boolean;
  customEndpoint: string;
}

export function EntityForm({ opened, onClose, entity }: Readonly<EntityFormProps>) {
  // Use atomic selectors to prevent unnecessary re-renders
  const addEntity = useProjectStore((state) => state.addEntity);
  const updateEntity = useProjectStore((state) => state.updateEntity);
  const updateField = useProjectStore((state) => state.updateField);
  const removeField = useProjectStore((state) => state.removeField);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      tableName: '',
      description: '',
      generateController: true,
      generateService: true,
      enableCaching: true,
      customEndpoint: '',
    },
    validate: {
      name: (value) => {
        if (!value) return 'Entity name is required';
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(value))
          return 'Entity name must be PascalCase (e.g., Product, OrderItem)';
        return null;
      },
      tableName: (value) => {
        if (!value) return 'Table name is required';
        if (!/^[a-z][a-z0-9_]*$/.test(value))
          return 'Table name must be snake_case (e.g., products, order_items)';
        return null;
      },
    },
  });

  // Reset form when opening/closing or when entity changes
  // Note: form is intentionally excluded from deps to avoid infinite loops
  // (Mantine form object changes reference on every render)
  useEffect(() => {
    if (opened) {
      if (entity) {
        form.setValues({
          name: entity.name,
          tableName: entity.tableName,
          description: entity.description || '',
          generateController: entity.config.generateController,
          generateService: entity.config.generateService,
          enableCaching: entity.config.enableCaching,
          customEndpoint: entity.config.customEndpoint || '',
        });
      } else {
        form.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, entity]);

  // Auto-generate table name from entity name
  const handleNameChange = (value: string) => {
    form.setFieldValue('name', value);
    if (!entity) {
      // Only auto-generate for new entities
      const tableName = toSnakeCase(value) + 's';
      form.setFieldValue('tableName', tableName);
    }
  };

  const handleSubmit = (values: FormValues) => {
    if (entity) {
      // Update existing entity
      updateEntity(entity.id, {
        name: toPascalCase(values.name),
        tableName: values.tableName,
        description: values.description || undefined,
        config: {
          generateController: values.generateController,
          generateService: values.generateService,
          enableCaching: values.enableCaching,
          customEndpoint: values.customEndpoint || undefined,
        },
      });
      notifications.show({
        title: 'Updated',
        message: `Entity ${values.name} updated successfully`,
        color: 'blue',
      });
    } else {
      // Create new entity
      addEntity(toPascalCase(values.name));
      notifications.show({
        title: 'Created',
        message: `Entity ${values.name} created successfully`,
        color: 'green',
      });
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={entity ? `Edit Entity: ${entity.name}` : 'New Entity'}
      size="lg"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Group grow>
            <TextInput
              label="Entity Name"
              placeholder="Product"
              description="PascalCase (e.g., Product, OrderItem)"
              {...form.getInputProps('name')}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            <TextInput
              label="Table Name"
              placeholder="products"
              description="snake_case (e.g., products, order_items)"
              {...form.getInputProps('tableName')}
            />
          </Group>

          <TextInput
            label="Description"
            placeholder="Optional description for the entity"
            {...form.getInputProps('description')}
          />

          <Divider label="Configuration" labelPosition="center" />

          <Group>
            <Checkbox
              label="Generate Controller"
              description="Create REST endpoints"
              {...form.getInputProps('generateController', { type: 'checkbox' })}
            />
            <Checkbox
              label="Generate Service"
              description="Create service layer"
              {...form.getInputProps('generateService', { type: 'checkbox' })}
            />
            <Checkbox
              label="Enable Caching"
              description="Cache entity queries"
              {...form.getInputProps('enableCaching', { type: 'checkbox' })}
            />
          </Group>

          <TextInput
            label="Custom Endpoint (optional)"
            placeholder="/api/v1/products"
            description="Leave empty for auto-generated endpoint"
            {...form.getInputProps('customEndpoint')}
          />

          {entity && (
            <>
              <Divider label="Fields" labelPosition="center" />
              <AddFieldForm entityId={entity.id} />
              <ScrollArea h={250}>
                <Stack gap="sm">
                  {entity.fields.length === 0 ? (
                    <Text c="dimmed" ta="center" fs="italic">
                      No fields yet. Add your first field above.
                    </Text>
                  ) : (
                    entity.fields.map((field) => (
                      <FieldEditor
                        key={field.id}
                        field={field}
                        onChange={(updates) => updateField(entity.id, field.id, updates)}
                        onRemove={() => removeField(entity.id, field.id)}
                      />
                    ))
                  )}
                </Stack>
              </ScrollArea>
            </>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{entity ? 'Update' : 'Create'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
