# Zustand Stores

APiGen Studio uses Zustand for state management with atomic selectors to optimize performance.

## Entity Store

Manages entity definitions and their fields.

### State

```typescript
interface EntityState {
  entities: EntityDesign[];
  selectedEntityId: string | null;
  selectedEntityIds: string[]; // Multi-selection
}
```

### Selectors

```typescript
// Atomic selectors (recommended)
const entities = useEntities();
const selectedId = useSelectedEntityId();
const selectedEntity = useSelectedEntity();
const entity = useEntityById(id);
const count = useEntityCount();

// Action selectors
const {
  addEntity,
  updateEntity,
  removeEntity,
  selectEntity,
  toggleEntitySelection,
  clearEntitySelection,
  setEntities,
} = useEntityActions();

// Field actions
const { addField, updateField, removeField } = useFieldActions();
```

### Usage Examples

```typescript
// Add a new entity
const { addEntity } = useEntityActions();
const newEntity = addEntity('Product'); // Returns created entity

// Update entity
const { updateEntity } = useEntityActions();
updateEntity(entityId, { name: 'NewName', tableName: 'new_names' });

// Add field to entity
const { addField } = useFieldActions();
addField(entityId, {
  name: 'price',
  type: 'BigDecimal',
  nullable: false,
  validations: [{ type: 'Min', value: '0' }],
});
```

---

## Relation Store

Manages relationships between entities.

### State

```typescript
interface RelationState {
  relations: RelationDesign[];
}
```

### Selectors

```typescript
const relations = useRelations();
const relation = useRelationById(id);

const {
  addRelation,
  updateRelation,
  removeRelation,
  setRelations,
  getRelationsForEntity,
} = useRelationActions();
```

### Usage Examples

```typescript
// Add ManyToOne relation
const { addRelation } = useRelationActions();
addRelation({
  type: 'ManyToOne',
  sourceEntityId: 'order-id',
  targetEntityId: 'customer-id',
  sourceFieldName: 'customer',
  bidirectional: true,
  fetchType: 'LAZY',
  cascade: ['PERSIST', 'MERGE'],
});

// Get relations for an entity
const { getRelationsForEntity } = useRelationActions();
const entityRelations = getRelationsForEntity(entityId);
```

---

## Service Store

Manages microservice definitions.

### State

```typescript
interface ServiceState {
  services: ServiceDesign[];
  selectedServiceId: string | null;
}
```

### Selectors

```typescript
const services = useServices();
const selectedService = useSelectedService();

const {
  addService,
  updateService,
  removeService,
  selectService,
  assignEntityToService,
  removeEntityFromService,
} = useServiceActions();
```

### Usage Examples

```typescript
// Create a service
const { addService } = useServiceActions();
addService('UserService');

// Assign entity to service
const { assignEntityToService } = useServiceActions();
assignEntityToService(entityId, serviceId);
```

---

## Project Store

Manages project-wide configuration.

### State

```typescript
interface ProjectState {
  // Maven coordinates
  groupId: string;
  artifactId: string;
  version: string;
  name: string;
  description: string;

  // Java config
  javaVersion: string;
  springBootVersion: string;
  packageName: string;

  // Features
  database: DatabaseConfig;
  api: ApiConfig;
  security: SecurityConfig;
  cache: CacheConfig;
  messaging: MessagingConfig;
  // ... more configs
}
```

### Selectors

```typescript
const project = useProject();
const projectName = useProjectName();

const { updateProject, resetProject } = useProjectActions();
```

---

## History Store

Manages undo/redo functionality.

### State

```typescript
interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  isUndoing: boolean;
  isRedoing: boolean;
}
```

### Selectors

```typescript
const canUndo = useCanUndo();
const canRedo = useCanRedo();

const { undo, redo, pushState, clear } = useHistoryActions();
```

### Usage

History is automatically tracked for entity and relation changes. Use the Layout component's undo/redo buttons or keyboard shortcuts (Ctrl+Z, Ctrl+Y).

---

## Canvas UI Store

Manages canvas-specific UI state.

### State

```typescript
interface CanvasUIState {
  showMinimap: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  zoomLevel: number;
}
```

### Selectors

```typescript
const { showMinimap, showGrid, snapToGrid } = useCanvasUIStore();
const { toggleMinimap, toggleGrid, setZoomLevel } = useCanvasUIActions();
```

---

## Best Practices

### 1. Use Atomic Selectors

```typescript
// ✅ Good - only re-renders when entities change
const entities = useEntities();

// ❌ Bad - re-renders on any store change
const { entities, selectedEntityId } = useEntityStore();
```

### 2. Use useShallow for Multiple Values

```typescript
import { useShallow } from 'zustand/shallow';

// ✅ Good - shallow comparison prevents unnecessary re-renders
const { addEntity, removeEntity } = useEntityStore(
  useShallow((state) => ({
    addEntity: state.addEntity,
    removeEntity: state.removeEntity,
  }))
);
```

### 3. Access Store Outside React

```typescript
// For non-React code (utils, API handlers)
const entities = useEntityStore.getState().entities;
useEntityStore.getState().addEntity('Product');
```

### 4. Reset Stores in Tests

```typescript
import { resetAllStores } from '@/test/utils';

beforeEach(() => {
  resetAllStores();
});
```
