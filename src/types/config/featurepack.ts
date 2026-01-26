/**
 * Feature Pack 2025 Configuration Types
 *
 * This module contains type definitions for the 5 features of the Feature Pack 2025:
 * - Social Login (Google, GitHub, Facebook, Apple, Microsoft)
 * - Password Reset (email-based password recovery)
 * - Mail Service (SMTP email sending)
 * - File Storage (local, S3, GCS, Azure Blob)
 * - JTE Templates (Java Template Engine for email templates)
 */

// ============================================================================
// SOCIAL LOGIN CONFIGURATION
// ============================================================================

/**
 * Supported OAuth 2.0 social login providers.
 */
export type SocialProvider = 'google' | 'github' | 'facebook' | 'apple' | 'microsoft';

/**
 * Configuration for a single social login provider.
 */
export interface SocialProviderConfig {
  /** Whether this provider is enabled */
  enabled: boolean;
  /** OAuth 2.0 client ID */
  clientId: string;
  /** OAuth 2.0 client secret (stored securely) */
  clientSecret: string;
  /** OAuth 2.0 scopes to request */
  scopes: string[];
}

/**
 * Social login configuration.
 * Enables OAuth 2.0 social authentication with popular identity providers.
 */
export interface SocialLoginConfig {
  /** Enable social login feature */
  enabled: boolean;
  /** Allow automatic account linking when email matches */
  autoLinkAccounts: boolean;
  /** Require email verification for new social accounts */
  requireEmailVerification: boolean;
  /** Provider-specific configurations */
  providers: Record<SocialProvider, SocialProviderConfig>;
}

// ============================================================================
// PASSWORD RESET CONFIGURATION
// ============================================================================

/**
 * Password reset configuration.
 * Enables email-based password recovery flow.
 */
export interface PasswordResetConfig {
  /** Enable password reset feature */
  enabled: boolean;
  /** Reset token expiration time in minutes */
  tokenExpirationMinutes: number;
  /** Maximum reset attempts per hour */
  maxAttemptsPerHour: number;
  /** Reset token length in characters */
  tokenLength: number;
  /** Require current password for authenticated password change */
  requireCurrentPassword: boolean;
  /** Minimum time between reset requests in seconds */
  cooldownSeconds: number;
}

// ============================================================================
// MAIL SERVICE CONFIGURATION
// ============================================================================

/**
 * SMTP encryption protocol options.
 */
export type SmtpEncryption = 'none' | 'tls' | 'starttls';

/**
 * Mail service configuration.
 * Configures SMTP settings for sending emails.
 */
export interface MailConfig {
  /** Enable mail service */
  enabled: boolean;
  /** SMTP server host */
  host: string;
  /** SMTP server port */
  port: number;
  /** SMTP username for authentication */
  username: string;
  /** SMTP password for authentication */
  password: string;
  /** Encryption protocol */
  encryption: SmtpEncryption;
  /** Default sender email address */
  fromAddress: string;
  /** Default sender display name */
  fromName: string;
  /** Connection timeout in milliseconds */
  connectionTimeoutMs: number;
  /** Read timeout in milliseconds */
  readTimeoutMs: number;
  /** Enable debug mode for SMTP communication */
  debug: boolean;
}

// ============================================================================
// FILE STORAGE CONFIGURATION
// ============================================================================

/**
 * Supported file storage providers.
 */
export type StorageProvider = 'local' | 's3' | 'gcs' | 'azure';

/**
 * Local filesystem storage configuration.
 */
export interface LocalStorageConfig {
  /** Base directory for file storage */
  basePath: string;
  /** Create directories if they don't exist */
  createDirectories: boolean;
}

/**
 * Amazon S3 storage configuration.
 */
export interface S3StorageConfig {
  /** S3 bucket name */
  bucket: string;
  /** AWS region */
  region: string;
  /** AWS access key ID */
  accessKeyId: string;
  /** AWS secret access key */
  secretAccessKey: string;
  /** Optional custom endpoint for S3-compatible storage */
  endpoint?: string;
  /** Enable path-style access (for S3-compatible storage) */
  pathStyleAccess: boolean;
}

/**
 * Google Cloud Storage configuration.
 */
export interface GcsStorageConfig {
  /** GCS bucket name */
  bucket: string;
  /** GCP project ID */
  projectId: string;
  /** Path to service account credentials JSON file */
  credentialsPath: string;
}

/**
 * Azure Blob Storage configuration.
 */
export interface AzureStorageConfig {
  /** Azure storage account name */
  accountName: string;
  /** Azure storage account key */
  accountKey: string;
  /** Azure Blob container name */
  containerName: string;
  /** Optional custom endpoint */
  endpoint?: string;
}

/**
 * File storage configuration.
 * Supports multiple storage backends: local, S3, GCS, Azure Blob.
 */
