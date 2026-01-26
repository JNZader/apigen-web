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
import { useDisclosure } from '@mantine/hooks';
import {
  IconApi,
  IconCamera,
  IconChevronDown,
  IconLayoutDistributeHorizontal,
  IconPlus,
  IconServer,
  IconTable,
  IconUpload,
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
  useEntityServiceFilter,
  useLayoutActions,
  useRelations,
  useServiceConnections,
  useServices,
} from '../../store/projectStore';
import { CANVAS_VIEWS } from '../../utils/canvasConstants';
import {
  calculateAutoLayout,
  calculateServiceLayout,
  LAYOUT_PRESETS,
} from '../../utils/canvasLayout';
import { notify } from '../../utils/notifications';
import { EntityServiceTabs } from './EntityServiceTabs';
import { OpenApiImportModal } from './OpenApiImportModal';

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
  const [openApiModalOpened, { open: openOpenApiModal, close: closeOpenApiModal }] =
    useDisclosure(false);

  const entities = useEntities();
  const relations = useRelations();
  const services = useServices();
  const serviceConnections = useServiceConnections();
  const canvasView = useCanvasView();
  const entityServiceFilter = useEntityServiceFilter();

  const { setCanvasView } = useCanvasViewActions();
  const { updateEntityPositions, updateServicePositions, setLayoutPreference } = useLayoutActions();

  // Auto-layout with ELK algorithm
  const handleAutoLayout = useCallback(
    async (preset: keyof typeof LAYOUT_PRESETS = 'horizontal') => {
      if (canvasView === CANVAS_VIEWS.ENTITIES) {
        if (entities.length === 0) {
          notify.warning({
            title: 'No entities',
            message: 'Add at least one entity to auto-arrange',
          });
          return;
        }

        const positions = await calculateAutoLayout(entities, relations, LAYOUT_PRESETS[preset]);
        updateEntityPositions(positions);
        setLayoutPreference(preset);

        notify.success({
          title: 'Layout applied',
          message: `Entities arranged using ${preset} layout`,
        });
      } else {
        if (services.length === 0) {
          notify.warning({
            title: 'No services',
            message: 'Add at least one service to auto-arrange',
          });
          return;
        }

        // Layout services using ELK (respects connections and dimensions)
        const servicePositions = await calculateServiceLayout(
          services,
          serviceConnections,
          LAYOUT_PRESETS[preset],
        );
        updateServicePositions(servicePositions);

        setLayoutPreference(preset);

        notify.success({
          title: 'Layout applied',
          message: `Services arranged using ${preset} layout`,
        });
      }
    },
    [
      canvasView,
      entities,
      relations,
      services,
      serviceConnections,
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
        notify.error({
          title: 'Error',
          message: 'Could not capture canvas',
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

        notify.success({
          title: 'Image downloaded',
          message: `Diagram saved as ${filename}`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        notify.error({
          title: 'Export Error',
          message: `Failed to export image: ${errorMessage}`,
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
          ]}
        />

        {/* Service filter tabs - only in entities view with services */}
        {canvasView === CANVAS_VIEWS.ENTITIES && services.length > 0 && (
          <EntityServiceTabs entityServiceFilter={entityServiceFilter} />
        )}

        {/* Add buttons based on view */}
        {canvasView === CANVAS_VIEWS.ENTITIES && (
          <Button
            size="xs"
            leftSection={<IconPlus size={14} aria-hidden="true" />}
            onClick={onAddEntity}
          >
            Add Entity
          </Button>
        )}
        {canvasView === CANVAS_VIEWS.SERVICES && (
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

        {/* Import Menu - only in entities view */}
        {canvasView === CANVAS_VIEWS.ENTITIES && (
          <Menu shadow="md" width={180}>
            <Menu.Target>
              <Tooltip label="Import entities">
                <ActionIcon
                  variant="default"
                  size="md"
                  aria-label="Import menu"
                  aria-haspopup="menu"
                >
                  <IconUpload size={16} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Import From</Menu.Label>
              <Menu.Item
                leftSection={<IconApi size={14} />}
                onClick={openOpenApiModal}
              >
                OpenAPI / Swagger
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}

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
        </Text>
      </Group>

      {/* OpenAPI Import Modal */}
      <OpenApiImportModal
        opened={openApiModalOpened}
        onClose={closeOpenApiModal}
        onImportComplete={() => handleAutoLayout('horizontal')}
      />
    </Paper>
  );
}
