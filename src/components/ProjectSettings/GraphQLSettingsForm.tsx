import { Collapse, Divider, NumberInput, Stack, Switch, TextInput } from '@mantine/core';
import type { SettingsFormProps } from './types';

export function GraphQLSettingsForm({ form }: Readonly<SettingsFormProps>) {
  return (
    <Stack>
      <Switch
        label="Enable GraphQL Module"
        description="Enable GraphQL API endpoint"
        {...form.getInputProps('modules.graphql', { type: 'checkbox' })}
      />

      <Collapse in={form.values.modules.graphql}>
        <Stack mt="md">
          <Switch
            label="Enable GraphQL"
            description="Activate the GraphQL endpoint"
            {...form.getInputProps('graphqlConfig.enabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.graphqlConfig.enabled}>
            <Stack mt="sm">
              <TextInput
                label="GraphQL Endpoint"
                placeholder="/graphql"
                {...form.getInputProps('graphqlConfig.path')}
              />

              <Divider label="Features" labelPosition="left" />

              <Switch
                label="Enable Tracing"
                description="Enable query tracing for debugging"
                {...form.getInputProps('graphqlConfig.tracingEnabled', { type: 'checkbox' })}
              />

              <Switch
                label="Enable Introspection"
                description="Allow schema introspection (disable in production)"
                {...form.getInputProps('graphqlConfig.introspectionEnabled', { type: 'checkbox' })}
              />

              <Divider label="Security Limits" labelPosition="left" />

              <NumberInput
                label="Max Query Depth"
                description="Prevent deeply nested queries"
                min={1}
                {...form.getInputProps('graphqlConfig.maxQueryDepth')}
              />

              <NumberInput
                label="Max Query Complexity"
                description="Limit query complexity score"
                min={1}
                {...form.getInputProps('graphqlConfig.maxQueryComplexity')}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
