/**
 * GitHub Store - Manages GitHub authentication state and repository selection.
 *
 * This store handles:
 * - OAuth authentication status
 * - User information
 * - Repository list and selection
 * - Push operation state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';

import type { GitHubRepo, GitHubUser } from '../api/githubApi';

// ============================================================================
// Store Interface
// ============================================================================

interface GitHubState {
  // Authentication state
  // Note: Access token is now stored in HttpOnly cookie, not in state
  isAuthenticated: boolean;
  user: GitHubUser | null;

  // Repository state
  repos: GitHubRepo[];
  selectedRepo: string | null;

  // Loading and error state
  isLoading: boolean;
  isLoadingRepos: boolean;
  isPushing: boolean;
  error: string | null;

  // Last push result
  lastPushResult: {
    success: boolean;
    commitUrl?: string;
    error?: string;
    timestamp: number;
  } | null;

  // Actions
  setUser: (user: GitHubUser | null) => void;
  setRepos: (repos: GitHubRepo[]) => void;
  selectRepo: (repoName: string | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingRepos: (loading: boolean) => void;
  setPushing: (pushing: boolean) => void;
  setError: (error: string | null) => void;
  setPushResult: (result: { success: boolean; commitUrl?: string; error?: string }) => void;
  clearPushResult: () => void;
  logout: () => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  isAuthenticated: false,
  user: null,
  // Note: accessToken removed - now stored in HttpOnly cookie
  repos: [],
  selectedRepo: null,
  isLoading: false,
  isLoadingRepos: false,
  isPushing: false,
  error: null,
  lastPushResult: null,
};

// ============================================================================
// Store
// ============================================================================

export const useGitHubStore = create<GitHubState>()(
  persist(
    (set) => ({
      ...initialState,

      /**
       * Sets the authenticated user. If user is null, clears authentication.
       * Note: Token is now stored in HttpOnly cookie, not in state.
       * @param user - The GitHub user or null
       */
      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          error: null,
        }),

      /**
       * Sets the list of repositories for the authenticated user.
       * @param repos - Array of GitHub repositories
       */
      setRepos: (repos) => set({ repos }),

      /**
       * Selects a repository by name for pushing.
       * @param repoName - The repository name or null to deselect
       */
      selectRepo: (repoName) => set({ selectedRepo: repoName }),

      /**
       * Sets the general loading state (for auth operations).
       * @param loading - Whether loading is in progress
       */
      setLoading: (loading) => set({ isLoading: loading }),

      /**
       * Sets the repos loading state.
       * @param loading - Whether repos are being loaded
       */
      setLoadingRepos: (loading) => set({ isLoadingRepos: loading }),

      /**
       * Sets the pushing state.
       * @param pushing - Whether a push is in progress
       */
      setPushing: (pushing) => set({ isPushing: pushing }),

      /**
       * Sets an error message.
       * @param error - The error message or null to clear
       */
      setError: (error) => set({ error }),

      /**
       * Sets the result of the last push operation.
       * @param result - The push result with success status and optional URL/error
       */
      setPushResult: (result) =>
        set({
          lastPushResult: {
            ...result,
            timestamp: Date.now(),
          },
          isPushing: false,
        }),

      /**
       * Clears the last push result.
       */
      clearPushResult: () => set({ lastPushResult: null }),

      /**
       * Logs out the user, clearing authentication but preserving selected repo preference.
       * Note: HttpOnly cookie is cleared by the server via /api/github/logout endpoint.
       */
      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          repos: [],
          error: null,
          lastPushResult: null,
        }),

      /**
       * Resets the entire store to initial state.
       */
      reset: () => set(initialState),
    }),
    {
      name: 'apigen-github',
      // Only persist selected repo preference
      // Note: Token is now in HttpOnly cookie (handled by browser)
      partialize: (state) => ({
        selectedRepo: state.selectedRepo,
        // Don't persist: user, repos (will be re-fetched on load via cookie auth)
        // Don't persist: isLoading, isPushing, error, lastPushResult (transient)
      }),
    },
  ),
);

// ============================================================================
// Atomic Selectors
// ============================================================================

/**
 * Selector for authentication status.
 * @returns Whether the user is authenticated with GitHub
 */
