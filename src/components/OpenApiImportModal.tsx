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

  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  rem,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { modals } from '@mantine/modals';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconApi,
  IconCheck,
  IconFileCode,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useRef, useState } from 'react';
import { useEntities, useEntityActions } from '../store';
import type { EntityDesign, FieldDesign, JavaType } from '../types';
import { notify } from '../utils/notifications';

// ============================================================================
// Types
// ============================================================================

interface OpenApiImportModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

interface ParsedEntity {
  name: string;
  tableName: string;
  description?: string;
  fields: ParsedField[];
}

interface ParsedField {
  name: string;
  type: JavaType;
  nullable: boolean;
  description?: string;
}

interface ParseWarning {
  type: 'info' | 'warning' | 'error';
  message: string;
}

interface ParseResult {
  entities: ParsedEntity[];
  warnings: ParseWarning[];
  error?: string;
}

// ============================================================================
// OpenAPI Parser (inline - will be extracted to T-033)
// ============================================================================

function mapOpenApiTypeToJava(
  type: string | undefined,
  format: string | undefined,
): JavaType {
  if (!type) return 'String';

  switch (type) {
    case 'string':
      if (format === 'date') return 'LocalDate';
      if (format === 'date-time') return 'LocalDateTime';
      if (format === 'uuid') return 'UUID';
      if (format === 'binary' || format === 'byte') return 'byte[]';
      return 'String';
    case 'integer':
      if (format === 'int64') return 'Long';
      return 'Integer';
    case 'number':
      if (format === 'float') return 'Float';
      if (format === 'double') return 'Double';
      return 'BigDecimal';
    case 'boolean':
      return 'Boolean';
    default:
      return 'String';
  }
}

