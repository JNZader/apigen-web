import { Button, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { memo, useEffect, useRef } from 'react';
import type { EntityDesign, FieldDesign } from '../types';
import { AddFieldForm } from './AddFieldForm';
import { FieldEditor } from './FieldEditor';

interface EntityDetailPanelProps {
  entity: EntityDesign;
  onEdit?: () => void;
  onClose: () => void;
  onUpdateField: (fieldId: string, updates: Partial<FieldDesign>) => void;
  onRemoveField: (fieldId: string) => void;
  showEditButton?: boolean;
  height?: string;
}

/**
 * Reusable panel component for displaying and editing entity details.
 * Used in both canvas and grid views to eliminate code duplication.
 */
export const EntityDetailPanel = memo(function EntityDetailPanel({
  entity,
  onEdit,
  onClose,
  onUpdateField,
  onRemoveField,
  showEditButton = true,
  height = 'calc(100vh - 160px)',
}: EntityDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Move focus to panel when entity changes for accessibility
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.focus();
    }
  }, []);

  return (
    <Paper
      p="md"
      withBorder
      h={height}
      ref={panelRef}
      tabIndex={-1}
      aria-label={`Details for ${entity.name} entity`}
    >
      <Stack h="100%" style={{ overflow: 'hidden' }}>
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Title order={4}>{entity.name}</Title>
            <Text size="sm" c="dimmed">
              {entity.tableName}
            </Text>
          </div>
          <Group gap="xs" wrap="nowrap">
            {showEditButton && onEdit && (
              <Button
                variant="light"
                size="xs"
                onClick={onEdit}
                aria-label={`Edit ${entity.name} entity`}
              >
                Edit
              </Button>
            )}
            <Button
              variant="subtle"
              size="xs"
              onClick={onClose}
              aria-label="Close entity details panel"
            >
              Close
            </Button>
          </Group>
        </Group>

        <Divider label="Fields" labelPosition="center" />

        <AddFieldForm entityId={entity.id} />

        <Stack
          gap="xs"
          style={{ overflow: 'auto', flex: 1, paddingRight: 4 }}
          component="ul"
          aria-label={`Fields of ${entity.name}`}
        >
          {entity.fields.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" mt="md">
              No fields yet. Add your first field above.
            </Text>
          ) : (
            entity.fields.map((field) => (
              <li key={field.id} style={{ listStyle: 'none' }}>
                <FieldEditor
                  field={field}
                  onChange={(updates) => onUpdateField(field.id, updates)}
                  onRemove={() => onRemoveField(field.id)}
                />
              </li>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
});
