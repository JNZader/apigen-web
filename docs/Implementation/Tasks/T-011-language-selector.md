# T-011: Crear LanguageSelector.tsx

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.1 Componentes

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-011 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Crear el componente principal que permite al usuario seleccionar entre los 9 lenguajes/frameworks soportados para la generacion de codigo.

---

## Tareas

- [ ] Crear carpeta `src/components/LanguageSelector/`
- [ ] Crear `LanguageSelector.tsx`
- [ ] Crear `index.ts` con re-exports
- [ ] Integrar con Zustand store
- [ ] Agregar animaciones de seleccion
- [ ] Tests unitarios

---

## Archivos a Crear

```
src/components/LanguageSelector/
├── index.ts                     ← Re-exports
├── LanguageSelector.tsx         ← Componente principal (~200 lineas)
└── LanguageSelector.test.tsx    ← Tests (~100 lineas)
```

**LOC Estimado:** ~300

---

## Codigo de Referencia

```typescript
// src/components/LanguageSelector/LanguageSelector.tsx

import { SimpleGrid, Title, Text, Box, Badge, Group } from '@mantine/core';
import { memo, useCallback } from 'react';
import { useProjectStore } from '@/store';
import { LANGUAGE_METADATA, type Language, type Framework } from '@/types/target';
import { FrameworkCard } from './FrameworkCard';

interface LanguageSelectorProps {
  /** Callback cuando se selecciona un lenguaje */
  onSelect?: (language: Language, framework: Framework) => void;
  /** Mostrar matriz de features */
  showFeatureMatrix?: boolean;
  /** Layout: grid o list */
  layout?: 'grid' | 'list';
}

export const LanguageSelector = memo(function LanguageSelector({
  onSelect,
  showFeatureMatrix = true,
  layout = 'grid',
}: LanguageSelectorProps) {
  const targetConfig = useProjectStore((s) => s.targetConfig);
  const setTargetLanguage = useProjectStore((s) => s.setTargetLanguage);

  const handleSelect = useCallback(
    (language: Language, framework: Framework) => {
      setTargetLanguage(language, framework);
      onSelect?.(language, framework);
    },
    [setTargetLanguage, onSelect]
  );

  const isSelected = useCallback(
    (language: Language, framework: Framework) => {
      return (
        targetConfig?.language === language &&
        targetConfig?.framework === framework
      );
    },
    [targetConfig]
  );

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={3}>Select Target Language</Title>
          <Text c="dimmed" size="sm">
            Choose the language and framework for your generated API
          </Text>
        </div>
        {targetConfig && (
          <Badge size="lg" variant="light" color="blue">
            Selected: {targetConfig.language} / {targetConfig.framework}
          </Badge>
        )}
      </Group>

      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
        spacing="md"
      >
        {LANGUAGE_METADATA.map((meta) => (
          <FrameworkCard
            key={`${meta.language}-${meta.framework}`}
            language={meta.language}
            framework={meta.framework}
            displayName={meta.displayName}
            version={meta.version}
            description={meta.description}
            icon={meta.icon}
            features={meta.features}
            selected={isSelected(meta.language, meta.framework)}
            onSelect={() => handleSelect(meta.language, meta.framework)}
          />
        ))}
      </SimpleGrid>

      {showFeatureMatrix && targetConfig && (
        <Box mt="xl">
          <FeatureMatrix
            selectedLanguage={targetConfig.language}
            selectedFramework={targetConfig.framework}
          />
        </Box>
      )}
    </Box>
  );
});

// Re-export
export { FrameworkCard } from './FrameworkCard';
export { FeatureMatrix } from './FeatureMatrix';
```

```typescript
// src/components/LanguageSelector/index.ts

export { LanguageSelector } from './LanguageSelector';
export { FrameworkCard } from './FrameworkCard';
export { FeatureMatrix } from './FeatureMatrix';
```

---

## UI/UX

### Estado Normal

```
┌─────────────────────────────────────────────────────────────┐
│  Select Target Language                                      │
│  Choose the language and framework for your generated API    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [FrameworkCard] [FrameworkCard] [FrameworkCard] [...]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Estado Con Seleccion

```
┌─────────────────────────────────────────────────────────────┐
│  Select Target Language            [Selected: Java/Spring]  │
│  Choose the language and framework for your generated API    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [FrameworkCard ✓] [FrameworkCard] [FrameworkCard] [...]    │
│      SELECTED                                               │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  [FeatureMatrix for Java/Spring]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Integracion con Store

```typescript
// Agregar a projectStore.ts

interface ProjectState {
  // ... existing state ...
  targetConfig: TargetConfig | null;
  setTargetLanguage: (language: Language, framework: Framework) => void;
}

// Implementacion
setTargetLanguage: (language, framework) => {
  set({ targetConfig: { language, framework } });

  // Deshabilitar features no soportadas
  const metadata = getLanguageMetadata(language, framework);
  if (metadata) {
    // Auto-disable unsupported features
    const features = get().features;
    const updatedFeatures = { ...features };

    if (!metadata.supportedFeatures.jteTemplates) {
      updatedFeatures.jteTemplates = false;
    }
    if (!metadata.supportedFeatures.socialLogin) {
      updatedFeatures.socialLogin = false;
    }
    // ... etc

    set({ features: updatedFeatures });
  }
},
```

---

## Criterios de Completado

- [ ] Componente renderiza 9 cards
- [ ] Seleccion actualiza store
- [ ] Badge muestra seleccion actual
- [ ] Cards tienen hover/active states
- [ ] FeatureMatrix se muestra condicionalmente
- [ ] Responsive (1-4 columnas segun viewport)
- [ ] Accesible (keyboard navigation)
- [ ] Tests pasan (>80% cobertura)
- [ ] `npm run check` pasa

---

## Dependencias de Mantine

```typescript
// Componentes usados
import {
  SimpleGrid,
  Title,
  Text,
  Box,
  Badge,
  Group,
  Card,
  ThemeIcon,
} from '@mantine/core';
```

---

## Notas

- Usar `memo` para evitar re-renders innecesarios
- Los iconos vienen de Tabler Icons
- Considerar lazy loading de FeatureMatrix

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

> Ver detalles completos: [[WORKFLOW-PRECOMMIT]]

---

## Log de Trabajo

| Fecha | Tiempo | Notas |
|-------|--------|-------|
| - | - | - |

---

#task #fase-1 #feature #pending

[[Phases/01-LANGUAGE-SELECTOR]] | [[T-012]] [[T-013]]
