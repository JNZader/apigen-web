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
} from '@mantine/core';
import { IconInfoCircle, IconLock, IconMail, IconServer } from '@tabler/icons-react';
import { useTargetConfig } from '../../store';
import type { SettingsFormProps } from './types';

/**
 * Mail Service Settings Form
 *
 * Configures SMTP settings for sending emails.
 * Not available for Rust language.
 */
export function MailServiceSettingsForm({ form }: SettingsFormProps) {
  const targetConfig = useTargetConfig();

  const isSupported = !['rust'].includes(targetConfig.language);

  if (!isSupported) {
    return (
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Not Available"
        color="yellow"
        data-testid="mail-unavailable-alert"
      >
        Mail Service is not available for{' '}
        {targetConfig.language.charAt(0).toUpperCase() + targetConfig.language.slice(1)}.
      </Alert>
    );
  }

  const enabled = form.values.featurePackConfig?.mail?.enabled ?? false;
  const fromAddress = form.values.featurePackConfig?.mail?.fromAddress ?? '';

  // Email validation
  const isValidEmail = (email: string) => {
    if (!email) return true; // Empty is valid (not filled yet)
    return email.includes('@');
  };

  return (
    <Stack gap="md">
      {/* Master toggle */}
      <Group justify="space-between">
        <div>
          <Text fw={500}>Enable Mail Service</Text>
          <Text size="sm" c="dimmed">
            Configure SMTP for sending emails
          </Text>
        </div>
        <Switch
          {...form.getInputProps('featurePackConfig.mail.enabled', { type: 'checkbox' })}
          size="md"
          data-testid="mail-enable-toggle"
        />
      </Group>

      <Collapse in={enabled}>
        <Stack gap="md">
          <Divider label="SMTP Settings" labelPosition="left" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="SMTP Host"
              description="Mail server hostname"
              placeholder="smtp.gmail.com"
              leftSection={<IconServer size={16} />}
              {...form.getInputProps('featurePackConfig.mail.host')}
              data-testid="smtp-host-input"
            />

            <NumberInput
              label="Port"
              description="SMTP port"
              placeholder="587"
              min={1}
              max={65535}
              {...form.getInputProps('featurePackConfig.mail.port')}
              data-testid="smtp-port-input"
            />
          </SimpleGrid>

          <TextInput
            label="Username"
            description="SMTP authentication username"
            placeholder="your-email@gmail.com"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('featurePackConfig.mail.username')}
            data-testid="smtp-username-input"
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle, IconMail } from '@tabler/icons-react';
import { useTargetConfig } from '../../store';
import type { SmtpEncryption } from '../../types';
import type { SettingsFormProps } from './types';

