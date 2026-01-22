import { describe, it, expect } from 'vitest';
import {
  getNextServiceColor,
  createDefaultService,
  SERVICE_COLORS,
  defaultServiceConfig,
  defaultServiceConnectionConfig,
  defaultKafkaEventConfig,
  defaultRabbitMQEventConfig,
} from './service';

describe('service type utilities', () => {
  describe('getNextServiceColor', () => {
    it('should return first color when no colors are used', () => {
      const color = getNextServiceColor([]);

      expect(color).toBe(SERVICE_COLORS[0]);
    });

    it('should return next available color', () => {
      const color = getNextServiceColor([SERVICE_COLORS[0]]);

      expect(color).toBe(SERVICE_COLORS[1]);
    });

    it('should skip used colors', () => {
      const usedColors = [SERVICE_COLORS[0], SERVICE_COLORS[1]];
      const color = getNextServiceColor(usedColors);

      expect(color).toBe(SERVICE_COLORS[2]);
    });

    it('should skip non-sequential used colors', () => {
      const usedColors = [SERVICE_COLORS[0], SERVICE_COLORS[2]];
      const color = getNextServiceColor(usedColors);

      expect(color).toBe(SERVICE_COLORS[1]);
    });

    it('should cycle through colors when all are used', () => {
      const color = getNextServiceColor([...SERVICE_COLORS]);

      // Should cycle back to beginning based on count
      expect(SERVICE_COLORS).toContain(color);
    });

    it('should handle more used colors than available colors', () => {
      const manyUsedColors = [...SERVICE_COLORS, ...SERVICE_COLORS];
      const color = getNextServiceColor(manyUsedColors);

      expect(SERVICE_COLORS).toContain(color);
    });
  });

  describe('createDefaultService', () => {
    it('should create service with given name and color', () => {
      const service = createDefaultService('UserService', '#228be6');

      expect(service.name).toBe('UserService');
      expect(service.color).toBe('#228be6');
    });

    it('should have empty description by default', () => {
      const service = createDefaultService('TestService', '#40c057');

      expect(service.description).toBe('');
    });

    it('should have default position', () => {
      const service = createDefaultService('TestService', '#40c057');

      expect(service.position).toEqual({ x: 50, y: 50 });
    });

    it('should have default dimensions', () => {
      const service = createDefaultService('TestService', '#40c057');

      expect(service.width).toBe(400);
      expect(service.height).toBe(300);
    });

    it('should have empty entityIds array', () => {
      const service = createDefaultService('TestService', '#40c057');

      expect(service.entityIds).toEqual([]);
    });

    it('should have default config values', () => {
      const service = createDefaultService('TestService', '#40c057');

      expect(service.config.port).toBe(defaultServiceConfig.port);
      expect(service.config.contextPath).toBe(defaultServiceConfig.contextPath);
      expect(service.config.databaseType).toBe(defaultServiceConfig.databaseType);
    });

    it('should not share config reference with defaultServiceConfig', () => {
      const service = createDefaultService('TestService', '#40c057');

      expect(service.config).not.toBe(defaultServiceConfig);
    });
  });

  describe('SERVICE_COLORS constant', () => {
    it('should have expected number of colors', () => {
      expect(SERVICE_COLORS.length).toBe(10);
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9a-f]{6}$/i;

      for (const color of SERVICE_COLORS) {
        expect(color).toMatch(hexColorRegex);
      }
    });

    it('should have unique colors', () => {
      const uniqueColors = new Set(SERVICE_COLORS);
      expect(uniqueColors.size).toBe(SERVICE_COLORS.length);
    });
  });

  describe('defaultServiceConfig', () => {
    it('should have expected default values', () => {
      expect(defaultServiceConfig.port).toBe(8080);
      expect(defaultServiceConfig.contextPath).toBe('/api');
      expect(defaultServiceConfig.databaseType).toBe('postgresql');
      expect(defaultServiceConfig.generateDocker).toBe(true);
      expect(defaultServiceConfig.generateDockerCompose).toBe(true);
      expect(defaultServiceConfig.enableCircuitBreaker).toBe(true);
      expect(defaultServiceConfig.enableRateLimiting).toBe(true);
      expect(defaultServiceConfig.enableTracing).toBe(true);
      expect(defaultServiceConfig.enableMetrics).toBe(true);
    });

    it('should have service discovery disabled by default', () => {
      expect(defaultServiceConfig.enableServiceDiscovery).toBe(false);
      expect(defaultServiceConfig.serviceDiscoveryType).toBe('NONE');
    });
  });

  describe('defaultServiceConnectionConfig', () => {
    it('should have expected default values', () => {
      expect(defaultServiceConnectionConfig.timeout).toBe(30000);
      expect(defaultServiceConnectionConfig.retryEnabled).toBe(true);
      expect(defaultServiceConnectionConfig.retryAttempts).toBe(3);
      expect(defaultServiceConnectionConfig.circuitBreakerEnabled).toBe(true);
    });
  });

  describe('defaultKafkaEventConfig', () => {
    it('should have Kafka broker type', () => {
      expect(defaultKafkaEventConfig.brokerType).toBe('Kafka');
    });

    it('should have default partitions', () => {
      expect(defaultKafkaEventConfig.partitions).toBe(3);
    });

    it('should have default replication factor', () => {
      expect(defaultKafkaEventConfig.replicationFactor).toBe(1);
    });

    it('should have JSON serialization format', () => {
      expect(defaultKafkaEventConfig.serializationFormat).toBe('JSON');
    });
  });

  describe('defaultRabbitMQEventConfig', () => {
    it('should have RabbitMQ broker type', () => {
      expect(defaultRabbitMQEventConfig.brokerType).toBe('RabbitMQ');
    });

    it('should have topic exchange type', () => {
      expect(defaultRabbitMQEventConfig.exchangeType).toBe('topic');
    });

    it('should have durable queue enabled', () => {
      expect(defaultRabbitMQEventConfig.durableQueue).toBe(true);
    });

    it('should have JSON serialization format', () => {
      expect(defaultRabbitMQEventConfig.serializationFormat).toBe('JSON');
    });
  });
});
