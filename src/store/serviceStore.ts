import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { ServiceDesign, TargetConfig } from '../types';
import { defaultServiceConfig, getNextServiceColor } from '../types';
import { useEntityStore } from './entityStore';

// ============================================================================
// Helper functions
// ============================================================================

function updateServiceEntityIds(
  service: ServiceDesign,
  entityId: string,
  targetServiceId: string,
): ServiceDesign {
  const filteredIds = service.entityIds.filter((id) => id !== entityId);
  const newEntityIds = service.id === targetServiceId ? [...filteredIds, entityId] : filteredIds;
  return { ...service, entityIds: newEntityIds };
}

function removeEntityFromServiceHelper(
  service: ServiceDesign,
  entityId: string,
  targetServiceId: string,
): ServiceDesign {
  if (service.id !== targetServiceId) return service;
  return { ...service, entityIds: service.entityIds.filter((id) => id !== entityId) };
}

function assignEntitiesToServiceHelper(
  service: ServiceDesign,
  entityIds: string[],
  targetServiceId: string,
): ServiceDesign {
  const entityIdSet = new Set(entityIds);
  const filteredIds = service.entityIds.filter((id) => !entityIdSet.has(id));

  if (service.id === targetServiceId) {
    const existingIds = new Set(service.entityIds);
    const newIds = entityIds.filter((id) => !existingIds.has(id));
    return { ...service, entityIds: [...filteredIds, ...newIds] };
  }
  return { ...service, entityIds: filteredIds };
}

// ============================================================================
// Store Interface
// ============================================================================

interface ServiceState {
  // State
  services: ServiceDesign[];
  selectedServiceId: string | null;

  // Actions
  addService: (name: string) => ServiceDesign;
  updateService: (id: string, updates: Partial<ServiceDesign>) => void;
  removeService: (id: string) => void;
  selectService: (id: string | null) => void;
  assignEntityToService: (entityId: string, serviceId: string) => void;
  assignEntitiesToService: (entityIds: string[], serviceId: string) => void;
  removeEntityFromService: (entityId: string, serviceId: string) => void;
  clearServices: () => void;

  // Target Config Actions (multi-language support)
  setServiceTargetConfig: (serviceId: string, targetConfig: TargetConfig | undefined) => void;

  // Layout
  updateServicePositions: (positions: Map<string, { x: number; y: number }>) => void;
  updateServiceDimensions: (id: string, width: number, height: number) => void;

  // Internal: callback for service removal (set by connection store)
  _onServiceRemove?: (serviceId: string) => void;
  _setOnServiceRemove: (callback: ((serviceId: string) => void) | undefined) => void;
}

// ============================================================================
// Store
// ============================================================================

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      // Initial state
      services: [],
      selectedServiceId: null,

      // Actions
      addService: (name) => {
        const serviceCount = get().services.length;
        const usedColors = get().services.map((s) => s.color);
        const color = getNextServiceColor(usedColors);

        const service: ServiceDesign = {
          id: nanoid(),
          name,
          description: '',
          color,
          position: { x: serviceCount * 450 + 50, y: 50 },
          width: 400,
          height: 300,
          entityIds: [],
          config: { ...defaultServiceConfig, port: 8080 + serviceCount },
        };
        set((state) => ({
          services: [...state.services, service],
          selectedServiceId: service.id,
        }));
        return service;
      },

      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      removeService: (id) => {
        const { _onServiceRemove } = get();
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
          selectedServiceId: state.selectedServiceId === id ? null : state.selectedServiceId,
        }));
        // Notify connection store to remove related connections
        _onServiceRemove?.(id);
      },

      selectService: (id) => set({ selectedServiceId: id }),

      assignEntityToService: (entityId, serviceId) =>
        set((state) => ({
          services: state.services.map((s) => updateServiceEntityIds(s, entityId, serviceId)),
        })),

      assignEntitiesToService: (entityIds, serviceId) =>
        set((state) => ({
          services: state.services.map((s) =>
            assignEntitiesToServiceHelper(s, entityIds, serviceId),
          ),
        })),

      removeEntityFromService: (entityId, serviceId) =>
        set((state) => ({
          services: state.services.map((s) =>
            removeEntityFromServiceHelper(s, entityId, serviceId),
          ),
        })),

      clearServices: () => {
        const { _onServiceRemove, services } = get();
        // Notify connection store to remove connections for each service
        for (const service of services) {
          _onServiceRemove?.(service.id);
        }
        set({ services: [], selectedServiceId: null });
      },

      // Target Config Actions (multi-language support)
      setServiceTargetConfig: (serviceId, targetConfig) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === serviceId ? { ...s, config: { ...s.config, targetConfig } } : s,
          ),
        })),

      // Layout
      updateServicePositions: (positions) =>
        set((state) => ({
          services: state.services.map((s) => {
            const newPos = positions.get(s.id);
            return newPos ? { ...s, position: newPos } : s;
          }),
        })),

      updateServiceDimensions: (id, width, height) =>
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, width, height } : s)),
        })),

      // Internal callbacks
      _onServiceRemove: undefined,
      _setOnServiceRemove: (callback) => set({ _onServiceRemove: callback }),
    }),
    {
      name: 'apigen-services',
      partialize: (state) => ({
        services: state.services,
        selectedServiceId: state.selectedServiceId,
      }),
    },
  ),
);

// ============================================================================
// Atomic Selectors
// ============================================================================

export const useServices = () => useServiceStore((state) => state.services);
export const useSelectedServiceId = () => useServiceStore((state) => state.selectedServiceId);

// Derived selectors
export const useSelectedService = () =>
  useServiceStore((state) =>
    state.selectedServiceId
      ? state.services.find((s) => s.id === state.selectedServiceId)
      : undefined,
  );

export const useServiceById = (id: string) =>
  useServiceStore((state) => state.services.find((s) => s.id === id));

export const useServiceCount = () => useServiceStore((state) => state.services.length);

// Optimized selector using Set for O(n) instead of O(n*m)
export const useEntitiesForService = (serviceId: string) => {
  const service = useServiceStore((state) => state.services.find((s) => s.id === serviceId));
  const entities = useEntityStore((state) => state.entities);

  if (!service) return [];
  const entityIdSet = new Set(service.entityIds);
  return entities.filter((e) => entityIdSet.has(e.id));
};

// ============================================================================
// Action Selectors
// ============================================================================

export const useServiceActions = () =>
  useServiceStore(
    useShallow((state) => ({
      addService: state.addService,
      updateService: state.updateService,
      removeService: state.removeService,
      selectService: state.selectService,
      assignEntityToService: state.assignEntityToService,
      assignEntitiesToService: state.assignEntitiesToService,
      removeEntityFromService: state.removeEntityFromService,
      clearServices: state.clearServices,
      updateServiceDimensions: state.updateServiceDimensions,
      setServiceTargetConfig: state.setServiceTargetConfig,
    })),
  );
