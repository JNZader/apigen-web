import { describe, expect, it } from 'vitest';
import {
  useKeyboardShortcuts,
  useHistory,
  useMultiServiceExport,
  useThrottledAction,
  useDebouncedAction,
  useProjectGeneration,
} from './index';

describe('Hook exports from index', () => {
  it('should export useKeyboardShortcuts', () => {
    expect(useKeyboardShortcuts).toBeDefined();
    expect(typeof useKeyboardShortcuts).toBe('function');
  });

  it('should export useHistory', () => {
    expect(useHistory).toBeDefined();
    expect(typeof useHistory).toBe('function');
  });

  it('should export useMultiServiceExport', () => {
    expect(useMultiServiceExport).toBeDefined();
    expect(typeof useMultiServiceExport).toBe('function');
  });

  it('should export useThrottledAction', () => {
    expect(useThrottledAction).toBeDefined();
    expect(typeof useThrottledAction).toBe('function');
  });

  it('should export useDebouncedAction', () => {
    expect(useDebouncedAction).toBeDefined();
    expect(typeof useDebouncedAction).toBe('function');
  });

  it('should export useProjectGeneration', () => {
    expect(useProjectGeneration).toBeDefined();
    expect(typeof useProjectGeneration).toBe('function');
  });

  it('should have unique export names', () => {
    const exports = [
      'useKeyboardShortcuts',
      'useHistory',
      'useMultiServiceExport',
      'useThrottledAction',
      'useDebouncedAction',
      'useProjectGeneration',
    ];

    const uniqueExports = new Set(exports);
    expect(uniqueExports.size).toBe(exports.length);
  });
});
