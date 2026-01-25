import { describe, expect, it } from 'vitest';
import {
  FEATURE_DEPENDENCIES,
  FEATURE_DEPENDENTS,
  FEATURE_LABELS,
  FRAMEWORK_ADDITIONAL_FEATURES,
  FRAMEWORK_UNSUPPORTED_FEATURES,
  getFeatureDependencies,
  getFeatureDependents,
  getSupportedFeatures,
  getUnsupportedFeatures,
  isFeatureSupportedByFramework,
  isFeatureSupportedByLanguage,
  LANGUAGE_SUPPORTED_FEATURES,
} from './featureCompatibility';

describe('featureCompatibility', () => {
  describe('LANGUAGE_SUPPORTED_FEATURES', () => {
    it('should have all 8 languages defined', () => {
      const languages = Object.keys(LANGUAGE_SUPPORTED_FEATURES);
      expect(languages).toHaveLength(8);
      expect(languages).toContain('java');
      expect(languages).toContain('kotlin');
      expect(languages).toContain('python');
      expect(languages).toContain('typescript');
      expect(languages).toContain('php');
      expect(languages).toContain('go');
      expect(languages).toContain('rust');
      expect(languages).toContain('csharp');
    });

    it('should have virtualThreads only for Java and Kotlin', () => {
      expect(LANGUAGE_SUPPORTED_FEATURES.java).toContain('virtualThreads');
      expect(LANGUAGE_SUPPORTED_FEATURES.kotlin).toContain('virtualThreads');
      expect(LANGUAGE_SUPPORTED_FEATURES.python).not.toContain('virtualThreads');
      expect(LANGUAGE_SUPPORTED_FEATURES.typescript).not.toContain('virtualThreads');
      expect(LANGUAGE_SUPPORTED_FEATURES.go).not.toContain('virtualThreads');
      expect(LANGUAGE_SUPPORTED_FEATURES.rust).not.toContain('virtualThreads');
    });

    it('should have jteTemplates only for Java and Kotlin', () => {
      expect(LANGUAGE_SUPPORTED_FEATURES.java).toContain('jteTemplates');
      expect(LANGUAGE_SUPPORTED_FEATURES.kotlin).toContain('jteTemplates');
      expect(LANGUAGE_SUPPORTED_FEATURES.python).not.toContain('jteTemplates');
      expect(LANGUAGE_SUPPORTED_FEATURES.rust).not.toContain('jteTemplates');
    });
  });

  describe('FEATURE_LABELS', () => {
    it('should have labels for all features', () => {
      const expectedFeatures = [
        'hateoas',
        'swagger',
        'softDelete',
        'auditing',
        'virtualThreads',
        'docker',
        'caching',
        'cursorPagination',
        'etagSupport',
        'rateLimiting',
        'i18n',
        'webhooks',
        'bulkOperations',
        'batchOperations',
        'domainEvents',
        'sseUpdates',
        'multiTenancy',
        'eventSourcing',
        'apiVersioning',
        'socialLogin',
        'passwordReset',
        'mailService',
        'fileStorage',
        'jteTemplates',
      ];

      for (const feature of expectedFeatures) {
        expect(FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS]).toBeDefined();
        expect(typeof FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS]).toBe('string');
      }
    });
  });

  describe('FEATURE_DEPENDENCIES', () => {
    it('should have passwordReset depend on mailService', () => {
      expect(FEATURE_DEPENDENCIES.passwordReset).toContain('mailService');
    });

    it('should have jteTemplates depend on mailService', () => {
      expect(FEATURE_DEPENDENCIES.jteTemplates).toContain('mailService');
    });

    it('should have eventSourcing depend on domainEvents', () => {
      expect(FEATURE_DEPENDENCIES.eventSourcing).toContain('domainEvents');
    });
  });

  describe('FEATURE_DEPENDENTS', () => {
    it('should have mailService dependents include passwordReset and jteTemplates', () => {
      expect(FEATURE_DEPENDENTS.mailService).toContain('passwordReset');
      expect(FEATURE_DEPENDENTS.mailService).toContain('jteTemplates');
    });

    it('should have domainEvents dependents include eventSourcing', () => {
      expect(FEATURE_DEPENDENTS.domainEvents).toContain('eventSourcing');
    });
  });

  describe('FRAMEWORK_UNSUPPORTED_FEATURES', () => {
    it('should have axum restrict i18n and domainEvents', () => {
      expect(FRAMEWORK_UNSUPPORTED_FEATURES.axum).toContain('i18n');
      expect(FRAMEWORK_UNSUPPORTED_FEATURES.axum).toContain('domainEvents');
    });

    it('should have gin and chi restrict domainEvents', () => {
      expect(FRAMEWORK_UNSUPPORTED_FEATURES.gin).toContain('domainEvents');
      expect(FRAMEWORK_UNSUPPORTED_FEATURES.chi).toContain('domainEvents');
    });
  });

  describe('isFeatureSupportedByLanguage', () => {
    it('should return true for supported features', () => {
      expect(isFeatureSupportedByLanguage('java', 'virtualThreads')).toBe(true);
      expect(isFeatureSupportedByLanguage('kotlin', 'jteTemplates')).toBe(true);
      expect(isFeatureSupportedByLanguage('python', 'swagger')).toBe(true);
    });

    it('should return false for unsupported features', () => {
      expect(isFeatureSupportedByLanguage('python', 'virtualThreads')).toBe(false);
      expect(isFeatureSupportedByLanguage('rust', 'jteTemplates')).toBe(false);
      expect(isFeatureSupportedByLanguage('go', 'hateoas')).toBe(false);
    });
  });

  describe('isFeatureSupportedByFramework', () => {
    it('should respect framework-specific restrictions', () => {
      // Rust supports i18n at language level, but axum doesn't
      expect(isFeatureSupportedByLanguage('rust', 'i18n')).toBe(false);
      expect(isFeatureSupportedByFramework('rust', 'axum', 'i18n')).toBe(false);
    });

    it('should respect framework-specific additions', () => {
      // Chi adds bulkOperations
      expect(isFeatureSupportedByLanguage('go', 'bulkOperations')).toBe(false);
      expect(isFeatureSupportedByFramework('go', 'chi', 'bulkOperations')).toBe(true);
    });

    it('should return true for fully supported features', () => {
      expect(isFeatureSupportedByFramework('java', 'spring-boot', 'virtualThreads')).toBe(true);
      expect(isFeatureSupportedByFramework('python', 'fastapi', 'swagger')).toBe(true);
    });
  });

  describe('getUnsupportedFeatures', () => {
    it('should return unsupported features for rust/axum', () => {
      const unsupported = getUnsupportedFeatures('rust', 'axum');
      expect(unsupported).toContain('virtualThreads');
      expect(unsupported).toContain('hateoas');
      expect(unsupported).toContain('jteTemplates');
      expect(unsupported).toContain('i18n');
      expect(unsupported).toContain('domainEvents');
    });

    it('should return empty or minimal unsupported for java/spring-boot', () => {
      const unsupported = getUnsupportedFeatures('java', 'spring-boot');
      // Java/Spring Boot should support most features
      expect(unsupported).toHaveLength(0);
    });
  });

  describe('getSupportedFeatures', () => {
    it('should return all supported features for java/spring-boot', () => {
      const supported = getSupportedFeatures('java', 'spring-boot');
      expect(supported).toContain('virtualThreads');
      expect(supported).toContain('jteTemplates');
      expect(supported).toContain('hateoas');
      expect(supported).toContain('swagger');
    });

    it('should return limited features for rust/axum', () => {
      const supported = getSupportedFeatures('rust', 'axum');
      expect(supported).toContain('swagger');
      expect(supported).toContain('docker');
      expect(supported).not.toContain('virtualThreads');
      expect(supported).not.toContain('hateoas');
    });
  });

  describe('getFeatureDependencies', () => {
    it('should return dependencies for passwordReset', () => {
      const deps = getFeatureDependencies('passwordReset');
      expect(deps).toContain('mailService');
    });

    it('should return empty array for features without dependencies', () => {
      const deps = getFeatureDependencies('swagger');
      expect(deps).toEqual([]);
    });
  });

  describe('getFeatureDependents', () => {
    it('should return dependents for mailService', () => {
      const deps = getFeatureDependents('mailService');
      expect(deps).toContain('passwordReset');
      expect(deps).toContain('jteTemplates');
    });

    it('should return empty array for features without dependents', () => {
      const deps = getFeatureDependents('swagger');
      expect(deps).toEqual([]);
    });
  });
});
