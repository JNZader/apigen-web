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
    const result = useHistory();

    expect(result).toHaveProperty('undo');
    expect(result).toHaveProperty('redo');
    expect(result).toHaveProperty('canUndo');
    expect(result).toHaveProperty('canRedo');

    expect(typeof result.undo).toBe('function');
    expect(typeof result.redo).toBe('function');
    expect(typeof result.canUndo).toBe('function');
    expect(typeof result.canRedo).toBe('function');
  });

  it('should handle undefined state gracefully', () => {
    const result = useHistory();

    expect(() => result.undo()).not.toThrow();
    expect(() => result.redo()).not.toThrow();
  });
});
