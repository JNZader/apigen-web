import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockEntity } from '../../../test/factories';
import type { RelationDesign } from '../../../types/relation';
import { useAutoLayout } from './useAutoLayout';

// Mock the canvasLayout module
vi.mock('../../../utils/canvasLayout', () => ({
  calculateAutoLayout: vi.fn(() => {
    const positions = new Map<string, { x: number; y: number }>();
    positions.set('entity-1', { x: 100, y: 100 });
    positions.set('entity-2', { x: 400, y: 100 });
    return positions;
  }),
  LAYOUT_PRESETS: {
    compact: { nodeSpacing: 200, rankSpacing: 150, direction: 'TB' },
    spacious: { nodeSpacing: 300, rankSpacing: 200, direction: 'TB' },
    horizontal: { nodeSpacing: 250, rankSpacing: 180, direction: 'LR' },
  },
}));

describe('useAutoLayout', () => {
  const mockUpdateEntityPositions = vi.fn();
  const mockSetNeedsAutoLayout = vi.fn();

  const defaultOptions = {
    entities: [],
    relations: [] as RelationDesign[],
    layoutPreference: 'compact' as const,
    needsAutoLayout: false,
    updateEntityPositions: mockUpdateEntityPositions,
    setNeedsAutoLayout: mockSetNeedsAutoLayout,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not trigger layout when needsAutoLayout is false', () => {
    const entities = [createMockEntity({ name: 'User' }), createMockEntity({ name: 'Product' })];

    renderHook(() =>
      useAutoLayout({
        ...defaultOptions,
        entities,
        needsAutoLayout: false,
      }),
    );

    expect(mockUpdateEntityPositions).not.toHaveBeenCalled();
    expect(mockSetNeedsAutoLayout).not.toHaveBeenCalled();
  });

  it('should not trigger layout when entities array is empty', () => {
    renderHook(() =>
      useAutoLayout({
        ...defaultOptions,
        entities: [],
        needsAutoLayout: true,
      }),
    );

    expect(mockUpdateEntityPositions).not.toHaveBeenCalled();
    expect(mockSetNeedsAutoLayout).not.toHaveBeenCalled();
  });

  it('should trigger layout when needsAutoLayout is true and entities exist', () => {
    const entities = [createMockEntity({ name: 'User' }), createMockEntity({ name: 'Product' })];

    renderHook(() =>
      useAutoLayout({
        ...defaultOptions,
        entities,
        needsAutoLayout: true,
      }),
    );

    expect(mockUpdateEntityPositions).toHaveBeenCalledTimes(1);
    expect(mockSetNeedsAutoLayout).toHaveBeenCalledWith(false);
  });

  it('should pass positions map to updateEntityPositions', () => {
    const entities = [createMockEntity({ name: 'User' }), createMockEntity({ name: 'Product' })];

    renderHook(() =>
      useAutoLayout({
        ...defaultOptions,
        entities,
        needsAutoLayout: true,
      }),
    );

    const positionsArg = mockUpdateEntityPositions.mock.calls[0][0];
    expect(positionsArg).toBeInstanceOf(Map);
    expect(positionsArg.get('entity-1')).toEqual({ x: 100, y: 100 });
    expect(positionsArg.get('entity-2')).toEqual({ x: 400, y: 100 });
  });

  it('should reset needsAutoLayout flag after applying layout', () => {
    const entities = [createMockEntity({ name: 'User' })];

    renderHook(() =>
      useAutoLayout({
        ...defaultOptions,
        entities,
        needsAutoLayout: true,
      }),
    );

    expect(mockSetNeedsAutoLayout).toHaveBeenCalledWith(false);
  });

  it('should re-trigger layout when needsAutoLayout changes from false to true', () => {
    const entities = [createMockEntity({ name: 'User' })];

    const { rerender } = renderHook(
      ({ needsAutoLayout }) =>
        useAutoLayout({
          ...defaultOptions,
          entities,
          needsAutoLayout,
        }),
      { initialProps: { needsAutoLayout: false } },
    );

    expect(mockUpdateEntityPositions).not.toHaveBeenCalled();

    rerender({ needsAutoLayout: true });

    expect(mockUpdateEntityPositions).toHaveBeenCalledTimes(1);
  });

  it('should use different layout presets', () => {
    const entities = [createMockEntity({ name: 'User' })];

    const { rerender } = renderHook(
      ({ layoutPreference }) =>
        useAutoLayout({
          ...defaultOptions,
          entities,
          needsAutoLayout: true,
          layoutPreference,
        }),
      { initialProps: { layoutPreference: 'compact' as const } },
    );

    expect(mockUpdateEntityPositions).toHaveBeenCalledTimes(1);

    // Reset and trigger with different preset
    mockUpdateEntityPositions.mockClear();
    mockSetNeedsAutoLayout.mockClear();

    rerender({ layoutPreference: 'spacious' as const });

    // Should recalculate with new preset
    expect(mockUpdateEntityPositions).toHaveBeenCalled();
  });
});
