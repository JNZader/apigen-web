import { describe, it, expect, beforeEach } from 'vitest';
import { useServiceConnectionStore } from './serviceConnectionStore';
import type { ServiceConnectionDesign } from '../types';

// Helper to create a mock connection without id
function createMockConnection(
  sourceServiceId: string,
  targetServiceId: string,
): Omit<ServiceConnectionDesign, 'id'> {
  return {
    sourceServiceId,
    targetServiceId,
    communicationType: 'REST',
    config: {
      timeout: 30000,
      retryAttempts: 3,
    },
  };
}

describe('serviceConnectionStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useServiceConnectionStore.setState({
      serviceConnections: [],
    });
  });

  describe('addServiceConnection', () => {
    it('should add a new connection with generated id', () => {
      const { addServiceConnection } = useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections).toHaveLength(1);
      expect(serviceConnections[0].id).toBeDefined();
      expect(serviceConnections[0].sourceServiceId).toBe('service-1');
      expect(serviceConnections[0].targetServiceId).toBe('service-2');
    });

    it('should merge default config with provided config', () => {
      const { addServiceConnection } = useServiceConnectionStore.getState();

      addServiceConnection({
        sourceServiceId: 'service-1',
        targetServiceId: 'service-2',
        communicationType: 'gRPC',
        config: {
          timeout: 5000,
        },
      });

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections[0].config.timeout).toBe(5000);
      // Default values should still be present
      expect(serviceConnections[0].config).toBeDefined();
    });

    it('should add multiple connections', () => {
      const { addServiceConnection } = useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-2', 'service-3'));

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections).toHaveLength(2);
    });

    it('should generate unique ids for each connection', () => {
      const { addServiceConnection } = useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-1', 'service-3'));

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections[0].id).not.toBe(serviceConnections[1].id);
    });
  });

  describe('updateServiceConnection', () => {
    it('should update connection properties', () => {
      const { addServiceConnection, updateServiceConnection } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      const {
        serviceConnections: [connection],
      } = useServiceConnectionStore.getState();

      updateServiceConnection(connection.id, { communicationType: 'gRPC' });

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections[0].communicationType).toBe('gRPC');
    });

    it('should not affect other connections', () => {
      const { addServiceConnection, updateServiceConnection } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-2', 'service-3'));

      const { serviceConnections } = useServiceConnectionStore.getState();
      updateServiceConnection(serviceConnections[0].id, { communicationType: 'gRPC' });

      const updatedConnections = useServiceConnectionStore.getState().serviceConnections;
      expect(updatedConnections[1].communicationType).toBe('REST');
    });
  });

  describe('removeServiceConnection', () => {
    it('should remove the connection from the list', () => {
      const { addServiceConnection, removeServiceConnection } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      const {
        serviceConnections: [connection],
      } = useServiceConnectionStore.getState();

      removeServiceConnection(connection.id);

      expect(useServiceConnectionStore.getState().serviceConnections).toHaveLength(0);
    });

    it('should only remove the specified connection', () => {
      const { addServiceConnection, removeServiceConnection } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-2', 'service-3'));

      const { serviceConnections } = useServiceConnectionStore.getState();
      removeServiceConnection(serviceConnections[0].id);

      const updatedConnections = useServiceConnectionStore.getState().serviceConnections;
      expect(updatedConnections).toHaveLength(1);
      expect(updatedConnections[0].sourceServiceId).toBe('service-2');
    });
  });

  describe('setServiceConnections', () => {
    it('should replace all connections', () => {
      const { addServiceConnection, setServiceConnections } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-2', 'service-3'));

      const newConnections: ServiceConnectionDesign[] = [
        {
          id: 'new-connection-1',
          sourceServiceId: 'service-a',
          targetServiceId: 'service-b',
          communicationType: 'Kafka',
          config: {},
        },
      ];

      setServiceConnections(newConnections);

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections).toHaveLength(1);
      expect(serviceConnections[0].id).toBe('new-connection-1');
    });

    it('should clear all connections when set to empty array', () => {
      const { addServiceConnection, setServiceConnections } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));

      setServiceConnections([]);

      expect(useServiceConnectionStore.getState().serviceConnections).toHaveLength(0);
    });
  });

  describe('removeConnectionsForService', () => {
    it('should remove connections where service is source', () => {
      const { addServiceConnection, removeConnectionsForService } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-1', 'service-3'));
      addServiceConnection(createMockConnection('service-2', 'service-3'));

      removeConnectionsForService('service-1');

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections).toHaveLength(1);
      expect(serviceConnections[0].sourceServiceId).toBe('service-2');
    });

    it('should remove connections where service is target', () => {
      const { addServiceConnection, removeConnectionsForService } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-3', 'service-2'));
      addServiceConnection(createMockConnection('service-1', 'service-3'));

      removeConnectionsForService('service-2');

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections).toHaveLength(1);
      expect(serviceConnections[0].sourceServiceId).toBe('service-1');
      expect(serviceConnections[0].targetServiceId).toBe('service-3');
    });

    it('should remove all connections for service in both directions', () => {
      const { addServiceConnection, removeConnectionsForService } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-2', 'service-1'));

      removeConnectionsForService('service-1');

      expect(useServiceConnectionStore.getState().serviceConnections).toHaveLength(0);
    });

    it('should not affect connections not involving the service', () => {
      const { addServiceConnection, removeConnectionsForService } =
        useServiceConnectionStore.getState();

      addServiceConnection(createMockConnection('service-1', 'service-2'));
      addServiceConnection(createMockConnection('service-3', 'service-4'));

      removeConnectionsForService('service-1');

      const { serviceConnections } = useServiceConnectionStore.getState();
      expect(serviceConnections).toHaveLength(1);
      expect(serviceConnections[0].sourceServiceId).toBe('service-3');
    });
  });
});
