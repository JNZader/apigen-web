import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockEntity, createMockService } from '../../../test/factories';
import { useCanvasConnections } from './useCanvasConnections';

describe('useCanvasConnections', () => {
  const mockOnAddRelation = vi.fn();
  const mockOnPendingServiceConnection = vi.fn();

  const defaultEntities = [
    createMockEntity({ id: 'entity-1', name: 'User' }),
    createMockEntity({ id: 'entity-2', name: 'Product' }),
  ];

  const defaultServices = [
    createMockService({ id: 'service-1', name: 'UserService' }),
    createMockService({ id: 'service-2', name: 'ProductService' }),
  ];

  const defaultOptions = {
    entities: defaultEntities,
    services: defaultServices,
    onAddRelation: mockOnAddRelation,
    onPendingServiceConnection: mockOnPendingServiceConnection,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onConnect', () => {
    describe('Entity to Entity Connections', () => {
      it('should call onAddRelation when connecting two entities', () => {
        const { result } = renderHook(() => useCanvasConnections(defaultOptions));

        const connection = {
          source: 'entity-1',
          target: 'entity-2',
          sourceHandle: null,
          targetHandle: null,
        };

        result.current.onConnect(connection);

        expect(mockOnAddRelation).toHaveBeenCalledWith('entity-1', 'entity-2');
        expect(mockOnPendingServiceConnection).not.toHaveBeenCalled();
      });

      it('should not call onAddRelation when source equals target', () => {
        const { result } = renderHook(() => useCanvasConnections(defaultOptions));

        const connection = {
          source: 'entity-1',
          target: 'entity-1',
          sourceHandle: null,
          targetHandle: null,
        };

        result.current.onConnect(connection);

        expect(mockOnAddRelation).not.toHaveBeenCalled();
      });
    });

    describe('Service to Service Connections', () => {
      it('should call onPendingServiceConnection when connecting two services', () => {
        const { result } = renderHook(() => useCanvasConnections(defaultOptions));

        const connection = {
          source: 'service-1',
          target: 'service-2',
          sourceHandle: null,
          targetHandle: null,
        };

        result.current.onConnect(connection);

        expect(mockOnPendingServiceConnection).toHaveBeenCalledWith({
          sourceServiceId: 'service-1',
          targetServiceId: 'service-2',
        });
        expect(mockOnAddRelation).not.toHaveBeenCalled();
      });

      it('should not call onPendingServiceConnection when callback is not provided', () => {
        const { result } = renderHook(() =>
          useCanvasConnections({
            ...defaultOptions,
            onPendingServiceConnection: undefined,
          }),
        );

        const connection = {
          source: 'service-1',
          target: 'service-2',
          sourceHandle: null,
          targetHandle: null,
        };

        // Should not throw
        result.current.onConnect(connection);

        expect(mockOnAddRelation).not.toHaveBeenCalled();
      });
    });

    describe('Mixed Connections', () => {
      it('should not create connection from entity to service', () => {
        const { result } = renderHook(() => useCanvasConnections(defaultOptions));

        const connection = {
          source: 'entity-1',
          target: 'service-1',
          sourceHandle: null,
          targetHandle: null,
        };

        result.current.onConnect(connection);

        expect(mockOnAddRelation).not.toHaveBeenCalled();
        expect(mockOnPendingServiceConnection).not.toHaveBeenCalled();
      });

      it('should not create connection from service to entity', () => {
        const { result } = renderHook(() => useCanvasConnections(defaultOptions));

        const connection = {
          source: 'service-1',
          target: 'entity-1',
          sourceHandle: null,
          targetHandle: null,
        };

        result.current.onConnect(connection);

        expect(mockOnAddRelation).not.toHaveBeenCalled();
        expect(mockOnPendingServiceConnection).not.toHaveBeenCalled();
      });
    });

    describe('Invalid Connections', () => {
      it('should not create connection with null source', () => {
        const { result } = renderHook(() => useCanvasConnections(defaultOptions));

        const connection = {
          source: null,
          target: 'entity-2',
          sourceHandle: null,
          targetHandle: null,
        } as unknown as import('@xyflow/react').Connection;

        result.current.onConnect(connection);

        expect(mockOnAddRelation).not.toHaveBeenCalled();
        expect(mockOnPendingServiceConnection).not.toHaveBeenCalled();
      });

      it('should not create connection with null target', () => {
        const { result } = renderHook(() => useCanvasConnections(defaultOptions));

        const connection = {
          source: 'entity-1',
          target: null,
          sourceHandle: null,
          targetHandle: null,
        } as unknown as import('@xyflow/react').Connection;

        result.current.onConnect(connection);

        expect(mockOnAddRelation).not.toHaveBeenCalled();
        expect(mockOnPendingServiceConnection).not.toHaveBeenCalled();
      });

      it('should not create connection for unknown nodes', () => {
        const { result } = renderHook(() => useCanvasConnections(defaultOptions));

        const connection = {
          source: 'unknown-1',
          target: 'unknown-2',
          sourceHandle: null,
          targetHandle: null,
        };

        result.current.onConnect(connection);

        expect(mockOnAddRelation).not.toHaveBeenCalled();
        expect(mockOnPendingServiceConnection).not.toHaveBeenCalled();
      });
    });
  });

  describe('Callback Stability', () => {
    it('should maintain stable onConnect reference', () => {
      const { result, rerender } = renderHook(() => useCanvasConnections(defaultOptions));

      const initialOnConnect = result.current.onConnect;

      rerender();

      expect(result.current.onConnect).toBe(initialOnConnect);
    });

    it('should update onConnect when entities change', () => {
      const { result, rerender } = renderHook(
        ({ entities }) => useCanvasConnections({ ...defaultOptions, entities }),
        { initialProps: { entities: defaultEntities } },
      );

      const initialOnConnect = result.current.onConnect;

      const newEntities = [...defaultEntities, createMockEntity({ id: 'entity-3', name: 'Order' })];
      rerender({ entities: newEntities });

      expect(result.current.onConnect).not.toBe(initialOnConnect);
    });

    it('should update onConnect when services change', () => {
      const { result, rerender } = renderHook(
        ({ services }) => useCanvasConnections({ ...defaultOptions, services }),
        { initialProps: { services: defaultServices } },
      );

      const initialOnConnect = result.current.onConnect;

      const newServices = [
        ...defaultServices,
        createMockService({ id: 'service-3', name: 'OrderService' }),
      ];
      rerender({ services: newServices });

      expect(result.current.onConnect).not.toBe(initialOnConnect);
    });
  });
});
