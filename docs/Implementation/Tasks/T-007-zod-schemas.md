# T-007: Crear Zod Schemas para API

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.4 API Schemas

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-007 |
| **Tipo** | Setup |
| **Estimado** | 2h |
| **Dependencias** | [[T-005]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Crear Zod schemas para validar los nuevos tipos de request/response de la API, permitiendo validacion runtime y type inference.

---

## Tareas

- [ ] Agregar schemas para TargetConfig
- [ ] Agregar schemas para SocialLoginConfig
- [ ] Agregar schemas para MailConfig
- [ ] Agregar schemas para StorageConfig
- [ ] Agregar schemas para JteConfig
- [ ] Agregar schemas para RustAxumOptions
- [ ] Actualizar GenerateRequestSchema
- [ ] Tests unitarios para schemas

---

## Archivos a Crear/Modificar

```
src/api/
├── schemas.ts                   ← MODIFICAR (~200 lineas adicionales)
└── schemas.test.ts              ← CREAR (tests)
```

**LOC Estimado:** ~250 adicionales

---

## Codigo de Referencia

```typescript
// src/api/schemas.ts - AGREGAR

import { z } from 'zod';

// ============================================
// TARGET CONFIG SCHEMAS
// ============================================

export const LanguageSchema = z.enum([
  'java',
  'kotlin',
  'python',
  'typescript',
  'php',
  'go',
  'rust',
  'csharp',
]);

export const FrameworkSchema = z.enum([
  'spring-boot',
  'fastapi',
  'nestjs',
  'laravel',
  'gin',
  'chi',
  'axum',
  'aspnet-core',
]);

export const TargetConfigSchema = z.object({
  language: LanguageSchema,
  framework: FrameworkSchema,
  version: z.string().optional(),
});

// ============================================
// FEATURE PACK 2025 SCHEMAS
// ============================================

export const SocialLoginConfigSchema = z.object({
  enabled: z.boolean(),
  google: z.boolean(),
  github: z.boolean(),
  linkedin: z.boolean(),
  successRedirectUrl: z.string().min(1),
  failureRedirectUrl: z.string().min(1),
  autoCreateUser: z.boolean(),
  linkByEmail: z.boolean(),
});

export const MailConfigSchema = z.object({
  enabled: z.boolean(),
  host: z.string(),
  port: z.number().int().min(1).max(65535),
  username: z.string(),
  starttls: z.boolean(),
  fromAddress: z.string().email().or(z.literal('')),
  fromName: z.string(),
  generateWelcomeTemplate: z.boolean(),
  generatePasswordResetTemplate: z.boolean(),
  generateNotificationTemplate: z.boolean(),
});

export const StorageTypeSchema = z.enum(['local', 's3', 'azure']);

export const StorageConfigSchema = z.object({
  type: StorageTypeSchema,
  localPath: z.string(),
  maxFileSizeMb: z.number().int().min(1).max(1000),
  allowedExtensions: z.string(),
  s3Bucket: z.string(),
  s3Region: z.string(),
  azureContainer: z.string(),
  azureConnectionStringEnv: z.string(),
  generateMetadataEntity: z.boolean(),
});

export const JteConfigSchema = z.object({
  enabled: z.boolean(),
  generateAdmin: z.boolean(),
  generateCrudViews: z.boolean(),
  includeTailwind: z.boolean(),
  includeAlpine: z.boolean(),
  adminPath: z.string().startsWith('/'),
});

// ============================================
// RUST AXUM OPTIONS SCHEMA
// ============================================

export const RustPresetSchema = z.enum([
  'cloud',
  'edge-gateway',
  'edge-anomaly',
  'edge-ai',
]);

export const RustAxumOptionsSchema = z.object({
  preset: RustPresetSchema,

  // Database
  usePostgres: z.boolean(),
  useSqlite: z.boolean(),
  useRedis: z.boolean(),

  // Messaging
  useMqtt: z.boolean(),
  useNats: z.boolean(),

  // IoT
  useModbus: z.boolean(),
  useSerial: z.boolean(),

  // AI/ML
  useOnnx: z.boolean(),
  useTokenizers: z.boolean(),
  useNdarray: z.boolean(),

  // Auth
  useJwt: z.boolean(),
  useArgon2: z.boolean(),

  // Infrastructure
  useRateLimiting: z.boolean(),
  useTracing: z.boolean(),
  useOpenTelemetry: z.boolean(),
  useDocker: z.boolean(),
  useGracefulShutdown: z.boolean(),
});

// ============================================
// UPDATED GENERATE REQUEST SCHEMA
// ============================================

// Agregar al GenerateRequestSchema existente:
export const GenerateRequestSchemaV2 = z.object({
  // ... campos existentes ...
  projectName: z.string().min(1),
  groupId: z.string().min(1),
  artifactId: z.string().min(1),
  packageName: z.string().min(1),

  // Nuevo: Target config
  target: TargetConfigSchema.optional(),

  // Feature Pack 2025
  socialLoginConfig: SocialLoginConfigSchema.optional(),
  mailConfig: MailConfigSchema.optional(),
  storageConfig: StorageConfigSchema.optional(),
  jteConfig: JteConfigSchema.optional(),

  // Features simples
  features: z.object({
    // ... features existentes ...
    passwordReset: z.boolean().optional(),
  }).optional(),

  // Rust specific (solo si target.language === 'rust')
  rustOptions: RustAxumOptionsSchema.optional(),

  // ... resto de campos existentes ...
});

// ============================================
// TYPE INFERENCE
// ============================================

export type Language = z.infer<typeof LanguageSchema>;
export type Framework = z.infer<typeof FrameworkSchema>;
export type TargetConfig = z.infer<typeof TargetConfigSchema>;
export type SocialLoginConfig = z.infer<typeof SocialLoginConfigSchema>;
export type MailConfig = z.infer<typeof MailConfigSchema>;
export type StorageConfig = z.infer<typeof StorageConfigSchema>;
export type JteConfig = z.infer<typeof JteConfigSchema>;
export type RustPreset = z.infer<typeof RustPresetSchema>;
export type RustAxumOptions = z.infer<typeof RustAxumOptionsSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Valida que el target es compatible con las features seleccionadas
 */
export function validateTargetFeatureCompatibility(
  target: TargetConfig,
  features: Record<string, boolean>
): z.SafeParseReturnType<unknown, unknown> {
  // Implementar logica de validacion cruzada
  // Por ejemplo: jteTemplates solo para Java/Kotlin
  if (features.jteTemplates && !['java', 'kotlin'].includes(target.language)) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: 'custom',
          message: 'jte Templates only available for Java and Kotlin',
          path: ['features', 'jteTemplates'],
        },
      ]),
    };
  }

  return { success: true, data: features };
}
```

---

## Tests

```typescript
// src/api/schemas.test.ts

import { describe, it, expect } from 'vitest';
import {
  TargetConfigSchema,
  SocialLoginConfigSchema,
  MailConfigSchema,
  StorageConfigSchema,
  RustAxumOptionsSchema,
} from './schemas';

describe('TargetConfigSchema', () => {
  it('should validate valid target config', () => {
    const result = TargetConfigSchema.safeParse({
      language: 'java',
      framework: 'spring-boot',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid language', () => {
    const result = TargetConfigSchema.safeParse({
      language: 'invalid',
      framework: 'spring-boot',
    });
    expect(result.success).toBe(false);
  });
});

describe('MailConfigSchema', () => {
  it('should validate valid mail config', () => {
    const result = MailConfigSchema.safeParse({
      enabled: true,
      host: 'smtp.gmail.com',
      port: 587,
      username: 'user',
      starttls: true,
      fromAddress: 'test@example.com',
      fromName: 'Test',
      generateWelcomeTemplate: true,
      generatePasswordResetTemplate: true,
      generateNotificationTemplate: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = MailConfigSchema.safeParse({
      enabled: true,
      host: 'smtp.gmail.com',
      port: 587,
      username: 'user',
      starttls: true,
      fromAddress: 'invalid-email',
      fromName: 'Test',
      generateWelcomeTemplate: true,
      generatePasswordResetTemplate: true,
      generateNotificationTemplate: false,
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty email when disabled', () => {
    const result = MailConfigSchema.safeParse({
      enabled: false,
      host: '',
      port: 587,
      username: '',
      starttls: true,
      fromAddress: '',
      fromName: '',
      generateWelcomeTemplate: false,
      generatePasswordResetTemplate: false,
      generateNotificationTemplate: false,
    });
    expect(result.success).toBe(true);
  });
});

describe('StorageConfigSchema', () => {
  it('should validate local storage', () => {
    const result = StorageConfigSchema.safeParse({
      type: 'local',
      localPath: './uploads',
      maxFileSizeMb: 10,
      allowedExtensions: 'jpg,png',
      s3Bucket: '',
      s3Region: '',
      azureContainer: '',
      azureConnectionStringEnv: '',
      generateMetadataEntity: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid storage type', () => {
    const result = StorageConfigSchema.safeParse({
      type: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});
```

---

## Criterios de Completado

- [ ] Todos los schemas definidos
- [ ] Tipos inferidos de Zod (no duplicados)
- [ ] Validaciones edge cases (email vacio, etc.)
- [ ] Tests unitarios pasan
- [ ] Integrado con GenerateRequestSchema existente
- [ ] `npm run check` pasa
- [ ] `npm run test:run` pasa

---

## JIT Context (Just-In-Time Learning)

### Conceptos a aprender:
- **Zod inference:** `z.infer<typeof Schema>` genera tipos automaticamente
- **Zod refinements:** `.refine()` para validaciones custom
- **Zod union discriminada:** Para validar basado en tipo de storage

### Recursos:
- [Zod Documentation](https://zod.dev/)
- [Zod with TypeScript](https://zod.dev/?id=type-inference)

---

## Notas

- Usar `z.infer<>` para evitar duplicar tipos
- Los schemas deben ser estrictos para request, flexibles para response
- Considerar usar `.passthrough()` si backend puede enviar campos extra

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

[[T-005]] → [[T-007]] → [[T-008]] | [[Phases/00-FOUNDATION]]
