# GitHub Integration - Plan de Implementación

## Resumen

Implementar la funcionalidad de subir proyectos generados directamente a GitHub desde el frontend, utilizando los endpoints existentes en `apigen-server`.

## Endpoints del Backend (Ya Existentes)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/github/authorize` | GET | Inicia flujo OAuth de GitHub |
| `/api/github/callback` | GET | Callback OAuth (maneja el servidor) |
| `/api/github/user` | GET | Obtiene info del usuario autenticado |
| `/api/github/repos` | GET | Lista repositorios del usuario |
| `/api/github/repos` | POST | Crea nuevo repositorio |
| `/api/github/repos/{repo}/push` | POST | Sube proyecto al repositorio |

## Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ GitHubButton │    │ RepoSelector │    │ PushProgress │  │
│  │  (Connect)   │    │   (Modal)    │    │   (Status)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         └───────────────────┴───────────────────┘           │
│                            │                                 │
│                   ┌────────┴────────┐                       │
│                   │  githubStore    │                       │
│                   │   (Zustand)     │                       │
│                   └────────┬────────┘                       │
│                            │                                 │
│                   ┌────────┴────────┐                       │
│                   │   githubApi.ts  │                       │
│                   └────────┬────────┘                       │
│                            │                                 │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (apigen-server:8081)                    │
│                                                              │
│  GitHubController.java ──► GitHubService.java ──► GitHub API│
└─────────────────────────────────────────────────────────────┘
```

## Archivos a Crear/Modificar

### Nuevos Archivos

| Archivo | Descripción |
|---------|-------------|
| `src/api/githubApi.ts` | Cliente API para endpoints de GitHub |
| `src/store/githubStore.ts` | Estado de autenticación y repos |
| `src/components/GitHub/GitHubConnectButton.tsx` | Botón de conexión OAuth |
| `src/components/GitHub/RepoSelectorModal.tsx` | Modal para seleccionar/crear repo |
| `src/components/GitHub/PushToGitHubButton.tsx` | Botón para subir a GitHub |
| `src/components/GitHub/index.ts` | Barrel export |
| `src/hooks/useGitHubPush.ts` | Hook para manejar el push |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/store/index.ts` | Exportar githubStore |
| `src/components/Layout.tsx` | Agregar GitHubConnectButton en header |
| `src/hooks/useProjectGeneration.ts` | Agregar opción de push a GitHub |
| `src/config/constants.ts` | Agregar configuración de GitHub |

## Plan de Commits

| # | Tipo | Descripción |
|---|------|-------------|
| 1 | feat | Add GitHub API client with OAuth and repo endpoints |
| 2 | feat | Add GitHub Zustand store for auth state management |
| 3 | feat | Add GitHubConnectButton component with OAuth flow |
| 4 | feat | Add RepoSelectorModal for repository selection/creation |
| 5 | feat | Add PushToGitHubButton with progress indicator |
| 6 | feat | Add useGitHubPush hook for push logic |
| 7 | feat | Integrate GitHub components into Layout |
| 8 | test | Add unit tests for GitHub components |
| 9 | docs | Update README with GitHub integration docs |

**Total: 9 commits**

---

## Detalles de Implementación

### Commit 1: GitHub API Client

```typescript
// src/api/githubApi.ts
import { apiClient } from './apiClient'

export interface GitHubUser {
  login: string
  avatarUrl: string
  name: string
}

export interface GitHubRepo {
  name: string
  fullName: string
  private: boolean
  htmlUrl: string
}

export interface CreateRepoRequest {
  name: string
  description?: string
  private?: boolean
}

export interface PushRequest {
  projectZip: Blob
  commitMessage?: string
}

export const githubApi = {
  getAuthUrl: () =>
    `${API_BASE_URL}/api/github/authorize`,

  getUser: () =>
    apiClient.get<GitHubUser>('/api/github/user'),

  getRepos: () =>
    apiClient.get<GitHubRepo[]>('/api/github/repos'),

  createRepo: (request: CreateRepoRequest) =>
    apiClient.post<GitHubRepo>('/api/github/repos', request),

  pushToRepo: (repo: string, request: PushRequest) =>
    apiClient.post<{ commitUrl: string }>(`/api/github/repos/${repo}/push`, request),
}
```

### Commit 2: GitHub Store

