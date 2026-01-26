# T-050: Tests Rust Store Slice

> Fase: [[Phases/04-RUST-EDGE]] | Iteracion: 4.3 Tests

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-050 |
| **Tipo** | Test |
| **Estimado** | 1h |
| **Dependencias** | [[T-046]] |
| **Branch** | `feat/rust-support` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para el Rust store slice.

---

## Archivos a Crear

```
src/store/
└── rustSlice.test.ts  ← CREAR (~80 lineas)
```

---

## Codigo de Referencia

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createRustSlice, validateRustOptions, type RustSlice } from './rustSlice';

describe('rustSlice', () => {
  let store: ReturnType<typeof create<RustSlice>>;

  beforeEach(() => {
    store = create<RustSlice>()((...a) => ({
      ...createRustSlice(...a),
    }));
  });

  describe('initial state', () => {
    it('has standard preset by default', () => {
      expect(store.getState().rustOptions.preset).toBe('standard');
    });

    it('has sqlx-postgres database by default', () => {
      expect(store.getState().rustOptions.database).toBe('sqlx-postgres');
    });

    it('has sensible defaults', () => {
      const options = store.getState().rustOptions;
      expect(options.poolSize).toBe(10);
      expect(options.cors).toBe(true);
      expect(options.tracing).toBe(true);
      expect(options.healthCheck).toBe(true);
    });
  });

  describe('updateRustOptions', () => {
    it('updates single option', () => {
      store.getState().updateRustOptions({ database: 'sea-orm' });
      expect(store.getState().rustOptions.database).toBe('sea-orm');
    });

    it('updates multiple options', () => {
      store.getState().updateRustOptions({
        database: 'diesel-postgres',
        poolSize: 20,
        caching: true,
      });

      const options = store.getState().rustOptions;
      expect(options.database).toBe('diesel-postgres');
      expect(options.poolSize).toBe(20);
      expect(options.caching).toBe(true);
    });

    it('preserves other options', () => {
      const initialCors = store.getState().rustOptions.cors;
      store.getState().updateRustOptions({ database: 'sea-orm' });
      expect(store.getState().rustOptions.cors).toBe(initialCors);
    });
  });

  describe('applyRustPreset', () => {
    it('applies minimal preset', () => {
      store.getState().applyRustPreset('minimal');
      const options = store.getState().rustOptions;

      expect(options.preset).toBe('minimal');
      expect(options.caching).toBe(false);
      expect(options.metrics).toBe(false);
    });

    it('applies full preset', () => {
      store.getState().applyRustPreset('full');
      const options = store.getState().rustOptions;

      expect(options.preset).toBe('full');
      expect(options.caching).toBe(true);
      expect(options.metrics).toBe(true);
      expect(options.rateLimiting).toBe(true);
    });

    it('applies performance preset', () => {
      store.getState().applyRustPreset('performance');
      const options = store.getState().rustOptions;

      expect(options.preset).toBe('performance');
      expect(options.compression).toBe(true);
    });

    it('resets to defaults when changing preset', () => {
      // First modify some options
      store.getState().updateRustOptions({ poolSize: 50, cacheTtl: 999 });

      // Apply preset should reset
      store.getState().applyRustPreset('minimal');

      const options = store.getState().rustOptions;
      expect(options.poolSize).toBe(10); // Back to default
    });
  });

  describe('resetRustOptions', () => {
    it('resets all options to defaults', () => {
      store.getState().updateRustOptions({
        preset: 'full',
        database: 'sea-orm',
        poolSize: 50,
        caching: true,
      });

      store.getState().resetRustOptions();

      const options = store.getState().rustOptions;
      expect(options.preset).toBe('standard');
      expect(options.database).toBe('sqlx-postgres');
      expect(options.poolSize).toBe(10);
    });
  });
});

describe('validateRustOptions', () => {
  it('returns no errors for valid options', () => {
    const options = {
      preset: 'standard' as const,
      database: 'sqlx-postgres',
      poolSize: 10,
      rateLimiting: true,
      rateLimit: 100,
      caching: true,
      cacheTtl: 300,
    };

    const errors = validateRustOptions(options as any);
    expect(errors).toHaveLength(0);
  });

  it('returns error for invalid pool size', () => {
    const options = {
      poolSize: 0,
    };

    const errors = validateRustOptions(options as any);
    expect(errors).toContain('Pool size must be at least 1');
  });

  it('returns error for pool size over 100', () => {
    const options = {
      poolSize: 150,
    };

    const errors = validateRustOptions(options as any);
    expect(errors).toContain('Pool size should not exceed 100');
  });

  it('returns error for low rate limit when enabled', () => {
    const options = {
      poolSize: 10,
      rateLimiting: true,
      rateLimit: 5,
    };

    const errors = validateRustOptions(options as any);
    expect(errors).toContain('Rate limit must be at least 10 requests per minute');
  });

  it('returns error for invalid cache TTL', () => {
    const options = {
      poolSize: 10,
      caching: true,
      cacheTtl: 0,
    };

    const errors = validateRustOptions(options as any);
    expect(errors).toContain('Cache TTL must be at least 1 second');
  });
});
```

---

## Criterios de Completado

- [ ] Tests cubren initial state
- [ ] Tests cubren updateRustOptions
- [ ] Tests cubren applyRustPreset
- [ ] Tests cubren resetRustOptions
- [ ] Tests cubren validateRustOptions
- [ ] Cobertura >80%
- [ ] `npm run test:run` pasa

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

#task #fase-4 #test #pending

[[T-046]] → [[T-050]] → [[T-051]] | [[Phases/04-RUST-EDGE]]
