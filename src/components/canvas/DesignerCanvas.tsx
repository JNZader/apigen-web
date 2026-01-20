import type { Connection, Edge, EdgeTypes, Node, NodeChange, NodeTypes } from '@xyflow/react';
import {
  Background,
  BackgroundVariant,
  Controls,
  getNodesBounds,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import '@xyflow/react/dist/style.css';
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
  VisuallyHidden,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconCamera,
  IconChevronDown,
  IconLayoutDistributeHorizontal,
  IconPlus,
  IconServer,
  IconTable,
} from '@tabler/icons-react';
import { toPng, toSvg } from 'html-to-image';
import {
  useCanvasView,
  useCanvasViewActions,
  useEntities,
  useEntityActions,
  useLayoutActions,
  useLayoutPreference,
  useNeedsAutoLayout,
  useRelationActions,
  useRelations,
  useSelectedEntityId,
  useSelectedServiceId,
  useServiceActions,
  useServiceConnectionActions,
  useServiceConnections,
  useServices,
} from '../../store/projectStore';
import type { CommunicationType, ServiceDesign } from '../../types';
import { defaultServiceConnectionConfig } from '../../types';
import { calculateAutoLayout, LAYOUT_PRESETS } from '../../utils/canvasLayout';
import { EntityNode } from './EntityNode';
import { RelationEdge } from './RelationEdge';
import { ServiceConnectionEdge } from './ServiceConnectionEdge';
import { ServiceNode } from './ServiceNode';

const nodeTypes: NodeTypes = {
  entity: EntityNode,
  service: ServiceNode,
};

const edgeTypes: EdgeTypes = {
  relation: RelationEdge,
  'service-connection': ServiceConnectionEdge,
};

interface DesignerCanvasProps {
  readonly onAddEntity: () => void;
  readonly onEditEntity: (id: string) => void;
  readonly onSelectEntity: (id: string | null) => void;
  readonly onAddRelation: (sourceId: string, targetId: string) => void;
  readonly onAddService?: () => void;
  readonly onEditService?: (id: string) => void;
  readonly onConfigureService?: (id: string) => void;
}

// Helper to generate entity view description for accessibility
function buildEntityViewDescription(
  entities: Array<{ id: string; name: string; fields: unknown[] }>,
  relations: Array<{ sourceEntityId: string; targetEntityId: string; type: string }>,
  selectedEntityId: string | null,
): string {
  if (entities.length === 0) {
    return 'Empty entity diagram canvas. Use the Add Entity button to create your first entity.';
  }

  const entityNames = entities.map((e) => e.name).join(', ');
  const relationDescriptions = relations.map((r) => {
    const source = entities.find((e) => e.id === r.sourceEntityId)?.name || 'Unknown';
    const target = entities.find((e) => e.id === r.targetEntityId)?.name || 'Unknown';
    return `${source} to ${target} (${r.type})`;
  });

  let description = `Entity diagram with ${entities.length} ${entities.length === 1 ? 'entity' : 'entities'}: ${entityNames}.`;

  if (relations.length > 0) {
    description += ` ${relations.length} ${relations.length === 1 ? 'relation' : 'relations'}: ${relationDescriptions.join('; ')}.`;
  }

  if (selectedEntityId) {
    const selected = entities.find((e) => e.id === selectedEntityId);
    if (selected) {
      description += ` Currently selected: ${selected.name} with ${selected.fields.length} fields.`;
    }
  }

  return description;
}

// Helper to generate services view description for accessibility
function buildServicesViewDescription(
  services: Array<{ id: string; name: string; entityIds: string[] }>,
  serviceConnections: Array<{
    sourceServiceId: string;
    targetServiceId: string;
    communicationType: string;
  }>,
  selectedServiceId: string | null,
): string {
  if (services.length === 0) {
    return 'Empty microservices canvas. Use the Add Service button to create your first service.';
  }

  const serviceNames = services.map((s) => s.name).join(', ');
  const connectionDescriptions = serviceConnections.map((c) => {
    const source = services.find((s) => s.id === c.sourceServiceId)?.name || 'Unknown';
    const target = services.find((s) => s.id === c.targetServiceId)?.name || 'Unknown';
    return `${source} to ${target} (${c.communicationType})`;
  });

  let description = `Microservices diagram with ${services.length} ${services.length === 1 ? 'service' : 'services'}: ${serviceNames}.`;

  if (serviceConnections.length > 0) {
    description += ` ${serviceConnections.length} ${serviceConnections.length === 1 ? 'connection' : 'connections'}: ${connectionDescriptions.join('; ')}.`;
  }

  if (selectedServiceId) {
    const selected = services.find((s) => s.id === selectedServiceId);
    if (selected) {
      description += ` Currently selected: ${selected.name} with ${selected.entityIds.length} entities.`;
    }
  }

  return description;
}

