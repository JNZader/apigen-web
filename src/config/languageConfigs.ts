// ============================================================================
// LANGUAGE & FRAMEWORK CONFIGURATION
// Centralized configuration for all supported languages and frameworks
// ============================================================================

import type { MantineColor } from '@mantine/core';
import {
  type Icon,
  IconBolt,
  IconBrandAzure,
  IconBrandCSharp,
  IconBrandGolang,
  IconBrandKotlin,
  IconBrandPhp,
  IconBrandPython,
  IconBrandRust,
  IconBrandTypescript,
  IconCode,
  IconCoffee,
  IconFeather,
  IconHexagon,
  IconLeaf,
  IconRouteSquare,
} from '@tabler/icons-react';
import type { Framework, Language } from '../types/target';

// ============================================================================
// ICON MAPPINGS
// ============================================================================

/**
 * React icon components for each language.
 * Uses Tabler Icons for consistent styling.
 */
export const LANGUAGE_ICONS: Record<Language, Icon> = {
  java: IconCoffee,
  kotlin: IconBrandKotlin,
  python: IconBrandPython,
  typescript: IconBrandTypescript,
  php: IconBrandPhp,
  go: IconBrandGolang,
  rust: IconBrandRust,
  csharp: IconBrandCSharp,
};

/**
 * React icon components for each framework.
 * Uses Tabler Icons for consistent styling.
 */
export const FRAMEWORK_ICONS: Record<Framework, Icon> = {
  'spring-boot': IconLeaf,
  fastapi: IconBolt,
  nestjs: IconCode,
  laravel: IconFeather,
  gin: IconHexagon,
  chi: IconRouteSquare,
  axum: IconHexagon,
  'aspnet-core': IconBrandAzure,
};

// ============================================================================
// COLOR MAPPINGS
// ============================================================================

/**
 * Mantine color names for each language.
 * These colors work with both light and dark themes.
 */
export const LANGUAGE_COLORS: Record<Language, MantineColor> = {
  java: 'orange',
  kotlin: 'grape',
  python: 'yellow',
  typescript: 'blue',
  php: 'indigo',
  go: 'cyan',
  rust: 'red',
  csharp: 'violet',
};

/**
 * Mantine color names for each framework.
 */
export const FRAMEWORK_COLORS: Record<Framework, MantineColor> = {
  'spring-boot': 'green',
  fastapi: 'teal',
  nestjs: 'red',
  laravel: 'pink',
  gin: 'cyan',
  chi: 'lime',
  axum: 'orange',
  'aspnet-core': 'blue',
};

/**
 * Hex color values for languages (for custom styling).
 */
export const LANGUAGE_HEX_COLORS: Record<Language, string> = {
  java: '#f89820',
  kotlin: '#7f52ff',
  python: '#3776ab',
  typescript: '#3178c6',
  php: '#777bb4',
  go: '#00add8',
  rust: '#ce412b',
  csharp: '#512bd4',
};

/**
 * Hex color values for frameworks (for custom styling).
 */
export const FRAMEWORK_HEX_COLORS: Record<Framework, string> = {
  'spring-boot': '#6db33f',
  fastapi: '#009688',
  nestjs: '#e0234e',
  laravel: '#ff2d20',
  gin: '#00add8',
  chi: '#00add8',
  axum: '#f74c00',
  'aspnet-core': '#512bd4',
};

// ============================================================================
// FEATURE SUPPORT
// ============================================================================

/**
 * Feature identifiers for code generation capabilities.
 */
export type FeatureId =
  | 'crud'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'caching'
  | 'rateLimit'
  | 'graphql'
  | 'grpc'
  | 'websocket'
  | 'swagger'
  | 'docker'
  | 'kubernetes'
  | 'microservices'
  | 'eventDriven'
  | 'circuitBreaker'
  | 'healthCheck'
  | 'metrics'
  | 'logging'
  | 'testing';

/**
 * Feature metadata with display information.
 */
export interface FeatureInfo {
  id: FeatureId;
  label: string;
  description: string;
  category: 'core' | 'api' | 'infrastructure' | 'observability';
}

/**
 * All available features with their metadata.
 */
