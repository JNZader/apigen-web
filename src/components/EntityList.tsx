import { Badge, Button, Group, NavLink, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconSearch, IconTable } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useEntities, useEntityActions, useSelectedEntityId } from '../store/projectStore';

interface EntityListProps {
  readonly onAddEntity: () => void;
}

export function EntityList({ onAddEntity }: Readonly<EntityListProps>) {
  // Use atomic selectors for better performance
  const entities = useEntities();
  const selectedEntityId = useSelectedEntityId();
  const { selectEntity } = useEntityActions();
  const [search, setSearch] = useState('');

  // Memoize filtered entities to prevent unnecessary recalculations
  const filteredEntities = useMemo(() => {
    if (!search) return entities;
    const searchLower = search.toLowerCase();
    return entities.filter(
      (e) =>
        e.name.toLowerCase().includes(searchLower) ||
        e.tableName.toLowerCase().includes(searchLower),
    );
  }, [entities, search]);

  return (
    <Stack h="100%">
      <Group justify="space-between">
        <Text fw={600}>Entities</Text>
        <Badge size="sm" variant="light">
          {entities.length}
        </Badge>
      </Group>

      <Button
        leftSection={<IconPlus size={16} aria-hidden="true" />}
        onClick={onAddEntity}
        size="sm"
      >
        Add Entity
      </Button>

      {entities.length > 0 && (
        <TextInput
          placeholder="Search entities..."
          leftSection={<IconSearch size={16} aria-hidden="true" />}
          size="xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search entities by name or table name"
        />
      )}

      <ScrollArea style={{ flex: 1 }} aria-label="Entity list">
        {filteredEntities.length === 0 && entities.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" mt="md">
            No entities yet.
            <br />
            Click "Add Entity" to create one.
          </Text>
        )}

        {filteredEntities.length === 0 && entities.length > 0 && (
          <Text size="sm" c="dimmed" ta="center" mt="md" role="status" aria-live="polite">
            No entities match "{search}"
          </Text>
        )}

        {filteredEntities.length > 0 && (
          <Stack gap={4} role="list" aria-label="Available entities">
            {filteredEntities.map((entity) => (
              <NavLink
                key={entity.id}
                label={entity.name}
                description={`${entity.tableName} (${entity.fields.length} fields)`}
                leftSection={<IconTable size={16} aria-hidden="true" />}
                active={selectedEntityId === entity.id}
                onClick={() => selectEntity(entity.id)}
                variant="light"
                role="listitem"
                aria-current={selectedEntityId === entity.id ? 'true' : undefined}
              />
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Stack>
  );
}
