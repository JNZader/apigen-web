import { describe, it, expect, beforeEach } from 'vitest';
import { useLayoutStore } from './layoutStore';
import { useEntityStore } from './entityStore';
import { useServiceStore } from './serviceStore';
import { CANVAS_VIEWS } from '../utils/canvasConstants';

describe('layoutStore', () => {
  beforeEach(() => {
    // Reset the stores before each test
    useLayoutStore.setState({
      canvasView: CANVAS_VIEWS.ENTITIES,
      layoutPreference: 'compact',
      needsAutoLayout: false,
      entityServiceFilter: 'all',
    });
    useEntityStore.setState({
      entities: [],
      selectedEntityId: null,
    });
    useServiceStore.setState({
      services: [],
      selectedServiceId: null,
    });
  });

  describe('setCanvasView', () => {
    it('should update canvas view to entities', () => {
      const { setCanvasView } = useLayoutStore.getState();

      setCanvasView(CANVAS_VIEWS.ENTITIES);

      expect(useLayoutStore.getState().canvasView).toBe(CANVAS_VIEWS.ENTITIES);
    });

    it('should update canvas view to services', () => {
      const { setCanvasView } = useLayoutStore.getState();

      setCanvasView(CANVAS_VIEWS.SERVICES);

      expect(useLayoutStore.getState().canvasView).toBe(CANVAS_VIEWS.SERVICES);
    });
  });

  describe('setLayoutPreference', () => {
    it('should update layout preference to compact', () => {
      const { setLayoutPreference } = useLayoutStore.getState();

      setLayoutPreference('compact');

      expect(useLayoutStore.getState().layoutPreference).toBe('compact');
    });

    it('should update layout preference to horizontal', () => {
      const { setLayoutPreference } = useLayoutStore.getState();

      setLayoutPreference('horizontal');

      expect(useLayoutStore.getState().layoutPreference).toBe('horizontal');
    });

    it('should update layout preference to vertical', () => {
      const { setLayoutPreference } = useLayoutStore.getState();

      setLayoutPreference('vertical');

      expect(useLayoutStore.getState().layoutPreference).toBe('vertical');
    });

    it('should update layout preference to spacious', () => {
      const { setLayoutPreference } = useLayoutStore.getState();

      setLayoutPreference('spacious');

      expect(useLayoutStore.getState().layoutPreference).toBe('spacious');
    });
  });

  describe('setNeedsAutoLayout', () => {
    it('should set needsAutoLayout to true', () => {
      const { setNeedsAutoLayout } = useLayoutStore.getState();

      setNeedsAutoLayout(true);

      expect(useLayoutStore.getState().needsAutoLayout).toBe(true);
    });

    it('should set needsAutoLayout to false', () => {
      useLayoutStore.setState({ needsAutoLayout: true });
      const { setNeedsAutoLayout } = useLayoutStore.getState();

      setNeedsAutoLayout(false);

      expect(useLayoutStore.getState().needsAutoLayout).toBe(false);
    });
  });

  describe('setEntityServiceFilter', () => {
    it('should set filter to all', () => {
      const { setEntityServiceFilter } = useLayoutStore.getState();

      setEntityServiceFilter('all');

      expect(useLayoutStore.getState().entityServiceFilter).toBe('all');
    });

    it('should set filter to unassigned', () => {
      const { setEntityServiceFilter } = useLayoutStore.getState();

      setEntityServiceFilter('unassigned');

      expect(useLayoutStore.getState().entityServiceFilter).toBe('unassigned');
    });

    it('should set filter to a specific service id', () => {
      const { setEntityServiceFilter } = useLayoutStore.getState();

      setEntityServiceFilter('service-123');

      expect(useLayoutStore.getState().entityServiceFilter).toBe('service-123');
    });
  });

  describe('updateEntityPositions', () => {
    it('should delegate to entityStore', () => {
      // Add an entity first - addEntity takes just a name string
      const entity = useEntityStore.getState().addEntity('TestEntity');

      const { updateEntityPositions } = useLayoutStore.getState();
      const positions = new Map([[entity.id, { x: 100, y: 200 }]]);

      updateEntityPositions(positions);

      const updatedEntities = useEntityStore.getState().entities;
      expect(updatedEntities[0].position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('updateServicePositions', () => {
    it('should delegate to serviceStore', () => {
      // Add a service first
      const service = useServiceStore.getState().addService('Test Service');

      const { updateServicePositions } = useLayoutStore.getState();
      const positions = new Map([[service.id, { x: 300, y: 400 }]]);

      updateServicePositions(positions);

      const services = useServiceStore.getState().services;
      expect(services[0].position).toEqual({ x: 300, y: 400 });
    });
  });
});
