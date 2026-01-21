import type { Node, NodeChange } from '@xyflow/react';
import { useNodesState } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { EntityServiceFilter } from '../../../store/layoutStore';
import { useEntities, useServiceActions, useServices } from '../../../store/projectStore';
import type { ServiceDesign } from '../../../types';
import { CANVAS_VIEWS, type CanvasView } from '../../../utils/canvasConstants';

interface UseCanvasNodesOptions {
  canvasView: CanvasView;
  entityServiceFilter: EntityServiceFilter;
  selectedEntityId: string | null;
  selectedEntityIds: string[];
  selectedServiceId: string | null;
  dropTargetServiceId: string | null;
  onEditEntity: (id: string) => void;
  onConfigureService?: (id: string) => void;
  onDeleteEntity: (id: string, name: string) => void;
  onDeleteService: (id: string, name: string) => void;
}

export function useCanvasNodes(options: UseCanvasNodesOptions) {
  const {
    canvasView,
    entityServiceFilter,
    selectedEntityId,
    selectedEntityIds,
    selectedServiceId,
    dropTargetServiceId,
    onEditEntity,
    onConfigureService,
    onDeleteEntity,
    onDeleteService,
  } = options;

  const allEntities = useEntities();
  const services = useServices();
  const { updateServiceDimensions } = useServiceActions();

  // Filter entities based on entityServiceFilter (only in entities view)
  const entities = useMemo(() => {
    if (canvasView !== CANVAS_VIEWS.ENTITIES || entityServiceFilter === 'all') {
      return allEntities;
    }

    if (entityServiceFilter === 'unassigned') {
      // Get all entity IDs that are assigned to any service
      const assignedEntityIds = new Set(services.flatMap((s) => s.entityIds));
      return allEntities.filter((e) => !assignedEntityIds.has(e.id));
    }

    // Filter by specific service ID
    const service = services.find((s) => s.id === entityServiceFilter);
    if (!service) {
      return allEntities; // Service not found, show all
    }
    const serviceEntityIds = new Set(service.entityIds);
    return allEntities.filter((e) => serviceEntityIds.has(e.id));
  }, [allEntities, services, entityServiceFilter, canvasView]);

  const [nodes, setNodes, onNodesChangeOriginal] = useNodesState<Node>([]);

  // Intercept onNodesChange to handle resizing persistence
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeOriginal(changes);

      // Check for dimension updates on service nodes and persist them
      for (const change of changes) {
        if (change.type === 'dimensions' && change.dimensions) {
          const service = services.find((s) => s.id === change.id);
          if (service) {
            updateServiceDimensions(
              change.id,
              change.dimensions.width,
              change.dimensions.height,
            );
          }
        }
      }
    },
    [onNodesChangeOriginal, services, updateServiceDimensions],
  );

  // Track if a drag operation is in progress to prevent node reconstruction
  const isDraggingRef = useRef(false);

  // Track if initial nodes have been set to avoid premature updates
  // This prevents "node not initialized" warnings from React Flow
  const isInitializedRef = useRef(false);

  // Calculate entity count for a service
  const getEntityCountForService = useCallback(
    (service: ServiceDesign) =>
      service.entityIds.filter((id) => entities.some((e) => e.id === id)).length,
    [entities],
  );

  // Get entity names for a service
  const getEntityNamesForService = useCallback(
    (service: ServiceDesign) =>
      service.entityIds
        .map((id) => entities.find((e) => e.id === id)?.name)
        .filter((name): name is string => name !== undefined),
    [entities],
  );

  // Create structural fingerprints that exclude positions/dimensions AND entityIds
  // Uses JSON.stringify for robust serialization (handles special characters in names)
  // This prevents node reconstruction on every position change or entity assignment
  const entityStructureKey = useMemo(
    () =>
      JSON.stringify(
        entities.map((e) => ({
          id: e.id,
          name: e.name,
          fieldCount: e.fields.length,
        })),
      ),
    [entities],
  );

  // Exclude entityIds from service structure key to prevent rebuilds during drag
  // entityIds changes are handled separately in the selection effect
  const serviceStructureKey = useMemo(
    () =>
      JSON.stringify(
        services.map((s) => ({
          id: s.id,
          name: s.name,
        })),
      ),
    [services],
  );

  // Track entityIds separately to update service node data without full rebuild
  const serviceEntityIdsKey = useMemo(
    () =>
      JSON.stringify(
        services.map((s) => ({
          id: s.id,
          entityIds: s.entityIds,
        })),
      ),
    [services],
  );

  // Build entity nodes
  // Using absolute positioning for all entities (no parent-child relationship)
  // This avoids React Flow's parent-child initialization issues and ensures visibility
  // z-index is handled via CSS (.react-flow__node-entity) for reliability
  const buildEntityNodes = useCallback(() => {
    return entities.map((entity) => ({
      id: entity.id,
      type: 'entity' as const,
      position: entity.position, // Always use absolute position
      selectable: true,
      selected: false,
      draggable: true,
      data: {
        entity,
        onEdit: onEditEntity,
        onDelete: (id: string) => onDeleteEntity(id, entity.name),
        isSelected: false,
      },
    }));
  }, [entities, onEditEntity, onDeleteEntity]);

  // Build service nodes
  // z-index is handled via CSS (.react-flow__node-service) for reliability
  const buildServiceNodes = useCallback(() => {
    return services.map((service) => ({
      id: service.id,
      type: 'service' as const,
      position: service.position,
      // Set dimensions - React Flow uses these for NodeResizer and parent-child positioning
      // Don't use style.width/height as it conflicts with NodeResizer
      width: service.width,
      height: service.height,
      selectable: true, // Enable selection for NodeResizer
      selected: false, // Initialize to false, will be updated by separate effect
      data: {
        service,
        entityCount: getEntityCountForService(service),
        entityNames: getEntityNamesForService(service),
        onDelete: (id: string) => onDeleteService(id, service.name),
        onConfigure: (id: string) => onConfigureService?.(id),
        isSelected: false, // Will be updated by separate effect
        isDropTarget: false, // Will be updated by separate effect
      },
    }));
  }, [
    services,
    onConfigureService,
    onDeleteService,
    getEntityCountForService,
    getEntityNamesForService,
  ]);

  // Sync nodes based on canvas view
  // Only rebuild when structure changes (not on position/dimension changes or entityIds)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally using structural keys instead of build functions to control rebuild timing
  useEffect(() => {
    // Skip rebuild during drag operations to prevent visual glitches
    if (isDraggingRef.current) {
      return;
    }

    if (canvasView === CANVAS_VIEWS.ENTITIES) {
      setNodes(buildEntityNodes());
    } else {
      setNodes(buildServiceNodes());
    }

    // Mark as initialized after first render
    // This allows subsequent effects to run safely
    if (!isInitializedRef.current) {
      // Use requestAnimationFrame to ensure React Flow has time to measure nodes
      requestAnimationFrame(() => {
        isInitializedRef.current = true;
      });
    }
  }, [
    canvasView,
    entityStructureKey,
    entityServiceFilter,
    serviceStructureKey,
    setNodes,
    buildEntityNodes,
    buildServiceNodes,
  ]);

  // Update service entity counts and names when entityIds change (without full rebuild)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Using serviceEntityIdsKey to trigger updates when entity assignments change
  useEffect(() => {
    // Skip during drag operations or before nodes are initialized
    if (isDraggingRef.current || !isInitializedRef.current) {
      return;
    }

    // Pre-compute service map for O(1) lookups (avoids nested functions in map callback)
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const service = serviceMap.get(node.id);
        if (service && node.type === 'service') {
          const newEntityCount = getEntityCountForService(service);
          const newEntityNames = getEntityNamesForService(service);
          if (
            node.data.entityCount !== newEntityCount ||
            JSON.stringify(node.data.entityNames) !== JSON.stringify(newEntityNames)
          ) {
            return {
              ...node,
              data: {
                ...node.data,
                service,
                entityCount: newEntityCount,
                entityNames: newEntityNames,
              },
            };
          }
        }
        return node;
      }),
    );
  }, [serviceEntityIdsKey, services, getEntityCountForService, getEntityNamesForService, setNodes]);

  // Update selection and drop target state without rebuilding nodes
  // This preserves node positions during drag operations
  // Note: We set both `selected` (for ReactFlow's native features like NodeResizer)
  // and `data.isSelected` (for our custom styling)
  // Entity selection considers both single selection AND multi-selection (Ctrl+Click)
  // We include structure keys in dependencies to ensure selection state is reapplied after node rebuilds
  // biome-ignore lint/correctness/useExhaustiveDependencies: Structure keys are intentionally included to trigger selection reapplication after node rebuilds
  useEffect(() => {
    // Skip before nodes are initialized to prevent "node not initialized" warnings
    if (!isInitializedRef.current) {
      return;
    }

    // Pre-compute entity ID set for O(1) lookups (avoids nested functions in map callback)
    const entityIdSet = new Set(entities.map((e) => e.id));
    const selectedEntityIdSet = new Set(selectedEntityIds);

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const isEntity = entityIdSet.has(node.id);
        if (isEntity) {
          // Entity is selected if it's the primary selection OR in multi-selection
          const newIsSelected =
            selectedEntityId === node.id || selectedEntityIdSet.has(node.id);
          // Always return updated node to ensure selection state is consistent
          return {
            ...node,
            selected: newIsSelected,
            data: { ...node.data, isSelected: newIsSelected },
          };
        }
        // Service node
        const newIsSelected = selectedServiceId === node.id;
        const newIsDropTarget = dropTargetServiceId === node.id;
        // Always return updated node to ensure selection state is consistent
        return {
          ...node,
          selected: newIsSelected,
          data: { ...node.data, isSelected: newIsSelected, isDropTarget: newIsDropTarget },
        };
      }),
    );
  }, [
    selectedEntityId,
    selectedEntityIds,
    selectedServiceId,
    dropTargetServiceId,
    entities,
    setNodes,
    // Include structure keys to reapply selection after node rebuilds
    entityStructureKey,
    serviceStructureKey,
  ]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    isDraggingRef,
    entities,
    allEntities,
    services,
  };
}
