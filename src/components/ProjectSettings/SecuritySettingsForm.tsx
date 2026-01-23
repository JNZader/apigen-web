import {
  Collapse,
  Divider,
  NumberInput,
  Select,
  Stack,
  Switch,
  TextInput,
  Title,
} from '@mantine/core';
import type { SettingsFormProps } from './types';

export function SecuritySettingsForm({ form }: SettingsFormProps) {
  return (
    <Stack>
      <Switch
        label="Enable Security Module"
        description="Enable authentication and authorization"
        {...form.getInputProps('modules.security', { type: 'checkbox' })}
      />

      <Collapse in={form.values.modules.security}>
        <Stack mt="md">
          <Select
            label="Security Mode"
            description="Authentication/authorization approach"
            data={[
              { value: 'jwt', label: 'JWT (JSON Web Tokens)' },
              { value: 'oauth2', label: 'OAuth2 / OpenID Connect' },
            ]}
            {...form.getInputProps('securityConfig.mode')}
          />

          <Collapse in={form.values.securityConfig.mode === 'jwt'}>
            <Stack mt="md">
              <Title order={6}>JWT Configuration</Title>
              <Select
                label="Secret Key Length"
                data={[
                  { value: '32', label: '32 bytes (256-bit)' },
                  { value: '64', label: '64 bytes (512-bit)' },
                  { value: '128', label: '128 bytes (1024-bit)' },
                ]}
                {...form.getInputProps('securityConfig.jwtSecretLength')}
              />
              <NumberInput
                label="Access Token Expiration (minutes)"
                min={1}
                {...form.getInputProps('securityConfig.accessTokenExpiration')}
              />
              <NumberInput
                label="Refresh Token Expiration (days)"
                min={1}
                {...form.getInputProps('securityConfig.refreshTokenExpiration')}
              />
              <Switch
                label="Enable Refresh Token"
                description="Allow token refresh without re-authentication"
                {...form.getInputProps('securityConfig.enableRefreshToken', { type: 'checkbox' })}
              />
              <Switch
                label="Enable Token Blacklist"
                description="Support logout/token revocation"
                {...form.getInputProps('securityConfig.enableTokenBlacklist', { type: 'checkbox' })}
              />
              <Switch
                label="Enable Key Rotation"
                description="Seamless key rotation without invalidating tokens"
                {...form.getInputProps('securityConfig.keyRotation.enabled', { type: 'checkbox' })}
              />
            </Stack>
          </Collapse>

          <Collapse in={form.values.securityConfig.mode === 'oauth2'}>
            <Stack mt="md">
              <Title order={6}>OAuth2 Configuration</Title>
              <TextInput
                label="Issuer URI"
                placeholder="https://auth.example.com"
                description="OAuth 2.0 issuer URI"
                {...form.getInputProps('securityConfig.oauth2.issuerUri')}
              />
              <TextInput
                label="Audience"
                placeholder="api://my-api"
                description="Expected audience claim value"
                {...form.getInputProps('securityConfig.oauth2.audience')}
              />
              <TextInput
                label="Roles Claim"
                placeholder="permissions"
                description="JWT claim containing user roles"
                {...form.getInputProps('securityConfig.oauth2.rolesClaim')}
              />
              <TextInput
                label="Role Prefix"
                placeholder="ROLE_"
                description="Prefix to add to roles"
                {...form.getInputProps('securityConfig.oauth2.rolePrefix')}
              />
              <TextInput
                label="Username Claim"
                placeholder="sub"
                description="JWT claim containing username"
                {...form.getInputProps('securityConfig.oauth2.usernameClaim')}
              />
              <Switch
                label="Enable PKCE"
                description="Proof Key for Code Exchange (recommended)"
                {...form.getInputProps('securityConfig.pkce.enabled', { type: 'checkbox' })}
              />
            </Stack>
          </Collapse>

          <Divider label="Password Policy" labelPosition="left" mt="md" />

          <NumberInput
            label="Minimum Password Length"
            min={6}
            max={128}
            {...form.getInputProps('securityConfig.passwordMinLength')}
          />

          <NumberInput
            label="Max Login Attempts"
            description="Attempts before account lockout"
            min={1}
            max={20}
            {...form.getInputProps('securityConfig.maxLoginAttempts')}
          />

          <NumberInput
            label="Lockout Duration (minutes)"
            min={1}
            {...form.getInputProps('securityConfig.lockoutMinutes')}
          />

          <Divider label="Security Headers" labelPosition="left" mt="md" />

          <Switch
            label="Enable HSTS"
            description="HTTP Strict Transport Security"
            {...form.getInputProps('securityConfig.headers.hstsEnabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.securityConfig.headers.hstsEnabled}>
            <Stack mt="sm">
              <NumberInput
                label="HSTS Max Age (seconds)"
                min={0}
                {...form.getInputProps('securityConfig.headers.hstsMaxAgeSeconds')}
              />
              <Switch
                label="Include Subdomains"
                {...form.getInputProps('securityConfig.headers.hstsIncludeSubdomains', {
                  type: 'checkbox',
                })}
              />
              <Switch
                label="Enable Preload"
                {...form.getInputProps('securityConfig.headers.hstsPreload', { type: 'checkbox' })}
              />
            </Stack>
          </Collapse>

          <TextInput
            label="Content Security Policy"
            placeholder="default-src 'self'"
            {...form.getInputProps('securityConfig.headers.contentSecurityPolicy')}
          />

          <TextInput
            label="Permissions Policy"
            placeholder="geolocation=(), camera=(), microphone=()"
            {...form.getInputProps('securityConfig.headers.permissionsPolicy')}
          />

          <Select
            label="Referrer Policy"
            data={[
              { value: 'no-referrer', label: 'No Referrer' },
              { value: 'no-referrer-when-downgrade', label: 'No Referrer When Downgrade' },
              { value: 'origin', label: 'Origin' },
              { value: 'origin-when-cross-origin', label: 'Origin When Cross-Origin' },
              { value: 'same-origin', label: 'Same Origin' },
              { value: 'strict-origin', label: 'Strict Origin' },
              {
                value: 'strict-origin-when-cross-origin',
                label: 'Strict Origin When Cross-Origin',
              },
              { value: 'unsafe-url', label: 'Unsafe URL' },
            ]}
            {...form.getInputProps('securityConfig.headers.referrerPolicy')}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}
