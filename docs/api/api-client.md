# API Client

The API client provides a robust interface for communicating with the APiGen backend.

## Configuration

```typescript
// Environment variable
VITE_API_URL=https://alright-iormina-jnz-d5f41c2c.koyeb.app
```

## Base Client

Located in `src/api/apiClient.ts`.

### Features

- **Automatic retry** - Retries failed requests with exponential backoff
- **Timeout handling** - Configurable request timeouts
- **Error normalization** - Consistent error format
- **Response validation** - Zod schema validation

### Usage

```typescript
import { apiClient } from '@/api/apiClient';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const result = await apiClient.post('/endpoint', { body: payload });

// With options
const response = await apiClient.post('/endpoint', {
  body: payload,
  timeout: 30000,
  retries: 3,
});
```

### Configuration Options

```typescript
interface RequestOptions {
  body?: unknown;           // Request body (auto-serialized to JSON)
  timeout?: number;         // Request timeout in ms (default: 30000)
  retries?: number;         // Number of retry attempts (default: 3)
  headers?: HeadersInit;    // Additional headers
}
```

---

## Generator API

Located in `src/api/generatorApi.ts`.

### generateProject

Generates a Spring Boot project from the current design.

```typescript
import { generateProject } from '@/api/generatorApi';

const zipBlob = await generateProject({
  project: projectConfig,
  entities: entities,
  relations: relations,
  services: services,
});

// Returns: Blob (ZIP file)
```

### Request Schema

```typescript
interface GenerateRequest {
  project: ProjectConfig;
  entities: EntityDesign[];
  relations: RelationDesign[];
  services?: ServiceDesign[];
}
```

### Response

Returns a `Blob` containing the generated ZIP file.

### Error Handling

```typescript
try {
  const blob = await generateProject(config);
  saveAs(blob, `${config.project.artifactId}.zip`);
} catch (error) {
  if (error instanceof ApiError) {
    notify.error({
      title: 'Generation Failed',
      message: error.message,
    });
  }
}
```

---

## Error Handling

### ApiError Class

```typescript
class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
}
```

### Error Types

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource missing |
| 422 | Validation Error - Schema failed |
| 500 | Server Error - Backend failure |
| 503 | Service Unavailable - Backend down |

### Handling Errors

```typescript
import { ApiError } from '@/api/apiClient';

try {
  await apiClient.post('/generate', { body: data });
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        notify.error({ message: 'Invalid project configuration' });
        break;
      case 503:
        notify.error({ message: 'Backend service unavailable' });
        break;
      default:
        notify.error({ message: error.message });
    }
  }
}
```

---

## Request/Response Validation

Uses Zod schemas for type-safe validation.

### Schemas

Located in `src/api/schemas.ts`:

```typescript
// Project configuration schema
export const ProjectConfigSchema = z.object({
  groupId: z.string().min(1),
  artifactId: z.string().min(1),
  version: z.string(),
  name: z.string(),
  // ... more fields
});

// Entity schema
export const EntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  tableName: z.string(),
  fields: z.array(FieldSchema),
  // ... more fields
});
```

### Validating Responses

```typescript
import { ProjectConfigSchema } from '@/api/schemas';

const response = await apiClient.get('/project');
const validated = ProjectConfigSchema.parse(response);
// Throws ZodError if validation fails
```

---

## Retry Strategy

### Default Behavior

- **Max retries**: 3
- **Backoff**: Exponential (1s, 2s, 4s)
- **Retry on**: Network errors, 5xx responses
- **No retry**: 4xx responses (client errors)

### Custom Retry

```typescript
const result = await apiClient.post('/endpoint', {
  body: data,
  retries: 5,  // More retries for important operations
});
```

---

## Security

### Archive Validation

When receiving ZIP files, the client validates:

1. **Path traversal** - No `../` in file paths
2. **File size** - Individual files < 10MB
3. **Total size** - Archive < 50MB
4. **File count** - < 1000 files

```typescript
import { validateZipArchive } from '@/utils/archiveSecurity';

const blob = await generateProject(config);
const validation = await validateZipArchive(blob);

if (!validation.isValid) {
  throw new Error(`Security violation: ${validation.errors.join(', ')}`);
}
```

### CORS

The backend must include proper CORS headers:

```
Access-Control-Allow-Origin: https://apigen-studio.vercel.app
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Testing

### Mocking the API Client

```typescript
import { vi } from 'vitest';

vi.mock('@/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// In test
apiClient.post.mockResolvedValue(new Blob(['test']));
```

### Mock Server

For integration tests, use MSW (Mock Service Worker):

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('/api/generate', (req, res, ctx) => {
    return res(ctx.body(new Blob(['mock zip'])));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
```
