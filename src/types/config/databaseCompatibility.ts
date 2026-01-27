// ============================================================================
// DATABASE/LANGUAGE COMPATIBILITY MATRIX
// ============================================================================

import type { ServiceDatabaseType } from '../service';
import type { Language } from '../target';

/**
 * Compatibility matrix defining which databases are supported by each language.
 *
 * Notes:
 * - H2 is only supported by Java/Kotlin (JVM-based)
 * - MongoDB has limited or no official support in Rust
 * - All languages support PostgreSQL, MySQL, and Redis
 */
export const DATABASE_COMPATIBILITY: Record<Language, readonly ServiceDatabaseType[]> = {
  java: ['postgresql', 'mysql', 'mongodb', 'redis', 'h2'],
  kotlin: ['postgresql', 'mysql', 'mongodb', 'redis', 'h2'],
  python: ['postgresql', 'mysql', 'mongodb', 'redis'],
  typescript: ['postgresql', 'mysql', 'mongodb', 'redis'],
  php: ['postgresql', 'mysql', 'mongodb', 'redis'],
  go: ['postgresql', 'mysql', 'mongodb', 'redis'],
  rust: ['postgresql', 'mysql', 'redis'], // Limited MongoDB support in Rust
  csharp: ['postgresql', 'mysql', 'mongodb', 'redis'],
} as const;

/**
 * Languages that support H2 in-memory database (JVM-based only)
 */
export const H2_COMPATIBLE_LANGUAGES: readonly Language[] = ['java', 'kotlin'] as const;

/**
 * Check if a database type is compatible with a language.
 *
 * @param language - Target language
 * @param database - Database type to check
 * @returns true if the database is supported by the language
 */
export function isDatabaseCompatible(language: Language, database: ServiceDatabaseType): boolean {
  return DATABASE_COMPATIBILITY[language]?.includes(database) ?? false;
}

/**
 * Get all compatible databases for a language.
 *
 * @param language - Target language
 * @returns Array of compatible database types
 */
export function getCompatibleDatabases(language: Language): readonly ServiceDatabaseType[] {
  return DATABASE_COMPATIBILITY[language] ?? [];
}

/**
 * Check if a language supports H2 in-memory database.
 *
 * @param language - Target language
 * @returns true if H2 is supported (JVM languages only)
 */
export function isH2Compatible(language: Language): boolean {
  return H2_COMPATIBLE_LANGUAGES.includes(language);
}

/**
 * Get a user-friendly compatibility warning message if needed.
 *
 * @param language - Target language
 * @param database - Database type
 * @returns Warning message or undefined if compatible
 */
export function getDatabaseCompatibilityWarning(
  language: Language,
  database: ServiceDatabaseType,
): string | undefined {
  if (isDatabaseCompatible(language, database)) {
    return undefined;
  }

  if (database === 'h2') {
    return `H2 in-memory database is only available for Java and Kotlin. Consider using PostgreSQL or MySQL instead.`;
  }

  if (database === 'mongodb' && language === 'rust') {
    return `MongoDB support in Rust is limited. Consider using PostgreSQL or MySQL for better compatibility.`;
  }

  return `${database} may have limited support with ${language}. Check your framework's documentation for compatibility.`;
}
