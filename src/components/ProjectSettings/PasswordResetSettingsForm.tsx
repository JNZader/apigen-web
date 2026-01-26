import { Alert, Collapse, List, Paper, Stack, Switch, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconKey, IconMail } from '@tabler/icons-react';
import { useTargetConfig } from '../../store';
import type { SettingsFormProps } from './types';

export function PasswordResetSettingsForm({ form }: SettingsFormProps) {
  const targetConfig = useTargetConfig();
  const isRust = targetConfig.language === 'rust';
  const mailEnabled = form.values.features.mailService;
  const passwordResetEnabled = form.values.features.passwordReset;

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
        {...form.getInputProps('features.passwordReset', { type: 'checkbox' })}
      />

      {!mailEnabled && passwordResetEnabled && (
        <Alert
          icon={<IconMail size={16} />}
          title="Mail Service Required"
          color="yellow"
          variant="light"
        >
          <Text size="sm">
            Password Reset requires Mail Service to send reset emails. Please enable Mail Service in
            the Features tab for password reset to work properly.
          </Text>
        </Alert>
      )}

      {isRust && passwordResetEnabled && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Limited Support for Rust"
          color="orange"
          variant="light"
        >
          <Text size="sm">
            Password Reset for Rust/Axum has limited template support. JTE Templates are not
            available for Rust.
          </Text>
        </Alert>
      )}

      <Collapse in={passwordResetEnabled}>
        <Stack mt="md">
          <Title order={6}>Generated Components</Title>
          <Paper p="md" withBorder>
            <Text size="sm" fw={500} mb="xs">
              The following will be generated:
            </Text>
            <List size="sm" spacing="xs">
              <List.Item>
                <Text size="sm">
                  <Text component="span" fw={500}>
                    PasswordResetToken
                  </Text>{' '}
                  - Entity for storing reset tokens
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm">
                  <Text component="span" fw={500}>
                    PasswordResetService
                  </Text>{' '}
                  - Business logic for password reset flow
                </Text>
              </List.Item>
              <List.Item>
                <Text size="sm">
                  <Text component="span" fw={500}>
                    PasswordResetController
                  </Text>{' '}
                  - REST endpoints for password reset
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
