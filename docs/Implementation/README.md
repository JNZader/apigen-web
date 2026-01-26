# Plan de Implementacion - APiGen-Web Multi-Language

> **Version:** 1.0
> **Fecha:** 2026-01-25
> **Objetivo:** Llevar paridad frontend-backend de 11% a 100%

---

## Resumen Ejecutivo

Este plan implementa soporte completo para los **9 lenguajes/frameworks** y **5 features del Feature Pack 2025** que el backend apigen v2.18.0 soporta pero que no estan expuestos en el frontend.

### Metricas Objetivo

| Categoria | Actual | Objetivo | Incremento |
|-----------|--------|----------|------------|
| Lenguajes soportados | 1 | 9 | +800% |
| Feature Pack 2025 | 0 | 5 | +5 features |
| Inputs soportados | SQL | SQL + OpenAPI | +1 formato |
| Presets Rust Edge | 0 | 4 | +4 presets |

### Tiempo Estimado Total

| Escenario | Tiempo |
|-----------|--------|
| Developer Solo | 34-45 horas |
| 2 Developers Paralelo | 18-24 horas |
| 3 Developers Paralelo | 12-16 horas |

---

## Estructura del Plan

```
docs/Implementation/
├── README.md                    ← Este archivo (punto de entrada)
├── Memory/
│   ├── CONTEXT.md               ← Contexto del proyecto
│   ├── DECISIONS.md             ← Decisiones arquitectonicas (ADR)
│   └── BLOCKERS.md              ← Problemas encontrados
├── Phases/
│   ├── 00-FOUNDATION.md         ← Tipos base (BLOQUEANTE)
│   ├── 01-LANGUAGE-SELECTOR.md  ← Selector de lenguaje
│   ├── 02-FEATURE-PACK.md       ← Feature Pack 2025
│   ├── 03-OPENAPI-IMPORT.md     ← Import OpenAPI
│   ├── 04-RUST-EDGE.md          ← Rust Edge Computing
│   └── 05-UX-IMPROVEMENTS.md    ← Mejoras de UX
└── Tasks/
    ├── _TASK-INDEX.md           ← Indice de todas las tareas
    ├── T-001-target-types.md    ← Tarea detallada
    ├── T-004-featurepack-types.md
    ├── T-007-zod-schemas.md
    ├── T-011-language-selector.md
    ├── T-020-social-login-form.md
    └── ... (61 tareas total)
```

---

## Fases de Implementacion

### Fase 0: Foundation (CRITICA - BLOQUEANTE)

> **Duracion:** 4-6 horas
> **Branch:** `feat/foundation-types`

Crea la base de tipos y schemas que permite paralelizar el resto del trabajo.

**Archivos clave:**
- `src/types/target.ts` - Lenguajes y frameworks
- `src/types/config/featurepack.ts` - Feature Pack 2025
- `src/api/schemas.ts` - Validacion Zod
- `src/store/projectStore.ts` - State management

**IMPORTANTE:** Esta fase debe completarse ANTES de cualquier otra.

---

### Fase 1: Language Selector

> **Duracion:** 6-8 horas
> **Branch:** `feat/language-selector`
> **Dependencia:** Fase 0

Permite seleccionar entre 9 lenguajes/frameworks:

| Lenguaje | Framework | Version |
|----------|-----------|---------|
| Java | Spring Boot | 4.x |
| Kotlin | Spring Boot | 4.x |
| Python | FastAPI | 0.128.0 |
| TypeScript | NestJS | 11.x |
| PHP | Laravel | 12.0 |
| Go | Gin | 1.10.x |
| Go | Chi | 5.2.x |
| Rust | Axum | 0.8.x |
| C# | ASP.NET Core | 8.x |

---

### Fase 2: Feature Pack 2025

> **Duracion:** 10-12 horas
> **Branches:** Multiples (paralelas)
> **Dependencia:** Fase 0

5 features completamente paralelizables:

| Feature | Branch | Componente |
|---------|--------|------------|
| Social Login | `feat/feature-social` | SocialLoginSettingsForm |
| Mail Service | `feat/feature-mail` | MailServiceSettingsForm |
| File Storage | `feat/feature-storage` | FileStorageSettingsForm |
| Password Reset | `feat/feature-password` | PasswordResetSettingsForm |
| jte Templates | `feat/feature-jte` | JteTemplatesSettingsForm |

---

### Fase 3: OpenAPI Import

> **Duracion:** 6-8 horas
> **Branch:** `feat/openapi-import`
> **Dependencia:** Fase 0 (parcial)

Agrega capacidad de importar schemas desde OpenAPI YAML/JSON.

