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
  IconCheck,
  IconCode,
  IconCoffee,
  IconDiamond,
  IconHash,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { useLanguageFeatureSync } from '../../../hooks';
import { useTargetConfig, useTargetConfigActions } from '../../../store';
import {
  FRAMEWORK_METADATA,
  type Framework,
  getDefaultFramework,
  getFrameworksForLanguage,
  LANGUAGE_METADATA,
  LANGUAGES,
  type Language,
} from '../../../types/target';

export interface LanguageStepProps {
  readonly onLanguageChange?: (language: Language, framework: Framework) => void;
}

const LANGUAGE_ICONS: Record<Language, React.ReactNode> = {
  java: <IconCoffee size={32} />,
  kotlin: <IconDiamond size={32} />,
  python: <IconBrandPython size={32} />,
  typescript: <IconBrandTypescript size={32} />,
  php: <IconBrandPhp size={32} />,
  go: <IconBrandGolang size={32} />,
  rust: <IconBrandRust size={32} />,
  csharp: <IconHash size={32} />,
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

export function LanguageStep({ onLanguageChange }: Readonly<LanguageStepProps>) {
  const targetConfig = useTargetConfig();
  const { setTargetConfig } = useTargetConfigActions();
  const { handleLanguageChange: syncFeatures } = useLanguageFeatureSync();
  const [hoveredLanguage, setHoveredLanguage] = useState<Language | null>(null);

  const handleLanguageSelect = useCallback(
    (language: Language) => {
      const framework = getDefaultFramework(language);
      const languageMeta = LANGUAGE_METADATA[language];
      const frameworkMeta = FRAMEWORK_METADATA[framework];

      setTargetConfig({
        language,
        framework,
        languageVersion: languageMeta.defaultVersion,
        frameworkVersion: frameworkMeta.defaultVersion,
      });

      syncFeatures(language, framework);
      onLanguageChange?.(language, framework);
    },
    [setTargetConfig, syncFeatures, onLanguageChange],
  );

  const handleFrameworkSelect = useCallback(
    (framework: Framework) => {
      const frameworkMeta = FRAMEWORK_METADATA[framework];

      setTargetConfig({
        framework,
        frameworkVersion: frameworkMeta.defaultVersion,
      });

      syncFeatures(targetConfig.language, framework);
      onLanguageChange?.(targetConfig.language, framework);
    },
    [setTargetConfig, syncFeatures, targetConfig.language, onLanguageChange],
  );

  const availableFrameworks = getFrameworksForLanguage(targetConfig.language);
  const hasMultipleFrameworks = availableFrameworks.length > 1;

  return (
    <Stack gap="xl">
      <div>
        <Text fw={600} size="lg" mb="md">
          Choose Your Programming Language
        </Text>
        <Text size="sm" c="dimmed" mb="lg">
          Select the language for your API project. Each language comes with its recommended
          framework.
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
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
                  <Card
                    style={{
                      ...styles,
                      cursor: 'pointer',
                      transform: isSelected
                        ? 'scale(1.02)'
                        : isHovered
                          ? 'scale(1.01)'
                          : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                    shadow={isSelected ? 'md' : 'sm'}
                    padding="lg"
                    radius="md"
                    withBorder
                    bd={
                      isSelected
                        ? `2px solid var(--mantine-color-${color.split('.')[0]}-6)`
                        : undefined
                    }
                    bg={
                      isSelected ? `var(--mantine-color-${color.split('.')[0]}-light)` : undefined
                    }
                    onClick={() => handleLanguageSelect(language)}
                    onMouseEnter={() => setHoveredLanguage(language)}
                    onMouseLeave={() => setHoveredLanguage(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleLanguageSelect(language);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`Select ${meta.label} programming language`}
                    data-testid={`wizard-language-${language}`}
                  >
                    <Stack gap="sm" align="center">
                      <ThemeIcon
                        size={56}
                        radius="md"
                        color={color}
                        variant={isSelected ? 'filled' : 'light'}
                      >
                        {LANGUAGE_ICONS[language]}
                      </ThemeIcon>
                      <Text fw={isSelected ? 700 : 500} size="md" ta="center">
                        {meta.label}
                      </Text>
                      <Group gap={4} wrap="wrap" justify="center">
                        <Badge size="xs" variant="light" color="gray">
                          {meta.packageManager}
                        </Badge>
                        {isSelected && (
                          <Badge size="xs" variant="filled" color={color}>
                            v{meta.defaultVersion}
                          </Badge>
                        )}
                      </Group>
                      {isSelected && (
                        <ThemeIcon size="sm" radius="xl" color="green" variant="filled">
                          <IconCheck size={12} />
                        </ThemeIcon>
                      )}
                    </Stack>
                  </Card>
                )}
              </Transition>
            );
          })}
        </SimpleGrid>
      </div>

      {hasMultipleFrameworks && (
        <div>
          <Text fw={600} size="lg" mb="md">
            Choose Framework
          </Text>
          <Text size="sm" c="dimmed" mb="lg">
            {LANGUAGE_METADATA[targetConfig.language].label} supports multiple frameworks. Select
            your preferred one.
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {availableFrameworks.map((framework) => {
              const meta = FRAMEWORK_METADATA[framework];
              const isSelected = targetConfig.framework === framework;

              return (
                <Tooltip
                  key={framework}
                  label={`${meta.label} v${meta.defaultVersion}`}
                  position="top"
                  withArrow
                  openDelay={300}
                >
                  <Card
                    shadow={isSelected ? 'md' : 'sm'}
                    padding="md"
                    radius="md"
                    withBorder
                    bd={isSelected ? '2px solid var(--mantine-color-blue-6)' : undefined}
                    bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onClick={() => handleFrameworkSelect(framework)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFrameworkSelect(framework);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`Select ${meta.label} framework`}
                    data-testid={`wizard-framework-${framework}`}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="md" wrap="nowrap">
                        <ThemeIcon
                          size="lg"
                          radius="md"
                          color="blue"
                          variant={isSelected ? 'filled' : 'light'}
                        >
                          <IconCode size={20} />
                        </ThemeIcon>
                        <div>
                          <Text fw={isSelected ? 700 : 500} size="sm">
                            {meta.label}
                          </Text>
                          <Text size="xs" c="dimmed">
                            v{meta.defaultVersion}
                          </Text>
                        </div>
                      </Group>
                      {isSelected && (
                        <ThemeIcon size="sm" radius="xl" color="green" variant="filled">
                          <IconCheck size={12} />
                        </ThemeIcon>
                      )}
                    </Group>
                  </Card>
                </Tooltip>
              );
            })}
          </SimpleGrid>
        </div>
      )}

      <Card withBorder padding="md" radius="md" bg="var(--mantine-color-gray-light)">
        <Group gap="md" justify="center" wrap="wrap">
          <Text size="sm" fw={500}>
            Selected Configuration:
          </Text>
          <Group gap="xs">
            <Badge variant="light" color={LANGUAGE_COLORS[targetConfig.language]} size="lg">
              {LANGUAGE_METADATA[targetConfig.language].label} v{targetConfig.languageVersion}
            </Badge>
            <Text size="sm" c="dimmed">
              +
            </Text>
            <Badge variant="light" color="blue" size="lg">
              {FRAMEWORK_METADATA[targetConfig.framework].label} v{targetConfig.frameworkVersion}
            </Badge>
          </Group>
        </Group>
      </Card>
    </Stack>
  );
}
