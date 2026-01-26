import {
  Alert,
  Badge,
  Checkbox,
  Collapse,
  Checkbox,
  Collapse,
  Divider,
  Group,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { useLanguageFeatureSync } from '../../hooks';
import { useTargetConfig } from '../../store';
import type { SocialProvider } from '../../types/config/featurepack';
import { LANGUAGE_METADATA } from '../../types/target';
import type { SettingsFormProps } from './types';

const SOCIAL_PROVIDERS: { id: SocialProvider; label: string }[] = [
  { id: 'google', label: 'Google' },
  { id: 'github', label: 'GitHub' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'apple', label: 'Apple' },
  { id: 'microsoft', label: 'Microsoft' },
];

export function SocialLoginSettingsForm({ form }: SettingsFormProps) {
  const targetConfig = useTargetConfig();
  const { isFeatureSupported } = useLanguageFeatureSync();
  const languageLabel = LANGUAGE_METADATA[targetConfig.language].label;
  const isSocialLoginSupported = isFeatureSupported('socialLogin');

  const isEnabled = form.values.features.socialLogin;
  const enabledProviders = SOCIAL_PROVIDERS.filter(
    (p) => form.values.featurePackConfig.socialLogin.providers[p.id].enabled,
  );
  const hasNoProvidersSelected = isEnabled && enabledProviders.length === 0;

  if (!isSocialLoginSupported) {
    return (
      <Stack>
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Feature Not Available"
          color="yellow"
          variant="light"
          data-testid="social-login-unavailable-alert"
        >
          Social Login is not available for {languageLabel}. This feature is currently supported for
          Java, Kotlin, Python, TypeScript, PHP, and C#.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack>
      <Switch
        label="Enable Social Login"
        description="Enable OAuth 2.0 social authentication"
        data-testid="social-login-toggle"
        {...form.getInputProps('features.socialLogin', { type: 'checkbox' })}
      />

      <Collapse in={isEnabled}>
        <Stack mt="md">
          {hasNoProvidersSelected && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              title="No Providers Selected"
              color="orange"
              variant="light"
              data-testid="no-providers-warning"
            >
              Please select at least one social login provider to enable this feature.
            </Alert>
          )}

          <Title order={6}>Providers</Title>

          <Stack gap="xs">
            {SOCIAL_PROVIDERS.map((provider) => (
              <Checkbox
                key={provider.id}
                label={provider.label}
                data-testid={`provider-checkbox-${provider.id}`}
                {...form.getInputProps(
                  `featurePackConfig.socialLogin.providers.${provider.id}.enabled`,
                  { type: 'checkbox' },
                )}
              />
            ))}
          </Stack>

          <Title order={6} mt="md">
            Provider Configuration
          </Title>

          {SOCIAL_PROVIDERS.map((provider) => {
            const providerEnabled =
              form.values.featurePackConfig.socialLogin.providers[provider.id].enabled;

            return (
              <Collapse key={provider.id} in={providerEnabled}>
                <Stack
                  mt="sm"
                  p="sm"
                  style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}
                >
                  <Group gap="xs">
                    <Text fw={500}>{provider.label} Configuration</Text>
                  </Group>

                  <TextInput
                    label="Client ID"
                    placeholder={`Enter ${provider.label} Client ID`}
                    data-testid={`provider-${provider.id}-client-id`}
                    {...form.getInputProps(
                      `featurePackConfig.socialLogin.providers.${provider.id}.clientId`,
                    )}
                  />

                  <TextInput
                    label="Client Secret"
                    placeholder={`Enter ${provider.label} Client Secret`}
                    type="password"
                    data-testid={`provider-${provider.id}-client-secret`}
                    {...form.getInputProps(
                      `featurePackConfig.socialLogin.providers.${provider.id}.clientSecret`,
                    )}
                  />
                </Stack>
              </Collapse>
            );
          })}

          <Title order={6} mt="md">
            General Settings
          </Title>

          <Switch
            label="Auto-link Accounts"
            description="Automatically link social accounts when email matches existing account"
            data-testid="auto-link-accounts-toggle"
            {...form.getInputProps('featurePackConfig.socialLogin.autoLinkAccounts', {
              type: 'checkbox',
            })}
          />

          <Switch
            label="Require Email Verification"
            description="Require email verification for new social accounts"
            data-testid="require-email-verification-toggle"
            {...form.getInputProps('featurePackConfig.socialLogin.requireEmailVerification', {
              type: 'checkbox',
            })}
          />
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { memo, useCallback, useMemo } from 'react';
import { useTargetConfig } from '../../store';
import { LANGUAGE_METADATA } from '../../types/target';
import type { SettingsFormProps } from './types';

/** Languages that support social login feature */
const SUPPORTED_LANGUAGES = ['java', 'kotlin', 'typescript'] as const;

/** Provider display configuration */
const PROVIDER_CONFIG: Record<
  'google' | 'github' | 'microsoft',
  { label: string; description: string }
> = {
  google: {
    label: 'Google',
    description: 'Allow users to sign in with their Google account',
  },
  github: {
    label: 'GitHub',
    description: 'Allow users to sign in with their GitHub account',
  },
  microsoft: {
    label: 'Microsoft',
    description: 'Allow users to sign in with their Microsoft account',
  },
};

/** URL validation helper */
function isValidUrl(url: string): boolean {
  if (!url) return true; // Empty is valid (optional field)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

interface ProviderCheckboxProps {
  readonly form: SettingsFormProps['form'];
  readonly provider: 'google' | 'github' | 'microsoft';
  readonly disabled: boolean;
}

const ProviderCheckbox = memo(function ProviderCheckbox({
  form,
  provider,
  disabled,
}: ProviderCheckboxProps) {
  const config = PROVIDER_CONFIG[provider];
  const basePath = `featurePackConfig.socialLogin.providers.${provider}` as const;

  return (
    <Tooltip
      label={disabled ? 'Enable Social Login first' : config.description}
      position="left"
      withArrow
    >
      <Checkbox
        label={config.label}
        disabled={disabled}
        {...form.getInputProps(`${basePath}.enabled`, { type: 'checkbox' })}
      />
    </Tooltip>
  );
});

export const SocialLoginSettingsForm = memo(function SocialLoginSettingsForm({
  form,
}: SettingsFormProps) {
  const targetConfig = useTargetConfig();
  const languageLabel = LANGUAGE_METADATA[targetConfig.language].label;

  const isLanguageSupported = useMemo(
    () => SUPPORTED_LANGUAGES.includes(targetConfig.language as (typeof SUPPORTED_LANGUAGES)[number]),
    [targetConfig.language],
  );

  const socialLoginEnabled = form.values.featurePackConfig.socialLogin.enabled;

  const hasNoProvidersSelected = useMemo(() => {
    const providers = form.values.featurePackConfig.socialLogin.providers;
    return (
      socialLoginEnabled &&
      !providers.google.enabled &&
      !providers.github.enabled &&
      !providers.microsoft.enabled
    );
  }, [socialLoginEnabled, form.values.featurePackConfig.socialLogin.providers]);

  const validateRedirectUrl = useCallback((url: string) => {
    if (!url) return null;
    return isValidUrl(url) ? null : 'Invalid URL format';
  }, []);

  return (
    <Stack>
      {!isLanguageSupported && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Language Not Supported"
          color="red"
          variant="light"
        >
          <Text size="sm">
            Social Login is only available for Java, Kotlin, and TypeScript. Current language:{' '}
            <strong>{languageLabel}</strong>
          </Text>
        </Alert>
      )}

      <Switch
        label="Enable Social Login"
        description="Allow users to authenticate using OAuth 2.0 social providers"
        disabled={!isLanguageSupported}
        {...form.getInputProps('featurePackConfig.socialLogin.enabled', { type: 'checkbox' })}
      />

      <Collapse in={socialLoginEnabled && isLanguageSupported}>
        <Stack mt="md">
          <Divider label="Providers" labelPosition="left" />

          {hasNoProvidersSelected && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="No Providers Selected"
              color="yellow"
              variant="light"
            >
              <Text size="sm">
                Please select at least one social login provider to enable authentication.
              </Text>
            </Alert>
          )}

          <Group>
            <ProviderCheckbox form={form} provider="google" disabled={!socialLoginEnabled} />
            <ProviderCheckbox form={form} provider="github" disabled={!socialLoginEnabled} />
            <ProviderCheckbox form={form} provider="microsoft" disabled={!socialLoginEnabled} />
          </Group>

          <Divider label="Account Options" labelPosition="left" mt="md" />

          <Tooltip
            label="Automatically create a new user account when signing in for the first time"
            position="left"
            withArrow
            multiline
            w={250}
          >
            <Switch
              label="Auto-create User"
              description="Create user account on first social login"
              {...form.getInputProps('featurePackConfig.socialLogin.autoLinkAccounts', {
                type: 'checkbox',
              })}
            />
          </Tooltip>

          <Tooltip
            label="Link social accounts to existing users when email addresses match"
            position="left"
            withArrow
            multiline
            w={250}
          >
            <Switch
              label="Link Accounts by Email"
              description="Connect social logins to existing accounts with matching email"
              {...form.getInputProps('featurePackConfig.socialLogin.requireEmailVerification', {
                type: 'checkbox',
              })}
            />
          </Tooltip>

          <Divider label="Redirect URLs" labelPosition="left" mt="md" />

          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              Configure the URLs where users will be redirected after authentication. These should
              be absolute URLs pointing to your application.
            </Text>
          </Alert>

          <TextInput
            label="Success Redirect URL"
            placeholder="https://example.com/auth/success"
            description="URL to redirect after successful authentication"
            error={validateRedirectUrl(
              (form.values.featurePackConfig.socialLogin as Record<string, string>)
                .successRedirectUrl ?? '',
            )}
            {...form.getInputProps('featurePackConfig.socialLogin.successRedirectUrl')}
          />

          <TextInput
            label="Failure Redirect URL"
            placeholder="https://example.com/auth/failure"
            description="URL to redirect after failed authentication"
            error={validateRedirectUrl(
              (form.values.featurePackConfig.socialLogin as Record<string, string>)
                .failureRedirectUrl ?? '',
            )}
            {...form.getInputProps('featurePackConfig.socialLogin.failureRedirectUrl')}
          />

          <Divider label="Provider Configuration" labelPosition="left" mt="md" />

          <Title order={6}>
            <Group gap="xs">
              Google
              {form.values.featurePackConfig.socialLogin.providers.google.enabled && (
                <Badge size="xs" color="green" variant="light">
                  Enabled
                </Badge>
              )}
            </Group>
          </Title>
          <Collapse in={form.values.featurePackConfig.socialLogin.providers.google.enabled}>
            <Stack mt="sm" ml="md">
              <TextInput
                label="Client ID"
                placeholder="your-google-client-id.apps.googleusercontent.com"
                {...form.getInputProps('featurePackConfig.socialLogin.providers.google.clientId')}
              />
              <TextInput
                label="Client Secret"
                placeholder="GOCSPX-..."
                type="password"
                {...form.getInputProps(
                  'featurePackConfig.socialLogin.providers.google.clientSecret',
                )}
              />
            </Stack>
          </Collapse>

          <Title order={6}>
            <Group gap="xs">
              GitHub
              {form.values.featurePackConfig.socialLogin.providers.github.enabled && (
                <Badge size="xs" color="green" variant="light">
                  Enabled
                </Badge>
              )}
            </Group>
          </Title>
          <Collapse in={form.values.featurePackConfig.socialLogin.providers.github.enabled}>
            <Stack mt="sm" ml="md">
              <TextInput
                label="Client ID"
                placeholder="Iv1.xxxxxxxxxx"
                {...form.getInputProps('featurePackConfig.socialLogin.providers.github.clientId')}
              />
              <TextInput
                label="Client Secret"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                type="password"
                {...form.getInputProps(
                  'featurePackConfig.socialLogin.providers.github.clientSecret',
                )}
              />
            </Stack>
          </Collapse>

          <Title order={6}>
            <Group gap="xs">
              Microsoft
              {form.values.featurePackConfig.socialLogin.providers.microsoft.enabled && (
                <Badge size="xs" color="green" variant="light">
                  Enabled
                </Badge>
              )}
            </Group>
          </Title>
          <Collapse in={form.values.featurePackConfig.socialLogin.providers.microsoft.enabled}>
            <Stack mt="sm" ml="md">
              <TextInput
                label="Client ID"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                {...form.getInputProps(
                  'featurePackConfig.socialLogin.providers.microsoft.clientId',
                )}
              />
              <TextInput
                label="Client Secret"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                type="password"
                {...form.getInputProps(
                  'featurePackConfig.socialLogin.providers.microsoft.clientSecret',
                )}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
});
