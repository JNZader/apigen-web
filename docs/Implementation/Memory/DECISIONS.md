# Decisiones Arquitectonicas

> Registro de decisiones importantes del proyecto (ADR - Architecture Decision Records)

---

## Indice de Decisiones

| ID | Titulo | Estado | Fecha |
|----|--------|--------|-------|
| ADR-001 | Foundation Types First | Aceptada | 2026-01-25 |
| ADR-002 | Paralelizacion por Feature | Aceptada | 2026-01-25 |
| ADR-003 | Zod Schemas para API Types | Aceptada | 2026-01-25 |
| ADR-004 | Componentes Settings Atomicos | Aceptada | 2026-01-25 |
| ADR-005 | OpenAPI Parser Client-Side | Pendiente | 2026-01-25 |

---

## Decisiones Aceptadas

### ADR-001: Foundation Types First

**Estado:** Aceptada
**Fecha:** 2026-01-25

**Contexto:**
El plan requiere agregar soporte para 9 lenguajes y 5 features nuevas. Modificar tipos y stores en paralelo causaria merge conflicts constantes.

**Opciones Consideradas:**
1. Agregar tipos conforme se necesiten - Causaria conflicts
2. Crear todos los tipos base primero - Bloquea brevemente, pero permite paralelismo despues

**Decision:**
Crear Fase 0 (Foundation) que define TODOS los tipos nuevos antes de implementar features. Esto incluye:
- `types/target.ts` - Language/Framework selection
- `types/config/featurepack.ts` - Feature Pack 2025 configs
- `types/config/rust.ts` - Rust presets
- Actualizar `project.ts`, `projectStore.ts`, `generatorApi.ts`

**Consecuencias:**
- (+) Paralelismo sin conflicts despues de Fase 0
- (+) Tipos consistentes en todo el proyecto
- (+) API request type definido una vez
- (-) Bloqueo inicial de ~4h para completar Foundation

---

### ADR-002: Paralelizacion por Feature

**Estado:** Aceptada
**Fecha:** 2026-01-25

**Contexto:**
Con 23+ archivos nuevos a crear, desarrollo secuencial tomaria semanas. Se necesita estrategia de paralelismo.

**Decision:**
Organizar features en branches independientes que no toquen los mismos archivos:

```
Branch                    | Archivos exclusivos
--------------------------|------------------------------------
feat/feature-social       | SocialLoginSettingsForm.tsx
feat/feature-mail         | MailServiceSettingsForm.tsx
feat/feature-storage      | FileStorageSettingsForm.tsx
feat/feature-password     | PasswordResetSettingsForm.tsx
feat/feature-jte          | JteTemplatesSettingsForm.tsx
```

**Consecuencias:**
- (+) 5 features del Feature Pack pueden desarrollarse en paralelo
- (+) PRs pequenos, faciles de revisar
- (+) Rollback granular si algo falla
- (-) Requiere coordinacion para merge order

---

### ADR-003: Zod Schemas para API Types

**Estado:** Aceptada
**Fecha:** 2026-01-25

**Contexto:**
El proyecto ya usa Zod para validacion. Nuevos tipos de API necesitan validacion robusta.

**Decision:**
Crear Zod schemas en `src/api/schemas.ts` para todos los nuevos request types:
- `TargetConfigSchema`
- `SocialLoginConfigSchema`
- `MailConfigSchema`
- `StorageConfigSchema`
- `JteConfigSchema`
- `RustAxumOptionsSchema`

Los tipos TypeScript se infieren de Zod: `type TargetConfig = z.infer<typeof TargetConfigSchema>`

**Consecuencias:**
- (+) Validacion runtime garantizada
- (+) Single source of truth (Zod schema)
- (+) Errores descriptivos para el usuario
- (-) Schemas pueden ser verbosos

---

### ADR-004: Componentes Settings Atomicos

**Estado:** Aceptada
**Fecha:** 2026-01-25

**Contexto:**
ProjectSettings ya tiene 13 sub-componentes. Agregar 5+ features requiere mantener este patron.

**Decision:**
Cada nueva feature tiene su propio componente en `ProjectSettings/`:
- `SocialLoginSettingsForm.tsx`
- `MailServiceSettingsForm.tsx`
- `FileStorageSettingsForm.tsx`
- `PasswordResetSettingsForm.tsx`
- `JteTemplatesSettingsForm.tsx`
- `RustSettingsForm.tsx`

Se importan en `ProjectSettings/index.tsx` y se muestran condicionalmente.

**Consecuencias:**
- (+) Componentes pequenos (~100-200 lineas)
- (+) Facil de testear individualmente
- (+) Paralelismo sin conflicts
- (-) Mas archivos que mantener

---

### ADR-005: OpenAPI Parser Client-Side

**Estado:** Pendiente
**Fecha:** 2026-01-25

**Contexto:**
Se necesita importar OpenAPI specs. Opciones: parsear en frontend o enviar raw al backend.

**Opciones Consideradas:**
1. **Client-side parsing** - Usar `openapi-types` + `js-yaml`, convertir a EntityDesign en frontend
2. **Server-side parsing** - Enviar YAML/JSON raw, backend parsea y devuelve entidades

**Decision Pendiente:**
Preferencia inicial por client-side porque:
- Preview inmediato de schemas
- No requiere cambios en backend
- Mejor UX (validacion instantanea)

**Dependencias a agregar:**
```json
"openapi-types": "^12.1.3",
"js-yaml": "^4.1.0",
"@types/js-yaml": "^4.0.9"
```

**Consecuencias (si client-side):**
- (+) Preview instantaneo
- (+) Sin latencia de red
- (-) Bundle size aumenta ~50KB
- (-) Parser complejo (~500 lineas estimado)

---

## Decisiones Pendientes

- [ ] ADR-005: Confirmar client-side vs server-side OpenAPI parsing
- [ ] ADR-006: Wizard vs Tabs para configuracion de lenguaje
- [ ] ADR-007: Estrategia de caching para feature compatibility matrix

---

## Notas

- Crear ADR para decisiones que afecten arquitectura, stack, o patrones
- Actualizar estado si una decision se revierte o depreca
- Incluir contexto suficiente para entender la decision en el futuro

---

*Ultima actualizacion: 2026-01-25*
