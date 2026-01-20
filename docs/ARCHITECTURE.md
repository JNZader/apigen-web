# APiGen Studio - Technical Architecture

> Deep dive into the technical decisions, patterns, and architecture of APiGen Studio.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Decisions](#technology-decisions)
3. [Application Architecture](#application-architecture)
4. [State Management](#state-management)
5. [Performance Optimizations](#performance-optimizations)
6. [Accessibility Implementation](#accessibility-implementation)
7. [Code Generation](#code-generation)
8. [Security Considerations](#security-considerations)

---

## Overview

APiGen Studio is a **Single Page Application (SPA)** that runs entirely in the browser. It allows users to visually design Spring Boot APIs and generates downloadable project files.

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **SPA Architecture** | No backend needed, instant feedback, offline-capable |
| **Client-side Generation** | Privacy (data never leaves browser), no server costs |
| **LocalStorage Persistence** | Simple, no authentication needed, instant save |
| **Component-based UI** | Reusable, testable, maintainable |

---

## Technology Decisions

### React 19

**Chosen for:**
- Large ecosystem and community
- Excellent TypeScript integration
- Concurrent rendering for smooth UX
- React Flow (canvas library) compatibility

**Alternatives considered:**
- **Vue.js 3**: Good, but smaller React Flow equivalent
- **Svelte**: Great DX, but smaller ecosystem
- **Angular**: Too heavy for this use case

### TypeScript 5.9

**Chosen for:**
- Compile-time type checking
- Enhanced IDE support (autocomplete, refactoring)
- Self-documenting code
- Better collaboration

**Key TypeScript patterns used:**
```typescript
// Discriminated unions for type safety
type JavaType =
  | 'String'
  | 'Long'
  | 'Integer'
  | 'BigDecimal'
  | 'Boolean'
  | 'LocalDate'
  | 'LocalDateTime';

// Generic utility types
type Partial<T> = { [P in keyof T]?: T[P] };

// Const assertions for immutable config
const JAVA_TYPES = ['String', 'Long', ...] as const;
type JavaType = typeof JAVA_TYPES[number];
```

### Mantine 8

**Chosen for:**
- Modern, accessible components out of the box
- Excellent TypeScript support
- Highly customizable theming
- Great form handling with @mantine/form
- Built-in hooks library

**Why not Material UI:**
- Mantine is lighter weight
- Better TypeScript DX
- More modern design defaults
- Easier customization

**Why not Tailwind + Headless UI:**
- More development time needed
- Would need to build many components from scratch
- Accessibility would need manual implementation

### Zustand

**Chosen for:**
- Minimal boilerplate (vs Redux)
- Simple mental model
- Built-in persistence middleware
- Excellent TypeScript support
- Small bundle size (~1KB)

**Why not Redux Toolkit:**
```typescript
// Redux requires more boilerplate
// store.ts, slice.ts, actions, reducers, selectors...

// Zustand is simpler
const useStore = create((set) => ({
  entities: [],
  addEntity: (e) => set((s) => ({ entities: [...s.entities, e] }))
}));
```

**Why not React Context:**
- Context causes re-renders of all consumers
- Zustand only re-renders subscribers to changed state
- Better for frequent updates (drag operations)

### React Flow

**Chosen for:**
- Purpose-built for node-based editors
- Production-ready with good documentation
- Built-in pan, zoom, minimap
- Custom node/edge support
- Active maintenance

**Why not D3.js:**
- D3 requires more manual work for nodes
- Less React-friendly
- Would need to build drag/drop from scratch

### Vite

**Chosen for:**
- Instant dev server startup
- Lightning-fast HMR
- Optimized production builds
- Native ES modules
- Good plugin ecosystem

**Why not Create React App:**
- CRA is slower
- Webpack configuration is complex
- Vite is the modern standard

---

## Application Architecture

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Pages     │ │ Components  │ │   Hooks     │           │
│  │ (routes)    │ │   (UI)      │ │ (logic)     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    State Layer                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Zustand Stores                    │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │  Project    │ │   History   │ │   Derived   │   │   │
│  │  │   Store     │ │    Store    │ │  Selectors  │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Utility Layer                             │
│                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │   Code    │ │    SQL    │ │ Validation│ │  Layout   │   │
│  │ Generator │ │  Parser   │ │           │ │ Algorithm │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Type Layer                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TypeScript Interfaces                   │   │
│  │  EntityDesign, FieldDesign, RelationDesign, etc.    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── MantineProvider (theme)
├── ModalsProvider (modals)
├── Notifications (toasts)
└── DesignerPage
    ├── Layout
    │   ├── AppShell.Header
    │   │   ├── Undo/Redo buttons
    │   │   ├── Template menu
    │   │   ├── Settings button
    │   │   ├── Import/Export
    │   │   ├── Download menu
    │   │   └── Theme toggle
    │   ├── AppShell.Navbar
    │   │   └── EntityList
    │   │       └── EntityCard (per entity)
    │   └── AppShell.Main
    │       └── [Content]
    ├── DesignerCanvas (Canvas view)
    │   ├── ReactFlow
    │   │   ├── EntityNode (custom node)
    │   │   └── RelationEdge (custom edge)
    │   ├── Controls
    │   ├── MiniMap
    │   └── Panel (toolbar)
    ├── EntityDetailPanel (selected entity)
    ├── EntityForm (modal)
    ├── RelationForm (modal)
    ├── ProjectSettings (lazy modal)
    ├── TemplateSelector (lazy modal)
    ├── SqlImportExport (lazy modal)
    └── Onboarding (first-time users)
```

### Data Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────▶│   Component  │────▶│    Store     │
│   Action     │     │   Handler    │     │   Action     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Component   │◀────│   Selector   │◀────│    State     │
│  Re-render   │     │ Subscription │     │   Update     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ LocalStorage │
                                          │   Persist    │
                                          └──────────────┘
```

---

## State Management

### Store Structure

```typescript
// projectStore.ts
interface ProjectStore {
  // === State ===
  project: ProjectConfig;        // Project metadata
  entities: EntityDesign[];      // All entities
  relations: RelationDesign[];   // All relationships
  selectedEntityId: string | null;
  layoutPreference: LayoutPreset;
  needsAutoLayout: boolean;

  // === Actions ===
  // Project
  setProject: (updates: Partial<ProjectConfig>) => void;
  resetProject: () => void;
  exportProject: () => string;
  importProject: (json: string) => void;

  // Entities
  addEntity: (name: string) => EntityDesign;
  updateEntity: (id: string, updates: Partial<EntityDesign>) => void;
  removeEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;
  setEntities: (entities: EntityDesign[]) => void;

  // Fields
  addField: (entityId: string, field: Omit<FieldDesign, 'id'>) => void;
  updateField: (entityId: string, fieldId: string, updates: Partial<FieldDesign>) => void;
  removeField: (entityId: string, fieldId: string) => void;

  // Relations
  addRelation: (relation: Omit<RelationDesign, 'id'>) => void;
  updateRelation: (id: string, updates: Partial<RelationDesign>) => void;
  removeRelation: (id: string) => void;

  // Layout
  updateEntityPositions: (positions: Map<string, Position>) => void;
  setLayoutPreference: (preset: LayoutPreset) => void;
}
```

### Atomic Selectors Pattern

**Problem:** Using the entire store causes unnecessary re-renders.

```typescript
// ❌ Bad - subscribes to ALL state changes
const { entities, relations, addEntity } = useProjectStore();

// ✅ Good - subscribes only to what's needed
const entities = useEntities();
const relations = useRelations();
const { addEntity } = useEntityActions();
```

**Implementation:**

```typescript
// State selectors - simple, direct access
export const useEntities = () =>
  useProjectStore((state) => state.entities);

export const useRelations = () =>
  useProjectStore((state) => state.relations);

// Derived selectors - computed values
export const useSelectedEntity = () =>
  useProjectStore((state) =>
    state.selectedEntityId
      ? state.entities.find(e => e.id === state.selectedEntityId)
      : undefined
  );

// Action selectors - grouped for convenience
// Uses useShallow to prevent infinite loops
export const useEntityActions = () =>
  useProjectStore(
    useShallow((state) => ({
      addEntity: state.addEntity,
      updateEntity: state.updateEntity,
      removeEntity: state.removeEntity,
    }))
  );
```

### History Store (Undo/Redo)

```typescript
// historyStore.ts
interface HistoryStore {
  past: HistoryState[];      // Undo stack
  future: HistoryState[];    // Redo stack
  current: HistoryState | null;
  isTimeTravel: boolean;     // Prevents double-saving during undo/redo

  saveSnapshot: (state: HistoryState) => void;
  undo: () => HistoryState | null;
  redo: () => HistoryState | null;
}

// History state is a subset of project state
interface HistoryState {
  entities: EntityDesign[];
  relations: RelationDesign[];
}
```

**Integration with useHistory hook:**

```typescript
export function useHistory() {
  const entities = useProjectStore((s) => s.entities);
  const relations = useProjectStore((s) => s.relations);
  const { saveSnapshot, undo: undoAction, redo: redoAction, isTimeTravel } = useHistoryStore();

  // Auto-save on changes (but not during undo/redo)
  useEffect(() => {
    if (!isTimeTravel) {
      saveSnapshot({ entities, relations });
    }
  }, [entities, relations]);

  const undo = useCallback(() => {
    const previous = undoAction();
    if (previous) {
      // Direct setState to avoid triggering needsAutoLayout
      useProjectStore.setState({
        entities: previous.entities,
        relations: previous.relations,
        needsAutoLayout: false,
      });
    }
  }, []);

  return { undo, redo, canUndo, canRedo };
}
```

---

## Performance Optimizations

### 1. Atomic Selectors

Subscribe only to needed state slices. Already covered above.

### 2. Memoization

```typescript
// Memoize expensive filtering
const filteredEntities = useMemo(() =>
  entities.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  ),
  [entities, searchTerm]
);

// Memoize callbacks to prevent child re-renders
const handleDelete = useCallback((id: string) => {
  removeEntity(id);
}, [removeEntity]);
```

### 3. Lazy Loading

```typescript
// Lazy load heavy modals
const ProjectSettings = lazy(() =>
  import('./ProjectSettings').then(m => ({ default: m.ProjectSettings }))
);

const TemplateSelector = lazy(() =>
  import('./TemplateSelector').then(m => ({ default: m.TemplateSelector }))
);

// Render with Suspense
<Suspense fallback={<LoadingOverlay visible />}>
  {settingsOpened && <ProjectSettings opened onClose={close} />}
</Suspense>
```

### 4. Debounced Position Updates

Canvas dragging would cause hundreds of store updates per second. Debouncing reduces this.

```typescript
const debouncedPositionUpdate = useDebouncedCallback(
  (positions: Array<{ id: string; position: Position }>) => {
    positions.forEach(({ id, position }) => {
      updateEntity(id, { position });
    });
  },
  100 // 100ms debounce
);

const handleNodesChange = useCallback((changes: NodeChange[]) => {
  onNodesChange(changes);

  const positionChanges = changes
    .filter((c): c is NodePositionChange => c.type === 'position' && !!c.position)
    .map(c => ({ id: c.id, position: c.position }));

  if (positionChanges.length > 0) {
    debouncedPositionUpdate(positionChanges);
  }
}, [onNodesChange, debouncedPositionUpdate]);
```

### 5. React.memo for Canvas Nodes

```typescript
export const EntityNode = memo(function EntityNode({ data }: EntityNodeProps) {
  // Component body
});
```

---

## Accessibility Implementation

### WCAG 2.1 AA Compliance

#### 1. Keyboard Navigation

All interactive elements are focusable and operable with keyboard.

```typescript
// Global keyboard shortcuts
useHotkeys([
  ['mod+z', () => onUndo?.(), { preventDefault: true }],
  ['mod+y', () => onRedo?.(), { preventDefault: true }],
  ['mod+s', () => onSave?.(), { preventDefault: true }],
  ['mod+n', () => onAddEntity?.(), { preventDefault: true }],
  ['delete', () => onDelete?.()],
  ['escape', () => onEscape?.()],
]);
```

#### 2. ARIA Labels

```tsx
<ActionIcon
  aria-label="Add new entity"
  aria-haspopup="menu"
>
  <IconPlus />
</ActionIcon>

<div
  role="application"
  aria-label="Entity relationship diagram canvas"
  aria-describedby="canvas-description"
>
  {/* Canvas content */}
</div>
```

#### 3. Screen Reader Support

```tsx
// Accessible description of canvas
const canvasDescription = useMemo(() => {
  if (entities.length === 0) {
    return 'Empty entity diagram canvas.';
  }
  return `Entity diagram with ${entities.length} entities: ${entityNames}.`;
}, [entities]);

<VisuallyHidden>
  <div id="canvas-description" role="status" aria-live="polite">
    {canvasDescription}
  </div>
</VisuallyHidden>
```

#### 4. Reduced Motion

```css
/* index.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Also in theme:
```typescript
export const theme = createTheme({
  respectReducedMotion: true,
});
```

#### 5. Skip Links

```tsx
<a
  href="#main-content"
  className="skip-link"
  onFocus={handleFocus}
  onBlur={handleBlur}
>
  Skip to main content
</a>
```

#### 6. Focus Management

```tsx
// Focus trap in modals (handled by Mantine)
<Modal
  opened={opened}
  onClose={onClose}
  trapFocus // Default: true
>
  {/* Content */}
</Modal>
```

---

## Code Generation

### Client-Side Generation

All code generation happens in the browser using JSZip.

```typescript
// utils/codeGenerator.ts
export async function generateProject(
  project: ProjectConfig,
  entities: EntityDesign[],
  relations: RelationDesign[]
): Promise<Blob> {
  const zip = new JSZip();

  // Generate build files
  zip.file('build.gradle.kts', generateBuildGradle(project));
  zip.file('settings.gradle.kts', generateSettingsGradle(project));

  // Generate source files
  for (const entity of entities) {
    const basePath = `src/main/java/${packageToPath(project.packageName)}`;

    zip.file(
      `${basePath}/domain/entity/${entity.name}.java`,
      generateEntity(entity, project)
    );
    zip.file(
      `${basePath}/application/dto/${entity.name}DTO.java`,
      generateDTO(entity, project)
    );
    zip.file(
      `${basePath}/infrastructure/repository/${entity.name}Repository.java`,
      generateRepository(entity, project)
    );
    zip.file(
      `${basePath}/application/service/${entity.name}Service.java`,
      generateService(entity, project)
    );
    zip.file(
      `${basePath}/interfaces/rest/${entity.name}Controller.java`,
      generateController(entity, project)
    );
  }

  // Generate application.yml
  zip.file('src/main/resources/application.yml', generateApplicationYml(project));

  return zip.generateAsync({ type: 'blob' });
}
```

### Template Generation

Each file type has its own generator:

```typescript
function generateEntity(entity: EntityDesign, project: ProjectConfig): string {
  return `package ${project.packageName}.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "${entity.tableName}")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ${entity.name} extends Base {

${entity.fields.map(f => generateField(f)).join('\n')}

${entity.relations?.map(r => generateRelation(r)).join('\n') ?? ''}
}`;
}
```

---

## Security Considerations

### Client-Side Only

- **No data transmission**: All design data stays in browser
- **LocalStorage**: Data persists locally only
- **No authentication**: No user accounts needed

### Input Validation

```typescript
// Zod schema for import validation
const ProjectImportSchema = z.object({
  project: ProjectConfigSchema.partial(),
  entities: z.array(EntityDesignSchema),
  relations: z.array(RelationDesignSchema),
});

export function validateProjectImport(json: string) {
  const data = JSON.parse(json);
  return ProjectImportSchema.parse(data);
}
```

### XSS Prevention

- React escapes all content by default
- No `dangerouslySetInnerHTML` usage
- Code preview uses syntax highlighting library (safe)

### Content Security

- Mantine handles all input sanitization
- No eval() or new Function()
- Downloaded ZIP is generated locally

---

## Future Considerations

### Potential Improvements

1. **Web Workers**: Move code generation to background thread
2. **IndexedDB**: For larger project storage
3. **Collaboration**: Real-time editing with WebRTC
4. **Server-side generation**: For more complex templates
5. **Testing**: Add comprehensive unit/e2e tests

### Scalability

Current architecture supports:
- ~100 entities per project (tested)
- ~1000 fields total (tested)
- Larger projects may need virtualization

---

## References

- [React Documentation](https://react.dev/)
- [Mantine Documentation](https://mantine.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Flow Documentation](https://reactflow.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
