import {
  Badge,
  Box,
  Card,
  Group,
  ScrollArea,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCheck,
  IconMinus,
  IconX,
} from '@tabler/icons-react';
import { useTargetConfig } from '../../store';
import {
  type Framework,
  FRAMEWORK_METADATA,
  type Language,
  LANGUAGE_METADATA,
  LANGUAGES,
} from '../../types/target';

/**
 * Feature support level for each language/framework combination.
 */
export type FeatureSupportLevel = 'full' | 'partial' | 'none';

/**
 * Feature definition for the matrix.
 */
export interface FeatureDefinition {
  /** Unique feature identifier */
  id: string;
  /** Display name of the feature */
  name: string;
  /** Description shown in tooltip */
  description: string;
  /** Category for grouping features */
  category: FeatureCategory;
}

/**
 * Feature categories for organization.
 */
export type FeatureCategory =
  | 'core'
  | 'database'
  | 'api'
  | 'security'
  | 'observability'
  | 'advanced';

/**
 * Feature support matrix mapping feature ID to language support levels.
 */
export type FeatureSupportMatrix = Record<string, Record<Language, FeatureSupportLevel>>;

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

/**
 * All features available in the code generator.
 */
export const FEATURES: FeatureDefinition[] = [
  // Core features
  {
    id: 'crud',
    name: 'CRUD Operations',
    description: 'Basic Create, Read, Update, Delete operations for entities',
    category: 'core',
  },
  {
    id: 'validation',
    name: 'Input Validation',
    description: 'Request validation with annotations/decorators',
    category: 'core',
  },
  {
    id: 'pagination',
    name: 'Pagination',
    description: 'Offset and cursor-based pagination support',
    category: 'core',
  },
  {
    id: 'filtering',
    name: 'Advanced Filtering',
    description: 'Dynamic query filters and search capabilities',
    category: 'core',
  },

  // Database features
  {
    id: 'orm',
    name: 'ORM/ODM Support',
    description: 'Object-Relational/Document Mapping integration',
    category: 'database',
  },
  {
    id: 'migrations',
    name: 'DB Migrations',
    description: 'Database schema migration support',
    category: 'database',
  },
  {
    id: 'soft-delete',
    name: 'Soft Delete',
    description: 'Logical deletion with restore capabilities',
    category: 'database',
  },
  {
    id: 'audit-log',
    name: 'Audit Logging',
    description: 'Track entity changes with timestamps and user info',
    category: 'database',
  },

  // API features
  {
    id: 'openapi',
    name: 'OpenAPI/Swagger',
    description: 'Auto-generated API documentation',
    category: 'api',
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    description: 'GraphQL API generation support',
    category: 'api',
  },
  {
    id: 'grpc',
    name: 'gRPC',
    description: 'gRPC service generation support',
    category: 'api',
  },
  {
    id: 'hateoas',
    name: 'HATEOAS',
    description: 'Hypermedia links in REST responses',
    category: 'api',
  },

  // Security features
  {
    id: 'auth',
    name: 'Authentication',
    description: 'JWT/OAuth2 authentication support',
    category: 'security',
  },
  {
    id: 'rbac',
    name: 'RBAC',
    description: 'Role-Based Access Control',
    category: 'security',
  },
  {
    id: 'rate-limit',
    name: 'Rate Limiting',
    description: 'API rate limiting and throttling',
    category: 'security',
  },
  {
    id: 'cors',
    name: 'CORS',
    description: 'Cross-Origin Resource Sharing configuration',
    category: 'security',
  },

  // Observability features
  {
    id: 'logging',
    name: 'Structured Logging',
    description: 'JSON structured logging with correlation IDs',
    category: 'observability',
  },
  {
    id: 'metrics',
    name: 'Metrics',
    description: 'Prometheus/OpenTelemetry metrics',
    category: 'observability',
  },
  {
    id: 'tracing',
    name: 'Distributed Tracing',
    description: 'OpenTelemetry distributed tracing',
    category: 'observability',
  },
  {
    id: 'health',
    name: 'Health Checks',
    description: 'Liveness and readiness probes',
    category: 'observability',
  },

  // Advanced features
  {
    id: 'caching',
    name: 'Caching',
    description: 'Redis/in-memory caching support',
    category: 'advanced',
  },
  {
    id: 'events',
    name: 'Domain Events',
    description: 'Event-driven architecture support',
    category: 'advanced',
  },
  {
    id: 'batch',
    name: 'Batch Operations',
    description: 'Bulk create/update/delete operations',
    category: 'advanced',
  },
  {
    id: 'sse',
    name: 'SSE/WebSockets',
    description: 'Real-time updates via Server-Sent Events',
    category: 'advanced',
  },
];

/**
 * Feature support levels per language.
 * This defines what each language/framework combination supports.
 */
