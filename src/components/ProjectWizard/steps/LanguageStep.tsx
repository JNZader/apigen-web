import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
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
import type { Framework, Language, ProjectConfig } from '../../../types';
import {
  FRAMEWORK_METADATA,
  getDefaultFramework,
  getFrameworksForLanguage,
  LANGUAGE_METADATA,
  LANGUAGES,
} from '../../../types/target';
import { WizardStep } from '../WizardStep';

interface LanguageStepProps {
  readonly form: UseFormReturnType<ProjectConfig>;
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

export function LanguageStep({ form }: LanguageStepProps) {
  const [hoveredLanguage, setHoveredLanguage] = useState<Language | null>(null);

  const selectedLanguage = form.values.targetConfig?.language ?? 'java';
  const selectedFramework = form.values.targetConfig?.framework ?? 'spring-boot';
  const availableFrameworks = getFrameworksForLanguage(selectedLanguage);
  const hasMultipleFrameworks = availableFrameworks.length > 1;

  const handleLanguageSelect = (language: Language) => {
    const framework = getDefaultFramework(language);
    const languageMeta = LANGUAGE_METADATA[language];
    const frameworkMeta = FRAMEWORK_METADATA[framework];

    form.setFieldValue('targetConfig', {
      language,
      framework,
      languageVersion: languageMeta.defaultVersion,
      frameworkVersion: frameworkMeta.defaultVersion,
    });
  };

  const handleFrameworkSelect = (framework: Framework) => {
    const frameworkMeta = FRAMEWORK_METADATA[framework];
    form.setFieldValue('targetConfig.framework', framework);
    form.setFieldValue('targetConfig.frameworkVersion', frameworkMeta.defaultVersion);
  };

  return (
    <WizardStep
      icon={<IconCode size={24} />}
      title="Language & Framework"
      description="Choose your target programming language and framework"
    >
      <Stack gap="lg">
        <div>
          <Text fw={600} size="sm" mb="xs">
            Select Language
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            {LANGUAGES.map((language) => {
              const meta = LANGUAGE_METADATA[language];
              const isSelected = selectedLanguage === language;
              const isHovered = hoveredLanguage === language;
              const color = LANGUAGE_COLORS[language];

              return (
                <Tooltip
                  key={language}
                  label={`${meta.label} v${meta.defaultVersion} (${meta.packageManager})`}
                  position="top"
                  withArrow
                  openDelay={300}
                >
                  <Card
                    style={{
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.02)' : isHovered ? 'scale(1.01)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                    shadow={isSelected ? 'md' : 'sm'}
                    padding="md"
                    radius="md"
                    withBorder
                    bd={
                      isSelected ? `2px solid var(--mantine-color-${color.split('.')[0]}-6)` : undefined
                    }
                    bg={isSelected ? `var(--mantine-color-${color.split('.')[0]}-light)` : undefined}
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
                    data-testid={`wizard-language-card-${language}`}
                  >
                    <Stack gap="xs" align="center">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        color={color}
                        variant={isSelected ? 'filled' : 'light'}
                      >
                        {LANGUAGE_ICONS[language]}
                      </ThemeIcon>
                      <Text fw={isSelected ? 700 : 500} size="sm" ta="center">
                        {meta.label}
                      </Text>
                      {isSelected && (
                        <Badge size="xs" variant="light" color={color}>
                          v{meta.defaultVersion}
                        </Badge>
                      )}
                    </Stack>
                  </Card>
                </Tooltip>
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
                const isSelected = selectedFramework === framework;

                return (
                  <Tooltip
                    key={framework}
                    label={`${meta.label} v${meta.defaultVersion}`}
                    position="top"
                    withArrow
                    openDelay={300}
                  >
                    <Badge
                      size="lg"
                      variant={isSelected ? 'filled' : 'outline'}
                      color={isSelected ? 'blue' : 'gray'}
                      leftSection={<IconCode size={14} />}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
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
                      data-testid={`wizard-framework-badge-${framework}`}
                    >
                      {meta.label}
                    </Badge>
                  </Tooltip>
                );
              })}
            </Group>
          </div>
        )}

        <Card withBorder padding="sm" radius="md" bg="var(--mantine-color-gray-light)">
          <Group gap="xs" justify="center" wrap="wrap">
            <Text size="sm" c="dimmed">
              Selected:
            </Text>
            <Badge variant="light" color={LANGUAGE_COLORS[selectedLanguage]}>
              {LANGUAGE_METADATA[selectedLanguage].label} v
              {form.values.targetConfig?.languageVersion ?? LANGUAGE_METADATA[selectedLanguage].defaultVersion}
            </Badge>
            <Text size="sm" c="dimmed">
              +
            </Text>
            <Badge variant="light" color="blue">
              {FRAMEWORK_METADATA[selectedFramework].label} v
              {form.values.targetConfig?.frameworkVersion ?? FRAMEWORK_METADATA[selectedFramework].defaultVersion}
            </Badge>
          </Group>
        </Card>
      </Stack>
    </WizardStep>
  );
}
