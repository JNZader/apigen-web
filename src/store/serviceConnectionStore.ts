import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { ServiceConnectionDesign } from '../types';
import { defaultServiceConnectionConfig } from '../types';
import { useServiceStore } from './serviceStore';

// ============================================================================
// Store Interface
// ============================================================================

interface ServiceConnectionState {
  // State
  serviceConnections: ServiceConnectionDesign[];

  // Actions
  addServiceConnection: (connection: Omit<ServiceConnectionDesign, 'id'>) => void;
  updateServiceConnection: (id: string, updates: Partial<ServiceConnectionDesign>) => void;
  removeServiceConnection: (id: string) => void;
  setServiceConnections: (connections: ServiceConnectionDesign[]) => void;

  // Internal: remove connections for service
  removeConnectionsForService: (serviceId: string) => void;
}

// ============================================================================
// Store
// ============================================================================

export const useServiceConnectionStore = create<ServiceConnectionState>()(
  persist(
    (set) => ({
      // Initial state
      serviceConnections: [],

      // Actions
      addServiceConnection: (connection) =>
        set((state) => ({
          serviceConnections: [
            ...state.serviceConnections,
            {
              ...connection,
              id: nanoid(),
              config: { ...defaultServiceConnectionConfig, ...connection.config },
            },
          ],
        })),

      updateServiceConnection: (id, updates) =>
        set((state) => ({
          serviceConnections: state.serviceConnections.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),

      removeServiceConnection: (id) =>
        set((state) => ({
          serviceConnections: state.serviceConnections.filter((c) => c.id !== id),
        })),

      setServiceConnections: (connections) => set({ serviceConnections: connections }),

      // Internal action
      removeConnectionsForService: (serviceId) =>
        set((state) => ({
          serviceConnections: state.serviceConnections.filter(
            (c) => c.sourceServiceId !== serviceId && c.targetServiceId !== serviceId,
          ),
        })),
    }),
    {
      name: 'apigen-service-connections',
      partialize: (state) => ({
        serviceConnections: state.serviceConnections,
      }),
    },
  ),
);

// ============================================================================
// Subscribe to service removal
// ============================================================================

// Set up subscription to service store for cleanup
useServiceStore.getState()._setOnServiceRemove((serviceId) => {
  useServiceConnectionStore.getState().removeConnectionsForService(serviceId);
});

// ============================================================================
// Atomic Selectors
// ============================================================================

export const useServiceConnections = () =>
  useServiceConnectionStore((state) => state.serviceConnections);

// ============================================================================
// Action Selectors
// ============================================================================

export const useServiceConnectionActions = () =>
  useServiceConnectionStore(
    useShallow((state) => ({
      addServiceConnection: state.addServiceConnection,
      updateServiceConnection: state.updateServiceConnection,
      removeServiceConnection: state.removeServiceConnection,
    })),
  );