```typescript
// src/store/githubStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GitHubState {
  isAuthenticated: boolean
  user: GitHubUser | null
  repos: GitHubRepo[]
  selectedRepo: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: GitHubUser | null) => void
  setRepos: (repos: GitHubRepo[]) => void
  selectRepo: (repo: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useGitHubStore = create<GitHubState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      repos: [],
      selectedRepo: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setRepos: (repos) => set({ repos }),
      selectRepo: (selectedRepo) => set({ selectedRepo }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({
        isAuthenticated: false,
        user: null,
        repos: [],
        selectedRepo: null
      }),
    }),
    { name: 'github-storage' }
  )
)
```

### Commit 3: GitHubConnectButton

```typescript
// src/components/GitHub/GitHubConnectButton.tsx
import { Button, Avatar, Menu } from '@mantine/core'
import { IconBrandGithub, IconLogout } from '@tabler/icons-react'
import { useGitHubStore } from '@/store/githubStore'
import { githubApi } from '@/api/githubApi'

export function GitHubConnectButton() {
  const { isAuthenticated, user, logout } = useGitHubStore()

  const handleConnect = () => {
    window.location.href = githubApi.getAuthUrl()
  }

  if (!isAuthenticated) {
    return (
      <Button
        leftSection={<IconBrandGithub size={18} />}
        variant="outline"
        onClick={handleConnect}
      >
        Connect GitHub
      </Button>
    )
  }

  return (
    <Menu>
      <Menu.Target>
        <Button variant="subtle" leftSection={
          <Avatar src={user?.avatarUrl} size="sm" />
        }>
          {user?.login}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          onClick={logout}
        >
          Disconnect
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
```

### Commit 4: RepoSelectorModal

```typescript
// src/components/GitHub/RepoSelectorModal.tsx
import { Modal, Select, TextInput, Button, Stack, Tabs } from '@mantine/core'
import { useState } from 'react'
import { useGitHubStore } from '@/store/githubStore'

interface Props {
  opened: boolean
  onClose: () => void
  onSelect: (repo: string) => void
}

export function RepoSelectorModal({ opened, onClose, onSelect }: Props) {
  const { repos } = useGitHubStore()
  const [newRepoName, setNewRepoName] = useState('')
  const [selectedExisting, setSelectedExisting] = useState<string | null>(null)

  return (
    <Modal opened={opened} onClose={onClose} title="Select Repository">
      <Tabs defaultValue="existing">
        <Tabs.List>
          <Tabs.Tab value="existing">Existing Repo</Tabs.Tab>
          <Tabs.Tab value="new">Create New</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="existing" pt="md">
          <Stack>
            <Select
              label="Repository"
              data={repos.map(r => ({ value: r.name, label: r.fullName }))}
              value={selectedExisting}
              onChange={setSelectedExisting}
            />
            <Button
              disabled={!selectedExisting}
              onClick={() => onSelect(selectedExisting!)}
            >
              Select
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="new" pt="md">
          <Stack>
            <TextInput
              label="Repository Name"
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
            />
            <Button
              disabled={!newRepoName}
              onClick={() => onSelect(newRepoName)}
            >
              Create & Select
            </Button>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  )
}
```

### Commit 5: PushToGitHubButton

```typescript
// src/components/GitHub/PushToGitHubButton.tsx
import { Button, Progress, Text, Stack } from '@mantine/core'
import { IconBrandGithub, IconCheck, IconX } from '@tabler/icons-react'
import { useState } from 'react'

interface Props {
  onPush: () => Promise<string>
  disabled?: boolean
}

type Status = 'idle' | 'pushing' | 'success' | 'error'

export function PushToGitHubButton({ onPush, disabled }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [commitUrl, setCommitUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePush = async () => {
    setStatus('pushing')
    try {
      const url = await onPush()
      setCommitUrl(url)
      setStatus('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Push failed')
      setStatus('error')
    }
  }

  if (status === 'pushing') {
    return (
      <Stack gap="xs">
        <Button loading disabled>Pushing to GitHub...</Button>
        <Progress value={100} animated />
      </Stack>
    )
  }

  if (status === 'success') {
    return (
      <Button
        color="green"
        leftSection={<IconCheck size={18} />}
        component="a"
        href={commitUrl!}
        target="_blank"
      >
        View on GitHub
      </Button>
    )
  }

  if (status === 'error') {
    return (
      <Stack gap="xs">
        <Button color="red" leftSection={<IconX size={18} />} onClick={handlePush}>
          Retry Push
        </Button>
        <Text size="sm" c="red">{error}</Text>
      </Stack>
    )
  }

  return (
    <Button
      leftSection={<IconBrandGithub size={18} />}
      onClick={handlePush}
      disabled={disabled}
    >
      Push to GitHub
    </Button>
  )
}
```

