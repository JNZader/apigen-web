# T-003: Crear types/config/gochi.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.1 Tipos Base

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-003 |
| **Tipo** | Setup |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-001]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Definir los tipos para las opciones especificas de Go/Chi, incluyendo messaging y caching.

---

## Tareas

- [ ] Crear archivo `src/types/config/gochi.ts`
- [ ] Definir interfaz `GoChiOptions`
- [ ] Definir defaults
- [ ] Helper para obtener defaults

---

## Archivos a Crear

```
src/types/config/
└── gochi.ts                     ← CREAR (~50 lineas)
```

**LOC Estimado:** ~50

---

## Codigo de Referencia

```typescript
// src/types/config/gochi.ts

/**
 * Opciones especificas para Go/Chi
 *
 * Chi es un router HTTP ligero para Go que se usa
 * cuando se necesita mas control que con Gin.
 */
export interface GoChiOptions {
  // ========== MESSAGING ==========
  /** Usar NATS para messaging */
  useNats: boolean;
  /** Usar MQTT para IoT messaging */
  useMqtt: boolean;

  // ========== CACHING ==========
  /** Usar Redis para caching */
  useRedis: boolean;

  // ========== SECURITY ==========
  /** Usar bcrypt para password hashing */
  useBcrypt: boolean;
  /** Usar JWT para autenticacion */
  useJwt: boolean;

  // ========== CONFIGURATION ==========
  /** Usar Viper para configuracion */
  useViper: boolean;
}

/**
 * Defaults para Go/Chi
 */
export const DEFAULT_GO_CHI_OPTIONS: GoChiOptions = {
  useNats: false,
  useMqtt: false,
  useRedis: false,
  useBcrypt: true,
  useJwt: true,
  useViper: true,
};

/**
 * Obtiene los defaults para Go/Chi
 */
export function getGoChiDefaults(): GoChiOptions {
  return { ...DEFAULT_GO_CHI_OPTIONS };
}

/**
 * Descripcion de cada opcion para UI
 */
export const GO_CHI_OPTION_DESCRIPTIONS: Record<keyof GoChiOptions, string> = {
  useNats: 'NATS messaging for microservices communication',
  useMqtt: 'MQTT protocol for IoT device communication',
  useRedis: 'Redis for caching and session storage',
  useBcrypt: 'bcrypt for secure password hashing',
  useJwt: 'JWT tokens for API authentication',
  useViper: 'Viper for flexible configuration management',
};

/**
 * Agrupacion de opciones para UI
 */
export const GO_CHI_OPTION_GROUPS = {
  messaging: ['useNats', 'useMqtt'] as const,
  caching: ['useRedis'] as const,
  security: ['useBcrypt', 'useJwt'] as const,
  config: ['useViper'] as const,
};

export type GoChiOptionGroup = keyof typeof GO_CHI_OPTION_GROUPS;
```

---

## Criterios de Completado

- [ ] Interfaz definida con todas las opciones
- [ ] Defaults definidos
- [ ] Descripciones para UI
- [ ] Agrupacion para formulario
- [ ] Tipos compilan sin errores
- [ ] `npm run check` pasa

---

## Notas

- Go/Chi tiene menos opciones que Rust
- Las opciones deben coincidir con el backend
- Viper es standard en Go para configuracion

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

[[T-001]] → [[T-003]] → [[T-006]] | [[Phases/00-FOUNDATION]]
