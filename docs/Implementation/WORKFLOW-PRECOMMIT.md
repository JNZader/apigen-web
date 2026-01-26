# Workflow Pre-Commit - Verificacion Obligatoria

> **IMPORTANTE**: Este workflow debe ejecutarse ANTES de cada commit para garantizar calidad de codigo.

---

## Resumen Rapido

```bash
# Ejecutar en orden:
npm run check:fix && npm run test:run && gga run
```

Si todo pasa, proceder con el commit. Si algo falla, corregir primero.

---

## Pasos Detallados

### 1. Verificar Tipos TypeScript

```bash
npm run build
```

**Que verifica:**
- Errores de tipos
- Imports incorrectos
- Props faltantes en componentes

**Si falla:**
- Revisar errores de tipo indicados
- Verificar imports y exports
- Asegurar que las interfaces estan correctas

---

### 2. Lint y Formato con Biome

```bash
# Solo verificar
npm run check

# Verificar y corregir automaticamente
npm run check:fix
```

**Que verifica:**
- Reglas de linting (unused vars, etc.)
- Formato de codigo consistente
- Imports ordenados

**Si falla:**
- Ejecutar `npm run check:fix` para auto-corregir
- Revisar errores que requieren correccion manual

---

### 3. Ejecutar Tests

```bash
# Tests una sola vez
npm run test:run

# Con cobertura (opcional)
npm run test:coverage
```

**Que verifica:**
- Tests unitarios pasan
- No hay regresiones

**Si falla:**
- Revisar tests que fallan
- Actualizar tests si el comportamiento cambio intencionalmente
- NO deshabilitar tests sin razon valida

---

### 4. Code Review con GGA (Gentleman Guardian Angel)

```bash
# Revisar archivos staged
gga run
```

**Que verifica:**
- Codigo cumple con reglas de `AGENTS.md`
- No hay patrones problematicos
- Cumple con estandares del proyecto

**Si falla (STATUS: FAILED):**
- Leer las violaciones indicadas
- Corregir cada issue reportado
- Volver a ejecutar `gga run`

**Si pasa (STATUS: PASSED):**
- Proceder con el commit

---

## Checklist Completo

Antes de `git commit`, verificar:

- [ ] `npm run build` - Sin errores de tipos
- [ ] `npm run check:fix` - Lint/formato aplicado
- [ ] `npm run test:run` - Todos los tests pasan
- [ ] `gga run` - Code review aprobado (STATUS: PASSED)

---

## Comandos de Commit

Solo despues de que TODO pase:

```bash
# Stage archivos
git add <archivos>

# Commit con mensaje convencional
git commit -m "feat(scope): descripcion"

# Push a GitHub
git push origin <branch>
```

---

## Bypass (Solo Emergencias)

En casos extremos donde necesitas commitear sin verificacion:

```bash
git commit --no-verify -m "wip: trabajo en progreso"
```

> **ADVERTENCIA**: Usar con precaucion. El CI fallara si hay errores.

---

## Configuracion de GGA

Si GGA no esta configurado en el proyecto:

```bash
# Instalar GGA
brew install gentleman-programming/tap/gga

# Inicializar en el proyecto
gga init

# Instalar hook pre-commit (opcional, ejecuta automaticamente)
gga install
```

Archivo `.gga` ya configurado:
```bash
PROVIDER="claude"
FILE_PATTERNS="*.ts,*.tsx"
EXCLUDE_PATTERNS="*.test.ts,*.test.tsx,*.d.ts"
RULES_FILE="AGENTS.md"
STRICT_MODE="true"
```

---

## Troubleshooting

### "gga: command not found"

```bash
# Instalar via Homebrew
brew install gentleman-programming/tap/gga

# O manual
git clone https://github.com/Gentleman-Programming/gentleman-guardian-angel.git
cd gentleman-guardian-angel && ./install.sh
```

### "Provider not found"

Asegurar que Claude CLI esta instalado:
```bash
which claude
# Si no existe, instalar desde https://claude.ai/code
```

### Tests fallan por timeout

```bash
# Aumentar timeout en vitest.config.ts o ejecutar con mas tiempo
npm run test:run -- --timeout=10000
```

---

## Integracion con Tareas

Cada tarea en `docs/Implementation/Tasks/` debe seguir este workflow antes de marcar como completada.

**Criterio de completado incluye:**
- Codigo implementado
- Tests escritos
- **Pre-commit checklist pasado** (este documento)
- PR creado

---

#workflow #precommit #gga #biome #testing
