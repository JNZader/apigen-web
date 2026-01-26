import { Badge, Center, Group, Loader, ScrollArea, Stack, Tabs, Text } from '@mantine/core';
import {
  IconBrandGoogle,
  IconKey,
  IconMail,
  IconTemplate,
  IconUpload,
} from '@tabler/icons-react';
import { Suspense, lazy, useMemo } from 'react';
import { useTargetConfig } from '../../store';
import type { SettingsFormProps } from './types';

// Lazy load all Feature Pack forms for better performance
const SocialLoginSettingsForm = lazy(() =>
  import('./SocialLoginSettingsForm').then((m) => ({ default: m.SocialLoginSettingsForm })),
);

const MailServiceSettingsForm = lazy(() =>
  import('./MailServiceSettingsForm').then((m) => ({ default: m.MailServiceSettingsForm })),
);

const FileStorageSettingsForm = lazy(() =>
  import('./FileStorageSettingsForm').then((m) => ({ default: m.FileStorageSettingsForm })),
);

const PasswordResetSettingsForm = lazy(() =>
  import('./PasswordResetSettingsForm').then((m) => ({ default: m.PasswordResetSettingsForm })),
);

const JteTemplatesSettingsForm = lazy(() =>
  import('./JteTemplatesSettingsForm').then((m) => ({ default: m.JteTemplatesSettingsForm })),
);

/**
 * Loading fallback component for lazy-loaded forms
 */
function LoadingFallback() {
  return (
    <Center h={200}>
      <Stack align="center" gap="sm">
        <Loader size="md" />
        <Text size="sm" c="dimmed">
          Loading...
        </Text>
      </Stack>
    </Center>
  );
}

/**
 * Feature Pack Section component with tabs for all Feature Pack 2025 forms.
 * Uses lazy loading for better initial load performance.
 */
export function FeaturePackSection({ form }: SettingsFormProps) {
  const targetConfig = useTargetConfig();
  const isJavaKotlin = ['java', 'kotlin'].includes(targetConfig.language);

  // Count enabled features for the badge
  const enabledFeaturesCount = useMemo(() => {
    let count = 0;
    if (form.values.featurePackConfig?.socialLogin?.enabled) count++;
    if (form.values.featurePackConfig?.mail?.enabled) count++;
    if (form.values.featurePackConfig?.storage?.enabled) count++;
    if (form.values.features?.passwordReset) count++;
    if (form.values.featurePackConfig?.jte?.enabled) count++;
    return count;
  }, [
    form.values.featurePackConfig?.socialLogin?.enabled,
    form.values.featurePackConfig?.mail?.enabled,
    form.values.featurePackConfig?.storage?.enabled,
    form.values.features?.passwordReset,
    form.values.featurePackConfig?.jte?.enabled,
  ]);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={500}>Feature Pack 2025</Text>
        {enabledFeaturesCount > 0 && (
          <Badge variant="light" color="blue">
            {enabledFeaturesCount} enabled
          </Badge>
        )}
      </Group>

      <Tabs defaultValue="social" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="social" leftSection={<IconBrandGoogle size={16} />}>
            Social Login
          </Tabs.Tab>
          <Tabs.Tab value="mail" leftSection={<IconMail size={16} />}>
            Mail
          </Tabs.Tab>
          <Tabs.Tab value="storage" leftSection={<IconUpload size={16} />}>
            Storage
          </Tabs.Tab>
          <Tabs.Tab value="password" leftSection={<IconKey size={16} />}>
            Password Reset
          </Tabs.Tab>
          {isJavaKotlin && (
            <Tabs.Tab value="jte" leftSection={<IconTemplate size={16} />}>
              JTE
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="social" pt="md">
          <ScrollArea h={450}>
            <Suspense fallback={<LoadingFallback />}>
              <SocialLoginSettingsForm form={form} />
            </Suspense>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="mail" pt="md">
          <ScrollArea h={450}>
            <Suspense fallback={<LoadingFallback />}>
              <MailServiceSettingsForm form={form} />
            </Suspense>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="storage" pt="md">
          <ScrollArea h={450}>
            <Suspense fallback={<LoadingFallback />}>
              <FileStorageSettingsForm form={form} />
            </Suspense>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="password" pt="md">
          <ScrollArea h={450}>
            <Suspense fallback={<LoadingFallback />}>
              <PasswordResetSettingsForm form={form} />
            </Suspense>
          </ScrollArea>
        </Tabs.Panel>

        {isJavaKotlin && (
          <Tabs.Panel value="jte" pt="md">
            <ScrollArea h={450}>
              <Suspense fallback={<LoadingFallback />}>
                <JteTemplatesSettingsForm form={form} />
              </Suspense>
            </ScrollArea>
          </Tabs.Panel>
        )}
      </Tabs>
    </Stack>
  );
}
