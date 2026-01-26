# T-060: Mejorar Loading States

> Fase: [[Phases/05-UX-IMPROVEMENTS]] | Iteracion: 5.4 Polish

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-060 |
| **Tipo** | Feature |
| **Estimado** | 1h |
| **Dependencias** | Ninguna |
| **Branch** | `feat/ux-improvements` |
| **Estado** | Pending |

---

## Objetivo

Crear componentes de loading state consistentes para toda la aplicacion.

---

## Archivos a Crear

```
src/components/
└── LoadingState.tsx  ← CREAR (~80 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/LoadingState.tsx

import {
  Stack,
  Text,
  Loader,
  Paper,
  Skeleton,
  Group,
} from '@mantine/core';
import { memo } from 'react';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'overlay';
  height?: number | string;
}

export const LoadingState = memo(function LoadingState({
  message = 'Loading...',
  variant = 'spinner',
  height = 200,
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return <LoadingSkeleton height={height} />;
  }

  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height,
      }}
    >
      <Stack align="center" gap="md">
        <Loader size="lg" />
        <Text c="dimmed" size="sm">
          {message}
        </Text>
      </Stack>
    </Paper>
  );
});

// Skeleton variant para listas
export const LoadingSkeleton = memo(function LoadingSkeleton({
  height = 200,
  rows = 3,
}: {
  height?: number | string;
  rows?: number;
}) {
  return (
    <Stack gap="sm" style={{ minHeight: height }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Paper key={i} withBorder p="sm" radius="md">
          <Group wrap="nowrap">
            <Skeleton height={40} circle />
            <Stack gap="xs" style={{ flex: 1 }}>
              <Skeleton height={14} width="70%" />
              <Skeleton height={10} width="40%" />
            </Stack>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
});

// Card skeleton
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Skeleton height={20} width="60%" />
          <Skeleton height={20} width={60} />
        </Group>
        <Skeleton height={12} width="80%" />
        <Skeleton height={12} width="50%" />
      </Stack>
    </Paper>
  );
});

// Button loading state
interface LoadingButtonProps {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton = memo(function LoadingButton({
  loading,
  loadingText,
  children,
}: LoadingButtonProps) {
  return loading ? (
    <Group gap="xs">
      <Loader size="xs" />
      <Text size="sm">{loadingText || 'Processing...'}</Text>
    </Group>
  ) : (
    <>{children}</>
  );
});

// Generation progress indicator
interface GenerationProgressProps {
  status: 'idle' | 'validating' | 'generating' | 'downloading' | 'complete' | 'error';
  progress?: number;
}

export const GenerationProgress = memo(function GenerationProgress({
  status,
  progress,
}: GenerationProgressProps) {
  const messages = {
    idle: 'Ready to generate',
    validating: 'Validating configuration...',
    generating: 'Generating code...',
    downloading: 'Preparing download...',
    complete: 'Generation complete!',
    error: 'Generation failed',
  };

  const colors = {
    idle: 'gray',
    validating: 'blue',
    generating: 'blue',
    downloading: 'blue',
    complete: 'green',
    error: 'red',
  };

  return (
    <Stack gap="xs" align="center">
      {status !== 'complete' && status !== 'error' && (
        <Loader size="md" color={colors[status]} />
      )}
      <Text size="sm" c={colors[status]}>
        {messages[status]}
      </Text>
      {progress !== undefined && (
        <Text size="xs" c="dimmed">
          {progress}%
        </Text>
      )}
    </Stack>
  );
});
```

---

## Uso en Componentes

```typescript
// En cualquier componente con loading state
{isLoading ? (
  <LoadingState message="Loading entities..." />
) : (
  <EntityList entities={entities} />
)}

// Para listas
{isLoading ? (
  <LoadingSkeleton rows={5} />
) : (
  entities.map(e => <EntityCard key={e.id} entity={e} />)
)}

// Para generacion
<GenerationProgress status={generationStatus} progress={progress} />
```

---

## Criterios de Completado

- [ ] LoadingState con spinner
- [ ] LoadingSkeleton para listas
- [ ] CardSkeleton para cards
- [ ] GenerationProgress para generacion
- [ ] Estilos consistentes
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

#task #fase-5 #feature #pending

[[T-059]] → [[T-060]] → [[T-061]] | [[Phases/05-UX-IMPROVEMENTS]]
