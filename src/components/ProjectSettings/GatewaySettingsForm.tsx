import { Collapse, Divider, NumberInput, Stack, Switch, TagsInput } from '@mantine/core';
import type { GatewayRouteConfig } from '../../types';
import { GatewayRouteDesigner } from '../GatewayRouteDesigner';
import type { SettingsFormProps } from './types';

export function GatewaySettingsForm({ form }: Readonly<SettingsFormProps>) {
  return (
    <Stack>
      <Switch
        label="Enable Gateway Module"
        description="Enable API Gateway functionality"
        {...form.getInputProps('modules.gateway', { type: 'checkbox' })}
      />

      <Collapse in={form.values.modules.gateway}>
        <Stack mt="md">
          <Switch
            label="Enable Gateway"
            description="Activate the API Gateway"
            {...form.getInputProps('gatewayConfig.enabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.gatewayConfig.enabled}>
            <Stack mt="sm">
              <Divider label="Authentication" labelPosition="left" />

              <Switch
                label="Enable Authentication"
                description="Require authentication for routes"
                {...form.getInputProps('gatewayConfig.authEnabled', { type: 'checkbox' })}
              />

              <Collapse in={form.values.gatewayConfig.authEnabled}>
                <TagsInput
                  label="Excluded Paths"
                  description="Paths that don't require authentication"
                  placeholder="Press Enter to add (e.g., /public/**)"
                  mt="sm"
                  {...form.getInputProps('gatewayConfig.authExcludedPaths')}
                />
              </Collapse>

              <Divider label="Rate Limiting" labelPosition="left" />

              <NumberInput
                label="Default Rate Limit (requests/second)"
                description="Maximum requests per second per client"
                min={1}
                {...form.getInputProps('gatewayConfig.defaultRateLimitRequests')}
              />

              <NumberInput
                label="Default Burst Capacity"
                description="Maximum burst requests allowed"
                min={1}
                {...form.getInputProps('gatewayConfig.defaultRateLimitBurst')}
              />

              <Divider label="Circuit Breaker" labelPosition="left" />

              <Switch
                label="Enable Circuit Breaker"
                description="Prevent cascading failures"
                {...form.getInputProps('gatewayConfig.circuitBreakerEnabled', { type: 'checkbox' })}
              />

              <Collapse in={form.values.gatewayConfig.circuitBreakerEnabled}>
                <NumberInput
                  label="Circuit Breaker Timeout (seconds)"
                  description="Time to wait before retrying"
                  min={1}
                  mt="sm"
                  {...form.getInputProps('gatewayConfig.circuitBreakerTimeoutSeconds')}
                />
              </Collapse>

              <Divider label="Logging" labelPosition="left" />

              <Switch
                label="Enable Logging"
                description="Log gateway requests and responses"
                {...form.getInputProps('gatewayConfig.loggingEnabled', { type: 'checkbox' })}
              />

              <Collapse in={form.values.gatewayConfig.loggingEnabled}>
                <Stack mt="sm">
                  <Switch
                    label="Include Headers"
                    description="Log request/response headers"
                    {...form.getInputProps('gatewayConfig.loggingIncludeHeaders', {
                      type: 'checkbox',
                    })}
                  />

                  <Switch
                    label="Include Body"
                    description="Log request/response body"
                    {...form.getInputProps('gatewayConfig.loggingIncludeBody', {
                      type: 'checkbox',
                    })}
                  />
                </Stack>
              </Collapse>

              <Divider label="Routes" labelPosition="left" />

              <GatewayRouteDesigner
                routes={form.values.gatewayConfig.routes}
                onRoutesChange={(routes: GatewayRouteConfig[]) =>
                  form.setFieldValue('gatewayConfig.routes', routes)
                }
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
