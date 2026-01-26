import {
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  rem,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import {
  IconAlertCircle,
  IconFileCode,
  IconLink,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { notify } from '../utils/notifications';

interface OpenApiImportModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onImport: (content: string, filename: string) => void;
}

export function OpenApiImportModal({
  opened,
  onClose,
  onImport,
}: Readonly<OpenApiImportModalProps>) {
  const [activeTab, setActiveTab] = useState<string | null>('file');
  const [url, setUrl] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setUrl('');
    setError(null);
    setFetchingUrl(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setError(null);

      try {
        const content = await file.text();
        onImport(content, file.name);
        notify.success({
          title: 'File loaded',
          message: `${file.name} loaded successfully`,
        });
        handleClose();
      } catch {
        setError('Failed to read file');
      }
    },
    [onImport, handleClose],
  );

  const validateUrl = useCallback((urlString: string): boolean => {
    if (!urlString.trim()) {
      setError('Please enter a URL');
      return false;
    }

    try {
      const parsed = new URL(urlString);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setError('URL must use HTTP or HTTPS protocol');
        return false;
      }
      return true;
    } catch {
      setError('Invalid URL format');
      return false;
    }
  }, []);

  const handleUrlFetch = useCallback(async () => {
    if (!validateUrl(url)) return;

    setFetchingUrl(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json, application/yaml, text/yaml, */*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();

      if (!content.trim()) {
        throw new Error('The URL returned empty content');
      }

      const filename = url.split('/').pop() || 'openapi-spec';
      onImport(content, filename);
      notify.success({
        title: 'OpenAPI fetched',
        message: 'Specification loaded from URL successfully',
      });
      handleClose();
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError(
          'CORS error: The server does not allow cross-origin requests. ' +
            'Try downloading the file manually and using "From File" tab, ' +
            'or use a URL that supports CORS.',
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch OpenAPI specification');
      }
    } finally {
      setFetchingUrl(false);
    }
  }, [url, validateUrl, onImport, handleClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !fetchingUrl) {
        handleUrlFetch();
      }
    },
    [fetchingUrl, handleUrlFetch],
  );

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Import OpenAPI Specification"
      size="lg"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="file" leftSection={<IconFileCode size={16} />}>
            From File
          </Tabs.Tab>
          <Tabs.Tab value="url" leftSection={<IconLink size={16} />}>
            From URL
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="file" pt="md">
          <Stack>
            {error && activeTab === 'file' && (
              <Alert
                color="red"
                icon={<IconAlertCircle size={16} />}
                title="Import Error"
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Dropzone
              onDrop={handleFileDrop}
              onReject={() =>
                setError('Invalid file type. Please use .json, .yaml, or .yml files.')
              }
              maxSize={10 * 1024 * 1024}
              accept={{
                'application/json': ['.json'],
                'application/yaml': ['.yaml', '.yml'],
                'text/yaml': ['.yaml', '.yml'],
              }}
              multiple={false}
            >
              <Group justify="center" gap="xl" mih={150} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: 'var(--mantine-color-blue-6)',
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: 'var(--mantine-color-red-6)',
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFileCode
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: 'var(--mantine-color-dimmed)',
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag OpenAPI file here or click to select
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Supports .json, .yaml, and .yml files up to 10MB
                  </Text>
                </div>
              </Group>
            </Dropzone>

            <Alert color="blue" variant="light" icon={<IconAlertCircle size={16} />}>
              <Text size="sm">
                <strong>Supported formats:</strong> OpenAPI 3.0/3.1 specifications in JSON or YAML
                format.
              </Text>
            </Alert>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="url" pt="md">
          <Stack>
            {error && activeTab === 'url' && (
              <Alert
                color="red"
                icon={<IconAlertCircle size={16} />}
                title="Fetch Error"
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <TextInput
              label="OpenAPI Specification URL"
              placeholder="https://api.example.com/openapi.json"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={fetchingUrl}
              rightSection={fetchingUrl ? <Loader size="xs" /> : null}
            />

            <Text size="sm" c="dimmed">
              Enter a public URL to an OpenAPI specification file. The server must allow
              cross-origin requests (CORS).
            </Text>

            <Alert color="yellow" variant="light" icon={<IconAlertCircle size={16} />}>
              <Text size="sm">
                <strong>CORS Notice:</strong> If the URL doesn&apos;t support CORS, the fetch will
                fail. In that case, download the file manually and use the &quot;From File&quot;
                tab.
              </Text>
            </Alert>

            <Group justify="flex-end">
              <Button variant="default" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                leftSection={fetchingUrl ? <Loader size="xs" /> : <IconLink size={16} />}
                onClick={handleUrlFetch}
                disabled={!url.trim() || fetchingUrl}
                loading={fetchingUrl}
              >
                Fetch & Import
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
