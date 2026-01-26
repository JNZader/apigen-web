# T-046: Crear Rust Store Slice

> Fase: [[Phases/04-RUST-EDGE]] | Iteracion: 4.2 Store Integration

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-046 |
| **Tipo** | Feature |
| **Estimado** | 1.5h |
| **Dependencias** | [[T-002]], [[T-009]] |
| **Branch** | `feat/rust-support` |
| **Estado** | Pending |

---

## Objetivo

Crear slice de store para manejar opciones de Rust y aplicar presets automaticamente.

---

## Archivos a Crear/Modificar

```
src/store/
├── rustSlice.ts    ← CREAR (~100 lineas)
└── projectStore.ts ← MODIFICAR (integrar slice)
```

---

## Codigo de Referencia

```typescript
// src/store/rustSlice.ts

import type { StateCreator } from 'zustand';
import type { RustAxumOptions, RustPreset } from '@/types/config/rust';
import { RUST_PRESETS } from '@/types/config/rust';

export interface RustSlice {
  rustOptions: RustAxumOptions;
  updateRustOptions: (options: Partial<RustAxumOptions>) => void;
  applyRustPreset: (preset: RustPreset) => void;
  resetRustOptions: () => void;
}

const DEFAULT_RUST_OPTIONS: RustAxumOptions = {
  preset: 'standard',
  database: 'sqlx-postgres',
  poolSize: 10,
  queryLogging: false,
  cors: true,
  rateLimiting: false,
  rateLimit: 100,
  securityHeaders: true,
  serialization: 'serde',
  compression: true,
  caching: false,
  cacheTtl: 300,
  tracing: true,
  metrics: false,
  healthCheck: true,
};

export const createRustSlice: StateCreator<RustSlice> = (set, get) => ({
  rustOptions: DEFAULT_RUST_OPTIONS,

  updateRustOptions: (options) => {
    set((state) => ({
      rustOptions: {
        ...state.rustOptions,
        ...options,
      },
    }));
  },

  applyRustPreset: (preset) => {
    const presetConfig = RUST_PRESETS[preset];
    set({
      rustOptions: {
        ...DEFAULT_RUST_OPTIONS,
        ...presetConfig,
        preset,
      },
    });
  },

  resetRustOptions: () => {
    set({ rustOptions: DEFAULT_RUST_OPTIONS });
  },
});

// Helper to get preset configuration
export function getRustPresetConfig(preset: RustPreset): Partial<RustAxumOptions> {
  return RUST_PRESETS[preset] || {};
}

// Validation for Rust options
export function validateRustOptions(options: RustAxumOptions): string[] {
  const errors: string[] = [];

  if (options.poolSize < 1) {
    errors.push('Pool size must be at least 1');
  }

  if (options.poolSize > 100) {
    errors.push('Pool size should not exceed 100');
  }

  if (options.rateLimiting && options.rateLimit < 10) {
    errors.push('Rate limit must be at least 10 requests per minute');
  }

  if (options.caching && options.cacheTtl < 1) {
    errors.push('Cache TTL must be at least 1 second');
  }

  return errors;
}
```

```typescript
// Modificar en projectStore.ts

import { createRustSlice, type RustSlice } from './rustSlice';

// Agregar al tipo del store:
type ProjectStore = /* existing types */ & RustSlice;

// En el create:
export const useProjectStore = create<ProjectStore>()(
  persist(
    (...a) => ({
      // ... existing slices
      ...createRustSlice(...a),
    }),
    {
      name: 'project-store',
      // Asegurar que rustOptions se persiste
      partialize: (state) => ({
        // ... existing partialize
        rustOptions: state.rustOptions,
      }),
    }
  )
);
```

---

## Criterios de Completado

- [ ] Slice creado con todos los metodos
- [ ] Presets se aplican correctamente
- [ ] Validacion funciona
- [ ] Persistencia funciona
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

#task #fase-4 #feature #pending

[[T-002]], [[T-009]] → [[T-046]] → [[T-047]] | [[Phases/04-RUST-EDGE]]
