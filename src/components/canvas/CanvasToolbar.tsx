import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Paper,
  SegmentedControl,
  Text,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCamera,
  IconChevronDown,
  IconLayoutDistributeHorizontal,
  IconPlus,
  IconServer,
  IconTable,
} from '@tabler/icons-react';
import type { Node } from '@xyflow/react';
import { getNodesBounds } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import { useCallback } from 'react';
import type { CanvasView } from '../../store/projectStore';
import {
  useCanvasView,
  useCanvasViewActions,
  useEntities,
  useLayoutActions,
  useRelations,
  useServiceConnections,
  useServices,
} from '../../store/projectStore';
import type { EntityDesign } from '../../types';
import type { RelationDesign } from '../../types/relation';
import { CANVAS_VIEWS } from '../../utils/canvasConstants';
import { calculateAutoLayout, LAYOUT_PRESETS } from '../../utils/canvasLayout';

interface CanvasToolbarProps {
  readonly nodes: Node[];
  readonly reactFlowWrapper: React.RefObject<HTMLDivElement | null>;
  readonly onAddEntity: () => void;
  readonly onAddService?: () => void;
}

export function CanvasToolbar({
  nodes,
  reactFlowWrapper,
  onAddEntity,
  onAddService,
}: CanvasToolbarProps) {
  const { colorScheme } = useMantineColorScheme();

  const entities = useEntities();
  const relations = useRelations();
  const services = useServices();
  const serviceConnections = useServiceConnections();
  const canvasView = useCanvasView();

  const { setCanvasView } = useCanvasViewActions();
  const { updateEntityPositions, updateServicePositions, setLayoutPreference } = useLayoutActions();

  // Auto-layout with dagre algorithm
  const handleAutoLayout = useCallback(
    (preset: keyof typeof LAYOUT_PRESETS = 'horizontal') => {
      if (canvasView === CANVAS_VIEWS.ENTITIES) {
        if (entities.length === 0) {
          notifications.show({
            title: 'No entities',
            message: 'Add at least one entity to auto-arrange',
            color: 'yellow',
          });
          return;
        }

        const positions = calculateAutoLayout(
          entities as EntityDesign[],
          relations as RelationDesign[],
          LAYOUT_PRESETS[preset],
        );
        updateEntityPositions(positions);
        setLayoutPreference(preset);

        notifications.show({
          title: 'Layout applied',
          message: `Entities arranged using ${preset} layout`,
          color: 'green',
        });
      } else {
        if (services.length === 0) {
          notifications.show({
            title: 'No services',
            message: 'Add at least one service to auto-arrange',
            color: 'yellow',
          });
          return;
        }

        // Simple grid layout for services
        const servicePositions = new Map<string, { x: number; y: number }>();
        const cols = Math.ceil(Math.sqrt(services.length));
        services.forEach((service, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          servicePositions.set(service.id, { x: col * 450 + 50, y: row * 350 + 50 });
        });
        updateServicePositions(servicePositions);

        // In combined view, move entities along with their assigned services
        if (canvasView === CANVAS_VIEWS.BOTH) {
          const entityPositions = new Map<string, { x: number; y: number }>();

          services.forEach((service) => {
            const newServicePos = servicePositions.get(service.id);
            if (!newServicePos) return;

            // Calculate how much the service moved
            const deltaX = newServicePos.x - service.position.x;
            const deltaY = newServicePos.y - service.position.y;

            // Move all entities assigned to this service by the same delta
            for (const entityId of service.entityIds) {
              const entity = entities.find((e) => e.id === entityId);
              if (entity) {
                entityPositions.set(entityId, {
                  x: entity.position.x + deltaX,
                  y: entity.position.y + deltaY,
                });
              }
            }
          });

          if (entityPositions.size > 0) {
            updateEntityPositions(entityPositions);
          }
        }

        setLayoutPreference(preset);

        notifications.show({
          title: 'Layout applied',
          message: `Services arranged using grid layout`,
          color: 'green',
        });
      }
    },
    [
      canvasView,
      entities,
      relations,
      services,
      updateEntityPositions,
      updateServicePositions,
      setLayoutPreference,
    ],
  );

  // Download canvas as image
  const handleDownloadImage = useCallback(
    async (format: 'png' | 'svg' = 'png') => {
      const viewport = reactFlowWrapper.current?.querySelector(
        '.react-flow__viewport',
      ) as HTMLElement;
      if (!viewport) {
        notifications.show({
          title: 'Error',
          message: 'Could not capture canvas',
          color: 'red',
        });
        return;
      }

      try {
        // Get the bounds of all nodes
        const nodesBounds = getNodesBounds(nodes);
        const padding = 50;
        const width = nodesBounds.width + padding * 2;
        const height = nodesBounds.height + padding * 2;

        const imageOptions = {
          backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#f8f9fa',
          width: Math.max(width, 800),
          height: Math.max(height, 600),
          style: {
            transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px)`,
          },
        };

        let dataUrl: string;
        let filename: string;

        if (format === 'svg') {
          dataUrl = await toSvg(viewport, imageOptions);
          filename = 'entity-diagram.svg';
        } else {
          dataUrl = await toPng(viewport, {
            ...imageOptions,
            pixelRatio: 2, // Higher resolution
          });
          filename = 'entity-diagram.png';
        }

        // Download
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        notifications.show({
          title: 'Image downloaded',
          message: `Diagram saved as ${filename}`,
          color: 'green',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        notifications.show({
          title: 'Export Error',
          message: `Failed to export image: ${errorMessage}`,
          color: 'red',
        });
      }
    },
    [nodes, colorScheme, reactFlowWrapper],
  );

  return (
    <Paper p="xs" withBorder shadow="sm" role="toolbar" aria-label="Canvas tools">
      <Group gap="xs">
        {/* View Toggle */}
        <SegmentedControl
          size="xs"
          value={canvasView}
          onChange={(value) => setCanvasView(value as CanvasView)}
          data={[
            {
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconTable size={14} />
                  <span>Entities</span>
                </Group>
              ),
              value: CANVAS_VIEWS.ENTITIES,
            },
            {
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconServer size={14} />
                  <span>Services</span>
                </Group>
              ),
              value: CANVAS_VIEWS.SERVICES,
            },
            {
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconTable size={14} />
                  <IconServer size={14} />
                  <span>Both</span>
                </Group>
              ),
              value: CANVAS_VIEWS.BOTH,
            },
          ]}
        />

        {/* Add buttons based on view */}
        {(canvasView === CANVAS_VIEWS.ENTITIES || canvasView === CANVAS_VIEWS.BOTH) && (
          <Button
            size="xs"
            leftSection={<IconPlus size={14} aria-hidden="true" />}
            onClick={onAddEntity}
          >
            Add Entity
          </Button>
        )}
        {(canvasView === CANVAS_VIEWS.SERVICES || canvasView === CANVAS_VIEWS.BOTH) && (
          <Button
            size="xs"
            color="teal"
            leftSection={<IconPlus size={14} aria-hidden="true" />}
            onClick={onAddService}
          >
            Add Service
          </Button>
        )}

        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Tooltip label={`Auto-arrange ${canvasView}`}>
              <Button
                size="xs"
                variant="default"
                leftSection={<IconLayoutDistributeHorizontal size={14} aria-hidden="true" />}
                rightSection={<IconChevronDown size={12} aria-hidden="true" />}
                aria-haspopup="menu"
              >
                Auto Layout
              </Button>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Layout Style</Menu.Label>
            <Menu.Item onClick={() => handleAutoLayout('horizontal')}>
              Horizontal (Left to Right)
            </Menu.Item>
            <Menu.Item onClick={() => handleAutoLayout('vertical')}>
              Vertical (Top to Bottom)
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => handleAutoLayout('compact')}>Compact</Menu.Item>
            <Menu.Item onClick={() => handleAutoLayout('spacious')}>Spacious</Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" width={160}>
          <Menu.Target>
            <Tooltip label="Download diagram as image">
              <ActionIcon
                variant="default"
                size="md"
                aria-label="Export diagram menu"
                aria-haspopup="menu"
              >
                <IconCamera size={16} aria-hidden="true" />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Export Format</Menu.Label>
            <Menu.Item onClick={() => handleDownloadImage('png')}>PNG (High Quality)</Menu.Item>
            <Menu.Item onClick={() => handleDownloadImage('svg')}>SVG (Vector)</Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Text component="output" size="xs" c="dimmed" aria-live="polite">
          {canvasView === CANVAS_VIEWS.ENTITIES &&
            `${entities.length} entities \u00B7 ${relations.length} relations`}
          {canvasView === CANVAS_VIEWS.SERVICES &&
            `${services.length} services \u00B7 ${serviceConnections.length} connections`}
          {canvasView === CANVAS_VIEWS.BOTH &&
            `${entities.length} entities \u00B7 ${services.length} services`}
        </Text>
      </Group>
    </Paper>
  );
}
