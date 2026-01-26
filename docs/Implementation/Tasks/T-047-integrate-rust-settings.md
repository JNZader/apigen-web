# T-047: Integrar Rust Settings en ProjectSettings

> Fase: [[Phases/04-RUST-EDGE]] | Iteracion: 4.2 Store Integration

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-047 |
| **Tipo** | Integration |
| **Estimado** | 1h |
| **Dependencias** | [[T-044]], [[T-045]], [[T-046]] |
| **Branch** | `feat/rust-support` |
| **Estado** | Pending |

---

## Objetivo

Integrar los componentes de Rust en ProjectSettings, mostrandolos solo cuando Rust esta seleccionado.

---

## Archivos a Modificar

```
src/components/
└── ProjectSettings.tsx  ← MODIFICAR (agregar seccion Rust)
```

---

## Codigo de Referencia

```typescript
// Agregar imports en ProjectSettings.tsx

import { RustPresetSelector } from './ProjectSettings/RustPresetSelector';
import { RustOptionsPanel } from './ProjectSettings/RustOptionsPanel';

// Agregar estado para detectar lenguaje:
const targetConfig = useProjectStore((s) => s.targetConfig);
const isRust = targetConfig?.language === 'rust';

// Agregar en el Accordion principal (despues de la seccion de Framework):

{isRust && (
  <Accordion.Item value="rust">
    <Accordion.Control icon={<IconBrandRust size={20} />}>
      Rust Configuration
      <Badge ml="xs" size="sm" variant="light" color="orange">
        Axum
      </Badge>
    </Accordion.Control>
    <Accordion.Panel>
      <Stack gap="xl">
        <RustPresetSelector />
        <Divider />
        <RustOptionsPanel />
      </Stack>
    </Accordion.Panel>
  </Accordion.Item>
)}
```

```typescript
// Agregar import de icono:
import { IconBrandRust } from '@tabler/icons-react';
```

---

## Logica de Visibilidad

```typescript
// Cuando el usuario cambia a Rust, expandir automaticamente la seccion:
const [accordionValue, setAccordionValue] = useState<string[]>([]);

useEffect(() => {
  if (isRust && !accordionValue.includes('rust')) {
    setAccordionValue((prev) => [...prev, 'rust']);
  }
}, [isRust]);

// Cuando cambia de Rust a otro lenguaje, colapsar y resetear:
useEffect(() => {
  if (!isRust && accordionValue.includes('rust')) {
    setAccordionValue((prev) => prev.filter((v) => v !== 'rust'));
  }
}, [isRust]);
```

---

## Criterios de Completado

- [ ] Seccion Rust visible solo cuando Rust seleccionado
- [ ] Accordion se expande automaticamente
- [ ] Preset y Options funcionan correctamente
- [ ] Badge indica framework (Axum)
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

#task #fase-4 #integration #pending

[[T-044]], [[T-045]], [[T-046]] → [[T-047]] → [[T-048]] | [[Phases/04-RUST-EDGE]]
