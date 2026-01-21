# Plan: Rediseño del Canvas - Eliminar "Both" View + Tabs de Servicios

## Resumen

Eliminar la vista "Both" problemática y rediseñar la vista de Entidades con:
1. **Tabs de filtro por servicio** (All, Service1, Service2..., Unassigned)
2. **Indicador visual** en entidades mostrando servicio asignado (borde de color + badge)
3. **Dropdown de asignación** en el formulario de entidad
4. **Menú contextual** (click derecho) para asignación rápida

---

## Archivos a Modificar

### Fase 1: Eliminar vista "Both"

| Archivo | Cambio |
|---------|--------|
| `src/utils/canvasConstants.ts` | Eliminar `BOTH: 'both'` de `CANVAS_VIEWS` |
| `src/components/canvas/CanvasToolbar.tsx` | Eliminar opción "Both" del SegmentedControl |
| `src/components/canvas/hooks/useCanvasNodes.ts` | Eliminar lógica de `CANVAS_VIEWS.BOTH` |
| `src/components/canvas/hooks/useCanvasEdges.ts` | Eliminar lógica de `CANVAS_VIEWS.BOTH` |
| `src/components/canvas/DesignerCanvas.tsx` | Eliminar manejo de vista "Both" |

### Fase 2: Agregar filtro por servicio

| Archivo | Cambio |
|---------|--------|
| `src/store/layoutStore.ts` | Agregar estado `entityServiceFilter` y acción `setEntityServiceFilter` |
| `src/components/canvas/EntityServiceTabs.tsx` | **NUEVO** - Componente de tabs de servicios |
| `src/components/canvas/CanvasToolbar.tsx` | Integrar EntityServiceTabs |
| `src/components/canvas/hooks/useCanvasNodes.ts` | Filtrar entidades según `entityServiceFilter` |
| `src/components/canvas/DesignerCanvas.tsx` | Pasar `entityServiceFilter` a useCanvasNodes |

### Fase 3: Indicador visual en entidades

| Archivo | Cambio |
|---------|--------|
| `src/components/canvas/EntityNode.tsx` | Agregar borde de color del servicio + badge con nombre del servicio |

### Fase 4: Asignación de servicio

| Archivo | Cambio |
|---------|--------|
| `src/components/EntityForm.tsx` | Agregar dropdown de selección de servicio |
| `src/components/canvas/EntityNode.tsx` | Agregar menú contextual con opciones de asignación |

---

## Nuevo Componente: EntityServiceTabs

```
┌─────────────────────────────────────────────────────────┐
│ [All (5)] [UserService (2)] [OrderService (2)] [Unassigned (1)] │
└─────────────────────────────────────────────────────────┘
```

- Se muestra solo cuando `canvasView === 'entities'` y hay servicios
- Cada tab muestra el contador de entidades
- Tabs de servicios tienen indicador de color

---

## Cambios en EntityNode

**Indicador visual:**
- Borde del color del servicio asignado (o azul si no tiene)
- Badge con nombre del servicio en el header

**Menú contextual (click derecho):**
```
┌─────────────────────────┐
│ Assign to Service       │
├─────────────────────────┤
│ 🔵 UserService          │
│ 🟢 OrderService         │
├─────────────────────────┤
│ ❌ Remove from service  │
└─────────────────────────┘
```

---

## Cambios en EntityForm

Agregar Select después de los campos de configuración:
```
┌─────────────────────────────────┐
│ Assigned Service                │
│ [Select a service (optional) ▼] │
│ Assign this entity to a service │
└─────────────────────────────────┘
```

---

## Orden de Implementación

1. `canvasConstants.ts` - Eliminar BOTH
2. `layoutStore.ts` - Agregar entityServiceFilter
3. `useCanvasNodes.ts` - Eliminar BOTH + agregar filtrado
4. `useCanvasEdges.ts` - Eliminar BOTH
5. `CanvasToolbar.tsx` - Eliminar BOTH del SegmentedControl
6. `DesignerCanvas.tsx` - Eliminar BOTH + pasar entityServiceFilter
7. `EntityServiceTabs.tsx` - Crear componente de tabs
8. `CanvasToolbar.tsx` - Integrar EntityServiceTabs
9. `EntityNode.tsx` - Indicador visual + menú contextual
10. `EntityForm.tsx` - Dropdown de asignación

---

## Casos Edge a Manejar

- **Servicio eliminado mientras su tab está activa**: Resetear filtro a "All"
- **Entidad reasignada**: Desaparece del tab actual si cambia de servicio
- **Sin servicios**: Ocultar tabs y dropdown de asignación
- **Entidad seleccionada y asignada**: El borde del servicio tiene precedencia

---

## Verificación

1. Cambiar entre vistas Entities/Services funciona
2. La opción "Both" ya no existe
3. Los tabs de servicio aparecen solo en vista Entities con servicios
4. Tab "All" muestra todas las entidades
5. Tabs de servicio filtran correctamente
6. Tab "Unassigned" muestra solo las no asignadas
7. Los contadores se actualizan en tiempo real
8. El borde de color aparece en entidades asignadas
9. El badge del servicio aparece en el header de la entidad
10. El menú contextual funciona correctamente
11. El dropdown en EntityForm muestra los servicios
12. La asignación persiste después de guardar
13. Eliminar un servicio resetea el filtro si estaba seleccionado
14. Tests pasan: `npm run test`
15. Build exitoso: `npm run build`
