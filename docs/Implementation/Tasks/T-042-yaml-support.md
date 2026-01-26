# T-042: Agregar Soporte YAML

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.6 YAML

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-042 |
| **Tipo** | Feature |
| **Estimado** | 1.5h |
| **Dependencias** | [[T-033]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Agregar soporte para parsing de documentos OpenAPI en formato YAML.

---

## Tareas

- [ ] Instalar dependencia `js-yaml`
- [ ] Modificar parser para detectar formato
- [ ] Agregar tests para YAML

---

## Dependencias a Instalar

```bash
npm install js-yaml
npm install -D @types/js-yaml
```

---

## Archivos a Modificar

```
src/utils/
└── openApiParser.ts  ← MODIFICAR (agregar YAML parsing)
```

---

## Codigo de Referencia

```typescript
// Agregar en openApiParser.ts

import * as yaml from 'js-yaml';

// Modificar parseContent:
private parseContent(content: string): OpenApiDocument {
  const trimmed = content.trim();

  // Detect format
  if (trimmed.startsWith('{')) {
    // JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  } else {
    // YAML
    try {
      const doc = yaml.load(content) as OpenApiDocument;
      if (!doc || typeof doc !== 'object') {
        throw new Error('YAML did not produce a valid object');
      }
      return doc;
    } catch (e) {
      throw new Error(`Invalid YAML: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }
}

// Agregar funcion de deteccion de formato:
export function detectFormat(content: string): 'json' | 'yaml' {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  return 'yaml';
}
```

---

## Tests Adicionales

```typescript
// Agregar en openApiParser.test.ts

describe('YAML parsing', () => {
  it('parses YAML document', () => {
    const yamlDoc = `
openapi: '3.0.0'
info:
  title: Test API
  version: '1.0.0'
components:
  schemas:
    User:
      type: object
      properties:
        name:
          type: string
`;

    const result = parser.parse(yamlDoc);

    expect(result.projectName).toBe('TestAPI');
    expect(result.entities).toHaveLength(1);
  });

  it('handles YAML with anchors', () => {
    const yamlDoc = `
openapi: '3.0.0'
info:
  title: Test API
  version: '1.0.0'
components:
  schemas:
    Base: &base
      type: object
      properties:
        id:
          type: integer
    User:
      <<: *base
      properties:
        name:
          type: string
`;

    const result = parser.parse(yamlDoc);
    expect(result.entities).toBeDefined();
  });

  it('throws on invalid YAML', () => {
    const invalidYaml = `
openapi: 3.0.0
info:
  title: Test
  - invalid
`;

    expect(() => parser.parse(invalidYaml)).toThrow(/Invalid YAML/);
  });
});

describe('detectFormat', () => {
  it('detects JSON', () => {
    expect(detectFormat('{"openapi": "3.0.0"}')).toBe('json');
    expect(detectFormat('  { "openapi": "3.0.0" }')).toBe('json');
  });

  it('detects YAML', () => {
    expect(detectFormat('openapi: 3.0.0')).toBe('yaml');
    expect(detectFormat('---\nopenapi: 3.0.0')).toBe('yaml');
  });
});
```

---

## Criterios de Completado

- [ ] js-yaml instalado
- [ ] Parser detecta formato automaticamente
- [ ] YAML con anchors funciona
- [ ] Tests pasan
- [ ] `npm run check` pasa

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

#task #fase-3 #feature #pending

[[T-033]] → [[T-042]] → [[T-043]] | [[Phases/03-OPENAPI-IMPORT]]
