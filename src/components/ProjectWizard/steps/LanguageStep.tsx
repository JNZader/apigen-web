import { Badge, Card, Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconBrandGolang,
  IconBrandPhp,
  IconBrandPython,
  IconBrandRust,
  IconBrandTypescript,
  IconCoffee,
  IconDiamond,
  IconHash,
} from '@tabler/icons-react';
import { memo } from 'react';
import {
  FRAMEWORK_METADATA,
  type Framework,
  getDefaultFramework,
  getFrameworksForLanguage,
  LANGUAGE_METADATA,
  LANGUAGES,
  type Language,
} from '@/types/target';
import type { WizardData } from '../ProjectWizard';

interface LanguageStepProps {
  readonly data: Pick<WizardData, 'language' | 'framework'>;
  readonly errors: Record<string, string>;
  readonly onChange: (updates: Partial<WizardData>) => void;
}

const LANGUAGE_ICONS: Record<Language, React.ReactNode> = {
  java: <IconCoffee size={24} />,
  kotlin: <IconDiamond size={24} />,
  python: <IconBrandPython size={24} />,
  typescript: <IconBrandTypescript size={24} />,
  php: <IconBrandPhp size={24} />,
  go: <IconBrandGolang size={24} />,
  rust: <IconBrandRust size={24} />,
  csharp: <IconHash size={24} />,
};

const LANGUAGE_COLORS: Record<Language, string> = {
  java: 'orange',
  kotlin: 'grape',
  python: 'yellow',
  typescript: 'blue',
  php: 'indigo',
  go: 'cyan',
  rust: 'orange',
  csharp: 'violet',
};

export const LanguageStep = memo(function LanguageStep({
  data,
  errors,
  onChange,
}: LanguageStepProps) {
  const handleLanguageSelect = (language: Language) => {
    const framework = getDefaultFramework(language);
    onChange({ language, framework });
  };

  const handleFrameworkSelect = (framework: Framework) => {
    onChange({ framework });
  };

  const availableFrameworks = getFrameworksForLanguage(data.language as Language);
  const hasMultipleFrameworks = availableFrameworks.length > 1;

  return (
    <Stack gap="md">
      <div>
        <Text fw={600} size="sm" mb="xs">
          Select Programming Language
        </Text>
        {errors.language && (
          <Text c="red" size="sm" mb="xs">
            {errors.language}
          </Text>
        )}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {LANGUAGES.map((language) => {
            const meta = LANGUAGE_METADATA[language];
            const isSelected = data.language === language;
            const color = LANGUAGE_COLORS[language];

            return (
              <Card
                key={language}
                shadow={isSelected ? 'md' : 'sm'}
                padding="md"
                radius="md"
                withBorder
                bd={isSelected ? `2px solid var(--mantine-color-${color}-6)` : undefined}
                bg={isSelected ? `var(--mantine-color-${color}-light)` : undefined}
                onClick={() => handleLanguageSelect(language)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLanguageSelect(language);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Select ${meta.label}`}
                data-testid={`language-card-${language}`}
                style={{ cursor: 'pointer' }}
              >
                <Stack gap="xs" align="center">
                  <ThemeIcon
                    size="lg"
                    radius="md"
                    color={color}
                    variant={isSelected ? 'filled' : 'light'}
                  >
                    {LANGUAGE_ICONS[language]}
                  </ThemeIcon>
                  <Text fw={isSelected ? 700 : 500} size="sm" ta="center">
                    {meta.label}
                  </Text>
                </Stack>
              </Card>
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
              const isSelected = data.framework === framework;

              return (
                <Badge
                  key={framework}
                  size="lg"
                  variant={isSelected ? 'filled' : 'outline'}
                  color={isSelected ? 'blue' : 'gray'}
                  style={{ cursor: 'pointer' }}
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
                  aria-label={`Select ${meta.label}`}
                  data-testid={`framework-badge-${framework}`}
                >
                  {meta.label}
                </Badge>
              );
            })}
          </Group>
        </div>
      )}
    </Stack>
  );
});