export const useGitHubAuthenticated = () => useGitHubStore((state) => state.isAuthenticated);

/**
 * Selector for the authenticated user.
 * @returns The GitHub user or null
 */
export const useGitHubUser = () => useGitHubStore((state) => state.user);

// Note: useGitHubAccessToken removed - token is now in HttpOnly cookie

/**
 * Selector for the repository list.
 * @returns Array of GitHub repositories
 */
export const useGitHubRepos = () => useGitHubStore((state) => state.repos);

/**
 * Selector for the selected repository name.
 * @returns The selected repository name or null
 */
export const useGitHubSelectedRepo = () => useGitHubStore((state) => state.selectedRepo);

/**
 * Selector for loading state.
 * @returns Whether any GitHub operation is loading
 */
export const useGitHubLoading = () =>
  useGitHubStore((state) => state.isLoading || state.isLoadingRepos);

/**
 * Selector for push in progress state.
 * @returns Whether a push is in progress
 */
export const useGitHubPushing = () => useGitHubStore((state) => state.isPushing);

/**
 * Selector for error state.
 * @returns The current error message or null
 */
export const useGitHubError = () => useGitHubStore((state) => state.error);

/**
 * Selector for the last push result.
 * @returns The last push result or null
 */
export const useGitHubPushResult = () => useGitHubStore((state) => state.lastPushResult);

// ============================================================================
// Action Selectors
// ============================================================================

/**
 * Selector for GitHub authentication actions.
 * @returns Object containing setUser and logout actions
 */
export const useGitHubAuthActions = () =>
  useGitHubStore(
    useShallow((state) => ({
      setUser: state.setUser,
      logout: state.logout,
    })),
  );

/**
 * Selector for GitHub repository actions.
 * @returns Object containing setRepos and selectRepo actions
 */
export const useGitHubRepoActions = () =>
  useGitHubStore(
    useShallow((state) => ({
      setRepos: state.setRepos,
      selectRepo: state.selectRepo,
    })),
  );

/**
 * Selector for GitHub loading actions.
 * @returns Object containing loading state setters
 */
export const useGitHubLoadingActions = () =>
  useGitHubStore(
    useShallow((state) => ({
      setLoading: state.setLoading,
      setLoadingRepos: state.setLoadingRepos,
      setPushing: state.setPushing,
    })),
  );

/**
 * Selector for GitHub push actions.
 * @returns Object containing push-related actions
 */
export const useGitHubPushActions = () =>
  useGitHubStore(
    useShallow((state) => ({
      setPushing: state.setPushing,
      setPushResult: state.setPushResult,
      clearPushResult: state.clearPushResult,
    })),
  );

/**
 * Selector for all GitHub actions (for components that need everything).
 * @returns Object containing all GitHub actions
 */
export const useGitHubActions = () =>
  useGitHubStore(
    useShallow((state) => ({
      setUser: state.setUser,
      setRepos: state.setRepos,
      selectRepo: state.selectRepo,
      setLoading: state.setLoading,
      setLoadingRepos: state.setLoadingRepos,
      setPushing: state.setPushing,
      setError: state.setError,
      setPushResult: state.setPushResult,
      clearPushResult: state.clearPushResult,
      logout: state.logout,
      reset: state.reset,
    })),
  );

// ============================================================================
// Combined Selectors
// ============================================================================

/**
 * Selector for GitHub connection status (for header display).
 * @returns Object with authentication status, user, and loading state
 */
export const useGitHubConnectionStatus = () =>
  useGitHubStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      isLoading: state.isLoading,
    })),
  );

/**
 * Selector for repository selection modal data.
 * @returns Object with repos, selected repo, loading, and actions
 */
export const useGitHubRepoSelector = () =>
  useGitHubStore(
    useShallow((state) => ({
      repos: state.repos,
      selectedRepo: state.selectedRepo,
      isLoadingRepos: state.isLoadingRepos,
      selectRepo: state.selectRepo,
    })),
  );

/**
 * Selector for push button state.
 * @returns Object with push-related state and actions
 */
export const useGitHubPushState = () =>
  useGitHubStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      selectedRepo: state.selectedRepo,
      isPushing: state.isPushing,
      lastPushResult: state.lastPushResult,
      error: state.error,
    })),
  );
