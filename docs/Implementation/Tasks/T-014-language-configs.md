# T-014: Crear config/languageConfigs.ts

> Fase: [[Phases/01-LANGUAGE-SELECTOR]] | Iteracion: 1.2 Datos de Configuracion

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-014 |
| **Tipo** | Feature |
| **Estimado** | 1h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/language-selector` |
| **Estado** | Pending |

---

## Objetivo

Crear archivo de configuracion centralizado con todos los datos de los 9 lenguajes/frameworks.

---

## Tareas

- [ ] Crear `src/config/languageConfigs.ts`
- [ ] Definir metadata completa por lenguaje
- [ ] Iconos y colores por lenguaje
- [ ] Features soportadas por lenguaje
- [ ] Helpers para acceso

---

## Archivos a Crear

```
src/config/
└── languageConfigs.ts           ← CREAR (~200 lineas)
```

**LOC Estimado:** ~200

---

## Codigo de Referencia

```typescript
// src/config/languageConfigs.ts

import type { Language, Framework, FeatureSupport } from '@/types/target';

/**
 * Configuracion completa de un lenguaje/framework
 */
export interface LanguageConfig {
  language: Language;
  framework: Framework;
  displayName: string;
  shortName: string;
  version: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  supportedFeatures: FeatureSupport;
  docs: string;
  popularity: number; // 1-10 for sorting
}

/**
 * Configuracion de todos los lenguajes soportados
 */
