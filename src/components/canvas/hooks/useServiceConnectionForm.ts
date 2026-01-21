import { useCallback, useState } from 'react';
import type { ServiceConnectionDesign } from '../../../types';

interface PendingConnection {
  sourceServiceId: string;
  targetServiceId: string;
}

interface UseServiceConnectionFormReturn {
  /** Whether the connection form modal is open */
  connectionFormOpened: boolean;
  /** Pending connection being created (null if editing existing) */
  pendingConnection: PendingConnection | null;
  /** Connection being edited (null if creating new) */
  editingConnection: ServiceConnectionDesign | null;
  /** Handler for when user drags to create a new service connection */
  handlePendingServiceConnection: (pending: PendingConnection) => void;
  /** Handler for editing an existing service connection */
  handleEditServiceConnection: (connectionId: string) => void;
  /** Handler for closing the connection form */
  handleCloseConnectionForm: () => void;
}

interface UseServiceConnectionFormOptions {
  serviceConnections: ServiceConnectionDesign[];
}

/**
 * Hook that manages the state for the service connection form modal.
 * Handles both creating new connections and editing existing ones.
 */
export function useServiceConnectionForm({
  serviceConnections,
}: UseServiceConnectionFormOptions): UseServiceConnectionFormReturn {
  const [connectionFormOpened, setConnectionFormOpened] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);

  // Get the editing connection from store
  const editingConnection: ServiceConnectionDesign | null = editingConnectionId
    ? (serviceConnections.find((c) => c.id === editingConnectionId) ?? null)
    : null;

  // Handler for when user drags to create a new service connection
  const handlePendingServiceConnection = useCallback((pending: PendingConnection) => {
    setPendingConnection(pending);
    setEditingConnectionId(null);
    setConnectionFormOpened(true);
  }, []);

  // Handler for editing an existing service connection
  const handleEditServiceConnection = useCallback((connectionId: string) => {
    setEditingConnectionId(connectionId);
    setPendingConnection(null);
    setConnectionFormOpened(true);
  }, []);

  // Handler for closing the connection form
  const handleCloseConnectionForm = useCallback(() => {
    setConnectionFormOpened(false);
    setPendingConnection(null);
    setEditingConnectionId(null);
  }, []);

  return {
    connectionFormOpened,
    pendingConnection,
    editingConnection,
    handlePendingServiceConnection,
    handleEditServiceConnection,
    handleCloseConnectionForm,
  };
}
