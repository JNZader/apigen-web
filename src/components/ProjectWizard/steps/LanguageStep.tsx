import { Group, Paper, Radio, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { memo, createElement } from 'react';
import { LANGUAGE_CONFIGS, FRAMEWORK_CONFIGS } from '@/config/languageConfigs';
import type { Language, Framework } from '@/types/target';

interface LanguageStepProps {
  readonly data: { language: string; framework: string };
  readonly errors: Record<string, string>;
  readonly onChange: (updates: Partial<LanguageStepProps['data']>) => void;
}

const LANGUAGES = Object.values(LANGUAGE_CONFIGS).sort((a, b) => a.popularityRank - b.popularityRank);

export const LanguageStep = memo(function LanguageStep({
  data,
  errors,
  onChange,
}: LanguageStepProps) {
  const selectedLanguage = LANGUAGE_CONFIGS[data.language as Language];
  const frameworks = selectedLanguage?.frameworks.map((fw) => FRAMEWORK_CONFIGS[fw]) || [];

  return (
    <Stack gap="md">
      <div>
        <Text fw={500} mb="xs">
          Select Programming Language
        </Text>
        <Radio.Group
          value={data.language}
          onChange={(value) => {
            const lang = LANGUAGE_CONFIGS[value as Language];
            onChange({
              language: value,
              framework: lang?.frameworks[0] || '',
            });
          }}
        >
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
            {LANGUAGES.map((lang) => (
              <Paper
                key={lang.id}
                withBorder
                p="sm"
                radius="md"
                style={{
                  cursor: 'pointer',
                  borderColor:
                    data.language === lang.id
                      ? `var(--mantine-color-${lang.color}-5)`
                      : undefined,
                  borderWidth: data.language === lang.id ? 2 : 1,
                }}
                onClick={() =>
                  onChange({ language: lang.id, framework: lang.frameworks[0] })
                }
              >
                <Radio value={lang.id} label="" style={{ display: 'none' }} />
                <Group gap="xs">
                  <ThemeIcon color={lang.color} size="md" variant="light">
                    {createElement(lang.icon, { size: 18 })}
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    {lang.label}
                  </Text>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Radio.Group>
        {errors.language && (
          <Text c="red" size="sm" mt="xs">
            {errors.language}
          </Text>
        )}
      </div>

      {frameworks.length > 1 && (
        <div>
          <Text fw={500} mb="xs">
            Select Framework
          </Text>
          <Radio.Group
            value={data.framework}
            onChange={(value) => onChange({ framework: value })}
          >
            <Stack gap="xs">
              {frameworks.map((fw) => (
                <Radio
                  key={fw.id}
                  value={fw.id}
                  label={
                    <div>
                      <Text size="sm" fw={500}>
                        {fw.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {fw.description}
                      </Text>
                    </div>
                  }
                />
              ))}
            </Stack>
          </Radio.Group>
        </div>
      )}

      {selectedLanguage && (
        <Text size="sm" c="dimmed">
          {selectedLanguage.description}
        </Text>
      )}
    </Stack>
  );
});
