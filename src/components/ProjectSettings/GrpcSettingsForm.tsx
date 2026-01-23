import { Collapse, Divider, NumberInput, Stack, Switch } from '@mantine/core';
import type { SettingsFormProps } from './types';

export function GrpcSettingsForm({ form }: SettingsFormProps) {
  return (
    <Stack>
      <Switch
        label="Enable gRPC Module"
        description="Enable gRPC service endpoint"
        {...form.getInputProps('modules.grpc', { type: 'checkbox' })}
      />

      <Collapse in={form.values.modules.grpc}>
        <Stack mt="md">
          <Switch
            label="Enable gRPC Server"
            description="Activate the gRPC server"
            {...form.getInputProps('grpcConfig.enabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.grpcConfig.enabled}>
            <Stack mt="sm">
              <NumberInput
                label="Server Port"
                placeholder="9090"
                min={1}
                max={65535}
                {...form.getInputProps('grpcConfig.serverPort')}
              />

              <Divider label="Features" labelPosition="left" />

              <Switch
                label="Enable Logging"
                description="Log gRPC requests and responses"
                {...form.getInputProps('grpcConfig.loggingEnabled', { type: 'checkbox' })}
              />

              <Switch
                label="Enable Health Check"
                description="gRPC health checking protocol"
                {...form.getInputProps('grpcConfig.healthCheckEnabled', { type: 'checkbox' })}
              />

              <Switch
                label="Use Plaintext"
                description="Disable TLS (development only)"
                {...form.getInputProps('grpcConfig.usePlaintext', { type: 'checkbox' })}
              />

              <Divider label="Limits" labelPosition="left" />

              <NumberInput
                label="Max Inbound Message Size (MB)"
                description="Maximum size of incoming messages"
                min={1}
                max={128}
                {...form.getInputProps('grpcConfig.maxInboundMessageSizeMb')}
              />

              <NumberInput
                label="Client Deadline (ms)"
                description="Default timeout for client requests"
                min={1000}
                step={1000}
                {...form.getInputProps('grpcConfig.clientDeadlineMs')}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
