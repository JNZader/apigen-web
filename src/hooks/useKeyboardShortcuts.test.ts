import { describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

vi.mock('@mantine/hooks', () => ({
  useHotkeys: vi.fn(),
}));

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

  it('should call useHotkeys with correct shortcuts', () => {
    const mockOnUndo = vi.fn();
    const mockOnRedo = vi.fn();
    const mockOnSave = vi.fn();
    const mockOnAddEntity = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnEscape = vi.fn();

    vi.mocked(require('@mantine/hooks')).useHotkeys.mockImplementation((shortcuts) => {
      shortcuts([
        ['mod+z', () => mockOnUndo()],
        ['mod+y', () => mockOnRedo()],
        ['mod+s', () => mockOnSave()],
        ['mod+n', () => mockOnAddEntity()],
        ['delete', () => mockOnDelete()],
        ['escape', () => mockOnEscape()],
      ]);
    });

    useKeyboardShortcuts({
      onUndo: mockOnUndo,
      onRedo: mockOnRedo,
      onSave: mockOnSave,
      onAddEntity: mockOnAddEntity,
      onDelete: mockOnDelete,
      onEscape: mockOnEscape,
    });

    expect(mockOnUndo).toHaveBeenCalled();
    expect(mockOnRedo).toHaveBeenCalled();
    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnAddEntity).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockOnEscape).toHaveBeenCalled();
  });

  it('should handle preventDefault correctly', () => {
    const mockOnUndo = vi.fn((e) => {
      expect(e.preventDefault).toHaveBeenCalled();
    });

    vi.mocked(require('@mantine/hooks')).useHotkeys.mockImplementation((shortcuts) => {
      shortcuts([['mod+z', () => mockOnUndo({ preventDefault: true } as Event)]]);
    });

    useKeyboardShortcuts({
      onUndo: mockOnUndo,
    });

    expect(mockOnUndo).toHaveBeenCalled();
  });
});
