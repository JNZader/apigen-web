// ============================================================================
// OpenAPI 3.x Document Types
// ============================================================================

export interface OpenApiDocument {
  openapi: string;
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths?: Record<string, OpenApiPathItem>;
  components?: OpenApiComponents;
  tags?: OpenApiTag[];
  externalDocs?: OpenApiExternalDocs;
}

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
  contact?: OpenApiContact;
  license?: OpenApiLicense;
  termsOfService?: string;
}

export interface OpenApiContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface OpenApiLicense {
  name: string;
  url?: string;
}

export interface OpenApiServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenApiServerVariable>;
}

export interface OpenApiServerVariable {
  default: string;
  enum?: string[];
  description?: string;
}

export interface OpenApiTag {
  name: string;
  description?: string;
}

export interface OpenApiExternalDocs {
  url: string;
  description?: string;
}

// ============================================================================
// Path and Operation Types
// ============================================================================

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'trace';

export interface OpenApiPathItem {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  patch?: OpenApiOperation;
  delete?: OpenApiOperation;
  options?: OpenApiOperation;
  head?: OpenApiOperation;
  trace?: OpenApiOperation;
  servers?: OpenApiServer[];
  parameters?: OpenApiParameter[];
}

export interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
  deprecated?: boolean;
  security?: OpenApiSecurityRequirement[];
  servers?: OpenApiServer[];
  externalDocs?: OpenApiExternalDocs;
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: OpenApiSchema;
  style?: string;
  explode?: boolean;
  $ref?: string;
}

export interface OpenApiRequestBody {
  description?: string;
  content: Record<string, OpenApiMediaType>;
  required?: boolean;
  $ref?: string;
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
  $ref?: string;
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

export type OpenApiSecurityRequirement = Record<string, string[]>;

// ============================================================================
// Schema and Component Types
// ============================================================================

export type OpenApiSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

export interface OpenApiSchema {
  type?: OpenApiSchemaType;
  format?: string;
  title?: string;
  description?: string;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  items?: OpenApiSchema;
  $ref?: string;
  allOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  not?: OpenApiSchema;
  enum?: (string | number | boolean | null)[];
  default?: unknown;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  example?: unknown;
  examples?: unknown[];
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
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  // Object validations
  minProperties?: number;
  maxProperties?: number;
  additionalProperties?: boolean | OpenApiSchema;
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

// ============================================================================
// Parser Result Types
// ============================================================================

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
  originalName: string;
  sanitizedName: string;
  type: ParsedFieldType;
  nullable: boolean;
  description?: string;
  validations: ParsedValidation[];
  defaultValue?: unknown;
}

export type ParsedFieldType =
  | { kind: 'primitive'; value: string }
  | { kind: 'reference'; entityName: string }
  | { kind: 'array'; itemType: ParsedFieldType }
  | { kind: 'enum'; values: (string | number | boolean | null)[] };

export interface ParsedValidation {
  type: string;
  value?: string | number;
  message?: string;
}

export interface ParsedRelation {
  sourceEntity: string;
  targetEntity: string;
  sourceField: string;
  relationType: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
  nullable: boolean;
}

export interface ParsedEndpoint {
  path: string;
  method: HttpMethod;
  operationId?: string;
  summary?: string;
  description?: string;
  tags: string[];
  inferredEntity?: string;
  parameters: ParsedEndpointParameter[];
  requestBodySchema?: string;
  responseSchemas: Record<string, string>;
}

export interface ParsedEndpointParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required: boolean;
  type: string;
}

// ============================================================================
// Error and Warning Types
// ============================================================================

export type ParseErrorCode =
  | 'INVALID_DOCUMENT'
  | 'UNSUPPORTED_VERSION'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_REFERENCE'
  | 'CIRCULAR_REFERENCE'
  | 'PARSE_FAILED';

export type ParseWarningCode =
  | 'UNKNOWN_FORMAT'
  | 'SKIPPED_PATTERN'
  | 'UNSUPPORTED_FEATURE'
  | 'NAME_COLLISION'
  | 'EMPTY_SCHEMA'
  | 'DEPRECATED_USAGE';

export interface ParseError {
  code: ParseErrorCode;
  message: string;
  path?: string;
  details?: unknown;
}

export interface ParseWarning {
  code: ParseWarningCode;
  message: string;
  path?: string;
  details?: unknown;
}

// ============================================================================
// Import Options Types
// ============================================================================

export interface OpenApiImportOptions {
  includeEndpoints?: boolean;
  detectRelations?: boolean;
  entityPrefix?: string;
  entitySuffix?: string;
  skipPatterns?: string[];
  includePatterns?: string[];
  strictMode?: boolean;
  preserveDescriptions?: boolean;
}

export const DEFAULT_IMPORT_OPTIONS: Required<OpenApiImportOptions> = {
  includeEndpoints: true,
  detectRelations: true,
  entityPrefix: '',
  entitySuffix: '',
  skipPatterns: [],
  includePatterns: [],
  strictMode: false,
  preserveDescriptions: true,
};
