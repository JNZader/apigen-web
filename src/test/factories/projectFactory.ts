import type { ProjectConfig, ProjectFeatures, ProjectModules } from '@/types';
import { defaultProjectConfig } from '@/types';

/**
 * Creates mock project modules for testing purposes.
 */
export function createMockProjectModules(overrides: Partial<ProjectModules> = {}): ProjectModules {
  return {
    core: true,
    security: false,
    graphql: false,
    grpc: false,
    gateway: false,
    ...overrides,
  };
}

/**
 * Creates mock project features for testing purposes.
 */
export function createMockProjectFeatures(
  overrides: Partial<ProjectFeatures> = {},
): ProjectFeatures {
  return {
    hateoas: true,
    swagger: true,
    softDelete: true,
    auditing: true,
    caching: true,
    rateLimiting: false,
    virtualThreads: true,
    docker: true,
    i18n: false,
    webhooks: false,
    bulkOperations: false,
    batchOperations: false,
    multiTenancy: false,
    eventSourcing: false,
    apiVersioning: false,
    cursorPagination: true,
    etagSupport: true,
    domainEvents: true,
    sseUpdates: false,
    // Feature Pack 2025
    socialLogin: false,
    passwordReset: false,
    mailService: false,
    fileStorage: false,
    jteTemplates: false,
    ...overrides,
  };
}

/**
 * Creates a mock project configuration for testing purposes.
 */
export function createMockProjectConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    ...defaultProjectConfig,
    name: 'Test Project',
    groupId: 'com.test',
    artifactId: 'test-api',
    packageName: 'com.test.api',
    ...overrides,
  };
}

/**
 * Creates a minimal project configuration for testing purposes.
 */
export function createMinimalProjectConfig(): ProjectConfig {
  return createMockProjectConfig({
    modules: createMockProjectModules({
      core: true,
      security: false,
      graphql: false,
      grpc: false,
      gateway: false,
    }),
    features: createMockProjectFeatures({
      hateoas: false,
      swagger: false,
      softDelete: false,
      auditing: false,
      caching: false,
      rateLimiting: false,
      virtualThreads: false,
      docker: false,
    }),
  });
}
