# T-045: Crear RustOptionsPanel Component

> Fase: [[Phases/04-RUST-EDGE]] | Iteracion: 4.1 Core Components

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-045 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | [[T-044]] |
| **Branch** | `feat/rust-support` |
| **Estado** | Pending |

---

## Objetivo

Crear panel de opciones avanzadas para configuracion de Rust/Axum.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── RustOptionsPanel.tsx  ← CREAR (~200 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/RustOptionsPanel.tsx

import {
  Stack,
  Switch,
  Select,
  TextInput,
  NumberInput,
  Group,
  Text,
  Accordion,
  Divider,
  Badge,
  Alert,
} from '@mantine/core';
import {
  IconDatabase,
  IconShield,
  IconClock,
  IconChartBar,
  IconInfoCircle,
} from '@tabler/icons-react';
import { memo, useCallback } from 'react';
import { useProjectStore } from '@/store';
import type { RustAxumOptions } from '@/types/config/rust';

const DATABASE_OPTIONS = [
  { value: 'sqlx-postgres', label: 'SQLx (PostgreSQL)' },
  { value: 'sqlx-mysql', label: 'SQLx (MySQL)' },
  { value: 'sqlx-sqlite', label: 'SQLx (SQLite)' },
  { value: 'diesel-postgres', label: 'Diesel (PostgreSQL)' },
  { value: 'diesel-mysql', label: 'Diesel (MySQL)' },
  { value: 'sea-orm', label: 'SeaORM' },
];

const SERIALIZATION_OPTIONS = [
  { value: 'serde', label: 'Serde (Standard)' },
  { value: 'simd-json', label: 'simd-json (High Performance)' },
];

export const RustOptionsPanel = memo(function RustOptionsPanel() {
  const rustOptions = useProjectStore((s) => s.rustOptions);
  const updateRustOptions = useProjectStore((s) => s.updateRustOptions);

  const handleChange = useCallback(
    <K extends keyof RustAxumOptions>(key: K, value: RustAxumOptions[K]) => {
      updateRustOptions({ [key]: value });
    },
    [updateRustOptions]
  );

  const isCustomizable = rustOptions.preset !== 'minimal';

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600} size="lg">
          Advanced Options
        </Text>
        <Badge variant="light" color={isCustomizable ? 'blue' : 'gray'}>
          {rustOptions.preset} preset
        </Badge>
      </Group>

      {!isCustomizable && (
        <Alert icon={<IconInfoCircle size={16} />} color="yellow">
          Advanced options are limited in minimal preset. Choose a different preset to customize.
        </Alert>
      )}

      <Accordion variant="separated">
        {/* Database Options */}
        <Accordion.Item value="database">
          <Accordion.Control icon={<IconDatabase size={20} />}>
            Database Configuration
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Select
                label="Database Driver"
                description="ORM/database library to use"
                data={DATABASE_OPTIONS}
                value={rustOptions.database}
                onChange={(val) => handleChange('database', val || 'sqlx-postgres')}
                disabled={!isCustomizable}
              />

              <NumberInput
                label="Connection Pool Size"
                description="Maximum number of database connections"
                value={rustOptions.poolSize}
                onChange={(val) => handleChange('poolSize', Number(val) || 10)}
                min={1}
                max={100}
                disabled={!isCustomizable}
              />

              <Switch
                label="Enable Query Logging"
                description="Log all SQL queries (disable in production)"
                checked={rustOptions.queryLogging}
                onChange={(e) => handleChange('queryLogging', e.currentTarget.checked)}
                disabled={!isCustomizable}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Security Options */}
        <Accordion.Item value="security">
          <Accordion.Control icon={<IconShield size={20} />}>
            Security
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Switch
                label="Enable CORS"
                description="Cross-Origin Resource Sharing support"
                checked={rustOptions.cors}
                onChange={(e) => handleChange('cors', e.currentTarget.checked)}
              />

              <Switch
                label="Enable Rate Limiting"
                description="Protect API from abuse"
                checked={rustOptions.rateLimiting}
                onChange={(e) => handleChange('rateLimiting', e.currentTarget.checked)}
                disabled={!isCustomizable}
              />

              {rustOptions.rateLimiting && (
                <NumberInput
                  label="Requests per minute"
                  description="Maximum requests per IP per minute"
                  value={rustOptions.rateLimit}
                  onChange={(val) => handleChange('rateLimit', Number(val) || 100)}
                  min={10}
                  max={10000}
                />
              )}

              <Switch
                label="Enable Helmet-like Headers"
                description="Security headers (X-Frame-Options, etc.)"
                checked={rustOptions.securityHeaders}
                onChange={(e) => handleChange('securityHeaders', e.currentTarget.checked)}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Performance Options */}
        <Accordion.Item value="performance">
          <Accordion.Control icon={<IconClock size={20} />}>
            Performance
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Select
                label="JSON Serialization"
                description="JSON parsing/serialization library"
                data={SERIALIZATION_OPTIONS}
                value={rustOptions.serialization}
                onChange={(val) => handleChange('serialization', val || 'serde')}
                disabled={rustOptions.preset !== 'performance'}
              />

              <Switch
                label="Enable Compression"
                description="Gzip/Brotli response compression"
                checked={rustOptions.compression}
                onChange={(e) => handleChange('compression', e.currentTarget.checked)}
              />

              <Switch
                label="Enable Caching Layer"
                description="In-memory caching for responses"
                checked={rustOptions.caching}
                onChange={(e) => handleChange('caching', e.currentTarget.checked)}
                disabled={rustOptions.preset === 'minimal'}
              />

              {rustOptions.caching && (
                <NumberInput
                  label="Cache TTL (seconds)"
                  description="Default cache time-to-live"
                  value={rustOptions.cacheTtl}
                  onChange={(val) => handleChange('cacheTtl', Number(val) || 300)}
                  min={1}
                  max={86400}
                />
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Observability Options */}
        <Accordion.Item value="observability">
          <Accordion.Control icon={<IconChartBar size={20} />}>
            Observability
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Switch
                label="Enable Tracing"
                description="Distributed tracing with tokio-tracing"
                checked={rustOptions.tracing}
                onChange={(e) => handleChange('tracing', e.currentTarget.checked)}
              />

              <Switch
                label="Enable Metrics"
                description="Prometheus-compatible metrics endpoint"
                checked={rustOptions.metrics}
                onChange={(e) => handleChange('metrics', e.currentTarget.checked)}
                disabled={rustOptions.preset === 'minimal'}
              />

              <Switch
                label="Health Check Endpoint"
                description="Kubernetes-ready health check at /health"
                checked={rustOptions.healthCheck}
                onChange={(e) => handleChange('healthCheck', e.currentTarget.checked)}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Divider />

      {/* Generated Cargo.toml preview */}
      <div>
        <Text size="sm" fw={500} mb="xs">
          Dependencies Preview
        </Text>
        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
          axum, tokio, {rustOptions.database?.split('-')[0] || 'sqlx'}, serde
          {rustOptions.tracing && ', tracing'}
          {rustOptions.metrics && ', metrics'}
          {rustOptions.compression && ', tower-http'}
        </Text>
      </div>
    </Stack>
  );
});
```

---

## Criterios de Completado

- [ ] Opciones de database configurables
- [ ] Opciones de seguridad configurables
- [ ] Opciones de performance configurables
- [ ] Opciones de observability configurables
- [ ] Preview de dependencias
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

[[T-044]] → [[T-045]] → [[T-046]] | [[Phases/04-RUST-EDGE]]
