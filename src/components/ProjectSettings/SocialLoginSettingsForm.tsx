import {
  Alert,
  Checkbox,
  Collapse,
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
        </Stack>
      </Collapse>
    </Stack>
  );
}
