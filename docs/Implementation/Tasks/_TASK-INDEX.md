# Task Index - APiGen Web Implementation

> Indice maestro de todas las tareas del plan de implementacion

---

## Resumen por Fase

| Fase | Tareas | Estado | Paralelizable |
|------|--------|--------|---------------|
| **0 - Foundation** | T-001 → T-010 | Pending | NO (blocking) |
| **1 - Language Selector** | T-011 → T-019 | Pending | NO (depende de F0) |
| **2 - Feature Pack 2025** | T-020 → T-032 | Pending | SI (5 ramas) |
| **3 - OpenAPI Import** | T-033 → T-043 | Pending | NO |
| **4 - Rust Edge** | T-044 → T-051 | Pending | NO |
| **5 - UX Improvements** | T-052 → T-061 | Pending | Parcial |

**Total: 61 tareas**

---

## Fase 0: Foundation (Blocking)

> **IMPORTANTE**: Esta fase debe completarse antes de cualquier otra.
> **Branch:** `feat/foundation-types`

| ID | Nombre | Tipo | Estimado | Dependencias |
|----|--------|------|----------|--------------|
| [[T-001]] | Target Types | Types | 1h | - |
| [[T-002]] | Rust Types | Types | 1h | T-001 |
| [[T-003]] | Go/Chi Types | Types | 1h | T-001 |
| [[T-004]] | Feature Pack Types | Types | 1.5h | T-001 |
| [[T-005]] | Update Project Types | Types | 0.5h | T-001-T-004 |
| [[T-006]] | Update Config Index | Types | 0.5h | T-005 |
| [[T-007]] | Zod Schemas | Validation | 2h | T-006 |
| [[T-008]] | Update Generator API | API | 1h | T-007 |
| [[T-009]] | Update Project Store | Store | 1.5h | T-006 |
| [[T-010]] | Update Config Builder | Utils | 1h | T-006 |

**Subtotal Fase 0: ~11h**

---

## Fase 1: Language Selector

> **Branch:** `feat/language-selector`
> **Dependencia:** Fase 0 completada

| ID | Nombre | Tipo | Estimado | Dependencias |
|----|--------|------|----------|--------------|
| [[T-011]] | LanguageSelector Component | Feature | 2.5h | Fase 0 |
| [[T-012]] | FrameworkCard Component | Feature | 1h | T-011 |
| [[T-013]] | FeatureMatrix Component | Feature | 2h | T-011 |
| [[T-014]] | Language Configs | Config | 1.5h | T-011 |
| [[T-015]] | Feature Compatibility | Config | 1h | T-014 |
| [[T-016]] | Integrate in ProjectSettings | Integration | 1h | T-011-T-015 |
| [[T-017]] | Feature Disable Logic | Logic | 1h | T-016 |
| [[T-018]] | Tests LanguageSelector | Test | 1h | T-011 |
| [[T-019]] | Tests FeatureMatrix | Test | 1h | T-013 |

**Subtotal Fase 1: ~12h**

---

## Fase 2: Feature Pack 2025

> **Paralelizable**: 5 features independientes, cada una en su branch.

### 2.1 Social Login (`feat/feature-social`)

| ID | Nombre | Tipo | Estimado |
|----|--------|------|----------|
| [[T-020]] | SocialLoginSettingsForm | Feature | 2h |
| [[T-021]] | Tests SocialLoginSettingsForm | Test | 0.5h |

### 2.2 Mail Service (`feat/feature-mail`)

| ID | Nombre | Tipo | Estimado |
|----|--------|------|----------|
| [[T-022]] | MailServiceSettingsForm | Feature | 2.5h |
| [[T-023]] | Tests MailServiceSettingsForm | Test | 0.5h |

### 2.3 File Storage (`feat/feature-storage`)

| ID | Nombre | Tipo | Estimado |
|----|--------|------|----------|
| [[T-024]] | FileStorageSettingsForm | Feature | 2.5h |
| [[T-025]] | Tests FileStorageSettingsForm | Test | 0.5h |

### 2.4 Password Reset (`feat/feature-password`)

| ID | Nombre | Tipo | Estimado |
|----|--------|------|----------|
| [[T-026]] | PasswordResetSettingsForm | Feature | 1.5h |
| [[T-027]] | Tests PasswordResetSettingsForm | Test | 0.5h |

