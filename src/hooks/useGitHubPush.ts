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

import { githubApi } from '../api/githubApi';
import {
  useGitHubAccessToken,
  useGitHubActions,
  useGitHubAuthenticated,
  useGitHubSelectedRepo,
} from '../store/githubStore';
import { notify } from '../utils/notifications';

interface UseGitHubPushOptions {
  /** Function that generates the project and returns a ZIP blob */
  generateProjectZip: () => Promise<Blob>;
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
  generateProjectZip,
  onSuccess,
  onError,
}: UseGitHubPushOptions): UseGitHubPushReturn {
  const isAuthenticated = useGitHubAuthenticated();
  const selectedRepo = useGitHubSelectedRepo();
  const accessToken = useGitHubAccessToken();
  const {
    setAccessToken,
    setUser,
    setRepos,
    setLoading,
    setLoadingRepos,
    setPushing,
    setPushResult,
    setError,
  } = useGitHubActions();

  // Check authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!accessToken) return;

      try {
        const status = await githubApi.checkAuthStatus(accessToken);
        if (status.authenticated && status.user) {
          setUser(status.user);
        } else {
          setAccessToken(null);
        }
      } catch {
        setAccessToken(null);
      }
    };

    if (!isAuthenticated && accessToken) {
      checkAuthStatus();
    }
  }, [isAuthenticated, accessToken, setUser, setAccessToken]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (!accessToken) return false;

    setLoading(true);
    try {
      const status = await githubApi.checkAuthStatus(accessToken);
      if (status.authenticated && status.user) {
        setUser(status.user);
        // Also fetch repos
        const repos = await githubApi.getRepos(accessToken);
        setRepos(repos);
        return true;
      }
      setAccessToken(null);
      return false;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [accessToken, setAccessToken, setUser, setRepos, setLoading]);

  const refreshRepos = useCallback(async () => {
    if (!isAuthenticated || !accessToken) return;

    setLoadingRepos(true);
    setError(null);

    try {
      const repos = await githubApi.getRepos(accessToken);
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
  }, [isAuthenticated, accessToken, setRepos, setLoadingRepos, setError]);

  const pushToGitHub = useCallback(
    async (commitMessage?: string) => {
      if (!isAuthenticated || !accessToken) {
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
        // Generate the project ZIP
        notify.info({
          title: 'Generating',
          message: 'Generating project...',
        });

        const projectZip = await generateProjectZip();

        // Push to GitHub
        notify.info({
          title: 'Pushing',
          message: `Pushing to ${selectedRepo}...`,
        });

        const result = await githubApi.pushToRepo(accessToken, selectedRepo, projectZip, {
          commitMessage: commitMessage ?? 'Initial commit from APiGen Studio',
        });

        setPushResult({
          success: true,
          commitUrl: result.commitUrl,
        });

        notify.success({
          title: 'Success',
          message: `Project pushed to ${selectedRepo}`,
        });

        onSuccess?.(result.commitUrl);
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
      accessToken,
      selectedRepo,
      generateProjectZip,
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
