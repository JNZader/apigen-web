/**
 * Zod schemas for API request/response validation.
 *
 * This module contains Zod schemas for:
 * - API response validation (Health, Generation)
 * - Target configuration (Language, Framework)
 * - Feature Pack 2025 (SocialLogin, Mail, Storage, JTE)
 * - Rust/Axum options (Edge presets, Server, Middleware)
 * - Generate request validation
 */
import { z } from 'zod';

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

/**
 * Health check response schema.
 */
export const HealthResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/**
 * Generation statistics schema.
 */
export const GenerationStatsSchema = z.object({
  tablesProcessed: z.number(),
  entitiesGenerated: z.number(),
  filesGenerated: z.number(),
  generationTimeMs: z.number(),
});

export type GenerationStats = z.infer<typeof GenerationStatsSchema>;

/**
 * Generate/validate response schema.
 */
export const GenerateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  generatedFiles: z.array(z.string()),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
  stats: GenerationStatsSchema.optional(),
});

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

// ============================================================================
// TARGET CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Supported programming languages.
 */
export const LanguageSchema = z.enum([
  'java',
  'kotlin',
  'python',
  'typescript',
  'php',
  'go',
  'rust',
  'csharp',
]);

export type LanguageSchemaType = z.infer<typeof LanguageSchema>;

/**
 * Supported frameworks.
 */
export const FrameworkSchema = z.enum([
  'spring-boot',
  'fastapi',
  'nestjs',
  'laravel',
  'gin',
  'chi',
  'axum',
  'aspnet-core',
]);

export type FrameworkSchemaType = z.infer<typeof FrameworkSchema>;

/**
 * Target configuration for code generation.
 */
export const TargetConfigSchema = z.object({
  language: LanguageSchema,
  framework: FrameworkSchema,
  languageVersion: z.string().min(1),
  frameworkVersion: z.string().min(1),
});

export type TargetConfigSchemaType = z.infer<typeof TargetConfigSchema>;

// ============================================================================
// SOCIAL LOGIN CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Supported social login providers.
 */
export const SocialProviderSchema = z.enum(['google', 'github', 'facebook', 'apple', 'microsoft']);

export type SocialProviderSchemaType = z.infer<typeof SocialProviderSchema>;

/**
 * Configuration for a single social login provider.
 */
export const SocialProviderConfigSchema = z.object({
  enabled: z.boolean(),
  clientId: z.string(),
  clientSecret: z.string(),
  scopes: z.array(z.string()),
});

export type SocialProviderConfigSchemaType = z.infer<typeof SocialProviderConfigSchema>;

/**
 * Social login configuration.
 */
export const SocialLoginConfigSchema = z.object({
  enabled: z.boolean(),
  autoLinkAccounts: z.boolean(),
  requireEmailVerification: z.boolean(),
  providers: z.record(SocialProviderSchema, SocialProviderConfigSchema),
});

export type SocialLoginConfigSchemaType = z.infer<typeof SocialLoginConfigSchema>;

// ============================================================================
// MAIL CONFIGURATION SCHEMAS
// ============================================================================

/**
 * SMTP encryption options.
 */
export const SmtpEncryptionSchema = z.enum(['none', 'tls', 'starttls']);

export type SmtpEncryptionSchemaType = z.infer<typeof SmtpEncryptionSchema>;

/**
 * Mail service configuration.
 */
export const MailConfigSchema = z.object({
  enabled: z.boolean(),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  username: z.string(),
  password: z.string(),
  encryption: SmtpEncryptionSchema,
  fromAddress: z.email(),
  fromName: z.string(),
  connectionTimeoutMs: z.number().int().nonnegative(),
  readTimeoutMs: z.number().int().nonnegative(),
  debug: z.boolean(),
});

export type MailConfigSchemaType = z.infer<typeof MailConfigSchema>;

// ============================================================================
// STORAGE CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Supported storage providers.
 */
export const StorageProviderSchema = z.enum(['local', 's3', 'gcs', 'azure']);

export type StorageProviderSchemaType = z.infer<typeof StorageProviderSchema>;

/**
 * Local filesystem storage configuration.
 */
export const LocalStorageConfigSchema = z.object({
  basePath: z.string().min(1),
  createDirectories: z.boolean(),
});

