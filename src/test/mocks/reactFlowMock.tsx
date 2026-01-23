/**
 * React Flow Mock for Testing
 *
 * This module provides mocks for @xyflow/react components and hooks.
 * Import this in your test setup or at the top of component tests that use React Flow.
 */

import { vi } from 'vitest';

// Mock the entire @xyflow/react module
export const mockReactFlow = {
  ReactFlow: vi.fn(({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-flow-mock">{children}</div>
  )),
  Background: vi.fn(() => <div data-testid="react-flow-background" />),
  Controls: vi.fn(() => <div data-testid="react-flow-controls" />),
  MiniMap: vi.fn(() => <div data-testid="react-flow-minimap" />),
  Panel: vi.fn(({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-flow-panel">{children}</div>
  )),
  Handle: vi.fn(({ type, position }: { type?: string; position?: string }) => (
    <div data-testid={`react-flow-handle-${type}-${position}`} />
  )),
  useReactFlow: vi.fn(() => ({
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    setNodes: vi.fn(),
    setEdges: vi.fn(),
    addNodes: vi.fn(),
    addEdges: vi.fn(),
    deleteElements: vi.fn(),
    fitView: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    setViewport: vi.fn(),
    getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
    screenToFlowPosition: vi.fn((pos: { x: number; y: number }) => pos),
    flowToScreenPosition: vi.fn((pos: { x: number; y: number }) => pos),
  })),
  useNodes: vi.fn(() => []),
  useEdges: vi.fn(() => []),
  useNodesState: vi.fn((initialNodes: unknown[]) => [initialNodes, vi.fn(), vi.fn()]),
  useEdgesState: vi.fn((initialEdges: unknown[]) => [initialEdges, vi.fn(), vi.fn()]),
  useOnSelectionChange: vi.fn(),
  useKeyPress: vi.fn(() => false),
  useStore: vi.fn(),
  useStoreApi: vi.fn(() => ({
    getState: vi.fn(),
    setState: vi.fn(),
    subscribe: vi.fn(),
  })),
  MarkerType: {
    Arrow: 'arrow',
    ArrowClosed: 'arrowclosed',
  },
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
  ConnectionLineType: {
    Bezier: 'default',
    Straight: 'straight',
    Step: 'step',
    SmoothStep: 'smoothstep',
    SimpleBezier: 'simplebezier',
  },
  ReactFlowProvider: vi.fn(({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-flow-provider">{children}</div>
  )),
  getBezierPath: vi.fn(() => ['M0,0 L100,100', 50, 50]),
  getSmoothStepPath: vi.fn(() => ['M0,0 L100,100', 50, 50]),
  getStraightPath: vi.fn(() => ['M0,0 L100,100', 50, 50]),
  getSimpleBezierPath: vi.fn(() => ['M0,0 L100,100', 50, 50]),
  BaseEdge: vi.fn(() => <path data-testid="react-flow-base-edge" />),
  EdgeLabelRenderer: vi.fn(({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-flow-edge-label">{children}</div>
  )),
};

/**
 * Sets up React Flow mocks for testing.
 * Call this before running tests that use React Flow components.
 */
export function setupReactFlowMocks(): void {
  vi.mock('@xyflow/react', () => mockReactFlow);
}

/**
 * Creates a mock node for testing.
 */
export function createMockNode(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'node-1',
    type: 'default',
    position: { x: 0, y: 0 },
    data: {},
    ...overrides,
  };
}

/**
 * Creates a mock edge for testing.
 */
export function createMockEdge(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    ...overrides,
  };
}