function toSnakeCase(str: string): string {
  return str
    .replaceAll(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function parseOpenApiContent(content: string): ParseResult {
  const warnings: ParseWarning[] = [];
  const entities: ParsedEntity[] = [];

  try {
    // Try parsing as JSON first, then YAML
    let spec: Record<string, unknown>;

    try {
      spec = JSON.parse(content);
    } catch {
      // Simple YAML parsing for common cases
      // For full YAML support, a library like js-yaml would be needed
      warnings.push({
        type: 'info',
        message: 'YAML parsing is limited. For best results, use JSON format.',
      });

      // Try basic YAML-to-JSON conversion
      try {
        // Handle simple YAML structures
        const yamlContent = content
          .split('\n')
          .filter((line) => !line.trim().startsWith('#'))
          .join('\n');

        // Very basic YAML object detection - just try JSON again after cleanup
        spec = JSON.parse(yamlContent);
      } catch {
        return {
          entities: [],
          warnings,
          error: 'Invalid format. Please provide a valid OpenAPI JSON or YAML file.',
        };
      }
    }

    // Validate OpenAPI structure
    const openapi = spec.openapi as string | undefined;
    const swagger = spec.swagger as string | undefined;

    if (!openapi && !swagger) {
      return {
        entities: [],
        warnings,
        error: 'Not a valid OpenAPI/Swagger specification. Missing "openapi" or "swagger" version field.',
      };
    }

    // Get schemas/definitions
    const components = spec.components as Record<string, unknown> | undefined;
    const schemas = (components?.schemas || spec.definitions || {}) as Record<
      string,
      Record<string, unknown>
    >;

    if (Object.keys(schemas).length === 0) {
      return {
        entities: [],
        warnings: [
          {
            type: 'warning',
            message: 'No schemas found in the OpenAPI specification.',
          },
        ],
      };
    }

    // Parse each schema into an entity
    for (const [schemaName, schema] of Object.entries(schemas)) {
      // Skip non-object schemas
      if (schema.type !== 'object' && !schema.properties) {
        warnings.push({
          type: 'info',
          message: `Skipped "${schemaName}": not an object schema.`,
        });
        continue;
      }

      const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
      if (!properties) {
        warnings.push({
          type: 'info',
          message: `Skipped "${schemaName}": no properties defined.`,
        });
        continue;
      }

      const requiredFields = (schema.required || []) as string[];
      const fields: ParsedField[] = [];

      // Parse each property as a field
      for (const [propName, prop] of Object.entries(properties)) {
        // Skip id field - it's auto-generated
        if (propName.toLowerCase() === 'id') {
          continue;
        }

        // Handle $ref
        if (prop.$ref) {
          warnings.push({
            type: 'info',
            message: `Field "${propName}" in "${schemaName}" references another schema. Mapped to String.`,
          });
          fields.push({
            name: propName,
            type: 'String',
            nullable: !requiredFields.includes(propName),
            description: prop.description as string | undefined,
          });
          continue;
        }

        const fieldType = mapOpenApiTypeToJava(
          prop.type as string | undefined,
          prop.format as string | undefined,
        );

        fields.push({
          name: propName,
          type: fieldType,
          nullable: !requiredFields.includes(propName),
          description: prop.description as string | undefined,
        });
      }

      if (fields.length === 0) {
        warnings.push({
          type: 'info',
          message: `Skipped "${schemaName}": no valid fields after filtering.`,
        });
        continue;
      }

      entities.push({
        name: schemaName,
        tableName: `${toSnakeCase(schemaName)}s`,
        description: schema.description as string | undefined,
        fields,
      });
    }

    if (entities.length === 0) {
      warnings.push({
        type: 'warning',
        message: 'No entities could be extracted from the schemas.',
      });
    }

    return { entities, warnings };
  } catch (error) {
    return {
      entities: [],
      warnings,
      error: error instanceof Error ? error.message : 'Failed to parse OpenAPI specification.',
    };
  }
}

// ============================================================================
// Component
// ============================================================================

export function OpenApiImportModal({ opened, onClose }: Readonly<OpenApiImportModalProps>) {
  const existingEntities = useEntities();
  const { setEntities } = useEntityActions();

  const [inputContent, setInputContent] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  const isProcessingRef = useRef(false);

  // Parse the content when it changes
  const handleContentChange = useCallback((content: string) => {
    setInputContent(content);
    setParseResult(null);
    setSelectedEntities(new Set());
  }, []);

  // Preview the parsed entities
  const handlePreview = useCallback(() => {
    if (isProcessingRef.current || !inputContent.trim()) return;

    isProcessingRef.current = true;
    try {
      const result = parseOpenApiContent(inputContent);
      setParseResult(result);

      // Auto-select all valid entities
      if (result.entities.length > 0) {
        setSelectedEntities(new Set(result.entities.map((e) => e.name)));
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [inputContent]);

  // Handle file drop
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
      try {
        const content = await file.text();
        handleContentChange(content);
        notify.info({
          title: 'File loaded',
          message: `${file.name} loaded successfully. Click "Preview" to see entities.`,
        });
      } catch {
        notify.error({
          title: 'Error',
          message: 'Failed to read file.',
        });
      }
    },
    [handleContentChange],
  );

  // Toggle entity selection
  const toggleEntity = useCallback((entityName: string) => {
    setSelectedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(entityName)) {
        next.delete(entityName);
      } else {
        next.add(entityName);
      }
      return next;
    });
  }, []);

  // Select all / none
  const selectAll = useCallback(() => {
    if (parseResult) {
      setSelectedEntities(new Set(parseResult.entities.map((e) => e.name)));
    }
  }, [parseResult]);

  const selectNone = useCallback(() => {
    setSelectedEntities(new Set());
  }, []);

  // Import selected entities
  const handleImport = useCallback(() => {
    if (!parseResult || selectedEntities.size === 0 || isImporting) return;

    const entitiesToImport = parseResult.entities.filter((e) => selectedEntities.has(e.name));

    const doImport = () => {
      setIsImporting(true);

      try {
        // Convert parsed entities to EntityDesign format
        const newEntities: EntityDesign[] = entitiesToImport.map((parsed, index) => ({
          id: `openapi-${Date.now()}-${index}`,
          name: parsed.name,
          tableName: parsed.tableName,
          description: parsed.description,
          position: {
            x: 100 + (index % 3) * 350,
            y: 100 + Math.floor(index / 3) * 300,
          },
          fields: parsed.fields.map((f, fieldIndex) => ({
            id: `field-${Date.now()}-${index}-${fieldIndex}`,
            name: f.name,
            columnName: toSnakeCase(f.name),
            type: f.type,
            nullable: f.nullable,
            unique: false,
            validations: f.nullable ? [] : [{ type: 'NotNull' as const }],
            description: f.description,
          })) as FieldDesign[],
          config: {
            generateController: true,
            generateService: true,
            enableCaching: true,
          },
        }));

        // Merge with existing or replace
        setEntities([...existingEntities, ...newEntities]);

        notify.success({
          title: 'Import Successful',
          message: `Imported ${newEntities.length} entities with ${newEntities.reduce((sum, e) => sum + e.fields.length, 0)} fields.`,
        });

        // Reset and close
        setInputContent('');
        setParseResult(null);
        setSelectedEntities(new Set());
        onClose();
      } catch (error) {
        notify.error({
          title: 'Import Failed',
          message: error instanceof Error ? error.message : 'An error occurred during import.',
        });
      } finally {
        setIsImporting(false);
      }
    };

    // Confirm if there are existing entities
    if (existingEntities.length > 0) {
      modals.openConfirmModal({
        title: 'Add to Existing Design',
        children: (
          <Text size="sm">
            You have {existingEntities.length} existing entities. The imported entities will be
            added to your current design. Continue?
          </Text>
        ),
        labels: { confirm: 'Add Entities', cancel: 'Cancel' },
        confirmProps: { color: 'blue' },
        onConfirm: doImport,
      });
    } else {
      doImport();
    }
  }, [parseResult, selectedEntities, isImporting, existingEntities, setEntities, onClose]);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setInputContent('');
    setParseResult(null);
    setSelectedEntities(new Set());
    onClose();
  }, [onClose]);

  const hasContent = inputContent.trim().length > 0;
  const hasPreview = parseResult !== null;
  const hasEntities = parseResult && parseResult.entities.length > 0;
  const hasSelection = selectedEntities.size > 0;

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
      title={
        <Group gap="xs">
          <IconApi size={20} />
          <Text fw={500}>Import from OpenAPI</Text>
        </Group>
      }
      size="xl"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <Stack gap="md">
        {/* Input Section */}
        {!hasPreview && (
          <>
            <Dropzone
              onDrop={handleFileDrop}
              onReject={() =>
                notify.error({
                  message: 'Invalid file type. Please use .json or .yaml files.',
                })
              }
              maxSize={5 * 1024 * 1024}
              accept={{
                'application/json': ['.json'],
                'application/x-yaml': ['.yaml', '.yml'],
                'text/yaml': ['.yaml', '.yml'],
                'text/plain': ['.json', '.yaml', '.yml'],
              }}
              multiple={false}
            >
              <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload
                    style={{
                      width: rem(48),
                      height: rem(48),
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
                      width: rem(48),
                      height: rem(48),
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
                      width: rem(48),
                      height: rem(48),
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
                  <Text size="lg" inline>
                    Drag OpenAPI file here or click to select
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Supports .json and .yaml files (OpenAPI 3.x / Swagger 2.0)
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

            <Text size="sm" c="dimmed" ta="center">
              — or paste OpenAPI specification directly —
            </Text>

            <Textarea
              placeholder={`{
  "openapi": "3.0.0",
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "email": { "type": "string" }
        }
      }
    }
  }
}`}
              value={inputContent}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={8}
              styles={{
                input: {
                  fontFamily: 'monospace',
                  fontSize: '12px',
                },
              }}
            />

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
                leftSection={<IconUpload size={16} />}
                onClick={handlePreview}
                disabled={!hasContent}
              >
                Preview Entities
              </Button>
            </Group>
          </>
        )}

        {/* Preview Section */}
        {hasPreview && (
          <>
            {/* Back button */}
            <Group justify="space-between">
              <Button
                variant="subtle"
                size="xs"
                onClick={() => {
                  setParseResult(null);
                  setSelectedEntities(new Set());
                }}
              >
                ← Back to input
              </Button>
              {hasEntities && (
                <Group gap="xs">
                  <Button variant="subtle" size="xs" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="subtle" size="xs" onClick={selectNone}>
                    Select None
                  </Button>
                </Group>
              )}
            </Group>

            {/* Error display */}
            {parseResult.error && (
              <Alert color="red" icon={<IconAlertCircle size={16} />} title="Parse Error">
                {parseResult.error}
              </Alert>
            )}

            {/* Warnings display */}
            {parseResult.warnings.length > 0 && (
              <Alert
                color="yellow"
                icon={<IconAlertTriangle size={16} />}
                title={`${parseResult.warnings.length} Warning${parseResult.warnings.length > 1 ? 's' : ''}`}
              >
                <Stack gap={4}>
                  {parseResult.warnings.map((w, i) => (
                    <Text key={i} size="sm">
                      • {w.message}
                    </Text>
                  ))}
                </Stack>
              </Alert>
            )}

            {/* Entities list */}
            {hasEntities && (
              <>
                <Text size="sm" c="dimmed">
                  Found {parseResult.entities.length} entities. Select which ones to import:
                </Text>

                <ScrollArea h={300}>
                  <Stack gap="xs">
                    {parseResult.entities.map((entity) => (
                      <Box
                        key={entity.name}
                        p="sm"
                        style={{
                          border: '1px solid var(--mantine-color-default-border)',
                          borderRadius: 'var(--mantine-radius-sm)',
                          backgroundColor: selectedEntities.has(entity.name)
                            ? 'var(--mantine-color-blue-light)'
                            : 'var(--mantine-color-body)',
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="sm" wrap="nowrap">
                            <Checkbox
                              checked={selectedEntities.has(entity.name)}
                              onChange={() => toggleEntity(entity.name)}
                              aria-label={`Select ${entity.name}`}
                            />
                            <div>
                              <Group gap="xs">
                                <Text fw={500}>{entity.name}</Text>
                                <Badge size="xs" variant="light">
                                  {entity.fields.length} fields
                                </Badge>
                              </Group>
                              {entity.description && (
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {entity.description}
                                </Text>
                              )}
                            </div>
                          </Group>
                          <ThemeIcon
                            variant="light"
                            color={selectedEntities.has(entity.name) ? 'blue' : 'gray'}
                            size="sm"
                          >
                            {selectedEntities.has(entity.name) ? (
                              <IconCheck size={14} />
                            ) : (
                              <IconApi size={14} />
                            )}
                          </ThemeIcon>
                        </Group>

                        {/* Field preview */}
                        <Group gap={4} mt="xs" wrap="wrap">
                          {entity.fields.slice(0, 5).map((field) => (
                            <Badge key={field.name} size="xs" variant="outline" color="gray">
                              {field.name}: {field.type}
                            </Badge>
                          ))}
                          {entity.fields.length > 5 && (
                            <Badge size="xs" variant="outline" color="gray">
                              +{entity.fields.length - 5} more
                            </Badge>
                          )}
                        </Group>
                      </Box>
                    ))}
                  </Stack>
                </ScrollArea>

                <Divider />

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {selectedEntities.size} of {parseResult.entities.length} selected
                  </Text>
                  <Group>
                    <Button variant="default" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      leftSection={<IconCheck size={16} />}
                      onClick={handleImport}
                      disabled={!hasSelection}
                      loading={isImporting}
                    >
                      Import {selectedEntities.size} Entities
                    </Button>
                  </Group>
                </Group>
              </>
            )}

            {/* No entities found */}
            {!hasEntities && !parseResult.error && (
              <Alert color="blue" icon={<IconAlertCircle size={16} />}>
                No entities could be extracted from this OpenAPI specification. Make sure your spec
                contains schemas with object properties.
              </Alert>
            )}
          </>
        )}
      </Stack>
    </Modal>
  );
}
