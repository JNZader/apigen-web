import { Box, Table, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconCheck, IconMinus, IconX } from '@tabler/icons-react';
import type React from 'react';
import { FRAMEWORK_METADATA, type Framework } from '../../types/target';

/**
 * Support level for a feature in a framework.
 */
export type SupportLevel = 'full' | 'partial' | 'none';

/**
 * Feature definition for the matrix.
 */
export interface Feature {
  /** Unique feature identifier */
  readonly id: string;
  /** Display name for the feature */
  readonly name: string;
  /** Optional description shown in tooltip */
  readonly description?: string;
  /** Category for grouping features */
  readonly category: string;
}

/**
 * Feature support mapping for frameworks.
 */
export type FeatureSupport = Record<Framework, SupportLevel>;

/**
 * Feature with its support levels across frameworks.
 */
export interface FeatureWithSupport extends Feature {
  /** Support level for each framework */
  readonly support: FeatureSupport;
}

/**
 * Default features for the matrix.
 */
export const DEFAULT_FEATURES: FeatureWithSupport[] = [
  {
    id: 'crud',
    name: 'CRUD Operations',
    description: 'Create, Read, Update, Delete operations',
    category: 'Core',
    support: {
      'spring-boot': 'full',
      fastapi: 'full',
      nestjs: 'full',
      laravel: 'full',
      gin: 'full',
      chi: 'full',
      axum: 'full',
      'aspnet-core': 'full',
    },
  },
  {
    id: 'validation',
    name: 'Input Validation',
    description: 'Request validation and sanitization',
    category: 'Core',
    support: {
      'spring-boot': 'full',
      fastapi: 'full',
      nestjs: 'full',
      laravel: 'full',
      gin: 'full',
      chi: 'partial',
      axum: 'full',
      'aspnet-core': 'full',
    },
  },
  {
    id: 'auth',
    name: 'Authentication',
    description: 'User authentication support',
    category: 'Security',
    support: {
      'spring-boot': 'full',
      fastapi: 'full',
      nestjs: 'full',
      laravel: 'full',
      gin: 'partial',
      chi: 'partial',
      axum: 'partial',
      'aspnet-core': 'full',
    },
  },
  {
    id: 'openapi',
    name: 'OpenAPI/Swagger',
    description: 'API documentation generation',
    category: 'Documentation',
    support: {
      'spring-boot': 'full',
      fastapi: 'full',
      nestjs: 'full',
      laravel: 'full',
      gin: 'full',
      chi: 'full',
      axum: 'full',
      'aspnet-core': 'full',
    },
  },
  {
    id: 'orm',
    name: 'ORM Integration',
    description: 'Object-Relational Mapping support',
    category: 'Database',
    support: {
      'spring-boot': 'full',
      fastapi: 'full',
      nestjs: 'full',
      laravel: 'full',
      gin: 'full',
      chi: 'partial',
      axum: 'full',
      'aspnet-core': 'full',
    },
  },
  {
    id: 'testing',
    name: 'Testing Framework',
    description: 'Built-in testing utilities',
    category: 'Development',
    support: {
      'spring-boot': 'full',
      fastapi: 'full',
      nestjs: 'full',
      laravel: 'full',
      gin: 'full',
      chi: 'full',
      axum: 'partial',
      'aspnet-core': 'full',
    },
  },
];

interface FeatureMatrixProps {
  /** Frameworks to display as columns */
  readonly frameworks: Framework[];
  /** Currently selected framework */
  readonly selectedFramework?: Framework;
  /** Callback when a framework header is clicked */
  readonly onFrameworkSelect?: (framework: Framework) => void;
  /** Features to display (defaults to DEFAULT_FEATURES) */
  readonly features?: FeatureWithSupport[];
}

/**
 * Support indicator component.
 */
function SupportIndicator({ level }: { readonly level: SupportLevel }) {
  const config = {
    full: { icon: IconCheck, color: 'green', label: 'Fully supported' },
    partial: { icon: IconMinus, color: 'yellow', label: 'Partially supported' },
    none: { icon: IconX, color: 'red', label: 'Not supported' },
  }[level];

  return (
    <Tooltip label={config.label} withArrow>
      <ThemeIcon
        size="sm"
        radius="xl"
        color={config.color}
        variant="light"
        data-testid={`support-indicator-${level}`}
        aria-label={config.label}
      >
        <config.icon size={12} />
      </ThemeIcon>
    </Tooltip>
  );
}

/**
 * FeatureMatrix displays a comparison matrix of features across frameworks.
 * Shows support levels (full, partial, none) for each feature/framework combination.
 */
export function FeatureMatrix({
  frameworks,
  selectedFramework,
  onFrameworkSelect,
  features = DEFAULT_FEATURES,
}: Readonly<FeatureMatrixProps>) {
  const handleHeaderClick = (framework: Framework) => {
    onFrameworkSelect?.(framework);
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent, framework: Framework) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFrameworkSelect?.(framework);
    }
  };

  return (
    <Box data-testid="feature-matrix">
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Feature</Table.Th>
            {frameworks.map((framework) => {
              const meta = FRAMEWORK_METADATA[framework];
              const isSelected = framework === selectedFramework;
              return (
                <Table.Th
                  key={framework}
                  style={{
                    cursor: onFrameworkSelect ? 'pointer' : 'default',
                    backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : undefined,
                    transition: 'background-color 0.2s ease',
                  }}
                  onClick={() => handleHeaderClick(framework)}
                  onKeyDown={(e) => handleHeaderKeyDown(e, framework)}
                  tabIndex={onFrameworkSelect ? 0 : -1}
                  role={onFrameworkSelect ? 'button' : undefined}
                  aria-pressed={onFrameworkSelect ? isSelected : undefined}
                  aria-label={onFrameworkSelect ? `Select ${meta.label} framework` : meta.label}
                  data-testid={`framework-header-${framework}`}
                  data-selected={isSelected}
                >
                  <Text size="sm" fw={isSelected ? 700 : 500} ta="center">
                    {meta.label}
                  </Text>
                </Table.Th>
              );
            })}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {features.map((feature) => (
            <Table.Tr key={feature.id} data-testid={`feature-row-${feature.id}`}>
              <Table.Td>
                <Tooltip label={feature.description} withArrow disabled={!feature.description}>
                  <Text size="sm" data-testid={`feature-name-${feature.id}`}>
                    {feature.name}
                  </Text>
                </Tooltip>
              </Table.Td>
              {frameworks.map((framework) => {
                const isSelected = framework === selectedFramework;
                return (
                  <Table.Td
                    key={`${feature.id}-${framework}`}
                    style={{
                      backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : undefined,
                      transition: 'background-color 0.2s ease',
                    }}
                    data-testid={`cell-${feature.id}-${framework}`}
                    data-selected={isSelected}
                  >
                    <Box style={{ display: 'flex', justifyContent: 'center' }}>
                      <SupportIndicator level={feature.support[framework]} />
                    </Box>
                  </Table.Td>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}

export type { FeatureMatrixProps };
