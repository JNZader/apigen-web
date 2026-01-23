import { beforeEach, describe, expect, it } from 'vitest';
import { useServiceStore } from './serviceStore';

describe('serviceStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useServiceStore.setState({
      services: [],
      selectedServiceId: null,
      _onServiceRemove: undefined,
    });
  });

  describe('addService', () => {
    it('should add a new service with generated id', () => {
      const { addService } = useServiceStore.getState();

      const service = addService('Test Service');

      expect(service.id).toBeDefined();
      expect(service.name).toBe('Test Service');
      expect(service.entityIds).toEqual([]);
      expect(service.position).toBeDefined();

      const { services } = useServiceStore.getState();
      expect(services).toHaveLength(1);
      expect(services[0]).toEqual(service);
    });

    it('should auto-select the newly added service', () => {
      const { addService } = useServiceStore.getState();

      const service = addService('New Service');

      const { selectedServiceId } = useServiceStore.getState();
      expect(selectedServiceId).toBe(service.id);
    });

    it('should assign unique colors to services', () => {
      const { addService } = useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      expect(service1.color).not.toBe(service2.color);
    });

    it('should position services incrementally', () => {
      const { addService } = useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      expect(service2.position.x).toBeGreaterThan(service1.position.x);
    });

    it('should increment port for each service', () => {
      const { addService } = useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      expect(service2.config.port).toBe(service1.config.port + 1);
    });
  });

  describe('updateService', () => {
    it('should update service properties', () => {
      const { addService, updateService } = useServiceStore.getState();

      const service = addService('Original');
      updateService(service.id, { name: 'Updated', description: 'New description' });

      const { services } = useServiceStore.getState();
      expect(services[0].name).toBe('Updated');
      expect(services[0].description).toBe('New description');
    });

    it('should not affect other services', () => {
      const { addService, updateService } = useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      updateService(service1.id, { name: 'Updated' });

      const { services } = useServiceStore.getState();
      expect(services.find((s) => s.id === service2.id)?.name).toBe('Service 2');
    });
  });

  describe('removeService', () => {
    it('should remove the service from the list', () => {
      const { addService, removeService } = useServiceStore.getState();

      const service = addService('To Remove');
      expect(useServiceStore.getState().services).toHaveLength(1);

      removeService(service.id);
      expect(useServiceStore.getState().services).toHaveLength(0);
    });

    it('should clear selection if removed service was selected', () => {
      const { addService, removeService } = useServiceStore.getState();

      const service = addService('Selected Service');
      expect(useServiceStore.getState().selectedServiceId).toBe(service.id);

      removeService(service.id);
      expect(useServiceStore.getState().selectedServiceId).toBeNull();
    });

    it('should not clear selection if different service was selected', () => {
      const { addService, removeService, selectService } = useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      selectService(service1.id);
      removeService(service2.id);

      expect(useServiceStore.getState().selectedServiceId).toBe(service1.id);
    });

    it('should call _onServiceRemove callback if set', () => {
      const { addService, removeService, _setOnServiceRemove } = useServiceStore.getState();

      let removedId: string | null = null;
      _setOnServiceRemove((id) => {
        removedId = id;
      });

      const service = addService('Service');
      removeService(service.id);

      expect(removedId).toBe(service.id);
    });
  });

  describe('selectService', () => {
    it('should update selectedServiceId', () => {
      const { addService, selectService } = useServiceStore.getState();

      const service = addService('Service');
      selectService(null);
      expect(useServiceStore.getState().selectedServiceId).toBeNull();

      selectService(service.id);
      expect(useServiceStore.getState().selectedServiceId).toBe(service.id);
    });
  });

  describe('assignEntityToService', () => {
    it('should add entity id to service', () => {
      const { addService, assignEntityToService } = useServiceStore.getState();

      const service = addService('Service');
      assignEntityToService('entity-1', service.id);

      const { services } = useServiceStore.getState();
      expect(services[0].entityIds).toContain('entity-1');
    });

    it('should remove entity from other services when reassigning', () => {
      const { addService, assignEntityToService } = useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      assignEntityToService('entity-1', service1.id);
      expect(useServiceStore.getState().services[0].entityIds).toContain('entity-1');

      assignEntityToService('entity-1', service2.id);
      const { services } = useServiceStore.getState();
      expect(services[0].entityIds).not.toContain('entity-1');
      expect(services[1].entityIds).toContain('entity-1');
    });
  });

  describe('assignEntitiesToService', () => {
    it('should add multiple entities to service', () => {
      const { addService, assignEntitiesToService } = useServiceStore.getState();

      const service = addService('Service');
      assignEntitiesToService(['entity-1', 'entity-2', 'entity-3'], service.id);

      const { services } = useServiceStore.getState();
      expect(services[0].entityIds).toEqual(['entity-1', 'entity-2', 'entity-3']);
    });

    it('should remove entities from other services', () => {
      const { addService, assignEntityToService, assignEntitiesToService } =
        useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      assignEntityToService('entity-1', service1.id);
      assignEntityToService('entity-2', service1.id);

      assignEntitiesToService(['entity-1', 'entity-2'], service2.id);

      const { services } = useServiceStore.getState();
      expect(services[0].entityIds).not.toContain('entity-1');
      expect(services[0].entityIds).not.toContain('entity-2');
      expect(services[1].entityIds).toContain('entity-1');
      expect(services[1].entityIds).toContain('entity-2');
    });

    it('should add new entities to service', () => {
      const { addService, assignEntitiesToService } = useServiceStore.getState();

      const service = addService('Service');
      assignEntitiesToService(['entity-1', 'entity-2'], service.id);

      const { services } = useServiceStore.getState();
      expect(services[0].entityIds).toContain('entity-1');
      expect(services[0].entityIds).toContain('entity-2');
      expect(services[0].entityIds).toHaveLength(2);
    });
  });

  describe('removeEntityFromService', () => {
    it('should remove entity from specified service', () => {
      const { addService, assignEntityToService, removeEntityFromService } =
        useServiceStore.getState();

      const service = addService('Service');
      assignEntityToService('entity-1', service.id);
      expect(useServiceStore.getState().services[0].entityIds).toContain('entity-1');

      removeEntityFromService('entity-1', service.id);
      expect(useServiceStore.getState().services[0].entityIds).not.toContain('entity-1');
    });

    it('should not affect other services', () => {
      const { addService, assignEntityToService, removeEntityFromService } =
        useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      assignEntityToService('entity-1', service1.id);
      assignEntityToService('entity-1', service2.id);

      removeEntityFromService('entity-1', service1.id);

      const { services } = useServiceStore.getState();
      expect(services[1].entityIds).toContain('entity-1');
    });
  });

  describe('clearServices', () => {
    it('should remove all services', () => {
      const { addService, clearServices } = useServiceStore.getState();

      addService('Service 1');
      addService('Service 2');
      expect(useServiceStore.getState().services).toHaveLength(2);

      clearServices();
      expect(useServiceStore.getState().services).toHaveLength(0);
    });

    it('should clear selection', () => {
      const { addService, clearServices } = useServiceStore.getState();

      addService('Service');
      clearServices();

      expect(useServiceStore.getState().selectedServiceId).toBeNull();
    });

    it('should call _onServiceRemove for each service', () => {
      const { addService, clearServices, _setOnServiceRemove } = useServiceStore.getState();

      const removedIds: string[] = [];
      _setOnServiceRemove((id) => {
        removedIds.push(id);
      });

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');

      clearServices();

      expect(removedIds).toContain(service1.id);
      expect(removedIds).toContain(service2.id);
    });
  });

  describe('updateServicePositions', () => {
    it('should update positions for services in the map', () => {
      const { addService, updateServicePositions } = useServiceStore.getState();

      const service = addService('Service');
      const positions = new Map([[service.id, { x: 100, y: 200 }]]);

      updateServicePositions(positions);

      const { services } = useServiceStore.getState();
      expect(services[0].position).toEqual({ x: 100, y: 200 });
    });

    it('should not affect services not in the map', () => {
      const { addService, updateServicePositions } = useServiceStore.getState();

      const service1 = addService('Service 1');
      const service2 = addService('Service 2');
      const originalPosition = { ...useServiceStore.getState().services[1].position };

      const positions = new Map([[service1.id, { x: 100, y: 200 }]]);
      updateServicePositions(positions);

      const { services } = useServiceStore.getState();
      expect(services.find((s) => s.id === service2.id)?.position).toEqual(originalPosition);
    });
  });

  describe('updateServiceDimensions', () => {
    it('should update width and height of service', () => {
      const { addService, updateServiceDimensions } = useServiceStore.getState();

      const service = addService('Service');
      updateServiceDimensions(service.id, 500, 400);

      const { services } = useServiceStore.getState();
      expect(services[0].width).toBe(500);
      expect(services[0].height).toBe(400);
    });
  });

  describe('_setOnServiceRemove', () => {
    it('should set the callback function', () => {
      const { _setOnServiceRemove } = useServiceStore.getState();

      const callback = (_id: string) => {};
      _setOnServiceRemove(callback);

      expect(useServiceStore.getState()._onServiceRemove).toBe(callback);
    });

    it('should allow clearing the callback', () => {
      const { _setOnServiceRemove } = useServiceStore.getState();

      _setOnServiceRemove((_id: string) => {});
      _setOnServiceRemove(undefined);

      expect(useServiceStore.getState()._onServiceRemove).toBeUndefined();
    });
  });
});
