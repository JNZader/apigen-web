/**
 * Go/Chi Configuration Types
 *
 * This module contains Go/Chi-specific type definitions including
 * messaging (NATS, RabbitMQ, Kafka) and caching (Redis, Memcached) options.
 */

// ============================================================================
// MESSAGING TYPES
// ============================================================================

/**
 * Supported messaging broker types for Go/Chi.
 */
export type GoChiMessagingType = 'none' | 'nats' | 'rabbitmq' | 'kafka';

/**
 * NATS messaging configuration.
 */
export interface NatsConfig {
  /** NATS server URL */
  url: string;
  /** Cluster ID for NATS Streaming */
  clusterId: string;
  /** Client ID for NATS Streaming */
  clientId: string;
  /** Connection timeout in seconds */
  connectTimeoutSeconds: number;
  /** Maximum reconnection attempts */
  maxReconnects: number;
  /** Reconnection wait time in seconds */
  reconnectWaitSeconds: number;
}

/**
 * RabbitMQ messaging configuration.
 */
export interface RabbitMQConfig {
  /** RabbitMQ server URL */
  url: string;
  /** Virtual host */
  vhost: string;
  /** Default exchange name */
  exchange: string;
  /** Exchange type (direct, fanout, topic, headers) */
  exchangeType: 'direct' | 'fanout' | 'topic' | 'headers';
  /** Enable durable queues */
  durable: boolean;
  /** Auto-delete queues when unused */
  autoDelete: boolean;
  /** Prefetch count for consumers */
  prefetchCount: number;
}

/**
 * Kafka messaging configuration.
 */
export interface KafkaConfig {
  /** Kafka broker addresses */
  brokers: string[];
  /** Consumer group ID */
  groupId: string;
  /** Client ID */
  clientId: string;
  /** Enable auto-commit */
  autoCommit: boolean;
  /** Auto-commit interval in milliseconds */
  autoCommitIntervalMs: number;
  /** Session timeout in milliseconds */
  sessionTimeoutMs: number;
  /** Heartbeat interval in milliseconds */
  heartbeatIntervalMs: number;
}

/**
 * Go/Chi messaging configuration.
 */
export interface GoChiMessagingConfig {
  /** Messaging broker type */
  type: GoChiMessagingType;
  /** NATS configuration */
  nats: NatsConfig;
  /** RabbitMQ configuration */
  rabbitmq: RabbitMQConfig;
  /** Kafka configuration */
  kafka: KafkaConfig;
}

// ============================================================================
// CACHING TYPES
// ============================================================================

/**
 * Supported cache types for Go/Chi.
 */
export type GoChiCacheType = 'none' | 'memory' | 'redis' | 'memcached';

/**
 * In-memory cache configuration.
 */
export interface MemoryCacheConfig {
  /** Maximum number of items in cache */
  maxItems: number;
  /** Default TTL in seconds */
  defaultTTLSeconds: number;
  /** Cleanup interval in seconds */
  cleanupIntervalSeconds: number;
}

/**
 * Redis cache configuration for Go/Chi.
 */
export interface GoChiRedisConfig {
  /** Redis server address */
  addr: string;
  /** Redis password (empty for no auth) */
  password: string;
  /** Redis database number */
  db: number;
  /** Connection pool size */
  poolSize: number;
  /** Minimum idle connections */
  minIdleConns: number;
  /** Connection timeout in seconds */
  dialTimeoutSeconds: number;
  /** Read timeout in seconds */
  readTimeoutSeconds: number;
  /** Write timeout in seconds */
  writeTimeoutSeconds: number;
  /** Key prefix for namespacing */
  keyPrefix: string;
  /** Default TTL in seconds */
  defaultTTLSeconds: number;
}

/**
 * Memcached cache configuration.
 */
export interface MemcachedConfig {
  /** Memcached server addresses */
  servers: string[];
  /** Connection timeout in seconds */
  timeoutSeconds: number;
  /** Maximum idle connections */
  maxIdleConns: number;
  /** Default TTL in seconds */
  defaultTTLSeconds: number;
}

/**
 * Go/Chi caching configuration.
 */
