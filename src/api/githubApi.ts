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
// Uses credentials: 'include' to send HttpOnly cookies automatically
const apiClient: ApiClient = createApiClient({
  baseUrl: API_BASE_URL,
  timeoutMs: 30000, // 30 seconds for GitHub operations
  maxRetries: 2,
  defaultHeaders: {
    Accept: 'application/json',
  },
  credentials: 'include', // Send cookies with requests
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
 * Push response schema (matches backend PushProjectResponse).
 */
export const PushResponseSchema = z.object({
  success: z.boolean(),
  commitSha: z.string().optional(),
  repositoryUrl: z.string().url().optional(),
  branch: z.string().optional(),
  filesCount: z.number().optional(),
  files: z.array(z.string()).optional(),
  error: z.string().optional(),
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
  owner: string;
  repo: string;
  branch?: string;
  commitMessage?: string;
  generateRequest: {
    project: Record<string, unknown>;
    target?: { language: string; framework: string };
    sql: string;
  };
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
 * Check if user is authenticated with GitHub using HttpOnly cookie.
 * No token parameter needed - the cookie is sent automatically.
 * @param signal - Optional abort signal
 */
export async function checkAuthStatus(signal?: AbortSignal): Promise<AuthStatus> {
  try {
    const response = await apiClient.get<{
      authenticated: boolean;
      login?: string;
      avatarUrl?: string;
      name?: string | null;
      email?: string | null;
    }>('/api/github/auth/status', {
      signal,
      maxRetries: 1,
    });

    if (response.data.authenticated && response.data.login) {
      return {
        authenticated: true,
        user: {
          login: response.data.login,
          avatarUrl: response.data.avatarUrl ?? '',
          name: response.data.name ?? null,
          email: response.data.email ?? null,
        },
      };
    }
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Check if user is authenticated with GitHub (legacy - uses token).
 * @deprecated Use checkAuthStatus() without token instead (uses HttpOnly cookie)
 * @param token - Access token to verify
 */
export async function checkAuthStatusWithToken(
  token: string,
  signal?: AbortSignal,
): Promise<AuthStatus> {
  if (!token) {
    return { authenticated: false };
  }
  try {
    const user = await getUserWithToken(token, signal);
    return { authenticated: true, user };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Get the authenticated GitHub user info using HttpOnly cookie.
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
 * Get the authenticated GitHub user info using token (legacy).
 * @deprecated Use getUser() without token instead (uses HttpOnly cookie)
 * @param token - GitHub access token
 * @throws ApiError if not authenticated (401)
 */
export async function getUserWithToken(token: string, signal?: AbortSignal): Promise<GitHubUser> {
  const response = await apiClient.get<GitHubUser>('/api/github/user', {
    schema: GitHubUserSchema,
    signal,
    maxRetries: 1,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

/**
 * List repositories for the authenticated user using HttpOnly cookie.
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
 * Create a new repository for the authenticated user using HttpOnly cookie.
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
 * Push a generated project to a GitHub repository using HttpOnly cookie.
 * Sends the project configuration to the backend, which generates and pushes the files.
 *
 * @param request - Push request with repo info and project configuration
 * @param signal - Optional abort signal
 * @throws ApiError if not authenticated (401) or push fails
 */
export async function pushToRepo(
  request: PushToRepoRequest,
  signal?: AbortSignal,
): Promise<PushResponse> {
  const response = await apiClient.post<PushResponse>('/api/github/push', request, {
    schema: PushResponseSchema,
    signal,
    timeoutMs: 60000, // 60 seconds for push
    skipRetry: true, // Don't retry push (could cause duplicate commits)
  });

  return response.data;
}

/**
 * Logout from GitHub (clears HttpOnly cookie on server).
 */
export async function logout(signal?: AbortSignal): Promise<void> {
  try {
    await apiClient.post('/api/github/logout', undefined, {
      signal,
      maxRetries: 0,
    });
  } catch {
    // Ignore logout errors - cookie may already be cleared
  }
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
