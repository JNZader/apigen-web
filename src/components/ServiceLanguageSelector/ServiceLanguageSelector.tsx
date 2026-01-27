import {
  Alert,
  Badge,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { memo, useCallback, useMemo } from 'react';
import type { ServiceDatabaseType, TargetConfig } from '../../types';
import {
  getDatabaseCompatibilityWarning,
  isDatabaseCompatible,
  isH2Compatible,
} from '../../types/config/databaseCompatibility';
import {
  FRAMEWORK_METADATA,
  type Framework,
  getFrameworksForLanguage,
  LANGUAGE_METADATA,
  LANGUAGES,
  type Language,
} from '../../types/target';

interface ServiceLanguageSelectorProps {
  readonly currentTarget?: TargetConfig;
  readonly projectTarget: TargetConfig;
  readonly onTargetChange: (target: TargetConfig | undefined) => void;
  readonly databaseType: ServiceDatabaseType;
}

// Color mapping for languages (visual distinction)
const LANGUAGE_COLORS: Record<Language, string> = {
  java: 'orange',
  kotlin: 'violet',
  python: 'blue',
  typescript: 'cyan',
  php: 'indigo',
  go: 'teal',
  rust: 'red',
  csharp: 'grape',
};

interface LanguageCardProps {
  readonly language: Language;
  readonly isSelected: boolean;
  readonly isProjectDefault: boolean;
  readonly onSelect: (language: Language) => void;
  readonly compatibilityWarning?: string;
}

const LanguageCard = memo(function LanguageCard({
  language,
  isSelected,
  isProjectDefault,
  onSelect,
  compatibilityWarning,
}: LanguageCardProps) {
  const meta = LANGUAGE_METADATA[language];
  const color = LANGUAGE_COLORS[language];
  const hasWarning = !!compatibilityWarning;

  return (
    <UnstyledButton onClick={() => onSelect(language)} style={{ width: '100%' }}>
      <Card
        withBorder
        padding="sm"
        radius="md"
        style={{
          borderColor: isSelected
            ? `var(--mantine-color-${color}-5)`
            : hasWarning
              ? 'var(--mantine-color-yellow-5)'
              : undefined,
          borderWidth: isSelected ? 2 : 1,
          backgroundColor: isSelected ? `var(--mantine-color-${color}-0)` : undefined,
          cursor: 'pointer',
          transition: 'border-color 0.15s, background-color 0.15s',
          position: 'relative',
        }}
      >
        {/* Warning indicator */}
        {hasWarning && (
          <Tooltip label={compatibilityWarning} position="top" withArrow multiline w={220}>
            <IconAlertTriangle
              size={14}
              color="var(--mantine-color-yellow-6)"
              style={{ position: 'absolute', top: 4, right: 4 }}
            />
          </Tooltip>
        )}
        <Stack gap={4} align="center">
          <Group gap={4}>
            <Text fw={600} size="sm">
              {meta.label}
            </Text>
            {isSelected && <IconCheck size={14} color={`var(--mantine-color-${color}-6)`} />}
          </Group>
          <Text size="xs" c="dimmed">
            {meta.packageManager}
          </Text>
          {isProjectDefault && (
            <Badge size="xs" variant="light" color="gray">
              Project default
            </Badge>
          )}
        </Stack>
      </Card>
    </UnstyledButton>
  );
});

function ServiceLanguageSelectorComponent({
  currentTarget,
  projectTarget,
  onTargetChange,
  databaseType,
}: ServiceLanguageSelectorProps) {
  const isInherited = !currentTarget;
  const effectiveTarget = currentTarget ?? projectTarget;

  // Get compatible frameworks for the current language
  const compatibleFrameworks = useMemo(() => {
    return getFrameworksForLanguage(effectiveTarget.language).map((fw) => ({
      value: fw,
      label: FRAMEWORK_METADATA[fw].label,
    }));
  }, [effectiveTarget.language]);

  // Get available versions for the current language
  const languageVersions = useMemo(() => {
    const meta = LANGUAGE_METADATA[effectiveTarget.language];
    return meta.availableVersions.map((v) => ({ value: v, label: `v${v}` }));
  }, [effectiveTarget.language]);

  // Get available versions for the current framework
  const frameworkVersions = useMemo(() => {
    const meta = FRAMEWORK_METADATA[effectiveTarget.framework];
    return meta.availableVersions.map((v) => ({ value: v, label: `v${v}` }));
  }, [effectiveTarget.framework]);

  // Check compatibility warnings
  const compatibilityWarning = useMemo(() => {
    if (isInherited) return undefined;
    return getDatabaseCompatibilityWarning(effectiveTarget.language, databaseType);
  }, [isInherited, effectiveTarget.language, databaseType]);

  const isH2Error = useMemo(() => {
    if (isInherited) return false;
    return databaseType === 'h2' && !isH2Compatible(effectiveTarget.language);
  }, [isInherited, databaseType, effectiveTarget.language]);

  // Handle toggle between inherited and custom
  const handleInheritedToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        // Switch to inherited (remove custom config)
        onTargetChange(undefined);
      } else {
        // Switch to custom (copy from project)
        onTargetChange({ ...projectTarget });
      }
    },
    [onTargetChange, projectTarget],
  );

  // Handle language selection
  const handleLanguageSelect = useCallback(
    (language: Language) => {
      if (!currentTarget) return;

      const langMeta = LANGUAGE_METADATA[language];
      const defaultFramework = langMeta.frameworks[0];
      const frameworkMeta = FRAMEWORK_METADATA[defaultFramework];

      onTargetChange({
        language,
        framework: defaultFramework,
        languageVersion: langMeta.defaultVersion,
        frameworkVersion: frameworkMeta.defaultVersion,
      });
    },
    [currentTarget, onTargetChange],
  );

  // Handle framework change
  const handleFrameworkChange = useCallback(
    (framework: string | null) => {
      if (!currentTarget || !framework) return;

      const frameworkMeta = FRAMEWORK_METADATA[framework as Framework];
      onTargetChange({
        ...currentTarget,
        framework: framework as Framework,
        frameworkVersion: frameworkMeta.defaultVersion,
      });
    },
    [currentTarget, onTargetChange],
  );

  // Handle language version change
  const handleLanguageVersionChange = useCallback(
    (version: string | null) => {
      if (!currentTarget || !version) return;
      onTargetChange({
        ...currentTarget,
        languageVersion: version,
      });
    },
    [currentTarget, onTargetChange],
  );

  // Handle framework version change
  const handleFrameworkVersionChange = useCallback(
    (version: string | null) => {
      if (!currentTarget || !version) return;
      onTargetChange({
        ...currentTarget,
        frameworkVersion: version,
      });
    },
    [currentTarget, onTargetChange],
  );

  return (
    <Stack gap="md">
      {/* Inherit/Custom toggle */}
      <Switch
        label="Use project language configuration"
        description={
          isInherited
            ? `Using ${LANGUAGE_METADATA[projectTarget.language].label} / ${FRAMEWORK_METADATA[projectTarget.framework].label}`
            : 'Configure a different language for this service'
        }
        checked={isInherited}
        onChange={(e) => handleInheritedToggle(e.currentTarget.checked)}
      />

      {/* Current effective configuration badge */}
      <Group gap="xs">
        <Badge
          variant="light"
          color={LANGUAGE_COLORS[effectiveTarget.language]}
          leftSection={isInherited ? undefined : <IconCheck size={10} />}
        >
          {LANGUAGE_METADATA[effectiveTarget.language].label}
        </Badge>
        <Badge variant="outline" color="gray">
          {FRAMEWORK_METADATA[effectiveTarget.framework].label}
        </Badge>
        {isInherited && (
          <Badge variant="dot" color="gray" size="sm">
            Inherited
          </Badge>
        )}
      </Group>

      {/* Custom language selection (only when not inherited) */}
      {!isInherited && (
        <>
          {/* Language grid */}
          <Text size="sm" fw={500}>
            Select Language
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
            {LANGUAGES.map((lang) => (
              <LanguageCard
                key={lang}
                language={lang}
                isSelected={effectiveTarget.language === lang}
                isProjectDefault={projectTarget.language === lang}
                onSelect={handleLanguageSelect}
                compatibilityWarning={
                  isDatabaseCompatible(lang, databaseType)
                    ? undefined
                    : getDatabaseCompatibilityWarning(lang, databaseType)
                }
              />
            ))}
          </SimpleGrid>

          {/* Framework and version selectors */}
          <Group grow>
            <Select
              label="Framework"
              value={effectiveTarget.framework}
              onChange={handleFrameworkChange}
              data={compatibleFrameworks}
              allowDeselect={false}
            />
            <Select
              label="Language Version"
              value={effectiveTarget.languageVersion}
              onChange={handleLanguageVersionChange}
              data={languageVersions}
              allowDeselect={false}
            />
            <Select
              label="Framework Version"
              value={effectiveTarget.frameworkVersion}
              onChange={handleFrameworkVersionChange}
              data={frameworkVersions}
              allowDeselect={false}
            />
          </Group>

          {/* H2 error (blocking) */}
          {isH2Error && (
            <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Incompatible Database">
              H2 in-memory database is only supported with Java and Kotlin. Please change the
              database type in the Database tab or select a JVM-based language.
            </Alert>
          )}

          {/* Compatibility warning (non-blocking) */}
          {compatibilityWarning && !isH2Error && (
            <Alert color="yellow" icon={<IconAlertTriangle size={16} />} title="Compatibility Note">
              {compatibilityWarning}
            </Alert>
          )}
        </>
      )}

      {/* Info text */}
      <Text size="xs" c="dimmed">
        {isInherited
          ? 'This service will use the same language and framework as the project. Toggle off to configure a different language.'
          : 'This service will be generated using the selected language and framework, independent of the project configuration.'}
      </Text>
    </Stack>
  );
}

export const ServiceLanguageSelector = memo(ServiceLanguageSelectorComponent);
