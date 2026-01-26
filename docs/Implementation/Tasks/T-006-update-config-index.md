# T-006: Actualizar types/config/index.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.3 Actualizacion de Types

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-006 |
| **Tipo** | Setup |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-002]], [[T-003]], [[T-004]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Actualizar el archivo index de configuraciones para re-exportar todos los nuevos tipos de forma centralizada.

---

## Tareas

- [ ] Agregar exports de featurepack.ts
- [ ] Agregar exports de rust.ts
- [ ] Agregar exports de gochi.ts
- [ ] Verificar que no hay conflictos de nombres

---

## Archivos a Modificar

```
src/types/config/
└── index.ts                     ← MODIFICAR (~20 lineas adicionales)
```

**LOC Estimado:** ~20 adicionales

---

## Codigo de Referencia

```typescript
// src/types/config/index.ts

// ============================================
// EXISTING EXPORTS
// ============================================

export * from './api';
export * from './database';
export * from './cache';
export * from './security';
export * from './resilience';
export * from './observability';
export * from './features';
export * from './messaging';
export * from './microservices';

// ============================================
// NEW EXPORTS - Feature Pack 2025
// ============================================

export * from './featurepack';

// ============================================
// NEW EXPORTS - Language-Specific
// ============================================

export * from './rust';
export * from './gochi';

// ============================================
// TYPE GUARDS (optional helpers)
// ============================================

import type { RustAxumOptions } from './rust';
import type { GoChiOptions } from './gochi';
import type { StorageConfig } from './featurepack';

/**
 * Type guard para verificar si es storage S3
 */
export function isS3Storage(config: StorageConfig): boolean {
  return config.type === 's3';
}

/**
 * Type guard para verificar si es storage Azure
 */
export function isAzureStorage(config: StorageConfig): boolean {
  return config.type === 'azure';
}

/**
 * Type guard para verificar si es storage local
 */
export function isLocalStorage(config: StorageConfig): boolean {
  return config.type === 'local';
}
```

---

## Verificacion de Conflictos

Asegurar que no hay conflictos de nombres entre archivos:

| Archivo | Exports principales |
|---------|---------------------|
| featurepack.ts | SocialLoginConfig, MailConfig, StorageConfig, JteConfig |
| rust.ts | RustPreset, RustAxumOptions |
| gochi.ts | GoChiOptions |
| existing files | DatabaseConfig, SecurityConfig, etc. |

---

## Criterios de Completado

- [ ] Todos los nuevos tipos exportados
- [ ] Sin conflictos de nombres
- [ ] Imports en otros archivos funcionan
- [ ] `npm run check` pasa

---

## Notas

- Usar `export *` para simplicidad
- Los type guards son opcionales pero utiles

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

#task #fase-0 #setup #pending

[[T-002]] [[T-003]] [[T-004]] → [[T-006]] | [[Phases/00-FOUNDATION]]
