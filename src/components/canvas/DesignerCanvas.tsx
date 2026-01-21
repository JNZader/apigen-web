import type { EdgeTypes, Node, NodeTypes } from '@xyflow/react';
import { Background, BackgroundVariant, Controls, MiniMap, Panel, ReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useMantineColorScheme, VisuallyHidden } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useCanvasUIStore } from '../../store/canvasUIStore';
import {
  useCanvasView,
  useEntities,
  useEntityActions,
  useEntityServiceFilter,
  useLayoutActions,
  useLayoutPreference,
  useNeedsAutoLayout,
  useRelations,
  useSelectedEntityId,
  useSelectedEntityIds,
  useSelectedServiceId,
  useServiceActions,
  useServiceConnections,
  useServices,
} from '../../store/projectStore';
import { CANVAS, CANVAS_VIEWS } from '../../utils/canvasConstants';
import { ServiceConnectionForm } from '../ServiceConnectionForm';
import { CanvasEmptyStates, CanvasHelpTip } from './CanvasEmptyStates';
import { CanvasToolbar } from './CanvasToolbar';
import { buildEntityViewDescription, buildServicesViewDescription } from './canvasAccessibility';
import { EntityNode } from './EntityNode';
import {
  useAutoLayout,
  useCanvasConnections,
  useCanvasEdges,
  useCanvasNodes,
  useNodeDragHandlers,
  useNodeSelection,
  useServiceConnectionForm,
} from './hooks';
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
  readonly onConfigureService?: (id: string) => void;
}

export function DesignerCanvas({
  onAddEntity,
  onEditEntity,
  onSelectEntity,
  onAddRelation,
  onAddService,
  onConfigureService,
}: Readonly<DesignerCanvasProps>) {
  const { colorScheme } = useMantineColorScheme();

  // Use atomic selectors for better performance
  const entities = useEntities();
  const relations = useRelations();
  const services = useServices();
  const serviceConnections = useServiceConnections();
  const selectedEntityId = useSelectedEntityId();
  const selectedEntityIds = useSelectedEntityIds();
  const selectedServiceId = useSelectedServiceId();
  const canvasView = useCanvasView();
  const entityServiceFilter = useEntityServiceFilter();
  const layoutPreference = useLayoutPreference();
  const needsAutoLayout = useNeedsAutoLayout();

  // Use action selectors for stable references
  const { removeEntity, toggleEntitySelection, clearEntitySelection } = useEntityActions();
  const { removeService, selectService } = useServiceActions();
  const { updateEntityPositions, setNeedsAutoLayout } = useLayoutActions();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Track which service is being hovered during entity drag (for visual feedback)
  const [dropTargetServiceId, setDropTargetServiceId] = useState<string | null>(null);

  // Service connection form state management
  const {
    connectionFormOpened,
    pendingConnection,
    editingConnection,
    handlePendingServiceConnection,
    handleEditServiceConnection,
    handleCloseConnectionForm,
  } = useServiceConnectionForm({ serviceConnections });

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

  // Use custom hooks for nodes and edges
  const { nodes, setNodes, onNodesChange, isDraggingRef } = useCanvasNodes({
    canvasView,
    entityServiceFilter,
    selectedEntityId,
    selectedEntityIds,
    selectedServiceId,
    dropTargetServiceId,
    onEditEntity,
    onConfigureService,
    onDeleteEntity: handleDeleteEntity,
    onDeleteService: handleDeleteService,
  });

  const { edges, onEdgesChange } = useCanvasEdges({
    canvasView,
    onEditServiceConnection: handleEditServiceConnection,
  });

  // Use custom hook for drag handlers
  const { handleNodesChange, handleNodeDrag, handleNodeDragStop } = useNodeDragHandlers({
    canvasView,
    entities,
    services,
    selectedEntityId,
    selectedEntityIds,
    selectedServiceId,
    isDraggingRef,
    setNodes,
    onNodesChange,
    setDropTargetServiceId,
  });

  // Use custom hook for connections
  const { onConnect } = useCanvasConnections({
    entities,
    services,
    onAddRelation,
    onPendingServiceConnection: handlePendingServiceConnection,
  });

  // Use custom hook for node selection
  const { onNodeClick, onPaneClick } = useNodeSelection({
    entities,
    services,
    onSelectEntity,
    selectService,
    toggleEntitySelection,
    clearEntitySelection,
  });

  // Auto-apply layout when needed (e.g., after importing entities)
  useAutoLayout({
    entities,
    relations,
    layoutPreference,
    needsAutoLayout,
    updateEntityPositions,
    setNeedsAutoLayout,
  });

  // Cleanup expanded state for deleted entities (prevents memory leaks)
  const cleanupDeletedEntities = useCanvasUIStore((state) => state.cleanupDeletedEntities);
  useEffect(() => {
    const entityIds = entities.map((e) => e.id);
    cleanupDeletedEntities(entityIds);
  }, [entities, cleanupDeletedEntities]);

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
    return canvasView === CANVAS_VIEWS.ENTITIES
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
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.05}
        maxZoom={2}
        snapToGrid
        snapGrid={[CANVAS.SNAP_GRID, CANVAS.SNAP_GRID]}
        elevateNodesOnSelect={false} // Prevent services from covering entities when selected
        defaultEdgeOptions={{
          type: canvasView === CANVAS_VIEWS.ENTITIES ? 'relation' : 'service-connection',
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
          <CanvasToolbar
            nodes={nodes}
            reactFlowWrapper={reactFlowWrapper}
            onAddEntity={onAddEntity}
            onAddService={onAddService}
          />
        </Panel>

        <CanvasEmptyStates
          canvasView={canvasView}
          entitiesCount={entities.length}
          servicesCount={services.length}
          onAddEntity={onAddEntity}
          onAddService={onAddService}
        />

        <CanvasHelpTip
          canvasView={canvasView}
          entitiesCount={entities.length}
          servicesCount={services.length}
        />
      </ReactFlow>

      {/* Service Connection Form for creating/editing connections */}
      <ServiceConnectionForm
        key={
          editingConnection?.id ??
          `${pendingConnection?.sourceServiceId}-${pendingConnection?.targetServiceId}`
        }
        opened={connectionFormOpened}
        onClose={handleCloseConnectionForm}
        pendingConnection={pendingConnection}
        editingConnection={editingConnection}
      />
    </div>
  );
}