export const FEATURE_SUPPORT: FeatureSupportMatrix = {
  // Core features
  crud: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  validation: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },
  pagination: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  filtering: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'partial',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },

  // Database features
  orm: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  migrations: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },
  'soft-delete': {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },
  'audit-log': {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'partial',
    php: 'partial',
    go: 'partial',
    rust: 'none',
    csharp: 'full',
  },

  // API features
  openapi: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  graphql: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'partial',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },
  grpc: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'partial',
    php: 'none',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  hateoas: {
    java: 'full',
    kotlin: 'full',
    python: 'partial',
    typescript: 'partial',
    php: 'partial',
    go: 'none',
    rust: 'none',
    csharp: 'full',
  },

  // Security features
  auth: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  rbac: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },
  'rate-limit': {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  cors: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },

  // Observability features
  logging: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  metrics: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'partial',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
  tracing: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'partial',
    go: 'full',
    rust: 'partial',
    csharp: 'full',
  },
  health: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },

  // Advanced features
  caching: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'full',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },
  events: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'partial',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },
  batch: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'partial',
    go: 'partial',
    rust: 'partial',
    csharp: 'full',
  },
  sse: {
    java: 'full',
    kotlin: 'full',
    python: 'full',
    typescript: 'full',
    php: 'none',
    go: 'full',
    rust: 'full',
    csharp: 'full',
  },
};

// ============================================================================
// CATEGORY LABELS
// ============================================================================

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  core: 'Core Features',
  database: 'Database',
  api: 'API & Protocols',
  security: 'Security',
  observability: 'Observability',
  advanced: 'Advanced',
};

const CATEGORY_ORDER: FeatureCategory[] = [
  'core',
  'database',
  'api',
  'security',
  'observability',
  'advanced',
];

// ============================================================================
// SUPPORT INDICATOR COMPONENT
// ============================================================================

interface SupportIndicatorProps {
  readonly level: FeatureSupportLevel;
  readonly featureName: string;
  readonly languageLabel: string;
}

function SupportIndicator({ level, featureName, languageLabel }: SupportIndicatorProps) {
  const config = {
    full: {
      icon: <IconCheck size={16} />,
      color: 'green',
      label: 'Full support',
    },
    partial: {
      icon: <IconMinus size={16} />,
      color: 'yellow',
      label: 'Partial support',
    },
    none: {
      icon: <IconX size={16} />,
      color: 'red',
      label: 'Not supported',
    },
  }[level];

  return (
    <Tooltip
      label={`${featureName}: ${config.label} in ${languageLabel}`}
      position="top"
      withArrow
      openDelay={200}
    >
      <ThemeIcon
        size="sm"
        radius="xl"
        color={config.color}
        variant="light"
        aria-label={`${featureName} ${config.label} in ${languageLabel}`}
        data-testid={`support-indicator-${level}`}
      >
        {config.icon}
      </ThemeIcon>
    </Tooltip>
  );
}

// ============================================================================
// FEATURE MATRIX COMPONENT
// ============================================================================

interface FeatureMatrixProps {
  readonly showCategories?: boolean;
  readonly highlightSelected?: boolean;
}

