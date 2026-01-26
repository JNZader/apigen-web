import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  Transition,
} from '@mantine/core';
import {
  IconBrandGolang,
  IconBrandPhp,
  IconBrandPython,
  IconBrandRust,
  IconBrandTypescript,
  IconCode,
  IconCoffee,
  IconDiamond,
  IconHash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useLanguageFeatureSync } from '../../hooks';
import { useTargetConfig, useTargetConfigActions } from '../../store';
import {
  FRAMEWORK_METADATA,
  type Framework,
  getDefaultFramework,
  getFrameworksForLanguage,
  LANGUAGE_METADATA,
  LANGUAGES,
  type Language,
} from '../../types/target';

interface LanguageSelectorProps {
  readonly onLanguageChange?: (language: Language, framework: Framework) => void;
}

const LANGUAGE_ICONS: Record<Language, React.ReactNode> = {
  java: <IconCoffee size={28} />,
  kotlin: <IconDiamond size={28} />,
  python: <IconBrandPython size={28} />,
  typescript: <IconBrandTypescript size={28} />,
  php: <IconBrandPhp size={28} />,
  go: <IconBrandGolang size={28} />,
  rust: <IconBrandRust size={28} />,
  csharp: <IconHash size={28} />,
};

const LANGUAGE_COLORS: Record<Language, string> = {
  java: 'orange',
  kotlin: 'grape',
  python: 'yellow',
  typescript: 'blue',
  php: 'indigo',
  go: 'cyan',
  rust: 'orange.8',
  csharp: 'violet',
};

const FRAMEWORK_ICONS: Record<Framework, React.ReactNode> = {
  'spring-boot': <IconCode size={16} />,
  fastapi: <IconCode size={16} />,
  nestjs: <IconCode size={16} />,
  laravel: <IconCode size={16} />,
  gin: <IconCode size={16} />,
  chi: <IconCode size={16} />,
  axum: <IconCode size={16} />,
  'aspnet-core': <IconCode size={16} />,
};

/**
 * Get card transform scale based on selection and hover state.
 */
function getCardTransform(isSelected: boolean, isHovered: boolean): string {
  if (isSelected) return 'scale(1.02)';
  if (isHovered) return 'scale(1.01)';
  return 'scale(1)';
}

export function LanguageSelector({ onLanguageChange }: Readonly<LanguageSelectorProps>) {
  const targetConfig = useTargetConfig();
  const { setTargetConfig } = useTargetConfigActions();
  const { handleLanguageChange: syncFeatures } = useLanguageFeatureSync();
  const [hoveredLanguage, setHoveredLanguage] = useState<Language | null>(null);

  const handleLanguageSelect = (language: Language) => {
    const framework = getDefaultFramework(language);
    const languageMeta = LANGUAGE_METADATA[language];
    const frameworkMeta = FRAMEWORK_METADATA[framework];

    setTargetConfig({
      language,
      framework,
      languageVersion: languageMeta.defaultVersion,
      frameworkVersion: frameworkMeta.defaultVersion,
    });

    // Sync features - disable incompatible ones
    syncFeatures(language, framework);

    onLanguageChange?.(language, framework);
  };

  const handleFrameworkSelect = (framework: Framework) => {
    const frameworkMeta = FRAMEWORK_METADATA[framework];

    setTargetConfig({
      framework,
      frameworkVersion: frameworkMeta.defaultVersion,
    });

    // Sync features - disable incompatible ones for new framework
    syncFeatures(targetConfig.language, framework);

    onLanguageChange?.(targetConfig.language, framework);
  };

  const availableFrameworks = getFrameworksForLanguage(targetConfig.language);
  const hasMultipleFrameworks = availableFrameworks.length > 1;

  return (
    <Stack gap="md">
      <div>
        <Text fw={600} size="sm" mb="xs">
          Select Language
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {LANGUAGES.map((language) => {
            const meta = LANGUAGE_METADATA[language];
            const isSelected = targetConfig.language === language;
            const isHovered = hoveredLanguage === language;
            const color = LANGUAGE_COLORS[language];

            return (
              <Transition
                key={language}
                mounted={true}
                transition="scale"
                duration={200}
                timingFunction="ease"
              >
                {(styles) => (
                  <LanguageCard
                    style={styles}
                    language={language}
                    label={meta.label}
                    icon={LANGUAGE_ICONS[language]}
                    color={color}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    packageManager={meta.packageManager}
                    defaultVersion={meta.defaultVersion}
                    onSelect={() => handleLanguageSelect(language)}
                    onMouseEnter={() => setHoveredLanguage(language)}
                    onMouseLeave={() => setHoveredLanguage(null)}
                  />
                )}
              </Transition>
            );
          })}
        </SimpleGrid>
      </div>

      {hasMultipleFrameworks && (
        <div>
          <Text fw={600} size="sm" mb="xs">
            Select Framework
          </Text>
          <Group gap="sm">
            {availableFrameworks.map((framework) => {
              const meta = FRAMEWORK_METADATA[framework];
              const isSelected = targetConfig.framework === framework;

              return (
                <FrameworkBadge
                  key={framework}
                  framework={framework}
                  label={meta.label}
                  icon={FRAMEWORK_ICONS[framework]}
                  isSelected={isSelected}
                  onSelect={() => handleFrameworkSelect(framework)}
                />
              );
            })}
          </Group>
        </div>
      )}

      <SelectedConfigDisplay
        language={targetConfig.language}
        framework={targetConfig.framework}
        languageVersion={targetConfig.languageVersion}
        frameworkVersion={targetConfig.frameworkVersion}
      />
    </Stack>
  );
}