**Dependencias NPM nuevas:**
```json
{
  "openapi-types": "^12.1.3",
  "js-yaml": "^4.1.0"
}
```

---

### Fase 4: Rust Edge Computing

> **Duracion:** 4-5 horas
> **Branch:** `feat/rust-presets`
> **Dependencia:** Fase 1

4 presets para edge computing:

| Preset | Use Case | Features |
|--------|----------|----------|
| Cloud | Cloud-native API | PostgreSQL, Redis, JWT, OpenTelemetry |
| Edge Gateway | IoT Gateway | MQTT, Modbus, Serial |
| Edge Anomaly | Anomaly Detection | SQLite, MQTT, ndarray |
| Edge AI | ML at Edge | ONNX, tokenizers |

---

### Fase 5: UX Improvements

> **Duracion:** 4-6 horas
> **Branch:** `feat/ux-*`
> **Dependencia:** Fases 1, 2, 4

- Wizard de generacion paso a paso
- Templates predefinidos
- Matriz de compatibilidad interactiva

---

## Estrategia de Paralelizacion

### Grafo de Dependencias

```
                    FASE 0 (Foundation)
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    FASE 1            FASE 2.x           FASE 3
  (Language)      (Feature Pack)       (OpenAPI)
         │         5 branches              │
         │          paralelas              │
         └────────────┬────────────────────┘
                      │
                      ▼
                   FASE 4
                (Rust Edge)
                      │
                      ▼
                   FASE 5
                    (UX)
```

### Branches Sin Conflicto

Despues de Fase 0, estas branches pueden trabajarse simultaneamente:

```bash
# Developer A
feat/language-selector        # Fase 1

# Developer B
feat/feature-social           # Fase 2.1
feat/feature-mail             # Fase 2.2

# Developer C
feat/feature-storage          # Fase 2.3
feat/feature-password         # Fase 2.4
feat/feature-jte              # Fase 2.5

# Developer D
feat/openapi-import           # Fase 3
```

---

## Comandos de Desarrollo

```bash
# Crear nueva feature branch
git checkout -b feat/feature-xxx master

# Desarrollo
npm run dev

# Verificar calidad (OBLIGATORIO antes de commit)
npm run check:fix && npm run test:run && gga run

# Solo si TODO pasa, hacer commit
git add .
git commit -m "feat(scope): descripcion"

# Push y PR
git push -u origin feat/feature-xxx
gh pr create --title "feat: xxx" --body "..."
```

> **IMPORTANTE:** Ver [[WORKFLOW-PRECOMMIT]] para el flujo completo de verificacion pre-commit con GGA.

---

## Criterios de Aceptacion Global

### Por Fase

- [ ] Todos los tipos compilan sin errores (`npm run build`)
- [ ] Tests pasan (>80% cobertura nuevos componentes)
- [ ] `npm run check` sin errores
- [ ] `gga run` - STATUS: PASSED
- [ ] PR revisado y aprobado
- [ ] Documentacion actualizada

### Final

- [ ] 9 lenguajes seleccionables
- [ ] 5 features del Feature Pack configurables
- [ ] Import OpenAPI funcional
- [ ] 4 presets Rust configurables
- [ ] Wizard de generacion funcional (opcional)
- [ ] Sin regresiones en funcionalidad existente

---

## Archivos Clave de Referencia

| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `src/types/project.ts` | 348 | Tipos de proyecto (modificar) |
| `src/store/projectStore.ts` | ~200 | Store principal (modificar) |
| `src/api/schemas.ts` | ~200 | Schemas Zod (modificar) |
| `src/components/ProjectSettings/index.tsx` | 203 | Settings tabs (modificar) |
| `src/pages/DesignerPage.tsx` | 408 | Pagina principal |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigacion |
|--------|--------------|------------|
| Merge conflicts | Alta | Foundation first, branches independientes |
| Backend incompatible | Media | Verificar endpoints antes de UI |
| Bundle size | Media | Lazy loading para OpenAPI parser |
| UX compleja | Alta | Wizard paso a paso, presets |

---

## Como Empezar

1. **Lee** `Memory/CONTEXT.md` para entender el proyecto
2. **Revisa** `Memory/DECISIONS.md` para decisiones tomadas
3. **Consulta** `Tasks/_TASK-INDEX.md` para ver todas las tareas
4. **Empieza** con Fase 0 - es bloqueante
5. **Actualiza** el estado de tareas conforme avances

---

## Contacto

- **Repositorio:** github.com/[user]/apigen-web
- **Backend Plan:** `../APIGEN-WEB-IMPLEMENTATION-PLAN.md`
- **Produccion:** https://apigen-studio.vercel.app

---

*Plan creado: 2026-01-25*
*Ultima actualizacion: 2026-01-25*
