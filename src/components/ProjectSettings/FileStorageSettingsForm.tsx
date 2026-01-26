import {
  Collapse,
  Divider,
  NumberInput,
  Select,
  Stack,
  Switch,
  TagsInput,
  TextInput,
  Title,
} from '@mantine/core';
import type { SettingsFormProps } from './types';

export function FileStorageSettingsForm({ form }: SettingsFormProps) {
  const isEnabled = form.values.features.fileStorage;
  const provider = form.values.featurePackConfig.storage.provider;

  return (
    <Stack>
      <Title order={6}>File Storage</Title>

      <Switch
        label="Enable File Storage"
        description="Enable file upload and storage functionality"
        {...form.getInputProps('features.fileStorage', { type: 'checkbox' })}
      />

      <Collapse in={isEnabled}>
        <Stack mt="md">
          <Select
            label="Storage Provider"
            description="Choose where to store uploaded files"
            data={[
              { value: 'local', label: 'Local Filesystem' },
              { value: 's3', label: 'Amazon S3' },
              { value: 'gcs', label: 'Google Cloud Storage' },
              { value: 'azure', label: 'Azure Blob Storage' },
            ]}
            {...form.getInputProps('featurePackConfig.storage.provider')}
          />

          <Divider label="Upload Limits" labelPosition="left" />

          <NumberInput
            label="Max File Size (MB)"
            description="Maximum allowed file size for uploads"
            min={1}
            max={1024}
            value={form.values.featurePackConfig.storage.maxFileSizeBytes / 1048576}
            onChange={(value) =>
              form.setFieldValue(
                'featurePackConfig.storage.maxFileSizeBytes',
                (value as number) * 1048576,
              )
            }
          />

          <TagsInput
            label="Allowed Extensions"
            description="Leave empty to allow all file types"
            placeholder="e.g., jpg, png, pdf"
            {...form.getInputProps('featurePackConfig.storage.allowedExtensions')}
          />

          <Switch
            label="Validate Content Type"
            description="Verify file content matches extension"
            {...form.getInputProps('featurePackConfig.storage.validateContentType', {
              type: 'checkbox',
            })}
          />

          <Switch
            label="Generate Unique Names"
            description="Automatically generate unique filenames"
            {...form.getInputProps('featurePackConfig.storage.generateUniqueNames', {
              type: 'checkbox',
            })}
          />

          {/* Local Storage Configuration */}
          <Collapse in={provider === 'local'}>
            <Stack mt="md">
              <Divider label="Local Storage Configuration" labelPosition="left" />
              <TextInput
                label="Base Path"
                description="Directory for storing uploaded files"
                placeholder="./uploads"
                {...form.getInputProps('featurePackConfig.storage.local.basePath')}
              />
              <Switch
                label="Create Directories"
                description="Automatically create directories if they don't exist"
                {...form.getInputProps('featurePackConfig.storage.local.createDirectories', {
                  type: 'checkbox',
                })}
              />
            </Stack>
          </Collapse>

          {/* S3 Configuration */}
          <Collapse in={provider === 's3'}>
            <Stack mt="md">
              <Divider label="S3 Configuration" labelPosition="left" />
              <TextInput
                label="Bucket Name"
                placeholder="my-bucket"
                {...form.getInputProps('featurePackConfig.storage.s3.bucket')}
              />
              <TextInput
                label="Region"
                placeholder="us-east-1"
                {...form.getInputProps('featurePackConfig.storage.s3.region')}
              />
              <TextInput
                label="Access Key ID"
                placeholder="AKIA..."
                {...form.getInputProps('featurePackConfig.storage.s3.accessKeyId')}
              />
              <TextInput
                label="Secret Access Key"
                type="password"
                placeholder="Your secret key"
                {...form.getInputProps('featurePackConfig.storage.s3.secretAccessKey')}
              />
              <TextInput
                label="Custom Endpoint"
                description="Optional: for S3-compatible storage"
                placeholder="https://s3.example.com"
                {...form.getInputProps('featurePackConfig.storage.s3.endpoint')}
              />
              <Switch
                label="Path Style Access"
                description="Use path-style URLs (for S3-compatible storage)"
                {...form.getInputProps('featurePackConfig.storage.s3.pathStyleAccess', {
                  type: 'checkbox',
                })}
              />
            </Stack>
          </Collapse>

          {/* GCS Configuration */}
          <Collapse in={provider === 'gcs'}>
            <Stack mt="md">
              <Divider label="Google Cloud Storage Configuration" labelPosition="left" />
              <TextInput
                label="Bucket Name"
                placeholder="my-gcs-bucket"
                {...form.getInputProps('featurePackConfig.storage.gcs.bucket')}
              />
              <TextInput
                label="Project ID"
                placeholder="my-project-id"
                {...form.getInputProps('featurePackConfig.storage.gcs.projectId')}
              />
              <TextInput
                label="Credentials Path"
                description="Path to service account JSON file"
                placeholder="/path/to/credentials.json"
                {...form.getInputProps('featurePackConfig.storage.gcs.credentialsPath')}
              />
            </Stack>
          </Collapse>

          {/* Azure Configuration */}
          <Collapse in={provider === 'azure'}>
            <Stack mt="md">
              <Divider label="Azure Blob Storage Configuration" labelPosition="left" />
              <TextInput
                label="Account Name"
                placeholder="mystorageaccount"
                {...form.getInputProps('featurePackConfig.storage.azure.accountName')}
              />
              <TextInput
                label="Account Key"
                type="password"
                placeholder="Your account key"
                {...form.getInputProps('featurePackConfig.storage.azure.accountKey')}
              />
              <TextInput
                label="Container Name"
                placeholder="my-container"
                {...form.getInputProps('featurePackConfig.storage.azure.containerName')}
              />
              <TextInput
                label="Custom Endpoint"
                description="Optional: custom endpoint URL"
                placeholder="https://mystorageaccount.blob.core.windows.net"
                {...form.getInputProps('featurePackConfig.storage.azure.endpoint')}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
