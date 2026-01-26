# Fase 5: Mejoras de UX

> **Prioridad:** BAJA
> **Duracion estimada:** 4-6 horas
> **Paralelizable:** SI (despues de Fase 1 y 2)
> **Dependencia:** Fases 1, 2, 4 completadas

---

## Objetivo

Mejorar la experiencia de usuario con wizard de generacion, templates predefinidos y matriz de compatibilidad interactiva.

---

## Iteraciones

### Iteracion 5.1: Wizard de Generacion

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-052]] Crear GenerationWizard.tsx | feat/ux-wizard | Fases 1-4 |
| [[T-053]] Crear WizardStep.tsx | feat/ux-wizard | T-052 |
| [[T-054]] Crear WizardSummary.tsx | feat/ux-wizard | T-052 |
| [[T-055]] Tests wizard | feat/ux-wizard | T-052-T-054 |

### Iteracion 5.2: Templates Predefinidos

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-056]] Crear ProjectTemplates.tsx | feat/ux-templates | Fase 1 |
| [[T-057]] Definir templates en config | feat/ux-templates | T-056 |
| [[T-058]] Tests templates | feat/ux-templates | T-056, T-057 |

### Iteracion 5.3: Feature Matrix Interactiva

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-059]] Crear InteractiveFeatureMatrix.tsx | feat/ux-matrix | Fase 1 |
| [[T-060]] Filtros y busqueda | feat/ux-matrix | T-059 |
| [[T-061]] Tests matrix | feat/ux-matrix | T-059, T-060 |

---

## Archivos a Crear

```
src/components/GenerationWizard/
├── index.ts
├── GenerationWizard.tsx         ← Wizard principal (~300 lineas)
├── WizardStep.tsx               ← Paso individual (~100 lineas)
├── WizardSummary.tsx            ← Resumen final (~150 lineas)
├── GenerationWizard.test.tsx
└── steps/
    ├── LanguageStep.tsx         ← Paso 1: Lenguaje
    ├── EntitiesStep.tsx         ← Paso 2: Entidades
    ├── FeaturesStep.tsx         ← Paso 3: Features
    └── ReviewStep.tsx           ← Paso 4: Revision

src/components/ProjectTemplates/
├── index.ts
├── ProjectTemplates.tsx         ← Selector de templates (~200 lineas)
├── TemplateCard.tsx             ← Card de template (~80 lineas)
└── ProjectTemplates.test.tsx

src/config/
└── projectTemplates.ts          ← Definicion de templates (~200 lineas)
```

## Archivos a Modificar

```
src/pages/
└── DesignerPage.tsx             ← Integrar wizard como opcion

src/components/
└── Layout.tsx                   ← Agregar boton "New Project Wizard"
```

---

## Wizard de Generacion

### Pasos del Wizard

```
┌─────────────────────────────────────────────────────────────────┐
│  Create New Project                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ● Step 1      ○ Step 2      ○ Step 3      ○ Step 4            │
│  Language      Entities      Features      Review               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                   [Step Content Here]                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Back]                                       [Next →]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Language Selection

```
┌─────────────────────────────────────────────────────────────────┐
│  Select your target language and framework                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Language Cards - mismo que LanguageSelector]                  │
│                                                                 │
│  Selected: Java / Spring Boot 4.x                               │
│  Features available: 15/18                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Entity Design

```
┌─────────────────────────────────────────────────────────────────┐
│  Design your entities                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Mini Canvas o Entity List]                                    │
│                                                                 │
│  Or import from:                                                │
│  [Import SQL] [Import OpenAPI]                                  │
│                                                                 │
│  Entities: 3 | Relations: 2                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Feature Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│  Configure features                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Accordion con grupos de features]                             │
│                                                                 │
│  > Security (2 selected)                                        │
│  > Database (1 selected)                                        │
│  > Feature Pack 2025 (3 selected)                               │
│  > Observability (0 selected)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Review & Generate

```
┌─────────────────────────────────────────────────────────────────┐
│  Review your project                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Project: my-api                                                │
│  Language: Java / Spring Boot 4.x                               │
│                                                                 │
│  Entities: User, Product, Order                                 │
│  Relations: User → Order (OneToMany)                            │
│             Order → Product (ManyToMany)                        │
│                                                                 │
│  Features:                                                      │
│  ✓ JWT Authentication                                           │
│  ✓ Social Login (Google, GitHub)                                │
│  ✓ File Upload (S3)                                             │
│  ✓ Mail Service                                                 │
│                                                                 │
│  [Edit] [Back]                        [Generate Project]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Templates Predefinidos

### Templates Disponibles

