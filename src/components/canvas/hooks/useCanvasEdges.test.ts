import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRelationStore } from '../../../store/relationStore';
import { useServiceConnectionStore } from '../../../store/serviceConnectionStore';
import { createMockRelation, createMockServiceConnection } from '../../../test/factories';
import { resetAllStores } from '../../../test/utils';
import type { CanvasView } from '../../../utils/canvasConstants';
import { CANVAS_VIEWS } from '../../../utils/canvasConstants';
import { useCanvasEdges } from './useCanvasEdges';

// Mock @xyflow/react
const mockSetEdges = vi.fn();
const mockOnEdgesChange = vi.fn();

vi.mock('@xyflow/react', () => ({
  useEdgesState: vi.fn(() => [[], mockSetEdges, mockOnEdgesChange]),
}));

describe('useCanvasEdges', () => {
  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Entity View (Relations)', () => {
    it('should return empty edges when no relations exist', () => {
      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.ENTITIES,
        }),
      );

      expect(mockSetEdges).toHaveBeenCalledWith([]);
    });

    it('should build relation edges in entity view', () => {
      const relation = createMockRelation({
        sourceEntityId: 'entity-1',
        targetEntityId: 'entity-2',
        type: 'OneToMany',
      });

      useRelationStore.setState({ relations: [relation] });

      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.ENTITIES,
        }),
      );

      expect(mockSetEdges).toHaveBeenCalled();
      const edges = mockSetEdges.mock.calls[0][0];
      expect(edges).toHaveLength(1);
      expect(edges[0]).toMatchObject({
        id: relation.id,
        source: 'entity-1',
        target: 'entity-2',
        type: 'relation',
        data: {
          type: 'OneToMany',
        },
      });
    });

    it('should include onDelete handler in relation edge data', () => {
      const relation = createMockRelation();
      useRelationStore.setState({ relations: [relation] });

      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.ENTITIES,
        }),
      );

      const edges = mockSetEdges.mock.calls[0][0];
      expect(typeof edges[0].data.onDelete).toBe('function');
    });

    it('should remove relation when onDelete is called', () => {
      const relation = createMockRelation();
      useRelationStore.setState({ relations: [relation] });

      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.ENTITIES,
        }),
      );

      const edges = mockSetEdges.mock.calls[0][0];

      act(() => {
        edges[0].data.onDelete(relation.id);
      });

      expect(useRelationStore.getState().relations).toHaveLength(0);
    });
  });

  describe('Services View (Service Connections)', () => {
    it('should return empty edges when no service connections exist', () => {
      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.SERVICES,
        }),
      );

      expect(mockSetEdges).toHaveBeenCalledWith([]);
    });

    it('should build service connection edges in services view', () => {
      const connection = createMockServiceConnection({
        sourceServiceId: 'service-1',
        targetServiceId: 'service-2',
        communicationType: 'REST',
        label: 'API Call',
      });

      useServiceConnectionStore.setState({ serviceConnections: [connection] });

      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.SERVICES,
        }),
      );

      expect(mockSetEdges).toHaveBeenCalled();
      const edges = mockSetEdges.mock.calls[0][0];
      expect(edges).toHaveLength(1);
      expect(edges[0]).toMatchObject({
        id: connection.id,
        source: 'service-1',
        target: 'service-2',
        type: 'service-connection',
        data: {
          communicationType: 'REST',
          label: 'API Call',
        },
      });
    });

    it('should include handle positions for service connections', () => {
      const connection = createMockServiceConnection();
      useServiceConnectionStore.setState({ serviceConnections: [connection] });

      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.SERVICES,
        }),
      );

      const edges = mockSetEdges.mock.calls[0][0];
      expect(edges[0].sourceHandle).toBe('source-right');
      expect(edges[0].targetHandle).toBe('target-left');
    });

    it('should include onEdit handler when provided', () => {
      const connection = createMockServiceConnection();
      useServiceConnectionStore.setState({ serviceConnections: [connection] });

      const mockOnEdit = vi.fn();

      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.SERVICES,
          onEditServiceConnection: mockOnEdit,
        }),
      );

      const edges = mockSetEdges.mock.calls[0][0];
      expect(edges[0].data.onEdit).toBe(mockOnEdit);
    });

    it('should remove service connection when onDelete is called', () => {
      const connection = createMockServiceConnection();
      useServiceConnectionStore.setState({ serviceConnections: [connection] });

      renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.SERVICES,
        }),
      );

      const edges = mockSetEdges.mock.calls[0][0];

      act(() => {
        edges[0].data.onDelete(connection.id);
      });

      expect(useServiceConnectionStore.getState().serviceConnections).toHaveLength(0);
    });
  });

  describe('View Switching', () => {
    it('should switch from relations to service connections when view changes', () => {
      const relation = createMockRelation();
      const connection = createMockServiceConnection();

      useRelationStore.setState({ relations: [relation] });
      useServiceConnectionStore.setState({ serviceConnections: [connection] });

      const { rerender } = renderHook(
        ({ canvasView }: { canvasView: CanvasView }) => useCanvasEdges({ canvasView }),
        {
          initialProps: { canvasView: CANVAS_VIEWS.ENTITIES as CanvasView },
        },
      );

      // First call should be relation edges
      let edges = mockSetEdges.mock.calls[0][0];
      expect(edges[0].type).toBe('relation');

      // Switch to services view
      rerender({ canvasView: CANVAS_VIEWS.SERVICES as CanvasView });

      // Should now have service connection edges
      edges = mockSetEdges.mock.calls[mockSetEdges.mock.calls.length - 1][0];
      expect(edges[0].type).toBe('service-connection');
    });
  });

  describe('Return Values', () => {
    it('should return edges, setEdges, onEdgesChange, relations, and serviceConnections', () => {
      const relation = createMockRelation();
      const connection = createMockServiceConnection();

      useRelationStore.setState({ relations: [relation] });
      useServiceConnectionStore.setState({ serviceConnections: [connection] });

      const { result } = renderHook(() =>
        useCanvasEdges({
          canvasView: CANVAS_VIEWS.ENTITIES,
        }),
      );

      expect(result.current).toHaveProperty('edges');
      expect(result.current).toHaveProperty('setEdges');
      expect(result.current).toHaveProperty('onEdgesChange');
      expect(result.current.relations).toHaveLength(1);
      expect(result.current.serviceConnections).toHaveLength(1);
    });
  });
});
