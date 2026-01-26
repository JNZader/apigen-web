import { Badge, Center, Group, Loader, ScrollArea, Stack, Tabs, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBrandGoogle, IconKey, IconMail, IconTemplate, IconUpload } from '@tabler/icons-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFeatures, useProject, useProjectStoreInternal, useTargetConfig } from '../../store';
import type { ProjectConfig } from '../../types';

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
export function FeaturePackSection() {
  const targetConfig = useTargetConfig();
  const features = useFeatures();
  const project = useProject();
  const setProject = useProjectStoreInternal((s) => s.setProject);
  const isJavaKotlin = ['java', 'kotlin'].includes(targetConfig.language);

  // Track if we're syncing from store to form to avoid circular updates
  const isSyncingFromStore = useRef(false);

  // Callback for form value changes - sync to store
  const handleValuesChange = useCallback(
    (values: ProjectConfig) => {
      if (!isSyncingFromStore.current) {
        setProject(values);
      }
    },
    [setProject],
  );

  // Create a form that syncs with the store via onValuesChange
  const form = useForm<ProjectConfig>({
    initialValues: project,
    onValuesChange: handleValuesChange,
  });

  // Sync store changes to form
  useEffect(() => {
    isSyncingFromStore.current = true;
    form.setValues(project);
    // Reset flag after React has processed the update
    requestAnimationFrame(() => {
      isSyncingFromStore.current = false;
    });
  }, [project, form.setValues]);

  // Count enabled features for the badge
  const enabledFeaturesCount = useMemo(() => {
    let count = 0;
    if (features.socialLogin) count++;
    if (features.mailService) count++;
    if (features.fileStorage) count++;
    if (features.passwordReset) count++;
    if (features.jteTemplates) count++;
    return count;
  }, [
    features.socialLogin,
    features.mailService,
    features.fileStorage,
    features.passwordReset,
    features.jteTemplates,
  ]);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={500}>Feature Pack 2025</Text>
        <Badge variant="light" color="blue">
          {enabledFeaturesCount} enabled
        </Badge>
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
              <PasswordResetSettingsForm />
            </Suspense>
          </ScrollArea>
        </Tabs.Panel>

        {isJavaKotlin && (
          <Tabs.Panel value="jte" pt="md">
            <ScrollArea h={450}>
              <Suspense fallback={<LoadingFallback />}>
                <JteTemplatesSettingsForm />
              </Suspense>
            </ScrollArea>
          </Tabs.Panel>
        )}
      </Tabs>
    </Stack>
  );
}
