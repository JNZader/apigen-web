import { Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconFileText } from '@tabler/icons-react';
import type { ProjectConfig } from '../../../types';
import { WizardStep } from '../WizardStep';

interface BasicInfoStepProps {
  readonly form: UseFormReturnType<ProjectConfig>;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const handleGroupIdChange = (value: string) => {
    form.setFieldValue('groupId', value);
    if (form.values.artifactId) {
      const packageName = `${value}.${form.values.artifactId.replaceAll('-', '')}`;
      form.setFieldValue('packageName', packageName);
    }
  };

  return (
    <WizardStep
      icon={<IconFileText size={24} />}
      title="Basic Information"
      description="Configure your project's name and identifiers"
    >
      <Stack gap="md">
        <TextInput
          label="Project Name"
          placeholder="My Awesome API"
          description="A friendly name for your project"
          {...form.getInputProps('name')}
          required
          data-autofocus
        />

        <TextInput
          label="Group ID"
          placeholder="com.example"
          description="Maven group identifier (e.g., com.company)"
          {...form.getInputProps('groupId')}
          onChange={(e) => handleGroupIdChange(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Artifact ID"
          placeholder="my-api"
          description="Maven artifact identifier (lowercase, hyphens allowed)"
          {...form.getInputProps('artifactId')}
          required
        />

        <TextInput
          label="Package Name"
          placeholder="com.example.myapi"
          description="Base Java package name for generated code"
          {...form.getInputProps('packageName')}
          required
        />
      </Stack>
    </WizardStep>
  );
}
