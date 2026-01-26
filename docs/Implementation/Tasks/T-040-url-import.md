# T-040: Agregar Importacion por URL

> Fase: [[Phases/03-OPENAPI-IMPORT]] | Iteracion: 3.4 URL Import

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-040 |
| **Tipo** | Feature |
| **Estimado** | 2h |
| **Dependencias** | [[T-038]] |
| **Branch** | `feat/openapi-import` |
| **Estado** | Pending |

---

## Objetivo

Agregar tab para importar OpenAPI desde una URL publica.

---

## Archivos a Modificar

```
src/components/
└── OpenApiImportModal.tsx  ← MODIFICAR (agregar tab URL)
```

---

## Codigo de Referencia

```typescript
// Agregar nuevo tab en OpenApiImportModal.tsx

import { TextInput } from '@mantine/core';
import { IconLink } from '@tabler/icons-react';

// Estado adicional:
const [url, setUrl] = useState('');
const [fetchingUrl, setFetchingUrl] = useState(false);

// Handler para fetch de URL:
const handleUrlFetch = useCallback(async () => {
  if (!url.trim()) return;

  setFetchingUrl(true);
  setError(null);

  try {
    // Validar URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }

    // Fetch con CORS proxy si es necesario
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json, application/x-yaml, text/yaml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    setContent(text);
    handleParse(text);
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      // CORS error - suggest alternatives
      setError(
        'CORS error: Cannot fetch this URL directly. Try downloading the file and uploading it, or use a URL that allows cross-origin requests.'
      );
    } else {
      setError(err instanceof Error ? err.message : 'Failed to fetch URL');
    }
  } finally {
    setFetchingUrl(false);
  }
}, [url, handleParse]);

// Nuevo tab en JSX:
<Tabs.Tab value="url" leftSection={<IconLink size={16} />}>
  From URL
</Tabs.Tab>

<Tabs.Panel value="url" pt="md">
  <Stack gap="sm">
    <TextInput
      label="OpenAPI URL"
      description="Enter the URL of a publicly accessible OpenAPI document"
      placeholder="https://api.example.com/openapi.json"
      value={url}
      onChange={(e) => setUrl(e.currentTarget.value)}
      leftSection={<IconLink size={16} />}
    />

    <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
      <Text size="sm">
        Note: The URL must allow cross-origin requests (CORS).
        If you encounter issues, download the file and upload it instead.
      </Text>
    </Alert>

    <Group justify="flex-end">
      <Button
        onClick={handleUrlFetch}
        disabled={!url.trim()}
        loading={fetchingUrl}
        leftSection={<IconDownload size={16} />}
      >
        Fetch & Parse
      </Button>
    </Group>

    {/* Popular APIs shortcuts */}
    <Paper withBorder p="sm" mt="md">
      <Text size="sm" fw={500} mb="xs">
        Try with popular APIs:
      </Text>
      <Group gap="xs">
        <Button
          variant="light"
          size="xs"
          onClick={() => setUrl('https://petstore3.swagger.io/api/v3/openapi.json')}
        >
          Petstore
        </Button>
        <Button
          variant="light"
          size="xs"
          onClick={() => setUrl('https://api.apis.guru/v2/specs/github.com/1.1.4/openapi.yaml')}
        >
          GitHub
        </Button>
      </Group>
    </Paper>
  </Stack>
</Tabs.Panel>
```

---

## Criterios de Completado

- [ ] Tab URL visible en modal
- [ ] Input de URL funciona
- [ ] Fetch con manejo de errores CORS
- [ ] Shortcuts para APIs populares
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

[[T-038]] → [[T-040]] → [[T-041]] | [[Phases/03-OPENAPI-IMPORT]]
