// ============================================================================
// TARGET CONFIGURATION TYPES FOR CODE GENERATION
// ============================================================================

/**
 * Supported programming languages for code generation.
 */
export type Language =
  | 'java'
  | 'kotlin'
  | 'python'
  | 'typescript'
  | 'php'
  | 'go'
  | 'rust'
  | 'csharp';

/**
 * Supported frameworks for each language.
 */
export type Framework =
  | 'spring-boot' // Java, Kotlin
  | 'fastapi' // Python
  | 'nestjs' // TypeScript
  | 'laravel' // PHP
  | 'gin' // Go
  | 'chi' // Go
  | 'axum' // Rust
  | 'aspnet-core'; // C#

/**
 * Mapping of languages to their compatible frameworks.
 */
export type LanguageFrameworkMap = {
  java: 'spring-boot';
  kotlin: 'spring-boot';
  python: 'fastapi';
  typescript: 'nestjs';
  php: 'laravel';
  go: 'gin' | 'chi';
  rust: 'axum';
  csharp: 'aspnet-core';
};

/**
 * Target configuration for code generation.
 */
export interface TargetConfig {
  /** Target programming language */
  language: Language;
  /** Target framework */
  framework: Framework;
  /** Language version (e.g., '21' for Java, '3.12' for Python) */
  languageVersion: string;
  /** Framework version (e.g., '4.0.0' for Spring Boot) */
  frameworkVersion: string;
}

// ============================================================================
// LANGUAGE METADATA
// ============================================================================

/**
 * Metadata for a programming language.
 */
export interface LanguageMetadata {
  /** Display name */
  label: string;
  /** File extension for source files */
  fileExtension: string;
  /** Package manager (e.g., 'maven', 'pip', 'npm') */
  packageManager: string;
  /** Default/recommended version */
  defaultVersion: string;
  /** Available versions */
  availableVersions: string[];
  /** Compatible frameworks */
  frameworks: Framework[];
  /** Icon identifier for UI */
  icon: string;
}

/**
 * Metadata for a framework.
 */
export interface FrameworkMetadata {
  /** Display name */
  label: string;
  /** Parent language */
  language: Language;
  /** Default/recommended version */
  defaultVersion: string;
  /** Available versions */
  availableVersions: string[];
  /** Documentation URL */
  docsUrl: string;
  /** Icon identifier for UI */
  icon: string;
}

// ============================================================================
// LANGUAGE METADATA CONSTANTS
// ============================================================================

/**
 * Metadata for all supported languages.
 */
export const LANGUAGE_METADATA: Record<Language, LanguageMetadata> = {
  java: {
    label: 'Java',
    fileExtension: '.java',
    packageManager: 'gradle',
    defaultVersion: '25',
    availableVersions: ['25'],
    frameworks: ['spring-boot'],
    icon: 'java',
  },
  kotlin: {
    label: 'Kotlin',
    fileExtension: '.kt',
    packageManager: 'gradle',
    defaultVersion: '25',
    availableVersions: ['25'],
    frameworks: ['spring-boot'],
    icon: 'kotlin',
  },
  python: {
    label: 'Python',
    fileExtension: '.py',
    packageManager: 'pip',
    defaultVersion: '3.12',
    availableVersions: ['3.12'],
    frameworks: ['fastapi'],
    icon: 'python',
  },
  typescript: {
    label: 'TypeScript',
    fileExtension: '.ts',
    packageManager: 'npm',
    defaultVersion: '20',
    availableVersions: ['20'],
    frameworks: ['nestjs'],
    icon: 'typescript',
  },
  php: {
    label: 'PHP',
    fileExtension: '.php',
    packageManager: 'composer',
    defaultVersion: '8.4',
    availableVersions: ['8.4'],
    frameworks: ['laravel'],
    icon: 'php',
  },
  go: {
    label: 'Go',
    fileExtension: '.go',
    packageManager: 'go',
    defaultVersion: '1.23',
    availableVersions: ['1.23'],
    frameworks: ['gin', 'chi'],
    icon: 'go',
  },
  rust: {
    label: 'Rust',
    fileExtension: '.rs',
    packageManager: 'cargo',
    defaultVersion: '1.85',
    availableVersions: ['1.85'],
    frameworks: ['axum'],
    icon: 'rust',
  },
  csharp: {
    label: 'C#',
    fileExtension: '.cs',
    packageManager: 'dotnet',
    defaultVersion: '8.0',
    availableVersions: ['8.0'],
    frameworks: ['aspnet-core'],
    icon: 'csharp',
  },
};

