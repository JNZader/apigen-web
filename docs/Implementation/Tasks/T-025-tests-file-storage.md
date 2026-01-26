# T-025: Tests FileStorageSettingsForm

> Fase: [[Phases/02-FEATURE-PACK]] | Iteracion: 2.3 File Storage

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-025 |
| **Tipo** | Test |
| **Estimado** | 0.5h |
| **Dependencias** | [[T-024]] |
| **Branch** | `feat/feature-storage` |
| **Estado** | Pending |

---

## Objetivo

Crear tests para FileStorageSettingsForm.

---

## Archivos a Crear

```
src/components/ProjectSettings/
└── FileStorageSettingsForm.test.tsx  ← CREAR (~80 lineas)
```

---

## Codigo de Referencia

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { FileStorageSettingsForm } from './FileStorageSettingsForm';
import { useProjectStore } from '@/store';

vi.mock('@/store');

describe('FileStorageSettingsForm', () => {
  const mockUpdateStorageConfig = vi.fn();
  const mockUpdateFeature = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        storageConfig: {
          type: 'local',
          localPath: './uploads',
          maxFileSizeMb: 10,
          allowedExtensions: 'jpg,png,pdf',
          s3Bucket: '',
          s3Region: 'us-east-1',
          azureContainer: '',
          azureConnectionStringEnv: '',
          generateMetadataEntity: true,
        },
        features: { fileUpload: true },
        updateStorageConfig: mockUpdateStorageConfig,
        updateFeature: mockUpdateFeature,
      };
      return selector(state);
    });
  });

  it('renders storage type options', () => {
    render(<FileStorageSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByText('Local Storage')).toBeInTheDocument();
    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
    expect(screen.getByText('Azure Blob')).toBeInTheDocument();
  });

  it('shows local path field for local storage', () => {
    render(<FileStorageSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByLabelText(/Local Path/)).toBeInTheDocument();
  });

  it('shows S3 fields when S3 is selected', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        storageConfig: { type: 's3', s3Bucket: '', s3Region: 'us-east-1' },
        features: { fileUpload: true },
        updateStorageConfig: mockUpdateStorageConfig,
        updateFeature: mockUpdateFeature,
      };
      return selector(state);
    });

    render(<FileStorageSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.getByLabelText(/S3 Bucket/)).toBeInTheDocument();
    expect(screen.getByLabelText(/AWS Region/)).toBeInTheDocument();
  });

  it('hides options when file upload is disabled', () => {
    (useProjectStore as any).mockImplementation((selector: any) => {
      const state = {
        storageConfig: { type: 'local' },
        features: { fileUpload: false },
        updateStorageConfig: mockUpdateStorageConfig,
        updateFeature: mockUpdateFeature,
      };
      return selector(state);
    });

    render(<FileStorageSettingsForm />, {
      wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
    });

    expect(screen.queryByText('Local Storage')).not.toBeInTheDocument();
  });
});
```

---

## Criterios de Completado

- [ ] Tests pasan
- [ ] Cobertura >80%
- [ ] `npm run test:run` pasa

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

#task #fase-2 #test #pending

[[T-024]] → [[T-025]] | [[Phases/02-FEATURE-PACK]]
