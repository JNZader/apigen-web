import { Alert, Collapse, List, Paper, Stack, Switch, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconKey, IconMail } from '@tabler/icons-react';
import {
  useFeaturePackConfig,
  useFeatures,
  useProjectStoreInternal,
  useTargetConfig,
} from '../../store';

export function PasswordResetSettingsForm() {
  const targetConfig = useTargetConfig();
  const features = useFeatures();
  const featurePackConfig = useFeaturePackConfig();
  const setFeatures = useProjectStoreInternal((s) => s.setFeatures);

  const isRust = targetConfig.language === 'rust';
  const mailEnabled = featurePackConfig.mail.enabled;
  const passwordResetEnabled = features.passwordReset;

  if (isRust) {
    return (
      <Stack>
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Not Available"
          color="yellow"
          variant="light"
          data-testid="password-reset-unavailable-alert"
        >
          Password Reset is not available for Rust. This feature is currently supported for Java,
          Kotlin, Python, TypeScript, PHP, C#, and Go.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack>
      <Switch
        label={
          <Text component="span" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconKey size={16} />
            Enable Password Reset
          </Text>
        }
        description="Generate password reset functionality with email-based recovery"
        checked={passwordResetEnabled}
        onChange={(e) => setFeatures({ passwordReset: e.currentTarget.checked })}
        data-testid="password-reset-toggle"
      />

      {!mailEnabled && passwordResetEnabled && (
        <Alert
          icon={<IconMail size={16} />}
          title="Mail Service Required"
          color="yellow"
          variant="light"
          data-testid="mail-required-warning"
        >
          <Text size="sm">
            Password Reset requires Mail Service to send reset emails. Please enable Mail Service in
            the Features tab for password reset to work properly.
          </Text>
        </Alert>
      )}

      <Collapse in={passwordResetEnabled}>
        <Stack mt="md">
          {/* What gets generated */}
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
          </Paper>

          <Title order={6}>Generated Endpoints</Title>
          <Paper p="md" withBorder>
            <List size="sm" spacing="xs">
              <List.Item>
                <Text size="sm" ff="monospace">
                  POST /api/auth/password/forgot
                </Text>
                <Text size="xs" c="dimmed">
                  Request password reset email
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm" ff="monospace">
                  POST /api/auth/password/reset
                </Text>
                <Text size="xs" c="dimmed">
                  Reset password with token
                </Text>
              </List.Item>
            </List>
          </Paper>
        </Stack>
      </Collapse>
    </Stack>
  );
}