const ENCRYPTION_OPTIONS: { value: SmtpEncryption; label: string }[] = [
  { value: 'none', label: 'None (Not recommended)' },
  { value: 'tls', label: 'TLS (Implicit)' },
  { value: 'starttls', label: 'STARTTLS (Explicit)' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function MailServiceSettingsForm({ form }: SettingsFormProps) {
  const targetConfig = useTargetConfig();
  const isRust = targetConfig.language === 'rust';
  const isMailEnabled = form.values.featurePackConfig.mail.enabled;

  return (
    <Stack>
      {isRust && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Language Not Supported"
          color="orange"
          variant="light"
        >
          <Text size="sm">
            Mail Service is not currently available for Rust. This feature is only supported for
            Java, Kotlin, and Go projects.
          </Text>
        </Alert>
      )}

      <Switch
        label="Enable Mail Service"
        description="Enable SMTP email sending capabilities"
        disabled={isRust}
        {...form.getInputProps('featurePackConfig.mail.enabled', { type: 'checkbox' })}
      />

      <Collapse in={isMailEnabled && !isRust}>
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
          />

          <NumberInput
            label="SMTP Port"
            description="Common ports: 25 (SMTP), 465 (SMTPS), 587 (Submission)"
            min={1}
            max={65535}
            {...form.getInputProps('featurePackConfig.mail.port')}
          />

          <Select
            label="Encryption"
            description="SMTP encryption protocol"
            data={[
              { value: 'none', label: 'None' },
              { value: 'tls', label: 'TLS' },
              { value: 'starttls', label: 'STARTTLS' },
            ]}
            {...form.getInputProps('featurePackConfig.mail.encryption')}
            data-testid="smtp-encryption-select"
          />

          <Alert color="blue" icon={<IconInfoCircle size={16} />}>
            Password will be configured via environment variable MAIL_PASSWORD
          </Alert>

          <Divider label="Sender Settings" labelPosition="left" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="From Address"
              description="Sender email address"
              placeholder="noreply@example.com"
              leftSection={<IconMail size={16} />}
              {...form.getInputProps('featurePackConfig.mail.fromAddress')}
              error={!isValidEmail(fromAddress) && 'Invalid email format'}
              data-testid="from-address-input"
            />

            <TextInput
              label="From Name"
              description="Sender display name"
              placeholder="My Application"
              {...form.getInputProps('featurePackConfig.mail.fromName')}
              data-testid="from-name-input"
            />
          </SimpleGrid>

          <Divider label="Email Templates" labelPosition="left" />

          <Text size="sm" c="dimmed">
            Select which email templates to generate:
            description="Connection security protocol"
            data={ENCRYPTION_OPTIONS}
            {...form.getInputProps('featurePackConfig.mail.encryption')}
          />

          <TextInput
            label="Username"
            placeholder="user@example.com"
            description="SMTP authentication username"
            {...form.getInputProps('featurePackConfig.mail.username')}
          />

          <Divider label="Sender Configuration" labelPosition="left" mt="md" />

          <TextInput
            label="From Address"
            placeholder="noreply@example.com"
            description="Default sender email address"
            error={
              form.values.featurePackConfig.mail.fromAddress &&
              !isValidEmail(form.values.featurePackConfig.mail.fromAddress)
                ? 'Please enter a valid email address'
                : undefined
            }
            {...form.getInputProps('featurePackConfig.mail.fromAddress')}
          />

          <TextInput
            label="From Name"
            placeholder="My Application"
            description="Default sender display name"
            {...form.getInputProps('featurePackConfig.mail.fromName')}
          />

          <Divider label="Connection Settings" labelPosition="left" mt="md" />

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
              description="Sent when a new user registers"
              {...form.getInputProps('features.mailService', { type: 'checkbox' })}
              data-testid="template-welcome-checkbox"
              description="Sent to new users upon registration"
              {...form.getInputProps('features.mailService', { type: 'checkbox' })}
              checked={form.values.features.mailService}
              onChange={(event) => {
                form.setFieldValue('features.mailService', event.currentTarget.checked);
              }}
            />

            <Checkbox
              label="Password Reset Email"
              description="Sent when user requests password reset"
              {...form.getInputProps('features.passwordReset', { type: 'checkbox' })}
              data-testid="template-password-reset-checkbox"
            />

            <Checkbox
              label="JTE Templates"
              description="Use JTE template engine for emails"
              {...form.getInputProps('features.jteTemplates', { type: 'checkbox' })}
              data-testid="template-jte-checkbox"
              description="Sent when users request password recovery"
              checked={form.values.features.passwordReset}
              onChange={(event) => {
                form.setFieldValue('features.passwordReset', event.currentTarget.checked);
              }}
            />

            <Checkbox
              label="Notification Email"
              description="General notification template for system alerts"
              checked={form.values.features.domainEvents && form.values.features.mailService}
              onChange={(event) => {
                if (event.currentTarget.checked) {
                  form.setFieldValue('features.domainEvents', true);
                  form.setFieldValue('features.mailService', true);
                }
              }}
              disabled={!form.values.features.mailService}
            />
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
}
