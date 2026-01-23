import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServiceConnection } from '../../../test/factories';
import { useServiceConnectionForm } from './useServiceConnectionForm';

describe('useServiceConnectionForm', () => {
  const defaultServiceConnections = [
    createMockServiceConnection({
      id: 'conn-1',
      sourceServiceId: 'service-1',
      targetServiceId: 'service-2',
      communicationType: 'REST',
    }),
    createMockServiceConnection({
      id: 'conn-2',
      sourceServiceId: 'service-2',
      targetServiceId: 'service-3',
      communicationType: 'gRPC',
    }),
  ];

  const defaultOptions = {
    serviceConnections: defaultServiceConnections,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with form closed', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      expect(result.current.connectionFormOpened).toBe(false);
    });

    it('should start with no pending connection', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      expect(result.current.pendingConnection).toBeNull();
    });

    it('should start with no editing connection', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      expect(result.current.editingConnection).toBeNull();
    });
  });

  describe('handlePendingServiceConnection', () => {
    it('should open form when creating new connection', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      act(() => {
        result.current.handlePendingServiceConnection({
          sourceServiceId: 'service-a',
          targetServiceId: 'service-b',
        });
      });

      expect(result.current.connectionFormOpened).toBe(true);
    });

    it('should set pending connection with correct service IDs', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      act(() => {
        result.current.handlePendingServiceConnection({
          sourceServiceId: 'service-a',
          targetServiceId: 'service-b',
        });
      });

      expect(result.current.pendingConnection).toEqual({
        sourceServiceId: 'service-a',
        targetServiceId: 'service-b',
      });
    });

    it('should clear editing connection when creating new', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      // First start editing
      act(() => {
        result.current.handleEditServiceConnection('conn-1');
      });

      expect(result.current.editingConnection).not.toBeNull();

      // Then create new connection
      act(() => {
        result.current.handlePendingServiceConnection({
          sourceServiceId: 'service-a',
          targetServiceId: 'service-b',
        });
      });

      expect(result.current.editingConnection).toBeNull();
      expect(result.current.pendingConnection).not.toBeNull();
    });
  });

  describe('handleEditServiceConnection', () => {
    it('should open form when editing connection', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      act(() => {
        result.current.handleEditServiceConnection('conn-1');
      });

      expect(result.current.connectionFormOpened).toBe(true);
    });

    it('should set editing connection from store', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      act(() => {
        result.current.handleEditServiceConnection('conn-1');
      });

      expect(result.current.editingConnection).toEqual(defaultServiceConnections[0]);
    });

    it('should clear pending connection when editing', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      // First create a pending connection
      act(() => {
        result.current.handlePendingServiceConnection({
          sourceServiceId: 'service-a',
          targetServiceId: 'service-b',
        });
      });

      expect(result.current.pendingConnection).not.toBeNull();

      // Then edit an existing connection
      act(() => {
        result.current.handleEditServiceConnection('conn-1');
      });

      expect(result.current.pendingConnection).toBeNull();
      expect(result.current.editingConnection).not.toBeNull();
    });

    it('should return null for non-existent connection ID', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      act(() => {
        result.current.handleEditServiceConnection('non-existent-id');
      });

      expect(result.current.editingConnection).toBeNull();
      expect(result.current.connectionFormOpened).toBe(true);
    });
  });

  describe('handleCloseConnectionForm', () => {
    it('should close the form', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      // Open the form first
      act(() => {
        result.current.handlePendingServiceConnection({
          sourceServiceId: 'service-a',
          targetServiceId: 'service-b',
        });
      });

      expect(result.current.connectionFormOpened).toBe(true);

      // Close the form
      act(() => {
        result.current.handleCloseConnectionForm();
      });

      expect(result.current.connectionFormOpened).toBe(false);
    });

    it('should clear pending connection', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      act(() => {
        result.current.handlePendingServiceConnection({
          sourceServiceId: 'service-a',
          targetServiceId: 'service-b',
        });
      });

      act(() => {
        result.current.handleCloseConnectionForm();
      });

      expect(result.current.pendingConnection).toBeNull();
    });

    it('should clear editing connection', () => {
      const { result } = renderHook(() => useServiceConnectionForm(defaultOptions));

      act(() => {
        result.current.handleEditServiceConnection('conn-1');
      });

      act(() => {
        result.current.handleCloseConnectionForm();
      });

      expect(result.current.editingConnection).toBeNull();
    });
  });

  describe('Callback Stability', () => {
    it('should maintain stable callback references', () => {
      const { result, rerender } = renderHook(() => useServiceConnectionForm(defaultOptions));

      const initialHandlePending = result.current.handlePendingServiceConnection;
      const initialHandleEdit = result.current.handleEditServiceConnection;
      const initialHandleClose = result.current.handleCloseConnectionForm;

      rerender();

      expect(result.current.handlePendingServiceConnection).toBe(initialHandlePending);
      expect(result.current.handleEditServiceConnection).toBe(initialHandleEdit);
      expect(result.current.handleCloseConnectionForm).toBe(initialHandleClose);
    });
  });

  describe('Store Reactivity', () => {
    it('should update editingConnection when serviceConnections change', () => {
      const { result, rerender } = renderHook(
        ({ serviceConnections }) => useServiceConnectionForm({ serviceConnections }),
        { initialProps: { serviceConnections: defaultServiceConnections } },
      );

      // Start editing
      act(() => {
        result.current.handleEditServiceConnection('conn-1');
      });

      expect(result.current.editingConnection?.communicationType).toBe('REST');

      // Update connections with modified connection
      const updatedConnections = defaultServiceConnections.map((c) =>
        c.id === 'conn-1' ? { ...c, communicationType: 'WebSocket' as const } : c,
      );

      rerender({ serviceConnections: updatedConnections });

      expect(result.current.editingConnection?.communicationType).toBe('WebSocket');
    });

    it('should return null when editing connection is removed', () => {
      const { result, rerender } = renderHook(
        ({ serviceConnections }) => useServiceConnectionForm({ serviceConnections }),
        { initialProps: { serviceConnections: defaultServiceConnections } },
      );

      // Start editing
      act(() => {
        result.current.handleEditServiceConnection('conn-1');
      });

      expect(result.current.editingConnection).not.toBeNull();

      // Remove the connection
      const filteredConnections = defaultServiceConnections.filter((c) => c.id !== 'conn-1');
      rerender({ serviceConnections: filteredConnections });

      expect(result.current.editingConnection).toBeNull();
    });
  });
});
