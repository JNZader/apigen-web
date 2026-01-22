import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useHotkeys before importing the hook
const mockUseHotkeys = vi.fn();
vi.mock('@mantine/hooks', () => ({
  useHotkeys: (shortcuts: unknown[]) => mockUseHotkeys(shortcuts),
}));

// Import after mock setup
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof useKeyboardShortcuts).toBe('function');
  });

  it('should have correct name', () => {
    expect(useKeyboardShortcuts.name).toBe('useKeyboardShortcuts');
  });

  it('should call useHotkeys with shortcuts array', () => {
    const callbacks = {
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onSave: vi.fn(),
      onAddEntity: vi.fn(),
      onDelete: vi.fn(),
      onEscape: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(callbacks));

    expect(mockUseHotkeys).toHaveBeenCalledTimes(1);
    expect(mockUseHotkeys).toHaveBeenCalledWith(expect.any(Array));

    // Verify shortcuts array structure
    const shortcuts = mockUseHotkeys.mock.calls[0][0];
    expect(shortcuts.length).toBeGreaterThanOrEqual(6);

    // Check that shortcut keys are present
    const keys = shortcuts.map((s: [string, () => void]) => s[0]);
    expect(keys).toContain('mod+z'); // undo
    expect(keys).toContain('mod+y'); // redo
    expect(keys).toContain('mod+s'); // save
    expect(keys).toContain('mod+n'); // add entity
    expect(keys).toContain('delete'); // delete
    expect(keys).toContain('escape'); // escape
  });

  it('should work with partial callbacks', () => {
    const callbacks = {
      onUndo: vi.fn(),
    };

    renderHook(() => useKeyboardShortcuts(callbacks));

    expect(mockUseHotkeys).toHaveBeenCalledTimes(1);
    // Should still create shortcuts array even with partial callbacks
    const shortcuts = mockUseHotkeys.mock.calls[0][0];
    expect(shortcuts.length).toBeGreaterThan(0);
  });
});
