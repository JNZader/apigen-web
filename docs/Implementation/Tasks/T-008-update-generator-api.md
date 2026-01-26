# T-008: Actualizar api/generatorApi.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.4 API Schemas

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-008 |
| **Tipo** | Setup |
| **Estimado** | 1h |
| **Dependencias** | [[T-007]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Actualizar el cliente de API de generacion para usar los nuevos tipos y schemas Zod.

---

## Tareas

- [ ] Actualizar tipo `GenerateRequest`
- [ ] Agregar campos de target config
- [ ] Agregar campos de Feature Pack 2025
- [ ] Agregar campos de opciones especificas de lenguaje
- [ ] Usar Zod schema para validacion
- [ ] Mantener backward compatibility

---

## Archivos a Modificar

```
src/api/
└── generatorApi.ts              ← MODIFICAR (~50 lineas adicionales)
```

**LOC Estimado:** ~50 adicionales

---

## Codigo de Referencia

```typescript
// src/api/generatorApi.ts - ACTUALIZAR

import { z } from 'zod';
import { apiClient } from './apiClient';
import {
  GenerateRequestSchemaV2,
  TargetConfigSchema,
  SocialLoginConfigSchema,
  MailConfigSchema,
  StorageConfigSchema,
  JteConfigSchema,
  RustAxumOptionsSchema,
  type TargetConfig,
  type SocialLoginConfig,
  type MailConfig,
  type StorageConfig,
  type JteConfig,
  type RustAxumOptions,
} from './schemas';

// ============================================
// UPDATED REQUEST TYPE
// ============================================

/**
 * Request para generar un proyecto
 * Extendido con soporte multi-lenguaje y Feature Pack 2025
 */
export interface GenerateRequest {
  // ========== PROJECT BASICS ==========
  projectName: string;
  groupId: string;
  artifactId: string;
  packageName: string;
  description?: string;

  // ========== TARGET (NEW) ==========
  /** Target language and framework configuration */
  target?: TargetConfig;

  // ========== ENTITIES & RELATIONS ==========
  entities: EntityRequest[];
  relations?: RelationRequest[];

  // ========== EXISTING CONFIGS ==========
  database?: DatabaseConfig;
  security?: SecurityConfig;
  cache?: CacheConfig;
  api?: ApiConfig;
  resilience?: ResilienceConfig;
  observability?: ObservabilityConfig;
  messaging?: MessagingConfig;

  // ========== FEATURES ==========
  features?: {
    audit?: boolean;
    softDelete?: boolean;
    validation?: boolean;
    pagination?: boolean;
    sorting?: boolean;
    filtering?: boolean;
    // ... existing features ...

    // Feature Pack 2025 (NEW)
    passwordReset?: boolean;
  };

  // ========== FEATURE PACK 2025 CONFIGS (NEW) ==========
  /** Social login configuration */
  socialLoginConfig?: SocialLoginConfig;
  /** Mail service configuration */
  mailConfig?: MailConfig;
  /** File storage configuration */
  storageConfig?: StorageConfig;
  /** jte templates configuration */
  jteConfig?: JteConfig;

  // ========== LANGUAGE-SPECIFIC OPTIONS (NEW) ==========
  /** Rust/Axum options (only when target.language === 'rust') */
  rustOptions?: RustAxumOptions;
  /** Go/Chi options (only when target.language === 'go' && framework === 'chi') */
  goChiOptions?: GoChiOptions;

  // ========== OPENAPI (NEW) ==========
  /** OpenAPI spec as string (YAML or JSON) */
  openApiSpec?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Genera un proyecto con la configuracion dada
 */
export async function generateProject(
  request: GenerateRequest
): Promise<GenerateResponse> {
  // Validar request con Zod
  const validation = GenerateRequestSchemaV2.safeParse(request);
  if (!validation.success) {
    throw new ValidationError(
      'Invalid request',
      validation.error.flatten().fieldErrors
    );
  }

  // Limpiar campos undefined para reducir payload
  const cleanedRequest = removeUndefined(request);

  // Agregar defaults si no hay target
  if (!cleanedRequest.target) {
    cleanedRequest.target = {
      language: 'java',
      framework: 'spring-boot',
    };
  }

  return apiClient.post<GenerateResponse>('/generate', cleanedRequest);
}

/**
 * Genera multiples proyectos (microservicios)
 */
export async function generateMultipleProjects(
  requests: GenerateRequest[]
): Promise<GenerateMultipleResponse> {
  // Validar cada request
  for (const request of requests) {
    const validation = GenerateRequestSchemaV2.safeParse(request);
    if (!validation.success) {
      throw new ValidationError(
        `Invalid request for ${request.projectName}`,
        validation.error.flatten().fieldErrors
      );
    }
  }

  return apiClient.post<GenerateMultipleResponse>('/generate/multiple', {
    projects: requests,
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Remueve campos undefined del objeto
 */
function removeUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as T;
}

/**
 * Construye un GenerateRequest desde ProjectConfig del store
 */
export function buildGenerateRequest(
  config: ProjectConfig,
  entities: EntityDesign[],
  relations: RelationDesign[]
): GenerateRequest {
  const request: GenerateRequest = {
    projectName: config.projectName,
    groupId: config.groupId,
    artifactId: config.artifactId,
    packageName: config.packageName,
    description: config.description,

    // Target
    target: config.target,

    // Entities & Relations
    entities: entities.map(entityToRequest),
    relations: relations.map(relationToRequest),

    // Existing configs
    database: config.database,
    security: config.security,
    cache: config.cache,
    api: config.api,
    resilience: config.resilience,
    observability: config.observability,
    messaging: config.messaging,

    // Features
    features: {
      ...config.features,
      passwordReset: config.features.passwordReset,
    },

    // Feature Pack 2025 configs
    socialLoginConfig: config.features.socialLogin
      ? config.socialLoginConfig
      : undefined,
    mailConfig: config.features.mailService
      ? config.mailConfig
      : undefined,
    storageConfig: config.features.fileUpload
      ? config.storageConfig
      : undefined,
    jteConfig: config.features.jteTemplates
      ? config.jteConfig
      : undefined,

    // Language-specific options
    rustOptions: config.target.language === 'rust'
      ? config.rustOptions
      : undefined,
    goChiOptions: config.target.language === 'go' &&
                  config.target.framework === 'chi'
      ? config.goChiOptions
      : undefined,
  };

  return removeUndefined(request);
}

// ============================================
// VALIDATION ERROR
// ============================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

---

## Criterios de Completado

- [ ] GenerateRequest actualizado con nuevos campos
- [ ] Validacion Zod integrada
- [ ] buildGenerateRequest funciona con nuevos campos
- [ ] Campos opcionales manejados correctamente
- [ ] Default a Java/Spring si no hay target
- [ ] Limpieza de undefined antes de enviar
- [ ] `npm run check` pasa

---

## Notas

- Solo enviar campos que estan habilitados
- rustOptions solo si language === 'rust'
- goChiOptions solo si language === 'go' && framework === 'chi'

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

[[T-007]] → [[T-008]] → [[T-009]] | [[Phases/00-FOUNDATION]]
