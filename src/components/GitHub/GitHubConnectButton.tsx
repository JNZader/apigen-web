/**
 * GitHubConnectButton - Button to connect/disconnect from GitHub.
 *
 * Shows:
 * - "Connect GitHub" button when not authenticated
 * - User avatar and menu when authenticated
 *
 * Uses HttpOnly cookies for secure token storage (token never exposed to JS).
 */

import { Avatar, Button, Menu, Text, Tooltip } from '@mantine/core';
import { IconBrandGithub, IconLogout, IconRefresh } from '@tabler/icons-react';
import { useCallback, useEffect, useRef } from 'react';

import { githubApi } from '../../api/githubApi';
import { useGitHubActions, useGitHubConnectionStatus } from '../../store/githubStore';
import { notify } from '../../utils/notifications';

export function GitHubConnectButton() {
  const { isAuthenticated, user, isLoading } = useGitHubConnectionStatus();
  const { setUser, setRepos, setLoading, setLoadingRepos, setError, logout } = useGitHubActions();
  const hasCheckedAuth = useRef(false);

  // Check for OAuth success/error in URL params on mount (after OAuth redirect)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Check for successful auth (redirected from backend with cookie set)
    if (searchParams.get('github_auth') === 'success') {
      // Clean up URL first
      window.history.replaceState(null, '', window.location.pathname);
      notify.success({
        title: 'Connected',
        message: 'Successfully connected to GitHub',
      });
    }

    // Check for errors in query params
    const error = searchParams.get('github_error');
    if (error) {
      notify.error({
        title: 'GitHub Error',
        message: decodeURIComponent(error),
      });
      // Clean up URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Check authentication status on mount using HttpOnly cookie
  useEffect(() => {
    // Only check once on mount to avoid infinite loops
    if (hasCheckedAuth.current) {
      return;
    }
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      setLoading(true);
      try {
        // This will use the HttpOnly cookie automatically
        const status = await githubApi.checkAuthStatus();
        if (status.authenticated && status.user) {
          setUser(status.user);
          // Also fetch repos
          setLoadingRepos(true);
          try {
            const repos = await githubApi.getRepos();
            setRepos(repos);
          } catch {
            // Failed to fetch repos, but user is still authenticated
          } finally {
            setLoadingRepos(false);
          }
        } else {
          // Not authenticated (no valid cookie)
          setUser(null);
        }
      } catch {
        // Auth check failed
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setRepos, setLoading, setLoadingRepos]);

  const handleConnect = useCallback(() => {
    // Redirect to GitHub OAuth
    window.location.href = githubApi.getAuthUrl();
  }, []);

  const handleRefreshRepos = useCallback(async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const repos = await githubApi.getRepos();
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
  }, [setRepos, setLoadingRepos, setError]);

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
