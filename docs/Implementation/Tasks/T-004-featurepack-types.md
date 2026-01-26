# T-004: Crear types/config/featurepack.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.2 Tipos Feature Pack 2025

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-004 |
| **Tipo** | Setup |
| **Estimado** | 1.5h |
| **Dependencias** | [[T-001]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Definir los tipos para las 5 features del Feature Pack 2025: Social Login, Password Reset, Mail Service, File Storage, y jte Templates.

---

## Tareas

- [ ] Crear archivo `src/types/config/featurepack.ts`
- [ ] Definir `SocialLoginConfig`
- [ ] Definir `MailConfig`
- [ ] Definir `StorageConfig`
- [ ] Definir `JteConfig`
- [ ] Definir `FeaturePackConfig` (agregado)
- [ ] Exportar desde `src/types/config/index.ts`

---

## Archivos a Crear/Modificar

```
src/types/config/
├── featurepack.ts               ← CREAR (~200 lineas)
└── index.ts                     ← MODIFICAR (agregar export)
```

**LOC Estimado:** ~200

---

## Codigo de Referencia

```typescript
// src/types/config/featurepack.ts

/**
 * Feature Pack 2025 - Social Login Configuration
 *
 * Permite autenticacion via proveedores OAuth externos.
 * Requiere configuracion de credenciales en el backend.
 */
export interface SocialLoginConfig {
  /** Habilitar social login */
  enabled: boolean;

  /** Proveedores habilitados */
  google: boolean;
  github: boolean;
  linkedin: boolean;

  /** URL de redireccion tras login exitoso */
  successRedirectUrl: string;

  /** URL de redireccion tras login fallido */
  failureRedirectUrl: string;

  /** Crear usuario automaticamente si no existe */
  autoCreateUser: boolean;

  /** Vincular cuentas por email si ya existe usuario */
  linkByEmail: boolean;
}

/**
 * Valores por defecto para SocialLoginConfig
 */
export const DEFAULT_SOCIAL_LOGIN_CONFIG: SocialLoginConfig = {
  enabled: false,
  google: false,
  github: false,
  linkedin: false,
  successRedirectUrl: '/dashboard',
  failureRedirectUrl: '/login?error=true',
  autoCreateUser: true,
  linkByEmail: true,
};

/**
 * Feature Pack 2025 - Mail Service Configuration
 *
 * Configura el servicio de envio de emails.
 * Soporta SMTP con STARTTLS.
 */
export interface MailConfig {
  /** Habilitar servicio de email */
  enabled: boolean;

  /** Host del servidor SMTP */
  host: string;

  /** Puerto SMTP (default: 587) */
  port: number;

  /** Usuario SMTP */
  username: string;

  /** Usar STARTTLS para conexion segura */
  starttls: boolean;

  /** Direccion de email del remitente */
  fromAddress: string;

  /** Nombre del remitente */
  fromName: string;

  /** Generar template de email de bienvenida */
  generateWelcomeTemplate: boolean;

  /** Generar template de reset de password */
  generatePasswordResetTemplate: boolean;

  /** Generar template de notificaciones */
  generateNotificationTemplate: boolean;
}

/**
 * Valores por defecto para MailConfig
 */
export const DEFAULT_MAIL_CONFIG: MailConfig = {
  enabled: false,
  host: 'smtp.gmail.com',
  port: 587,
  username: '',
  starttls: true,
  fromAddress: 'noreply@example.com',
  fromName: 'My Application',
  generateWelcomeTemplate: true,
  generatePasswordResetTemplate: true,
  generateNotificationTemplate: false,
};

/**
 * Tipos de almacenamiento soportados
 */
export type StorageType = 'local' | 's3' | 'azure';

/**
 * Feature Pack 2025 - File Storage Configuration
 *
 * Configura el almacenamiento de archivos.
 * Soporta local, Amazon S3, y Azure Blob Storage.
 */
export interface StorageConfig {
  /** Tipo de almacenamiento */
  type: StorageType;

  /** Ruta local para almacenamiento (solo si type='local') */
  localPath: string;

  /** Tamano maximo de archivo en MB */
  maxFileSizeMb: number;

  /** Extensiones permitidas (separadas por coma) */
  allowedExtensions: string;

  /** Nombre del bucket S3 (solo si type='s3') */
  s3Bucket: string;

  /** Region de AWS (solo si type='s3') */
  s3Region: string;

  /** Nombre del container Azure (solo si type='azure') */
  azureContainer: string;

  /** Variable de entorno con connection string Azure */
  azureConnectionStringEnv: string;

  /** Generar entidad FileMetadata para tracking */
  generateMetadataEntity: boolean;
}

/**
 * Valores por defecto para StorageConfig
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  type: 'local',
  localPath: './uploads',
  maxFileSizeMb: 10,
  allowedExtensions: 'jpg,jpeg,png,gif,pdf,doc,docx',
  s3Bucket: '',
  s3Region: 'us-east-1',
  azureContainer: '',
  azureConnectionStringEnv: 'AZURE_STORAGE_CONNECTION_STRING',
  generateMetadataEntity: true,
};

/**
 * Feature Pack 2025 - jte Templates Configuration
 *
 * Configura la generacion de templates jte para server-side rendering.
 * Solo disponible para Java y Kotlin.
 */
export interface JteConfig {
  /** Habilitar jte templates */
  enabled: boolean;

  /** Generar dashboard de administracion */
  generateAdmin: boolean;

  /** Generar vistas CRUD para entidades */
  generateCrudViews: boolean;

  /** Incluir Tailwind CSS */
  includeTailwind: boolean;

  /** Incluir Alpine.js para interactividad */
  includeAlpine: boolean;

  /** Path del panel de administracion */
  adminPath: string;
}

/**
 * Valores por defecto para JteConfig
 */
export const DEFAULT_JTE_CONFIG: JteConfig = {
  enabled: false,
  generateAdmin: true,
  generateCrudViews: true,
  includeTailwind: true,
  includeAlpine: true,
  adminPath: '/admin',
};

/**
 * Agregado de todas las configs del Feature Pack 2025
 */
export interface FeaturePackConfig {
  socialLogin: SocialLoginConfig;
  mail: MailConfig;
  storage: StorageConfig;
  jte: JteConfig;
  /** Password reset es un boolean simple */
  passwordReset: boolean;
}

/**
 * Valores por defecto para todo el Feature Pack
 */
export const DEFAULT_FEATURE_PACK_CONFIG: FeaturePackConfig = {
  socialLogin: DEFAULT_SOCIAL_LOGIN_CONFIG,
  mail: DEFAULT_MAIL_CONFIG,
  storage: DEFAULT_STORAGE_CONFIG,
  jte: DEFAULT_JTE_CONFIG,
  passwordReset: false,
};

/**
 * Helper para verificar si alguna feature del pack esta habilitada
 */
export function hasAnyFeaturePackEnabled(config: FeaturePackConfig): boolean {
  return (
    config.socialLogin.enabled ||
    config.mail.enabled ||
    config.storage.type !== 'local' ||
    config.jte.enabled ||
    config.passwordReset
  );
}

/**
 * Helper para verificar dependencias entre features
 */
export function getFeaturePackWarnings(config: FeaturePackConfig): string[] {
  const warnings: string[] = [];

  if (config.passwordReset && !config.mail.enabled) {
    warnings.push('Password Reset requires Mail Service to be enabled');
  }

  if (config.socialLogin.enabled && !config.socialLogin.google &&
      !config.socialLogin.github && !config.socialLogin.linkedin) {
    warnings.push('Social Login is enabled but no providers are selected');
  }

  return warnings;
}
```

---

## Criterios de Completado

- [ ] Todas las interfaces definidas con JSDoc
- [ ] Valores por defecto exportados
- [ ] Helper functions implementadas
- [ ] Tipos compilan sin errores
- [ ] Exportado desde types/config/index.ts
- [ ] `npm run check` pasa

---

## Notas

- Los tipos deben coincidir con el schema del backend
- Incluir JSDoc para documentar cada campo
- Los defaults deben ser conservadores (features deshabilitadas por defecto)

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

[[T-001]] → [[T-004]] → [[T-005]] | [[Phases/00-FOUNDATION]]
