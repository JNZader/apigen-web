import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useHotkeys before importing the hook
const mockUseHotkeys = vi.fn();
vi.mock('@mantine/hooks', () => ({
  useHotkeys: (shortcuts: unknown[]) => mockUseHotkeys(shortcuts),
}));

// Import after mock setup
import {
  formatShortcut,
  KEYBOARD_SHORTCUTS,
  useIsMac,
  useKeyboardShortcuts,
} from './useKeyboardShortcuts';

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

describe('KEYBOARD_SHORTCUTS', () => {
  it('should contain undo shortcut', () => {
    const undoShortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === 'Undo');
    expect(undoShortcut).toBeDefined();
    expect(undoShortcut?.keys).toContain('Z');
  });

  it('should contain redo shortcut', () => {
    const redoShortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === 'Redo');
    expect(redoShortcut).toBeDefined();
    expect(redoShortcut?.keys).toContain('Y');
  });

  it('should contain save shortcut', () => {
    const saveShortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === 'Export project');
    expect(saveShortcut).toBeDefined();
    expect(saveShortcut?.keys).toContain('S');
  });

  it('should contain add entity shortcut', () => {
    const addShortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === 'Add new entity');
    expect(addShortcut).toBeDefined();
    expect(addShortcut?.keys).toContain('N');
  });

  it('should contain delete shortcut', () => {
    const deleteShortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === 'Delete selected');
    expect(deleteShortcut).toBeDefined();
    expect(deleteShortcut?.keys).toContain('Delete');
  });

  it('should contain escape shortcut', () => {
    const escShortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === 'Cancel/Close');
    expect(escShortcut).toBeDefined();
    expect(escShortcut?.keys).toContain('Escape');
  });

  it('should have mac keys for all shortcuts', () => {
    for (const shortcut of KEYBOARD_SHORTCUTS) {
      expect(shortcut.mac).toBeDefined();
      expect(shortcut.mac.length).toBeGreaterThan(0);
    }
  });
});

describe('useIsMac', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should return true for Mac user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      writable: true,
    });

    const { result } = renderHook(() => useIsMac());
    expect(result.current).toBe(true);
  });

  it('should return true for iPhone user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)' },
      writable: true,
    });

    const { result } = renderHook(() => useIsMac());
    expect(result.current).toBe(true);
  });

  it('should return true for iPad user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0)' },
      writable: true,
    });

    const { result } = renderHook(() => useIsMac());
    expect(result.current).toBe(true);
  });

  it('should return false for Windows user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      writable: true,
    });

    const { result } = renderHook(() => useIsMac());
    expect(result.current).toBe(false);
  });

  it('should return false for Linux user agent', () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' },
      writable: true,
    });

    const { result } = renderHook(() => useIsMac());
    expect(result.current).toBe(false);
  });
});

describe('formatShortcut', () => {
  it('should format Windows shortcut', () => {
    const shortcut = KEYBOARD_SHORTCUTS[0]; // Undo
    const formatted = formatShortcut(shortcut, false);
    expect(formatted).toBe('Ctrl + Z');
  });

  it('should format Mac shortcut', () => {
    const shortcut = KEYBOARD_SHORTCUTS[0]; // Undo
    const formatted = formatShortcut(shortcut, true);
    expect(formatted).toBe('Cmd + Z');
  });

  it('should format multi-key shortcuts for Windows', () => {
    const shortcut = KEYBOARD_SHORTCUTS[2]; // Redo alternative (Ctrl+Shift+Z)
    const formatted = formatShortcut(shortcut, false);
    expect(formatted).toBe('Ctrl + Shift + Z');
  });

  it('should format multi-key shortcuts for Mac', () => {
    const shortcut = KEYBOARD_SHORTCUTS[2]; // Redo alternative
    const formatted = formatShortcut(shortcut, true);
    expect(formatted).toBe('Cmd + Shift + Z');
  });

  it('should format single-key shortcuts', () => {
    const deleteShortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === 'Delete selected');
    if (deleteShortcut) {
      const formatted = formatShortcut(deleteShortcut, false);
      expect(formatted).toBe('Delete');
    }
  });
});