### 2.5 JTE Templates (`feat/feature-jte`)

| ID | Nombre | Tipo | Estimado |
|----|--------|------|----------|
| [[T-028]] | JteTemplatesSettingsForm | Feature | 1.5h |
| [[T-029]] | Tests JteTemplatesSettingsForm | Test | 0.5h |

### 2.6 Integration (`feat/feature-pack-integration`)

| ID | Nombre | Tipo | Estimado |
|----|--------|------|----------|
| [[T-030]] | Integrate Feature Forms | Integration | 1h |
| [[T-031]] | Feature Pack Exports | Refactor | 0.5h |
| [[T-032]] | Integration Tests | Test | 1h |

**Subtotal Fase 2: ~15h** (ejecutable en paralelo: ~5h efectivas)

---

## Fase 3: OpenAPI Import

> **Branch:** `feat/openapi-import`

| ID | Nombre | Tipo | Estimado | Dependencias |
|----|--------|------|----------|--------------|
| [[T-033]] | OpenAPI Parser | Feature | 4h | Fase 0 |
| [[T-034]] | OpenAPI Types | Types | 1h | - |
| [[T-035]] | OpenAPI Converter | Utils | 2h | T-033 |
| [[T-036]] | OpenAPI Validator | Feature | 2h | T-034 |
| [[T-037]] | Tests Parser & Validator | Test | 2h | T-033, T-036 |
| [[T-038]] | Import Modal | Feature | 3h | T-033, T-035 |
| [[T-039]] | Import Button in Toolbar | Feature | 0.5h | T-038 |
| [[T-040]] | URL Import | Feature | 2h | T-038 |
| [[T-041]] | Tests Import Modal | Test | 2h | T-038, T-040 |
| [[T-042]] | YAML Support | Feature | 1.5h | T-033 |
| [[T-043]] | E2E Tests OpenAPI | Test | 2h | T-041, T-042 |

**Subtotal Fase 3: ~22h**

---

## Fase 4: Rust Edge

> **Branch:** `feat/rust-support`

| ID | Nombre | Tipo | Estimado | Dependencias |
|----|--------|------|----------|--------------|
| [[T-044]] | RustPresetSelector | Feature | 2h | T-002, T-011 |
| [[T-045]] | RustOptionsPanel | Feature | 2h | T-044 |
| [[T-046]] | Rust Store Slice | Feature | 1.5h | T-002, T-009 |
| [[T-047]] | Integrate Rust Settings | Integration | 1h | T-044-T-046 |
| [[T-048]] | Tests RustPresetSelector | Test | 1h | T-044 |
| [[T-049]] | Tests RustOptionsPanel | Test | 1h | T-045 |
| [[T-050]] | Tests Rust Store Slice | Test | 1h | T-046 |
| [[T-051]] | E2E Rust Configuration | Test | 2h | T-047 |

**Subtotal Fase 4: ~11.5h**

---

## Fase 5: UX Improvements

> **Branch:** `feat/ux-improvements` (o branches separados por feature)

| ID | Nombre | Tipo | Estimado | Dependencias |
|----|--------|------|----------|--------------|
| [[T-052]] | ProjectWizard Component | Feature | 4h | Fase 1 |
| [[T-053]] | Wizard Steps Components | Feature | 2h | T-052 |
| [[T-054]] | Wizard Integration | Integration | 1h | T-053 |
| [[T-055]] | Project Templates System | Feature | 3h | T-054 |
| [[T-056]] | TemplateSelector UI | Feature | 2h | T-055 |
| [[T-057]] | Tests Wizard | Test | 2h | T-054 |
| [[T-058]] | Keyboard Shortcuts Docs | Feature | 1.5h | - |
| [[T-059]] | Empty States | Feature | 1.5h | - |
| [[T-060]] | Loading States | Feature | 1h | - |
| [[T-061]] | E2E Wizard & UX | Test | 2h | T-057 |

**Subtotal Fase 5: ~20h**

---

## Estimacion Total

| Fase | Estimado | Acumulado |
|------|----------|-----------|
| Fase 0 | 11h | 11h |
| Fase 1 | 12h | 23h |
| Fase 2 | 5h* | 28h |
| Fase 3 | 22h | 50h |
| Fase 4 | 11.5h | 61.5h |
| Fase 5 | 20h | 81.5h |

**\* Fase 2 ejecutable en paralelo**

