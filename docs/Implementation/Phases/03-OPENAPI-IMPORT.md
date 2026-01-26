# Fase 3: OpenAPI Import

> **Prioridad:** MEDIA
> **Duracion estimada:** 6-8 horas
> **Paralelizable:** SI - Independiente de Fase 1 y 2
> **Dependencia:** Fase 0 completada (parcial - no requiere tipos de target/features)

---

## Objetivo

Permitir importar schemas desde archivos OpenAPI (YAML/JSON) ademas de SQL, convirtiendo los schemas a EntityDesign para usar en el canvas.

---

## Iteraciones

### Iteracion 3.1: Parser y Utilidades

| Tarea | Branch | Dependencia | Paralelo con |
|-------|--------|-------------|--------------|
| [[T-033]] Crear openApiParser.ts | feat/openapi-import | - | T-034 |
| [[T-034]] Crear openApiTypeMapper.ts | feat/openapi-import | - | T-033 |
| [[T-035]] Crear openApiConverter.ts | feat/openapi-import | T-033, T-034 | - |
| [[T-036]] Tests unitarios utilidades | feat/openapi-import | T-033-T-035 | - |

### Iteracion 3.2: Componentes UI

| Tarea | Branch | Dependencia | Paralelo con |
|-------|--------|-------------|--------------|
| [[T-037]] Crear OpenApiImportModal.tsx | feat/openapi-import | T-035 | T-038 |
| [[T-038]] Crear SchemaPreview.tsx | feat/openapi-import | T-035 | T-037 |
| [[T-039]] Crear ImportOptions.tsx | feat/openapi-import | - | T-037, T-038 |
| [[T-040]] Tests componentes | feat/openapi-import | T-037-T-039 | - |

### Iteracion 3.3: Integracion

| Tarea | Branch | Dependencia |
|-------|--------|-------------|
| [[T-041]] Refactorizar SqlImportExport → SchemaImportExport | feat/openapi-import | T-037 |
| [[T-042]] Agregar tab OpenAPI en modal | feat/openapi-import | T-041 |
| [[T-043]] Tests de integracion | feat/openapi-import | T-041, T-042 |

---

## Dependencias NPM a Agregar

```json
{
  "openapi-types": "^12.1.3",
  "js-yaml": "^4.1.0",
  "@types/js-yaml": "^4.0.9"
}
```

---

## Archivos a Crear

```
src/utils/
├── openApiParser.ts             ← Parse YAML/JSON (~200 lineas)
├── openApiTypeMapper.ts         ← Mapeo tipos OpenAPI → Java/TS (~150 lineas)
├── openApiConverter.ts          ← OpenAPI → EntityDesign (~300 lineas)
├── openApiParser.test.ts
├── openApiTypeMapper.test.ts
└── openApiConverter.test.ts

src/components/OpenApiImport/
├── index.ts                     ← Re-exports
├── OpenApiImportModal.tsx       ← Modal principal (~200 lineas)
├── SchemaPreview.tsx            ← Vista previa de schemas (~150 lineas)
├── ImportOptions.tsx            ← Opciones de import (~100 lineas)
├── OpenApiImportModal.test.tsx
└── SchemaPreview.test.tsx
```

## Archivos a Modificar

```
src/components/
├── SqlImportExport.tsx          ← Renombrar a SchemaImportExport.tsx
└── (o crear wrapper con tabs)

src/pages/
└── DesignerPage.tsx             ← Actualizar referencia si cambia nombre
```

---

## Logica de Conversion

### OpenAPI Schema → EntityDesign

```typescript
// Ejemplo input OpenAPI
{
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "format": "int64" },
          "email": { "type": "string", "format": "email" },
          "name": { "type": "string", "maxLength": 100 },
          "createdAt": { "type": "string", "format": "date-time" }
        },
        "required": ["id", "email", "name"]
      }
    }
  }
}

// Output EntityDesign
{
  name: "User",
  tableName: "users",
  fields: [
    { name: "id", type: "Long", isPrimaryKey: true, isNullable: false },
    { name: "email", type: "String", isNullable: false, validations: { email: true } },
    { name: "name", type: "String", isNullable: false, validations: { maxLength: 100 } },
    { name: "createdAt", type: "LocalDateTime", isNullable: true }
  ]
}
```

