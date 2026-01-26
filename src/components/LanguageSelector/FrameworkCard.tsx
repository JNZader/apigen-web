import { Badge, Card, Group, List, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconCheck, IconCode, IconExternalLink } from '@tabler/icons-react';
import type React from 'react';
import { useState } from 'react';
import { FRAMEWORK_METADATA, type Framework } from '../../types/target';

/**
 * Feature metadata for display in FrameworkCard.
 */
interface FrameworkFeature {
  /** Feature identifier */
  readonly id: string;
  /** Display label */
  readonly label: string;
  /** Whether this feature is supported */
  readonly supported: boolean;
}

/**
 * Get features supported by a framework.
 * This maps framework capabilities to displayable features.
 */
function getFrameworkFeatures(framework: Framework): FrameworkFeature[] {
  const commonFeatures: FrameworkFeature[] = [
    { id: 'crud', label: 'CRUD Operations', supported: true },
    { id: 'validation', label: 'Input Validation', supported: true },
    { id: 'auth', label: 'Authentication', supported: true },
  ];

  const frameworkSpecificFeatures: Record<Framework, FrameworkFeature[]> = {
    'spring-boot': [
      ...commonFeatures,
      { id: 'jpa', label: 'JPA/Hibernate', supported: true },
      { id: 'openapi', label: 'OpenAPI Docs', supported: true },
    ],
    fastapi: [
      ...commonFeatures,
      { id: 'pydantic', label: 'Pydantic Models', supported: true },
      { id: 'openapi', label: 'OpenAPI Docs', supported: true },
    ],
    nestjs: [
      ...commonFeatures,
      { id: 'typeorm', label: 'TypeORM', supported: true },
      { id: 'swagger', label: 'Swagger Docs', supported: true },
    ],
    laravel: [
      ...commonFeatures,
      { id: 'eloquent', label: 'Eloquent ORM', supported: true },
      { id: 'openapi', label: 'OpenAPI Docs', supported: true },
    ],
    gin: [
      ...commonFeatures,
      { id: 'gorm', label: 'GORM', supported: true },
      { id: 'swagger', label: 'Swagger Docs', supported: true },
    ],
    chi: [
      ...commonFeatures,
      { id: 'sqlc', label: 'SQLC', supported: true },
      { id: 'openapi', label: 'OpenAPI Docs', supported: true },
    ],
    axum: [
      ...commonFeatures,
      { id: 'sqlx', label: 'SQLx', supported: true },
      { id: 'utoipa', label: 'Utoipa Docs', supported: true },
    ],
    'aspnet-core': [
      ...commonFeatures,
      { id: 'ef', label: 'Entity Framework', supported: true },
      { id: 'swagger', label: 'Swagger Docs', supported: true },
    ],
  };

  return frameworkSpecificFeatures[framework] || commonFeatures;
}

/**
 * Get card transform scale based on selection and hover state.
 */
function getCardTransform(isSelected: boolean, isHovered: boolean): string {
  if (isSelected) return 'scale(1.02)';
  if (isHovered) return 'scale(1.01)';
  return 'scale(1)';
}

/**
 * Get card shadow based on selection and hover state.
 */
function getCardShadow(isSelected: boolean, isHovered: boolean): 'md' | 'sm' | 'xs' {
  if (isSelected) return 'md';
  if (isHovered) return 'sm';
  return 'xs';
}

interface FrameworkCardProps {
  /** The framework to display */
  readonly framework: Framework;
  /** Whether this card is currently selected */
  readonly isSelected: boolean;
  /** Callback when the card is selected */
  readonly onSelect: () => void;
  /** Optional additional styles */
  readonly style?: React.CSSProperties;
  /** Optional color override */
  readonly color?: string;
}

export function FrameworkCard({
  framework,
  isSelected,
  onSelect,
  style,
  color = 'blue',
}: Readonly<FrameworkCardProps>) {
  const [isHovered, setIsHovered] = useState(false);
  const meta = FRAMEWORK_METADATA[framework];
  const features = getFrameworkFeatures(framework);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <Card
      style={{
        ...style,
        cursor: 'pointer',
        transform: getCardTransform(isSelected, isHovered),
        transition: 'all 0.2s ease',
      }}
      shadow={getCardShadow(isSelected, isHovered)}
      padding="md"
      radius="md"
      withBorder
      bd={isSelected ? `2px solid var(--mantine-color-${color}-6)` : undefined}
      bg={isSelected ? `var(--mantine-color-${color}-light)` : undefined}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${meta.label} framework, version ${meta.defaultVersion}`}
      data-testid={`framework-card-${framework}`}
    >
      <Stack gap="sm">
        {/* Header: Icon, Name, Version */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              size="lg"
              radius="md"
              color={color}
              variant={isSelected ? 'filled' : 'light'}
            >
              <IconCode size={20} />
            </ThemeIcon>
            <div>
              <Text fw={isSelected ? 700 : 600} size="sm">
                {meta.label}
              </Text>
              <Text size="xs" c="dimmed">
                v{meta.defaultVersion}
              </Text>
            </div>
          </Group>
          <Tooltip label="View documentation" position="top" withArrow openDelay={300}>
            <Badge
              component="a"
              href={meta.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              color="gray"
              size="sm"
              rightSection={<IconExternalLink size={12} />}
              style={{ cursor: 'pointer' }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              Docs
            </Badge>
          </Tooltip>
        </Group>

        {/* Features List */}
        <div>
          <Text size="xs" c="dimmed" mb={4}>
            Supported Features
          </Text>
          <List
            size="xs"
            spacing={2}
            icon={
              <ThemeIcon size={16} radius="xl" color="green" variant="light">
                <IconCheck size={10} />
              </ThemeIcon>
            }
          >
            {features.slice(0, 4).map((feature) => (
              <List.Item key={feature.id}>
                <Text size="xs">{feature.label}</Text>
              </List.Item>
            ))}
          </List>
          {features.length > 4 && (
            <Text size="xs" c="dimmed" mt={4}>
              +{features.length - 4} more features
            </Text>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <Badge
            size="sm"
            variant="light"
            color={color}
            fullWidth
            style={{ transition: 'opacity 0.2s ease' }}
          >
            Selected
          </Badge>
        )}
      </Stack>
    </Card>
  );
}

export type { FrameworkCardProps, FrameworkFeature };
