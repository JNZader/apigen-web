# React Hooks

Custom hooks for common functionality in APiGen Studio.

## useProjectGeneration

Handles project generation and download.

### Usage

```typescript
import { useProjectGeneration } from '@/hooks';

function GenerateButton() {
  const { generate, isGenerating, error } = useProjectGeneration();

  return (
    <Button
      onClick={generate}
      loading={isGenerating}
      disabled={isGenerating}
    >
      Generate Project
    </Button>
  );
}
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `generate` | `() => Promise<void>` | Triggers project generation |
| `isGenerating` | `boolean` | Loading state |
| `error` | `string \| null` | Error message if failed |

### Behavior

1. Validates project has entities
2. Sends POST to `/api/generate` with project config
3. Validates ZIP archive security (path traversal, file size)
4. Downloads as `{artifactId}.zip`

---

## useKeyboardShortcuts

Registers global keyboard shortcuts.

### Usage

```typescript
import { useKeyboardShortcuts } from '@/hooks';

function MyComponent() {
  useKeyboardShortcuts({
    onUndo: () => historyActions.undo(),
    onRedo: () => historyActions.redo(),
    onSave: () => handleExport(),
    onAddEntity: () => setEntityFormOpen(true),
    onDelete: () => handleDeleteSelected(),
    onEscape: () => clearSelection(),
  });
}
```

### Shortcuts

| Shortcut | Mac | Action |
|----------|-----|--------|
| `Ctrl+Z` | `Cmd+Z` | Undo |
| `Ctrl+Y` | `Cmd+Y` | Redo |
| `Ctrl+Shift+Z` | `Cmd+Shift+Z` | Redo (alternative) |
| `Ctrl+S` | `Cmd+S` | Export project |
| `Ctrl+N` | `Cmd+N` | Add new entity |
| `Delete` | `Delete` | Delete selected |
| `Escape` | `Escape` | Cancel/Close |

### Helper Functions

```typescript
import { KEYBOARD_SHORTCUTS, useIsMac, formatShortcut } from '@/hooks';

// Check if running on Mac
const isMac = useIsMac();

// Format shortcut for display
const label = formatShortcut(KEYBOARD_SHORTCUTS[0], isMac);
// Returns "Cmd + Z" on Mac, "Ctrl + Z" on Windows/Linux
```

---

## useHistory

Integrates undo/redo functionality with the history store.

### Usage

```typescript
import { useHistory } from '@/hooks';

function UndoRedoButtons() {
  const { canUndo, canRedo, undo, redo } = useHistory();

  return (
    <>
      <Button onClick={undo} disabled={!canUndo}>Undo</Button>
      <Button onClick={redo} disabled={!canRedo}>Redo</Button>
    </>
  );
}
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `canUndo` | `boolean` | Whether undo is available |
| `canRedo` | `boolean` | Whether redo is available |
| `undo` | `() => void` | Undo last action |
| `redo` | `() => void` | Redo last undone action |

---

## useEntityDeletion

Handles entity deletion with confirmation dialog.

### Usage

```typescript
import { useEntityDeletion } from '@/hooks';

function EntityCard({ entity }) {
  const { deleteEntity, isDeleting } = useEntityDeletion();

  const handleDelete = () => {
    deleteEntity(entity.id, entity.name);
  };

  return (
    <ActionIcon onClick={handleDelete} loading={isDeleting}>
      <IconTrash />
    </ActionIcon>
  );
}
```

### Behavior

1. Shows confirmation modal if entity has relations
2. Removes entity and all associated relations
3. Updates history for undo support
4. Shows success notification

---

## useThrottledAction

Throttles rapid user actions to prevent accidental double-clicks.

### Usage

```typescript
import { useThrottledAction } from '@/hooks';

function SubmitButton() {
  const [throttledSubmit, isThrottled] = useThrottledAction(
    async () => {
      await submitForm();
    },
    1000 // 1 second throttle
  );

  return (
    <Button onClick={throttledSubmit} disabled={isThrottled}>
      Submit
    </Button>
  );
}
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | `() => void \| Promise<void>` | Action to throttle |
| `delay` | `number` | Throttle delay in ms |

### Returns

`[throttledAction, isThrottled]`

---

## useSelectedEntity

Returns the currently selected entity with memoization.

### Usage

```typescript
import { useSelectedEntity } from '@/hooks';

function EntityDetailPanel() {
  const entity = useSelectedEntity();

  if (!entity) {
    return <EmptyState />;
  }

  return <EntityForm entity={entity} />;
}
```

---

## Canvas Hooks

Located in `src/components/canvas/hooks/`:

### useCanvasNodes

Transforms entities into React Flow nodes.

```typescript
const nodes = useCanvasNodes(entities, selectedIds);
```

### useCanvasEdges

Transforms relations into React Flow edges.

```typescript
const edges = useCanvasEdges(relations, entities);
```

### useAutoLayout

Applies automatic layout algorithm to nodes.

```typescript
const { applyLayout, isLayouting } = useAutoLayout();
await applyLayout(); // Reorganizes all nodes
```

### useNodeDragHandlers

Handles node drag events with position persistence.

```typescript
const { onNodeDragStop, onNodesChange } = useNodeDragHandlers();
```

### useNodeSelection

Manages node selection state.

```typescript
const { onSelectionChange, selectedNodes } = useNodeSelection();
```

---

## Best Practices

### 1. Memoize Callbacks

```typescript
const handleDelete = useCallback(() => {
  deleteEntity(entity.id);
}, [entity.id, deleteEntity]);
```

### 2. Clean Up Effects

```typescript
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### 3. Use Proper Dependencies

```typescript
// Include all dependencies used inside the hook
useEffect(() => {
  doSomething(entityId, relations);
}, [entityId, relations]); // ✅ Both dependencies listed
```