export function FeatureMatrix({
  showCategories = true,
  highlightSelected = true,
}: Readonly<FeatureMatrixProps>) {
  const targetConfig = useTargetConfig();
  const selectedLanguage = targetConfig.language;

  // Group features by category
  const featuresByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    features: FEATURES.filter((f) => f.category === category),
  }));

  // Get framework label for selected language
  const getFrameworkLabel = (language: Language): string => {
    const frameworks = LANGUAGE_METADATA[language].frameworks;
    if (frameworks.length === 1) {
      return FRAMEWORK_METADATA[frameworks[0]].label;
    }
    // For languages with multiple frameworks, show the default
    return FRAMEWORK_METADATA[frameworks[0]].label;
  };

  return (
    <Card withBorder padding="md" radius="md" data-testid="feature-matrix">
      <Text fw={600} size="sm" mb="md">
        Feature Support Matrix
      </Text>

      <ScrollArea type="auto" offsetScrollbars>
        <Box maw="100%" style={{ overflowX: 'auto' }}>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            style={{ minWidth: 700 }}
            aria-label="Feature support matrix showing which features are supported by each programming language"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: 180, position: 'sticky', left: 0, background: 'var(--mantine-color-body)', zIndex: 1 }}>
                  Feature
                </Table.Th>
                {LANGUAGES.map((language) => {
                  const meta = LANGUAGE_METADATA[language];
                  const isSelected = highlightSelected && language === selectedLanguage;

                  return (
                    <Table.Th
                      key={language}
                      ta="center"
                      style={{
                        minWidth: 80,
                        backgroundColor: isSelected
                          ? 'var(--mantine-color-blue-light)'
                          : undefined,
                        transition: 'background-color 0.2s ease',
                      }}
                      data-testid={`header-${language}`}
                      data-selected={isSelected}
                    >
                      <Tooltip
                        label={`${meta.label} + ${getFrameworkLabel(language)}`}
                        position="top"
                        withArrow
                      >
                        <Box>
                          <Text size="xs" fw={isSelected ? 700 : 500}>
                            {meta.label}
                          </Text>
                        </Box>
                      </Tooltip>
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {featuresByCategory.map(({ category, label, features }) => (
                <>
                  {showCategories && (
                    <Table.Tr key={`category-${category}`} data-testid={`category-row-${category}`}>
                      <Table.Td
                        colSpan={LANGUAGES.length + 1}
                        style={{
                          backgroundColor: 'var(--mantine-color-gray-light)',
                          position: 'sticky',
                          left: 0,
                        }}
                      >
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                          {label}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}

                  {features.map((feature) => (
                    <Table.Tr key={feature.id} data-testid={`feature-row-${feature.id}`}>
                      <Table.Td
                        style={{
                          position: 'sticky',
                          left: 0,
                          background: 'var(--mantine-color-body)',
                          zIndex: 1,
                        }}
                      >
                        <Tooltip
                          label={feature.description}
                          position="right"
                          withArrow
                          multiline
                          maw={250}
                          openDelay={300}
                        >
                          <Text size="sm" style={{ cursor: 'help' }}>
                            {feature.name}
                          </Text>
                        </Tooltip>
                      </Table.Td>

                      {LANGUAGES.map((language) => {
                        const support = FEATURE_SUPPORT[feature.id]?.[language] ?? 'none';
                        const languageMeta = LANGUAGE_METADATA[language];
                        const isSelected = highlightSelected && language === selectedLanguage;

                        return (
                          <Table.Td
                            key={language}
                            ta="center"
                            style={{
                              backgroundColor: isSelected
                                ? 'var(--mantine-color-blue-light)'
                                : undefined,
                              transition: 'background-color 0.2s ease',
                            }}
                            data-testid={`cell-${feature.id}-${language}`}
                            data-selected={isSelected}
                          >
                            <Group justify="center">
                              <SupportIndicator
                                level={support}
                                featureName={feature.name}
                                languageLabel={languageMeta.label}
                              />
                            </Group>
                          </Table.Td>
                        );
                      })}
                    </Table.Tr>
                  ))}
                </>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </ScrollArea>

      <Group gap="lg" mt="md" justify="center">
        <Group gap="xs">
          <ThemeIcon size="sm" radius="xl" color="green" variant="light">
            <IconCheck size={12} />
          </ThemeIcon>
          <Text size="xs" c="dimmed">
            Full support
          </Text>
        </Group>
        <Group gap="xs">
          <ThemeIcon size="sm" radius="xl" color="yellow" variant="light">
            <IconMinus size={12} />
          </ThemeIcon>
          <Text size="xs" c="dimmed">
            Partial support
          </Text>
        </Group>
        <Group gap="xs">
          <ThemeIcon size="sm" radius="xl" color="red" variant="light">
            <IconX size={12} />
          </ThemeIcon>
          <Text size="xs" c="dimmed">
            Not supported
          </Text>
        </Group>
      </Group>
    </Card>
  );
}

// ============================================================================
// COMPACT FEATURE SUMMARY COMPONENT
// ============================================================================

interface FeatureSummaryProps {
  readonly language?: Language;
}

/**
 * A compact summary showing feature support counts for a single language.
 */
export function FeatureSummary({ language }: Readonly<FeatureSummaryProps>) {
  const targetConfig = useTargetConfig();
  const selectedLanguage = language ?? targetConfig.language;
  const languageMeta = LANGUAGE_METADATA[selectedLanguage];

  const counts = FEATURES.reduce(
    (acc, feature) => {
      const support = FEATURE_SUPPORT[feature.id]?.[selectedLanguage] ?? 'none';
      acc[support]++;
      return acc;
    },
    { full: 0, partial: 0, none: 0 },
  );

  const totalFeatures = FEATURES.length;
  const supportPercentage = Math.round(
    ((counts.full + counts.partial * 0.5) / totalFeatures) * 100,
  );

  return (
    <Card withBorder padding="sm" radius="md" data-testid="feature-summary">
      <Group justify="space-between" wrap="wrap" gap="xs">
        <Text size="sm" fw={500}>
          {languageMeta.label} Feature Coverage
        </Text>
        <Badge
          variant="light"
          color={supportPercentage >= 80 ? 'green' : supportPercentage >= 60 ? 'yellow' : 'orange'}
        >
          {supportPercentage}%
        </Badge>
      </Group>

      <Group gap="lg" mt="xs" justify="center">
        <Group gap={4}>
          <ThemeIcon size="xs" radius="xl" color="green" variant="filled">
            <IconCheck size={10} />
          </ThemeIcon>
          <Text size="xs">{counts.full} full</Text>
        </Group>
        <Group gap={4}>
          <ThemeIcon size="xs" radius="xl" color="yellow" variant="filled">
            <IconMinus size={10} />
          </ThemeIcon>
          <Text size="xs">{counts.partial} partial</Text>
        </Group>
        <Group gap={4}>
          <ThemeIcon size="xs" radius="xl" color="red" variant="filled">
            <IconX size={10} />
          </ThemeIcon>
          <Text size="xs">{counts.none} none</Text>
        </Group>
      </Group>
    </Card>
  );
}