export function DesignerCanvas({
  onAddEntity,
  onEditEntity,
  onSelectEntity,
  onAddRelation,
  onAddService,
  onEditService,
  onConfigureService,
}: Readonly<DesignerCanvasProps>) {
  const { colorScheme } = useMantineColorScheme();

  // Use atomic selectors for better performance
  const entities = useEntities();
  const relations = useRelations();
  const services = useServices();
  const serviceConnections = useServiceConnections();
  const selectedEntityId = useSelectedEntityId();
  const selectedServiceId = useSelectedServiceId();
  const canvasView = useCanvasView();
  const layoutPreference = useLayoutPreference();
  const needsAutoLayout = useNeedsAutoLayout();

  // Use action selectors for stable references
  const { updateEntity, removeEntity } = useEntityActions();
  const { removeRelation } = useRelationActions();
  const { updateService, removeService, selectService } = useServiceActions();
  const { addServiceConnection, removeServiceConnection } = useServiceConnectionActions();
  const { setCanvasView } = useCanvasViewActions();
  const { updateEntityPositions, updateServicePositions, setLayoutPreference, setNeedsAutoLayout } =
    useLayoutActions();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Memoize delete handler to avoid recreation on every render
  const handleDeleteEntity = useCallback(
    (id: string, entityName: string) => {
      modals.openConfirmModal({
        title: 'Delete Entity',
        children: `Are you sure you want to delete "${entityName}"? This will also remove all its relations.`,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red', 'aria-label': 'Confirm deletion' },
        cancelProps: { 'aria-label': 'Cancel deletion' },
        onConfirm: () => removeEntity(id),
      });
    },
    [removeEntity],
  );

  // Memoize service delete handler
  const handleDeleteService = useCallback(
    (id: string, serviceName: string) => {
      modals.openConfirmModal({
        title: 'Delete Service',
        children: `Are you sure you want to delete "${serviceName}"? This will also remove all its connections.`,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red', 'aria-label': 'Confirm deletion' },
        cancelProps: { 'aria-label': 'Cancel deletion' },
        onConfirm: () => removeService(id),
      });
    },
    [removeService],
  );

  // Calculate entity count for a service
  const getEntityCountForService = useCallback(
    (service: ServiceDesign) =>
      service.entityIds.filter((id) => entities.some((e) => e.id === id)).length,
    [entities],
  );

  // Sync nodes based on canvas view
  useEffect(() => {
    if (canvasView === 'entities') {
      setNodes(
        entities.map((entity) => ({
          id: entity.id,
          type: 'entity',
          position: entity.position,
          data: {
            entity,
            onEdit: onEditEntity,
            onDelete: (id: string) => handleDeleteEntity(id, entity.name),
            isSelected: selectedEntityId === entity.id,
          },
        })),
      );
    } else {
      // Services view
      setNodes(
        services.map((service) => ({
          id: service.id,
          type: 'service',
          position: service.position,
          data: {
            service,
            entityCount: getEntityCountForService(service),
            onEdit: (id: string) => onEditService?.(id),
            onDelete: (id: string) => handleDeleteService(id, service.name),
            onConfigure: (id: string) => onConfigureService?.(id),
            isSelected: selectedServiceId === service.id,
          },
        })),
      );
    }
  }, [
    canvasView,
    entities,
    services,
    selectedEntityId,
    selectedServiceId,
    onEditEntity,
    onEditService,
    onConfigureService,
    handleDeleteEntity,
    handleDeleteService,
    getEntityCountForService,
    setNodes,
  ]);

  // Memoized relation delete handler
  const handleRelationDelete = useCallback(
    (id: string) => {
      removeRelation(id);
    },
    [removeRelation],
  );

  // Memoized service connection delete handler
  const handleServiceConnectionDelete = useCallback(
    (id: string) => {
      removeServiceConnection(id);
    },
    [removeServiceConnection],
  );

  // Sync edges based on canvas view
  useEffect(() => {
    if (canvasView === 'entities') {
      setEdges(
        relations.map((relation) => ({
          id: relation.id,
          source: relation.sourceEntityId,
          target: relation.targetEntityId,
          type: 'relation',
          data: {
            type: relation.type,
            onDelete: handleRelationDelete,
          },
        })),
      );
    } else {
      // Services view
      setEdges(
        serviceConnections.map((connection) => ({
          id: connection.id,
          source: connection.sourceServiceId,
          target: connection.targetServiceId,
          sourceHandle: 'source-right',
          targetHandle: 'target-left',
          type: 'service-connection',
          data: {
            communicationType: connection.communicationType,
            label: connection.label,
            config: connection.config,
            onDelete: handleServiceConnectionDelete,
          },
        })),
      );
    }
  }, [
    canvasView,
    relations,
    serviceConnections,
    handleRelationDelete,
    handleServiceConnectionDelete,
    setEdges,
  ]);

  // Auto-apply layout when needed (e.g., after importing entities)
  useEffect(() => {
    if (needsAutoLayout && entities.length > 0) {
      const positions = calculateAutoLayout(entities, relations, LAYOUT_PRESETS[layoutPreference]);
      updateEntityPositions(positions);
      setNeedsAutoLayout(false);
    }
  }, [
    needsAutoLayout,
    entities,
    relations,
    layoutPreference,
    updateEntityPositions,
    setNeedsAutoLayout,
  ]);

  // Debounced position update to avoid excessive store updates during drag
  const debouncedEntityPositionUpdate = useDebouncedCallback(
    (positions: Array<{ id: string; position: { x: number; y: number } }>) => {
      positions.forEach(({ id, position }) => {
        updateEntity(id, { position });
      });
    },
    100,
  );

  const debouncedServicePositionUpdate = useDebouncedCallback(
    (positions: Array<{ id: string; position: { x: number; y: number } }>) => {
      positions.forEach(({ id, position }) => {
        updateService(id, { position });
      });
    },
    100,
  );

  // Collect position changes during drag
  const pendingPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Handle node position changes with debouncing
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Collect position changes
      const positionChanges: Array<{ id: string; position: { x: number; y: number } }> = [];
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          pendingPositions.current.set(change.id, change.position);
          positionChanges.push({ id: change.id, position: change.position });
        }
      });

      // Debounce the store update based on canvas view
      if (positionChanges.length > 0) {
        if (canvasView === 'entities') {
          debouncedEntityPositionUpdate(positionChanges);
        } else {
          debouncedServicePositionUpdate(positionChanges);
        }
      }
    },
    [onNodesChange, canvasView, debouncedEntityPositionUpdate, debouncedServicePositionUpdate],
  );

  // Handle new connections (creating relations or service connections)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target && connection.source !== connection.target) {
        if (canvasView === 'entities') {
          onAddRelation(connection.source, connection.target);
        } else {
          // Create a service connection with default REST type
          addServiceConnection({
            sourceServiceId: connection.source,
            targetServiceId: connection.target,
            communicationType: 'REST' as CommunicationType,
            config: { ...defaultServiceConnectionConfig },
          });
        }
      }
    },
    [canvasView, onAddRelation, addServiceConnection],
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (canvasView === 'entities') {
        onSelectEntity(node.id);
      } else {
        selectService(node.id);
      }
    },
    [canvasView, onSelectEntity, selectService],
  );

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    if (canvasView === 'entities') {
      onSelectEntity(null);
    } else {
      selectService(null);
    }
  }, [canvasView, onSelectEntity, selectService]);

  // Auto-layout with dagre algorithm
  const handleAutoLayout = useCallback(
    (preset: keyof typeof LAYOUT_PRESETS = 'horizontal') => {
      if (canvasView === 'entities') {
        if (entities.length === 0) {
          notifications.show({
            title: 'No entities',
            message: 'Add at least one entity to auto-arrange',
            color: 'yellow',
          });
          return;
        }

        const positions = calculateAutoLayout(entities, relations, LAYOUT_PRESETS[preset]);
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
        const positions = new Map<string, { x: number; y: number }>();
        const cols = Math.ceil(Math.sqrt(services.length));
        services.forEach((service, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          positions.set(service.id, { x: col * 450 + 50, y: row * 350 + 50 });
        });
        updateServicePositions(positions);
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
    [nodes, colorScheme],
  );

  // Memoized nodeColor callback for MiniMap
  const getNodeColor = useCallback(
    (node: Node) => {
      if (node.data?.isSelected) return '#228be6';
      return colorScheme === 'dark' ? '#373A40' : '#dee2e6';
    },
    [colorScheme],
  );

  // Accessible description of canvas contents for screen readers
  const canvasDescription = useMemo(() => {
    return canvasView === 'entities'
      ? buildEntityViewDescription(entities, relations, selectedEntityId)
      : buildServicesViewDescription(services, serviceConnections, selectedServiceId);
  }, [
    canvasView,
    entities,
    relations,
    services,
    serviceConnections,
    selectedEntityId,
    selectedServiceId,
  ]);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100%' }}
      role="application"
      aria-label="Entity relationship diagram canvas"
      aria-describedby="canvas-description"
    >
      {/* Accessible description for screen readers */}
      <VisuallyHidden>
        <output id="canvas-description" aria-live="polite">
          {canvasDescription}
        </output>
      </VisuallyHidden>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.05}
        maxZoom={2}
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: canvasView === 'entities' ? 'relation' : 'service-connection',
        }}
        connectionLineStyle={{
          stroke: 'var(--mantine-color-blue-5)',
          strokeWidth: 2,
        }}
        style={{
          background: colorScheme === 'dark' ? '#1a1b1e' : '#f8f9fa',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={colorScheme === 'dark' ? '#373A40' : '#dee2e6'}
        />
        <Controls
          showZoom
          showFitView
          showInteractive={false}
          style={{
            background: colorScheme === 'dark' ? '#25262b' : 'white',
            borderRadius: 8,
          }}
        />
        <MiniMap
          nodeColor={getNodeColor}
          maskColor={colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
          style={{
            background: colorScheme === 'dark' ? '#25262b' : 'white',
            borderRadius: 8,
          }}
        />

        <Panel position="top-left">
          <Paper p="xs" withBorder shadow="sm" role="toolbar" aria-label="Canvas tools">
            <Group gap="xs">
              {/* View Toggle */}
              <SegmentedControl
                size="xs"
                value={canvasView}
                onChange={(value) => setCanvasView(value as 'entities' | 'services')}
                data={[
                  {
                    label: (
                      <Group gap={4} wrap="nowrap">
                        <IconTable size={14} />
                        <span>Entities</span>
                      </Group>
                    ),
                    value: 'entities',
                  },
                  {
                    label: (
                      <Group gap={4} wrap="nowrap">
                        <IconServer size={14} />
                        <span>Services</span>
                      </Group>
                    ),
                    value: 'services',
                  },
                ]}
              />

              {/* Add button based on view */}
              {canvasView === 'entities' ? (
                <Button
                  size="xs"
                  leftSection={<IconPlus size={14} aria-hidden="true" />}
                  onClick={onAddEntity}
                >
                  Add Entity
                </Button>
              ) : (
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
                    Horizontal (Left → Right)
                  </Menu.Item>
                  <Menu.Item onClick={() => handleAutoLayout('vertical')}>
                    Vertical (Top → Bottom)
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
                  <Menu.Item onClick={() => handleDownloadImage('png')}>
                    PNG (High Quality)
                  </Menu.Item>
                  <Menu.Item onClick={() => handleDownloadImage('svg')}>SVG (Vector)</Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Text component="output" size="xs" c="dimmed" aria-live="polite">
                {canvasView === 'entities'
                  ? `${entities.length} entities · ${relations.length} relations`
                  : `${services.length} services · ${serviceConnections.length} connections`}
              </Text>
            </Group>
          </Paper>
        </Panel>

        {/* Empty state for entities view */}
        {canvasView === 'entities' && entities.length === 0 && (
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
        {canvasView === 'services' && services.length === 0 && (
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
                Services can contain entities and connect to each other via REST, gRPC, or
                messaging.
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
      </ReactFlow>
    </div>
  );
}
