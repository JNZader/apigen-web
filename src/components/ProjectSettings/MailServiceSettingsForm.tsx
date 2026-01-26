import {
  Alert,
  Checkbox,
  Collapse,
  Divider,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle, IconMail } from '@tabler/icons-react';
import { useTargetConfig } from '../../store';
import type { SettingsFormProps } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  if (!email) return true;
  return EMAIL_REGEX.test(email);
}

export function MailServiceSettingsForm({ form }: SettingsFormProps) {
  const targetConfig = useTargetConfig();
  const isRust = targetConfig.language === 'rust';
  const isMailEnabled = form.values.featurePackConfig.mail.enabled;

  if (isRust) {
    return (
      <Stack>
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Not Available"
          color="orange"
          variant="light"
          data-testid="mail-unavailable-alert"
        >
          <Text size="sm">
            Mail Service is not available for Rust. This feature is only supported for Java, Kotlin,
            Python, TypeScript, PHP, C#, and Go projects.
          </Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack>
      <Switch
        label="Enable Mail Service"
        description="Enable SMTP email sending capabilities"
        {...form.getInputProps('featurePackConfig.mail.enabled', { type: 'checkbox' })}
        data-testid="mail-enable-toggle"
      />

      <Collapse in={isMailEnabled}>
        <Stack mt="md">
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              <strong>Security Note:</strong> The SMTP password should be configured via environment
              variable (e.g., <code>MAIL_PASSWORD</code>) in production. Never commit passwords to
              version control.
            </Text>
          </Alert>

          <Divider
            label={
              <Group gap="xs">
                <IconMail size={14} />
                <Text size="sm">SMTP Configuration</Text>
              </Group>
            }
            labelPosition="left"
          />

          <TextInput
            label="SMTP Host"
            placeholder="smtp.example.com"
            description="SMTP server hostname"
            {...form.getInputProps('featurePackConfig.mail.host')}
            data-testid="smtp-host-input"
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="SMTP Port"
              description="Common ports: 25 (SMTP), 465 (SMTPS), 587 (Submission)"
              min={1}
              max={65535}
              {...form.getInputProps('featurePackConfig.mail.port')}
              data-testid="smtp-port-input"
            />

            <Select
              label="Encryption"
              description="Connection security protocol"
              data={[
                { value: 'none', label: 'None (Not recommended)' },
                { value: 'tls', label: 'TLS (Implicit)' },
                { value: 'starttls', label: 'STARTTLS (Explicit)' },
              ]}
              {...form.getInputProps('featurePackConfig.mail.encryption')}
              data-testid="smtp-encryption-select"
            />
          </SimpleGrid>

          <TextInput
            label="Username"
            placeholder="user@example.com"
            description="SMTP authentication username"
            {...form.getInputProps('featurePackConfig.mail.username')}
            data-testid="smtp-username-input"
          />

          <Alert color="blue" icon={<IconInfoCircle size={16} />}>
            Password will be configured via environment variable MAIL_PASSWORD
          </Alert>

          <Divider label="Sender Configuration" labelPosition="left" mt="md" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="From Address"
              placeholder="noreply@example.com"
              description="Default sender email address"
              {...form.getInputProps('featurePackConfig.mail.fromAddress')}
              error={
                form.values.featurePackConfig.mail.fromAddress &&
                !isValidEmail(form.values.featurePackConfig.mail.fromAddress)
                  ? 'Invalid email format'
                  : undefined
              }
              data-testid="from-address-input"
            />

            <TextInput
              label="From Name"
              placeholder="My Application"
              description="Default sender display name"
              {...form.getInputProps('featurePackConfig.mail.fromName')}
              data-testid="from-name-input"
            />
          </SimpleGrid>

          <Divider label="Connection Settings" labelPosition="left" mt="md" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Connection Timeout (ms)"
              description="Maximum time to establish connection"
              min={1000}
              max={60000}
              step={1000}
              {...form.getInputProps('featurePackConfig.mail.connectionTimeoutMs')}
            />

            <NumberInput
              label="Read Timeout (ms)"
              description="Maximum time to wait for server response"
              min={1000}
              max={60000}
              step={1000}
              {...form.getInputProps('featurePackConfig.mail.readTimeoutMs')}
            />
          </SimpleGrid>

          <Switch
            label="Enable Debug Mode"
            description="Log SMTP communication for troubleshooting"
            {...form.getInputProps('featurePackConfig.mail.debug', { type: 'checkbox' })}
          />

          <Divider label="Email Templates" labelPosition="left" mt="md" />

          <Title order={6}>Templates to Generate</Title>
          <Text size="sm" c="dimmed" mb="sm">
            Select which email templates to include in your project
          </Text>

          <Stack gap="xs">
            <Checkbox
              label="Welcome Email"
              description="Sent to new users upon registration"
              {...form.getInputProps('features.mailService', { type: 'checkbox' })}
              data-testid="template-welcome-checkbox"
            />

            <Checkbox
              label="Password Reset Email"
              description="Sent when users request password recovery"
              {...form.getInputProps('features.passwordReset', { type: 'checkbox' })}
              data-testid="template-password-reset-checkbox"
            />

            <Checkbox
              label="JTE Templates"
              description="Server-side rendered email templates using JTE"
              {...form.getInputProps('features.jteTemplates', { type: 'checkbox' })}
              data-testid="template-jte-checkbox"
            />
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
}
