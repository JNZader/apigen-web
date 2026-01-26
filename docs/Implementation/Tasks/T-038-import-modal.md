# T-038: Crear OpenAPI Import Modal

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.3 UI Components

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-038 |
| **Tipo** | Feature |
| **Estimado** | 3h |
| **Dependencias** | [[T-033]], [[T-035]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Crear modal para importar archivos OpenAPI con preview de entidades a generar.

---

## Tareas

- [ ] Crear `OpenApiImportModal.tsx`
- [ ] Dropzone para archivo
- [ ] Textarea para pegar contenido
- [ ] Preview de entidades detectadas
- [ ] Seleccion de que importar
- [ ] Manejo de errores

---

## Archivos a Crear

```
src/components/
└── OpenApiImportModal.tsx  ← CREAR (~250 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/OpenApiImportModal.tsx

import {
  Modal,
  Stack,
  Tabs,
  Group,
  Button,
  Text,
  Alert,
  Checkbox,
  Paper,
  ScrollArea,
  Badge,
  List,
  ThemeIcon,
  Textarea,
  LoadingOverlay,
  Divider,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import {
  IconUpload,
  IconFile,
  IconCode,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconDatabase,
  IconArrowsJoin,
} from '@tabler/icons-react';
import { memo, useState, useCallback } from 'react';
import { openApiParser, type ParsedOpenApi } from '@/utils/openApiParser';
import { convertToEntities } from '@/utils/openApiConverter';
import { notify } from '@/utils/notifications';

interface OpenApiImportModalProps {
  opened: boolean;
  onClose: () => void;
  onImport: (entities: Entity[], relations: Relation[]) => void;
}

export const OpenApiImportModal = memo(function OpenApiImportModal({
  opened,
  onClose,
  onImport,
}: OpenApiImportModalProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [parseResult, setParseResult] = useState<ParsedOpenApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());

  const handleParse = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    setParseResult(null);

    try {
      const result = openApiParser.parse(text);
      setParseResult(result);
      setSelectedEntities(new Set(result.entities.map((e) => e.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse OpenAPI document');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      try {
        const text = await file.text();
        setContent(text);
        handleParse(text);
      } catch {
        setError('Failed to read file');
      }
    },
    [handleParse]
  );

  const handleTextParse = useCallback(() => {
    if (content.trim()) {
      handleParse(content);
    }
  }, [content, handleParse]);

  const handleEntityToggle = useCallback((entityId: string) => {
    setSelectedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) {
        next.delete(entityId);
      } else {
        next.add(entityId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (parseResult) {
      setSelectedEntities(new Set(parseResult.entities.map((e) => e.id)));
    }
  }, [parseResult]);

  const handleSelectNone = useCallback(() => {
    setSelectedEntities(new Set());
  }, []);

  const handleImport = useCallback(() => {
    if (!parseResult) return;

    const entitiesToImport = parseResult.entities.filter((e) =>
      selectedEntities.has(e.id)
    );

    // Filter relations to only include those with selected entities
    const entityIds = new Set(entitiesToImport.map((e) => e.id));
    const relationsToImport = parseResult.relations.filter(
      (r) => entityIds.has(r.sourceEntityId) && entityIds.has(r.targetEntityId)
    );

    onImport(entitiesToImport, relationsToImport);
    notify.success({ message: `Imported ${entitiesToImport.length} entities` });
    handleClose();
  }, [parseResult, selectedEntities, onImport]);

  const handleClose = useCallback(() => {
    setContent('');
    setParseResult(null);
    setError(null);
    setSelectedEntities(new Set());
    onClose();
  }, [onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Import from OpenAPI"
      size="lg"
    >
      <LoadingOverlay visible={loading} />

      <Stack gap="md">
        {!parseResult ? (
          <Tabs defaultValue="file">
            <Tabs.List>
              <Tabs.Tab value="file" leftSection={<IconFile size={16} />}>
                Upload File
              </Tabs.Tab>
              <Tabs.Tab value="paste" leftSection={<IconCode size={16} />}>
                Paste Content
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="file" pt="md">
              <Dropzone
                onDrop={handleFileDrop}
                accept={{
                  'application/json': ['.json'],
                  'application/x-yaml': ['.yaml', '.yml'],
                }}
                maxSize={5 * 1024 * 1024}
              >
                <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={50} stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={50} stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconFile size={50} stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="lg" inline>
                      Drop OpenAPI file here or click to select
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Supports JSON and YAML formats (max 5MB)
                    </Text>
                  </div>
                </Group>
              </Dropzone>
            </Tabs.Panel>

            <Tabs.Panel value="paste" pt="md">
              <Stack gap="sm">
                <Textarea
                  placeholder="Paste your OpenAPI JSON or YAML here..."
                  minRows={10}
                  maxRows={15}
                  value={content}
                  onChange={(e) => setContent(e.currentTarget.value)}
                  styles={{ input: { fontFamily: 'monospace' } }}
                />
                <Button onClick={handleTextParse} disabled={!content.trim()}>
                  Parse Document
                </Button>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        ) : (
          <Stack gap="md">
            {/* Header with project info */}
            <Paper withBorder p="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={600}>{parseResult.projectName}</Text>
                  <Text size="sm" c="dimmed">
                    Version {parseResult.version}
                  </Text>
                </div>
                <Group gap="xs">
                  <Badge leftSection={<IconDatabase size={12} />}>
                    {parseResult.entities.length} entities
                  </Badge>
                  <Badge leftSection={<IconArrowsJoin size={12} />}>
                    {parseResult.relations.length} relations
                  </Badge>
                </Group>
              </Group>
            </Paper>

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="Warnings">
                <List size="sm">
                  {parseResult.warnings.map((w, i) => (
                    <List.Item key={i}>{w}</List.Item>
                  ))}
                </List>
              </Alert>
            )}

            {/* Entity selection */}
            <div>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>Select entities to import:</Text>
                <Group gap="xs">
                  <Button variant="subtle" size="xs" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="subtle" size="xs" onClick={handleSelectNone}>
                    Select None
                  </Button>
                </Group>
              </Group>

              <ScrollArea h={200}>
                <Stack gap="xs">
                  {parseResult.entities.map((entity) => (
                    <Paper key={entity.id} withBorder p="xs">
                      <Checkbox
                        checked={selectedEntities.has(entity.id)}
                        onChange={() => handleEntityToggle(entity.id)}
                        label={
                          <Group gap="xs">
                            <Text fw={500}>{entity.name}</Text>
                            <Badge size="sm" variant="light">
                              {entity.fields.length} fields
                            </Badge>
                          </Group>
                        }
                      />
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea>
            </div>

            <Divider />

            {/* Actions */}
            <Group justify="space-between">
              <Button variant="subtle" onClick={() => setParseResult(null)}>
                Back
              </Button>
              <Group gap="sm">
                <Button variant="default" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedEntities.size === 0}
                  leftSection={<IconCheck size={16} />}
                >
                  Import {selectedEntities.size} entities
                </Button>
              </Group>
            </Group>
          </Stack>
        )}

        {/* Error display */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Parse Error">
            {error}
          </Alert>
        )}
      </Stack>
    </Modal>
  );
});
```

---

## Criterios de Completado

- [ ] Modal se abre/cierra correctamente
- [ ] Dropzone acepta archivos JSON/YAML
- [ ] Textarea permite pegar contenido
- [ ] Preview muestra entidades detectadas
- [ ] Seleccion funciona correctamente
- [ ] Import crea entidades en el store
- [ ] `npm run check` pasa

---

## Pre-Commit Checklist

> **Antes de commitear**, ejecutar en orden:

```bash
npm run check:fix && npm run test:run && gga run
```

- [ ] `npm run build` - Sin errores de tipos
- [ ] `npm run check:fix` - Lint/formato OK
- [ ] `npm run test:run` - Tests pasan
- [ ] `gga run` - STATUS: PASSED

> Ver detalles: [[WORKFLOW-PRECOMMIT]]

---

## Log de Trabajo

| Fecha | Tiempo | Notas |
|-------|--------|-------|
| - | - | - |

---

#task #fase-3 #feature #pending

[[T-033]], [[T-035]] → [[T-038]] → [[T-039]] | [[Phases/03-OPENAPI-IMPORT]]
