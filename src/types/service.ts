// ============================================================================
// SERVICE DESIGN TYPES FOR MICROSERVICES DESIGNER
// ============================================================================

/**
 * Communication protocol between services
 */
export type CommunicationType = 'REST' | 'gRPC' | 'Kafka' | 'RabbitMQ' | 'WebSocket';

/**
 * Database type per service (can differ from global project database)
 */
export type ServiceDatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'h2';

/**
 * Service discovery mechanism
 */
export type ServiceDiscoveryType = 'EUREKA' | 'CONSUL' | 'KUBERNETES' | 'NONE';

/**
 * Service configuration
 */
export interface ServiceConfig {
  port: number;
  contextPath: string;
  databaseType: ServiceDatabaseType;
  generateDocker: boolean;
  generateDockerCompose: boolean;
  enableServiceDiscovery: boolean;
  serviceDiscoveryType: ServiceDiscoveryType;
  enableCircuitBreaker: boolean;
  enableRateLimiting: boolean;
  enableTracing: boolean;
  enableMetrics: boolean;
}

/**
 * Default service configuration
 */
export const defaultServiceConfig: ServiceConfig = {
  port: 8080,
  contextPath: '/api',
  databaseType: 'postgresql',
  generateDocker: true,
  generateDockerCompose: true,
  enableServiceDiscovery: false,
  serviceDiscoveryType: 'NONE',
  enableCircuitBreaker: true,
  enableRateLimiting: true,
  enableTracing: true,
  enableMetrics: true,
};

/**
 * A microservice design containing grouped entities
 */
export interface ServiceDesign {
  id: string;
  name: string;
  description?: string;
  color: string; // Visual color for the service container
  position: { x: number; y: number };
  width: number;
  height: number;
  entityIds: string[]; // IDs of entities belonging to this service
  config: ServiceConfig;
}

/**
 * Service colors for visual distinction
 */
export const SERVICE_COLORS = [
  '#228be6', // Blue (default)
  '#40c057', // Green
  '#fab005', // Yellow
  '#fa5252', // Red
  '#7950f2', // Violet
  '#12b886', // Teal
  '#fd7e14', // Orange
  '#e64980', // Pink
  '#15aabf', // Cyan
  '#495057', // Gray
];

/**
 * Connection between two services
 */
export interface ServiceConnectionDesign {
  id: string;
  sourceServiceId: string;
  targetServiceId: string;
  communicationType: CommunicationType;
  label?: string;
  config: ServiceConnectionConfig;
}

/**
 * Configuration for service connections
 */
export interface ServiceConnectionConfig {
  // REST specific
  restPath?: string;
  restMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  // gRPC specific
  grpcServiceName?: string;
  grpcMethodName?: string;

  // Kafka/RabbitMQ specific
  topicName?: string;
  exchangeName?: string;
  queueName?: string;
  routingKey?: string;

  // Common settings
  timeout?: number;
  retryEnabled?: boolean;
  retryAttempts?: number;
  circuitBreakerEnabled?: boolean;
}

/**
 * Default connection configuration
 */
export const defaultServiceConnectionConfig: ServiceConnectionConfig = {
  timeout: 30000,
  retryEnabled: true,
  retryAttempts: 3,
  circuitBreakerEnabled: true,
};

/**
 * Color mapping for communication types
 */
export const COMMUNICATION_COLORS: Record<CommunicationType, string> = {
  REST: '#228be6',
  gRPC: '#7950f2',
  Kafka: '#fa5252',
  RabbitMQ: '#fd7e14',
  WebSocket: '#12b886',
};

/**
 * Labels for communication types
 */
export const COMMUNICATION_LABELS: Record<CommunicationType, string> = {
  REST: 'REST API',
  gRPC: 'gRPC',
  Kafka: 'Kafka',
  RabbitMQ: 'RabbitMQ',
  WebSocket: 'WebSocket',
};

// ============================================================================
// EVENT/MESSAGE TYPES FOR ASYNC COMMUNICATION
// ============================================================================

/**
 * Event broker type
 */
export type EventBrokerType = 'Kafka' | 'RabbitMQ';

/**
 * Message serialization format
 */
export type SerializationFormat = 'JSON' | 'AVRO' | 'PROTOBUF';

/**
 * Event/Topic definition for async communication
 */
export interface EventDefinition {
  id: string;
  name: string;
  description?: string;
  brokerType: EventBrokerType;
  topicName: string;
  // Kafka specific
  partitions?: number;
  replicationFactor?: number;
  retentionMs?: number;
  // RabbitMQ specific
  exchangeName?: string;
  exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  routingKey?: string;
  queueName?: string;
  durableQueue?: boolean;
  // Common settings
  serializationFormat: SerializationFormat;
  schemaVersion?: string;
  payloadFields: EventPayloadField[];
  // Relationships
  producerServiceIds: string[];
  consumerServiceIds: string[];
}

/**
 * Field in an event payload
 */
export interface EventPayloadField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'uuid';
  required: boolean;
  description?: string;
}

/**
 * Default Kafka event configuration
 */
export const defaultKafkaEventConfig: Partial<EventDefinition> = {
  brokerType: 'Kafka',
  partitions: 3,
  replicationFactor: 1,
  retentionMs: 604800000, // 7 days
  serializationFormat: 'JSON',
  payloadFields: [],
  producerServiceIds: [],
  consumerServiceIds: [],
};

/**
 * Default RabbitMQ event configuration
 */
export const defaultRabbitMQEventConfig: Partial<EventDefinition> = {
  brokerType: 'RabbitMQ',
  exchangeType: 'topic',
  durableQueue: true,
  serializationFormat: 'JSON',
  payloadFields: [],
  producerServiceIds: [],
  consumerServiceIds: [],
};

/**
 * Get next available service color
 */
export function getNextServiceColor(usedColors: string[]): string {
  for (const color of SERVICE_COLORS) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  // If all colors are used, cycle through colors based on how many are used
  return SERVICE_COLORS[usedColors.length % SERVICE_COLORS.length];
}

/**
 * Create a default service
 */
export function createDefaultService(name: string, color: string): Omit<ServiceDesign, 'id'> {
  return {
    name,
    description: '',
    color,
    position: { x: 50, y: 50 },
    width: 400,
    height: 300,
    entityIds: [],
    config: { ...defaultServiceConfig },
  };
}
