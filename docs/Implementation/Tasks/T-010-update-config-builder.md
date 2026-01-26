# T-010: Actualizar projectConfigBuilder.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.5 Store Updates

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-010 |
| **Tipo** | Setup |
| **Estimado** | 1h |
| **Dependencias** | [[T-007]], [[T-009]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Actualizar el builder de configuracion del proyecto para incluir los nuevos campos de target, Feature Pack 2025, y opciones especificas de lenguaje.

---

## Tareas

- [ ] Actualizar funcion `buildProjectConfig`
- [ ] Incluir target config
- [ ] Incluir Feature Pack configs condicionalmente
- [ ] Incluir opciones especificas de lenguaje
- [ ] Agregar validacion de compatibilidad
- [ ] Tests unitarios

---

## Archivos a Modificar

```
src/utils/
├── projectConfigBuilder.ts      ← MODIFICAR (~80 lineas adicionales)
└── projectConfigBuilder.test.ts ← CREAR/MODIFICAR
```

**LOC Estimado:** ~100 adicionales

---

## Codigo de Referencia

```typescript
// src/utils/projectConfigBuilder.ts - ACTUALIZAR

import type {
  ProjectConfig,
  TargetConfig,
  ProjectFeatures,
  SocialLoginConfig,
  MailConfig,
  StorageConfig,
  JteConfig,
  RustAxumOptions,
  GoChiOptions,
} from '@/types/project';
import type { EntityDesign } from '@/types/entity';
import type { RelationDesign } from '@/types/relation';
import type { GenerateRequest } from '@/api/generatorApi';
import {
  DEFAULT_SOCIAL_LOGIN_CONFIG,
  DEFAULT_MAIL_CONFIG,
  DEFAULT_STORAGE_CONFIG,
  DEFAULT_JTE_CONFIG,
} from '@/types/config/featurepack';
import { getIncompatibleFeatures } from '@/types/project';

// ============================================
// MAIN BUILDER FUNCTION
// ============================================

export interface BuilderInput {
  // Basic project info
  projectName: string;
  groupId: string;
  artifactId: string;
  packageName: string;
  description?: string;

  // Target
  target: TargetConfig;

  // Entities and relations
  entities: EntityDesign[];
  relations: RelationDesign[];

  // Features
  features: ProjectFeatures;

  // Existing configs (from store)
  database?: DatabaseConfig;
  security?: SecurityConfig;
  cache?: CacheConfig;
  api?: ApiConfig;
  resilience?: ResilienceConfig;
  observability?: ObservabilityConfig;
  messaging?: MessagingConfig;

  // Feature Pack 2025 configs
  socialLoginConfig?: SocialLoginConfig;
  mailConfig?: MailConfig;
  storageConfig?: StorageConfig;
  jteConfig?: JteConfig;

  // Language-specific
  rustOptions?: RustAxumOptions;
  goChiOptions?: GoChiOptions;
}

export interface BuilderOutput {
  request: GenerateRequest;
  warnings: string[];
  errors: string[];
}

/**
 * Construye un GenerateRequest validado desde el input
 */
export function buildProjectConfig(input: BuilderInput): BuilderOutput {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. Validar compatibilidad de features con lenguaje
  const incompatible = getIncompatibleFeatures(input.target.language);
  const enabledIncompatible = incompatible.filter((f) => input.features[f]);

  if (enabledIncompatible.length > 0) {
    for (const feature of enabledIncompatible) {
      warnings.push(
        `Feature "${feature}" is not supported for ${input.target.language}. It will be disabled.`
      );
    }
  }

  // 2. Validar dependencias entre features
  if (input.features.passwordReset && !input.features.mailService) {
    warnings.push(
      'Password Reset requires Mail Service. Enabling Mail Service automatically.'
    );
  }

  // 3. Construir features limpias
  const cleanFeatures = buildCleanFeatures(input.features, input.target.language);

  // 4. Construir configs condicionalmente
  const socialLoginConfig = cleanFeatures.socialLogin
    ? input.socialLoginConfig || DEFAULT_SOCIAL_LOGIN_CONFIG
    : undefined;

  const mailConfig = cleanFeatures.mailService
    ? input.mailConfig || DEFAULT_MAIL_CONFIG
    : undefined;

  const storageConfig = cleanFeatures.fileUpload
    ? input.storageConfig || DEFAULT_STORAGE_CONFIG
    : undefined;

  const jteConfig = cleanFeatures.jteTemplates
    ? input.jteConfig || DEFAULT_JTE_CONFIG
    : undefined;

  // 5. Construir opciones especificas de lenguaje
  const rustOptions = input.target.language === 'rust'
    ? input.rustOptions
    : undefined;

  const goChiOptions = input.target.language === 'go' &&
                       input.target.framework === 'chi'
    ? input.goChiOptions
    : undefined;

  // 6. Validar entidades
  if (input.entities.length === 0) {
    errors.push('At least one entity is required');
  }

  // 7. Construir request
  const request: GenerateRequest = {
    projectName: input.projectName,
    groupId: input.groupId,
    artifactId: input.artifactId,
    packageName: input.packageName,
    description: input.description,

    target: input.target,

    entities: input.entities.map(entityToRequest),
    relations: input.relations.map(relationToRequest),

    database: input.database,
    security: input.security,
    cache: input.cache,
    api: input.api,
    resilience: input.resilience,
    observability: input.observability,
    messaging: input.messaging,

    features: cleanFeatures,

    socialLoginConfig,
    mailConfig,
    storageConfig,
    jteConfig,

    rustOptions,
    goChiOptions,
  };

  return {
    request: removeUndefinedDeep(request),
    warnings,
    errors,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Construye features limpias deshabilitando las incompatibles
 */
function buildCleanFeatures(
  features: ProjectFeatures,
  language: Language
): ProjectFeatures {
  const incompatible = new Set(getIncompatibleFeatures(language));
  const clean = { ...features };

  for (const feature of Object.keys(clean) as (keyof ProjectFeatures)[]) {
    if (incompatible.has(feature)) {
      clean[feature] = false;
    }
  }

  // Auto-enable mailService si passwordReset esta habilitado
  if (clean.passwordReset && !clean.mailService) {
    clean.mailService = true;
  }

  return clean;
}

/**
 * Convierte EntityDesign a EntityRequest
 */
function entityToRequest(entity: EntityDesign): EntityRequest {
  return {
    name: entity.name,
    tableName: entity.tableName,
    fields: entity.fields.map((field) => ({
      name: field.name,
      type: field.type,
      columnName: field.columnName,
      isPrimaryKey: field.isPrimaryKey,
      isNullable: field.isNullable,
      isUnique: field.isUnique,
      defaultValue: field.defaultValue,
      validations: field.validations,
    })),
  };
}

/**
 * Convierte RelationDesign a RelationRequest
 */
function relationToRequest(relation: RelationDesign): RelationRequest {
  return {
    sourceEntity: relation.sourceEntityId,
    targetEntity: relation.targetEntityId,
    type: relation.type,
    sourceField: relation.sourceFieldName,
    targetField: relation.targetFieldName,
    cascadeType: relation.cascadeType,
    fetchType: relation.fetchType,
  };
}

/**
 * Remueve undefined recursivamente
 */
function removeUndefinedDeep<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedDeep) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = removeUndefinedDeep(value);
      }
    }
    return result as T;
  }

  return obj;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Valida que el request esta listo para enviar
 */
export function validateGenerateRequest(
  request: GenerateRequest
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.projectName?.trim()) {
    errors.push('Project name is required');
  }

  if (!request.groupId?.trim()) {
    errors.push('Group ID is required');
  }

  if (!request.artifactId?.trim()) {
    errors.push('Artifact ID is required');
  }

  if (!request.packageName?.trim()) {
    errors.push('Package name is required');
  }

  if (!request.entities || request.entities.length === 0) {
    errors.push('At least one entity is required');
  }

  if (!request.target?.language) {
    errors.push('Target language is required');
  }

  if (!request.target?.framework) {
    errors.push('Target framework is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Obtiene un resumen de la configuracion para mostrar al usuario
 */
export function getConfigSummary(request: GenerateRequest): ConfigSummary {
  return {
    target: `${request.target?.language}/${request.target?.framework}`,
    entities: request.entities?.length || 0,
    relations: request.relations?.length || 0,
    features: Object.entries(request.features || {})
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name),
    hasFeaturePack: !!(
      request.socialLoginConfig ||
      request.mailConfig ||
      request.storageConfig ||
      request.jteConfig
    ),
    hasRustOptions: !!request.rustOptions,
    hasGoChiOptions: !!request.goChiOptions,
  };
}

export interface ConfigSummary {
  target: string;
  entities: number;
  relations: number;
  features: string[];
  hasFeaturePack: boolean;
  hasRustOptions: boolean;
  hasGoChiOptions: boolean;
}
```

---

## Criterios de Completado

- [ ] buildProjectConfig incluye todos los nuevos campos
- [ ] Features incompatibles se deshabilitan automaticamente
- [ ] Dependencias de features se manejan (passwordReset → mailService)
- [ ] Warnings se generan para features deshabilitadas
- [ ] Validation helpers funcionan
- [ ] Tests unitarios pasan
- [ ] `npm run check` pasa

---

## Notas

- Este es el ultimo paso de la Fase 0
- Despues de esto se pueden iniciar las fases paralelas
- Importante mantener los warnings para UX

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

[[T-007]] [[T-009]] → [[T-010]] | [[Phases/00-FOUNDATION]]
