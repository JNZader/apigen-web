/**
 * Test Factories
 *
 * This module exports factory functions for creating mock data in tests.
 * Use these instead of manually creating objects to ensure consistency.
 */

export {
  createMockEntities,
  createMockEntity,
  createMockEntityWithFields,
  createMockField,
  createMockValidation,
} from './entityFactory';
export {
  createMinimalProjectConfig,
  createMockProjectConfig,
  createMockProjectFeatures,
  createMockProjectModules,
} from './projectFactory';
export {
  createMockBidirectionalRelation,
  createMockForeignKeyConfig,
  createMockManyToManyRelation,
  createMockRelation,
  createMockRelations,
} from './relationFactory';
export {
  createMockService,
  createMockServiceConfig,
  createMockServiceConnection,
  createMockServiceConnectionConfig,
  createMockServices,
} from './serviceFactory';