| Template | Lenguaje | Descripcion | Features |
|----------|----------|-------------|----------|
| **Basic REST API** | Todos | API CRUD simple | - |
| **Auth-Ready API** | Java, Kotlin, Python | API con autenticacion completa | JWT, OAuth2, Social Login |
| **Full-Stack Admin** | Java, Kotlin | API + Admin dashboard | JWT, jte, Tailwind |
| **IoT Edge Gateway** | Rust | Gateway para dispositivos IoT | MQTT, Modbus, Serial |
| **AI-Powered API** | Rust | API con ML integrado | ONNX, tokenizers |
| **Microservices Starter** | Java, Kotlin | Monorepo multi-servicio | Service discovery, Gateway |

### UI Templates

```
┌─────────────────────────────────────────────────────────────────┐
│  Quick Start with Templates                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Basic REST     │  │  Auth-Ready     │  │  Full-Stack     │  │
│  │  API            │  │  API            │  │  Admin          │  │
│  │                 │  │                 │  │                 │  │
│  │  All languages  │  │  Java, Kotlin   │  │  Java, Kotlin   │  │
│  │                 │  │  Python         │  │                 │  │
│  │  [Use Template] │  │  [Use Template] │  │  [Use Template] │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  IoT Edge       │  │  AI-Powered     │  │  Microservices  │  │
│  │  Gateway        │  │  API            │  │  Starter        │  │
│  │                 │  │                 │  │                 │  │
│  │  Rust only      │  │  Rust only      │  │  Java, Kotlin   │  │
│  │                 │  │                 │  │                 │  │
│  │  [Use Template] │  │  [Use Template] │  │  [Use Template] │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Matrix Interactiva

### Vista Matriz

```
┌─────────────────────────────────────────────────────────────────┐
│  Feature Compatibility Matrix                                    │
├─────────────────────────────────────────────────────────────────┤
│  Search: [____________] Filter by: [All Categories ▼]           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Feature          │Java│Kotlin│Python│NestJS│PHP│Go│Rust│C#    │
│  ─────────────────┼────┼──────┼──────┼──────┼───┼──┼────┼──    │
│  Security                                                       │
│  ├─ JWT Auth      │ ✓  │  ✓   │  ✓   │  ✓   │ ✓ │✓ │ ✓  │ ✓    │
│  ├─ OAuth2        │ ✓  │  ✓   │  ✓   │  ✓   │ ✓ │✓ │ ✗  │ ✓    │
│  └─ Social Login  │ ✓  │  ✓   │  ✗   │  ✓   │ ✗ │✗ │ ✗  │ ✗    │
│                                                                 │
│  Feature Pack 2025                                              │
│  ├─ Password Reset│ ✓  │  ✓   │  ✓   │  ✓   │ ✓ │✓ │ ✗  │ ✓    │
│  ├─ Mail Service  │ ✓  │  ✓   │  ✓   │  ✓   │ ✓ │✓ │ ✗  │ ✓    │
│  ├─ File Upload   │ ✓  │  ✓   │  ✓   │  ✓   │ ✓ │✓ │ ✓  │ ✓    │
│  └─ jte Templates │ ✓  │  ✓   │  ✗   │  ✗   │ ✗ │✗ │ ✗  │ ✗    │
│                                                                 │
│  Edge Computing                                                 │
│  ├─ MQTT          │ ✗  │  ✗   │  ✗   │  ✗   │ ✗ │✓ │ ✓  │ ✗    │
│  ├─ Modbus        │ ✗  │  ✗   │  ✗   │  ✗   │ ✗ │✗ │ ✓  │ ✗    │
│  └─ ONNX Runtime  │ ✗  │  ✗   │  ✗   │  ✗   │ ✗ │✗ │ ✓  │ ✗    │
│                                                                 │
│  Legend: ✓ Supported  ✗ Not available  ◐ Partial               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Criterios de Completado

### Wizard
- [ ] 4 pasos funcionan correctamente
- [ ] Navegacion back/next
- [ ] Estado persiste entre pasos
- [ ] Resumen muestra configuracion correcta
- [ ] Generacion funciona desde wizard

### Templates
- [ ] 6+ templates disponibles
- [ ] Template aplica configuracion al seleccionar
- [ ] Filtrado por lenguaje compatible
- [ ] Usuario puede modificar despues de aplicar

### Matrix
- [ ] Muestra todas las features
- [ ] Muestra todos los lenguajes
- [ ] Busqueda funciona
- [ ] Filtrado por categoria funciona
- [ ] Responsive en mobile

---

*Branches: feat/ux-wizard, feat/ux-templates, feat/ux-matrix*
*PR: Uno por iteracion o agrupado*
