# T-039: Agregar Boton de Import en Toolbar

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.3 UI Components

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-039 |
| **Tipo** | Feature |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-038]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Agregar boton para abrir el modal de importacion OpenAPI en el toolbar principal.

---

## Archivos a Modificar

```
src/components/canvas/
└── CanvasToolbar.tsx  ← MODIFICAR (agregar boton)
```

---

## Codigo de Referencia

```typescript
// Agregar en CanvasToolbar.tsx

import { useState } from 'react';
import { OpenApiImportModal } from '../OpenApiImportModal';

// Dentro del componente:
const [importModalOpened, setImportModalOpened] = useState(false);

// Handler para importar:
const handleImport = useCallback((entities: Entity[], relations: Relation[]) => {
  // Agregar entidades al store
  entities.forEach((entity) => {
    addEntity(entity);
  });

  // Agregar relaciones al store
  relations.forEach((relation) => {
    addRelation(relation);
  });

  // Ejecutar auto-layout
  autoLayout();
}, [addEntity, addRelation, autoLayout]);

// En el JSX, agregar boton:
<Menu position="bottom-start" shadow="md">
  <Menu.Target>
    <ActionIcon variant="default" size="lg">
      <IconPlus size={18} />
    </ActionIcon>
  </Menu.Target>
  <Menu.Dropdown>
    <Menu.Item
      leftSection={<IconDatabase size={16} />}
      onClick={() => setEntityFormOpened(true)}
    >
      New Entity
    </Menu.Item>
    <Menu.Item
      leftSection={<IconFileImport size={16} />}
      onClick={() => setImportModalOpened(true)}
    >
      Import from OpenAPI
    </Menu.Item>
    <Menu.Item
      leftSection={<IconFileCode size={16} />}
      onClick={() => setSqlImportOpened(true)}
    >
      Import from SQL
    </Menu.Item>
  </Menu.Dropdown>
</Menu>

// Modal:
<OpenApiImportModal
  opened={importModalOpened}
  onClose={() => setImportModalOpened(false)}
  onImport={handleImport}
/>
```

---

## Criterios de Completado

- [ ] Boton visible en toolbar
- [ ] Menu dropdown funciona
- [ ] Modal se abre al click
- [ ] Import crea entidades correctamente
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

#task #fase-3 #feature #pending

[[T-038]] → [[T-039]] → [[T-040]] | [[Phases/03-OPENAPI-IMPORT]]
