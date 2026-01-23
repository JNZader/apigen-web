# APiGen Studio - Internal API Documentation

This documentation covers the internal APIs, stores, hooks, and utilities used in APiGen Studio.

## Table of Contents

- [State Management (Zustand Stores)](./stores.md)
- [React Hooks](./hooks.md)
- [API Client](./api-client.md)
- [Utilities](./utilities.md)
- [Type Definitions](./types.md)

## Quick Reference

### Stores

| Store | Purpose | Key Selectors |
|-------|---------|---------------|
| `entityStore` | Entity CRUD operations | `useEntities`, `useSelectedEntity`, `useEntityActions` |
| `relationStore` | Relation management | `useRelations`, `useRelationActions` |
| `serviceStore` | Microservice definitions | `useServices`, `useServiceActions` |
| `projectStore` | Project configuration | `useProject`, `useProjectActions` |
| `historyStore` | Undo/Redo functionality | `useCanUndo`, `useCanRedo`, `useHistoryActions` |
| `layoutStore` | Canvas layout state | `useLayoutStore` |
| `canvasUIStore` | Canvas UI state | `useCanvasUIStore` |

### Hooks

| Hook | Purpose |
|------|---------|
| `useProjectGeneration` | Generate and download project ZIP |
| `useKeyboardShortcuts` | Global keyboard shortcuts |
| `useHistory` | Undo/Redo integration |
| `useEntityDeletion` | Safe entity deletion with confirmation |
| `useThrottledAction` | Throttle rapid user actions |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate` | POST | Generate Spring Boot project |
| `/api/health` | GET | Health check |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React Components                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Canvas    │  │   Forms     │  │      Layout         │  │
│  │  (ReactFlow)│  │  (Mantine)  │  │     (Mantine)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Custom Hooks                            │
│  useProjectGeneration, useKeyboardShortcuts, useHistory...  │
├─────────────────────────────────────────────────────────────┤
│                    Zustand Stores                            │
│  entityStore, relationStore, serviceStore, projectStore...  │
├─────────────────────────────────────────────────────────────┤
│                      API Client                              │
│              (Fetch + Retry + Validation)                   │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### Using a Store

```typescript
import { useEntities, useEntityActions } from '@/store';

function MyComponent() {
  // Read state with selectors
  const entities = useEntities();

  // Get actions
  const { addEntity, removeEntity } = useEntityActions();

  // Use in handlers
  const handleAdd = () => {
    addEntity('NewEntity');
  };
}
```

### Using Hooks

```typescript
import { useProjectGeneration } from '@/hooks';

function GenerateButton() {
  const { generate, isGenerating } = useProjectGeneration();

  return (
    <Button onClick={generate} loading={isGenerating}>
      Generate Project
    </Button>
  );
}
```

## Best Practices

1. **Use atomic selectors** - Prevents unnecessary re-renders
2. **Use `useShallow`** - For selecting multiple values
3. **Centralized notifications** - Use `notify.*` from `@/utils/notifications`
4. **Type safety** - All stores and hooks are fully typed
