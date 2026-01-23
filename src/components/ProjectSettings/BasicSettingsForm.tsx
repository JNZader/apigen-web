import { Alert, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { SettingsFormProps } from './types';

export function BasicSettingsForm({ form }: SettingsFormProps) {
  const handleGroupIdChange = (value: string) => {
    form.setFieldValue('groupId', value);
    if (form.values.artifactId) {
      const packageName = `${value}.${form.values.artifactId.replaceAll('-', '')}`;
      form.setFieldValue('packageName', packageName);
    }
  };

  return (
    <Stack>
      <TextInput
        label="Project Name"
        placeholder="My Awesome API"
        {...form.getInputProps('name')}
        required
      />

      <TextInput
        label="Group ID"
        placeholder="com.example"
        description="Maven group identifier"
        {...form.getInputProps('groupId')}
        onChange={(e) => handleGroupIdChange(e.currentTarget.value)}
        required
      />

      <TextInput
        label="Artifact ID"
        placeholder="my-api"
        description="Maven artifact identifier"
        {...form.getInputProps('artifactId')}
        required
      />

      <TextInput
        label="Package Name"
        placeholder="com.example.myapi"
        description="Base Java package name"
        {...form.getInputProps('packageName')}
        required
      />

      <Select
        label="Java Version"
        data={[
          { value: '21', label: 'Java 21 (LTS)' },
          { value: '25', label: 'Java 25' },
        ]}
        {...form.getInputProps('javaVersion')}
      />

      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        <Text size="sm">Spring Boot version is determined by APiGen Core (currently 4.0.0)</Text>
      </Alert>
    </Stack>
  );
}