export const FEATURES: Record<FeatureId, FeatureInfo> = {
  crud: {
    id: 'crud',
    label: 'CRUD Operations',
    description: 'Basic Create, Read, Update, Delete operations',
    category: 'core',
  },
  validation: {
    id: 'validation',
    label: 'Validation',
    description: 'Input validation and data constraints',
    category: 'core',
  },
  authentication: {
    id: 'authentication',
    label: 'Authentication',
    description: 'User authentication (JWT, OAuth, etc.)',
    category: 'core',
  },
  authorization: {
    id: 'authorization',
    label: 'Authorization',
    description: 'Role-based access control',
    category: 'core',
  },
  caching: {
    id: 'caching',
    label: 'Caching',
    description: 'Response caching with Redis or in-memory',
    category: 'infrastructure',
  },
  rateLimit: {
    id: 'rateLimit',
    label: 'Rate Limiting',
    description: 'API rate limiting and throttling',
    category: 'infrastructure',
  },
  graphql: {
    id: 'graphql',
    label: 'GraphQL',
    description: 'GraphQL API support',
    category: 'api',
  },
  grpc: {
    id: 'grpc',
    label: 'gRPC',
    description: 'gRPC service support',
    category: 'api',
  },
  websocket: {
    id: 'websocket',
    label: 'WebSocket',
    description: 'Real-time WebSocket connections',
    category: 'api',
  },
  swagger: {
    id: 'swagger',
    label: 'OpenAPI/Swagger',
    description: 'API documentation generation',
    category: 'api',
  },
  docker: {
    id: 'docker',
    label: 'Docker',
    description: 'Docker containerization support',
    category: 'infrastructure',
  },
  kubernetes: {
    id: 'kubernetes',
    label: 'Kubernetes',
    description: 'Kubernetes deployment manifests',
    category: 'infrastructure',
  },
  microservices: {
    id: 'microservices',
    label: 'Microservices',
    description: 'Service discovery and communication',
    category: 'infrastructure',
  },
  eventDriven: {
    id: 'eventDriven',
    label: 'Event-Driven',
    description: 'Message queues and event sourcing',
    category: 'infrastructure',
  },
  circuitBreaker: {
    id: 'circuitBreaker',
    label: 'Circuit Breaker',
    description: 'Resilience patterns for fault tolerance',
    category: 'infrastructure',
  },
  healthCheck: {
    id: 'healthCheck',
    label: 'Health Checks',
    description: 'Service health endpoints',
    category: 'observability',
  },
  metrics: {
    id: 'metrics',
    label: 'Metrics',
    description: 'Prometheus/OpenTelemetry metrics',
    category: 'observability',
  },
  logging: {
    id: 'logging',
    label: 'Structured Logging',
    description: 'Structured JSON logging',
    category: 'observability',
  },
  testing: {
    id: 'testing',
    label: 'Testing',
    description: 'Unit and integration tests',
    category: 'core',
  },
};

/**
 * Feature support status for a language/framework.
 */
export type FeatureSupport = 'full' | 'partial' | 'planned' | 'none';

/**
 * Feature support matrix by framework.
 */
