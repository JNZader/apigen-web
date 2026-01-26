import { Alert, Collapse, List, Paper, Stack, Switch, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconKey, IconMail } from '@tabler/icons-react';
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
