/**
 * API client for GitHub integration.
 * Uses centralized API client with AbortController, retry, and Zod validation.
 */

import { z } from 'zod';

import { API_CONFIG } from '../config/constants';
import { type ApiClient, createApiClient } from './apiClient';

// Use centralized API configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

// Create the API client instance for GitHub endpoints
const apiClient: ApiClient = createApiClient({
  baseUrl: API_BASE_URL,
  timeoutMs: 30000, // 30 seconds for GitHub operations
  maxRetries: 2,
  defaultHeaders: {
    Accept: 'application/json',
  },
});

// ============================================================================
// ZOD SCHEMAS FOR RESPONSE VALIDATION
// ============================================================================

/**
 * GitHub user schema.
 */
export const GitHubUserSchema = z.object({
  login: z.string(),
  avatarUrl: z.string().url(),
  name: z.string().nullable(),
  email: z.string().email().nullable().optional(),
});

/**
 * GitHub repository schema.
 */
export const GitHubRepoSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  private: z.boolean(),
  htmlUrl: z.string().url(),
  description: z.string().nullable().optional(),
  defaultBranch: z.string().optional(),
});

/**
 * GitHub repos list schema.
 */
export const GitHubReposSchema = z.array(GitHubRepoSchema);

/**
 * Create repo response schema.
 */
export const CreateRepoResponseSchema = GitHubRepoSchema;

/**
 * Push response schema.
 */
export const PushResponseSchema = z.object({
  commitUrl: z.string().url(),
  commitSha: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Auth status schema.
 */
export const AuthStatusSchema = z.object({
  authenticated: z.boolean(),
  user: GitHubUserSchema.optional(),
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type GitHubUser = z.infer<typeof GitHubUserSchema>;
export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;
export type CreateRepoResponse = z.infer<typeof CreateRepoResponseSchema>;
export type PushResponse = z.infer<typeof PushResponseSchema>;
export type AuthStatus = z.infer<typeof AuthStatusSchema>;

/**
 * Request to create a new repository.
 */
export interface CreateRepoRequest {
  name: string;
  description?: string;
  private?: boolean;
}

/**
 * Request to push project to repository.
 */
export interface PushToRepoRequest {
  commitMessage?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get the GitHub OAuth authorization URL.
 * Redirects the user to GitHub for authentication.
 */
export function getAuthUrl(): string {
  return `${API_BASE_URL}/api/github/authorize`;
}

/**
 * Check if user is authenticated with GitHub.
 */
export async function checkAuthStatus(signal?: AbortSignal): Promise<AuthStatus> {
  try {
    const user = await getUser(signal);
    return { authenticated: true, user };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Get the authenticated GitHub user info.
 * @throws ApiError if not authenticated (401)
 */
export async function getUser(signal?: AbortSignal): Promise<GitHubUser> {
  const response = await apiClient.get<GitHubUser>('/api/github/user', {
    schema: GitHubUserSchema,
    signal,
    maxRetries: 1,
  });

  return response.data;
}

/**
 * List repositories for the authenticated user.
 * @throws ApiError if not authenticated (401)
 */
export async function getRepos(signal?: AbortSignal): Promise<GitHubRepo[]> {
  const response = await apiClient.get<GitHubRepo[]>('/api/github/repos', {
    schema: GitHubReposSchema,
    signal,
  });

  return response.data;
}

/**
 * Create a new repository for the authenticated user.
 * @throws ApiError if not authenticated (401) or repo already exists (422)
 */
export async function createRepo(
  request: CreateRepoRequest,
  signal?: AbortSignal,
): Promise<CreateRepoResponse> {
  const response = await apiClient.post<CreateRepoResponse>('/api/github/repos', request, {
    schema: CreateRepoResponseSchema,
    signal,
    skipRetry: true, // Don't retry creation (could cause issues)
  });

  return response.data;
}

/**
 * Push a generated project ZIP to a GitHub repository.
 * The project ZIP should be sent as FormData with the file.
 *
 * @param repoName - The name of the repository to push to
 * @param projectZip - The generated project as a Blob
 * @param options - Push options (commit message, etc.)
 * @throws ApiError if not authenticated (401) or push fails
 */
export async function pushToRepo(
  repoName: string,
  projectZip: Blob,
  options?: PushToRepoRequest,
  signal?: AbortSignal,
): Promise<PushResponse> {
  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('file', projectZip, 'project.zip');

  if (options?.commitMessage) {
    formData.append('commitMessage', options.commitMessage);
  }

  // Use fetch directly for FormData (apiClient expects JSON)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for push

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/github/repos/${encodeURIComponent(repoName)}/push`,
      {
        method: 'POST',
        body: formData,
        signal: signal ?? controller.signal,
        credentials: 'include', // Include cookies for auth
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        (errorBody as { message?: string }).message ?? `Push failed: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    return PushResponseSchema.parse(data);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Logout from GitHub (clear session).
 */
export async function logout(signal?: AbortSignal): Promise<void> {
  await apiClient.post('/api/github/logout', undefined, {
    signal,
    maxRetries: 0,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const githubApi = {
  getAuthUrl,
  checkAuthStatus,
  getUser,
  getRepos,
  createRepo,
  pushToRepo,
  logout,
} as const;
