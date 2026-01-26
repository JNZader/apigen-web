// Configuration constants for the application
// These can be overridden by environment variables for different deployment environments

export const API_CONFIG = {
  // API server URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8081',

  // Timeout configurations (in milliseconds)
  HEALTH_CHECK_TIMEOUT: parseInt(import.meta.env.VITE_API_HEALTH_TIMEOUT || '10000', 10), // 10 seconds
  GENERATION_TIMEOUT: parseInt(import.meta.env.VITE_API_GENERATION_TIMEOUT || '120000', 10), // 2 minutes
  GENERATION_REQUEST_TIMEOUT: parseInt(
    import.meta.env.VITE_API_GENERATION_REQUEST_TIMEOUT || '60000',
    10,
  ), // 60 seconds
} as const;

export const ARCHIVE_CONFIG = {
  // Archive safety limits
  MAX_FILES_IN_ARCHIVE: parseInt(import.meta.env.VITE_MAX_FILES_IN_ARCHIVE || '1000', 10),
  MAX_TOTAL_SIZE_BYTES: parseInt(import.meta.env.VITE_MAX_TOTAL_SIZE_MB || '100', 10) * 1024 * 1024, // 100 MB default
  MAX_SINGLE_FILE_SIZE_BYTES:
    parseInt(import.meta.env.VITE_MAX_SINGLE_FILE_SIZE_MB || '10', 10) * 1024 * 1024, // 10 MB default
} as const;

export const UI_CONFIG = {
  // UI behavior limits
  MAX_ENTITIES_VIRTUALIZATION: parseInt(
    import.meta.env.VITE_MAX_ENTITIES_VIRTUALIZATION || '50',
    10,
  ),
  DEBOUNCE_DELAY_MS: parseInt(import.meta.env.VITE_DEBOUNCE_DELAY_MS || '100', 10),
  THROTTLE_COOLDOWN_MS: parseInt(import.meta.env.VITE_THROTTLE_COOLDOWN_MS || '1000', 10),
} as const;

export const LOG_CONFIG = {
  // Logging configuration
  LOG_LEVEL: (import.meta.env.VITE_LOG_LEVEL ||
    (import.meta.env.MODE === 'production' ? 'error' : 'debug')) as
    | 'debug'
    | 'info'
    | 'warn'
    | 'error',
  MAX_LOG_HISTORY: parseInt(import.meta.env.VITE_MAX_LOG_HISTORY || '100', 10),
} as const;
