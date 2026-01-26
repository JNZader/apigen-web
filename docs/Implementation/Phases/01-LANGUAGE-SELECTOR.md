# Fase 1: Selector de Lenguaje/Framework

> **Prioridad:** ALTA
> **Duracion estimada:** 6-8 horas
> **Paralelizable:** SI (despues de Fase 0)
> **Dependencia:** Fase 0 completada

---

## Objetivo

Permitir al usuario seleccionar entre 9 lenguajes/frameworks diferentes para la generacion de codigo.

### Lenguajes Soportados

| Lenguaje | Framework | Version |
|----------|-----------|---------|
| Java | Spring Boot | 4.x (Java 25) |
| Kotlin | Spring Boot | 4.x (Kotlin 2.1.0) |
| Python | FastAPI | 0.128.0 |
| TypeScript | NestJS | 11.x |
| PHP | Laravel | 12.0 |
| Go | Gin | 1.10.x |
| Go | Chi | 5.2.x |
| Rust | Axum | 0.8.x |
| C# | ASP.NET Core | 8.x |

---

## Iteraciones

### Iteracion 1.1: Componente LanguageSelector

| Tarea | Branch | Dependencia | Paralelo con |
|-------|--------|-------------|--------------|
| [[T-011]] Crear LanguageSelector.tsx | feat/language-selector | Fase 0 | - |
| [[T-012]] Crear FrameworkCard.tsx | feat/language-selector | T-011 | - |
| [[T-013]] Crear FeatureMatrix.tsx | feat/language-selector | T-011 | T-012 |

### Iteracion 1.2: Datos de Configuracion

| Tarea | Branch | Dependencia | Paralelo con |
|-------|--------|-------------|--------------|
| [[T-014]] Crear config/languageConfigs.ts | feat/language-selector | Fase 0 | T-011 |
| [[T-015]] Crear config/featureCompatibility.ts | feat/language-selector | T-014 | T-012, T-013 |

### Iteracion 1.3: Integracion

| Tarea | Branch | Dependencia | Paralelo con |
|-------|--------|-------------|--------------|
| [[T-016]] Integrar en ProjectSettings | feat/language-selector | T-011-T-015 | - |
| [[T-017]] Logica de deshabilitacion de features | feat/language-selector | T-015, T-016 | - |

### Iteracion 1.4: Tests

| Tarea | Branch | Dependencia | Paralelo con |
|-------|--------|-------------|--------------|
| [[T-018]] Tests unitarios LanguageSelector | feat/language-selector | T-011 | T-016 |
| [[T-019]] Tests FeatureMatrix | feat/language-selector | T-013 | T-017 |

---

## Archivos a Crear

```
src/components/LanguageSelector/
├── index.ts                     ← Re-exports
├── LanguageSelector.tsx         ← Componente principal (~200 lineas)
├── FrameworkCard.tsx            ← Card individual (~100 lineas)
├── FeatureMatrix.tsx            ← Matriz compatibilidad (~150 lineas)
└── LanguageSelector.test.tsx    ← Tests (~100 lineas)

src/config/
├── languageConfigs.ts           ← Configuracion por lenguaje (~200 lineas)
└── featureCompatibility.ts      ← Matriz de features (~150 lineas)
```

## Archivos a Modificar

```
src/components/ProjectSettings/
└── index.tsx                    ← Agregar tab "Language"

src/pages/
└── DesignerPage.tsx             ← Mostrar selector si no hay lenguaje
```

---

## UI/UX Esperado

### Vista Cards (LanguageSelector)

```
┌─────────────────────────────────────────────────────────────┐
│  Select Target Language/Framework                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  ☕     │  │   K    │  │  🐍     │  │   TS   │        │
│  │  Java   │  │ Kotlin │  │ Python  │  │ NestJS │        │
│  │ Spring  │  │ Spring │  │ FastAPI │  │        │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   PHP   │  │   Go   │  │   Go   │  │  🦀     │        │
│  │ Laravel │  │  Gin   │  │  Chi   │  │  Rust  │        │
│  │         │  │        │  │        │  │  Axum  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
│  ┌─────────┐                                               │
│  │   C#    │                                               │
│  │ ASP.NET │                                               │
│  └─────────┘                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Feature Matrix (FeatureMatrix)

```
┌─────────────────────────────────────────────────────────────┐
│  Feature Compatibility                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Feature          │ Java │ Kotlin │ Python │ ... │ Rust    │
│  ─────────────────┼──────┼────────┼────────┼─────┼─────────│
│  JWT Auth         │  ✓   │   ✓    │   ✓    │ ... │   ✓     │
│  OAuth2           │  ✓   │   ✓    │   ✓    │ ... │   ✗     │
│  Social Login     │  ✓   │   ✓    │   ✗    │ ... │   ✗     │
│  File Upload      │  ✓   │   ✓    │   ✓    │ ... │   ✓     │
│  GraphQL          │  ✓   │   ✓    │   ✓    │ ... │   ✗     │
│  gRPC             │  ✓   │   ✓    │   ✓    │ ... │   ✓     │
│  Edge Computing   │  ✗   │   ✗    │   ✗    │ ... │   ✓     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Criterios de Completado

- [ ] Usuario puede seleccionar cualquiera de los 9 lenguajes
- [ ] Card muestra informacion relevante (version, features)
- [ ] Features no soportadas se deshabilitan automaticamente
- [ ] Selection persiste en projectStore
- [ ] Request de generacion incluye `target.language` y `target.framework`
- [ ] Tests pasan (>80% cobertura del componente)
- [ ] npm run check sin errores

---

## Notas de Implementacion

### FrameworkCard Props

```typescript
interface FrameworkCardProps {
  language: Language;
  framework: Framework;
  version: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}
```

### Integracion con Store

```typescript
// En projectStore
setTargetLanguage: (language: Language, framework: Framework) => void;
getTargetConfig: () => TargetConfig | null;
```

---

*Branch: feat/language-selector*
*PR: Crear despues de completar todas las tareas*
