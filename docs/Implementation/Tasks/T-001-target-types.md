# T-001: Crear types/target.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.1 Tipos Base

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-001 |
| **Tipo** | Setup |
| **Estimado** | 1h |
| **Dependencias** | Ninguna |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Crear el archivo de tipos que define los lenguajes y frameworks soportados, incluyendo la configuracion de target para la generacion de codigo.

---

## Tareas

- [ ] Crear archivo `src/types/target.ts`
- [ ] Definir enum/union `Language`
- [ ] Definir enum/union `Framework`
- [ ] Definir interfaz `TargetConfig`
- [ ] Definir constantes de metadata por lenguaje
- [ ] Exportar todo desde `src/types/index.ts`

---

## Archivos a Crear/Modificar

```
src/types/
├── target.ts                    ← CREAR (~150 lineas)
└── index.ts                     ← MODIFICAR (agregar export)
```

**LOC Estimado:** ~150

---

## Codigo de Referencia

```typescript
// src/types/target.ts

/**
 * Lenguajes soportados por el backend apigen
 */
export type Language =
  | 'java'
  | 'kotlin'
  | 'python'
  | 'typescript'
  | 'php'
  | 'go'
  | 'rust'
  | 'csharp';

/**
 * Frameworks soportados por lenguaje
 */
export type Framework =
  // Java/Kotlin
  | 'spring-boot'
  // Python
  | 'fastapi'
  // TypeScript
  | 'nestjs'
  // PHP
  | 'laravel'
  // Go
  | 'gin'
  | 'chi'
  // Rust
  | 'axum'
  // C#
  | 'aspnet-core';

/**
 * Configuracion de target para generacion
 */
export interface TargetConfig {
  language: Language;
  framework: Framework;
  version?: string;
}

/**
 * Metadata de un lenguaje/framework
 */
export interface LanguageMetadata {
  language: Language;
  framework: Framework;
  displayName: string;
  version: string;
  description: string;
  icon: string; // Tabler icon name
  features: string[];
  supportedFeatures: FeatureSupport;
}

/**
 * Features soportadas por lenguaje
 */
export interface FeatureSupport {
  jwt: boolean;
  oauth2: boolean;
  socialLogin: boolean;
  passwordReset: boolean;
  mailService: boolean;
  fileUpload: boolean;
  jteTemplates: boolean;
  graphql: boolean;
  grpc: boolean;
  rateLimit: boolean;
  circuitBreaker: boolean;
  caching: boolean;
  // Edge computing (solo Rust)
  mqtt: boolean;
  modbus: boolean;
  serial: boolean;
  onnx: boolean;
}

/**
 * Mapeo de lenguaje a frameworks disponibles
 */
export const LANGUAGE_FRAMEWORKS: Record<Language, Framework[]> = {
  java: ['spring-boot'],
  kotlin: ['spring-boot'],
  python: ['fastapi'],
  typescript: ['nestjs'],
  php: ['laravel'],
  go: ['gin', 'chi'],
  rust: ['axum'],
  csharp: ['aspnet-core'],
};

/**
 * Metadata completa de todos los lenguajes
 */
export const LANGUAGE_METADATA: LanguageMetadata[] = [
  {
    language: 'java',
    framework: 'spring-boot',
    displayName: 'Java / Spring Boot',
    version: '4.x (Java 25)',
    description: 'Enterprise-grade REST APIs with full feature support',
    icon: 'IconCoffee',
    features: ['CRUD', 'HATEOAS', 'JWT', 'OAuth2', 'Rate Limiting', 'Batch Ops'],
    supportedFeatures: {
      jwt: true,
      oauth2: true,
      socialLogin: true,
      passwordReset: true,
      mailService: true,
      fileUpload: true,
      jteTemplates: true,
      graphql: true,
      grpc: true,
      rateLimit: true,
      circuitBreaker: true,
      caching: true,
      mqtt: false,
      modbus: false,
      serial: false,
      onnx: false,
    },
  },
  // ... resto de lenguajes
];

/**
 * Helper para obtener metadata de un target
 */
export function getLanguageMetadata(
  language: Language,
  framework: Framework
): LanguageMetadata | undefined {
  return LANGUAGE_METADATA.find(
    (m) => m.language === language && m.framework === framework
  );
}

/**
 * Helper para verificar si una feature esta soportada
 */
export function isFeatureSupported(
  language: Language,
  framework: Framework,
  feature: keyof FeatureSupport
): boolean {
  const metadata = getLanguageMetadata(language, framework);
  return metadata?.supportedFeatures[feature] ?? false;
}
```

---

## Criterios de Completado

- [ ] Todos los 9 lenguajes/frameworks definidos
- [ ] Tipos compilan sin errores
- [ ] Exportado desde types/index.ts
- [ ] `npm run check` pasa

---

## Notas

- Usar union types en lugar de enums para mejor tree-shaking
- Mantener consistencia con nombres del backend API
- Los iconos son nombres de Tabler Icons (sin import real aqui)

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

[[T-002]] | [[Phases/00-FOUNDATION]]
