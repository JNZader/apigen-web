/**
 * useGitHubPush - Hook for pushing generated projects to GitHub.
 *
 * This hook manages:
 * - Authentication state checking
 * - Repository selection
 * - Project generation and push
 * - Error handling and notifications
 */

import { useCallback, useEffect } from 'react';

import { githubApi, type PushToRepoRequest } from '../api/githubApi';
import {
  useGitHubActions,
  useGitHubAuthenticated,
  useGitHubSelectedRepo,
} from '../store/githubStore';
import { notify } from '../utils/notifications';

/** Project configuration for push */
export interface ProjectGenerateConfig {
  project: Record<string, unknown>;
  target?: { language: string; framework: string };
  sql: string;
}

interface UseGitHubPushOptions {
  /** Function that returns the project configuration for generation */
  getProjectConfig: () => ProjectGenerateConfig;
  /** Callback when push succeeds */
  onSuccess?: (commitUrl: string) => void;
  /** Callback when push fails */
  onError?: (error: Error) => void;
}

interface UseGitHubPushReturn {
  /** Whether user is authenticated with GitHub */
  isAuthenticated: boolean;
  /** Currently selected repository name */
  selectedRepo: string | null;
  /** Whether a push is in progress */
  isPushing: boolean;
  /** Whether the user can push (authenticated and repo selected) */
  canPush: boolean;
  /** Push the project to the selected repository */
  pushToGitHub: (commitMessage?: string) => Promise<void>;
  /** Refresh the repository list */
  refreshRepos: () => Promise<void>;
  /** Check and refresh authentication status */
  checkAuth: () => Promise<boolean>;
}

export function useGitHubPush({
  getProjectConfig,
  onSuccess,
  onError,
}: UseGitHubPushOptions): UseGitHubPushReturn {
  const isAuthenticated = useGitHubAuthenticated();
  const selectedRepo = useGitHubSelectedRepo();
  const {
    setUser,
    setRepos,
    setLoading,
    setLoadingRepos,
    setPushing,
    setPushResult,
    setError,
    logout,
  } = useGitHubActions();

  // Check authentication on mount using HttpOnly cookie
  useEffect(() => {
    const checkAuthOnMount = async () => {
      if (isAuthenticated) return; // Already authenticated

      try {
        const status = await githubApi.checkAuthStatus();
        if (status.authenticated && status.user) {
          setUser(status.user);
        }
      } catch {
        // Cookie invalid or expired
      }
    };

    checkAuthOnMount();
  }, [isAuthenticated, setUser]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      // Uses HttpOnly cookie for auth
      const status = await githubApi.checkAuthStatus();
      if (status.authenticated && status.user) {
        setUser(status.user);
        // Also fetch repos
        const repos = await githubApi.getRepos();
        setRepos(repos);
        return true;
      }
      logout();
      return false;
    } catch {
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [setUser, setRepos, setLoading, logout]);

  const refreshRepos = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoadingRepos(true);
    setError(null);

    try {
      // Uses HttpOnly cookie for auth
      const repos = await githubApi.getRepos();
      setRepos(repos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch repositories';
      setError(message);
      notify.error({
        title: 'Error',
        message,
      });
    } finally {
      setLoadingRepos(false);
    }
  }, [isAuthenticated, setRepos, setLoadingRepos, setError]);

  const pushToGitHub = useCallback(
    async (commitMessage?: string) => {
      if (!isAuthenticated) {
        notify.warning({
          title: 'Not Connected',
          message: 'Please connect to GitHub first',
        });
        return;
      }

      if (!selectedRepo) {
        notify.warning({
          title: 'No Repository',
          message: 'Please select a repository first',
        });
        return;
      }

      setPushing(true);
      setError(null);

      try {
        // Get project configuration
        const projectConfig = getProjectConfig();

        // Parse owner/repo from selectedRepo (format: "owner/repo" or just "repo")
        const [owner, repo] = selectedRepo.includes('/')
          ? selectedRepo.split('/')
          : ['', selectedRepo];

        if (!owner) {
          throw new Error('Repository must include owner (e.g., "username/repo-name")');
        }

        // Push to GitHub (uses HttpOnly cookie for auth)
        notify.info({
          title: 'Pushing',
          message: `Generating and pushing to ${selectedRepo}...`,
        });

        const request: PushToRepoRequest = {
          owner,
          repo,
          branch: 'main',
          commitMessage: commitMessage ?? 'Initial commit from APiGen Studio',
          generateRequest: projectConfig,
        };

        const result = await githubApi.pushToRepo(request);

        if (!result.success) {
          throw new Error(result.error ?? 'Push failed');
        }

        setPushResult({
          success: true,
          commitUrl: result.repositoryUrl,
        });

        notify.success({
          title: 'Success',
          message: `Project pushed to ${selectedRepo}`,
        });

        onSuccess?.(result.repositoryUrl ?? '');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Push failed');
        const message = err.message;

        setPushResult({
          success: false,
          error: message,
        });
        setError(message);

        notify.error({
          title: 'Push Failed',
          message,
        });

        onError?.(err);
      } finally {
        setPushing(false);
      }
    },
    [
      isAuthenticated,
      selectedRepo,
      getProjectConfig,
      setPushing,
      setPushResult,
      setError,
      onSuccess,
      onError,
    ],
  );

  return {
    isAuthenticated,
    selectedRepo,
    isPushing: false, // Will be updated from store
    canPush: isAuthenticated && selectedRepo !== null,
    pushToGitHub,
    refreshRepos,
    checkAuth,
  };
}
