# Fase 4: Rust Edge Computing Presets

> **Prioridad:** MEDIA
> **Duracion estimada:** 4-5 horas
> **Paralelizable:** NO (depende de Fase 1 - Language Selector)
> **Dependencia:** Fase 1 completada (Language Selector)

---

## Objetivo

Implementar UI para configurar los 4 presets de Rust/Axum para edge computing, IoT, y AI/ML.

---

## Presets Disponibles

| Preset | Base de Datos | Use Case | Features Clave |
|--------|---------------|----------|----------------|
| `cloud` | PostgreSQL + Redis | Cloud-native API | JWT, OpenTelemetry, Rate Limiting |
| `edge-gateway` | PostgreSQL/SQLite | IoT Gateway | MQTT, Modbus, Serial |
| `edge-anomaly` | SQLite | Anomaly Detection | MQTT consumer, ndarray |
| `edge-ai` | PostgreSQL + Redis | AI/ML at Edge | ONNX Runtime, tokenizers |

---

## Iteraciones

### Iteracion 4.1: Componentes Rust Settings

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-044]] Crear RustPresetSelector.tsx | feat/rust-presets | Fase 1 |
| [[T-045]] Crear RustSettingsForm.tsx | feat/rust-presets | T-044 |
| [[T-046]] Crear EdgeFeaturesPanel.tsx | feat/rust-presets | T-044 |
| [[T-047]] Tests componentes | feat/rust-presets | T-044-T-046 |

### Iteracion 4.2: Integracion

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-048]] Logica condicional por lenguaje | feat/rust-presets | T-045 |
| [[T-049]] Aplicar preset defaults al seleccionar | feat/rust-presets | T-044, T-048 |
| [[T-050]] Integrar en ProjectSettings | feat/rust-presets | T-045, T-046 |
| [[T-051]] Tests de integracion | feat/rust-presets | T-048-T-050 |

---

## Archivos a Crear

```
src/components/ProjectSettings/
├── RustPresetSelector.tsx       ← Selector de presets (~150 lineas)
├── RustSettingsForm.tsx         ← Config Rust/Axum (~250 lineas)
├── EdgeFeaturesPanel.tsx        ← Features IoT/Edge/AI (~200 lineas)
├── RustPresetSelector.test.tsx
├── RustSettingsForm.test.tsx
└── EdgeFeaturesPanel.test.tsx

src/config/
└── rustPresets.ts               ← Configuracion de presets (~150 lineas)
```

## Archivos a Modificar

```
src/components/ProjectSettings/
└── index.tsx                    ← Agregar RustSettingsForm (condicional)
```

---

## Configuracion Rust

```typescript
interface RustAxumOptions {
  preset: 'cloud' | 'edge-gateway' | 'edge-anomaly' | 'edge-ai';

  // Database
  usePostgres: boolean;
  useSqlite: boolean;
  useRedis: boolean;

  // Messaging
  useMqtt: boolean;
  useNats: boolean;

  // IoT
  useModbus: boolean;
  useSerial: boolean;

  // AI/ML
  useOnnx: boolean;
  useTokenizers: boolean;
  useNdarray: boolean;

  // Auth
  useJwt: boolean;
  useArgon2: boolean;

  // Infrastructure
  useRateLimiting: boolean;
  useTracing: boolean;
  useOpenTelemetry: boolean;
  useDocker: boolean;
  useGracefulShutdown: boolean;
}
```

---

## Preset Defaults

```typescript
const RUST_PRESET_DEFAULTS: Record<RustPreset, Partial<RustAxumOptions>> = {
  cloud: {
    usePostgres: true,
    useRedis: true,
    useJwt: true,
    useArgon2: true,
    useRateLimiting: true,
    useTracing: true,
    useOpenTelemetry: true,
    useDocker: true,
    useGracefulShutdown: true,
  },
  'edge-gateway': {
    usePostgres: true,
    useSqlite: true,  // Fallback
    useMqtt: true,
    useModbus: true,
    useSerial: true,
    useJwt: true,
    useDocker: true,
  },
  'edge-anomaly': {
    useSqlite: true,
    useMqtt: true,
    useNdarray: true,
    useDocker: true,
  },
  'edge-ai': {
    usePostgres: true,
    useRedis: true,
    useOnnx: true,
    useTokenizers: true,
    useNdarray: true,
    useJwt: true,
    useDocker: true,
    useGracefulShutdown: true,
  },
};
```

