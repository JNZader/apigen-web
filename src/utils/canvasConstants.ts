/**
 * Shared canvas constants for consistent dimensions across components.
 * These values ensure visual consistency between the canvas layout algorithm
 * and the actual rendered nodes.
 */

export const ENTITY_NODE = {
  WIDTH: 220,
  MIN_HEIGHT: 100,
  FIELD_HEIGHT: 28,
} as const;

export const SERVICE_NODE = {
  DEFAULT_WIDTH: 300,
  DEFAULT_HEIGHT: 200,
  MIN_WIDTH: 200,
  MIN_HEIGHT: 150,
} as const;

export const CANVAS = {
  GRID_GAP: 60,
  GRAPH_MARGIN: 50,
  SNAP_GRID: 15,
} as const;

/**
 * Canvas view mode constants.
 * Use these instead of magic strings throughout the application.
 */
export const CANVAS_VIEWS = {
  ENTITIES: 'entities',
  SERVICES: 'services',
  BOTH: 'both',
} as const;

export type CanvasView = (typeof CANVAS_VIEWS)[keyof typeof CANVAS_VIEWS];
