import { nanoid } from 'nanoid';
import type {
  ServiceConfig,
  ServiceConnectionConfig,
  ServiceConnectionDesign,
  ServiceDesign,
} from '../../types';
import { defaultServiceConfig, defaultServiceConnectionConfig, SERVICE_COLORS } from '../../types';

/**
 * Creates a mock service configuration for testing purposes.
 */
export function createMockServiceConfig(overrides: Partial<ServiceConfig> = {}): ServiceConfig {
  return {
    ...defaultServiceConfig,
    ...overrides,
  };
}

/**
 * Creates a mock service for testing purposes.
 */
export function createMockService(overrides: Partial<ServiceDesign> = {}): ServiceDesign {
  const id = overrides.id ?? nanoid();
  const name = overrides.name ?? 'TestService';

  return {
    id,
    name,
    description: '',
    color: SERVICE_COLORS[0],
    position: { x: 50, y: 50 },
    width: 400,
    height: 300,
    entityIds: [],
    config: createMockServiceConfig(),
    ...overrides,
  };
}

/**
 * Creates multiple mock services for testing purposes.
 */
export function createMockServices(
  count: number,
  baseOverrides: Partial<ServiceDesign> = {},
): ServiceDesign[] {
  return Array.from({ length: count }, (_, i) =>
    createMockService({
      name: `Service${i + 1}`,
      color: SERVICE_COLORS[i % SERVICE_COLORS.length],
      position: { x: (i % 3) * 450 + 50, y: Math.floor(i / 3) * 350 + 50 },
      ...baseOverrides,
    }),
  );
}

/**
 * Creates a mock service connection configuration for testing purposes.
 */
export function createMockServiceConnectionConfig(
  overrides: Partial<ServiceConnectionConfig> = {},
): ServiceConnectionConfig {
  return {
    ...defaultServiceConnectionConfig,
    ...overrides,
  };
}

/**
 * Creates a mock service connection for testing purposes.
 */
export function createMockServiceConnection(
  overrides: Partial<ServiceConnectionDesign> = {},
): ServiceConnectionDesign {
  return {
    id: nanoid(),
    sourceServiceId: 'source-service-1',
    targetServiceId: 'target-service-2',
    communicationType: 'REST',
    config: createMockServiceConnectionConfig(),
    ...overrides,
  };
}
