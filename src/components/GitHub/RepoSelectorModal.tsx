/**
 * RepoSelectorModal - Modal for selecting or creating a GitHub repository.
 *
 * Features:
 * - Select from existing repositories
 * - Create a new repository
 * - Search/filter repositories
 */

import {
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  Radio,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';

import { githubApi } from '../../api/githubApi';
import { useGitHubActions, useGitHubRepoSelector } from '../../store/githubStore';
import { notify } from '../../utils/notifications';

interface RepoSelectorModalProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onSelect: (repoName: string) => void;
}

export function RepoSelectorModal({ opened, onClose, onSelect }: RepoSelectorModalProps) {
  const { repos, selectedRepo, isLoadingRepos, selectRepo } = useGitHubRepoSelector();
  const { setRepos, setError } = useGitHubActions();

  // Local state for the modal
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [localSelection, setLocalSelection] = useState<string | null>(selectedRepo);

  // Filter repos by search query
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const query = searchQuery.toLowerCase();
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) || repo.fullName.toLowerCase().includes(query),
    );
  }, [repos, searchQuery]);

  const handleCreateRepo = useCallback(async () => {
    if (!newRepoName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      // Uses HttpOnly cookie for auth
      const newRepo = await githubApi.createRepo({
        name: newRepoName.trim(),
        private: newRepoPrivate,
      });

      // Add to repos list
      setRepos([newRepo, ...repos]);

      // Select the new repo
      setLocalSelection(newRepo.name);

      notify.success({
        title: 'Repository Created',
        message: `Created ${newRepo.fullName}`,
      });

      // Switch to select mode
      setMode('select');
      setNewRepoName('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create repository';
      setError(message);
      notify.error({
        title: 'Error',
        message,
      });
    } finally {
      setIsCreating(false);
    }
  }, [newRepoName, newRepoPrivate, repos, setRepos, setError]);

  const handleConfirm = useCallback(() => {
    if (localSelection) {
      selectRepo(localSelection);
      onSelect(localSelection);
      onClose();
    }
  }, [localSelection, selectRepo, onSelect, onClose]);

  const handleClose = useCallback(() => {
    // Reset local state
    setMode('select');
    setSearchQuery('');
    setNewRepoName('');
    setLocalSelection(selectedRepo);
    onClose();
  }, [selectedRepo, onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Select Repository"
      size="md"
      aria-label="Select GitHub repository"
    >
      <Stack gap="md">
        {/* Mode toggle */}
        <Radio.Group value={mode} onChange={(value) => setMode(value as 'select' | 'create')}>
          <Group>
            <Radio value="select" label="Select existing" />
            <Radio value="create" label="Create new" />
          </Group>
        </Radio.Group>

        {mode === 'select' ? (
          <>
            {/* Search input */}
            <TextInput
              placeholder="Search repositories..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search repositories"
            />

            {/* Repository list */}
            {isLoadingRepos ? (
              <Group justify="center" py="xl">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Loading repositories...
                </Text>
              </Group>
            ) : filteredRepos.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                {searchQuery ? 'No repositories match your search' : 'No repositories found'}
              </Text>
            ) : (
              <ScrollArea h={250}>
                <Radio.Group value={localSelection ?? ''} onChange={setLocalSelection}>
                  <Stack gap="xs">
                    {filteredRepos.map((repo) => (
                      <Radio
                        key={repo.name}
                        value={repo.name}
                        label={
                          <Group gap="xs">
                            <Text size="sm" fw={500}>
                              {repo.name}
                            </Text>
                            {repo.private && (
                              <Text size="xs" c="dimmed">
                                (private)
                              </Text>
                            )}
                          </Group>
                        }
                        description={repo.description ?? repo.fullName}
                      />
                    ))}
                  </Stack>
                </Radio.Group>
              </ScrollArea>
            )}
          </>
        ) : (
          <>
            {/* Create new repo form */}
            <TextInput
              label="Repository name"
              placeholder="my-awesome-api"
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
              required
              aria-label="New repository name"
            />

            <Checkbox
              label="Make repository private"
              checked={newRepoPrivate}
              onChange={(e) => setNewRepoPrivate(e.target.checked)}
            />

            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateRepo}
              loading={isCreating}
              disabled={!newRepoName.trim()}
            >
              Create Repository
            </Button>
          </>
        )}

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!localSelection || mode === 'create'}>
            Select
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
