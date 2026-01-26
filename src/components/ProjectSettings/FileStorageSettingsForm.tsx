import {
  Alert,
  Card,
  Collapse,
  Divider,
  Group,
  NumberInput,
  Stack,
  Switch,
  TagsInput,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { IconCloud, IconFolder, IconInfoCircle, IconServer, IconWorld } from '@tabler/icons-react';
import type { StorageProvider } from '../../types/config/featurepack';
import type { SettingsFormProps } from './types';

interface StorageTypeCardProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly selected: boolean;
  readonly onClick: () => void;
}

function StorageTypeCard({ icon, title, description, selected, onClick }: StorageTypeCardProps) {
  return (
    <UnstyledButton onClick={onClick} style={{ flex: 1 }}>
      <Card
        padding="md"
        radius="md"
        withBorder
        style={{
          borderColor: selected ? 'var(--mantine-color-blue-6)' : undefined,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected ? 'var(--mantine-color-blue-light)' : undefined,
        }}
      >
        <Group gap="sm">
          {icon}
          <div>
            <Text fw={500} size="sm">
              {title}
            </Text>
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </div>
        </Group>
      </Card>
    </UnstyledButton>
  );
}

export function FileStorageSettingsForm({ form }: SettingsFormProps) {
  const storageEnabled = form.values.features?.fileStorage ?? false;
  const currentProvider = form.values.featurePackConfig?.storage?.provider ?? 'local';

  const handleProviderChange = (provider: StorageProvider) => {
    form.setFieldValue('featurePackConfig.storage.provider', provider);
  };

  return (
    <Stack>
      <Title order={5}>File Storage</Title>

      <Switch
        label="Enable File Storage"
        description="Allow file uploads and storage management in your API"
        {...form.getInputProps('features.fileStorage', { type: 'checkbox' })}
      />

      <Collapse in={storageEnabled}>
        <Stack mt="md">
          <Divider label="Storage Provider" labelPosition="left" />

          <Group grow>
            <StorageTypeCard
              icon={<IconFolder size={24} color="var(--mantine-color-orange-6)" />}
              title="Local"
              description="Local filesystem"
              selected={currentProvider === 'local'}
              onClick={() => handleProviderChange('local')}
            />
            <StorageTypeCard
              icon={<IconCloud size={24} color="var(--mantine-color-yellow-6)" />}
              title="Amazon S3"
              description="AWS S3 bucket"
              selected={currentProvider === 's3'}
              onClick={() => handleProviderChange('s3')}
            />
            <StorageTypeCard
              icon={<IconWorld size={24} color="var(--mantine-color-blue-6)" />}
              title="Azure Blob"
              description="Azure Blob Storage"
              selected={currentProvider === 'azure'}
              onClick={() => handleProviderChange('azure')}
            />
            <StorageTypeCard
              icon={<IconServer size={24} color="var(--mantine-color-green-6)" />}
              title="Google Cloud"
              description="Google Cloud Storage"
              selected={currentProvider === 'gcs'}
              onClick={() => handleProviderChange('gcs')}
            />
          </Group>

          {/* Local Storage Configuration */}
          <Collapse in={currentProvider === 'local'}>
            <Stack mt="md">
              <Divider label="Local Storage Configuration" labelPosition="left" />
              <TextInput
                label="Base Path"
                description="Directory path for storing uploaded files"
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

          {/* S3 Storage Configuration */}
          <Collapse in={currentProvider === 's3'}>
            <Stack mt="md">
              <Divider label="S3 Configuration" labelPosition="left" />
              <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                Configure your AWS credentials. For S3-compatible storage (MinIO, etc.), specify a
                custom endpoint.
              </Alert>
              <TextInput
                label="Bucket Name"
                description="S3 bucket name"
                placeholder="my-app-uploads"
                {...form.getInputProps('featurePackConfig.storage.s3.bucket')}
              />
              <TextInput
                label="Region"
                description="AWS region for the bucket"
                placeholder="us-east-1"
                {...form.getInputProps('featurePackConfig.storage.s3.region')}
              />
              <TextInput
                label="Access Key ID"
                description="AWS access key ID"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                {...form.getInputProps('featurePackConfig.storage.s3.accessKeyId')}
              />
              <TextInput
                label="Secret Access Key"
                description="AWS secret access key"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                type="password"
                {...form.getInputProps('featurePackConfig.storage.s3.secretAccessKey')}
              />
              <TextInput
                label="Custom Endpoint (Optional)"
                description="For S3-compatible storage like MinIO"
                placeholder="https://minio.example.com"
                {...form.getInputProps('featurePackConfig.storage.s3.endpoint')}
              />
              <Switch
                label="Path Style Access"
                description="Use path-style URLs (required for some S3-compatible services)"
                {...form.getInputProps('featurePackConfig.storage.s3.pathStyleAccess', {
                  type: 'checkbox',
                })}
              />
            </Stack>
          </Collapse>

          {/* Azure Blob Storage Configuration */}
          <Collapse in={currentProvider === 'azure'}>
            <Stack mt="md">
              <Divider label="Azure Blob Storage Configuration" labelPosition="left" />
              <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                Configure your Azure Storage account credentials.
              </Alert>
              <TextInput
                label="Account Name"
                description="Azure storage account name"
                placeholder="mystorageaccount"
                {...form.getInputProps('featurePackConfig.storage.azure.accountName')}
              />
              <TextInput
                label="Account Key"
                description="Azure storage account key"
                type="password"
                {...form.getInputProps('featurePackConfig.storage.azure.accountKey')}
              />
              <TextInput
                label="Container Name"
                description="Azure Blob container name"
                placeholder="uploads"
                {...form.getInputProps('featurePackConfig.storage.azure.containerName')}
              />
              <TextInput
                label="Custom Endpoint (Optional)"
                description="Custom endpoint URL if not using default Azure endpoint"
                placeholder="https://mystorageaccount.blob.core.windows.net"
                {...form.getInputProps('featurePackConfig.storage.azure.endpoint')}
              />
            </Stack>
          </Collapse>

          {/* Google Cloud Storage Configuration */}
          <Collapse in={currentProvider === 'gcs'}>
            <Stack mt="md">
              <Divider label="Google Cloud Storage Configuration" labelPosition="left" />
              <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                Configure your Google Cloud Storage credentials.
              </Alert>
              <TextInput
                label="Project ID"
                description="Google Cloud project ID"
                placeholder="my-project-id"
                {...form.getInputProps('featurePackConfig.storage.gcs.projectId')}
              />
              <TextInput
                label="Bucket Name"
                description="GCS bucket name"
                placeholder="my-app-uploads"
                {...form.getInputProps('featurePackConfig.storage.gcs.bucket')}
              />
              <TextInput
                label="Credentials Path"
                description="Path to service account credentials JSON file"
                placeholder="/path/to/credentials.json"
                {...form.getInputProps('featurePackConfig.storage.gcs.credentialsPath')}
              />
            </Stack>
          </Collapse>

          <Divider label="Upload Limits" labelPosition="left" mt="md" />

          <NumberInput
            label="Max File Size (MB)"
            description="Maximum allowed file size for uploads"
            min={1}
            max={1024}
            value={(form.values.featurePackConfig?.storage?.maxFileSizeBytes ?? 10485760) / 1048576}
            onChange={(value) => {
              const bytes = typeof value === 'number' ? value * 1048576 : 10485760;
              form.setFieldValue('featurePackConfig.storage.maxFileSizeBytes', bytes);
            }}
          />

          <TagsInput
            label="Allowed Extensions"
            description="Leave empty to allow all file types. Add extensions without dots (e.g., jpg, png, pdf)"
            placeholder="Enter extension and press Enter"
            {...form.getInputProps('featurePackConfig.storage.allowedExtensions')}
          />

          <Divider label="Options" labelPosition="left" mt="md" />

          <Switch
            label="Validate Content Type"
            description="Verify file content matches its extension"
            {...form.getInputProps('featurePackConfig.storage.validateContentType', {
              type: 'checkbox',
            })}
          />

          <Switch
            label="Generate Unique Names"
            description="Automatically generate unique filenames to prevent conflicts"
            {...form.getInputProps('featurePackConfig.storage.generateUniqueNames', {
              type: 'checkbox',
            })}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}