### Type Mapping Table

| OpenAPI Type | OpenAPI Format | Java Type | TypeScript Type |
|--------------|----------------|-----------|-----------------|
| integer | int32 | Integer | number |
| integer | int64 | Long | number |
| number | float | Float | number |
| number | double | Double | number |
| string | - | String | string |
| string | date | LocalDate | Date |
| string | date-time | LocalDateTime | Date |
| string | email | String | string |
| string | uuid | UUID | string |
| boolean | - | Boolean | boolean |
| array | - | List<T> | T[] |

---

## UI/UX Esperado

### SchemaImportExport Tabs

```
┌─────────────────────────────────────────────────────────────┐
│  Import Schema                                               │
├──────────────────┬──────────────────┬───────────────────────┤
│   [  SQL  ]      │   [ OpenAPI ]    │   [ JSON Schema ]     │
├──────────────────┴──────────────────┴───────────────────────┤
│                                                             │
│  Upload OpenAPI Spec:                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │        Drop YAML or JSON file here                  │    │
│  │              or click to browse                     │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Or paste content:                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ openapi: 3.0.0                                      │    │
│  │ info:                                               │    │
│  │   title: My API                                     │    │
│  │ components:                                         │    │
│  │   schemas:                                          │    │
│  │     ...                                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Parse] [Cancel]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Schema Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Preview: 3 schemas found                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [x] User (5 fields)                                        │
│      └── id: Long (PK)                                      │
│      └── email: String (required)                           │
│      └── name: String (required)                            │
│      └── role: String (nullable)                            │
│      └── createdAt: LocalDateTime                           │
│                                                             │
│  [x] Product (4 fields)                                     │
│      └── id: Long (PK)                                      │
│      └── name: String (required)                            │
│      └── price: BigDecimal (required)                       │
│      └── category: String                                   │
│                                                             │
│  [ ] ErrorResponse (2 fields) - Skip                        │
│      └── code: Integer                                      │
│      └── message: String                                    │
│                                                             │
│  [Import Selected] [Cancel]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Manejo de $ref

```typescript
// Input con referencias
{
  "components": {
    "schemas": {
      "Order": {
        "properties": {
          "items": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/OrderItem" }
          }
        }
      },
      "OrderItem": {
        "properties": {
          "product": { "$ref": "#/components/schemas/Product" }
        }
      }
    }
  }
}

// Resolver referencias antes de conversion
// 1. Construir mapa de schemas
// 2. Resolver $ref recursivamente
// 3. Detectar relaciones (OneToMany, ManyToOne)
```

---

## Criterios de Completado

- [ ] Import de OpenAPI YAML funciona
- [ ] Import de OpenAPI JSON funciona
- [ ] Referencias ($ref) se resuelven correctamente
- [ ] Preview muestra schemas detectados
- [ ] Usuario puede seleccionar cuales importar
- [ ] Entidades se agregan al canvas
- [ ] Relaciones se detectan automaticamente (si hay $ref)
- [ ] Tests pasan (>80% cobertura)
- [ ] npm run check sin errores

---

## Casos Edge

1. **Circular references:** Detectar y advertir
2. **allOf/oneOf/anyOf:** Soportar composicion basica
3. **Enums:** Convertir a validacion o tipo separado
4. **Nested objects:** Crear entidades relacionadas
5. **Arrays sin tipo:** Advertir y permitir override manual

---

## Notas de Implementacion

### Lazy Loading

Para evitar aumentar bundle size, usar import dinamico:

```typescript
// En OpenApiImportModal.tsx
const parseOpenApi = async (content: string) => {
  const yaml = await import('js-yaml');
  const parsed = yaml.load(content);
  // ...
};
```

### Validacion

Usar Zod para validar estructura OpenAPI:

```typescript
const OpenApiSchemaPropertySchema = z.object({
  type: z.string().optional(),
  format: z.string().optional(),
  $ref: z.string().optional(),
  items: z.lazy(() => OpenApiSchemaPropertySchema).optional(),
  // ...
});
```

---

*Branch: feat/openapi-import*
*PR: Crear despues de completar todas las tareas*
