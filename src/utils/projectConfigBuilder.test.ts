import { describe, expect, it } from 'vitest';
import type { ProjectConfig, ServiceDesign, TargetConfig } from '../types';
import { defaultProjectConfig } from '../types/project';
import { createDefaultTargetConfig } from '../types/target';
import {
  buildProjectConfig,
  validateFeatureCompatibility,
  validateProjectConfig,
  validateTargetConfig,
} from './projectConfigBuilder';

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Creates a minimal service design for testing.
 */
function createTestService(overrides: Partial<ServiceDesign['config']> = {}): ServiceDesign {
  return {
    id: 'test-service-id',
    name: 'TestService',
    description: 'A test service',
    entities: [],
    config: {
      databaseType: 'postgresql',
      enableTracing: true,
      enableMetrics: true,
      enableCircuitBreaker: true,
      enableRateLimiting: true,
      ...overrides,
    },
  };
}

/**
 * Creates a project config with specific target configuration.
 */
function createProjectWithTarget(
  language: TargetConfig['language'],
  framework: TargetConfig['framework'],
  overrides: Partial<ProjectConfig> = {},
): ProjectConfig {
  return {
    ...defaultProjectConfig,
    ...overrides,
    // Ensure framework is set correctly
    targetConfig: {
      ...createDefaultTargetConfig(language),
      framework,
    },
  };
}

// ============================================================================
// validateTargetConfig TESTS
// ============================================================================

