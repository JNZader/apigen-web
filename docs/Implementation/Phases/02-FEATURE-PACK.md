# Fase 2: Feature Pack 2025

> **Prioridad:** ALTA
> **Duracion estimada:** 10-12 horas (paralelo)
> **Paralelizable:** SI - Cada feature es independiente
> **Dependencia:** Fase 0 completada

---

## Objetivo

Implementar las 5 features del Feature Pack 2025:
1. Social Login
2. Password Reset
3. Mail Service
4. File Upload/Storage
5. jte Templates

**IMPORTANTE:** Estas 5 features pueden desarrollarse **completamente en paralelo** ya que cada una tiene su propio componente y no comparten archivos.

---

## Mapa de Paralelismo

```
Fase 0 (Foundation) ──────────────────────────────────────┐
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PARALELO - Sin conflictos                     │
├───────────┬───────────┬───────────┬───────────┬─────────────────┤
│           │           │           │           │                 │
│  Fase 2.1 │  Fase 2.2 │  Fase 2.3 │  Fase 2.4 │    Fase 2.5     │
│  Social   │   Mail    │  Storage  │  Password │      jte        │
│  Login    │  Service  │   Files   │   Reset   │   Templates     │
│           │           │           │           │                 │
│  Branch:  │  Branch:  │  Branch:  │  Branch:  │    Branch:      │
│  feat/    │  feat/    │  feat/    │  feat/    │    feat/        │
│  feature- │  feature- │  feature- │  feature- │    feature-     │
│  social   │  mail     │  storage  │  password │    jte          │
│           │           │           │           │                 │
└───────────┴───────────┴───────────┴───────────┴─────────────────┘
                                                          │
                                                          ▼
                                          Fase 2.6: Integracion Final
```

---

## Fase 2.1: Social Login

> **Branch:** feat/feature-social
> **Duracion:** 2h
> **Archivos exclusivos:** SocialLoginSettingsForm.tsx

### Tareas

| Tarea | Dependencia |
|-------|-------------|
| [[T-020]] Crear SocialLoginSettingsForm.tsx | Fase 0 |
| [[T-021]] Tests SocialLoginSettingsForm | T-020 |

### Configuracion

```typescript
interface SocialLoginConfig {
  enabled: boolean;
  google: boolean;
  github: boolean;
  linkedin: boolean;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  autoCreateUser: boolean;
  linkByEmail: boolean;
}
```

### UI Esperado

```
┌─────────────────────────────────────────────────────────┐
│  Social Login Configuration                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [x] Enable Social Login                                │
│                                                         │
│  Providers:                                             │
│  [x] Google    [x] GitHub    [ ] LinkedIn               │
│                                                         │
│  Redirect URLs:                                         │
│  Success: [________________________] /dashboard         │
│  Failure: [________________________] /login?error=true  │
│                                                         │
│  Options:                                               │
│  [x] Auto-create user on first login                    │
│  [x] Link accounts by email                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Fase 2.2: Mail Service

> **Branch:** feat/feature-mail
> **Duracion:** 2h
> **Archivos exclusivos:** MailServiceSettingsForm.tsx

### Tareas

| Tarea | Dependencia |
|-------|-------------|
| [[T-022]] Crear MailServiceSettingsForm.tsx | Fase 0 |
| [[T-023]] Tests MailServiceSettingsForm | T-022 |

### Configuracion

```typescript
interface MailConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  starttls: boolean;
  fromAddress: string;
  fromName: string;
  generateWelcomeTemplate: boolean;
  generatePasswordResetTemplate: boolean;
  generateNotificationTemplate: boolean;
}
```

### UI Esperado

```
┌─────────────────────────────────────────────────────────┐
│  Mail Service Configuration                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [x] Enable Mail Service                                │
│                                                         │
│  SMTP Settings:                                         │
│  Host: [smtp.gmail.com__________]                       │
│  Port: [587_] [x] STARTTLS                              │
│  Username: [________________]                           │
│                                                         │
│  From Settings:                                         │
│  Address: [noreply@example.com__]                       │
│  Name:    [My Application________]                      │
│                                                         │
│  Email Templates:                                       │
│  [x] Welcome email                                      │
│  [x] Password reset                                     │
│  [ ] Notifications                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Fase 2.3: File Storage

> **Branch:** feat/feature-storage
> **Duracion:** 2.5h
> **Archivos exclusivos:** FileStorageSettingsForm.tsx

### Tareas

| Tarea | Dependencia |
|-------|-------------|
| [[T-024]] Crear FileStorageSettingsForm.tsx | Fase 0 |
| [[T-025]] Tests FileStorageSettingsForm | T-024 |

### Configuracion

```typescript
interface StorageConfig {
  type: 'local' | 's3' | 'azure';
  localPath: string;
  maxFileSizeMb: number;
  allowedExtensions: string;
  s3Bucket: string;
  s3Region: string;
  azureContainer: string;
  azureConnectionStringEnv: string;
  generateMetadataEntity: boolean;
}
```

### UI Esperado

