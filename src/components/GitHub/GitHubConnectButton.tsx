/**
 * GitHubConnectButton - Button to connect/disconnect from GitHub.
 *
 * Shows:
 * - "Connect GitHub" button when not authenticated
 * - User avatar and menu when authenticated
 */

import { Avatar, Button, Menu, Text, Tooltip } from '@mantine/core';
import { IconBrandGithub, IconLogout, IconRefresh } from '@tabler/icons-react';
import { useCallback, useEffect } from 'react';

import { githubApi } from '../../api/githubApi';
import {
  useGitHubAccessToken,
  useGitHubActions,
  useGitHubConnectionStatus,
} from '../../store/githubStore';
import { notify } from '../../utils/notifications';

export function GitHubConnectButton() {
  const { isAuthenticated, user, isLoading } = useGitHubConnectionStatus();
  const accessToken = useGitHubAccessToken();
  const { setAccessToken, setUser, setRepos, setLoading, setLoadingRepos, setError, logout } =
    useGitHubActions();

  // Capture token from URL hash on mount (after OAuth redirect)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('github_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('github_token');
      if (token) {
        setAccessToken(token);
        // Clean up URL
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        notify.success({
          title: 'Connected',
          message: 'Successfully connected to GitHub',
        });
      }
    }

    // Check for errors in query params
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('github_error');
    if (error) {
      notify.error({
        title: 'GitHub Error',
        message: decodeURIComponent(error),
      });
      // Clean up URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [setAccessToken]);

  // Check authentication status on mount or when token changes
  useEffect(() => {
    const checkAuth = async () => {
      if (!accessToken) {
        return;
      }

      setLoading(true);
      try {
        const status = await githubApi.checkAuthStatus(accessToken);
        if (status.authenticated && status.user) {
          setUser(status.user);
          // Also fetch repos
          setLoadingRepos(true);
          try {
            const repos = await githubApi.getRepos(accessToken);
            setRepos(repos);
          } catch {
            // Failed to fetch repos, but user is still authenticated
          } finally {
            setLoadingRepos(false);
          }
        } else {
          // Token invalid, clear it
          setAccessToken(null);
        }
      } catch {
        // Token invalid, clear it
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [accessToken, setAccessToken, setUser, setRepos, setLoading, setLoadingRepos]);

  const handleConnect = useCallback(() => {
    // Redirect to GitHub OAuth
    window.location.href = githubApi.getAuthUrl();
  }, []);

  const handleRefreshRepos = useCallback(async () => {
    if (!accessToken) return;

    setLoadingRepos(true);
    setError(null);
    try {
      const repos = await githubApi.getRepos(accessToken);
      setRepos(repos);
      notify.success({
        title: 'Refreshed',
        message: 'Repository list updated',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh repositories';
      setError(message);
      notify.error({
        title: 'Error',
        message,
      });
    } finally {
      setLoadingRepos(false);
    }
  }, [accessToken, setRepos, setLoadingRepos, setError]);

  const handleLogout = useCallback(async () => {
    try {
      await githubApi.logout();
    } catch {
      // Ignore logout errors
    }
    logout();
    notify.info({
      title: 'Disconnected',
      message: 'Disconnected from GitHub',
    });
  }, [logout]);

  // Not authenticated - show connect button
  if (!isAuthenticated) {
    return (
      <Tooltip label="Connect to GitHub to push projects">
        <Button
          variant="default"
          size="xs"
          leftSection={<IconBrandGithub size={16} />}
          onClick={handleConnect}
          loading={isLoading}
          aria-label="Connect to GitHub"
        >
          GitHub
        </Button>
      </Tooltip>
    );
  }

  // Authenticated - show user menu
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label={`Connected as ${user?.login}`}>
          <Button
            variant="subtle"
            size="xs"
            leftSection={
              <Avatar
                src={user?.avatarUrl}
                size="xs"
                radius="xl"
                alt={user?.login ?? 'GitHub user'}
              />
            }
            aria-label={`GitHub menu for ${user?.login}`}
            aria-haspopup="menu"
          >
            <Text size="xs" truncate maw={80}>
              {user?.login}
            </Text>
          </Button>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>GitHub</Menu.Label>
        <Menu.Item leftSection={<IconRefresh size={14} />} onClick={handleRefreshRepos}>
          Refresh Repositories
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={handleLogout}>
          Disconnect
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
