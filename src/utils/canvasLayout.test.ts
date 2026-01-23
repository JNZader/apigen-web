import { describe, expect, it } from 'vitest';
import type { EntityDesign, ServiceConnectionDesign, ServiceDesign } from '../types';
import type { RelationDesign } from '../types/relation';
import { calculateAutoLayout, calculateServiceLayout, LAYOUT_PRESETS } from './canvasLayout';

// Helper to create mock entities
function createMockEntity(id: string, fieldCount = 0): EntityDesign {
  return {
    id,
    name: `Entity${id}`,
    tableName: `entity_${id}`,
    position: { x: 0, y: 0 },
    fields: Array(fieldCount)
      .fill(null)
      .map((_, i) => ({
        id: `field-${i}`,
        name: `field${i}`,
        columnName: `field_${i}`,
        type: 'String' as const,
        nullable: true,
        unique: false,
        validations: [],
      })),
    config: {
      generateController: true,
      generateService: true,
      enableCaching: true,
    },
  };
}

// Helper to create mock relations
function createMockRelation(sourceEntityId: string, targetEntityId: string): RelationDesign {
  return {
    id: `rel-${sourceEntityId}-${targetEntityId}`,
    sourceEntityId,
    targetEntityId,
    type: 'OneToMany',
    sourceFieldName: 'id',
    targetFieldName: `${sourceEntityId}Id`,
    bidirectional: false,
    fetchType: 'LAZY',
    cascade: [],
    foreignKey: {
      columnName: 'fk_id',
      nullable: true,
      onDelete: 'NO_ACTION',
      onUpdate: 'NO_ACTION',
    },
  };
}

// Helper to create mock services
function createMockService(id: string): ServiceDesign {
  return {
    id,
    name: `Service${id}`,
    description: '',
    color: '#228be6',
    position: { x: 0, y: 0 },
    width: 400,
    height: 300,
    entityIds: [],
    config: {
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
    },
  };
}

// Helper to create mock service connections
function createMockConnection(
  sourceServiceId: string,
  targetServiceId: string,
): ServiceConnectionDesign {
  return {
    id: `conn-${sourceServiceId}-${targetServiceId}`,
    sourceServiceId,
    targetServiceId,
    communicationType: 'REST',
    config: {},
  };
}