**Total estimado: ~81.5h de desarrollo**

---

## Grafico de Dependencias

```
Fase 0 (Foundation) ─────────────────────────────────────┐
    │                                                     │
    ├── T-001 ──┬── T-002 ─── T-044 (Rust Edge)         │
    │           ├── T-003                                │
    │           ├── T-004                                │
    │           └── T-005 ── T-006 ──┬── T-007 ── T-008 │
    │                                │                   │
    │                                ├── T-009 ── T-046  │
    │                                └── T-010           │
    │                                                     │
    └── Fase 1 (Language Selector) ──────────────────────┤
            │                                             │
            ├── T-011 ──┬── T-012                        │
            │           ├── T-013 ── T-019               │
            │           └── T-018                        │
            │                                             │
            ├── T-014 ── T-015 ── T-016 ── T-017        │
            │                                             │
            └── T-052 (Wizard) ── T-053 ── T-054        │
                                                          │
    Fase 2 (Feature Pack) ← paralelo ─────────────────────┤
            │                                             │
            ├── T-020/T-021 (Social Login)               │
            ├── T-022/T-023 (Mail Service)               │
            ├── T-024/T-025 (File Storage)               │
            ├── T-026/T-027 (Password Reset)             │
            ├── T-028/T-029 (JTE Templates)              │
            └── T-030/T-031/T-032 (Integration)          │
                                                          │
    Fase 3 (OpenAPI Import) ──────────────────────────────┤
            │                                             │
            ├── T-033 ──┬── T-035 ── T-038 ── T-039     │
            │           └── T-042                        │
            ├── T-034 ── T-036 ── T-037                  │
            └── T-040 ── T-041 ── T-043                  │
                                                          │
    Fase 4 (Rust Edge) ───────────────────────────────────┤
            │                                             │
            ├── T-044 ── T-045 ── T-047 ── T-051        │
            ├── T-046 ── T-050                           │
            └── T-048, T-049                             │
                                                          │
    Fase 5 (UX) ──────────────────────────────────────────┘
            │
            ├── T-055 ── T-056
            ├── T-057 ── T-061
            └── T-058, T-059, T-060 (independientes)
```

---

## Filtros Rapidos

### Por Tipo
- **Types**: T-001, T-002, T-003, T-004, T-005, T-006, T-034
- **Feature**: T-011, T-012, T-013, T-020, T-022, T-024, T-026, T-028, T-033, T-035, T-036, T-038, T-039, T-040, T-042, T-044, T-045, T-046, T-052, T-053, T-055, T-056, T-058, T-059, T-060
- **Config**: T-014, T-015
- **Integration**: T-016, T-030, T-047, T-054
- **Test**: T-018, T-019, T-021, T-023, T-025, T-027, T-029, T-032, T-037, T-041, T-043, T-048, T-049, T-050, T-051, T-057, T-061
- **Validation**: T-007
- **API**: T-008
- **Store**: T-009
- **Utils**: T-010
- **Refactor**: T-031
- **Logic**: T-017

### Por Prioridad de Ejecucion
1. **Criticas (Blocking)**: T-001 → T-010
2. **Alta (Core Features)**: T-011 → T-019, T-033 → T-038
3. **Media (Feature Pack)**: T-020 → T-032
4. **Normal (Edge Cases)**: T-044 → T-051
5. **Baja (Polish)**: T-052 → T-061

---

## Recomendacion de Orden de Ejecucion

### Developer Solo
1. **Fase 0** - Foundation (11h) - OBLIGATORIO primero
2. **Fase 1** - Language Selector (12h)
3. **Fase 2** - Feature Pack (5h paralelo o 15h secuencial)
4. **Fase 3** - OpenAPI Import (22h)
5. **Fase 4** - Rust Edge (11.5h)
6. **Fase 5** - UX Improvements (20h)

### Equipo (2-3 developers)
**Semana 1:**
- Dev A: Fase 0 completa
- Dev B/C: Esperan o preparan entorno

**Semana 2-3:**
- Dev A: Fase 1
- Dev B: Fase 2.1 + 2.2 + 2.3
- Dev C: Fase 2.4 + 2.5 + 2.6

**Semana 4:**
- Dev A: Fase 3
- Dev B: Fase 4
- Dev C: Fase 5

---

#index #tasks #implementation

Actualizado: 2025-01-25