---

## UI/UX Esperado

### Rust Preset Selector

```
┌─────────────────────────────────────────────────────────────────┐
│  Rust/Axum Configuration                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Select Preset:                                                 │
│                                                                 │
│  ┌───────────────────┐  ┌───────────────────┐                   │
│  │  ☁️  CLOUD        │  │  🌐 EDGE GATEWAY  │                   │
│  │                   │  │                   │                   │
│  │  Cloud-native API │  │  IoT Gateway      │                   │
│  │  PostgreSQL+Redis │  │  MQTT, Modbus     │                   │
│  │  Full observ.     │  │  Serial comms     │                   │
│  │                   │  │                   │                   │
│  │  [Selected ✓]     │  │  [Select]         │                   │
│  └───────────────────┘  └───────────────────┘                   │
│                                                                 │
│  ┌───────────────────┐  ┌───────────────────┐                   │
│  │  📊 EDGE ANOMALY  │  │  🤖 EDGE AI       │                   │
│  │                   │  │                   │                   │
│  │  Anomaly detect   │  │  AI/ML at edge    │                   │
│  │  SQLite + MQTT    │  │  ONNX Runtime     │                   │
│  │  ndarray          │  │  Tokenizers       │                   │
│  │                   │  │                   │                   │
│  │  [Select]         │  │  [Select]         │                   │
│  └───────────────────┘  └───────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Edge Features Panel (Expandible)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 Advanced Configuration                          [Collapse ▲]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DATABASE                         MESSAGING                     │
│  ─────────                        ─────────                     │
│  [x] PostgreSQL                   [x] MQTT                      │
│  [ ] SQLite                       [ ] NATS                      │
│  [x] Redis                                                      │
│                                                                 │
│  IOT / HARDWARE                   AI / ML                       │
│  ──────────────                   ───────                       │
│  [ ] Modbus TCP/RTU               [ ] ONNX Runtime              │
│  [ ] Serial Port                  [ ] Tokenizers                │
│                                   [ ] ndarray                   │
│                                                                 │
│  AUTHENTICATION                   OBSERVABILITY                 │
│  ──────────────                   ─────────────                 │
│  [x] JWT                          [x] Tracing                   │
│  [x] Argon2                       [x] OpenTelemetry             │
│                                   [x] Rate Limiting             │
│                                                                 │
│  INFRASTRUCTURE                                                 │
│  ──────────────                                                 │
│  [x] Docker                                                     │
│  [x] Graceful Shutdown                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Logica Condicional

```typescript
// Solo mostrar RustSettingsForm si el lenguaje es Rust
const targetConfig = useProjectStore((s) => s.targetConfig);
const isRust = targetConfig?.language === 'rust';

// En ProjectSettings/index.tsx
{isRust && (
  <Tabs.Panel value="rust">
    <RustSettingsForm />
  </Tabs.Panel>
)}
```

---

## Criterios de Completado

- [ ] 4 presets de Rust Edge son seleccionables
- [ ] Seleccionar preset aplica defaults automaticamente
- [ ] Opciones individuales son configurables
- [ ] Panel solo visible cuando lenguaje = Rust
- [ ] Request de generacion incluye `rustOptions`
- [ ] Tests pasan (>80% cobertura)
- [ ] npm run check sin errores

---

## Notas de Implementacion

### Grouping de Features

Agrupar features por dominio para mejor UX:

```typescript
const FEATURE_GROUPS = {
  database: ['usePostgres', 'useSqlite', 'useRedis'],
  messaging: ['useMqtt', 'useNats'],
  iot: ['useModbus', 'useSerial'],
  ai: ['useOnnx', 'useTokenizers', 'useNdarray'],
  auth: ['useJwt', 'useArgon2'],
  observability: ['useRateLimiting', 'useTracing', 'useOpenTelemetry'],
  infra: ['useDocker', 'useGracefulShutdown'],
};
```

### Feature Dependencies

Algunas features tienen dependencias:
- `useOpenTelemetry` requiere `useTracing`
- `useTokenizers` funciona mejor con `useOnnx`

Mostrar tooltips con estas relaciones.

---

*Branch: feat/rust-presets*
*PR: Crear despues de completar todas las tareas*
