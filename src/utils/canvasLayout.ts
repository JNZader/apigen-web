/**
 * Canvas layout utilities using dagre for optimal entity positioning.
 * Dagre arranges nodes in a directed graph to minimize edge crossings.
 */

import Dagre from '@dagrejs/dagre';
import type { EntityDesign } from '../types';
import type { RelationDesign } from '../types/relation';
import { CANVAS, ENTITY_NODE } from './canvasConstants';

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
