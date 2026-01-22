import {
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMemo } from 'react';
import { useProjectStore, useServiceActions, useServices } from '../store/projectStore';
import type { EntityDesign } from '../types';
import { toPascalCase, toSnakeCase } from '../types';
import { isValidEntityName, isValidTableName } from '../utils/validation';
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

  // Service assignment
  const services = useServices();
  const { assignEntityToService, removeEntityFromService } = useServiceActions();

  // Find the service this entity is currently assigned to
  const currentServiceId = useMemo(() => {
    if (!entity) return null;
    const service = services.find((s) => s.entityIds.includes(entity.id));
    return service?.id ?? null;
  }, [entity, services]);

  // Service options for the Select
  const serviceOptions = useMemo(
    () =>
      services.map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [services],
  );

  // Initialize form with entity values directly - use key prop at usage site to reset
  const form = useForm<FormValues>({
    initialValues: {
      name: entity?.name ?? '',
      tableName: entity?.tableName ?? '',
      description: entity?.description ?? '',
      generateController: entity?.config.generateController ?? true,
      generateService: entity?.config.generateService ?? true,
      enableCaching: entity?.config.enableCaching ?? true,
      customEndpoint: entity?.config.customEndpoint ?? '',
    },
    validate: {
      name: (value) => {
        if (!value) return 'Entity name is required';
        if (!isValidEntityName(value))
          return 'Entity name must be PascalCase (e.g., Product, OrderItem)';
        return null;
      },
      tableName: (value) => {
        if (!value) return 'Table name is required';
        if (!isValidTableName(value))
          return 'Table name must be snake_case (e.g., products, order_items)';
        return null;
      },
    },
  });

  // Auto-generate table name from entity name
  const handleNameChange = (value: string) => {
    form.setFieldValue('name', value);
    if (!entity) {
      // Only auto-generate for new entities
      const tableName = `${toSnakeCase(value)}s`;
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

  // Handle service assignment change
  const handleServiceChange = (serviceId: string | null) => {
    if (!entity) return;

    // Remove from current service if assigned
    if (currentServiceId) {
      removeEntityFromService(entity.id, currentServiceId);
    }

    // Assign to new service if selected
    if (serviceId) {
      assignEntityToService(entity.id, serviceId);
    }
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

          {entity && services.length > 0 && (
            <>
              <Divider label="Service Assignment" labelPosition="center" />
              <Select
                label="Assigned Service"
                placeholder="Select a service (optional)"
                description="Assign this entity to a service"
                data={serviceOptions}
                value={currentServiceId}
                onChange={handleServiceChange}
                clearable
              />
            </>
          )}

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
