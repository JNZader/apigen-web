/**
 * Tests for Zod schemas.
 *
 * These tests validate that all schemas correctly accept valid data
 * and reject invalid data with appropriate error messages.
 */
import { describe, expect, it } from 'vitest';
import {
  AxumMiddlewareConfigSchema,
  AxumServerConfigSchema,
  AzureStorageConfigSchema,
  EdgeAiConfigSchema,
  EdgeAnomalyConfigSchema,
  EdgeConfigSchema,
  EdgeGatewayConfigSchema,
  FeaturePackConfigSchema,
  FrameworkSchema,
  GcsStorageConfigSchema,
  GenerateRequestSchema,
  GenerateResponseSchema,
  GenerationStatsSchema,
  HealthResponseSchema,
  JteConfigSchema,
  LanguageSchema,
  LoadBalancingStrategySchema,
  LocalStorageConfigSchema,
  MailConfigSchema,
  PasswordResetConfigSchema,
  ProjectConfigSchema,
  RustAxumOptionsSchema,
  RustPresetSchema,
  S3StorageConfigSchema,
  SmtpEncryptionSchema,
  SocialLoginConfigSchema,
  SocialProviderConfigSchema,
  SocialProviderSchema,
  StorageConfigSchema,
  StorageProviderSchema,
  TargetConfigSchema,
} from './schemas';

// ============================================================================
// API RESPONSE SCHEMAS TESTS
// ============================================================================

