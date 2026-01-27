/**
 * PushToGitHubButton - Button to push generated project to GitHub.
 *
 * States:
 * - Not authenticated: Shows connect prompt
 * - No repo selected: Shows repo selector
 * - Ready: Shows push button
 * - Pushing: Shows progress
 * - Success: Shows link to commit
 * - Error: Shows retry option
 */

import { ActionIcon, Button, Group, Popover, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBrandGithub,
  IconCheck,
  IconChevronDown,
  IconExternalLink,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useCallback } from 'react';

import { githubApi, type PushToRepoRequest } from '../../api/githubApi';
import {
  useGitHubActions,
  useGitHubAuthenticated,
  useGitHubPushState,
  useGitHubRepoActions,
  useGitHubSelectedRepo,
} from '../../store/githubStore';
import { RepoSelectorModal } from './RepoSelectorModal';

/** Project configuration for push */
interface ProjectGenerateConfig {
  project: Record<string, unknown>;
  target?: { language: string; framework: string };
  sql: string;
}

interface PushToGitHubButtonProps {
  /** Function that returns the project configuration for generation */
  readonly getProjectConfig: () => ProjectGenerateConfig;
  /** Whether generation is disabled (e.g., no entities) */
  readonly disabled?: boolean;
}

export function PushToGitHubButton({ getProjectConfig, disabled }: PushToGitHubButtonProps) {
  const isAuthenticated = useGitHubAuthenticated();
  const selectedRepo = useGitHubSelectedRepo();
  const { isPushing, lastPushResult } = useGitHubPushState();
  const { setPushing, setPushResult, clearPushResult, setError } = useGitHubActions();
  const { selectRepo } = useGitHubRepoActions();

  const [repoModalOpened, { open: openRepoModal, close: closeRepoModal }] = useDisclosure(false);
  const [popoverOpened, { open: openPopover, close: closePopover }] = useDisclosure(false);

  const handlePush = useCallback(async () => {
    if (!selectedRepo) {
      openRepoModal();
      return;
    }

    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    setPushing(true);
    setError(null);
    clearPushResult();

    try {
      // Get project configuration
      const projectConfig = getProjectConfig();

      // Parse owner/repo from selectedRepo (format: "owner/repo")
      const [owner, repo] = selectedRepo.includes('/')
        ? selectedRepo.split('/')
        : ['', selectedRepo];

      if (!owner) {
        throw new Error('Repository must include owner (e.g., "username/repo-name")');
      }

      // Push to GitHub (uses HttpOnly cookie for auth)
      const request: PushToRepoRequest = {
        owner,
        repo,
        branch: 'main',
        commitMessage: 'Initial commit from APiGen Studio',
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to push to GitHub';
      setPushResult({
        success: false,
        error: message,
      });
      setError(message);
    }
  }, [
    selectedRepo,
    isAuthenticated,
    getProjectConfig,
    setPushing,
    setPushResult,
    clearPushResult,
    setError,
    openRepoModal,
  ]);

  const handleRepoSelect = useCallback(
    (_repoName: string) => {
      closeRepoModal();
      // Auto-trigger push after selecting repo
      // The push will happen on next render when selectedRepo is set
    },
    [closeRepoModal],
  );

  const handleClearRepo = useCallback(() => {
    selectRepo(null);
    closePopover();
  }, [selectRepo, closePopover]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Tooltip label="Connect to GitHub first to push projects">
        <ActionIcon
          variant="default"
          size="lg"
          disabled
          aria-label="Push to GitHub (not connected)"
        >
          <IconBrandGithub size={18} />
        </ActionIcon>
      </Tooltip>
    );
  }

  // Show success state
  if (lastPushResult?.success && lastPushResult.commitUrl) {
    return (
      <Button
        variant="filled"
        color="green"
        size="xs"
        leftSection={<IconCheck size={16} />}
        rightSection={<IconExternalLink size={14} />}
        component="a"
        href={lastPushResult.commitUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={clearPushResult}
      >
        View on GitHub
      </Button>
    );
  }

  // Show error state
  if (lastPushResult?.success === false) {
    return (
      <Group gap="xs">
        <Tooltip label={lastPushResult.error ?? 'Push failed'}>
          <Button
            variant="filled"
            color="red"
            size="xs"
            leftSection={<IconX size={16} />}
            onClick={handlePush}
          >
            Retry Push
          </Button>
        </Tooltip>
        <ActionIcon variant="subtle" size="sm" onClick={clearPushResult} aria-label="Dismiss error">
          <IconX size={14} />
        </ActionIcon>
      </Group>
    );
  }

  // Normal state - show push button with repo selector
  return (
    <>
      <Popover opened={popoverOpened} onClose={closePopover} position="bottom-end" withArrow>
        <Popover.Target>
          <Button.Group>
            <Tooltip label={selectedRepo ? `Push to ${selectedRepo}` : 'Select a repository first'}>
              <Button
                variant="default"
                size="xs"
                leftSection={<IconBrandGithub size={16} />}
                onClick={handlePush}
                loading={isPushing}
                disabled={disabled}
                aria-label={
                  isPushing
                    ? 'Pushing to GitHub...'
                    : selectedRepo
                      ? `Push to ${selectedRepo}`
                      : 'Push to GitHub'
                }
              >
                {selectedRepo ? `Push to ${selectedRepo}` : 'Push to GitHub'}
              </Button>
            </Tooltip>
            <Tooltip label="Select repository">
              <Button
                variant="default"
                size="xs"
                px="xs"
                onClick={openPopover}
                disabled={isPushing || disabled}
                aria-label="Select repository"
              >
                <IconChevronDown size={14} />
              </Button>
            </Tooltip>
          </Button.Group>
        </Popover.Target>

        <Popover.Dropdown>
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Repository
            </Text>
            <Text size="xs" c="dimmed">
              {selectedRepo ?? 'No repository selected'}
            </Text>
            <Group gap="xs">
              <Button
                variant="light"
                size="xs"
                onClick={() => {
                  closePopover();
                  openRepoModal();
                }}
                style={{ flex: 1 }}
              >
                Change Repository
              </Button>
              {selectedRepo && (
                <Tooltip label="Clear repository selection">
                  <Button
                    variant="light"
                    color="red"
                    size="xs"
                    onClick={handleClearRepo}
                    aria-label="Clear repository selection"
                  >
                    <IconTrash size={14} />
                  </Button>
                </Tooltip>
              )}
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>

      <RepoSelectorModal
        opened={repoModalOpened}
        onClose={closeRepoModal}
        onSelect={handleRepoSelect}
      />
    </>
  );
}
