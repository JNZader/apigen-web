import type { OpenApiDocument, ParseError, ParseWarning } from '../types/openapi';

/**
 * Validation result for OpenAPI documents
 */
export interface OpenApiValidationResult {
  valid: boolean;
  errors: ParseError[];
  warnings: ParseWarning[];
}

/**
 * Type guard to check if an object is a valid OpenAPI document structure
 */
export function isOpenApiDocument(value: unknown): value is OpenApiDocument {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const doc = value as Record<string, unknown>;

  // Must have 'openapi' field as string
  if (typeof doc.openapi !== 'string') {
    return false;
  }

  // Must have 'info' object with required fields
  if (typeof doc.info !== 'object' || doc.info === null) {
    return false;
  }

  const info = doc.info as Record<string, unknown>;
  if (typeof info.title !== 'string' || typeof info.version !== 'string') {
    return false;
  }

  return true;
}

/**
 * Validates an OpenAPI document and returns errors and warnings
 */
export function validateOpenApiDocument(doc: unknown): OpenApiValidationResult {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];

  // Basic structure validation
  if (typeof doc !== 'object' || doc === null) {
    errors.push({
      code: 'INVALID_DOCUMENT',
      message: 'Document must be a valid object',
    });
    return { valid: false, errors, warnings };
  }

  const document = doc as Record<string, unknown>;

  // Validate openapi version field
  validateOpenApiVersion(document, errors);

  // Validate info object
  validateInfo(document, errors, warnings);

  // Validate paths
  validatePaths(document, errors, warnings);

  // Validate components.schemas
  validateSchemas(document, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates the openapi version field (3.x required)
 */
function validateOpenApiVersion(doc: Record<string, unknown>, errors: ParseError[]): void {
  if (!('openapi' in doc)) {
    errors.push({
      code: 'MISSING_OPENAPI_VERSION',
      message: 'Missing required field: openapi',
      path: 'openapi',
    });
    return;
  }

  const version = doc.openapi;
  if (typeof version !== 'string') {
    errors.push({
      code: 'INVALID_OPENAPI_VERSION',
      message: 'Field "openapi" must be a string',
      path: 'openapi',
    });
    return;
  }

  // Check for OpenAPI 3.x
  if (!version.startsWith('3.')) {
    errors.push({
      code: 'UNSUPPORTED_OPENAPI_VERSION',
      message: `OpenAPI version ${version} is not supported. Only OpenAPI 3.x is supported`,
      path: 'openapi',
    });
  }
}

/**
 * Validates the info object
 */
function validateInfo(
  doc: Record<string, unknown>,
  errors: ParseError[],
  warnings: ParseWarning[],
): void {
  if (!('info' in doc)) {
    errors.push({
      code: 'MISSING_INFO',
      message: 'Missing required field: info',
      path: 'info',
    });
    return;
  }

  const info = doc.info;
  if (typeof info !== 'object' || info === null) {
    errors.push({
      code: 'INVALID_INFO',
      message: 'Field "info" must be an object',
      path: 'info',
    });
    return;
  }

  const infoObj = info as Record<string, unknown>;

  // Validate title (required)
  if (!('title' in infoObj)) {
    errors.push({
      code: 'MISSING_INFO_TITLE',
      message: 'Missing required field: info.title',
      path: 'info.title',
    });
  } else if (typeof infoObj.title !== 'string') {
    errors.push({
      code: 'INVALID_INFO_TITLE',
      message: 'Field "info.title" must be a string',
      path: 'info.title',
    });
  } else if (infoObj.title.trim() === '') {
    errors.push({
      code: 'EMPTY_INFO_TITLE',
      message: 'Field "info.title" cannot be empty',
      path: 'info.title',
    });
  }

  // Validate version (required)
  if (!('version' in infoObj)) {
    errors.push({
      code: 'MISSING_INFO_VERSION',
      message: 'Missing required field: info.version',
      path: 'info.version',
    });
  } else if (typeof infoObj.version !== 'string') {
    errors.push({
      code: 'INVALID_INFO_VERSION',
      message: 'Field "info.version" must be a string',
      path: 'info.version',
    });
  }

  // Warn if description is missing
  if (!('description' in infoObj) || !infoObj.description) {
    warnings.push({
      code: 'MISSING_INFO_DESCRIPTION',
      message: 'Consider adding a description to info',
      path: 'info.description',
    });
  }
}

/**
 * Validates the paths object
 */
function validatePaths(
  doc: Record<string, unknown>,
  errors: ParseError[],
  warnings: ParseWarning[],
): void {
  // paths is optional, but if present must be valid
  if (!('paths' in doc)) {
    warnings.push({
      code: 'MISSING_PATHS',
      message: 'No paths defined in the document',
      path: 'paths',
    });
    return;
  }

  const paths = doc.paths;
  if (typeof paths !== 'object' || paths === null) {
    errors.push({
      code: 'INVALID_PATHS',
      message: 'Field "paths" must be an object',
      path: 'paths',
    });
    return;
  }

  const pathsObj = paths as Record<string, unknown>;
  const pathKeys = Object.keys(pathsObj);

  if (pathKeys.length === 0) {
    warnings.push({
      code: 'EMPTY_PATHS',
      message: 'No paths defined in the document',
      path: 'paths',
    });
    return;
  }

  // Validate each path starts with /
  for (const pathKey of pathKeys) {
    if (!pathKey.startsWith('/')) {
      errors.push({
        code: 'INVALID_PATH_FORMAT',
        message: `Path "${pathKey}" must start with /`,
        path: `paths.${pathKey}`,
      });
    }

    // Validate path item is an object
    const pathItem = pathsObj[pathKey];
    if (typeof pathItem !== 'object' || pathItem === null) {
      errors.push({
        code: 'INVALID_PATH_ITEM',
        message: `Path item for "${pathKey}" must be an object`,
        path: `paths.${pathKey}`,
      });
    }
  }
}

/**
 * Validates components.schemas
 */
function validateSchemas(
  doc: Record<string, unknown>,
  errors: ParseError[],
  warnings: ParseWarning[],
): void {
  // components is optional
  if (!('components' in doc)) {
    return;
  }

  const components = doc.components;
  if (typeof components !== 'object' || components === null) {
    errors.push({
      code: 'INVALID_COMPONENTS',
      message: 'Field "components" must be an object',
      path: 'components',
    });
    return;
  }

  const componentsObj = components as Record<string, unknown>;

  // schemas is optional within components
  if (!('schemas' in componentsObj)) {
    return;
  }

  const schemas = componentsObj.schemas;
  if (typeof schemas !== 'object' || schemas === null) {
    errors.push({
      code: 'INVALID_SCHEMAS',
      message: 'Field "components.schemas" must be an object',
      path: 'components.schemas',
    });
    return;
  }

  const schemasObj = schemas as Record<string, unknown>;
  const schemaNames = Object.keys(schemasObj);

  // Validate each schema
  for (const schemaName of schemaNames) {
    const schema = schemasObj[schemaName];
    const schemaPath = `components.schemas.${schemaName}`;

    if (typeof schema !== 'object' || schema === null) {
      errors.push({
        code: 'INVALID_SCHEMA',
        message: `Schema "${schemaName}" must be an object`,
        path: schemaPath,
      });
      continue;
    }

    const schemaObj = schema as Record<string, unknown>;

    // Warn if schema has no type and no $ref
    if (!('type' in schemaObj) && !('$ref' in schemaObj) && !hasCompositionKeyword(schemaObj)) {
      warnings.push({
        code: 'SCHEMA_MISSING_TYPE',
        message: `Schema "${schemaName}" has no type, $ref, or composition keyword`,
        path: schemaPath,
      });
    }

    // Validate object schemas have properties
    if (schemaObj.type === 'object' && !('properties' in schemaObj)) {
      warnings.push({
        code: 'OBJECT_SCHEMA_MISSING_PROPERTIES',
        message: `Object schema "${schemaName}" has no properties defined`,
        path: schemaPath,
      });
    }

    // Validate array schemas have items
    if (schemaObj.type === 'array' && !('items' in schemaObj)) {
      errors.push({
        code: 'ARRAY_SCHEMA_MISSING_ITEMS',
        message: `Array schema "${schemaName}" must have items defined`,
        path: schemaPath,
      });
    }
  }
}

/**
 * Checks if a schema has composition keywords (allOf, oneOf, anyOf)
 */
function hasCompositionKeyword(schema: Record<string, unknown>): boolean {
  return 'allOf' in schema || 'oneOf' in schema || 'anyOf' in schema;
}
