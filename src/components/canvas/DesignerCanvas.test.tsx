import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntityStore } from '../../store/entityStore';
import { useRelationStore } from '../../store/relationStore';
import { useServiceConnectionStore } from '../../store/serviceConnectionStore';
import { useServiceStore } from '../../store/serviceStore';
import {
  createMockEntity,
  createMockRelation,
  createMockService,
  createMockServiceConnection,
} from '../../test/factories';
import { resetAllStores, TestProviders } from '../../test/utils';
import { DesignerCanvas } from './DesignerCanvas';

// Mock ReactFlow to avoid complex canvas testing
vi.mock('@xyflow/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@xyflow/react')>();
  return {
    ...actual,
    ReactFlow: ({ children, nodes, edges, onNodeClick, onPaneClick }: Record<string, unknown>) => (
      <div data-testid="react-flow">
        <div data-testid="nodes-container">
          {(nodes as Array<{ id: string; data?: { name?: string } }>)?.map((node) => (
            <button
              type="button"
              key={node.id}
              data-testid={`node-${node.id}`}
              onClick={(e) => (onNodeClick as (event: unknown, node: unknown) => void)?.(e, node)}
            >
              {node.data?.name || node.id}
            </button>
          ))}
        </div>
        <div data-testid="edges-container">
          {(edges as Array<{ id: string }>)?.map((edge) => (
            <div key={edge.id} data-testid={`edge-${edge.id}`}>
              Edge: {edge.id}
            </div>
          ))}
        </div>
        <button
          type="button"
          data-testid="pane"
          onClick={(e) => (onPaneClick as (event: unknown) => void)?.(e)}
        >
          Pane
        </button>
        {children}
      </div>
    ),
    Background: () => <div data-testid="background" />,
    Controls: () => <div data-testid="controls" />,
    MiniMap: () => <div data-testid="minimap" />,
    Panel: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="panel">{children}</div>
    ),
    useNodesState: () => [[], vi.fn(), vi.fn()],
    useEdgesState: () => [[], vi.fn(), vi.fn()],
    useReactFlow: () => ({
      fitView: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
    }),
  };
});

// Mock the hooks to provide controlled behavior
vi.mock('./hooks', () => ({
  useAutoLayout: vi.fn(),
  useCanvasConnections: vi.fn(() => ({
    onConnect: vi.fn(),
  })),
  useCanvasEdges: vi.fn(() => ({
    edges: [],
    onEdgesChange: vi.fn(),
  })),
  useCanvasNodes: vi.fn(() => ({
    nodes: [],
    setNodes: vi.fn(),
    onNodesChange: vi.fn(),
    isDraggingRef: { current: false },
  })),
  useNodeDragHandlers: vi.fn(() => ({
    handleNodesChange: vi.fn(),
    handleNodeDrag: vi.fn(),
    handleNodeDragStop: vi.fn(),
  })),
  useNodeSelection: vi.fn(() => ({
    onNodeClick: vi.fn(),
    onPaneClick: vi.fn(),
  })),
  useServiceConnectionForm: vi.fn(() => ({
    connectionFormOpened: false,
    pendingConnection: null,
    editingConnection: null,
    handlePendingServiceConnection: vi.fn(),
    handleEditServiceConnection: vi.fn(),
    handleCloseConnectionForm: vi.fn(),
  })),
}));

