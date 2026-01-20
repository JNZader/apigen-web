/**
 * Canvas layout utilities using dagre for optimal entity positioning.
 * Dagre arranges nodes in a directed graph to minimize edge crossings.
 */

import Dagre from '@dagrejs/dagre';
import type { EntityDesign, ServiceConnectionDesign, ServiceDesign } from '../types';
import type { RelationDesign } from '../types/relation';
import { CANVAS, ENTITY_NODE, SERVICE_NODE } from './canvasConstants';

interface LayoutOptions {
  direction: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeSpacing: number;
  rankSpacing: number;
}

const DEFAULT_OPTIONS: LayoutOptions = {
  direction: 'LR', // Left to right works well for ER diagrams
  nodeSpacing: 80,
  rankSpacing: 150,
};

// ============================================================================
// Layout Constants (derived from shared canvas constants)
// ============================================================================

// Node dimensions (should match EntityNode actual size)
const NODE_WIDTH = ENTITY_NODE.WIDTH;
const NODE_HEIGHT = 200; // Default height for layout calculation

// Dynamic height calculation constants
const NODE_BASE_HEIGHT = ENTITY_NODE.MIN_HEIGHT;
const FIELD_HEIGHT = ENTITY_NODE.FIELD_HEIGHT;

// Graph margins and spacing
const GRAPH_MARGIN = CANVAS.GRAPH_MARGIN;
const GRID_GAP = CANVAS.GRID_GAP;

/**
 * Calculate optimal positions for entities based on their relationships.
 * Uses dagre algorithm which minimizes edge crossings and creates
 * a hierarchical layout based on the graph structure.
 */
export function calculateAutoLayout(
  entities: EntityDesign[],
  relations: RelationDesign[],
  options: Partial<LayoutOptions> = {},
): Map<string, { x: number; y: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const positions = new Map<string, { x: number; y: number }>();

  if (entities.length === 0) {
    return positions;
  }

  // If no relations, arrange in a simple grid
  if (relations.length === 0) {
    return calculateGridLayout(entities);
  }

  // Create dagre graph
  const g = new Dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  // Configure the graph
  g.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSpacing,
    ranksep: opts.rankSpacing,
    marginx: GRAPH_MARGIN,
    marginy: GRAPH_MARGIN,
  });

  // Add nodes
  entities.forEach((entity) => {
    // Calculate dynamic height based on number of fields
    const dynamicHeight = Math.max(
      NODE_HEIGHT,
      NODE_BASE_HEIGHT + entity.fields.length * FIELD_HEIGHT,
    );
    g.setNode(entity.id, {
      width: NODE_WIDTH,
      height: dynamicHeight,
    });
  });

  // Add edges (relations)
  relations.forEach((relation) => {
    // Check both entities exist
    const sourceExists = entities.some((e) => e.id === relation.sourceEntityId);
    const targetExists = entities.some((e) => e.id === relation.targetEntityId);

    if (sourceExists && targetExists) {
      g.setEdge(relation.sourceEntityId, relation.targetEntityId);
    }
  });

  // Run the layout algorithm
  Dagre.layout(g);

  // Extract positions
  g.nodes().forEach((nodeId) => {
    const node = g.node(nodeId);
    if (node) {
      // Dagre returns center position, convert to top-left
      positions.set(nodeId, {
        x: node.x - NODE_WIDTH / 2,
        y: node.y - (node.height || NODE_HEIGHT) / 2,
      });
    }
  });

  return positions;
}

/**
 * Simple grid layout for entities without relations.
 */
