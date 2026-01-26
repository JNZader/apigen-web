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
          </Text>

          <Stack gap="xs">
            <Checkbox
              label="Welcome Email"
              description="Sent when a new user registers"
              {...form.getInputProps('features.mailService', { type: 'checkbox' })}
              data-testid="template-welcome-checkbox"
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
            />
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
}