export interface GoChiCacheConfig {
  /** Cache type */
  type: GoChiCacheType;
  /** In-memory cache configuration */
  memory: MemoryCacheConfig;
  /** Redis cache configuration */
  redis: GoChiRedisConfig;
  /** Memcached cache configuration */
  memcached: MemcachedConfig;
}

// ============================================================================
// MAIN GO/CHI OPTIONS
// ============================================================================

/**
 * Go/Chi specific options configuration.
 * Contains settings unique to the Go/Chi framework backend.
 */
export interface GoChiOptions {
  /** Messaging configuration */
  messaging: GoChiMessagingConfig;
  /** Caching configuration */
  cache: GoChiCacheConfig;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default NATS configuration.
 */
export const defaultNatsConfig: NatsConfig = {
  url: 'nats://localhost:4222',
  clusterId: 'apigen-cluster',
  clientId: 'apigen-client',
  connectTimeoutSeconds: 10,
  maxReconnects: 60,
  reconnectWaitSeconds: 2,
};

/**
 * Default RabbitMQ configuration.
 */
export const defaultRabbitMQConfig: RabbitMQConfig = {
  url: 'amqp://guest:guest@localhost:5672',
  vhost: '/',
  exchange: 'apigen',
  exchangeType: 'topic',
  durable: true,
  autoDelete: false,
  prefetchCount: 10,
};

/**
 * Default Kafka configuration.
 */
export const defaultKafkaConfig: KafkaConfig = {
  brokers: ['localhost:9092'],
  groupId: 'apigen-group',
  clientId: 'apigen-client',
  autoCommit: true,
  autoCommitIntervalMs: 5000,
  sessionTimeoutMs: 30000,
  heartbeatIntervalMs: 3000,
};

/**
 * Default Go/Chi messaging configuration.
 */
export const defaultGoChiMessagingConfig: GoChiMessagingConfig = {
  type: 'none',
  nats: defaultNatsConfig,
  rabbitmq: defaultRabbitMQConfig,
  kafka: defaultKafkaConfig,
};

/**
 * Default in-memory cache configuration.
 */
export const defaultMemoryCacheConfig: MemoryCacheConfig = {
  maxItems: 10000,
  defaultTTLSeconds: 300,
  cleanupIntervalSeconds: 60,
};

/**
 * Default Redis configuration for Go/Chi.
 */
export const defaultGoChiRedisConfig: GoChiRedisConfig = {
  addr: 'localhost:6379',
  password: '',
  db: 0,
  poolSize: 10,
  minIdleConns: 5,
  dialTimeoutSeconds: 5,
  readTimeoutSeconds: 3,
  writeTimeoutSeconds: 3,
  keyPrefix: 'apigen:',
  defaultTTLSeconds: 300,
};

/**
 * Default Memcached configuration.
 */
export const defaultMemcachedConfig: MemcachedConfig = {
  servers: ['localhost:11211'],
  timeoutSeconds: 5,
  maxIdleConns: 10,
  defaultTTLSeconds: 300,
};

/**
 * Default Go/Chi cache configuration.
 */
export const defaultGoChiCacheConfig: GoChiCacheConfig = {
  type: 'none',
  memory: defaultMemoryCacheConfig,
  redis: defaultGoChiRedisConfig,
  memcached: defaultMemcachedConfig,
};

/**
 * Default Go/Chi options.
 */
export const defaultGoChiOptions: GoChiOptions = {
  messaging: defaultGoChiMessagingConfig,
  cache: defaultGoChiCacheConfig,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Returns the default Go/Chi options.
 * Use this helper to get a fresh copy of the default configuration.
 */
export function getDefaultGoChiOptions(): GoChiOptions {
  return {
    messaging: {
      type: 'none',
      nats: { ...defaultNatsConfig },
      rabbitmq: { ...defaultRabbitMQConfig },
      kafka: {
        ...defaultKafkaConfig,
        brokers: [...defaultKafkaConfig.brokers],
      },
    },
    cache: {
      type: 'none',
      memory: { ...defaultMemoryCacheConfig },
      redis: { ...defaultGoChiRedisConfig },
      memcached: {
        ...defaultMemcachedConfig,
        servers: [...defaultMemcachedConfig.servers],
      },
    },
  };
}
