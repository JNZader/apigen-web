# AGENTS.md - APiGen Studio Code Review Rules

> Reglas de codigo para revision automatizada por GGA (Gentleman Guardian Angel)

---

## Proyecto

**APiGen Studio** - Aplicacion web frontend para disenar visualmente APIs REST y arquitecturas de microservicios. Stack: React 19, TypeScript, Vite, Mantine, Zustand.

---

## Reglas Criticas (Bloquean Commit)

### 1. State Management (Zustand)

**REQUERIDO:** Usar selectores atomicos para optimizar re-renders.

```typescript
// CORRECTO - selector atomico
const entities = useEntityStore((state) => state.entities);
const addEntity = useEntityStore((state) => state.addEntity);

// INCORRECTO - causa re-renders innecesarios
const { entities, addEntity } = useEntityStore();
```

### 2. Sistema de Notificaciones

**REQUERIDO:** Usar el sistema centralizado `notify` de `@/utils/notifications`.

```typescript
// CORRECTO
import { notify } from '@/utils/notifications';
notify.success({ message: 'Entity created' });
notify.error({ title: 'Error', message: 'Failed to save' });

// INCORRECTO - llamadas directas a Mantine
import { notifications } from '@mantine/notifications';
notifications.show({ ... });
```

### 3. Componentes React

**REQUERIDO:**
- Usar `memo` para componentes que reciben funciones como props
- Usar `useCallback` para handlers pasados a componentes hijos
- Props interfaces deben usar `readonly` o `Readonly<>`

```typescript
// CORRECTO
interface Props {
  readonly onSelect: (id: string) => void;
  readonly items: readonly Item[];
}

export const MyComponent = memo(function MyComponent({ onSelect, items }: Props) {
  const handleClick = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return <div onClick={() => handleClick('1')} />;
});
```

### 4. Imports y Path Aliases

**REQUERIDO:** Usar path aliases en lugar de rutas relativas largas.

```typescript
// CORRECTO
import { Entity } from '@/types/entity';
import { useProjectStore } from '@/store';

// INCORRECTO
import { Entity } from '../../../types/entity';
import { useProjectStore } from '../../../store';
```

---

## Reglas de Seguridad (Bloquean Commit)

### 5. Variables de Entorno

**PROHIBIDO:** Nunca commitear archivos con credenciales o secrets.

- NO commitear: `.env`, `.env.local`, `.env.production`
- NO hardcodear API keys, tokens, o passwords en el codigo

### 6. Validacion de Entrada

**REQUERIDO:** Validar toda entrada externa con Zod schemas.

```typescript
// CORRECTO
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const user = UserSchema.parse(externalData);

// INCORRECTO - sin validacion
const user = externalData as User;
```

---

## Reglas de Estilo (Advertencias)

### 7. Conventional Commits

**REQUERIDO:** Mensajes de commit deben seguir el formato conventional commits.

```
type(scope): descripcion concisa

Tipos validos: feat, fix, docs, style, refactor, test, chore
```

### 8. No Emojis

**REQUERIDO:** No usar emojis en codigo ni comentarios a menos que el usuario lo solicite explicitamente.

### 9. Preferir Editar sobre Crear

**REQUERIDO:** Siempre preferir editar archivos existentes sobre crear nuevos, especialmente para:
- Archivos de configuracion
- Componentes existentes que pueden extenderse
- Utilities que pueden agregarse a archivos existentes

---

## Reglas de Testing

### 10. Tests Aislados

**REQUERIDO:** Reset del store en `beforeEach` para tests aislados.

```typescript
// CORRECTO
beforeEach(() => {
  useEntityStore.getState().reset();
});
```

### 11. Factories para Datos de Prueba

**REQUERIDO:** Usar factories para crear datos de prueba consistentes.

```typescript
// CORRECTO
const entity = createEntityFactory({ name: 'Test' });

// INCORRECTO
const entity = { id: '1', name: 'Test', fields: [] };
```

---

## Patrones Prohibidos

### 12. No Dead Code

**PROHIBIDO:** No dejar codigo muerto, comentado, o funciones no utilizadas.

### 13. No Console.log en Produccion

**PROHIBIDO:** No dejar `console.log`, `console.warn`, o `console.error` en codigo de produccion (excepto en handlers de error especificos).

### 14. No Any

**PROHIBIDO:** Evitar `any` en TypeScript. Usar tipos especificos o `unknown` si es necesario.

```typescript
// INCORRECTO
function processData(data: any) { ... }

// CORRECTO
function processData(data: unknown) {
  if (isValidData(data)) { ... }
}
```

---

## Archivos Especiales

### Archivos que NUNCA deben modificarse sin permiso explicito:
- `package.json` (agregar dependencias)
- `tsconfig.json`
- `vite.config.ts`
- `biome.json`

### Archivos que NUNCA deben commitearse:
- `CLAUDE.md`
- `docs/IMPROVEMENTS.md`
- `.env*` (excepto `.env.example`)

---

## Referencias

- **Documentacion**: `README.md`
- **Arquitectura**: `docs/ARCHITECTURE.md`
- **Tipos principales**: `src/types/`
- **Store principal**: `src/store/projectStore.ts`

---

#gga #code-review #apigen-studio
