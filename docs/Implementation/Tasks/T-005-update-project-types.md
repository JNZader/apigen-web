# T-005: Actualizar types/project.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.3 Actualizacion de Types

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-005 |
| **Tipo** | Setup |
| **Estimado** | 1h |
| **Dependencias** | [[T-001]], [[T-004]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Actualizar el archivo principal de tipos del proyecto para incluir los nuevos tipos de target, Feature Pack 2025, y opciones especificas de lenguaje.

---

## Tareas

- [ ] Importar nuevos tipos de target
- [ ] Importar tipos de Feature Pack
- [ ] Importar tipos de Rust y Go/Chi
- [ ] Actualizar interfaz `ProjectConfig`
- [ ] Actualizar interfaz `ProjectFeatures`
- [ ] Mantener backward compatibility

---

## Archivos a Modificar

```
src/types/
└── project.ts                   ← MODIFICAR (~50 lineas adicionales)
```

**LOC Estimado:** ~50 adicionales

---

## Codigo de Referencia

```typescript
// src/types/project.ts - AGREGAR imports y tipos

// ============================================
// NEW IMPORTS
// ============================================

import type { TargetConfig, Language, Framework } from './target';
import type {
  SocialLoginConfig,
  MailConfig,
  StorageConfig,
  JteConfig,
  FeaturePackConfig,
} from './config/featurepack';
import type { RustAxumOptions, RustPreset } from './config/rust';
import type { GoChiOptions } from './config/gochi';

// ============================================
// RE-EXPORTS (for convenience)
// ============================================

export type {
  TargetConfig,
  Language,
  Framework,
  SocialLoginConfig,
  MailConfig,
  StorageConfig,
  JteConfig,
  FeaturePackConfig,
  RustAxumOptions,
  RustPreset,
  GoChiOptions,
};

// ============================================
// UPDATED INTERFACES
// ============================================

/**
 * Extended ProjectFeatures with Feature Pack 2025
 */
export interface ProjectFeatures {
  // ========== EXISTING FEATURES ==========
  audit: boolean;
  softDelete: boolean;
  validation: boolean;
  pagination: boolean;
  sorting: boolean;
  filtering: boolean;
  search: boolean;
  bulkOperations: boolean;
  batchOperations: boolean;
  exportImport: boolean;

  // ========== FEATURE PACK 2025 (NEW) ==========
  /** Enable social login (Google, GitHub, LinkedIn) */
  socialLogin: boolean;
  /** Enable password reset functionality */
  passwordReset: boolean;
  /** Enable mail service */
  mailService: boolean;
  /** Enable file upload/storage */
  fileUpload: boolean;
  /** Enable jte templates (Java/Kotlin only) */
  jteTemplates: boolean;
}

/**
 * Extended ProjectConfig with new configurations
 */
export interface ProjectConfig {
  // ========== EXISTING CONFIG ==========
  projectName: string;
  groupId: string;
  artifactId: string;
  packageName: string;
  description?: string;

  // ========== TARGET CONFIG (NEW) ==========
  /** Target language and framework */
  target: TargetConfig;

  // ========== FEATURES ==========
  features: ProjectFeatures;

  // ========== DATABASE CONFIG ==========
  database: DatabaseConfig;

  // ========== SECURITY CONFIG ==========
  security: SecurityConfig;

  // ========== CACHE CONFIG ==========
  cache: CacheConfig;

  // ========== API CONFIG ==========
  api: ApiConfig;

  // ========== RESILIENCE CONFIG ==========
  resilience: ResilienceConfig;

  // ========== OBSERVABILITY CONFIG ==========
  observability: ObservabilityConfig;

  // ========== MESSAGING CONFIG ==========
  messaging: MessagingConfig;

  // ========== MICROSERVICES CONFIG ==========
  microservices: MicroservicesConfig;

  // ========== FEATURE PACK 2025 CONFIGS (NEW) ==========
  /** Social login configuration */
  socialLoginConfig: SocialLoginConfig;
  /** Mail service configuration */
  mailConfig: MailConfig;
  /** File storage configuration */
  storageConfig: StorageConfig;
  /** jte templates configuration */
  jteConfig: JteConfig;

  // ========== LANGUAGE-SPECIFIC OPTIONS (NEW) ==========
  /** Rust/Axum specific options (only when target.language === 'rust') */
  rustOptions?: RustAxumOptions;
  /** Go/Chi specific options (only when target.language === 'go' && target.framework === 'chi') */
  goChiOptions?: GoChiOptions;
}

// ============================================
// DEFAULT VALUES
// ============================================

import {
  DEFAULT_SOCIAL_LOGIN_CONFIG,
  DEFAULT_MAIL_CONFIG,
  DEFAULT_STORAGE_CONFIG,
  DEFAULT_JTE_CONFIG,
} from './config/featurepack';

/**
 * Default features including Feature Pack 2025
 */
export const DEFAULT_PROJECT_FEATURES: ProjectFeatures = {
  // Existing
  audit: true,
  softDelete: false,
  validation: true,
  pagination: true,
  sorting: true,
  filtering: true,
  search: false,
  bulkOperations: false,
  batchOperations: false,
  exportImport: false,

  // Feature Pack 2025 (all disabled by default)
  socialLogin: false,
  passwordReset: false,
  mailService: false,
  fileUpload: false,
  jteTemplates: false,
};

/**
 * Default target (Java/Spring Boot for backward compatibility)
 */
export const DEFAULT_TARGET_CONFIG: TargetConfig = {
  language: 'java',
  framework: 'spring-boot',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a feature requires another feature
 */
export function getFeatureDependencies(
  feature: keyof ProjectFeatures
): (keyof ProjectFeatures)[] {
  const deps: Record<string, (keyof ProjectFeatures)[]> = {
    passwordReset: ['mailService'],
    socialLogin: [],
    jteTemplates: [],
    fileUpload: [],
    mailService: [],
  };

  return deps[feature] || [];
}

/**
 * Check if all dependencies for a feature are met
 */
export function areFeatureDependenciesMet(
  feature: keyof ProjectFeatures,
  features: ProjectFeatures
): boolean {
  const deps = getFeatureDependencies(feature);
  return deps.every((dep) => features[dep]);
}

/**
 * Get features that are incompatible with a language
 */
export function getIncompatibleFeatures(
  language: Language
): (keyof ProjectFeatures)[] {
  const incompatible: Record<Language, (keyof ProjectFeatures)[]> = {
    java: [],
    kotlin: [],
    python: ['jteTemplates', 'socialLogin'],
    typescript: ['jteTemplates'],
    php: ['jteTemplates', 'socialLogin'],
    go: ['jteTemplates', 'socialLogin'],
    rust: ['jteTemplates', 'socialLogin', 'mailService', 'passwordReset'],
    csharp: ['jteTemplates', 'socialLogin'],
  };

  return incompatible[language] || [];
}
```

---

## Criterios de Completado

- [ ] Nuevos imports agregados
- [ ] ProjectFeatures actualizado con Feature Pack 2025
- [ ] ProjectConfig incluye nuevas configs
- [ ] Defaults definidos
- [ ] Helpers de dependencias funcionan
- [ ] Backward compatible (Java/Spring default)
- [ ] Tipos compilan sin errores
- [ ] `npm run check` pasa

---

## Notas

- Mantener backward compatibility es critico
- Default a Java/Spring Boot para no romper proyectos existentes
- Los campos nuevos son opcionales donde tenga sentido

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

[[T-001]] [[T-004]] → [[T-005]] → [[T-007]] | [[Phases/00-FOUNDATION]]