```
┌─────────────────────────────────────────────────────────┐
│  File Storage Configuration                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Storage Type:                                          │
│  ( ) Local    (x) Amazon S3    ( ) Azure Blob           │
│                                                         │
│  S3 Settings:                                           │
│  Bucket: [my-app-files__________]                       │
│  Region: [us-east-1_____________]                       │
│                                                         │
│  Upload Limits:                                         │
│  Max Size: [10__] MB                                    │
│  Extensions: [jpg,png,pdf,doc___]                       │
│                                                         │
│  Options:                                               │
│  [x] Generate FileMetadata entity                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Fase 2.4: Password Reset

> **Branch:** feat/feature-password
> **Duracion:** 1.5h
> **Archivos exclusivos:** PasswordResetSettingsForm.tsx

### Tareas

| Tarea | Dependencia |
|-------|-------------|
| [[T-026]] Crear PasswordResetSettingsForm.tsx | Fase 0 |
| [[T-027]] Tests PasswordResetSettingsForm | T-026 |

### Configuracion

```typescript
// Simple boolean feature
// features.passwordReset: boolean

// Genera automaticamente:
// - PasswordResetToken entity
// - PasswordResetService
// - PasswordResetController
// - Endpoints: POST /api/auth/password/forgot, POST /api/auth/password/reset
```

### UI Esperado

```
┌─────────────────────────────────────────────────────────┐
│  Password Reset                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [x] Enable Password Reset Feature                      │
│                                                         │
│  This will generate:                                    │
│  • PasswordResetToken entity                            │
│  • PasswordResetService                                 │
│  • PasswordResetController                              │
│                                                         │
│  Endpoints:                                             │
│  • POST /api/auth/password/forgot                       │
│  • POST /api/auth/password/reset                        │
│                                                         │
│  ⚠️  Requires Mail Service to be enabled                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Dependencia de UI

- Si `mailConfig.enabled === false`, mostrar warning
- No bloquear, solo advertir

---

## Fase 2.5: jte Templates

> **Branch:** feat/feature-jte
> **Duracion:** 2h
> **Archivos exclusivos:** JteTemplatesSettingsForm.tsx

### Tareas

| Tarea | Dependencia |
|-------|-------------|
| [[T-028]] Crear JteTemplatesSettingsForm.tsx | Fase 0 |
| [[T-029]] Tests JteTemplatesSettingsForm | T-028 |

### Configuracion

```typescript
interface JteConfig {
  enabled: boolean;
  generateAdmin: boolean;
  generateCrudViews: boolean;
  includeTailwind: boolean;
  includeAlpine: boolean;
  adminPath: string;
}
```

### UI Esperado

```
┌─────────────────────────────────────────────────────────┐
│  jte Templates (Server-Side Rendering)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [x] Enable jte Templates                               │
│                                                         │
│  Generate:                                              │
│  [x] Admin Dashboard                                    │
│  [x] CRUD Views for Entities                            │
│                                                         │
│  Include:                                               │
│  [x] Tailwind CSS                                       │
│  [x] Alpine.js                                          │
│                                                         │
│  Admin Path: [/admin____________]                       │
│                                                         │
│  ℹ️  Only available for Java/Kotlin                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Restriccion de Lenguaje

- Solo disponible para Java y Kotlin
- Mostrar tooltip si lenguaje no es compatible

---

## Fase 2.6: Integracion Final

> **Branch:** feat/feature-pack-integration
> **Duracion:** 2h
> **Dependencia:** T-020 a T-029 completadas

### Tareas

| Tarea | Dependencia |
|-------|-------------|
| [[T-030]] Integrar todos los forms en ProjectSettings | T-020-T-029 |
| [[T-031]] Crear seccion "Feature Pack 2025" en tabs | T-030 |
| [[T-032]] Tests de integracion | T-030, T-031 |

### Modificaciones

```
src/components/ProjectSettings/
├── index.tsx                    ← Agregar imports y tabs
└── FeaturesSettingsForm.tsx     ← Agregar toggles master
```

---

## Criterios de Completado (Fase 2 completa)

- [ ] Todas las 5 features son configurables via UI
- [ ] Validaciones dependientes funcionan (ej: password reset warning si no hay mail)
- [ ] Configuraciones se guardan en projectStore
- [ ] Request de generacion incluye todas las configs
- [ ] Tests pasan (>80% cobertura por componente)
- [ ] npm run check sin errores

---

## Resumen de Archivos

### Crear (5 componentes + 5 tests)

```
src/components/ProjectSettings/
├── SocialLoginSettingsForm.tsx      ← ~150 lineas
├── SocialLoginSettingsForm.test.tsx
├── MailServiceSettingsForm.tsx      ← ~180 lineas
├── MailServiceSettingsForm.test.tsx
├── FileStorageSettingsForm.tsx      ← ~200 lineas
├── FileStorageSettingsForm.test.tsx
├── PasswordResetSettingsForm.tsx    ← ~80 lineas
├── PasswordResetSettingsForm.test.tsx
├── JteTemplatesSettingsForm.tsx     ← ~120 lineas
└── JteTemplatesSettingsForm.test.tsx
```

### Modificar

```
src/components/ProjectSettings/
├── index.tsx                        ← Imports + tabs
└── FeaturesSettingsForm.tsx         ← Toggles master
```

---

*Branches: feat/feature-social, feat/feature-mail, feat/feature-storage, feat/feature-password, feat/feature-jte*
*PR: Uno por feature, merge en orden o squash final*