export const FRAMEWORK_FEATURES: Record<Framework, Record<FeatureId, FeatureSupport>> = {
  'spring-boot': {
    crud: 'full',
    validation: 'full',
    authentication: 'full',
    authorization: 'full',
    caching: 'full',
    rateLimit: 'full',
    graphql: 'full',
    grpc: 'full',
    websocket: 'full',
    swagger: 'full',
    docker: 'full',
    kubernetes: 'full',
    microservices: 'full',
    eventDriven: 'full',
    circuitBreaker: 'full',
    healthCheck: 'full',
    metrics: 'full',
    logging: 'full',
    testing: 'full',
  },
  fastapi: {
    crud: 'full',
    validation: 'full',
    authentication: 'full',
    authorization: 'full',
    caching: 'partial',
    rateLimit: 'partial',
    graphql: 'partial',
    grpc: 'partial',
    websocket: 'full',
    swagger: 'full',
    docker: 'full',
    kubernetes: 'full',
    microservices: 'partial',
    eventDriven: 'partial',
    circuitBreaker: 'partial',
    healthCheck: 'full',
    metrics: 'full',
    logging: 'full',
    testing: 'full',
  },
  nestjs: {
    crud: 'full',
    validation: 'full',
    authentication: 'full',
    authorization: 'full',
    caching: 'full',
    rateLimit: 'full',
    graphql: 'full',
    grpc: 'full',
    websocket: 'full',
    swagger: 'full',
    docker: 'full',
    kubernetes: 'full',
    microservices: 'full',
    eventDriven: 'full',
    circuitBreaker: 'partial',
    healthCheck: 'full',
    metrics: 'full',
    logging: 'full',
    testing: 'full',
  },
  laravel: {
    crud: 'full',
    validation: 'full',
    authentication: 'full',
    authorization: 'full',
    caching: 'full',
    rateLimit: 'full',
    graphql: 'partial',
    grpc: 'partial',
    websocket: 'full',
    swagger: 'full',
    docker: 'full',
    kubernetes: 'partial',
    microservices: 'partial',
    eventDriven: 'full',
    circuitBreaker: 'partial',
    healthCheck: 'full',
    metrics: 'partial',
    logging: 'full',
    testing: 'full',
  },
  gin: {
    crud: 'full',
    validation: 'full',
    authentication: 'full',
    authorization: 'full',
    caching: 'partial',
    rateLimit: 'full',
    graphql: 'partial',
    grpc: 'full',
    websocket: 'full',
    swagger: 'full',
    docker: 'full',
    kubernetes: 'full',
    microservices: 'full',
    eventDriven: 'partial',
    circuitBreaker: 'partial',
    healthCheck: 'full',
    metrics: 'full',
    logging: 'full',
    testing: 'full',
  },
  chi: {
    crud: 'full',
    validation: 'full',
    authentication: 'full',
    authorization: 'full',
    caching: 'partial',
    rateLimit: 'full',
    graphql: 'partial',
    grpc: 'full',
    websocket: 'partial',
    swagger: 'full',
    docker: 'full',
    kubernetes: 'full',
    microservices: 'full',
    eventDriven: 'partial',
    circuitBreaker: 'partial',
    healthCheck: 'full',
    metrics: 'full',
    logging: 'full',
    testing: 'full',
  },
  axum: {
    crud: 'full',
    validation: 'full',
    authentication: 'full',
    authorization: 'full',
    caching: 'partial',
    rateLimit: 'partial',
    graphql: 'partial',
    grpc: 'full',
    websocket: 'full',
    swagger: 'full',
    docker: 'full',
    kubernetes: 'full',
    microservices: 'partial',
    eventDriven: 'partial',
    circuitBreaker: 'partial',
    healthCheck: 'full',
    metrics: 'full',
    logging: 'full',
    testing: 'full',
  },
  'aspnet-core': {
    crud: 'full',
    validation: 'full',
    authentication: 'full',
    authorization: 'full',
    caching: 'full',
    rateLimit: 'full',
    graphql: 'full',
    grpc: 'full',
    websocket: 'full',
    swagger: 'full',
    docker: 'full',
    kubernetes: 'full',
    microservices: 'full',
    eventDriven: 'full',
    circuitBreaker: 'full',
    healthCheck: 'full',
    metrics: 'full',
    logging: 'full',
    testing: 'full',
  },
};

// ============================================================================
// EXTENDED LANGUAGE CONFIG
// ============================================================================

/**
 * Extended configuration for a language with UI and feature data.
 */
export interface LanguageConfig {
  /** Language identifier */
  id: Language;
  /** Display name */
  label: string;
  /** Short description */
  description: string;
  /** Tabler icon component */
  icon: Icon;
  /** Mantine color name */
  color: MantineColor;
  /** Hex color value */
  hexColor: string;
  /** File extension */
  fileExtension: string;
  /** Package manager */
  packageManager: string;
  /** Available frameworks */
  frameworks: Framework[];
  /** Popularity rank (1 = most popular) */
  popularityRank: number;
  /** Tags for filtering */
  tags: string[];
}

/**
 * Extended configuration for a framework with UI and feature data.
 */
