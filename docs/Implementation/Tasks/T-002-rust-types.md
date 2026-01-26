# T-002: Crear types/config/rust.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.1 Tipos Base

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-002 |
| **Tipo** | Setup |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-001]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Definir los tipos para las opciones especificas de Rust/Axum, incluyendo los 4 presets de edge computing.

---

## Tareas

- [ ] Crear archivo `src/types/config/rust.ts`
- [ ] Definir tipo `RustPreset`
- [ ] Definir interfaz `RustAxumOptions`
- [ ] Definir constantes de presets con defaults
- [ ] Helper para obtener defaults por preset

---

## Archivos a Crear

```
src/types/config/
└── rust.ts                      ← CREAR (~100 lineas)
```

**LOC Estimado:** ~100

---

## Codigo de Referencia

```typescript
// src/types/config/rust.ts

/**
 * Presets disponibles para Rust/Axum
 */
export type RustPreset = 'cloud' | 'edge-gateway' | 'edge-anomaly' | 'edge-ai';

/**
 * Opciones de configuracion para Rust/Axum
 */
export interface RustAxumOptions {
  /** Preset seleccionado */
  preset: RustPreset;

  // ========== DATABASE ==========
  /** Usar PostgreSQL */
  usePostgres: boolean;
  /** Usar SQLite (para edge) */
  useSqlite: boolean;
  /** Usar Redis para caching */
  useRedis: boolean;

  // ========== MESSAGING ==========
  /** Usar MQTT para IoT */
  useMqtt: boolean;
  /** Usar NATS para messaging */
  useNats: boolean;

  // ========== IOT / HARDWARE ==========
  /** Usar Modbus TCP/RTU */
  useModbus: boolean;
  /** Usar comunicacion serial */
  useSerial: boolean;

  // ========== AI / ML ==========
  /** Usar ONNX Runtime para inferencia */
  useOnnx: boolean;
  /** Usar tokenizers para NLP */
  useTokenizers: boolean;
  /** Usar ndarray para computacion numerica */
  useNdarray: boolean;

  // ========== AUTHENTICATION ==========
  /** Usar JWT para autenticacion */
  useJwt: boolean;
  /** Usar Argon2 para hashing de passwords */
  useArgon2: boolean;

  // ========== INFRASTRUCTURE ==========
  /** Habilitar rate limiting */
  useRateLimiting: boolean;
  /** Habilitar tracing */
  useTracing: boolean;
  /** Habilitar OpenTelemetry */
  useOpenTelemetry: boolean;
  /** Generar Dockerfile */
  useDocker: boolean;
  /** Habilitar graceful shutdown */
  useGracefulShutdown: boolean;
}

/**
 * Metadata de un preset
 */
export interface RustPresetMetadata {
  preset: RustPreset;
  name: string;
  description: string;
  icon: string;
  useCases: string[];
}

/**
 * Defaults por preset
 */
export const RUST_PRESET_DEFAULTS: Record<RustPreset, RustAxumOptions> = {
  cloud: {
    preset: 'cloud',
    usePostgres: true,
    useSqlite: false,
    useRedis: true,
    useMqtt: false,
    useNats: false,
    useModbus: false,
    useSerial: false,
    useOnnx: false,
    useTokenizers: false,
    useNdarray: false,
    useJwt: true,
    useArgon2: true,
    useRateLimiting: true,
    useTracing: true,
    useOpenTelemetry: true,
    useDocker: true,
    useGracefulShutdown: true,
  },
  'edge-gateway': {
    preset: 'edge-gateway',
    usePostgres: true,
    useSqlite: true,
    useRedis: false,
    useMqtt: true,
    useNats: false,
    useModbus: true,
    useSerial: true,
    useOnnx: false,
    useTokenizers: false,
    useNdarray: false,
    useJwt: true,
    useArgon2: false,
    useRateLimiting: false,
    useTracing: true,
    useOpenTelemetry: false,
    useDocker: true,
    useGracefulShutdown: true,
  },
  'edge-anomaly': {
    preset: 'edge-anomaly',
    usePostgres: false,
    useSqlite: true,
    useRedis: false,
    useMqtt: true,
    useNats: false,
    useModbus: false,
    useSerial: false,
    useOnnx: false,
    useTokenizers: false,
    useNdarray: true,
    useJwt: false,
    useArgon2: false,
    useRateLimiting: false,
    useTracing: true,
    useOpenTelemetry: false,
    useDocker: true,
    useGracefulShutdown: true,
  },
  'edge-ai': {
    preset: 'edge-ai',
    usePostgres: true,
    useSqlite: false,
    useRedis: true,
    useMqtt: false,
    useNats: false,
    useModbus: false,
    useSerial: false,
    useOnnx: true,
    useTokenizers: true,
    useNdarray: true,
    useJwt: true,
    useArgon2: true,
    useRateLimiting: true,
    useTracing: true,
    useOpenTelemetry: true,
    useDocker: true,
    useGracefulShutdown: true,
  },
};

/**
 * Metadata de cada preset
 */
export const RUST_PRESET_METADATA: RustPresetMetadata[] = [
  {
    preset: 'cloud',
    name: 'Cloud Native',
    description: 'Full-featured cloud API with PostgreSQL, Redis, and observability',
    icon: 'IconCloud',
    useCases: ['REST APIs', 'Microservices', 'SaaS backends'],
  },
  {
    preset: 'edge-gateway',
    name: 'Edge Gateway',
    description: 'IoT gateway with MQTT, Modbus, and serial communication',
    icon: 'IconRouter',
    useCases: ['Industrial IoT', 'Smart buildings', 'Factory automation'],
  },
  {
    preset: 'edge-anomaly',
    name: 'Edge Anomaly Detection',
    description: 'Lightweight anomaly detection with MQTT and numerical computing',
    icon: 'IconChartDots',
    useCases: ['Predictive maintenance', 'Sensor monitoring', 'Quality control'],
  },
  {
    preset: 'edge-ai',
    name: 'Edge AI',
    description: 'AI/ML inference at the edge with ONNX and tokenizers',
    icon: 'IconBrain',
    useCases: ['Computer vision', 'NLP at edge', 'Real-time inference'],
  },
];

/**
 * Obtiene los defaults para un preset
 */
export function getPresetDefaults(preset: RustPreset): RustAxumOptions {
  return { ...RUST_PRESET_DEFAULTS[preset] };
}

/**
 * Obtiene metadata de un preset
 */
export function getPresetMetadata(preset: RustPreset): RustPresetMetadata | undefined {
  return RUST_PRESET_METADATA.find((m) => m.preset === preset);
}

/**
 * Agrupa opciones por categoria para UI
 */
export const RUST_OPTION_GROUPS = {
  database: ['usePostgres', 'useSqlite', 'useRedis'] as const,
  messaging: ['useMqtt', 'useNats'] as const,
  iot: ['useModbus', 'useSerial'] as const,
  ai: ['useOnnx', 'useTokenizers', 'useNdarray'] as const,
  auth: ['useJwt', 'useArgon2'] as const,
  observability: ['useRateLimiting', 'useTracing', 'useOpenTelemetry'] as const,
  infra: ['useDocker', 'useGracefulShutdown'] as const,
};

export type RustOptionGroup = keyof typeof RUST_OPTION_GROUPS;
```

---

## Criterios de Completado

- [ ] Todos los 4 presets definidos
- [ ] Defaults correctos por preset
- [ ] Metadata con descripciones
- [ ] Helpers exportados
- [ ] Tipos compilan sin errores
- [ ] `npm run check` pasa

---

## Notas

- Los presets deben coincidir con el backend
- Usar agrupacion para mejor UX en el formulario
- Los iconos son de Tabler Icons

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

[[T-001]] → [[T-002]] → [[T-006]] | [[Phases/00-FOUNDATION]]