### Commit 6: useGitHubPush Hook

```typescript
// src/hooks/useGitHubPush.ts
import { useCallback, useEffect } from 'react'
import { useGitHubStore } from '@/store/githubStore'
import { githubApi } from '@/api/githubApi'
import { notifications } from '@mantine/notifications'

export function useGitHubPush() {
  const {
    isAuthenticated,
    selectedRepo,
    setUser,
    setRepos,
    setLoading,
    setError
  } = useGitHubStore()

  // Check auth status on mount and after OAuth callback
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await githubApi.getUser()
        setUser(user)
        const repos = await githubApi.getRepos()
        setRepos(repos)
      } catch {
        // Not authenticated, that's OK
      }
    }
    checkAuth()
  }, [])

  const pushToGitHub = useCallback(async (projectZip: Blob, commitMessage?: string) => {
    if (!isAuthenticated || !selectedRepo) {
      throw new Error('Not authenticated or no repo selected')
    }

    setLoading(true)
    setError(null)

    try {
      const result = await githubApi.pushToRepo(selectedRepo, {
        projectZip,
        commitMessage: commitMessage || 'Initial commit from APiGen'
      })

      notifications.show({
        title: 'Success',
        message: 'Project pushed to GitHub',
        color: 'green'
      })

      return result.commitUrl
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Push failed'
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, selectedRepo])

  return {
    isAuthenticated,
    selectedRepo,
    pushToGitHub
  }
}
```

### Commit 7: Integración en Layout

Modificar `Layout.tsx` para agregar:
- GitHubConnectButton en el header
- Opción de "Push to GitHub" junto al botón de "Generate"

---

## Flujo de Usuario

```
1. Usuario diseña su API en el canvas
            │
            ▼
2. Click en "Generate" muestra opciones:
   ┌─────────────────────────────┐
   │  How do you want to export? │
   │                             │
   │  [📥 Download ZIP]          │
   │  [🐙 Push to GitHub]        │  ← Nuevo
   └─────────────────────────────┘
            │
            ▼ (si elige GitHub)
3. Si no está conectado:
   ┌─────────────────────────────┐
   │  Connect to GitHub          │
   │                             │
   │  [🔗 Connect with GitHub]   │
   └─────────────────────────────┘
            │
            ▼ (OAuth popup)
4. Seleccionar repositorio:
   ┌─────────────────────────────┐
   │  Select Repository          │
   │                             │
   │  [Existing ▼] [+ Create]    │
   │  ─────────────────────────  │
   │  my-api-project             │
   │  another-repo               │
   │                             │
   │  [Select]                   │
   └─────────────────────────────┘
            │
            ▼
5. Push en progreso:
   ┌─────────────────────────────┐
   │  Pushing to GitHub...       │
   │  ████████████░░░░ 75%       │
   └─────────────────────────────┘
            │
            ▼
6. Éxito:
   ┌─────────────────────────────┐
   │  ✅ Pushed successfully!    │
   │                             │
   │  [View on GitHub →]         │
   └─────────────────────────────┘
```

---

## Consideraciones Técnicas

### OAuth Flow
1. Frontend redirige a `/api/github/authorize`
2. Backend redirige a GitHub OAuth
3. GitHub redirige a `/api/github/callback`
4. Backend almacena token y redirige de vuelta al frontend
5. Frontend detecta autenticación y carga datos del usuario

### Manejo de Tokens
- El token OAuth se maneja en el backend (no expuesto al frontend)
- El frontend usa cookies/session para mantener la autenticación
- El store de Zustand solo guarda estado de UI, no tokens

### Manejo de Errores
- Rate limit de GitHub API
- Repositorio ya existe
- Permisos insuficientes
- Network errors

---

## Estimación

| Commit | Complejidad | Estimación |
|--------|-------------|------------|
| 1. API Client | Baja | 30 min |
| 2. Store | Baja | 30 min |
| 3. ConnectButton | Media | 45 min |
| 4. RepoSelector | Media | 1 hora |
| 5. PushButton | Media | 45 min |
| 6. Hook | Media | 45 min |
| 7. Integración | Media | 1 hora |
| 8. Tests | Media | 1 hora |
| 9. Docs | Baja | 30 min |

**Total estimado: ~7 horas**

---

## Próximos Pasos

1. ¿Empezamos con el Commit 1 (API Client)?
2. ¿Hay algún ajuste que quieras hacer al plan?
