import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHistory } from './useHistory';

describe('useHistory', () => {
  it('should be a function', () => {
    expect(typeof useHistory).toBe('function');
  });

  it('should be named correctly', () => {
    expect(useHistory.name).toBe('useHistory');
  });

  it('should return an object with required properties', () => {
    const { result } = renderHook(() => useHistory());

    expect(result.current).toHaveProperty('undo');
    expect(result.current).toHaveProperty('redo');
    expect(result.current).toHaveProperty('canUndo');
    expect(result.current).toHaveProperty('canRedo');

    // undo and redo are functions
    expect(typeof result.current.undo).toBe('function');
    expect(typeof result.current.redo).toBe('function');
    // canUndo and canRedo are booleans (from selectors)
    expect(typeof result.current.canUndo).toBe('boolean');
    expect(typeof result.current.canRedo).toBe('boolean');
  });

  it('should handle undefined state gracefully', () => {
    const { result } = renderHook(() => useHistory());

    expect(() => result.current.undo()).not.toThrow();
    expect(() => result.current.redo()).not.toThrow();
  });
});
