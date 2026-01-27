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
  IconX,
} from '@tabler/icons-react';
import { useCallback } from 'react';

import { githubApi } from '../../api/githubApi';
import {
  useGitHubActions,
  useGitHubAuthenticated,
  useGitHubPushState,
  useGitHubSelectedRepo,
} from '../../store/githubStore';
import { RepoSelectorModal } from './RepoSelectorModal';

interface PushToGitHubButtonProps {
  /** Function that generates the project and returns the ZIP blob */
  readonly generateProjectZip: () => Promise<Blob>;
  /** Whether generation is disabled (e.g., no entities) */
  readonly disabled?: boolean;
}

export function PushToGitHubButton({ generateProjectZip, disabled }: PushToGitHubButtonProps) {
  const isAuthenticated = useGitHubAuthenticated();
  const selectedRepo = useGitHubSelectedRepo();
  const { isPushing, lastPushResult } = useGitHubPushState();
  const { setPushing, setPushResult, clearPushResult, setError } = useGitHubActions();

  const [repoModalOpened, { open: openRepoModal, close: closeRepoModal }] = useDisclosure(false);
  const [popoverOpened, { open: openPopover, close: closePopover }] = useDisclosure(false);

  const handlePush = useCallback(async () => {
    if (!selectedRepo) {
      openRepoModal();
      return;
    }

    setPushing(true);
    setError(null);
    clearPushResult();

    try {
      // First generate the project
      const projectZip = await generateProjectZip();

      // Then push to GitHub
      const result = await githubApi.pushToRepo(selectedRepo, projectZip, {
        commitMessage: 'Initial commit from APiGen Studio',
      });

      setPushResult({
        success: true,
        commitUrl: result.commitUrl,
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
    generateProjectZip,
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
            <Button
              variant="light"
              size="xs"
              onClick={() => {
                closePopover();
                openRepoModal();
              }}
            >
              Change Repository
            </Button>
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
