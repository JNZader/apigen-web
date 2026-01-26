# Fase 0: Foundation

> **Prioridad:** CRITICA - Bloquea todas las demas fases
> **Duracion estimada:** 4-6 horas
> **Paralelizable:** NO - Debe completarse antes de cualquier otra fase

---

## Objetivo

Crear la base de tipos, schemas y stores que permitiran desarrollar todas las features en paralelo sin conflictos.

---

## Iteraciones

### Iteracion 0.1: Tipos Base de Target/Language

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-001]] Crear types/target.ts | feat/foundation-types | - |
| [[T-002]] Crear types/config/rust.ts | feat/foundation-types | T-001 |
| [[T-003]] Crear types/config/gochi.ts | feat/foundation-types | T-001 |

### Iteracion 0.2: Tipos Feature Pack 2025

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-004]] Crear types/config/featurepack.ts | feat/foundation-types | T-001 |

### Iteracion 0.3: Actualizacion de Project Types

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-005]] Actualizar types/project.ts | feat/foundation-types | T-001, T-004 |
| [[T-006]] Actualizar types/config/index.ts | feat/foundation-types | T-002, T-003, T-004 |

### Iteracion 0.4: API Schemas (Zod)

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-007]] Crear Zod schemas en api/schemas.ts | feat/foundation-types | T-005 |
| [[T-008]] Actualizar api/generatorApi.ts | feat/foundation-types | T-007 |

### Iteracion 0.5: Store Updates

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-009]] Actualizar projectStore.ts | feat/foundation-types | T-005 |
| [[T-010]] Actualizar projectConfigBuilder.ts | feat/foundation-types | T-007, T-009 |

---

## Archivos a Crear

```
src/types/
├── target.ts                    ← NUEVO (~150 lineas)
└── config/
    ├── featurepack.ts           ← NUEVO (~200 lineas)
    ├── rust.ts                  ← NUEVO (~100 lineas)
    └── gochi.ts                 ← NUEVO (~50 lineas)
```

## Archivos a Modificar

```
src/types/
├── project.ts                   ← Agregar imports y tipos
└── config/
    └── index.ts                 ← Re-exportar nuevos tipos

src/api/
├── schemas.ts                   ← Agregar Zod schemas
└── generatorApi.ts              ← Actualizar request type

src/store/
└── projectStore.ts              ← Agregar state para target y features

src/utils/
└── projectConfigBuilder.ts      ← Incluir nuevos campos en request
```

---

## Criterios de Completado

- [ ] Todos los tipos compilan sin errores
- [ ] Zod schemas validan correctamente
- [ ] projectStore maneja nuevo state
- [ ] npm run check pasa sin errores
- [ ] Tests existentes siguen pasando

---

## Diagrama de Dependencias

```
T-001 (target.ts)
  │
  ├──► T-002 (rust.ts)
  ├──► T-003 (gochi.ts)
  └──► T-004 (featurepack.ts)
         │
         ▼
      T-005 (project.ts) ◄── T-006 (index.ts)
         │
         ▼
      T-007 (schemas.ts)
         │
         ▼
      T-008 (generatorApi.ts)
         │
         ▼
      T-009 (projectStore.ts)
         │
         ▼
      T-010 (projectConfigBuilder.ts)
```

---

## Post-Foundation

Una vez completada esta fase, las siguientes pueden ejecutarse **en paralelo**:

- **Fase 1:** Language Selector (depende de T-001, T-002, T-003)
- **Fase 2.x:** Cada feature del Feature Pack (dependen de T-004)
- **Fase 3:** OpenAPI Import (independiente, puede iniciar)

---

*Branch: feat/foundation-types*
*PR: Crear despues de completar todas las tareas*
