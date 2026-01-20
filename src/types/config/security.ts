/**
 * Security Configuration Types
 *
 * This module contains all security-related type definitions including
 * JWT, OAuth2, PKCE, and security headers configuration.
 */

// ============================================================================
// SECURITY MODE TYPE
// ============================================================================

/**
 * Authentication mode for the API.
 * - 'jwt': JSON Web Token based authentication
 * - 'oauth2': OAuth 2.0 resource server configuration
 */
export type SecurityMode = 'jwt' | 'oauth2';

// ============================================================================
// JWT KEY ROTATION
// ============================================================================

/**
 * Configuration for JWT key rotation.
 * Enables seamless key rotation without invalidating existing tokens.
 */
export interface JwtKeyRotationConfig {
  /** Whether key rotation is enabled */
  enabled: boolean;
  /** Current active key identifier */
  currentKeyId: string;
  /** List of previous key IDs that are still valid for verification */
  previousKeyIds: string[];
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * HTTP Referrer Policy options.
 * Controls how much referrer information is included with requests.
 */
export type ReferrerPolicy =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

/**
 * Security headers configuration for HTTP responses.
 * Implements OWASP recommended security headers.
 */
export interface SecurityHeadersConfig {
  /** Content Security Policy directive string */
  contentSecurityPolicy: string;
  /** Referrer-Policy header value */
  referrerPolicy: ReferrerPolicy;
  /** Permissions-Policy (formerly Feature-Policy) directive string */
  permissionsPolicy: string;
  /** Enable HTTP Strict Transport Security (HSTS) */
  hstsEnabled: boolean;
  /** HSTS max-age in seconds */
  hstsMaxAgeSeconds: number;
  /** Include subdomains in HSTS policy */
  hstsIncludeSubdomains: boolean;
  /** Enable HSTS preload list */
  hstsPreload: boolean;
}

// ============================================================================
// OAUTH2 CONFIGURATION
// ============================================================================

/**
 * OAuth 2.0 resource server configuration.
 * Used when integrating with external identity providers.
 */
export interface OAuth2Config {
  /** OAuth 2.0 issuer URI (e.g., https://auth.example.com) */
  issuerUri: string;
  /** Expected audience claim value */
  audience: string;
  /** JWT claim containing user roles/permissions */
  rolesClaim: string;
  /** Prefix to add to roles (e.g., 'ROLE_') */
  rolePrefix: string;
  /** JWT claim containing the username/subject */
  usernameClaim: string;
}

// ============================================================================
// PKCE CONFIGURATION
// ============================================================================

/**
 * Proof Key for Code Exchange (PKCE) configuration.
 * Enhances OAuth 2.0 authorization code flow security.
 */
export interface PkceConfig {
  /** Enable PKCE support */
  enabled: boolean;
  /** Authorization code expiration time in minutes */
  codeExpirationMinutes: number;
  /** Require S256 challenge method (recommended) */
  requireS256: boolean;
  /** Minimum length for code verifier */
  minCodeVerifierLength: number;
}

// ============================================================================
// MAIN SECURITY CONFIG
// ============================================================================

/**
 * JWT secret key length options.
 * Larger keys provide stronger security but may impact performance.
 */
export type JwtSecretLength = 32 | 64 | 128;

/**
 * Main security configuration interface.
 * Contains all security-related settings for the API.
 */
export interface SecurityConfig {
  /** Authentication mode (jwt or oauth2) */
  mode: SecurityMode;
  /** JWT secret key length in bytes */
  jwtSecretLength: JwtSecretLength;
  /** Access token expiration time in minutes */
  accessTokenExpiration: number;
  /** Refresh token expiration time in days */
  refreshTokenExpiration: number;
  /** Enable refresh token support */
  enableRefreshToken: boolean;
  /** Enable token blacklist for logout/revocation */
  enableTokenBlacklist: boolean;
  /** Minimum password length requirement */
  passwordMinLength: number;
  /** Maximum failed login attempts before lockout */
  maxLoginAttempts: number;
  /** Account lockout duration in minutes */
  lockoutMinutes: number;
  /** JWT key rotation configuration */
  keyRotation: JwtKeyRotationConfig;
  /** Security headers configuration */
  headers: SecurityHeadersConfig;
  /** OAuth 2.0 configuration */
  oauth2: OAuth2Config;
  /** PKCE configuration */
  pkce: PkceConfig;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default security configuration values.
 */
export const defaultSecurityConfig: SecurityConfig = {
  mode: 'jwt',
  jwtSecretLength: 64,
  accessTokenExpiration: 30,
  refreshTokenExpiration: 7,
  enableRefreshToken: true,
  enableTokenBlacklist: true,
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutMinutes: 15,
  keyRotation: {
    enabled: false,
    currentKeyId: 'key-2025-01',
    previousKeyIds: [],
  },
  headers: {
    contentSecurityPolicy: "default-src 'self'",
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), camera=(), microphone=()',
    hstsEnabled: true,
    hstsMaxAgeSeconds: 31536000,
    hstsIncludeSubdomains: true,
    hstsPreload: false,
  },
  oauth2: {
    issuerUri: '',
    audience: '',
    rolesClaim: 'permissions',
    rolePrefix: 'ROLE_',
    usernameClaim: 'sub',
  },
  pkce: {
    enabled: false,
    codeExpirationMinutes: 10,
    requireS256: true,
    minCodeVerifierLength: 43,
  },
};
