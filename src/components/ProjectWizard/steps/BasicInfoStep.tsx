import { Stack, TextInput, Textarea } from '@mantine/core';
import { memo } from 'react';

interface BasicInfoStepProps {
  readonly data: { projectName: string; description: string; packageName: string };
  readonly errors: Record<string, string>;
  readonly onChange: (updates: Partial<BasicInfoStepProps['data']>) => void;
}

export const BasicInfoStep = memo(function BasicInfoStep({
  data,
  errors,
  onChange,
}: BasicInfoStepProps) {
  return (
    <Stack gap="md">
      <TextInput
        label="Project Name"
        description="A unique name for your project"
        placeholder="my-awesome-api"
        value={data.projectName}
        onChange={(e) => onChange({ projectName: e.currentTarget.value })}
        error={errors.projectName}
        required
        data-autofocus
      />

      <Textarea
        label="Description"
        description="Brief description of your project (optional)"
        placeholder="A REST API for..."
        value={data.description}
        onChange={(e) => onChange({ description: e.currentTarget.value })}
        minRows={3}
      />

      <TextInput
        label="Package Name"
        description="Base package for generated code"
        placeholder="com.example.api"
        value={data.packageName}
        onChange={(e) => onChange({ packageName: e.currentTarget.value })}
        error={errors.packageName}
        required
      />
    </Stack>
  );
});