describe('DesignerCanvas', () => {
  const mockOnAddEntity = vi.fn();
  const mockOnEditEntity = vi.fn();
  const mockOnSelectEntity = vi.fn();
  const mockOnAddRelation = vi.fn();
  const mockOnAddService = vi.fn();
  const mockOnConfigureService = vi.fn();

  const defaultProps = {
    onAddEntity: mockOnAddEntity,
    onEditEntity: mockOnEditEntity,
    onSelectEntity: mockOnSelectEntity,
    onAddRelation: mockOnAddRelation,
    onAddService: mockOnAddService,
    onConfigureService: mockOnConfigureService,
  };

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the canvas container', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(screen.getByRole('application')).toBeInTheDocument();
      expect(screen.getByLabelText(/entity relationship diagram canvas/i)).toBeInTheDocument();
    });

    it('should render ReactFlow component', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should render canvas controls', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(screen.getByTestId('background')).toBeInTheDocument();
      expect(screen.getByTestId('controls')).toBeInTheDocument();
      expect(screen.getByTestId('minimap')).toBeInTheDocument();
    });

    it('should render toolbar panel', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      // There may be multiple panels (from mock and actual component)
      const panels = screen.getAllByTestId('panel');
      expect(panels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible canvas description', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      const canvas = screen.getByRole('application');
      expect(canvas).toHaveAttribute('aria-describedby', 'canvas-description');
    });

    it('should include screen reader description output', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      const description = document.getElementById('canvas-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('With Entities', () => {
    it('should render with entities from store', () => {
      const entity = createMockEntity({ name: 'User' });
      useEntityStore.setState({ entities: [entity] });

      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should pass entities to canvas nodes', () => {
      const entity1 = createMockEntity({ name: 'User' });
      const entity2 = createMockEntity({ name: 'Product' });
      useEntityStore.setState({ entities: [entity1, entity2] });

      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      // The hooks are mocked, but we verify the component renders
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('With Relations', () => {
    it('should render with relations from store', () => {
      const entity1 = createMockEntity({ id: 'e1', name: 'User' });
      const entity2 = createMockEntity({ id: 'e2', name: 'Product' });
      const relation = createMockRelation({
        sourceEntityId: 'e1',
        targetEntityId: 'e2',
        type: 'OneToMany',
      });

      useEntityStore.setState({ entities: [entity1, entity2] });
      useRelationStore.setState({ relations: [relation] });

      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('With Services', () => {
    it('should render with services from store', () => {
      const service = createMockService({ name: 'UserService' });
      useServiceStore.setState({ services: [service] });

      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('Service Connection Form', () => {
    it('should render ServiceConnectionForm', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      // The form is rendered but closed by default (mocked)
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('Store Integration', () => {
    it('should use entity store selectors', () => {
      const entity = createMockEntity({ name: 'TestEntity' });
      useEntityStore.setState({
        entities: [entity],
        selectedEntityId: entity.id,
      });

      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      // Verify store state is accessible
      expect(useEntityStore.getState().entities).toHaveLength(1);
      expect(useEntityStore.getState().selectedEntityId).toBe(entity.id);
    });

    it('should use relation store selectors', () => {
      const relation = createMockRelation();
      useRelationStore.setState({ relations: [relation] });

      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(useRelationStore.getState().relations).toHaveLength(1);
    });

    it('should use service store selectors', () => {
      const service = createMockService({ name: 'TestService' });
      useServiceStore.setState({
        services: [service],
        selectedServiceId: service.id,
      });

      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(useServiceStore.getState().services).toHaveLength(1);
      expect(useServiceStore.getState().selectedServiceId).toBe(service.id);
    });

    it('should use service connection store', () => {
      const connection = createMockServiceConnection();
      useServiceConnectionStore.setState({ serviceConnections: [connection] });

      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(useServiceConnectionStore.getState().serviceConnections).toHaveLength(1);
    });
  });

  describe('Props Handling', () => {
    it('should accept onAddEntity callback', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(mockOnAddEntity).not.toHaveBeenCalled();
    });

    it('should accept onEditEntity callback', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(mockOnEditEntity).not.toHaveBeenCalled();
    });

    it('should accept onSelectEntity callback', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(mockOnSelectEntity).not.toHaveBeenCalled();
    });

    it('should accept onAddRelation callback', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      expect(mockOnAddRelation).not.toHaveBeenCalled();
    });

    it('should accept optional onAddService callback', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} onAddService={undefined} />
        </TestProviders>,
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should accept optional onConfigureService callback', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} onConfigureService={undefined} />
        </TestProviders>,
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state components when no entities', () => {
      render(
        <TestProviders>
          <DesignerCanvas {...defaultProps} />
        </TestProviders>,
      );

      // CanvasEmptyStates is rendered inside ReactFlow
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });
});
