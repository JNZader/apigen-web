import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockEntity, createMockService } from '../../../test/factories';
import { useNodeSelection } from './useNodeSelection';

describe('useNodeSelection', () => {
  const mockOnSelectEntity = vi.fn();
  const mockSelectService = vi.fn();
  const mockToggleEntitySelection = vi.fn();
  const mockClearEntitySelection = vi.fn();

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
    onSelectEntity: mockOnSelectEntity,
    selectService: mockSelectService,
    toggleEntitySelection: mockToggleEntitySelection,
    clearEntitySelection: mockClearEntitySelection,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onNodeClick', () => {
    describe('Entity Selection', () => {
      it('should select entity on normal click', () => {
        const { result } = renderHook(() => useNodeSelection(defaultOptions));

        const mockEvent = { ctrlKey: false, metaKey: false } as React.MouseEvent;
        const mockNode = { id: 'entity-1' } as unknown as import('@xyflow/react').Node;

        result.current.onNodeClick(mockEvent, mockNode);

        expect(mockOnSelectEntity).toHaveBeenCalledWith('entity-1');
        expect(mockSelectService).toHaveBeenCalledWith(null);
      });

      it('should toggle entity selection on Ctrl+Click', () => {
        const { result } = renderHook(() => useNodeSelection(defaultOptions));

        const mockEvent = { ctrlKey: true, metaKey: false } as React.MouseEvent;
        const mockNode = { id: 'entity-1' } as unknown as import('@xyflow/react').Node;

        result.current.onNodeClick(mockEvent, mockNode);

        expect(mockToggleEntitySelection).toHaveBeenCalledWith('entity-1');
        expect(mockSelectService).toHaveBeenCalledWith(null);
        expect(mockOnSelectEntity).not.toHaveBeenCalled();
      });

      it('should toggle entity selection on Meta+Click (Mac)', () => {
        const { result } = renderHook(() => useNodeSelection(defaultOptions));

        const mockEvent = { ctrlKey: false, metaKey: true } as React.MouseEvent;
        const mockNode = { id: 'entity-2' } as unknown as import('@xyflow/react').Node;

        result.current.onNodeClick(mockEvent, mockNode);

        expect(mockToggleEntitySelection).toHaveBeenCalledWith('entity-2');
        expect(mockSelectService).toHaveBeenCalledWith(null);
      });

      it('should deselect service when selecting entity', () => {
        const { result } = renderHook(() => useNodeSelection(defaultOptions));

        const mockEvent = { ctrlKey: false, metaKey: false } as React.MouseEvent;
        const mockNode = { id: 'entity-1' } as unknown as import('@xyflow/react').Node;

        result.current.onNodeClick(mockEvent, mockNode);

        expect(mockSelectService).toHaveBeenCalledWith(null);
      });
    });

    describe('Service Selection', () => {
      it('should select service on click', () => {
        const { result } = renderHook(() => useNodeSelection(defaultOptions));

        const mockEvent = { ctrlKey: false, metaKey: false } as React.MouseEvent;
        const mockNode = { id: 'service-1' } as unknown as import('@xyflow/react').Node;

        result.current.onNodeClick(mockEvent, mockNode);

        expect(mockSelectService).toHaveBeenCalledWith('service-1');
        expect(mockOnSelectEntity).toHaveBeenCalledWith(null);
        expect(mockClearEntitySelection).toHaveBeenCalled();
      });

      it('should clear entity selection when selecting service', () => {
        const { result } = renderHook(() => useNodeSelection(defaultOptions));

        const mockEvent = { ctrlKey: false, metaKey: false } as React.MouseEvent;
        const mockNode = { id: 'service-2' } as unknown as import('@xyflow/react').Node;

        result.current.onNodeClick(mockEvent, mockNode);

        expect(mockOnSelectEntity).toHaveBeenCalledWith(null);
        expect(mockClearEntitySelection).toHaveBeenCalled();
      });
    });

    describe('Unknown Node', () => {
      it('should not call any selection function for unknown node', () => {
        const { result } = renderHook(() => useNodeSelection(defaultOptions));

        const mockEvent = { ctrlKey: false, metaKey: false } as React.MouseEvent;
        const mockNode = { id: 'unknown-node' } as unknown as import('@xyflow/react').Node;

        result.current.onNodeClick(mockEvent, mockNode);

        expect(mockOnSelectEntity).not.toHaveBeenCalled();
        expect(mockSelectService).not.toHaveBeenCalled();
        expect(mockToggleEntitySelection).not.toHaveBeenCalled();
        expect(mockClearEntitySelection).not.toHaveBeenCalled();
      });
    });
  });

  describe('onPaneClick', () => {
    it('should deselect entity when pane is clicked', () => {
      const { result } = renderHook(() => useNodeSelection(defaultOptions));

      result.current.onPaneClick();

      expect(mockOnSelectEntity).toHaveBeenCalledWith(null);
    });

    it('should deselect service when pane is clicked', () => {
      const { result } = renderHook(() => useNodeSelection(defaultOptions));

      result.current.onPaneClick();

      expect(mockSelectService).toHaveBeenCalledWith(null);
    });

    it('should clear entity multi-selection when pane is clicked', () => {
      const { result } = renderHook(() => useNodeSelection(defaultOptions));

      result.current.onPaneClick();

      expect(mockClearEntitySelection).toHaveBeenCalled();
    });
  });

  describe('Callback Stability', () => {
    it('should maintain stable callback references', () => {
      const { result, rerender } = renderHook(() => useNodeSelection(defaultOptions));

      const initialOnNodeClick = result.current.onNodeClick;
      const initialOnPaneClick = result.current.onPaneClick;

      rerender();

      expect(result.current.onNodeClick).toBe(initialOnNodeClick);
      expect(result.current.onPaneClick).toBe(initialOnPaneClick);
    });

    it('should update callbacks when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ entities }) => useNodeSelection({ ...defaultOptions, entities }),
        { initialProps: { entities: defaultEntities } },
      );

      const initialOnNodeClick = result.current.onNodeClick;

      // Add a new entity
      const newEntities = [...defaultEntities, createMockEntity({ id: 'entity-3', name: 'Order' })];
      rerender({ entities: newEntities });

      expect(result.current.onNodeClick).not.toBe(initialOnNodeClick);
    });
  });
});
