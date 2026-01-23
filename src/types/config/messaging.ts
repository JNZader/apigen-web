/**
 * Messaging Configuration Types
 *
 * This module contains messaging-related type definitions including
 * webhooks and internationalization (i18n) configuration.
 */

// ============================================================================
// WEBHOOK EVENT TYPES
// ============================================================================

/**
 * Supported webhook event types.
 * Events that can trigger webhook notifications.
 */
export type WebhookEventType =
  | 'entity.created'
  | 'entity.updated'
  | 'entity.deleted'
  | 'entity.restored'
  | 'batch.import_completed'
  | 'batch.export_completed'
  | 'user.login'
  | 'user.logout'
  | 'user.login_failed'
  | 'security.rate_limit_exceeded'
  | 'security.unauthorized_access'
  | 'system.ping'
  | 'system.health_changed';

// ============================================================================
// WEBHOOKS CONFIGURATION
// ============================================================================

/**
 * Webhooks configuration for event notifications.
 * Enables HTTP callbacks for various system events.
 */
export interface WebhooksConfig {
  /** Enable webhook functionality */
  enabled: boolean;
  /** List of enabled event types */
  events: WebhookEventType[];
  /** Connection timeout in seconds */
  connectTimeoutSeconds: number;
  /** Request timeout in seconds */
  requestTimeoutSeconds: number;
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries in seconds */
  retryBaseDelaySeconds: number;
  /** Maximum delay between retries in minutes */
  retryMaxDelayMinutes: number;
}

// ============================================================================
// INTERNATIONALIZATION (i18n)
// ============================================================================

/**
 * Supported locale codes for internationalization.
 */
export type SupportedLocale = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko';

/**
 * Internationalization configuration.
 * Supports multiple languages for API responses.
 */
export interface I18nConfig {
  /** Enable internationalization */
  enabled: boolean;
  /** Default locale when none specified */
  defaultLocale: SupportedLocale;
  /** List of supported locales */
  supportedLocales: SupportedLocale[];
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default webhooks configuration values.
 */
export const defaultWebhooksConfig: WebhooksConfig = {
  enabled: false,
  events: [
    'entity.created',
    'entity.updated',
    'entity.deleted',
    'user.login',
    'user.logout',
    'system.ping',
  ],
  connectTimeoutSeconds: 5,
  requestTimeoutSeconds: 30,
  maxRetries: 3,
  retryBaseDelaySeconds: 1,
  retryMaxDelayMinutes: 5,
};

/**
 * Default i18n configuration values.
 */
export const defaultI18nConfig: I18nConfig = {
  enabled: false,
  defaultLocale: 'en',
  supportedLocales: ['en', 'es'],
};
