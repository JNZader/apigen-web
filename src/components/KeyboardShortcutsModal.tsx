import { Box, Group, Kbd, Modal, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconKeyboard } from '@tabler/icons-react';
import { memo } from 'react';
import { useIsMac } from '../hooks';

interface KeyboardShortcutsModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

interface ShortcutCategory {
  readonly title: string;
  readonly shortcuts: ReadonlyArray<{
    readonly keys: readonly string[];
    readonly mac: readonly string[];
    readonly action: string;
  }>;
}

const SHORTCUT_CATEGORIES: readonly ShortcutCategory[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], mac: ['?'], action: 'Show keyboard shortcuts' },
      { keys: ['Escape'], mac: ['Escape'], action: 'Close modal / Deselect' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], mac: ['Cmd', 'Z'], action: 'Undo' },
      { keys: ['Ctrl', 'Y'], mac: ['Cmd', 'Y'], action: 'Redo' },
      { keys: ['Ctrl', 'Shift', 'Z'], mac: ['Cmd', 'Shift', 'Z'], action: 'Redo (alternative)' },
    ],
  },
  {
    title: 'Entities',
    shortcuts: [
      { keys: ['Ctrl', 'N'], mac: ['Cmd', 'N'], action: 'Add new entity' },
      { keys: ['Delete'], mac: ['Delete'], action: 'Delete selected entity' },
      { keys: ['Backspace'], mac: ['Backspace'], action: 'Delete selected entity' },
    ],
  },
  {
    title: 'Project',
    shortcuts: [{ keys: ['Ctrl', 'S'], mac: ['Cmd', 'S'], action: 'Export project (JSON)' }],
  },
] as const;

function ShortcutRow({
  keys,
  action,
}: {
  readonly keys: readonly string[];
  readonly action: string;
}) {
  return (
    <Group justify="space-between" py={4}>
      <Text size="sm">{action}</Text>
      <Group gap={4}>
        {keys.map((key, index) => (
          <span key={key}>
            <Kbd size="sm">{key}</Kbd>
            {index < keys.length - 1 && (
              <Text component="span" size="xs" c="dimmed" mx={4}>
                +
              </Text>
            )}
          </span>
        ))}
      </Group>
    </Group>
  );
}

export const KeyboardShortcutsModal = memo(function KeyboardShortcutsModal({
  opened,
  onClose,
}: KeyboardShortcutsModalProps) {
  const isMac = useIsMac();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon color="blue" size="lg" variant="light">
            <IconKeyboard size={20} />
          </ThemeIcon>
          <Title order={4}>Keyboard Shortcuts</Title>
        </Group>
      }
      size="md"
      centered
      closeButtonProps={{ 'aria-label': 'Close keyboard shortcuts' }}
    >
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          Use these shortcuts to work faster with APiGen Studio.
        </Text>

        {SHORTCUT_CATEGORIES.map((category) => (
          <Box key={category.title}>
            <Text fw={600} size="sm" mb="xs" c="dimmed">
              {category.title}
            </Text>
            <Stack gap={0}>
              {category.shortcuts.map((shortcut) => (
                <ShortcutRow
                  key={shortcut.action}
                  keys={isMac ? shortcut.mac : shortcut.keys}
                  action={shortcut.action}
                />
              ))}
            </Stack>
          </Box>
        ))}

        <Text size="xs" c="dimmed" ta="center" mt="sm">
          Press <Kbd size="xs">?</Kbd> anytime to show this help
        </Text>
      </Stack>
    </Modal>
  );
});
