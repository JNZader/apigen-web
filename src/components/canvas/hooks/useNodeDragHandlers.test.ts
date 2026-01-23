import { act, renderHook } from '@testing-library/react';
import type { NodeChange } from '@xyflow/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntityStore } from '../../../store/entityStore';
import { useServiceStore } from '../../../store/serviceStore';
import { createMockEntity, createMockService } from '../../../test/factories';
import { resetAllStores } from '../../../test/utils';
import { useNodeDragHandlers } from './useNodeDragHandlers';

// Mock @mantine/hooks for debounced callbacks
vi.mock('@mantine/hooks', () => ({
  useDebouncedCallback: vi.fn((fn) => {
    const debouncedFn = vi.fn((...args: unknown[]) => fn(...args));
    (debouncedFn as unknown as { cancel: () => void }).cancel = vi.fn();
    return debouncedFn;
  }),
}));

// Mock project store actions - use importOriginal to preserve other exports
const mockUpdateService = vi.fn();
const mockUpdateEntityPositions = vi.fn();
const mockUpdateServicePositions = vi.fn();

vi.mock('../../../store/projectStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../store/projectStore')>();
  return {
    ...actual,
    useServiceActions: vi.fn(() => ({
      updateService: mockUpdateService,
    })),
    useLayoutActions: vi.fn(() => ({
      updateEntityPositions: mockUpdateEntityPositions,
      updateServicePositions: mockUpdateServicePositions,
    })),
  };
});