export type LocalStorageConfigSchemaType = z.infer<typeof LocalStorageConfigSchema>;

/**
 * Amazon S3 storage configuration.
 */
export const S3StorageConfigSchema = z.object({
  bucket: z.string(),
  region: z.string(),
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  endpoint: z.string().optional(),
  pathStyleAccess: z.boolean(),
});

export type S3StorageConfigSchemaType = z.infer<typeof S3StorageConfigSchema>;

/**
 * Google Cloud Storage configuration.
 */
export const GcsStorageConfigSchema = z.object({
  bucket: z.string(),
  projectId: z.string(),
  credentialsPath: z.string(),
});

export type GcsStorageConfigSchemaType = z.infer<typeof GcsStorageConfigSchema>;

/**
 * Azure Blob Storage configuration.
 */
export const AzureStorageConfigSchema = z.object({
  accountName: z.string(),
  accountKey: z.string(),
  containerName: z.string(),
  endpoint: z.string().optional(),
});

export type AzureStorageConfigSchemaType = z.infer<typeof AzureStorageConfigSchema>;

/**
 * File storage configuration.
 */
export const StorageConfigSchema = z.object({
  enabled: z.boolean(),
  provider: StorageProviderSchema,
  maxFileSizeBytes: z.number().int().positive(),
  allowedExtensions: z.array(z.string()),
  validateContentType: z.boolean(),
  generateUniqueNames: z.boolean(),
  local: LocalStorageConfigSchema,
  s3: S3StorageConfigSchema,
  gcs: GcsStorageConfigSchema,
  azure: AzureStorageConfigSchema,
});

export type StorageConfigSchemaType = z.infer<typeof StorageConfigSchema>;

// ============================================================================
// JTE CONFIGURATION SCHEMAS
// ============================================================================

/**
 * JTE (Java Template Engine) configuration.
 */
export const JteConfigSchema = z.object({
  enabled: z.boolean(),
  templateDirectory: z.string().min(1),
  templateExtension: z.string().min(1),
  precompileTemplates: z.boolean(),
  developmentMode: z.boolean(),
  htmlOutputEscaping: z.boolean(),
  contentType: z.string().min(1),
});

export type JteConfigSchemaType = z.infer<typeof JteConfigSchema>;

// ============================================================================
// RUST/AXUM CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Rust deployment presets.
 */
export const RustPresetSchema = z.enum(['cloud', 'edge-gateway', 'edge-anomaly', 'edge-ai']);

export type RustPresetSchemaType = z.infer<typeof RustPresetSchema>;

/**
 * Edge-specific configuration.
 */
export const EdgeConfigSchema = z.object({
  maxMemoryMb: z.number().int().nonnegative(),
  maxConnections: z.number().int().positive(),
  compressionEnabled: z.boolean(),
  connectionTimeoutMs: z.number().int().positive(),
  requestTimeoutMs: z.number().int().positive(),
  connectionPoolEnabled: z.boolean(),
  connectionPoolSize: z.number().int().positive(),
});

export type EdgeConfigSchemaType = z.infer<typeof EdgeConfigSchema>;

/**
 * Load balancing strategy options.
 */
export const LoadBalancingStrategySchema = z.enum(['round-robin', 'least-connections', 'ip-hash']);

export type LoadBalancingStrategySchemaType = z.infer<typeof LoadBalancingStrategySchema>;

/**
 * Edge gateway configuration.
 */
export const EdgeGatewayConfigSchema = z.object({
  routingEnabled: z.boolean(),
  loadBalancingEnabled: z.boolean(),
  loadBalancingStrategy: LoadBalancingStrategySchema,
  cachingEnabled: z.boolean(),
  cacheTtlSeconds: z.number().int().nonnegative(),
  rateLimitingEnabled: z.boolean(),
  rateLimitRps: z.number().int().positive(),
});

export type EdgeGatewayConfigSchemaType = z.infer<typeof EdgeGatewayConfigSchema>;

/**
 * Edge anomaly detection configuration.
 */
export const EdgeAnomalyConfigSchema = z.object({
  streamingEnabled: z.boolean(),
  bufferSizeKb: z.number().int().positive(),
  alertsEnabled: z.boolean(),
  alertThreshold: z.number().min(0).max(1),
  windowSizeSeconds: z.number().int().positive(),
  aggregationEnabled: z.boolean(),
});