export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  // ========== JAVA ==========
  {
    language: 'java',
    framework: 'spring-boot',
    displayName: 'Java / Spring Boot',
    shortName: 'Java',
    version: '4.x (Java 25)',
    description: 'Enterprise-grade REST APIs with full feature support',
    icon: 'IconCoffee',
    color: 'orange',
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
    docs: 'https://spring.io/projects/spring-boot',
    popularity: 10,
  },

  // ========== KOTLIN ==========
  {
    language: 'kotlin',
    framework: 'spring-boot',
    displayName: 'Kotlin / Spring Boot',
    shortName: 'Kotlin',
    version: '4.x (Kotlin 2.1.0)',
    description: 'Modern JVM language with data classes and coroutines',
    icon: 'IconBrandKotlin',
    color: 'violet',
    features: ['Data Classes', 'Sealed Classes', 'Coroutines', 'Null Safety'],
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
    docs: 'https://kotlinlang.org/',
    popularity: 9,
  },

  // ========== PYTHON ==========
  {
    language: 'python',
    framework: 'fastapi',
    displayName: 'Python / FastAPI',
    shortName: 'Python',
    version: '0.128.0 (Python 3.12)',
    description: 'High-performance async APIs with automatic OpenAPI docs',
    icon: 'IconBrandPython',
    color: 'blue',
    features: ['Async', 'Pydantic', 'OpenAPI', 'SQLAlchemy'],
    supportedFeatures: {
      jwt: true,
      oauth2: true,
      socialLogin: false,
      passwordReset: true,
      mailService: true,
      fileUpload: true,
      jteTemplates: false,
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
    docs: 'https://fastapi.tiangolo.com/',
    popularity: 8,
  },

  // ========== TYPESCRIPT ==========
  {
    language: 'typescript',
    framework: 'nestjs',
    displayName: 'TypeScript / NestJS',
    shortName: 'NestJS',
    version: '11.x (TS 5.9)',
    description: 'Angular-inspired Node.js framework with decorators',
    icon: 'IconBrandTypescript',
    color: 'blue',
    features: ['TypeORM', 'Decorators', 'Modules', 'OpenAPI'],
    supportedFeatures: {
      jwt: true,
      oauth2: true,
      socialLogin: true,
      passwordReset: true,
      mailService: true,
      fileUpload: true,
      jteTemplates: false,
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
    docs: 'https://nestjs.com/',
    popularity: 7,
  },

  // ========== PHP ==========
  {
    language: 'php',
    framework: 'laravel',
    displayName: 'PHP / Laravel',
    shortName: 'Laravel',
    version: '12.0 (PHP 8.4)',
    description: 'Elegant MVC framework with Eloquent ORM',
    icon: 'IconBrandPhp',
    color: 'indigo',
    features: ['Eloquent', 'Migrations', 'API Resources', 'Artisan'],
    supportedFeatures: {
      jwt: true,
      oauth2: true,
      socialLogin: false,
      passwordReset: true,
      mailService: true,
      fileUpload: true,
      jteTemplates: false,
      graphql: true,
      grpc: false,
      rateLimit: true,
      circuitBreaker: false,
      caching: true,
      mqtt: false,
      modbus: false,
      serial: false,
      onnx: false,
    },
    docs: 'https://laravel.com/',
    popularity: 6,
  },

  // ========== GO / GIN ==========
  {
    language: 'go',
    framework: 'gin',
    displayName: 'Go / Gin',
    shortName: 'Gin',
    version: '1.10.x (Go 1.23)',
    description: 'Fast HTTP web framework with GORM',
    icon: 'IconBrandGolang',
    color: 'cyan',
    features: ['GORM', 'Validator', 'Swagger', 'Middleware'],
    supportedFeatures: {
      jwt: true,
      oauth2: true,
      socialLogin: false,
      passwordReset: true,
      mailService: true,
      fileUpload: true,
      jteTemplates: false,
      graphql: false,
      grpc: true,
      rateLimit: true,
      circuitBreaker: true,
      caching: true,
      mqtt: false,
      modbus: false,
      serial: false,
      onnx: false,
    },
    docs: 'https://gin-gonic.com/',
    popularity: 7,
  },

  // ========== GO / CHI ==========
  {
    language: 'go',
    framework: 'chi',
    displayName: 'Go / Chi',
    shortName: 'Chi',
    version: '5.2.x (Go 1.23)',
    description: 'Lightweight router with pgx (no ORM) and messaging',
    icon: 'IconBrandGolang',
    color: 'teal',
    features: ['pgx', 'Viper', 'JWT', 'NATS', 'MQTT', 'Redis'],
    supportedFeatures: {
      jwt: true,
      oauth2: false,
      socialLogin: false,
      passwordReset: true,
      mailService: true,
      fileUpload: true,
      jteTemplates: false,
      graphql: false,
      grpc: true,
      rateLimit: true,
      circuitBreaker: false,
      caching: true,
      mqtt: true,
      modbus: false,
      serial: false,
      onnx: false,
    },
    docs: 'https://go-chi.io/',
    popularity: 5,
  },

  // ========== RUST ==========
  {
    language: 'rust',
    framework: 'axum',
    displayName: 'Rust / Axum',
    shortName: 'Rust',
    version: '0.8.x (Rust 1.85)',
    description: 'Edge computing with MQTT, Modbus, and AI/ML',
    icon: 'IconBrandRust',
    color: 'orange',
    features: ['Tokio', 'sqlx', 'MQTT', 'Modbus', 'ONNX', 'Edge'],
    supportedFeatures: {
      jwt: true,
      oauth2: false,
      socialLogin: false,
      passwordReset: false,
      mailService: false,
      fileUpload: true,
      jteTemplates: false,
      graphql: false,
      grpc: true,
      rateLimit: true,
      circuitBreaker: false,
      caching: true,
      mqtt: true,
      modbus: true,
      serial: true,
      onnx: true,
    },
    docs: 'https://github.com/tokio-rs/axum',
    popularity: 6,
  },

  // ========== C# ==========
  {
    language: 'csharp',
    framework: 'aspnet-core',
    displayName: 'C# / ASP.NET Core',
    shortName: 'C#',
    version: '8.x (.NET 8.0)',
    description: 'Enterprise .NET with Entity Framework Core',
    icon: 'IconBrandCSharp',
    color: 'grape',
    features: ['EF Core', 'AutoMapper', 'Records', 'Minimal APIs'],
    supportedFeatures: {
      jwt: true,
      oauth2: true,
      socialLogin: false,
      passwordReset: true,
      mailService: true,
      fileUpload: true,
      jteTemplates: false,
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
    docs: 'https://learn.microsoft.com/aspnet/core/',
    popularity: 7,
  },
];

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene configuracion de un lenguaje/framework
 */
export function getLanguageConfig(
  language: Language,
  framework: Framework
): LanguageConfig | undefined {
  return LANGUAGE_CONFIGS.find(
    (c) => c.language === language && c.framework === framework
  );
}

/**
 * Obtiene todos los lenguajes ordenados por popularidad
 */
export function getLanguagesByPopularity(): LanguageConfig[] {
  return [...LANGUAGE_CONFIGS].sort((a, b) => b.popularity - a.popularity);
}

/**
 * Filtra lenguajes que soportan una feature especifica
 */
export function getLanguagesWithFeature(
  feature: keyof FeatureSupport
): LanguageConfig[] {
  return LANGUAGE_CONFIGS.filter((c) => c.supportedFeatures[feature]);
}

/**
 * Cuenta features soportadas por un lenguaje
 */
export function countSupportedFeatures(config: LanguageConfig): number {
  return Object.values(config.supportedFeatures).filter(Boolean).length;
}
```

---

## Criterios de Completado

- [ ] 9 lenguajes configurados
- [ ] Metadata completa por lenguaje
- [ ] Features correctas por lenguaje
- [ ] Helpers funcionan
- [ ] Datos coinciden con backend
- [ ] `npm run check` pasa

---

## Notas

- Popularity es para ordenar en UI
- Features deben coincidir con backend exactamente
- Iconos son de Tabler Icons

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

Fase 0 → [[T-014]] → [[T-015]] | [[Phases/01-LANGUAGE-SELECTOR]]