describe('validateTargetConfig', () => {
  it('should validate a valid Java/Spring Boot configuration', () => {
    const config = createDefaultTargetConfig('java');
    const result = validateTargetConfig(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should validate a valid Rust/Axum configuration', () => {
    const config = createDefaultTargetConfig('rust');
    const result = validateTargetConfig(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate a valid Go/Chi configuration', () => {
    const config: TargetConfig = {
      language: 'go',
      framework: 'chi',
      languageVersion: '1.22',
      frameworkVersion: '5.0',
    };
    const result = validateTargetConfig(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject incompatible language-framework combinations', () => {
    const config: TargetConfig = {
      language: 'java',
      framework: 'axum', // Axum is for Rust, not Java
      languageVersion: '21',
      frameworkVersion: '0.7',
    };
    const result = validateTargetConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Framework 'axum' is not compatible with language 'java'");
  });

  it('should reject empty language version', () => {
    const config: TargetConfig = {
      language: 'java',
      framework: 'spring-boot',
      languageVersion: '',
      frameworkVersion: '4.0.0',
    };
    const result = validateTargetConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Language version cannot be empty');
  });

  it('should reject empty framework version', () => {
    const config: TargetConfig = {
      language: 'java',
      framework: 'spring-boot',
      languageVersion: '21',
      frameworkVersion: '   ',
    };
    const result = validateTargetConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Framework version cannot be empty');
  });

  it('should validate all supported language-framework combinations', () => {
    const validCombinations: [TargetConfig['language'], TargetConfig['framework']][] = [
      ['java', 'spring-boot'],
      ['kotlin', 'spring-boot'],
      ['python', 'fastapi'],
      ['typescript', 'nestjs'],
      ['php', 'laravel'],
      ['go', 'gin'],
      ['go', 'chi'],
      ['rust', 'axum'],
      ['csharp', 'aspnet-core'],
    ];

    for (const [language, framework] of validCombinations) {
      const config = createDefaultTargetConfig(language);
      config.framework = framework;
      const result = validateTargetConfig(config);

      expect(result.valid).toBe(true);
    }
  });
});

// ============================================================================
// validateFeatureCompatibility TESTS
// ============================================================================

describe('validateFeatureCompatibility', () => {
  it('should validate Java project with all features enabled', () => {
    const config: ProjectConfig = {
      ...defaultProjectConfig,
      targetConfig: createDefaultTargetConfig('java'),
      features: {
        ...defaultProjectConfig.features,
        socialLogin: true,
        passwordReset: true,
        mailService: true,
        fileStorage: true,
        jteTemplates: true,
        virtualThreads: true,
      },
    };
    const result = validateFeatureCompatibility(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should warn about Feature Pack features for non-Java languages', () => {
    const config = createProjectWithTarget('python', 'fastapi', {
      features: {
        ...defaultProjectConfig.features,
        socialLogin: true,
        mailService: true,
      },
    });
    const result = validateFeatureCompatibility(config);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes('socialLogin'))).toBe(true);
  });

  it('should error on JTE Templates for non-Java languages', () => {
    const config = createProjectWithTarget('rust', 'axum', {
      features: {
        ...defaultProjectConfig.features,
        jteTemplates: true,
      },
    });
    const result = validateFeatureCompatibility(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'JTE Templates feature is only available for Java/Kotlin projects',
    );
  });

  it('should error on virtual threads for non-Java languages', () => {
    const config = createProjectWithTarget('go', 'chi', {
      features: {
        ...defaultProjectConfig.features,
        virtualThreads: true,
      },
    });
    const result = validateFeatureCompatibility(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Virtual threads feature is only available for Java/Kotlin projects',
    );
  });

  it('should allow Kotlin projects to use Java-specific features', () => {
    const config = createProjectWithTarget('kotlin', 'spring-boot', {
      features: {
        ...defaultProjectConfig.features,
        jteTemplates: true,
        virtualThreads: true,
      },
    });
    const result = validateFeatureCompatibility(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ============================================================================
// validateProjectConfig TESTS
// ============================================================================

describe('validateProjectConfig', () => {
  it('should validate default project configuration', () => {
    const result = validateProjectConfig(defaultProjectConfig);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should combine errors from target and feature validation', () => {
    const config: ProjectConfig = {
      ...defaultProjectConfig,
      targetConfig: {
        language: 'python',
        framework: 'spring-boot', // Invalid combination
        languageVersion: '3.12',
        frameworkVersion: '4.0.0',
      },
      features: {
        ...defaultProjectConfig.features,
        jteTemplates: true, // Invalid for Python
      },
    };
    const result = validateProjectConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// buildProjectConfig TESTS
// ============================================================================

describe('buildProjectConfig', () => {
  describe('basic functionality', () => {
    it('should build config from default project', () => {
      const result = buildProjectConfig(defaultProjectConfig);

      expect(result.name).toBe(defaultProjectConfig.name);
      expect(result.groupId).toBe(defaultProjectConfig.groupId);
      expect(result.artifactId).toBe(defaultProjectConfig.artifactId);
    });

    it('should preserve all core configurations', () => {
      const result = buildProjectConfig(defaultProjectConfig);

      expect(result.database).toEqual(defaultProjectConfig.database);
      expect(result.securityConfig).toEqual(defaultProjectConfig.securityConfig);
      expect(result.cacheConfig).toEqual(defaultProjectConfig.cacheConfig);
      expect(result.modules).toEqual(defaultProjectConfig.modules);
      expect(result.features).toEqual(defaultProjectConfig.features);
    });
  });

  describe('target configuration', () => {
    it('should include targetConfig in output', () => {
      const result = buildProjectConfig(defaultProjectConfig);

      expect(result.targetConfig).toBeDefined();
      expect(result.targetConfig.language).toBe('java');
      expect(result.targetConfig.framework).toBe('spring-boot');
    });

    it('should preserve custom target configuration', () => {
      const config = createProjectWithTarget('rust', 'axum');
      const result = buildProjectConfig(config);

      expect(result.targetConfig.language).toBe('rust');
      expect(result.targetConfig.framework).toBe('axum');
    });
  });

  describe('Feature Pack 2025 configuration', () => {
    it('should include featurePackConfig in output', () => {
      const result = buildProjectConfig(defaultProjectConfig);

      expect(result.featurePackConfig).toBeDefined();
      expect(result.featurePackConfig.socialLogin).toBeDefined();
      expect(result.featurePackConfig.passwordReset).toBeDefined();
      expect(result.featurePackConfig.mail).toBeDefined();
      expect(result.featurePackConfig.storage).toBeDefined();
      expect(result.featurePackConfig.jte).toBeDefined();
    });

    it('should sync Feature Pack enabled flags with features', () => {
      const config: ProjectConfig = {
        ...defaultProjectConfig,
        features: {
          ...defaultProjectConfig.features,
          socialLogin: true,
          passwordReset: true,
          mailService: false,
          fileStorage: true,
          jteTemplates: false,
        },
      };
      const result = buildProjectConfig(config);

      expect(result.featurePackConfig.socialLogin.enabled).toBe(true);
      expect(result.featurePackConfig.passwordReset.enabled).toBe(true);
      expect(result.featurePackConfig.mail.enabled).toBe(false);
      expect(result.featurePackConfig.storage.enabled).toBe(true);
      expect(result.featurePackConfig.jte.enabled).toBe(false);
    });

    it('should preserve Feature Pack detailed configuration', () => {
      const config: ProjectConfig = {
        ...defaultProjectConfig,
        features: {
          ...defaultProjectConfig.features,
          passwordReset: true,
        },
        featurePackConfig: {
          ...defaultProjectConfig.featurePackConfig,
          passwordReset: {
            ...defaultProjectConfig.featurePackConfig.passwordReset,
            tokenExpirationMinutes: 120,
            maxAttemptsPerHour: 10,
          },
        },
      };
      const result = buildProjectConfig(config);

      expect(result.featurePackConfig.passwordReset.tokenExpirationMinutes).toBe(120);
      expect(result.featurePackConfig.passwordReset.maxAttemptsPerHour).toBe(10);
      expect(result.featurePackConfig.passwordReset.enabled).toBe(true);
    });
  });

  describe('language-specific options', () => {
    it('should include rustOptions in output', () => {
      const result = buildProjectConfig(defaultProjectConfig);

      expect(result.rustOptions).toBeDefined();
      expect(result.rustOptions.preset).toBeDefined();
      expect(result.rustOptions.server).toBeDefined();
    });

    it('should include goChiOptions in output', () => {
      const result = buildProjectConfig(defaultProjectConfig);

      expect(result.goChiOptions).toBeDefined();
      expect(result.goChiOptions.messaging).toBeDefined();
      expect(result.goChiOptions.cache).toBeDefined();
    });

    it('should apply Rust preset defaults for edge-gateway preset', () => {
      // Only set the preset, excluding edge so preset defaults are applied
      // Destructure to exclude edge from the spread
      const { edge: _excludeEdge, ...rustOptionsWithoutEdge } = defaultProjectConfig.rustOptions;
      const config = createProjectWithTarget('rust', 'axum', {
        rustOptions: {
          ...rustOptionsWithoutEdge,
          preset: 'edge-gateway',
        } as typeof defaultProjectConfig.rustOptions,
      });
      const result = buildProjectConfig(config);

      expect(result.rustOptions.preset).toBe('edge-gateway');
      // Edge gateway has specific memory limits from preset
      expect(result.rustOptions.edge.maxMemoryMb).toBe(256);
    });

    it('should merge Go/Chi options with defaults', () => {
      const config = createProjectWithTarget('go', 'chi', {
        goChiOptions: {
          ...defaultProjectConfig.goChiOptions,
          messaging: {
            ...defaultProjectConfig.goChiOptions.messaging,
            type: 'nats',
          },
        },
      });
      const result = buildProjectConfig(config);

      expect(result.goChiOptions.messaging.type).toBe('nats');
      expect(result.goChiOptions.cache).toBeDefined();
    });
  });

  describe('service-specific overrides', () => {
    it('should override name with service name', () => {
      const service = createTestService();
      const result = buildProjectConfig(defaultProjectConfig, service);

      expect(result.name).toBe('TestService');
    });

    it('should generate artifactId from service name', () => {
      const service = createTestService();
      service.name = 'User Management Service';
      const result = buildProjectConfig(defaultProjectConfig, service);

      expect(result.artifactId).toBe('api-user-management-service');
    });

    it('should apply service database type override', () => {
      const service = createTestService({ databaseType: 'mysql' });
      const result = buildProjectConfig(defaultProjectConfig, service);

      expect(result.database.type).toBe('mysql');
    });

    it('should enable observability features from service config', () => {
      const service = createTestService({
        enableTracing: true,
        enableMetrics: true,
      });
      const result = buildProjectConfig(defaultProjectConfig, service);

      expect(result.observabilityConfig.tracing.enabled).toBe(true);
      expect(result.observabilityConfig.metrics.enabled).toBe(true);
    });

    it('should disable observability features when service config disables them', () => {
      const service = createTestService({
        enableTracing: false,
        enableMetrics: false,
      });
      const result = buildProjectConfig(defaultProjectConfig, service);

      expect(result.observabilityConfig.tracing.enabled).toBe(false);
      expect(result.observabilityConfig.metrics.enabled).toBe(false);
    });

    it('should enable circuit breaker from service config', () => {
      const service = createTestService({ enableCircuitBreaker: true });
      const result = buildProjectConfig(defaultProjectConfig, service);

      expect(result.resilienceConfig.circuitBreaker.enabled).toBe(true);
    });

    it('should disable rate limiting when service config disables it', () => {
      const service = createTestService({ enableRateLimiting: false });
      const result = buildProjectConfig(defaultProjectConfig, service);

      expect(result.rateLimitConfig.requestsPerSecond).toBe(0);
    });

    it('should preserve rate limit config when service enables it', () => {
      const config: ProjectConfig = {
        ...defaultProjectConfig,
        rateLimitConfig: {
          ...defaultProjectConfig.rateLimitConfig,
          requestsPerSecond: 100,
        },
      };
      const service = createTestService({ enableRateLimiting: true });
      const result = buildProjectConfig(config, service);

      expect(result.rateLimitConfig.requestsPerSecond).toBe(100);
    });
  });

  describe('legacy field compatibility', () => {
    it('should preserve javaVersion field', () => {
      const config: ProjectConfig = {
        ...defaultProjectConfig,
        javaVersion: '25',
      };
      const result = buildProjectConfig(config);

      expect(result.javaVersion).toBe('25');
    });

    it('should preserve springBootVersion field', () => {
      const config: ProjectConfig = {
        ...defaultProjectConfig,
        springBootVersion: '4.0.0',
      };
      const result = buildProjectConfig(config);

      expect(result.springBootVersion).toBe('4.0.0');
    });
  });
});