export interface FrameworkConfig {
  /** Framework identifier */
  id: Framework;
  /** Display name */
  label: string;
  /** Short description */
  description: string;
  /** Tabler icon component */
  icon: Icon;
  /** Mantine color name */
  color: MantineColor;
  /** Hex color value */
  hexColor: string;
  /** Parent language */
  language: Language;
  /** Documentation URL */
  docsUrl: string;
  /** Feature support */
  features: Record<FeatureId, FeatureSupport>;
  /** Maturity level */
  maturity: 'stable' | 'beta' | 'experimental';
  /** Tags for filtering */
  tags: string[];
}

/**
 * Complete language configurations with all metadata.
 */
export const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  java: {
    id: 'java',
    label: 'Java',
    description: 'Enterprise-grade applications with Spring Boot',
    icon: IconCoffee,
    color: 'orange',
    hexColor: '#f89820',
    fileExtension: '.java',
    packageManager: 'maven',
    frameworks: ['spring-boot'],
    popularityRank: 1,
    tags: ['enterprise', 'backend', 'microservices', 'jvm'],
  },
  kotlin: {
    id: 'kotlin',
    label: 'Kotlin',
    description: 'Modern JVM language with concise syntax',
    icon: IconBrandKotlin,
    color: 'grape',
    hexColor: '#7f52ff',
    fileExtension: '.kt',
    packageManager: 'maven',
    frameworks: ['spring-boot'],
    popularityRank: 4,
    tags: ['modern', 'backend', 'jvm', 'android'],
  },
  python: {
    id: 'python',
    label: 'Python',
    description: 'Fast and modern APIs with FastAPI',
    icon: IconBrandPython,
    color: 'yellow',
    hexColor: '#3776ab',
    fileExtension: '.py',
    packageManager: 'pip',
    frameworks: ['fastapi'],
    popularityRank: 2,
    tags: ['rapid', 'backend', 'ml', 'data'],
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    description: 'Full-stack development with NestJS',
    icon: IconBrandTypescript,
    color: 'blue',
    hexColor: '#3178c6',
    fileExtension: '.ts',
    packageManager: 'npm',
    frameworks: ['nestjs'],
    popularityRank: 3,
    tags: ['fullstack', 'backend', 'nodejs', 'modern'],
  },
  php: {
    id: 'php',
    label: 'PHP',
    description: 'Web applications with Laravel',
    icon: IconBrandPhp,
    color: 'indigo',
    hexColor: '#777bb4',
    fileExtension: '.php',
    packageManager: 'composer',
    frameworks: ['laravel'],
    popularityRank: 5,
    tags: ['web', 'backend', 'cms', 'rapid'],
  },
  go: {
    id: 'go',
    label: 'Go',
    description: 'High-performance services with Gin or Chi',
    icon: IconBrandGolang,
    color: 'cyan',
    hexColor: '#00add8',
    fileExtension: '.go',
    packageManager: 'go',
    frameworks: ['gin', 'chi'],
    popularityRank: 6,
    tags: ['performance', 'backend', 'cloud', 'microservices'],
  },
  rust: {
    id: 'rust',
    label: 'Rust',
    description: 'Memory-safe systems with Axum',
    icon: IconBrandRust,
    color: 'red',
    hexColor: '#ce412b',
    fileExtension: '.rs',
    packageManager: 'cargo',
    frameworks: ['axum'],
    popularityRank: 7,
    tags: ['performance', 'systems', 'safe', 'modern'],
  },
  csharp: {
    id: 'csharp',
    label: 'C#',
    description: 'Enterprise .NET with ASP.NET Core',
    icon: IconBrandCSharp,
    color: 'violet',
    hexColor: '#512bd4',
    fileExtension: '.cs',
    packageManager: 'nuget',
    frameworks: ['aspnet-core'],
    popularityRank: 8,
    tags: ['enterprise', 'backend', 'dotnet', 'microsoft'],
  },
};

/**
 * Complete framework configurations with all metadata.
 */