interface LanguageCardProps {
  readonly style?: React.CSSProperties;
  readonly language: Language;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly color: string;
  readonly isSelected: boolean;
  readonly isHovered: boolean;
  readonly packageManager: string;
  readonly defaultVersion: string;
  readonly onSelect: () => void;
  readonly onMouseEnter: () => void;
  readonly onMouseLeave: () => void;
}

function LanguageCard({
  style,
  language,
  label,
  icon,
  color,
  isSelected,
  isHovered,
  packageManager,
  defaultVersion,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: Readonly<LanguageCardProps>) {
  return (
    <Tooltip
      label={`${label} v${defaultVersion} (${packageManager})`}
      position="top"
      withArrow
      openDelay={300}
    >
      <Card
        style={{
          ...style,
          cursor: 'pointer',
          transform: getCardTransform(isSelected, isHovered),
          transition: 'all 0.2s ease',
        }}
        shadow={isSelected ? 'md' : 'sm'}
        padding="md"
        radius="md"
        withBorder
        bd={isSelected ? `2px solid var(--mantine-color-${color.split('.')[0]}-6)` : undefined}
        bg={isSelected ? `var(--mantine-color-${color.split('.')[0]}-light)` : undefined}
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        aria-label={`Select ${label} programming language, version ${defaultVersion}`}
        data-testid={`language-card-${language}`}
      >
        <Stack gap="xs" align="center">
          <ThemeIcon size="xl" radius="md" color={color} variant={isSelected ? 'filled' : 'light'}>
            {icon}
          </ThemeIcon>
          <Text fw={isSelected ? 700 : 500} size="sm" ta="center">
            {label}
          </Text>
          {isSelected && (
            <Badge size="xs" variant="light" color={color}>
              v{defaultVersion}
            </Badge>
          )}
        </Stack>
      </Card>
    </Tooltip>
  );
}

interface FrameworkBadgeProps {
  readonly framework: Framework;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

function FrameworkBadge({
  framework,
  label,
  icon,
  isSelected,
  onSelect,
}: Readonly<FrameworkBadgeProps>) {
  const meta = FRAMEWORK_METADATA[framework];

  return (
    <Tooltip label={`${label} v${meta.defaultVersion}`} position="top" withArrow openDelay={300}>
      <Badge
        size="lg"
        variant={isSelected ? 'filled' : 'outline'}
        color={isSelected ? 'blue' : 'gray'}
        leftSection={icon}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        }}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        aria-label={`Select ${label} framework`}
        data-testid={`framework-badge-${framework}`}
      >
        {label}
      </Badge>
    </Tooltip>
  );
}

interface SelectedConfigDisplayProps {
  readonly language: Language;
  readonly framework: Framework;
  readonly languageVersion: string;
  readonly frameworkVersion: string;
}

function SelectedConfigDisplay({
  language,
  framework,
  languageVersion,
  frameworkVersion,
}: Readonly<SelectedConfigDisplayProps>) {
  const languageMeta = LANGUAGE_METADATA[language];
  const frameworkMeta = FRAMEWORK_METADATA[framework];

  return (
    <Card withBorder padding="sm" radius="md" bg="var(--mantine-color-gray-light)">
      <Group gap="xs" justify="center" wrap="wrap">
        <Text size="sm" c="dimmed">
          Selected:
        </Text>
        <Badge variant="light" color={LANGUAGE_COLORS[language]}>
          {languageMeta.label} v{languageVersion}
        </Badge>
        <Text size="sm" c="dimmed">
          +
        </Text>
        <Badge variant="light" color="blue">
          {frameworkMeta.label} v{frameworkVersion}
        </Badge>
      </Group>
    </Card>
  );
}