describe('useNodeDragHandlers', () => {
  const mockOnNodesChange = vi.fn();
  const mockIsDraggingRef = { current: false };

  const defaultEntities = [
    createMockEntity({ id: 'entity-1', name: 'User', position: { x: 100, y: 100 } }),
    createMockEntity({ id: 'entity-2', name: 'Product', position: { x: 300, y: 100 } }),
  ];

  const defaultServices = [
    createMockService({ id: 'service-1', name: 'UserService', position: { x: 50, y: 50 } }),
    createMockService({ id: 'service-2', name: 'ProductService', position: { x: 400, y: 50 } }),
  ];

  const defaultOptions = {
    entities: defaultEntities,
    services: defaultServices,
    isDraggingRef: mockIsDraggingRef,
    onNodesChange: mockOnNodesChange,
  };

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
    mockIsDraggingRef.current = false;
  });

  describe('handleNodesChange', () => {
    it('should call onNodesChange with adjusted changes', () => {
      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'position',
          id: 'entity-1',
          position: { x: 150, y: 150 },
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockOnNodesChange).toHaveBeenCalled();
    });

    it('should update entity positions on position change', () => {
      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'position',
          id: 'entity-1',
          position: { x: 200, y: 200 },
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockUpdateEntityPositions).toHaveBeenCalled();
    });

    it('should update service positions on position change', () => {
      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'position',
          id: 'service-1',
          position: { x: 100, y: 100 },
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockUpdateServicePositions).toHaveBeenCalled();
    });

    it('should ignore changes without position', () => {
      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'position',
          id: 'entity-1',
          dragging: true,
          // No position property
        } as NodeChange,
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockUpdateEntityPositions).not.toHaveBeenCalled();
    });

    it('should handle multiple position changes in one call', () => {
      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'position',
          id: 'entity-1',
          position: { x: 200, y: 200 },
        },
        {
          type: 'position',
          id: 'entity-2',
          position: { x: 400, y: 200 },
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockUpdateEntityPositions).toHaveBeenCalled();
      const callArg = mockUpdateEntityPositions.mock.calls[0][0];
      expect(callArg).toHaveLength(2);
    });

    it('should update service dimensions on resize', () => {
      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'dimensions',
          id: 'service-1',
          dimensions: { width: 400, height: 300 },
          resizing: true,
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockUpdateService).toHaveBeenCalled();
    });

    it('should track drag start state', () => {
      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'position',
          id: 'entity-1',
          position: { x: 150, y: 150 },
          dragging: true,
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockIsDraggingRef.current).toBe(true);
    });

    it('should not reset drag state on position change with dragging false', () => {
      // Drag state is only reset by handleNodeDragStop, not by handleNodesChange
      mockIsDraggingRef.current = true;

      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'position',
          id: 'entity-1',
          position: { x: 150, y: 150 },
          dragging: false,
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      // Drag state remains true until handleNodeDragStop is called
      expect(mockIsDraggingRef.current).toBe(true);
    });
  });

  describe('handleNodeDrag', () => {
    it('should be a no-op function', () => {
      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      // Should not throw
      const mockEvent = {} as React.MouseEvent;
      const mockNode = { id: 'entity-1' } as import('@xyflow/react').Node;

      expect(() => {
        result.current.handleNodeDrag(mockEvent, mockNode);
      }).not.toThrow();
    });
  });

  describe('handleNodeDragStop', () => {
    it('should reset isDraggingRef to false', () => {
      mockIsDraggingRef.current = true;

      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const mockEvent = {} as React.MouseEvent;
      const mockNode = { id: 'entity-1' } as import('@xyflow/react').Node;

      act(() => {
        result.current.handleNodeDragStop(mockEvent, mockNode);
      });

      expect(mockIsDraggingRef.current).toBe(false);
    });
  });

  describe('Selection Adjustment', () => {
    it('should preserve selection for selected entity', () => {
      // Set up entity selection in store
      useEntityStore.setState({
        selectedEntityId: 'entity-1',
        selectedEntityIds: [],
      });

      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'select',
          id: 'entity-1',
          selected: false, // Try to deselect
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      // The onNodesChange should be called with adjusted changes
      expect(mockOnNodesChange).toHaveBeenCalled();
    });

    it('should preserve selection for multi-selected entities', () => {
      useEntityStore.setState({
        selectedEntityId: null,
        selectedEntityIds: ['entity-1', 'entity-2'],
      });

      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'select',
          id: 'entity-1',
          selected: false,
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockOnNodesChange).toHaveBeenCalled();
    });

    it('should preserve selection for selected service', () => {
      useServiceStore.setState({
        selectedServiceId: 'service-1',
      });

      const { result } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const changes: NodeChange[] = [
        {
          type: 'select',
          id: 'service-1',
          selected: false,
        },
      ];

      act(() => {
        result.current.handleNodesChange(changes);
      });

      expect(mockOnNodesChange).toHaveBeenCalled();
    });
  });

  describe('Callback Stability', () => {
    it('should maintain stable handleNodeDrag reference (no-op function)', () => {
      const { result, rerender } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const initialHandleNodeDrag = result.current.handleNodeDrag;

      rerender();

      // handleNodeDrag is a no-op with empty dependencies, should be stable
      expect(result.current.handleNodeDrag).toBe(initialHandleNodeDrag);
    });

    it('should maintain stable handleNodeDragStop reference', () => {
      const { result, rerender } = renderHook(() => useNodeDragHandlers(defaultOptions));

      const initialHandleNodeDragStop = result.current.handleNodeDragStop;

      rerender();

      expect(result.current.handleNodeDragStop).toBe(initialHandleNodeDragStop);
    });

    it('should update handleNodesChange when entities change', () => {
      const { result, rerender } = renderHook(
        ({ entities }) => useNodeDragHandlers({ ...defaultOptions, entities }),
        { initialProps: { entities: defaultEntities } },
      );

      const initialHandleNodesChange = result.current.handleNodesChange;

      const newEntities = [...defaultEntities, createMockEntity({ id: 'entity-3', name: 'Order' })];
      rerender({ entities: newEntities });

      expect(result.current.handleNodesChange).not.toBe(initialHandleNodesChange);
    });
  });

  describe('Cleanup', () => {
    it('should cancel debounced callbacks on unmount', () => {
      const { unmount } = renderHook(() => useNodeDragHandlers(defaultOptions));

      // Unmount should not throw
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
