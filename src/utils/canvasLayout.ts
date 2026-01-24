/**
 * Canvas layout utilities using ELK (Eclipse Layout Kernel) for optimal entity positioning.
 * ELK arranges nodes in a directed graph to minimize edge crossings.
 */

import ELK, {
  type LayoutOptions as ElkLayoutOptions,
  type ElkNode,
} from 'elkjs/lib/elk.bundled.js';
import type { EntityDesign, ServiceConnectionDesign, ServiceDesign } from '../types';
import type { RelationDesign } from '../types/relation';
import { CANVAS, ENTITY_NODE, SERVICE_NODE } from './canvasConstants';

// Create ELK instance
const elk = new ELK();

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

// Map our direction format to ELK direction format
function mapDirection(direction: LayoutOptions['direction']): string {
  const directionMap: Record<string, string> = {
    TB: 'DOWN',
    BT: 'UP',
    LR: 'RIGHT',
    RL: 'LEFT',
  };
  return directionMap[direction] || 'RIGHT';
}

/**
 * Calculate optimal positions for entities based on their relationships.
 * Uses ELK algorithm which minimizes edge crossings and creates
 * a hierarchical layout based on the graph structure.
 */
export async function calculateAutoLayout(
  entities: EntityDesign[],
  relations: RelationDesign[],
  options: Partial<LayoutOptions> = {},
): Promise<Map<string, { x: number; y: number }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const positions = new Map<string, { x: number; y: number }>();

  if (entities.length === 0) {
    return positions;
  }

  // If no relations, arrange in a simple grid
  if (relations.length === 0) {
    return calculateGridLayout(entities);
  }

  // Build ELK graph structure
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': mapDirection(opts.direction),
      'elk.spacing.nodeNode': String(opts.nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(opts.rankSpacing),
      'elk.padding': `[top=${GRAPH_MARGIN},left=${GRAPH_MARGIN},bottom=${GRAPH_MARGIN},right=${GRAPH_MARGIN}]`,
    } as ElkLayoutOptions,
    children: entities.map((entity) => {
      // Calculate dynamic height based on number of fields
      const dynamicHeight = Math.max(
        NODE_HEIGHT,
        NODE_BASE_HEIGHT + entity.fields.length * FIELD_HEIGHT,
      );
      return {
        id: entity.id,
        width: NODE_WIDTH,
        height: dynamicHeight,
      };
    }),
    edges: relations
      .filter((relation) => {
        // Check both entities exist
        const sourceExists = entities.some((e) => e.id === relation.sourceEntityId);
        const targetExists = entities.some((e) => e.id === relation.targetEntityId);
        return sourceExists && targetExists;
      })
      .map((relation, index) => ({
        id: `e${index}`,
        sources: [relation.sourceEntityId],
        targets: [relation.targetEntityId],
      })),
  };

  try {
    // Run the layout algorithm
    const layoutedGraph = await elk.layout(graph);

    // Extract positions
    if (layoutedGraph.children) {
      for (const node of layoutedGraph.children) {
        if (node.x !== undefined && node.y !== undefined) {
          positions.set(node.id, {
            x: node.x,
            y: node.y,
          });
        }
      }
    }
  } catch (error) {
    console.error('ELK layout error:', error);
    // Fallback to grid layout on error
    return calculateGridLayout(entities);
  }

  return positions;
}

/**
 * Synchronous version that returns grid layout - for backwards compatibility.
 * Prefer using calculateAutoLayout directly for proper ELK layouts.
 */
export function calculateAutoLayoutSync(
  entities: EntityDesign[],
  _relations: RelationDesign[],
  _options: Partial<LayoutOptions> = {},
): Map<string, { x: number; y: number }> {
  // For sync usage, return grid layout immediately
  // The async version should be preferred for ELK layouts
  return calculateGridLayout(entities);
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
 * Uses ELK algorithm to create a hierarchical layout that respects
 * the communication flow between services.
 */
export async function calculateServiceLayout(
  services: ServiceDesign[],
  connections: ServiceConnectionDesign[],
  options: Partial<LayoutOptions> = {},
): Promise<Map<string, { x: number; y: number }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const positions = new Map<string, { x: number; y: number }>();

  if (services.length === 0) {
    return positions;
  }

  // If no connections, arrange in a grid
  if (connections.length === 0) {
    return calculateServiceGridLayout(services);
  }

  // Build ELK graph structure
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': mapDirection(opts.direction),
      'elk.spacing.nodeNode': String(opts.nodeSpacing * 1.5), // More spacing between services
      'elk.layered.spacing.nodeNodeBetweenLayers': String(opts.rankSpacing * 1.2),
      'elk.padding': `[top=${GRAPH_MARGIN},left=${GRAPH_MARGIN},bottom=${GRAPH_MARGIN},right=${GRAPH_MARGIN}]`,
    } as ElkLayoutOptions,
    children: services.map((service) => ({
      id: service.id,
      width: service.width || SERVICE_NODE.DEFAULT_WIDTH,
      height: service.height || SERVICE_NODE.DEFAULT_HEIGHT,
    })),
    edges: connections
      .filter((connection) => {
        const sourceExists = services.some((s) => s.id === connection.sourceServiceId);
        const targetExists = services.some((s) => s.id === connection.targetServiceId);
        return sourceExists && targetExists;
      })
      .map((connection, index) => ({
        id: `e${index}`,
        sources: [connection.sourceServiceId],
        targets: [connection.targetServiceId],
      })),
  };

  try {
    // Run the layout algorithm
    const layoutedGraph = await elk.layout(graph);

    // Extract positions
    if (layoutedGraph.children) {
      for (const node of layoutedGraph.children) {
        const service = services.find((s) => s.id === node.id);
        if (node.x !== undefined && node.y !== undefined && service) {
          positions.set(node.id, {
            x: node.x,
            y: node.y,
          });
        }
      }
    }
  } catch (error) {
    console.error('ELK layout error:', error);
    // Fallback to grid layout on error
    return calculateServiceGridLayout(services);
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
