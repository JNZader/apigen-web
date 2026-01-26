# T-034: Crear Tipos para OpenAPI

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.1 Parser Core

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-034 |
| **Tipo** | Types |
| **Estimado** | 1h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Crear tipos TypeScript para documentos OpenAPI y resultados del parser.

---

## Archivos a Crear

```
src/types/
└── openapi.ts  ← CREAR (~150 lineas)
```

---

## Codigo de Referencia

```typescript
// src/types/openapi.ts

/**
 * OpenAPI 3.x Document types
 */
export interface OpenApiDocument {
  openapi: string;
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths?: Record<string, OpenApiPathItem>;
  components?: OpenApiComponents;
  tags?: OpenApiTag[];
}

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface OpenApiServer {
  url: string;
  description?: string;
  variables?: Record<string, {
    default: string;
    enum?: string[];
    description?: string;
  }>;
}

export interface OpenApiTag {
  name: string;
  description?: string;
}

export interface OpenApiPathItem {
  summary?: string;
  description?: string;
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  patch?: OpenApiOperation;
  delete?: OpenApiOperation;
  options?: OpenApiOperation;
  head?: OpenApiOperation;
  parameters?: OpenApiParameter[];
}

export interface OpenApiOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
  deprecated?: boolean;
  security?: Array<Record<string, string[]>>;
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: OpenApiSchema;
  style?: string;
  explode?: boolean;
}

export interface OpenApiRequestBody {
  description?: string;
  content: Record<string, OpenApiMediaType>;
  required?: boolean;
}

export interface OpenApiResponse {
  description: string;
  headers?: Record<string, OpenApiHeader>;
  content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiHeader {
  description?: string;
  required?: boolean;
  schema?: OpenApiSchema;
}

export interface OpenApiMediaType {
  schema?: OpenApiSchema;
  example?: unknown;
  examples?: Record<string, OpenApiExample>;
}

export interface OpenApiExample {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
}

export interface OpenApiComponents {
  schemas?: Record<string, OpenApiSchema>;
  responses?: Record<string, OpenApiResponse>;
  parameters?: Record<string, OpenApiParameter>;
  requestBodies?: Record<string, OpenApiRequestBody>;
  headers?: Record<string, OpenApiHeader>;
  securitySchemes?: Record<string, OpenApiSecurityScheme>;
}

export interface OpenApiSecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: OpenApiOAuthFlows;
  openIdConnectUrl?: string;
}

export interface OpenApiOAuthFlows {
  implicit?: OpenApiOAuthFlow;
  password?: OpenApiOAuthFlow;
  clientCredentials?: OpenApiOAuthFlow;
  authorizationCode?: OpenApiOAuthFlow;
}

export interface OpenApiOAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface OpenApiSchema {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  format?: string;
  title?: string;
  description?: string;
  default?: unknown;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;

  // String validations
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  // Number validations
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number | boolean;
  exclusiveMaximum?: number | boolean;
  multipleOf?: number;

  // Array validations
  items?: OpenApiSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // Object validations
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  additionalProperties?: boolean | OpenApiSchema;
  minProperties?: number;
  maxProperties?: number;

  // Composition
  allOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  not?: OpenApiSchema;

  // Reference
  $ref?: string;

  // Enum
  enum?: (string | number | boolean | null)[];

  // Examples
  example?: unknown;
  examples?: unknown[];
}

/**
 * Parsed result types
 */
export interface OpenApiParseResult {
  projectName: string;
  version: string;
  description?: string;
  entities: ParsedEntity[];
  relations: ParsedRelation[];
  endpoints: ParsedEndpoint[];
  warnings: ParseWarning[];
  errors: ParseError[];
}

export interface ParsedEntity {
  originalName: string;
  sanitizedName: string;
  fields: ParsedField[];
  description?: string;
}

export interface ParsedField {
  name: string;
  type: string;
  nullable: boolean;
  constraints: FieldConstraints;
  description?: string;
}

export interface FieldConstraints {
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  enumValues?: string[];
}

export interface ParsedRelation {
  sourceName: string;
  targetName: string;
  fieldName: string;
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
}

export interface ParsedEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  operationId?: string;
  summary?: string;
  description?: string;
  tags: string[];
  inferredEntity?: string;
  parameters: ParsedParameter[];
  requestBodySchema?: string;
  responseSchemas: Record<string, string>;
}

export interface ParsedParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  type: string;
  required: boolean;
}

export interface ParseWarning {
  code: string;
  message: string;
  path?: string;
}

export interface ParseError {
  code: string;
  message: string;
  path?: string;
}

/**
 * Import options
 */
export interface OpenApiImportOptions {
  /** Include endpoints in the import */
  includeEndpoints?: boolean;
  /** Auto-detect relations from $ref */
  detectRelations?: boolean;
  /** Prefix for generated entity names */
  entityPrefix?: string;
  /** Suffix for generated entity names */
  entitySuffix?: string;
  /** Skip schemas matching these patterns */
  skipPatterns?: string[];
  /** Only include schemas matching these patterns */
  includePatterns?: string[];
}
```

---

## Criterios de Completado

- [ ] Tipos completos para OpenAPI 3.x
- [ ] Tipos para resultados del parser
- [ ] Tipos para opciones de importacion
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

#task #fase-3 #types #pending

[[T-033]] → [[T-034]] → [[T-035]] | [[Phases/03-OPENAPI-IMPORT]]