export type EdgeAnomalyConfigSchemaType = z.infer<typeof EdgeAnomalyConfigSchema>;

/**
 * Edge AI inference configuration.
 */
export const EdgeAiConfigSchema = z.object({
  modelServingEnabled: z.boolean(),
  maxModelSizeMb: z.number().int().positive(),
  modelCachingEnabled: z.boolean(),
  inferenceThreads: z.number().int().positive(),
  batchInferenceEnabled: z.boolean(),
  maxBatchSize: z.number().int().positive(),
  inferenceTimeoutMs: z.number().int().positive(),
});

export type EdgeAiConfigSchemaType = z.infer<typeof EdgeAiConfigSchema>;

/**
 * Axum server configuration.
 */
export const AxumServerConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  workers: z.number().int().nonnegative(),
  keepAliveEnabled: z.boolean(),
  keepAliveTimeoutSeconds: z.number().int().positive(),
  maxBodySizeMb: z.number().int().positive(),
  gracefulShutdownEnabled: z.boolean(),
  gracefulShutdownTimeoutSeconds: z.number().int().positive(),
});

export type AxumServerConfigSchemaType = z.infer<typeof AxumServerConfigSchema>;

/**
 * Axum middleware configuration.
 */
export const AxumMiddlewareConfigSchema = z.object({
  tracingEnabled: z.boolean(),
  corsEnabled: z.boolean(),
  compressionEnabled: z.boolean(),
  compressionLevel: z.number().int().min(1).max(9),
  loggingEnabled: z.boolean(),
  requestIdEnabled: z.boolean(),
});

export type AxumMiddlewareConfigSchemaType = z.infer<typeof AxumMiddlewareConfigSchema>;

/**
 * Rust/Axum options configuration.
 */
export const RustAxumOptionsSchema = z.object({
  preset: RustPresetSchema,
  server: AxumServerConfigSchema,
  middleware: AxumMiddlewareConfigSchema,
  edge: EdgeConfigSchema,
  edgeGateway: EdgeGatewayConfigSchema,
  edgeAnomaly: EdgeAnomalyConfigSchema,
  edgeAi: EdgeAiConfigSchema,
});

export type RustAxumOptionsSchemaType = z.infer<typeof RustAxumOptionsSchema>;

// ============================================================================
// FEATURE PACK AGGREGATE SCHEMA
// ============================================================================

/**
 * Password reset configuration schema.
 */
export const PasswordResetConfigSchema = z.object({
  enabled: z.boolean(),
  tokenExpirationMinutes: z.number().int().positive(),
  maxAttemptsPerHour: z.number().int().positive(),
  tokenLength: z.number().int().positive(),
  requireCurrentPassword: z.boolean(),
  cooldownSeconds: z.number().int().nonnegative(),
});

export type PasswordResetConfigSchemaType = z.infer<typeof PasswordResetConfigSchema>;

/**
 * Feature Pack 2025 aggregate configuration.
 */
export const FeaturePackConfigSchema = z.object({
  socialLogin: SocialLoginConfigSchema,
  passwordReset: PasswordResetConfigSchema,
  mail: MailConfigSchema,
  storage: StorageConfigSchema,
  jte: JteConfigSchema,
});

export type FeaturePackConfigSchemaType = z.infer<typeof FeaturePackConfigSchema>;

// ============================================================================
// GENERATE REQUEST SCHEMA
// ============================================================================

/**
 * Project configuration schema for generation requests.
 * Uses passthrough() to allow additional fields from the full ProjectConfig.
 */
export const ProjectConfigSchema = z
  .object({
    name: z.string().min(1),
    groupId: z.string().min(1),
    artifactId: z.string().min(1),
    javaVersion: z.string().optional(),
    springBootVersion: z.string().optional(),
    // Additional fields use passthrough to allow flexibility
  })
  .passthrough();

export type ProjectConfigSchemaType = z.infer<typeof ProjectConfigSchema>;

/**
 * Generate request schema.
 * Validates the request body for project generation.
 */
export const GenerateRequestSchema = z.object({
  project: ProjectConfigSchema,
  sql: z.string(),
});

export type GenerateRequestSchemaType = z.infer<typeof GenerateRequestSchema>;
