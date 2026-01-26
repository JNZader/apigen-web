# T-024: Crear FileStorageSettingsForm.tsx

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.3 File Storage

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-024 |
| **Tipo** | Feature |
| **Estimado** | 2.5h |
| **Dependencias** | Fase 0 completada |
| **Branch** | `feat/feature-storage` |
| **Estado** | Pending |
| **Paralelo** | SI - con T-020, T-022, T-026, T-028 |

---

## Objetivo

Crear formulario para configurar almacenamiento de archivos (Local, S3, Azure).

---

## Tareas

- [ ] Crear `FileStorageSettingsForm.tsx`
- [ ] Radio buttons para tipo de storage
- [ ] Campos condicionales por tipo
- [ ] Validacion de configuracion
- [ ] Integrar con store

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── FileStorageSettingsForm.tsx  ← CREAR (~200 lineas)
```

---

## Codigo de Referencia

```typescript
// src/components/ProjectSettings/FileStorageSettingsForm.tsx

import {
  Stack,
  Switch,
  TextInput,
  NumberInput,
  Checkbox,
  Group,
  Text,
  Divider,
  Radio,
  Paper,
  SimpleGrid,
} from '@mantine/core';
import {
  IconFolder,
  IconCloud,
  IconBrandAzure,
  IconUpload,
} from '@tabler/icons-react';
import { memo, useCallback } from 'react';
import { useProjectStore } from '@/store';
import type { StorageConfig, StorageType } from '@/types/config/featurepack';

export const FileStorageSettingsForm = memo(function FileStorageSettingsForm() {
  const storageConfig = useProjectStore((s) => s.storageConfig);
  const updateStorageConfig = useProjectStore((s) => s.updateStorageConfig);
  const features = useProjectStore((s) => s.features);
  const updateFeature = useProjectStore((s) => s.updateFeature);

  const handleChange = useCallback(
    <K extends keyof StorageConfig>(key: K, value: StorageConfig[K]) => {
      updateStorageConfig({ [key]: value });
    },
    [updateStorageConfig]
  );

  const handleTypeChange = useCallback(
    (type: StorageType) => {
      updateStorageConfig({ type });
    },
    [updateStorageConfig]
  );

  return (
    <Stack gap="md">
      {/* Master toggle */}
      <Group justify="space-between">
        <div>
          <Text fw={500}>Enable File Upload</Text>
          <Text size="sm" c="dimmed">
            Allow users to upload and manage files
          </Text>
        </div>
        <Switch
          checked={features.fileUpload}
          onChange={(e) => updateFeature('fileUpload', e.currentTarget.checked)}
          size="md"
        />
      </Group>

      {features.fileUpload && (
        <>
          <Divider label="Storage Type" labelPosition="left" />

          <Radio.Group
            value={storageConfig.type}
            onChange={(val) => handleTypeChange(val as StorageType)}
          >
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <StorageTypeCard
                value="local"
                icon={<IconFolder size={24} />}
                title="Local Storage"
                description="Store files on local filesystem"
                selected={storageConfig.type === 'local'}
              />
              <StorageTypeCard
                value="s3"
                icon={<IconCloud size={24} />}
                title="Amazon S3"
                description="Store files in AWS S3 bucket"
                selected={storageConfig.type === 's3'}
              />
              <StorageTypeCard
                value="azure"
                icon={<IconBrandAzure size={24} />}
                title="Azure Blob"
                description="Store files in Azure Blob Storage"
                selected={storageConfig.type === 'azure'}
              />
            </SimpleGrid>
          </Radio.Group>

          <Divider label="Storage Settings" labelPosition="left" />

          {/* Local Storage Options */}
          {storageConfig.type === 'local' && (
            <TextInput
              label="Local Path"
              description="Directory path for file storage"
              placeholder="./uploads"
              value={storageConfig.localPath}
              onChange={(e) => handleChange('localPath', e.currentTarget.value)}
              leftSection={<IconFolder size={16} />}
            />
          )}

          {/* S3 Options */}
          {storageConfig.type === 's3' && (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="S3 Bucket"
                description="Name of the S3 bucket"
                placeholder="my-app-files"
                value={storageConfig.s3Bucket}
                onChange={(e) => handleChange('s3Bucket', e.currentTarget.value)}
              />
              <TextInput
                label="AWS Region"
                description="AWS region for the bucket"
                placeholder="us-east-1"
                value={storageConfig.s3Region}
                onChange={(e) => handleChange('s3Region', e.currentTarget.value)}
              />
            </SimpleGrid>
          )}

          {/* Azure Options */}
          {storageConfig.type === 'azure' && (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Container Name"
                description="Azure Blob container name"
                placeholder="files"
                value={storageConfig.azureContainer}
                onChange={(e) => handleChange('azureContainer', e.currentTarget.value)}
              />
              <TextInput
                label="Connection String Env"
                description="Environment variable name"
                placeholder="AZURE_STORAGE_CONNECTION_STRING"
                value={storageConfig.azureConnectionStringEnv}
                onChange={(e) =>
                  handleChange('azureConnectionStringEnv', e.currentTarget.value)
                }
              />
            </SimpleGrid>
          )}

          <Divider label="Upload Limits" labelPosition="left" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Max File Size (MB)"
              description="Maximum upload size"
              value={storageConfig.maxFileSizeMb}
              onChange={(val) => handleChange('maxFileSizeMb', Number(val) || 10)}
              min={1}
              max={1000}
              leftSection={<IconUpload size={16} />}
            />
            <TextInput
              label="Allowed Extensions"
              description="Comma-separated list"
              placeholder="jpg,png,pdf,doc"
              value={storageConfig.allowedExtensions}
              onChange={(e) =>
                handleChange('allowedExtensions', e.currentTarget.value)
              }
            />
          </SimpleGrid>

          <Divider label="Options" labelPosition="left" />

          <Checkbox
            label="Generate FileMetadata entity"
            description="Create entity to track uploaded files"
            checked={storageConfig.generateMetadataEntity}
            onChange={(e) =>
              handleChange('generateMetadataEntity', e.currentTarget.checked)
            }
          />
        </>
      )}
    </Stack>
  );
});

// Sub-component for storage type selection
interface StorageTypeCardProps {
  value: StorageType;
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
}

const StorageTypeCard = memo(function StorageTypeCard({
  value,
  icon,
  title,
  description,
  selected,
}: StorageTypeCardProps) {
  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{
        cursor: 'pointer',
        borderColor: selected ? 'var(--mantine-color-blue-5)' : undefined,
        backgroundColor: selected ? 'var(--mantine-color-blue-0)' : undefined,
      }}
    >
      <Radio value={value} label="" style={{ display: 'none' }} />
      <Stack gap="xs" align="center">
        {icon}
        <Text fw={500} size="sm">
          {title}
        </Text>
        <Text size="xs" c="dimmed" ta="center">
          {description}
        </Text>
      </Stack>
    </Paper>
  );
});
```

---

## Criterios de Completado

- [ ] 3 tipos de storage seleccionables
- [ ] Campos condicionales por tipo
- [ ] Limites de upload configurables
- [ ] Config se guarda en store
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

#task #fase-2 #feature #pending

Fase 0 → [[T-024]] → [[T-025]] | [[Phases/02-FEATURE-PACK]]