describe('API Response Schemas', () => {
  describe('HealthResponseSchema', () => {
    it('should validate valid health response', () => {
      const data = { status: 'ok', message: 'Server is healthy' };
      const result = HealthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      const data = { status: 'ok' };
      const result = HealthResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('GenerationStatsSchema', () => {
    it('should validate valid generation stats', () => {
      const data = {
        tablesProcessed: 5,
        entitiesGenerated: 5,
        filesGenerated: 25,
        generationTimeMs: 1500,
      };
      const result = GenerationStatsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject non-numeric values', () => {
      const data = {
        tablesProcessed: '5',
        entitiesGenerated: 5,
        filesGenerated: 25,
        generationTimeMs: 1500,
      };
      const result = GenerationStatsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('GenerateResponseSchema', () => {
    it('should validate valid response with stats', () => {
      const data = {
        success: true,
        message: 'Generation complete',
        generatedFiles: ['file1.java', 'file2.java'],
        warnings: [],
        errors: [],
        stats: {
          tablesProcessed: 3,
          entitiesGenerated: 3,
          filesGenerated: 15,
          generationTimeMs: 1000,
        },
      };
      const result = GenerateResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate response without stats', () => {
      const data = {
        success: false,
        message: 'Validation failed',
        generatedFiles: [],
        warnings: ['Warning 1'],
        errors: ['Error 1'],
      };
      const result = GenerateResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// TARGET CONFIGURATION SCHEMAS TESTS
// ============================================================================

describe('Target Configuration Schemas', () => {
  describe('LanguageSchema', () => {
    it('should validate all supported languages', () => {
      const languages = ['java', 'kotlin', 'python', 'typescript', 'php', 'go', 'rust', 'csharp'];
      languages.forEach((lang) => {
        const result = LanguageSchema.safeParse(lang);
        expect(result.success).toBe(true);
      });
    });

    it('should reject unsupported language', () => {
      const result = LanguageSchema.safeParse('ruby');
      expect(result.success).toBe(false);
    });
  });

  describe('FrameworkSchema', () => {
    it('should validate all supported frameworks', () => {
      const frameworks = [
        'spring-boot',
        'fastapi',
        'nestjs',
        'laravel',
        'gin',
        'chi',
        'axum',
        'aspnet-core',
      ];
      frameworks.forEach((fw) => {
        const result = FrameworkSchema.safeParse(fw);
        expect(result.success).toBe(true);
      });
    });

    it('should reject unsupported framework', () => {
      const result = FrameworkSchema.safeParse('express');
      expect(result.success).toBe(false);
    });
  });

  describe('TargetConfigSchema', () => {
    it('should validate valid target configuration', () => {
      const data = {
        language: 'java',
        framework: 'spring-boot',
        languageVersion: '21',
        frameworkVersion: '4.0.0',
      };
      const result = TargetConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty version strings', () => {
      const data = {
        language: 'java',
        framework: 'spring-boot',
        languageVersion: '',
        frameworkVersion: '4.0.0',
      };
      const result = TargetConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid language', () => {
      const data = {
        language: 'invalid',
        framework: 'spring-boot',
        languageVersion: '21',
        frameworkVersion: '4.0.0',
      };
      const result = TargetConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// SOCIAL LOGIN SCHEMAS TESTS
// ============================================================================

describe('Social Login Schemas', () => {
  describe('SocialProviderSchema', () => {
    it('should validate all providers', () => {
      const providers = ['google', 'github', 'facebook', 'apple', 'microsoft'];
      providers.forEach((p) => {
        const result = SocialProviderSchema.safeParse(p);
        expect(result.success).toBe(true);
      });
    });

    it('should reject unsupported provider', () => {
      const result = SocialProviderSchema.safeParse('twitter');
      expect(result.success).toBe(false);
    });
  });

  describe('SocialProviderConfigSchema', () => {
    it('should validate valid provider config', () => {
      const data = {
        enabled: true,
        clientId: 'client-123',
        clientSecret: 'secret-456',
        scopes: ['openid', 'email', 'profile'],
      };
      const result = SocialProviderConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty scopes array', () => {
      const data = {
        enabled: false,
        clientId: '',
        clientSecret: '',
        scopes: [],
      };
      const result = SocialProviderConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('SocialLoginConfigSchema', () => {
    it('should validate valid social login config', () => {
      const providerConfig = {
        enabled: false,
        clientId: '',
        clientSecret: '',
        scopes: [],
      };
      const data = {
        enabled: true,
        autoLinkAccounts: true,
        requireEmailVerification: false,
        providers: {
          google: { ...providerConfig, enabled: true, scopes: ['openid', 'email'] },
          github: providerConfig,
          facebook: providerConfig,
          apple: providerConfig,
          microsoft: providerConfig,
        },
      };
      const result = SocialLoginConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// MAIL CONFIGURATION SCHEMAS TESTS
// ============================================================================

describe('Mail Configuration Schemas', () => {
  describe('SmtpEncryptionSchema', () => {
    it('should validate all encryption options', () => {
      ['none', 'tls', 'starttls'].forEach((enc) => {
        const result = SmtpEncryptionSchema.safeParse(enc);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid encryption', () => {
      const result = SmtpEncryptionSchema.safeParse('ssl');
      expect(result.success).toBe(false);
    });
  });

  describe('MailConfigSchema', () => {
    it('should validate valid mail config', () => {
      const data = {
        enabled: true,
        host: 'smtp.example.com',
        port: 587,
        username: 'user@example.com',
        password: 'password123',
        encryption: 'starttls',
        fromAddress: 'noreply@example.com',
        fromName: 'My Application',
        connectionTimeoutMs: 5000,
        readTimeoutMs: 10000,
        debug: false,
      };
      const result = MailConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid port number', () => {
      const data = {
        enabled: true,
        host: 'smtp.example.com',
        port: 70000,
        username: 'user',
        password: 'pass',
        encryption: 'tls',
        fromAddress: 'noreply@example.com',
        fromName: 'App',
        connectionTimeoutMs: 5000,
        readTimeoutMs: 10000,
        debug: false,
      };
      const result = MailConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email address', () => {
      const data = {
        enabled: true,
        host: 'smtp.example.com',
        port: 587,
        username: 'user',
        password: 'pass',
        encryption: 'tls',
        fromAddress: 'not-an-email',
        fromName: 'App',
        connectionTimeoutMs: 5000,
        readTimeoutMs: 10000,
        debug: false,
      };
      const result = MailConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative timeout', () => {
      const data = {
        enabled: true,
        host: 'smtp.example.com',
        port: 587,
        username: 'user',
        password: 'pass',
        encryption: 'tls',
        fromAddress: 'noreply@example.com',
        fromName: 'App',
        connectionTimeoutMs: -1000,
        readTimeoutMs: 10000,
        debug: false,
      };
      const result = MailConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// STORAGE CONFIGURATION SCHEMAS TESTS
// ============================================================================

describe('Storage Configuration Schemas', () => {
  describe('StorageProviderSchema', () => {
    it('should validate all providers', () => {
      ['local', 's3', 'gcs', 'azure'].forEach((p) => {
        const result = StorageProviderSchema.safeParse(p);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('LocalStorageConfigSchema', () => {
    it('should validate valid local config', () => {
      const data = { basePath: './uploads', createDirectories: true };
      const result = LocalStorageConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty basePath', () => {
      const data = { basePath: '', createDirectories: true };
      const result = LocalStorageConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('S3StorageConfigSchema', () => {
    it('should validate valid S3 config', () => {
      const data = {
        bucket: 'my-bucket',
        region: 'us-east-1',
        accessKeyId: 'AKIAXXXXXXXX',
        secretAccessKey: 'secret',
        pathStyleAccess: false,
      };
      const result = S3StorageConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow optional endpoint', () => {
      const data = {
        bucket: 'my-bucket',
        region: 'us-east-1',
        accessKeyId: 'AKIAXXXXXXXX',
        secretAccessKey: 'secret',
        endpoint: 'https://s3.custom.endpoint.com',
        pathStyleAccess: true,
      };
      const result = S3StorageConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('GcsStorageConfigSchema', () => {
    it('should validate valid GCS config', () => {
      const data = {
        bucket: 'my-gcs-bucket',
        projectId: 'my-project-123',
        credentialsPath: '/path/to/credentials.json',
      };
      const result = GcsStorageConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('AzureStorageConfigSchema', () => {
    it('should validate valid Azure config', () => {
      const data = {
        accountName: 'mystorageaccount',
        accountKey: 'base64key==',
        containerName: 'mycontainer',
      };
      const result = AzureStorageConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow optional endpoint', () => {
      const data = {
        accountName: 'mystorageaccount',
        accountKey: 'base64key==',
        containerName: 'mycontainer',
        endpoint: 'https://mystorageaccount.blob.core.windows.net',
      };
      const result = AzureStorageConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('StorageConfigSchema', () => {
    it('should validate complete storage config', () => {
      const data = {
        enabled: true,
        provider: 'local',
        maxFileSizeBytes: 10485760,
        allowedExtensions: ['.jpg', '.png', '.pdf'],
        validateContentType: true,
        generateUniqueNames: true,
        local: { basePath: './uploads', createDirectories: true },
        s3: {
          bucket: '',
          region: 'us-east-1',
          accessKeyId: '',
          secretAccessKey: '',
          pathStyleAccess: false,
        },
        gcs: { bucket: '', projectId: '', credentialsPath: '' },
        azure: { accountName: '', accountKey: '', containerName: '' },
      };
      const result = StorageConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject non-positive maxFileSizeBytes', () => {
      const data = {
        enabled: true,
        provider: 'local',
        maxFileSizeBytes: 0,
        allowedExtensions: [],
        validateContentType: true,
        generateUniqueNames: true,
        local: { basePath: './uploads', createDirectories: true },
        s3: {
          bucket: '',
          region: '',
          accessKeyId: '',
          secretAccessKey: '',
          pathStyleAccess: false,
        },
        gcs: { bucket: '', projectId: '', credentialsPath: '' },
        azure: { accountName: '', accountKey: '', containerName: '' },
      };
      const result = StorageConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// JTE CONFIGURATION SCHEMAS TESTS
// ============================================================================

describe('JTE Configuration Schemas', () => {
  describe('JteConfigSchema', () => {
    it('should validate valid JTE config', () => {
      const data = {
        enabled: true,
        templateDirectory: 'templates',
        templateExtension: '.jte',
        precompileTemplates: true,
        developmentMode: false,
        htmlOutputEscaping: true,
        contentType: 'text/html',
      };
      const result = JteConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty templateDirectory', () => {
      const data = {
        enabled: true,
        templateDirectory: '',
        templateExtension: '.jte',
        precompileTemplates: true,
        developmentMode: false,
        htmlOutputEscaping: true,
        contentType: 'text/html',
      };
      const result = JteConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty contentType', () => {
      const data = {
        enabled: true,
        templateDirectory: 'templates',
        templateExtension: '.jte',
        precompileTemplates: true,
        developmentMode: false,
        htmlOutputEscaping: true,
        contentType: '',
      };
      const result = JteConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// RUST/AXUM CONFIGURATION SCHEMAS TESTS
// ============================================================================

describe('Rust/Axum Configuration Schemas', () => {
  describe('RustPresetSchema', () => {
    it('should validate all presets', () => {
      ['cloud', 'edge-gateway', 'edge-anomaly', 'edge-ai'].forEach((p) => {
        const result = RustPresetSchema.safeParse(p);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid preset', () => {
      const result = RustPresetSchema.safeParse('serverless');
      expect(result.success).toBe(false);
    });
  });

  describe('EdgeConfigSchema', () => {
    it('should validate valid edge config', () => {
      const data = {
        maxMemoryMb: 256,
        maxConnections: 10000,
        compressionEnabled: true,
        connectionTimeoutMs: 5000,
        requestTimeoutMs: 30000,
        connectionPoolEnabled: true,
        connectionPoolSize: 100,
      };
      const result = EdgeConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow maxMemoryMb to be 0 (unlimited)', () => {
      const data = {
        maxMemoryMb: 0,
        maxConnections: 10000,
        compressionEnabled: true,
        connectionTimeoutMs: 5000,
        requestTimeoutMs: 30000,
        connectionPoolEnabled: true,
        connectionPoolSize: 100,
      };
      const result = EdgeConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject negative maxMemoryMb', () => {
      const data = {
        maxMemoryMb: -100,
        maxConnections: 10000,
        compressionEnabled: true,
        connectionTimeoutMs: 5000,
        requestTimeoutMs: 30000,
        connectionPoolEnabled: true,
        connectionPoolSize: 100,
      };
      const result = EdgeConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('LoadBalancingStrategySchema', () => {
    it('should validate all strategies', () => {
      ['round-robin', 'least-connections', 'ip-hash'].forEach((s) => {
        const result = LoadBalancingStrategySchema.safeParse(s);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('EdgeGatewayConfigSchema', () => {
    it('should validate valid gateway config', () => {
      const data = {
        routingEnabled: true,
        loadBalancingEnabled: true,
        loadBalancingStrategy: 'round-robin',
        cachingEnabled: true,
        cacheTtlSeconds: 60,
        rateLimitingEnabled: true,
        rateLimitRps: 1000,
      };
      const result = EdgeGatewayConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow cacheTtlSeconds to be 0 (no caching)', () => {
      const data = {
        routingEnabled: true,
        loadBalancingEnabled: false,
        loadBalancingStrategy: 'round-robin',
        cachingEnabled: false,
        cacheTtlSeconds: 0,
        rateLimitingEnabled: false,
        rateLimitRps: 1000,
      };
      const result = EdgeGatewayConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('EdgeAnomalyConfigSchema', () => {
    it('should validate valid anomaly config', () => {
      const data = {
        streamingEnabled: true,
        bufferSizeKb: 64,
        alertsEnabled: true,
        alertThreshold: 0.8,
        windowSizeSeconds: 60,
        aggregationEnabled: true,
      };
      const result = EdgeAnomalyConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept alertThreshold at boundaries', () => {
      const data0 = {
        streamingEnabled: true,
        bufferSizeKb: 64,
        alertsEnabled: true,
        alertThreshold: 0,
        windowSizeSeconds: 60,
        aggregationEnabled: true,
      };
      const data1 = {
        streamingEnabled: true,
        bufferSizeKb: 64,
        alertsEnabled: true,
        alertThreshold: 1,
        windowSizeSeconds: 60,
        aggregationEnabled: true,
      };
      expect(EdgeAnomalyConfigSchema.safeParse(data0).success).toBe(true);
      expect(EdgeAnomalyConfigSchema.safeParse(data1).success).toBe(true);
    });

    it('should reject alertThreshold outside 0-1 range', () => {
      const data = {
        streamingEnabled: true,
        bufferSizeKb: 64,
        alertsEnabled: true,
        alertThreshold: 1.5,
        windowSizeSeconds: 60,
        aggregationEnabled: true,
      };
      const result = EdgeAnomalyConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('EdgeAiConfigSchema', () => {
    it('should validate valid AI config', () => {
      const data = {
        modelServingEnabled: true,
        maxModelSizeMb: 100,
        modelCachingEnabled: true,
        inferenceThreads: 4,
        batchInferenceEnabled: false,
        maxBatchSize: 32,
        inferenceTimeoutMs: 5000,
      };
      const result = EdgeAiConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject non-positive inferenceThreads', () => {
      const data = {
        modelServingEnabled: true,
        maxModelSizeMb: 100,
        modelCachingEnabled: true,
        inferenceThreads: 0,
        batchInferenceEnabled: false,
        maxBatchSize: 32,
        inferenceTimeoutMs: 5000,
      };
      const result = EdgeAiConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('AxumServerConfigSchema', () => {
    it('should validate valid server config', () => {
      const data = {
        host: '0.0.0.0',
        port: 3000,
        workers: 0,
        keepAliveEnabled: true,
        keepAliveTimeoutSeconds: 75,
        maxBodySizeMb: 10,
        gracefulShutdownEnabled: true,
        gracefulShutdownTimeoutSeconds: 30,
      };
      const result = AxumServerConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow workers to be 0 (auto-detect)', () => {
      const data = {
        host: 'localhost',
        port: 8080,
        workers: 0,
        keepAliveEnabled: true,
        keepAliveTimeoutSeconds: 60,
        maxBodySizeMb: 5,
        gracefulShutdownEnabled: true,
        gracefulShutdownTimeoutSeconds: 15,
      };
      const result = AxumServerConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject port out of range', () => {
      const data = {
        host: 'localhost',
        port: 70000,
        workers: 4,
        keepAliveEnabled: true,
        keepAliveTimeoutSeconds: 60,
        maxBodySizeMb: 5,
        gracefulShutdownEnabled: true,
        gracefulShutdownTimeoutSeconds: 15,
      };
      const result = AxumServerConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('AxumMiddlewareConfigSchema', () => {
    it('should validate valid middleware config', () => {
      const data = {
        tracingEnabled: true,
        corsEnabled: true,
        compressionEnabled: true,
        compressionLevel: 6,
        loggingEnabled: true,
        requestIdEnabled: true,
      };
      const result = AxumMiddlewareConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject compressionLevel outside 1-9 range', () => {
      const dataLow = {
        tracingEnabled: true,
        corsEnabled: true,
        compressionEnabled: true,
        compressionLevel: 0,
        loggingEnabled: true,
        requestIdEnabled: true,
      };
      const dataHigh = {
        tracingEnabled: true,
        corsEnabled: true,
        compressionEnabled: true,
        compressionLevel: 10,
        loggingEnabled: true,
        requestIdEnabled: true,
      };
      expect(AxumMiddlewareConfigSchema.safeParse(dataLow).success).toBe(false);
      expect(AxumMiddlewareConfigSchema.safeParse(dataHigh).success).toBe(false);
    });
  });

  describe('RustAxumOptionsSchema', () => {
    it('should validate complete Rust/Axum options', () => {
      const data = {
        preset: 'cloud',
        server: {
          host: '0.0.0.0',
          port: 3000,
          workers: 0,
          keepAliveEnabled: true,
          keepAliveTimeoutSeconds: 75,
          maxBodySizeMb: 50,
          gracefulShutdownEnabled: true,
          gracefulShutdownTimeoutSeconds: 30,
        },
        middleware: {
          tracingEnabled: true,
          corsEnabled: true,
          compressionEnabled: true,
          compressionLevel: 6,
          loggingEnabled: true,
          requestIdEnabled: true,
        },
        edge: {
          maxMemoryMb: 0,
          maxConnections: 50000,
          compressionEnabled: true,
          connectionTimeoutMs: 5000,
          requestTimeoutMs: 30000,
          connectionPoolEnabled: true,
          connectionPoolSize: 100,
        },
        edgeGateway: {
          routingEnabled: true,
          loadBalancingEnabled: true,
          loadBalancingStrategy: 'round-robin',
          cachingEnabled: true,
          cacheTtlSeconds: 60,
          rateLimitingEnabled: true,
          rateLimitRps: 1000,
        },
        edgeAnomaly: {
          streamingEnabled: true,
          bufferSizeKb: 64,
          alertsEnabled: true,
          alertThreshold: 0.8,
          windowSizeSeconds: 60,
          aggregationEnabled: true,
        },
        edgeAi: {
          modelServingEnabled: true,
          maxModelSizeMb: 100,
          modelCachingEnabled: true,
          inferenceThreads: 4,
          batchInferenceEnabled: false,
          maxBatchSize: 32,
          inferenceTimeoutMs: 5000,
        },
      };
      const result = RustAxumOptionsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// FEATURE PACK AGGREGATE SCHEMA TESTS
// ============================================================================

describe('Feature Pack Schemas', () => {
  describe('PasswordResetConfigSchema', () => {
    it('should validate valid password reset config', () => {
      const data = {
        enabled: true,
        tokenExpirationMinutes: 60,
        maxAttemptsPerHour: 5,
        tokenLength: 64,
        requireCurrentPassword: true,
        cooldownSeconds: 60,
      };
      const result = PasswordResetConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow cooldownSeconds to be 0', () => {
      const data = {
        enabled: false,
        tokenExpirationMinutes: 30,
        maxAttemptsPerHour: 3,
        tokenLength: 32,
        requireCurrentPassword: false,
        cooldownSeconds: 0,
      };
      const result = PasswordResetConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject non-positive tokenExpirationMinutes', () => {
      const data = {
        enabled: true,
        tokenExpirationMinutes: 0,
        maxAttemptsPerHour: 5,
        tokenLength: 64,
        requireCurrentPassword: true,
        cooldownSeconds: 60,
      };
      const result = PasswordResetConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('FeaturePackConfigSchema', () => {
    it('should validate complete feature pack config', () => {
      const providerConfig = {
        enabled: false,
        clientId: '',
        clientSecret: '',
        scopes: [],
      };
      const data = {
        socialLogin: {
          enabled: false,
          autoLinkAccounts: false,
          requireEmailVerification: true,
          providers: {
            google: providerConfig,
            github: providerConfig,
            facebook: providerConfig,
            apple: providerConfig,
            microsoft: providerConfig,
          },
        },
        passwordReset: {
          enabled: false,
          tokenExpirationMinutes: 60,
          maxAttemptsPerHour: 5,
          tokenLength: 64,
          requireCurrentPassword: true,
          cooldownSeconds: 60,
        },
        mail: {
          enabled: false,
          host: 'localhost',
          port: 587,
          username: '',
          password: '',
          encryption: 'starttls',
          fromAddress: 'noreply@example.com',
          fromName: 'Application',
          connectionTimeoutMs: 5000,
          readTimeoutMs: 10000,
          debug: false,
        },
        storage: {
          enabled: false,
          provider: 'local',
          maxFileSizeBytes: 10485760,
          allowedExtensions: [],
          validateContentType: true,
          generateUniqueNames: true,
          local: { basePath: './uploads', createDirectories: true },
          s3: {
            bucket: '',
            region: 'us-east-1',
            accessKeyId: '',
            secretAccessKey: '',
            pathStyleAccess: false,
          },
          gcs: { bucket: '', projectId: '', credentialsPath: '' },
          azure: { accountName: '', accountKey: '', containerName: '' },
        },
        jte: {
          enabled: false,
          templateDirectory: 'templates',
          templateExtension: '.jte',
          precompileTemplates: true,
          developmentMode: false,
          htmlOutputEscaping: true,
          contentType: 'text/html',
        },
      };
      const result = FeaturePackConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// GENERATE REQUEST SCHEMA TESTS
// ============================================================================

describe('Generate Request Schemas', () => {
  describe('ProjectConfigSchema', () => {
    it('should validate valid project config', () => {
      const data = {
        name: 'My API',
        groupId: 'com.example',
        artifactId: 'my-api',
        javaVersion: '21',
        springBootVersion: '4.0.0',
      };
      const result = ProjectConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const data = {
        name: '',
        groupId: 'com.example',
        artifactId: 'my-api',
      };
      const result = ProjectConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow passthrough of additional fields', () => {
      const data = {
        name: 'My API',
        groupId: 'com.example',
        artifactId: 'my-api',
        customField: 'custom value',
        modules: { core: true },
      };
      const result = ProjectConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customField).toBe('custom value');
      }
    });
  });

  describe('GenerateRequestSchema', () => {
    it('should validate valid generate request', () => {
      const data = {
        project: {
          name: 'My API',
          groupId: 'com.example',
          artifactId: 'my-api',
        },
        sql: 'CREATE TABLE users (id BIGINT PRIMARY KEY, name VARCHAR(255));',
      };
      const result = GenerateRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty SQL string', () => {
      const data = {
        project: {
          name: 'My API',
          groupId: 'com.example',
          artifactId: 'my-api',
        },
        sql: '',
      };
      const result = GenerateRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing project', () => {
      const data = {
        sql: 'CREATE TABLE users (id BIGINT PRIMARY KEY);',
      };
      const result = GenerateRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing sql', () => {
      const data = {
        project: {
          name: 'My API',
          groupId: 'com.example',
          artifactId: 'my-api',
        },
      };
      const result = GenerateRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
