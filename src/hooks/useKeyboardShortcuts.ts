import { useHotkeys } from '@mantine/hooks';

interface KeyboardShortcutsConfig {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onAddEntity?: () => void;
  onDelete?: () => void;
  onEscape?: () => void;
  onShowHelp?: () => void;
}

/**
 * Hook to handle global keyboard shortcuts throughout the application.
 * Uses Mantine's useHotkeys for consistent cross-browser behavior.
 */
export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onSave,
  onAddEntity,
  onDelete,
  onEscape,
  onShowHelp,
}: KeyboardShortcutsConfig) {
  // Define all keyboard shortcuts
  useHotkeys([
    // Undo: Ctrl/Cmd + Z
    ['mod+z', () => onUndo?.(), { preventDefault: true }],

    // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
    ['mod+y', () => onRedo?.(), { preventDefault: true }],
    ['mod+shift+z', () => onRedo?.(), { preventDefault: true }],

    // Save/Export: Ctrl/Cmd + S
    ['mod+s', () => onSave?.(), { preventDefault: true }],

    // Add Entity: Ctrl/Cmd + N
    ['mod+n', () => onAddEntity?.(), { preventDefault: true }],

    // Delete: Delete or Backspace (when focused on an entity)
    ['delete', () => onDelete?.()],
    ['backspace', () => onDelete?.()],

    // Escape: Cancel/Close
    ['escape', () => onEscape?.()],

    // Help: ? key
    ['shift+/', () => onShowHelp?.()],
  ]);
}

/**
 * Keyboard shortcuts reference for display in help/tooltips
 */
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], mac: ['Cmd', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Y'], mac: ['Cmd', 'Y'], action: 'Redo' },
  { keys: ['Ctrl', 'Shift', 'Z'], mac: ['Cmd', 'Shift', 'Z'], action: 'Redo (alternative)' },
  { keys: ['Ctrl', 'S'], mac: ['Cmd', 'S'], action: 'Export project' },
  { keys: ['Ctrl', 'N'], mac: ['Cmd', 'N'], action: 'Add new entity' },
  { keys: ['Delete'], mac: ['Delete'], action: 'Delete selected' },
  { keys: ['Escape'], mac: ['Escape'], action: 'Cancel/Close' },
  { keys: ['?'], mac: ['?'], action: 'Show keyboard shortcuts' },
] as const;

/**
 * Returns whether the current platform is macOS
 */
export function useIsMac() {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}

/**
 * Formats keyboard shortcut for display based on platform
 */
export function formatShortcut(
  shortcut: (typeof KEYBOARD_SHORTCUTS)[number],
  isMac: boolean,
): string {
  const keys = isMac ? shortcut.mac : shortcut.keys;
  return keys.join(' + ');
}
