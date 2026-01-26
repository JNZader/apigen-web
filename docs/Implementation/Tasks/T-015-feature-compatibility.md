# T-015: Crear config/featureCompatibility.ts

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.2 Datos de Configuracion

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-015 |
| **Tipo** | Feature |
| **Estimado** | 1h |
| **Dependencias** | [[T-014]] |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Crear sistema de compatibilidad de features que maneja dependencias, conflictos y validaciones entre features y lenguajes.

---

## Tareas

- [ ] Crear `src/config/featureCompatibility.ts`
- [ ] Definir dependencias entre features
- [ ] Definir conflictos entre features
- [ ] Helpers de validacion
- [ ] Mensajes de warning/error

---

## Archivos a Crear

```
src/config/
└── featureCompatibility.ts      ← CREAR (~150 lineas)
```

**LOC Estimado:** ~150

---

## Codigo de Referencia

```typescript
// src/config/featureCompatibility.ts

import type { Language, FeatureSupport } from '@/types/target';
import type { ProjectFeatures } from '@/types/project';
import { getLanguageConfig } from './languageConfigs';

// ============================================
// FEATURE DEPENDENCIES
// ============================================

/**
 * Features que requieren otras features para funcionar
 * Key = feature que tiene dependencia
 * Value = features requeridas
 */
export const FEATURE_DEPENDENCIES: Partial<
  Record<keyof ProjectFeatures, (keyof ProjectFeatures)[]>
> = {
  passwordReset: ['mailService'],
  // socialLogin podria requerir oauth2 en algunos casos
};

/**
 * Features que son mutuamente excluyentes
 */
export const FEATURE_CONFLICTS: [keyof ProjectFeatures, keyof ProjectFeatures][] = [
  // Por ahora no hay conflictos directos
];

/**
 * Features que se recomiendan juntas
 */
export const FEATURE_RECOMMENDATIONS: Partial<
  Record<keyof ProjectFeatures, { feature: keyof ProjectFeatures; reason: string }[]>
> = {
  socialLogin: [
    { feature: 'mailService', reason: 'For welcome emails and account verification' },
  ],
  fileUpload: [
    { feature: 'validation', reason: 'For file type and size validation' },
  ],
};

// ============================================
// LANGUAGE RESTRICTIONS
// ============================================

/**
 * Features no disponibles por lenguaje
 */
export const LANGUAGE_FEATURE_RESTRICTIONS: Record<Language, (keyof ProjectFeatures)[]> = {
  java: [],
  kotlin: [],
  python: ['jteTemplates', 'socialLogin'],
  typescript: ['jteTemplates'],
  php: ['jteTemplates', 'socialLogin'],
  go: ['jteTemplates', 'socialLogin'],
  rust: ['jteTemplates', 'socialLogin', 'mailService', 'passwordReset', 'oauth2'],
  csharp: ['jteTemplates', 'socialLogin'],
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export interface CompatibilityResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  autoEnabled: (keyof ProjectFeatures)[];
  autoDisabled: (keyof ProjectFeatures)[];
}

/**
 * Valida compatibilidad de features para un lenguaje
 */
export function validateFeatureCompatibility(
  language: Language,
  framework: string,
  features: ProjectFeatures
): CompatibilityResult {
  const result: CompatibilityResult = {
    valid: true,
    errors: [],
    warnings: [],
    autoEnabled: [],
    autoDisabled: [],
  };

  const restrictions = LANGUAGE_FEATURE_RESTRICTIONS[language] || [];

  // 1. Check language restrictions
  for (const feature of restrictions) {
    if (features[feature]) {
      result.warnings.push(
        `"${formatFeatureName(feature)}" is not available for ${language}. It will be disabled.`
      );
      result.autoDisabled.push(feature);
    }
  }

  // 2. Check dependencies
  for (const [feature, deps] of Object.entries(FEATURE_DEPENDENCIES)) {
    const featureKey = feature as keyof ProjectFeatures;
    if (features[featureKey]) {
      for (const dep of deps || []) {
        if (!features[dep] && !restrictions.includes(dep)) {
          result.warnings.push(
            `"${formatFeatureName(featureKey)}" requires "${formatFeatureName(dep)}". Enabling automatically.`
          );
          result.autoEnabled.push(dep);
        }
      }
    }
  }

  // 3. Check conflicts
  for (const [feat1, feat2] of FEATURE_CONFLICTS) {
    if (features[feat1] && features[feat2]) {
      result.errors.push(
        `"${formatFeatureName(feat1)}" and "${formatFeatureName(feat2)}" cannot be enabled together.`
      );
      result.valid = false;
    }
  }

  return result;
}

/**
 * Obtiene features disponibles para un lenguaje
 */
export function getAvailableFeatures(
  language: Language
): (keyof ProjectFeatures)[] {
  const restrictions = new Set(LANGUAGE_FEATURE_RESTRICTIONS[language] || []);
  const allFeatures: (keyof ProjectFeatures)[] = [
    'audit',
    'softDelete',
    'validation',
    'pagination',
    'sorting',
    'filtering',
    'search',
    'bulkOperations',
    'batchOperations',
    'exportImport',
    'socialLogin',
    'passwordReset',
    'mailService',
    'fileUpload',
    'jteTemplates',
  ];

  return allFeatures.filter((f) => !restrictions.has(f));
}

/**
 * Obtiene dependencias de una feature
 */
export function getFeatureDependencies(
  feature: keyof ProjectFeatures
): (keyof ProjectFeatures)[] {
  return FEATURE_DEPENDENCIES[feature] || [];
}

/**
 * Obtiene features que dependen de esta feature
 */
export function getDependentFeatures(
  feature: keyof ProjectFeatures
): (keyof ProjectFeatures)[] {
  const dependents: (keyof ProjectFeatures)[] = [];

  for (const [feat, deps] of Object.entries(FEATURE_DEPENDENCIES)) {
    if (deps?.includes(feature)) {
      dependents.push(feat as keyof ProjectFeatures);
    }
  }

  return dependents;
}

/**
 * Obtiene recomendaciones para una feature
 */
export function getFeatureRecommendations(
  feature: keyof ProjectFeatures
): { feature: keyof ProjectFeatures; reason: string }[] {
  return FEATURE_RECOMMENDATIONS[feature] || [];
}

/**
 * Aplica auto-fixes a las features
 */
export function applyFeatureAutoFixes(
  language: Language,
  features: ProjectFeatures
): ProjectFeatures {
  const result = { ...features };
  const restrictions = new Set(LANGUAGE_FEATURE_RESTRICTIONS[language] || []);

  // Disable restricted features
  for (const feature of restrictions) {
    result[feature] = false;
  }

  // Enable dependencies
  for (const [feature, deps] of Object.entries(FEATURE_DEPENDENCIES)) {
    const featureKey = feature as keyof ProjectFeatures;
    if (result[featureKey]) {
      for (const dep of deps || []) {
        if (!restrictions.has(dep)) {
          result[dep] = true;
        }
      }
    }
  }

  return result;
}

// ============================================
// HELPERS
// ============================================

/**
 * Formatea nombre de feature para display
 */
function formatFeatureName(feature: keyof ProjectFeatures): string {
  const names: Record<keyof ProjectFeatures, string> = {
    audit: 'Audit',
    softDelete: 'Soft Delete',
    validation: 'Validation',
    pagination: 'Pagination',
    sorting: 'Sorting',
    filtering: 'Filtering',
    search: 'Search',
    bulkOperations: 'Bulk Operations',
    batchOperations: 'Batch Operations',
    exportImport: 'Export/Import',
    socialLogin: 'Social Login',
    passwordReset: 'Password Reset',
    mailService: 'Mail Service',
    fileUpload: 'File Upload',
    jteTemplates: 'jte Templates',
  };

  return names[feature] || feature;
}

/**
 * Verifica si una feature esta disponible para un lenguaje
 */
export function isFeatureAvailable(
  language: Language,
  feature: keyof ProjectFeatures
): boolean {
  const restrictions = LANGUAGE_FEATURE_RESTRICTIONS[language] || [];
  return !restrictions.includes(feature);
}
```

---

## Criterios de Completado

- [ ] Dependencias definidas correctamente
- [ ] Validacion detecta problemas
- [ ] Auto-fix corrige features
- [ ] Mensajes claros para usuario
- [ ] Helpers funcionan
- [ ] `npm run check` pasa

---

## Notas

- Las dependencias son unidireccionales
- Auto-fix prioriza seguridad (deshabilita antes que habilitar)
- Warnings no bloquean, errors si

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

#task #fase-1 #feature #pending

[[T-014]] → [[T-015]] → [[T-017]] | [[Phases/01-LANGUAGE-SELECTOR]]