function calculateGridLayout(entities: EntityDesign[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const cols = Math.ceil(Math.sqrt(entities.length));
  const spacing = { x: NODE_WIDTH + GRID_GAP, y: NODE_HEIGHT + GRID_GAP };

  entities.forEach((entity, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    positions.set(entity.id, {
      x: GRAPH_MARGIN + col * spacing.x,
      y: GRAPH_MARGIN + row * spacing.y,
    });
  });

  return positions;
}

/**
 * Layout presets for different diagram styles.
 */
export const LAYOUT_PRESETS = {
  horizontal: {
    direction: 'LR' as const,
    nodeSpacing: 80,
    rankSpacing: 200,
  },
  vertical: {
    direction: 'TB' as const,
    nodeSpacing: 100,
    rankSpacing: 150,
  },
  compact: {
    direction: 'LR' as const,
    nodeSpacing: 40,
    rankSpacing: 120,
  },
  spacious: {
    direction: 'LR' as const,
    nodeSpacing: 120,
    rankSpacing: 250,
  },
};

// ============================================================================
// SERVICE LAYOUT (for microservices view)
// ============================================================================

/**
 * Calculate optimal positions for services based on their connections.
 * Uses dagre algorithm to create a hierarchical layout that respects
 * the communication flow between services.
 */
export function calculateServiceLayout(
  services: ServiceDesign[],
  connections: ServiceConnectionDesign[],
  options: Partial<LayoutOptions> = {},
): Map<string, { x: number; y: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const positions = new Map<string, { x: number; y: number }>();

  if (services.length === 0) {
    return positions;
  }

  // If no connections, arrange in a grid
  if (connections.length === 0) {
    return calculateServiceGridLayout(services);
  }

  // Create dagre graph
  const g = new Dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  // Configure the graph with more spacing for services (they're larger)
  g.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSpacing * 1.5, // More spacing between services
    ranksep: opts.rankSpacing * 1.2,
    marginx: GRAPH_MARGIN,
    marginy: GRAPH_MARGIN,
  });

  // Add service nodes with their actual dimensions
  for (const service of services) {
    g.setNode(service.id, {
      width: service.width || SERVICE_NODE.DEFAULT_WIDTH,
      height: service.height || SERVICE_NODE.DEFAULT_HEIGHT,
    });
  }

  // Add edges (service connections)
  for (const connection of connections) {
    const sourceExists = services.some((s) => s.id === connection.sourceServiceId);
    const targetExists = services.some((s) => s.id === connection.targetServiceId);

    if (sourceExists && targetExists) {
      g.setEdge(connection.sourceServiceId, connection.targetServiceId);
    }
  }

  // Run the layout algorithm
  Dagre.layout(g);

  // Extract positions
  for (const nodeId of g.nodes()) {
    const node = g.node(nodeId);
    const service = services.find((s) => s.id === nodeId);
    if (node && service) {
      const width = service.width || SERVICE_NODE.DEFAULT_WIDTH;
      const height = service.height || SERVICE_NODE.DEFAULT_HEIGHT;
      // Dagre returns center position, convert to top-left
      positions.set(nodeId, {
        x: node.x - width / 2,
        y: node.y - height / 2,
      });
    }
  }

  return positions;
}

/**
 * Simple grid layout for services without connections.
 */
function calculateServiceGridLayout(
  services: ServiceDesign[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const cols = Math.ceil(Math.sqrt(services.length));

  // Calculate max dimensions for uniform spacing
  let maxWidth: number = SERVICE_NODE.DEFAULT_WIDTH;
  let maxHeight: number = SERVICE_NODE.DEFAULT_HEIGHT;
  for (const service of services) {
    maxWidth = Math.max(maxWidth, service.width || SERVICE_NODE.DEFAULT_WIDTH);
    maxHeight = Math.max(maxHeight, service.height || SERVICE_NODE.DEFAULT_HEIGHT);
  }

  const spacing = {
    x: maxWidth + GRID_GAP * 2,
    y: maxHeight + GRID_GAP * 2,
  };

  services.forEach((service, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    positions.set(service.id, {
      x: GRAPH_MARGIN + col * spacing.x,
      y: GRAPH_MARGIN + row * spacing.y,
    });
  });

  return positions;
}
