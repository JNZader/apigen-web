import { Stack, Textarea, TextInput } from '@mantine/core';
import { memo } from 'react';
import type { WizardData } from '../ProjectWizard';

interface BasicInfoStepProps {
  readonly data: Pick<WizardData, 'projectName' | 'description' | 'packageName'>;
  readonly errors: Record<string, string>;
  readonly onChange: (updates: Partial<WizardData>) => void;
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
        data-testid="project-name-input"
      />

      <Textarea
        label="Description"
        description="Brief description of your project (optional)"
        placeholder="A REST API for..."
        value={data.description}
        onChange={(e) => onChange({ description: e.currentTarget.value })}
        minRows={3}
        data-testid="description-input"
      />

      <TextInput
        label="Package Name"
        description="Base package for generated code"
        placeholder="com.example.api"
        value={data.packageName}
        onChange={(e) => onChange({ packageName: e.currentTarget.value })}
        error={errors.packageName}
        required
        data-testid="package-name-input"
      />
    </Stack>
  );
});