describe('canvasLayout utilities', () => {
  describe('calculateAutoLayout', () => {
    it('should return empty map for empty entities', () => {
      const positions = calculateAutoLayout([], []);

      expect(positions.size).toBe(0);
    });

    it('should calculate grid layout for entities without relations', () => {
      const entities = [
        createMockEntity('1'),
        createMockEntity('2'),
        createMockEntity('3'),
        createMockEntity('4'),
      ];

      const positions = calculateAutoLayout(entities, []);

      expect(positions.size).toBe(4);
      // All entities should have positions
      for (const entity of entities) {
        expect(positions.has(entity.id)).toBe(true);
        const pos = positions.get(entity.id);
        expect(pos).toBeDefined();
        expect(typeof pos?.x).toBe('number');
        expect(typeof pos?.y).toBe('number');
      }
    });

    it('should arrange entities in grid layout when no relations', () => {
      const entities = [createMockEntity('1'), createMockEntity('2')];

      const positions = calculateAutoLayout(entities, []);

      const pos1 = positions.get('1')!;
      const pos2 = positions.get('2')!;

      // They should have different positions
      expect(pos1.x !== pos2.x || pos1.y !== pos2.y).toBe(true);
    });

    it('should calculate dagre layout for entities with relations', () => {
      const entities = [createMockEntity('1'), createMockEntity('2'), createMockEntity('3')];
      const relations = [createMockRelation('1', '2'), createMockRelation('2', '3')];

      const positions = calculateAutoLayout(entities, relations);

      expect(positions.size).toBe(3);
      // All entities should have positions
      for (const entity of entities) {
        expect(positions.has(entity.id)).toBe(true);
      }
    });

    it('should handle relations with missing entities', () => {
      const entities = [createMockEntity('1'), createMockEntity('2')];
      const relations = [
        createMockRelation('1', '2'),
        createMockRelation('2', '999'), // non-existent entity
      ];

      const positions = calculateAutoLayout(entities, relations);

      expect(positions.size).toBe(2);
      expect(positions.has('1')).toBe(true);
      expect(positions.has('2')).toBe(true);
    });

    it('should accept custom layout options', () => {
      const entities = [createMockEntity('1'), createMockEntity('2')];
      const relations = [createMockRelation('1', '2')];

      const positionsLR = calculateAutoLayout(entities, relations, {
        direction: 'LR',
      });
      const positionsTB = calculateAutoLayout(entities, relations, {
        direction: 'TB',
      });

      // Both should produce valid positions
      expect(positionsLR.size).toBe(2);
      expect(positionsTB.size).toBe(2);
    });

    it('should handle entities with many fields', () => {
      const entities = [
        createMockEntity('1', 10), // 10 fields
        createMockEntity('2', 5),
      ];
      const relations = [createMockRelation('1', '2')];

      const positions = calculateAutoLayout(entities, relations);

      expect(positions.size).toBe(2);
    });

    it('should handle single entity', () => {
      const entities = [createMockEntity('1')];

      const positions = calculateAutoLayout(entities, []);

      expect(positions.size).toBe(1);
      const pos = positions.get('1');
      expect(pos).toBeDefined();
    });

    it('should use different spacing options', () => {
      const entities = [createMockEntity('1'), createMockEntity('2'), createMockEntity('3')];
      const relations = [createMockRelation('1', '2'), createMockRelation('2', '3')];

      const compactPositions = calculateAutoLayout(entities, relations, LAYOUT_PRESETS.compact);
      const spaciousPositions = calculateAutoLayout(entities, relations, LAYOUT_PRESETS.spacious);

      expect(compactPositions.size).toBe(3);
      expect(spaciousPositions.size).toBe(3);
    });
  });

  describe('calculateServiceLayout', () => {
    it('should return empty map for empty services', () => {
      const positions = calculateServiceLayout([], []);

      expect(positions.size).toBe(0);
    });

    it('should calculate grid layout for services without connections', () => {
      const services = [createMockService('1'), createMockService('2'), createMockService('3')];

      const positions = calculateServiceLayout(services, []);

      expect(positions.size).toBe(3);
      for (const service of services) {
        expect(positions.has(service.id)).toBe(true);
        const pos = positions.get(service.id);
        expect(pos).toBeDefined();
        expect(typeof pos?.x).toBe('number');
        expect(typeof pos?.y).toBe('number');
      }
    });

    it('should calculate dagre layout for services with connections', () => {
      const services = [createMockService('1'), createMockService('2'), createMockService('3')];
      const connections = [createMockConnection('1', '2'), createMockConnection('2', '3')];

      const positions = calculateServiceLayout(services, connections);

      expect(positions.size).toBe(3);
    });

    it('should handle connections with missing services', () => {
      const services = [createMockService('1'), createMockService('2')];
      const connections = [
        createMockConnection('1', '2'),
        createMockConnection('2', '999'), // non-existent service
      ];

      const positions = calculateServiceLayout(services, connections);

      expect(positions.size).toBe(2);
    });

    it('should accept custom layout options', () => {
      const services = [createMockService('1'), createMockService('2')];
      const connections = [createMockConnection('1', '2')];

      const positions = calculateServiceLayout(services, connections, {
        direction: 'TB',
        nodeSpacing: 100,
        rankSpacing: 200,
      });

      expect(positions.size).toBe(2);
    });

    it('should handle services with custom dimensions', () => {
      const services = [
        { ...createMockService('1'), width: 500, height: 400 },
        { ...createMockService('2'), width: 300, height: 200 },
      ];

      const positions = calculateServiceLayout(services, []);

      expect(positions.size).toBe(2);
    });

    it('should handle single service', () => {
      const services = [createMockService('1')];

      const positions = calculateServiceLayout(services, []);

      expect(positions.size).toBe(1);
      const pos = positions.get('1');
      expect(pos).toBeDefined();
    });
  });

  describe('LAYOUT_PRESETS', () => {
    it('should have horizontal preset', () => {
      expect(LAYOUT_PRESETS.horizontal).toBeDefined();
      expect(LAYOUT_PRESETS.horizontal.direction).toBe('LR');
    });

    it('should have vertical preset', () => {
      expect(LAYOUT_PRESETS.vertical).toBeDefined();
      expect(LAYOUT_PRESETS.vertical.direction).toBe('TB');
    });

    it('should have compact preset', () => {
      expect(LAYOUT_PRESETS.compact).toBeDefined();
      expect(LAYOUT_PRESETS.compact.direction).toBe('LR');
      expect(LAYOUT_PRESETS.compact.nodeSpacing).toBeLessThan(
        LAYOUT_PRESETS.horizontal.nodeSpacing,
      );
    });

    it('should have spacious preset', () => {
      expect(LAYOUT_PRESETS.spacious).toBeDefined();
      expect(LAYOUT_PRESETS.spacious.direction).toBe('LR');
      expect(LAYOUT_PRESETS.spacious.nodeSpacing).toBeGreaterThan(
        LAYOUT_PRESETS.horizontal.nodeSpacing,
      );
    });

    it('all presets should have required properties', () => {
      const presets = Object.values(LAYOUT_PRESETS);

      for (const preset of presets) {
        expect(preset.direction).toBeDefined();
        expect(preset.nodeSpacing).toBeDefined();
        expect(preset.rankSpacing).toBeDefined();
        expect(typeof preset.nodeSpacing).toBe('number');
        expect(typeof preset.rankSpacing).toBe('number');
      }
    });
  });
});
