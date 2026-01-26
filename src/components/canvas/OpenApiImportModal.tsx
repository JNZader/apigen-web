import { Alert, Button, Group, Modal, rem, Stack, Text, Textarea } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { modals } from '@mantine/modals';
import { IconAlertCircle, IconApi, IconUpload, IconX } from '@tabler/icons-react';
import { useCallback, useRef, useState } from 'react';
import { useEntities, useEntityActions, useRelationActions } from '../../store';
import { notify } from '../../utils/notifications';
import { parseOpenApi } from '../../utils/openApiParser';

interface OpenApiImportModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onImportComplete?: () => void;
}

export function OpenApiImportModal({
  opened,
  onClose,
  onImportComplete,
}: Readonly<OpenApiImportModalProps>) {
  const entities = useEntities();
  const { setEntities } = useEntityActions();
  const { setRelations } = useRelationActions();

  const [importContent, setImportContent] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const isImportingRef = useRef(false);

  const applyImport = useCallback(
    (parsedEntities: typeof entities, parsedRelations: Parameters<typeof setRelations>[0]) => {
      setEntities(parsedEntities);
      setRelations(parsedRelations);

      notify.success({
        title: 'OpenAPI Imported',
        message: `Imported ${parsedEntities.length} entities and ${parsedRelations.length} relations`,
      });

      setImportContent('');
      setImportError(null);
      onClose();
      onImportComplete?.();
    },
    [setEntities, setRelations, onClose, onImportComplete],
  );

  const handleImport = useCallback(() => {
    if (isImportingRef.current) return;

    if (!importContent.trim()) {
      setImportError('Please provide an OpenAPI specification');
      return;
    }

    isImportingRef.current = true;

    try {
      const { entities: parsedEntities, relations: parsedRelations } = parseOpenApi(importContent);

      if (parsedEntities.length === 0) {
        setImportError('No valid schemas found in the OpenAPI specification');
        isImportingRef.current = false;
        return;
      }

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
      setImportError(
        error instanceof Error ? error.message : 'Failed to parse OpenAPI specification',
      );
      isImportingRef.current = false;
    }
  }, [importContent, entities.length, applyImport]);

  const handleFileDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const content = await file.text();
      setImportContent(content);
      setImportError(null);
      notify.info({
        title: 'File loaded',
        message: `${file.name} loaded successfully`,
      });
    } catch {
      setImportError('Failed to read file');
    }
  };

  const handleClose = useCallback(() => {
    setImportContent('');
    setImportError(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Import from OpenAPI"
      size="lg"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
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

        {importContent ? (
          <>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Edit or clear to upload another file
              </Text>
              <Button variant="subtle" color="gray" size="xs" onClick={() => setImportContent('')}>
                Clear
              </Button>
            </Group>
            <Textarea
              value={importContent}
              onChange={(e) => {
                setImportContent(e.target.value);
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
              onReject={() => setImportError('Invalid file type. Please use .json or .yaml files.')}
              maxSize={5 * 1024 * 1024}
              accept={{
                'application/json': ['.json'],
                'application/x-yaml': ['.yaml', '.yml'],
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
                  <IconApi
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
                    Supports .json files up to 5MB (OpenAPI 3.x or Swagger 2.x)
                  </Text>
                </div>
              </Group>
            </Dropzone>

            <Text size="sm" c="dimmed" ta="center">
              - or paste OpenAPI JSON directly -
            </Text>

            <Textarea
              placeholder='{"openapi": "3.0.0", "components": {"schemas": {...}}}'
              value={importContent}
              onChange={(e) => {
                setImportContent(e.target.value);
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
            <strong>Supported:</strong> OpenAPI 3.x and Swagger 2.x specifications in JSON format.
            <br />
            Schemas from <code>components.schemas</code> or <code>definitions</code> will be
            converted to entities with their properties as fields.
          </Text>
        </Alert>

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftSection={<IconUpload size={16} />}
            onClick={handleImport}
            disabled={!importContent.trim()}
          >
            Import OpenAPI
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