export const FRAMEWORK_CONFIGS: Record<Framework, FrameworkConfig> = {
  'spring-boot': {
    id: 'spring-boot',
    label: 'Spring Boot',
    description: 'Production-ready Spring applications with batteries included',
    icon: IconLeaf,
    color: 'green',
    hexColor: '#6db33f',
    language: 'java',
    docsUrl: 'https://spring.io/projects/spring-boot',
    features: FRAMEWORK_FEATURES['spring-boot'],
    maturity: 'stable',
    tags: ['enterprise', 'microservices', 'cloud', 'mature'],
  },
  fastapi: {
    id: 'fastapi',
    label: 'FastAPI',
    description: 'High-performance async Python framework',
    icon: IconBolt,
    color: 'teal',
    hexColor: '#009688',
    language: 'python',
    docsUrl: 'https://fastapi.tiangolo.com/',
    features: FRAMEWORK_FEATURES.fastapi,
    maturity: 'stable',
    tags: ['async', 'modern', 'fast', 'openapi'],
  },
  nestjs: {
    id: 'nestjs',
    label: 'NestJS',
    description: 'Progressive Node.js framework for enterprise apps',
    icon: IconCode,
    color: 'red',
    hexColor: '#e0234e',
    language: 'typescript',
    docsUrl: 'https://nestjs.com/',
    features: FRAMEWORK_FEATURES.nestjs,
    maturity: 'stable',
    tags: ['enterprise', 'modular', 'typescript', 'nodejs'],
  },
  laravel: {
    id: 'laravel',
    label: 'Laravel',
    description: 'Elegant PHP framework for web artisans',
    icon: IconFeather,
    color: 'pink',
    hexColor: '#ff2d20',
    language: 'php',
    docsUrl: 'https://laravel.com/',
    features: FRAMEWORK_FEATURES.laravel,
    maturity: 'stable',
    tags: ['elegant', 'rapid', 'fullstack', 'batteries'],
  },
  gin: {
    id: 'gin',
    label: 'Gin',
    description: 'Fastest HTTP web framework for Go',
    icon: IconHexagon,
    color: 'cyan',
    hexColor: '#00add8',
    language: 'go',
    docsUrl: 'https://gin-gonic.com/',
    features: FRAMEWORK_FEATURES.gin,
    maturity: 'stable',
    tags: ['fast', 'minimal', 'http', 'api'],
  },
  chi: {
    id: 'chi',
    label: 'Chi',
    description: 'Lightweight, composable router for Go',
    icon: IconRouteSquare,
    color: 'lime',
    hexColor: '#00add8',
    language: 'go',
    docsUrl: 'https://go-chi.io/',
    features: FRAMEWORK_FEATURES.chi,
    maturity: 'stable',
    tags: ['minimal', 'composable', 'idiomatic', 'middleware'],
  },
  axum: {
    id: 'axum',
    label: 'Axum',
    description: 'Ergonomic web framework built with Tokio',
    icon: IconHexagon,
    color: 'orange',
    hexColor: '#f74c00',
    language: 'rust',
    docsUrl: 'https://github.com/tokio-rs/axum',
    features: FRAMEWORK_FEATURES.axum,
    maturity: 'stable',
    tags: ['async', 'tokio', 'type-safe', 'modern'],
  },
  'aspnet-core': {
    id: 'aspnet-core',
    label: 'ASP.NET Core',
    description: 'Cross-platform, high-performance .NET framework',
    icon: IconBrandAzure,
    color: 'blue',
    hexColor: '#512bd4',
    language: 'csharp',
    docsUrl: 'https://dotnet.microsoft.com/apps/aspnet',
    features: FRAMEWORK_FEATURES['aspnet-core'],
    maturity: 'stable',
    tags: ['enterprise', 'cross-platform', 'azure', 'microsoft'],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the icon component for a language.
 */
export function getLanguageIcon(language: Language): Icon {
  return LANGUAGE_ICONS[language];
}

/**
 * Get the icon component for a framework.
 */
export function getFrameworkIcon(framework: Framework): Icon {
  return FRAMEWORK_ICONS[framework];
}

/**
 * Get the Mantine color for a language.
 */
export function getLanguageColor(language: Language): MantineColor {
  return LANGUAGE_COLORS[language];
}

/**
 * Get the Mantine color for a framework.
 */
export function getFrameworkColor(framework: Framework): MantineColor {
  return FRAMEWORK_COLORS[framework];
}

/**
 * Get the hex color for a language.
 */
export function getLanguageHexColor(language: Language): string {
  return LANGUAGE_HEX_COLORS[language];
}

/**
 * Get the hex color for a framework.
 */
export function getFrameworkHexColor(framework: Framework): string {
  return FRAMEWORK_HEX_COLORS[framework];
}

/**
 * Get complete configuration for a language.
 */
export function getLanguageConfig(language: Language): LanguageConfig {
  return LANGUAGE_CONFIGS[language];
}

/**
 * Get complete configuration for a framework.
 */
export function getFrameworkConfig(framework: Framework): FrameworkConfig {
  return FRAMEWORK_CONFIGS[framework];
}

/**
 * Get all framework configs for a language.
 */
export function getFrameworkConfigsForLanguage(language: Language): FrameworkConfig[] {
  return LANGUAGE_CONFIGS[language].frameworks.map((fw) => FRAMEWORK_CONFIGS[fw]);
}

/**
 * Check if a feature is supported by a framework.
 */
export function isFeatureSupported(framework: Framework, feature: FeatureId): boolean {
  const support = FRAMEWORK_FEATURES[framework][feature];
  return support === 'full' || support === 'partial';
}

/**
 * Check if a feature has full support in a framework.
 */
export function hasFullFeatureSupport(framework: Framework, feature: FeatureId): boolean {
  return FRAMEWORK_FEATURES[framework][feature] === 'full';
}

/**
 * Get all features with full support for a framework.
 */
export function getFullySupportedFeatures(framework: Framework): FeatureId[] {
  const features = FRAMEWORK_FEATURES[framework];
  return (Object.keys(features) as FeatureId[]).filter((f) => features[f] === 'full');
}

/**
 * Get all features with partial support for a framework.
 */
export function getPartiallySupportedFeatures(framework: Framework): FeatureId[] {
  const features = FRAMEWORK_FEATURES[framework];
  return (Object.keys(features) as FeatureId[]).filter((f) => features[f] === 'partial');
}

/**
 * Get languages sorted by popularity.
 */
export function getLanguagesByPopularity(): Language[] {
  return Object.values(LANGUAGE_CONFIGS)
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .map((config) => config.id);
}

/**
 * Filter languages by tag.
 */
export function getLanguagesByTag(tag: string): Language[] {
  return Object.values(LANGUAGE_CONFIGS)
    .filter((config) => config.tags.includes(tag))
    .map((config) => config.id);
}

/**
 * Filter frameworks by tag.
 */
export function getFrameworksByTag(tag: string): Framework[] {
  return Object.values(FRAMEWORK_CONFIGS)
    .filter((config) => config.tags.includes(tag))
    .map((config) => config.id);
}

/**
 * Get feature info by ID.
 */
export function getFeatureInfo(featureId: FeatureId): FeatureInfo {
  return FEATURES[featureId];
}

/**
 * Get all features grouped by category.
 */
export function getFeaturesByCategory(): Record<FeatureInfo['category'], FeatureInfo[]> {
  const result: Record<FeatureInfo['category'], FeatureInfo[]> = {
    core: [],
    api: [],
    infrastructure: [],
    observability: [],
  };

  for (const feature of Object.values(FEATURES)) {
    result[feature.category].push(feature);
  }

  return result;
}

/**
 * Compare feature support between two frameworks.
 */
export function compareFrameworkFeatures(
  framework1: Framework,
  framework2: Framework,
): {
  betterIn1: FeatureId[];
  betterIn2: FeatureId[];
  equal: FeatureId[];
} {
  const features1 = FRAMEWORK_FEATURES[framework1];
  const features2 = FRAMEWORK_FEATURES[framework2];

  const betterIn1: FeatureId[] = [];
  const betterIn2: FeatureId[] = [];
  const equal: FeatureId[] = [];

  const supportLevel = { full: 3, partial: 2, planned: 1, none: 0 };

  for (const featureId of Object.keys(features1) as FeatureId[]) {
    const level1 = supportLevel[features1[featureId]];
    const level2 = supportLevel[features2[featureId]];

    if (level1 > level2) {
      betterIn1.push(featureId);
    } else if (level2 > level1) {
      betterIn2.push(featureId);
    } else {
      equal.push(featureId);
    }
  }

  return { betterIn1, betterIn2, equal };
}
