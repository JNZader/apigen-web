import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Code,
  CopyButton,
  Group,
  Modal,
  rem,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconDownload,
  IconFileDatabase,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useRef, useState } from 'react';
import {
  useEntities,
  useEntityActions,
  useProject,
  useRelationActions,
  useRelations,
} from '../store';
import { generateSQL } from '../utils/sqlGenerator';
import { parseSQL } from '../utils/sqlParser';

interface SqlImportExportProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

export function SqlImportExport({ opened, onClose }: Readonly<SqlImportExportProps>) {
  const entities = useEntities();
  const relations = useRelations();
  const project = useProject();
  const { setEntities } = useEntityActions();
  const { setRelations } = useRelationActions();

  const [importSql, setImportSql] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('export');

  // Refs to prevent rapid consecutive actions
  const isDownloadingRef = useRef(false);
  const isImportingRef = useRef(false);

  // Generate SQL from current design
  const exportedSql = generateSQL(entities, relations, project.name);

  // Apply the parsed SQL
  const applyImport = useCallback(
    (parsedEntities: typeof entities, parsedRelations: typeof relations) => {
      setEntities(parsedEntities);
      setRelations(parsedRelations);

      notifications.show({
        title: 'SQL Imported',
        message: `Imported ${parsedEntities.length} entities and ${parsedRelations.length} relations`,
        color: 'green',
      });

      setImportSql('');
      setImportError(null);
      onClose();
    },
    [setEntities, setRelations, onClose],
  );

  // Handle SQL import with protection against rapid clicks
  const handleImport = useCallback(() => {
    // Prevent rapid consecutive imports
    if (isImportingRef.current) return;

    if (!importSql.trim()) {
      setImportError('Please enter SQL to import');
      return;
    }

    isImportingRef.current = true;

    try {
      const { entities: parsedEntities, relations: parsedRelations } = parseSQL(importSql);

      if (parsedEntities.length === 0) {
        setImportError('No valid CREATE TABLE statements found in the SQL');
        isImportingRef.current = false;
        return;
      }

      // Confirm before replacing if there are existing entities
      if (entities.length > 0) {
        modals.openConfirmModal({
          title: 'Replace Current Design',
          children: `This will replace your current design (${entities.length} entities). Continue?`,
          labels: { confirm: 'Replace', cancel: 'Cancel' },
          confirmProps: { color: 'orange' },
          onConfirm: () => {
            applyImport(parsedEntities, parsedRelations);
            isImportingRef.current = false;
          },
          onCancel: () => {
            isImportingRef.current = false;
          },
        });
      } else {
        applyImport(parsedEntities, parsedRelations);
        isImportingRef.current = false;
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to parse SQL');
      isImportingRef.current = false;
    }
  }, [importSql, entities.length, applyImport]);

  // Handle file upload (drag & drop or click)
  const handleFileDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const content = await file.text();
      setImportSql(content);
      setImportError(null);
      notifications.show({
        title: 'File loaded',
        message: `${file.name} loaded successfully`,
        color: 'blue',
      });
    } catch {
      setImportError('Failed to read file');
    }
  };

  // Download SQL file with protection against rapid clicks
  const handleDownload = useCallback(() => {
    // Prevent rapid consecutive downloads
    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;

    try {
      const blob = new Blob([exportedSql], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.artifactId || 'schema'}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      notifications.show({
        title: 'SQL Exported',
        message: 'Schema downloaded successfully',
        color: 'green',
      });
    } finally {
      // Small delay to prevent accidental double-clicks
      setTimeout(() => {
        isDownloadingRef.current = false;
      }, 500);
    }
  }, [exportedSql, project.artifactId]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="SQL Import / Export"
      size="xl"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="export" leftSection={<IconDownload size={16} />}>
            Export SQL
          </Tabs.Tab>
          <Tabs.Tab value="import" leftSection={<IconUpload size={16} />}>
            Import SQL
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="export" pt="md">
          <Stack>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Generated PostgreSQL schema from your design ({entities.length} entities)
              </Text>
              <Group gap="xs">
                <CopyButton value={exportedSql}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied!' : 'Copy to clipboard'}>
                      <ActionIcon variant="subtle" color={copied ? 'green' : 'gray'} onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
                <Button
                  leftSection={<IconDownload size={16} />}
                  onClick={handleDownload}
                  disabled={entities.length === 0}
                >
                  Download .sql
                </Button>
              </Group>
            </Group>

            <Box
              style={{
                border: '1px solid var(--mantine-color-default-border)',
                borderRadius: 'var(--mantine-radius-sm)',
                backgroundColor: 'var(--mantine-color-body)',
              }}
            >
              <ScrollArea h={350}>
                <Box
                  component="pre"
                  p="sm"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {exportedSql || 'No entities to export. Create some entities first.'}
                </Box>
              </ScrollArea>
            </Box>

            <Alert color="blue" variant="light">
              <Text size="sm">
                Use this SQL file with the <Code>apigen-codegen</Code> CLI:
              </Text>
              <Code block mt="xs">
                java -jar apigen-codegen.jar schema.sql ./my-project com.example
              </Code>
            </Alert>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="import" pt="md">
          <Stack>
            {importError && (
              <Alert
                color="red"
                icon={<IconAlertCircle size={16} />}
                title="Import Error"
                withCloseButton
                onClose={() => setImportError(null)}
              >
                {importError}
              </Alert>
            )}

            {importSql ? (
              <>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Edit SQL or clear to upload another file
                  </Text>
                  <Button variant="subtle" color="gray" size="xs" onClick={() => setImportSql('')}>
                    Clear
                  </Button>
                </Group>
                <Textarea
                  value={importSql}
                  onChange={(e) => {
                    setImportSql(e.target.value);
                    setImportError(null);
                  }}
                  rows={12}
                  styles={{
                    input: {
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    },
                  }}
                />
              </>
            ) : (
              <Stack>
                <Dropzone
                  onDrop={handleFileDrop}
                  onReject={() =>
                    setImportError('Invalid file type. Please use .sql or .txt files.')
                  }
                  maxSize={5 * 1024 * 1024}
                  accept={{
                    'text/plain': ['.sql', '.txt'],
                    'application/sql': ['.sql'],
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
                      <IconFileDatabase
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
                        Drag SQL file here or click to select
                      </Text>
                      <Text size="sm" c="dimmed" inline mt={7}>
                        Supports .sql and .txt files up to 5MB
                      </Text>
                    </div>
                  </Group>
                </Dropzone>

                <Text size="sm" c="dimmed" ta="center">
                  — or paste SQL directly —
                </Text>

                <Textarea
                  placeholder="CREATE TABLE users (&#10;  id BIGSERIAL PRIMARY KEY,&#10;  name VARCHAR(100) NOT NULL,&#10;  email VARCHAR(255) UNIQUE&#10;);"
                  value={importSql}
                  onChange={(e) => {
                    setImportSql(e.target.value);
                    setImportError(null);
                  }}
                  rows={6}
                  styles={{
                    input: {
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    },
                  }}
                />
              </Stack>
            )}

            <Alert color="blue" variant="light" icon={<IconAlertCircle size={16} />}>
              <Text size="sm">
                <strong>Supported:</strong> CREATE TABLE, FOREIGN KEY, PRIMARY KEY, NOT NULL,
                UNIQUE, DEFAULT.
                <br />
                Base fields (id, estado, fecha_creacion, etc.) will be auto-detected and skipped.
              </Text>
            </Alert>

            <Group justify="flex-end">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={handleImport}
                disabled={!importSql.trim()}
              >
                Import SQL
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
