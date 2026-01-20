import { Button, Group, Paper, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Panel } from '@xyflow/react';
import type { CanvasView } from '../../store/projectStore';
import { CANVAS_VIEWS } from '../../utils/canvasConstants';

interface CanvasEmptyStatesProps {
  readonly canvasView: CanvasView;
  readonly entitiesCount: number;
  readonly servicesCount: number;
  readonly onAddEntity: () => void;
  readonly onAddService?: () => void;
}

export function CanvasEmptyStates({
  canvasView,
  entitiesCount,
  servicesCount,
  onAddEntity,
  onAddService,
}: CanvasEmptyStatesProps) {
  return (
    <>
      {/* Empty state for entities view */}
      {canvasView === CANVAS_VIEWS.ENTITIES && entitiesCount === 0 && (
        <Panel position="top-center" style={{ top: '40%' }}>
          <Paper
            p="xl"
            withBorder
            shadow="md"
            style={{ textAlign: 'center' }}
            role="region"
            aria-label="Getting started"
          >
            <Text size="lg" fw={500} mb="xs">
              No entities yet
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Click "Add Entity" to create your first entity.
              <br />
              Drag entities to position them. Connect them to create relations.
            </Text>
            <Button leftSection={<IconPlus size={16} aria-hidden="true" />} onClick={onAddEntity}>
              Create First Entity
            </Button>
          </Paper>
        </Panel>
      )}

      {/* Empty state for services view */}
      {canvasView === CANVAS_VIEWS.SERVICES && servicesCount === 0 && (
        <Panel position="top-center" style={{ top: '40%' }}>
          <Paper
            p="xl"
            withBorder
            shadow="md"
            style={{ textAlign: 'center' }}
            role="region"
            aria-label="Getting started with services"
          >
            <Text size="lg" fw={500} mb="xs">
              No services yet
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Click "Add Service" to create your first microservice.
              <br />
              Services can contain entities and connect to each other via REST, gRPC, or messaging.
            </Text>
            <Button
              color="teal"
              leftSection={<IconPlus size={16} aria-hidden="true" />}
              onClick={onAddService}
            >
              Create First Service
            </Button>
          </Paper>
        </Panel>
      )}

      {/* Empty state for 'both' view when nothing exists */}
      {canvasView === CANVAS_VIEWS.BOTH && entitiesCount === 0 && servicesCount === 0 && (
        <Panel position="top-center" style={{ top: '40%' }}>
          <Paper
            p="xl"
            withBorder
            shadow="md"
            style={{ textAlign: 'center' }}
            role="region"
            aria-label="Getting started"
          >
            <Text size="lg" fw={500} mb="xs">
              Combined View
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Create entities and services to see them together.
              <br />
              Drag entities inside services to assign them.
            </Text>
            <Group justify="center" gap="sm">
              <Button leftSection={<IconPlus size={16} aria-hidden="true" />} onClick={onAddEntity}>
                Add Entity
              </Button>
              <Button
                color="teal"
                leftSection={<IconPlus size={16} aria-hidden="true" />}
                onClick={onAddService}
              >
                Add Service
              </Button>
            </Group>
          </Paper>
        </Panel>
      )}
    </>
  );
}

interface CanvasHelpTipProps {
  readonly canvasView: CanvasView;
  readonly entitiesCount: number;
  readonly servicesCount: number;
}

export function CanvasHelpTip({ canvasView, entitiesCount, servicesCount }: CanvasHelpTipProps) {
  // Help tip for 'both' view
  if (canvasView === CANVAS_VIEWS.BOTH && servicesCount > 0 && entitiesCount > 0) {
    return (
      <Panel position="bottom-center">
        <Paper p="xs" withBorder shadow="sm" style={{ opacity: 0.9 }}>
          <Text size="xs" c="dimmed">
            Drag entities inside a service to assign them. Drag outside to unassign.
          </Text>
        </Paper>
      </Panel>
    );
  }

  return null;
}
