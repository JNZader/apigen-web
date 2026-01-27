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
    packageManager: 'maven',
    defaultVersion: '25',
    availableVersions: ['21', '25'],
    frameworks: ['spring-boot'],
    icon: 'java',
  },
  kotlin: {
    label: 'Kotlin',
    fileExtension: '.kt',
    packageManager: 'maven',
    defaultVersion: '2.3',
    availableVersions: ['2.0', '2.1', '2.3'],
    frameworks: ['spring-boot'],
    icon: 'kotlin',
  },
  python: {
    label: 'Python',
    fileExtension: '.py',
    packageManager: 'pip',
    defaultVersion: '3.12',
    availableVersions: ['3.11', '3.12', '3.13'],
    frameworks: ['fastapi'],
    icon: 'python',
  },
  typescript: {
    label: 'TypeScript',
    fileExtension: '.ts',
    packageManager: 'npm',
    defaultVersion: '5.9',
    availableVersions: ['5.5', '5.7', '5.9'],
    frameworks: ['nestjs'],
    icon: 'typescript',
  },
  php: {
    label: 'PHP',
    fileExtension: '.php',
    packageManager: 'composer',
    defaultVersion: '8.4',
    availableVersions: ['8.2', '8.3', '8.4'],
    frameworks: ['laravel'],
    icon: 'php',
  },
  go: {
    label: 'Go',
    fileExtension: '.go',
    packageManager: 'go',
    defaultVersion: '1.23',
    availableVersions: ['1.22', '1.23'],
    frameworks: ['gin', 'chi'],
    icon: 'go',
  },
  rust: {
    label: 'Rust',
    fileExtension: '.rs',
    packageManager: 'cargo',
    defaultVersion: '1.85',
    availableVersions: ['1.82', '1.83', '1.85'],
    frameworks: ['axum'],
    icon: 'rust',
  },
  csharp: {
    label: 'C#',
    fileExtension: '.cs',
    packageManager: 'nuget',
    defaultVersion: '12',
    availableVersions: ['11', '12'],
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
    defaultVersion: '4.0.0',
    availableVersions: ['3.3.0', '3.4.0', '4.0.0'],
    docsUrl: 'https://spring.io/projects/spring-boot',
    icon: 'spring',
  },
  fastapi: {
    label: 'FastAPI',
    language: 'python',
    defaultVersion: '0.128',
    availableVersions: ['0.115', '0.128'],
    docsUrl: 'https://fastapi.tiangolo.com/',
    icon: 'fastapi',
  },
  nestjs: {
    label: 'NestJS',
    language: 'typescript',
    defaultVersion: '11.1',
    availableVersions: ['10.0', '11.0', '11.1'],
    docsUrl: 'https://nestjs.com/',
    icon: 'nestjs',
  },
  laravel: {
    label: 'Laravel',
    language: 'php',
    defaultVersion: '12.0',
    availableVersions: ['11.0', '12.0'],
    docsUrl: 'https://laravel.com/',
    icon: 'laravel',
  },
  gin: {
    label: 'Gin',
    language: 'go',
    defaultVersion: '1.10',
    availableVersions: ['1.9', '1.10'],
    docsUrl: 'https://gin-gonic.com/',
    icon: 'gin',
  },
  chi: {
    label: 'Chi',
    language: 'go',
    defaultVersion: '5.2',
    availableVersions: ['5.0', '5.1', '5.2'],
    docsUrl: 'https://go-chi.io/',
    icon: 'chi',
  },
  axum: {
    label: 'Axum',
    language: 'rust',
    defaultVersion: '0.8',
    availableVersions: ['0.7', '0.8'],
    docsUrl: 'https://github.com/tokio-rs/axum',
    icon: 'axum',
  },
  'aspnet-core': {
    label: 'ASP.NET Core',
    language: 'csharp',
    defaultVersion: '8.0',
    availableVersions: ['7.0', '8.0'],
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
