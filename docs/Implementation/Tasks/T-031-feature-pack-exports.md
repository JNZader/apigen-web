# T-031: Crear Index de Exports para ProjectSettings

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.6 Integracion

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-031 |
| **Tipo** | Refactor |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-030]] |
| **Branch** | `feat/feature-pack-integration` |
| **Estado** | Pending |

---

## Objetivo

Crear archivo index.ts para exportar todos los componentes de ProjectSettings de forma ordenada.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── index.ts  ← CREAR (~30 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/index.ts

// Feature Pack 2025 Forms
export { SocialLoginSettingsForm } from './SocialLoginSettingsForm';
export { MailServiceSettingsForm } from './MailServiceSettingsForm';
export { FileStorageSettingsForm } from './FileStorageSettingsForm';
export { PasswordResetSettingsForm } from './PasswordResetSettingsForm';
export { JteTemplatesSettingsForm } from './JteTemplatesSettingsForm';

// Containers
export { FeaturePackSection } from './FeaturePackSection';

// Future: Language Selector components (Phase 1)
// export { LanguageSelector } from './LanguageSelector';
// export { FrameworkCard } from './FrameworkCard';
// export { FeatureMatrix } from './FeatureMatrix';
```

---

## Criterios de Completado

- [ ] Todos los componentes exportados
- [ ] Imports funcionan desde `@/components/ProjectSettings`
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

#task #fase-2 #refactor #pending

[[T-030]] → [[T-031]] → [[T-032]] | [[Phases/02-FEATURE-PACK]]
