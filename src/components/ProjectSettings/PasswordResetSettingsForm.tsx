import { Alert, Group, List, Paper, Stack, Switch, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconInfoCircle, IconKey } from '@tabler/icons-react';
import { memo } from 'react';
import {
  useFeaturePackConfig,
  useProject,
  useProjectStoreInternal,
  useTargetConfig,
} from '@/store';

export const PasswordResetSettingsForm = memo(function PasswordResetSettingsForm() {
  const targetConfig = useTargetConfig();
  const project = useProject();
  const featurePackConfig = useFeaturePackConfig();

  const passwordResetEnabled = project.features.passwordReset;
  const mailEnabled = featurePackConfig.mail.enabled;

  const isSupported = targetConfig ? !['rust'].includes(targetConfig.language) : true;

  const handleToggle = (checked: boolean) => {
    useProjectStoreInternal.setState((state) => ({
      project: {
        ...state.project,
        features: {
          ...state.project.features,
          passwordReset: checked,
        },
      },
    }));
  };

  if (!isSupported) {
    return (
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Not Available"
        color="yellow"
        data-testid="password-reset-unavailable-alert"
      >
        Password Reset is not available for {targetConfig?.language}.
      </Alert>
    );
  }

  return (
    <Stack gap="md" data-testid="password-reset-settings-form">
      {/* Master toggle */}
      <Group justify="space-between">
        <div>
          <Group gap="xs">
            <IconKey size={20} />
            <Text fw={500}>Enable Password Reset</Text>
          </Group>
          <Text size="sm" c="dimmed">
            Allow users to reset their password via email
          </Text>
        </div>
        <Switch
          checked={passwordResetEnabled}
          onChange={(e) => handleToggle(e.currentTarget.checked)}
          size="md"
          data-testid="password-reset-toggle"
          aria-label="Enable Password Reset"
        />
      </Group>

      {/* Dependency warning */}
      {passwordResetEnabled && !mailEnabled && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Mail Service Required"
          color="yellow"
          data-testid="mail-required-warning"
        >
          <Text size="sm">
            Password Reset requires Mail Service to send reset emails.
            <br />
            Please enable Mail Service in the Mail tab.
          </Text>
        </Alert>
      )}

      {/* What gets generated */}
      {passwordResetEnabled && (
        <Paper withBorder p="md" radius="md" data-testid="generated-items-section">
          <Text fw={500} mb="sm">
            This will generate:
          </Text>

          <List
            spacing="xs"
            size="sm"
            icon={
              <ThemeIcon color="green" size={20} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            <List.Item data-testid="generated-item-token">
              <Text fw={500}>PasswordResetToken</Text>
              <Text size="xs" c="dimmed">
                Entity to store reset tokens with expiration
              </Text>
            </List.Item>
            <List.Item data-testid="generated-item-service">
              <Text fw={500}>PasswordResetService</Text>
              <Text size="xs" c="dimmed">
                Service to handle token generation and validation
              </Text>
            </List.Item>
            <List.Item data-testid="generated-item-controller">
              <Text fw={500}>PasswordResetController</Text>
              <Text size="xs" c="dimmed">
                REST endpoints for password reset flow
              </Text>
            </List.Item>
          </List>

          <Text size="sm" mt="md" c="dimmed">
            <strong>Endpoints:</strong>
          </Text>
          <List size="xs" c="dimmed">
            <List.Item>POST /api/auth/password/forgot - Request reset email</List.Item>
            <List.Item>POST /api/auth/password/reset - Reset with token</List.Item>
          </List>
        </Paper>
      )}
    </Stack>
  );
});
