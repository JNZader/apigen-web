import type { Node } from '@xyflow/react';
import { useNodesState } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useEntities, useServices } from '../../../store/projectStore';
import type { ServiceDesign } from '../../../types';
import { CANVAS_VIEWS, type CanvasView } from '../../../utils/canvasConstants';

interface UseCanvasNodesOptions {
  canvasView: CanvasView;
  selectedEntityId: string | null;
  selectedServiceId: string | null;
  dropTargetServiceId: string | null;
  onEditEntity: (id: string) => void;
  onEditService?: (id: string) => void;
  onConfigureService?: (id: string) => void;
  onDeleteEntity: (id: string, name: string) => void;
  onDeleteService: (id: string, name: string) => void;
}

export function useCanvasNodes(options: UseCanvasNodesOptions) {
  const {
    canvasView,
    selectedEntityId,
    selectedServiceId,
    dropTargetServiceId,
    onEditEntity,
    onEditService,
    onConfigureService,
    onDeleteEntity,
    onDeleteService,
  } = options;

  const entities = useEntities();
  const services = useServices();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  // Track if a drag operation is in progress to prevent node reconstruction
  const isDraggingRef = useRef(false);

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
  // This prevents node reconstruction on every position change or entity assignment
  const entityStructureKey = useMemo(
    () => entities.map((e) => `${e.id}:${e.name}:${e.fields.length}`).join(','),
    [entities],
  );

  // Exclude entityIds from service structure key to prevent rebuilds during drag
  // entityIds changes are handled separately in the selection effect
  const serviceStructureKey = useMemo(
    () => services.map((s) => `${s.id}:${s.name}`).join(','),
    [services],
  );

  // Track entityIds separately to update service node data without full rebuild
  const serviceEntityIdsKey = useMemo(
    () => services.map((s) => `${s.id}:${s.entityIds.join('-')}`).join(','),
    [services],
  );

  // Build entity nodes
  const buildEntityNodes = useCallback(() => {
    return entities.map((entity) => ({
      id: entity.id,
      type: 'entity' as const,
      position: entity.position,
      zIndex: 10, // Entities above services
      data: {
        entity,
        onEdit: onEditEntity,
        onDelete: (id: string) => onDeleteEntity(id, entity.name),
        isSelected: false, // Will be updated by separate effect
      },
    }));
  }, [entities, onEditEntity, onDeleteEntity]);

  // Build service nodes
  const buildServiceNodes = useCallback(() => {
    return services.map((service) => ({
      id: service.id,
      type: 'service' as const,
      position: service.position,
      // Set initial dimensions from service
      width: service.width,
      height: service.height,
      style: { width: service.width, height: service.height },
      zIndex: 1, // Services as background containers
      data: {
        service,
        entityCount: getEntityCountForService(service),
        entityNames: getEntityNamesForService(service),
        onEdit: (id: string) => onEditService?.(id),
        onDelete: (id: string) => onDeleteService(id, service.name),
        onConfigure: (id: string) => onConfigureService?.(id),
        isSelected: false, // Will be updated by separate effect
        isDropTarget: false, // Will be updated by separate effect
      },
    }));
  }, [
    services,
    onEditService,
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
    } else if (canvasView === CANVAS_VIEWS.SERVICES) {
      setNodes(buildServiceNodes());
    } else {
      // Both view - services first (background), then entities on top
      setNodes([...buildServiceNodes(), ...buildEntityNodes()]);
    }
  }, [
    canvasView,
    entityStructureKey,
    serviceStructureKey,
    setNodes,
    buildEntityNodes,
    buildServiceNodes,
  ]);

  // Update service entity counts and names when entityIds change (without full rebuild)
  // biome-ignore lint/correctness/useExhaustiveDependencies: Using serviceEntityIdsKey to trigger updates when entity assignments change
  useEffect(() => {
    // Skip during drag operations
    if (isDraggingRef.current) {
      return;
    }

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const service = services.find((s) => s.id === node.id);
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
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const isEntity = entities.some((e) => e.id === node.id);
        if (isEntity) {
          const newIsSelected = selectedEntityId === node.id;
          if (node.data.isSelected !== newIsSelected) {
            return { ...node, data: { ...node.data, isSelected: newIsSelected } };
          }
        } else {
          const newIsSelected = selectedServiceId === node.id;
          const newIsDropTarget = dropTargetServiceId === node.id;
          if (
            node.data.isSelected !== newIsSelected ||
            node.data.isDropTarget !== newIsDropTarget
          ) {
            return {
              ...node,
              data: { ...node.data, isSelected: newIsSelected, isDropTarget: newIsDropTarget },
            };
          }
        }
        return node;
      }),
    );
  }, [selectedEntityId, selectedServiceId, dropTargetServiceId, entities, setNodes]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    isDraggingRef,
    entities,
    services,
  };
}