// ============================================================================
// FRAMEWORK METADATA CONSTANTS
// ============================================================================

/**
 * Metadata for all supported frameworks.
 */
export const FRAMEWORK_METADATA: Record<Framework, FrameworkMetadata> = {
  'spring-boot': {
    label: 'Spring Boot',
    language: 'java',
    defaultVersion: '3.4.0',
    availableVersions: ['3.4.0'],
    docsUrl: 'https://spring.io/projects/spring-boot',
    icon: 'spring',
  },
  fastapi: {
    label: 'FastAPI',
    language: 'python',
    defaultVersion: '0.115',
    availableVersions: ['0.115'],
    docsUrl: 'https://fastapi.tiangolo.com/',
    icon: 'fastapi',
  },
  nestjs: {
    label: 'NestJS',
    language: 'typescript',
    defaultVersion: '10.0',
    availableVersions: ['10.0'],
    docsUrl: 'https://nestjs.com/',
    icon: 'nestjs',
  },
  laravel: {
    label: 'Laravel',
    language: 'php',
    defaultVersion: '11.0',
    availableVersions: ['11.0'],
    docsUrl: 'https://laravel.com/',
    icon: 'laravel',
  },
  gin: {
    label: 'Gin',
    language: 'go',
    defaultVersion: '1.10',
    availableVersions: ['1.10'],
    docsUrl: 'https://gin-gonic.com/',
    icon: 'gin',
  },
  chi: {
    label: 'Chi',
    language: 'go',
    defaultVersion: '5.1',
    availableVersions: ['5.1'],
    docsUrl: 'https://go-chi.io/',
    icon: 'chi',
  },
  axum: {
    label: 'Axum',
    language: 'rust',
    defaultVersion: '0.7',
    availableVersions: ['0.7'],
    docsUrl: 'https://github.com/tokio-rs/axum',
    icon: 'axum',
  },
  'aspnet-core': {
    label: 'ASP.NET Core',
    language: 'csharp',
    defaultVersion: '8.0',
    availableVersions: ['8.0'],
    docsUrl: 'https://dotnet.microsoft.com/apps/aspnet',
    icon: 'dotnet',
  },
};

// ============================================================================
// HELPER CONSTANTS
// ============================================================================

/**
 * All supported languages as an array.
 */
export const LANGUAGES: Language[] = [
  'java',
  'kotlin',
  'python',
  'typescript',
  'php',
  'go',
  'rust',
  'csharp',
];

/**
 * All supported frameworks as an array.
 */
export const FRAMEWORKS: Framework[] = [
  'spring-boot',
  'fastapi',
  'nestjs',
  'laravel',
  'gin',
  'chi',
  'axum',
  'aspnet-core',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get frameworks compatible with a language.
 */
export function getFrameworksForLanguage(language: Language): Framework[] {
  return LANGUAGE_METADATA[language].frameworks;
}

/**
 * Check if a framework is compatible with a language.
 */
export function isFrameworkCompatible(language: Language, framework: Framework): boolean {
  return LANGUAGE_METADATA[language].frameworks.includes(framework);
}

/**
 * Get the default framework for a language.
 */
export function getDefaultFramework(language: Language): Framework {
  return LANGUAGE_METADATA[language].frameworks[0];
}

/**
 * Create a default target configuration for a language.
 */
export function createDefaultTargetConfig(language: Language): TargetConfig {
  const languageMeta = LANGUAGE_METADATA[language];
  const framework = languageMeta.frameworks[0];
  const frameworkMeta = FRAMEWORK_METADATA[framework];

  return {
    language,
    framework,
    languageVersion: languageMeta.defaultVersion,
    frameworkVersion: frameworkMeta.defaultVersion,
  };
}

/**
 * Default target configuration (Java + Spring Boot).
 */
export const defaultTargetConfig: TargetConfig = createDefaultTargetConfig('java');
