# Contexto del Proyecto - APiGen-Web Multi-Language Implementation

> Este archivo mantiene el contexto persistente del proyecto para sesiones futuras

---

## Descripcion del Proyecto

**APiGen Studio** es una aplicacion web frontend que permite disenar visualmente APIs REST y arquitecturas de microservicios. Actualmente solo genera Java/Spring Boot, pero el backend soporta **9 lenguajes/frameworks**. Este plan implementa paridad completa.

### Metricas de Paridad Actual

| Categoria | Backend | Frontend | Paridad |
|-----------|---------|----------|---------|
| Lenguajes soportados | 9 | 1 | 11% |
| Feature Pack 2025 | 5 features | 0 | 0% |
| Inputs soportados | SQL + OpenAPI | SQL | 50% |
| Presets Rust Edge | 4 | 0 | 0% |

### Objetivo

Llevar paridad de **11% a 100%** implementando:
1. Selector de 9 lenguajes/frameworks
2. Feature Pack 2025 completo
3. Import de OpenAPI
4. Presets Rust Edge Computing

### Estructura Principal

```
src/
├── api/                    ← Cliente HTTP y schemas Zod
├── components/             ← Componentes React
│   ├── canvas/             ← Canvas visual (React Flow)
│   ├── ProjectSettings/    ← 13 sub-componentes (ya refactorizado)
│   └── ...
├── hooks/                  ← Custom React hooks
├── store/                  ← Zustand stores (8 stores)
├── types/                  ← Tipos TypeScript
│   └── config/             ← 10 archivos de configuracion
└── utils/                  ← Utilidades
```

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|------------|---------|
| Framework | React | 19.2.0 |
| Lenguaje | TypeScript | 5.9.3 |
| Build | Vite | 7.2.4 |
| UI | Mantine | 8.3.12 |
| State | Zustand | 5.0.10 |
| Canvas | React Flow | 12.10.0 |
| Validation | Zod | 4.3.5 |
| Testing | Vitest + Playwright | 4.0.17 / 1.57.0 |

---

## Estado Actual

### Fase: Pre-Implementation
### Tarea Actual: Ninguna
### Branch Activo: master

---

## Decisiones Importantes

1. **Arquitectura de tipos modular:** Crear tipos en `types/config/` para cada feature
2. **Componentes atomicos:** Un componente por configuracion en `ProjectSettings/`
3. **Paralelizacion por dominio:** Features independientes en branches separadas
4. **Foundation first:** Tipos base antes de componentes
5. **DX Priority:** Tests y lint en cada PR, no bloquean desarrollo

> Ver [[Memory/DECISIONS]] para ADRs completos

---

## Archivos Clave

- `src/types/project.ts` - Tipos de configuracion del proyecto (348 lineas)
- `src/store/projectStore.ts` - Store principal (~200 lineas)
- `src/api/generatorApi.ts` - API de generacion
- `src/components/ProjectSettings/index.tsx` - Settings orquestador
- `src/pages/DesignerPage.tsx` - Pagina principal (408 lineas)

---

## Contactos / Recursos

| Recurso | Link/Contacto |
|---------|---------------|
| Repositorio | github.com/[user]/apigen-web |
| Produccion | https://apigen-studio.vercel.app |
| Backend API | https://alright-iormina-jnz-d5f41c2c.koyeb.app |
| Backend Plan | ../APIGEN-WEB-IMPLEMENTATION-PLAN.md |

---

## Estrategia de Paralelizacion

### Branches Paralelas Sin Conflicto

```
master
  ├── feat/foundation-types     ← Fase 0 (PRIMERO - bloquea todo)
  │
  │   (Despues de merge de foundation-types)
  │
  ├── feat/language-selector    ← Fase 1.1
  ├── feat/feature-social       ← Fase 2.1
  ├── feat/feature-mail         ← Fase 2.2 (paralela a 2.1)
  ├── feat/feature-storage      ← Fase 2.3 (paralela a 2.1, 2.2)
  ├── feat/feature-password     ← Fase 2.4 (paralela)
  ├── feat/feature-jte          ← Fase 2.5 (paralela)
  │
  │   (Despues de merge de language-selector)
  │
  ├── feat/rust-presets         ← Fase 4 (depende de language-selector)
  ├── feat/openapi-import       ← Fase 3 (independiente)
  │
  └── feat/ux-wizard            ← Fase 5 (al final)
```

### Regla de Oro

**Archivos que NO deben tocarse en paralelo:**
- `src/types/project.ts` - Solo en Fase 0
- `src/store/projectStore.ts` - Solo en Fase 0
- `src/api/generatorApi.ts` - Solo en Fase 0

**Archivos SEGUROS para paralelo:**
- Cada `ProjectSettings/*Form.tsx` es independiente
- Cada `types/config/*.ts` es independiente
- Componentes nuevos en carpetas nuevas

---

## Como Usar Este Contexto

Cuando inicies una nueva sesion:

1. Lee este archivo para recordar el estado
2. Revisa [[Memory/BLOCKERS]] para issues pendientes
3. Consulta [[Memory/DECISIONS]] para decisiones tomadas
4. Verifica que branch corresponde a tu tarea
5. Actualiza este archivo al final de cada sesion

---

*Ultima actualizacion: 2026-01-25*
