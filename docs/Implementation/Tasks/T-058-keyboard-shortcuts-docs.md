# T-058: Mejorar Keyboard Shortcuts

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.4 Polish

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-058 |
| **Tipo** | Feature |
| **Estimado** | 1.5h |
| **Dependencias** | Ninguna |
| **Branch** | `feat/ux-improvements` |
| **Estado** | Pending |

---

## Objetivo

Documentar y mejorar los atajos de teclado existentes, agregar modal de ayuda.

---

## Tareas

- [ ] Crear modal de shortcuts
- [ ] Documentar todos los atajos
- [ ] Agregar shortcut para abrir ayuda (?)
- [ ] Mejorar hook existente

---

## Archivos a Crear/Modificar

```
src/components/
└── KeyboardShortcutsModal.tsx  ← CREAR (~120 lineas)

src/hooks/
└── useKeyboardShortcuts.ts     ← MODIFICAR (agregar shortcuts)
```

---

## Codigo de Referencia

```typescript
// src/components/KeyboardShortcutsModal.tsx

import {
  Modal,
  Stack,
  Group,
  Text,
  Kbd,
  Divider,
  Paper,
  SimpleGrid,
} from '@mantine/core';
import { memo } from 'react';

interface KeyboardShortcutsModalProps {
  opened: boolean;
  onClose: () => void;
}

interface ShortcutInfo {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutInfo[];
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Ctrl', 'S'], description: 'Save project' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Ctrl', 'N'], description: 'New entity' },
      { keys: ['Escape'], description: 'Close modal / Cancel' },
    ],
  },
  {
    name: 'Canvas',
    shortcuts: [
      { keys: ['Delete'], description: 'Delete selected' },
      { keys: ['Ctrl', 'A'], description: 'Select all' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
      { keys: ['Space'], description: 'Pan canvas (hold)' },
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom' },
      { keys: ['Ctrl', 'L'], description: 'Auto layout' },
    ],
  },
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', '1'], description: 'Go to Entities tab' },
      { keys: ['Ctrl', '2'], description: 'Go to Relations tab' },
      { keys: ['Ctrl', '3'], description: 'Go to Services tab' },
      { keys: ['Ctrl', ','], description: 'Open settings' },
    ],
  },
  {
    name: 'Generation',
    shortcuts: [
      { keys: ['Ctrl', 'G'], description: 'Generate project' },
      { keys: ['Ctrl', 'Shift', 'G'], description: 'Generate and download' },
    ],
  },
];

export const KeyboardShortcutsModal = memo(function KeyboardShortcutsModal({
  opened,
  onClose,
}: KeyboardShortcutsModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="lg"
    >
      <Stack gap="md">
        {SHORTCUTS.map((category, index) => (
          <div key={category.name}>
            {index > 0 && <Divider my="sm" />}
            <Text fw={600} mb="xs">
              {category.name}
            </Text>
            <SimpleGrid cols={2} spacing="xs">
              {category.shortcuts.map((shortcut) => (
                <ShortcutRow
                  key={shortcut.description}
                  shortcut={shortcut}
                />
              ))}
            </SimpleGrid>
          </div>
        ))}

        <Paper withBorder p="sm" mt="md">
          <Text size="sm" c="dimmed">
            <strong>Tip:</strong> Press <Kbd>?</Kbd> at any time to show this help
          </Text>
        </Paper>
      </Stack>
    </Modal>
  );
});

const ShortcutRow = memo(function ShortcutRow({
  shortcut,
}: {
  shortcut: ShortcutInfo;
}) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm">{shortcut.description}</Text>
      <Group gap={4}>
        {shortcut.keys.map((key, i) => (
          <span key={i}>
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
```

```typescript
// Modificar useKeyboardShortcuts.ts - agregar:

// Shortcut para abrir ayuda
useHotkeys([
  ['?', () => setShortcutsModalOpened(true)],
  ['shift+/', () => setShortcutsModalOpened(true)], // Shift+? en algunos teclados
]);
```

---

## Criterios de Completado

- [ ] Modal de shortcuts creado
- [ ] Todos los shortcuts documentados
- [ ] Shortcut ? abre modal
- [ ] Shortcuts organizados por categoria
- [ ] `npm run check` pasa

---

## Pre-Commit Checklist

> **Antes de commitear**, ejecutar en orden:

```bash
npm run check:fix && npm run test:run && gga run
```

- [ ] `npm run build` - Sin errores de tipos
- [ ] `npm run check:fix` - Lint/formato OK
- [ ] `npm run test:run` - Tests pasan
- [ ] `gga run` - STATUS: PASSED

> Ver detalles: [[WORKFLOW-PRECOMMIT]]

---

## Log de Trabajo

| Fecha | Tiempo | Notas |
|-------|--------|-------|
| - | - | - |

---

#task #fase-5 #feature #pending

→ [[T-058]] → [[T-059]] | [[Phases/05-UX-IMPROVEMENTS]]
