import { Divider, Group, Kbd, Modal, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { memo } from 'react';
import { KEYBOARD_SHORTCUTS, useIsMac } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

interface ShortcutInfo {
  keys: readonly string[];
  description: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutInfo[];
}

/**
 * Build shortcuts categories from the actual KEYBOARD_SHORTCUTS constant
 */
function buildShortcutCategories(isMac: boolean): ShortcutCategory[] {
  const shortcuts: ShortcutInfo[] = KEYBOARD_SHORTCUTS.map((shortcut) => ({
    keys: isMac ? shortcut.mac : shortcut.keys,
    description: shortcut.action,
  }));

  return [
    {
      name: 'General',
      shortcuts: shortcuts.filter((s) =>
        ['Undo', 'Redo', 'Redo (alternative)', 'Export project', 'Cancel/Close'].includes(
          s.description,
        ),
      ),
    },
    {
      name: 'Entity Actions',
      shortcuts: shortcuts.filter((s) =>
        ['Add new entity', 'Delete selected'].includes(s.description),
      ),
    },
  ];
}

const ShortcutRow = memo(function ShortcutRow({ shortcut }: { shortcut: ShortcutInfo }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm">{shortcut.description}</Text>
      <Group gap={4}>
        {shortcut.keys.map((key, i) => (
          <span key={key}>
            <Kbd size="sm">{key}</Kbd>
            {i < shortcut.keys.length - 1 && (
              <Text span size="xs" c="dimmed" mx={2}>
                +
              </Text>
            )}
          </span>
        ))}
      </Group>
    </Group>
  );
});

export const KeyboardShortcutsModal = memo(function KeyboardShortcutsModal({
  opened,
  onClose,
}: KeyboardShortcutsModalProps) {
  const isMac = useIsMac();
  const categories = buildShortcutCategories(isMac);

  return (
    <Modal opened={opened} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <Stack gap="md">
        {categories.map((category, index) => (
          <div key={category.name}>
            {index > 0 && <Divider my="sm" />}
            <Text fw={600} mb="xs">
              {category.name}
            </Text>
            <SimpleGrid cols={1} spacing="xs">
              {category.shortcuts.map((shortcut) => (
                <ShortcutRow key={shortcut.description} shortcut={shortcut} />
              ))}
            </SimpleGrid>
          </div>
        ))}

        <Paper withBorder p="sm" mt="md">
          <Text size="sm" c="dimmed">
            <strong>Tip:</strong> Shortcuts use {isMac ? 'Cmd' : 'Ctrl'} as the modifier key on your
            system.
          </Text>
        </Paper>
      </Stack>
    </Modal>
  );
});