export interface StorageConfig {
  /** Enable file storage feature */
  enabled: boolean;
  /** Active storage provider */
  provider: StorageProvider;
  /** Maximum file size in bytes */
  maxFileSizeBytes: number;
  /** Allowed file extensions (empty array = all allowed) */
  allowedExtensions: string[];
  /** Enable file type validation by content */
  validateContentType: boolean;
  /** Generate unique filenames to prevent conflicts */
  generateUniqueNames: boolean;
  /** Local storage configuration */
  local: LocalStorageConfig;
  /** S3 storage configuration */
  s3: S3StorageConfig;
  /** GCS storage configuration */
  gcs: GcsStorageConfig;
  /** Azure Blob storage configuration */
  azure: AzureStorageConfig;
}

// ============================================================================
// JTE TEMPLATES CONFIGURATION
// ============================================================================

/**
 * JTE (Java Template Engine) configuration.
 * Used for rendering email templates and other dynamic content.
 */
export interface JteConfig {
  /** Enable JTE templates */
  enabled: boolean;
  /** Selected template IDs to generate */
  selectedTemplates: string[];
  /** Directory containing template files */
  templateDirectory: string;
  /** Template file extension */
  templateExtension: string;
  /** Enable template precompilation for production */
  precompileTemplates: boolean;
  /** Enable hot reload in development mode */
  developmentMode: boolean;
  /** Enable HTML output escaping by default */
  htmlOutputEscaping: boolean;
  /** Content type for rendered templates */
  contentType: string;
}

// ============================================================================
// AGGREGATE FEATURE PACK CONFIG
// ============================================================================

/**
 * Feature Pack 2025 aggregate configuration.
 * Contains all 5 feature configurations.
 */
export interface FeaturePackConfig {
  /** Social login configuration */
  socialLogin: SocialLoginConfig;
  /** Password reset configuration */
  passwordReset: PasswordResetConfig;
  /** Mail service configuration */
  mail: MailConfig;
  /** File storage configuration */
  storage: StorageConfig;
  /** JTE templates configuration */
  jte: JteConfig;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default social provider configuration.
 */
const defaultSocialProviderConfig: SocialProviderConfig = {
  enabled: false,
  clientId: '',
  clientSecret: '',
  scopes: [],
};

/**
 * Default social login configuration.
 */
export const defaultSocialLoginConfig: SocialLoginConfig = {
  enabled: false,
  autoLinkAccounts: false,
  requireEmailVerification: true,
  providers: {
    google: { ...defaultSocialProviderConfig, scopes: ['openid', 'email', 'profile'] },
    github: { ...defaultSocialProviderConfig, scopes: ['user:email', 'read:user'] },
    facebook: { ...defaultSocialProviderConfig, scopes: ['email', 'public_profile'] },
    apple: { ...defaultSocialProviderConfig, scopes: ['name', 'email'] },
    microsoft: { ...defaultSocialProviderConfig, scopes: ['openid', 'email', 'profile'] },
  },
};

/**
 * Default password reset configuration.
 */
export const defaultPasswordResetConfig: PasswordResetConfig = {
  enabled: false,
  tokenExpirationMinutes: 60,
  maxAttemptsPerHour: 5,
  tokenLength: 64,
  requireCurrentPassword: true,
  cooldownSeconds: 60,
};

/**
 * Default mail configuration.
 */
export const defaultMailConfig: MailConfig = {
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
};

/**
 * Default storage configuration.
 */
export const defaultStorageConfig: StorageConfig = {
  enabled: false,
  provider: 'local',
  maxFileSizeBytes: 10485760, // 10 MB
  allowedExtensions: [],
  validateContentType: true,
  generateUniqueNames: true,
  local: {
    basePath: './uploads',
    createDirectories: true,
  },
  s3: {
    bucket: '',
    region: 'us-east-1',
    accessKeyId: '',
    secretAccessKey: '',
    pathStyleAccess: false,
  },
  gcs: {
    bucket: '',
    projectId: '',
    credentialsPath: '',
  },
  azure: {
    accountName: '',
    accountKey: '',
    containerName: '',
  },
};

/**
 * Default JTE configuration.
 */
export const defaultJteConfig: JteConfig = {
  enabled: false,
  selectedTemplates: [],
  templateDirectory: 'templates',
  templateExtension: '.jte',
  precompileTemplates: true,
  developmentMode: false,
  htmlOutputEscaping: true,
  contentType: 'text/html',
};

/**
 * Default Feature Pack configuration.
 */
export const defaultFeaturePackConfig: FeaturePackConfig = {
  socialLogin: defaultSocialLoginConfig,
  passwordReset: defaultPasswordResetConfig,
  mail: defaultMailConfig,
  storage: defaultStorageConfig,
  jte: defaultJteConfig,
};
