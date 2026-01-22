import { Badge, Button, Group, NavLink, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconSearch, IconTable } from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef, useState } from 'react';
import { useEntities, useEntityActions, useSelectedEntityId } from '../store/projectStore';

interface EntityListProps {
  readonly onAddEntity: () => void;
}

// Estimated row height for NavLink with description
const ENTITY_ROW_HEIGHT = 56;
// Threshold for enabling virtualization (don't virtualize small lists)
const VIRTUALIZATION_THRESHOLD = 20;

export function EntityList({ onAddEntity }: Readonly<EntityListProps>) {
  // Use atomic selectors for better performance
  const entities = useEntities();
  const selectedEntityId = useSelectedEntityId();
  const { selectEntity } = useEntityActions();
  const [search, setSearch] = useState('');

  // Ref for the scrollable container
  const parentRef = useRef<HTMLDivElement>(null);

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

  // Only use virtualization for large lists
  const shouldVirtualize = filteredEntities.length > VIRTUALIZATION_THRESHOLD;

  // Virtual list configuration
  const virtualizer = useVirtualizer({
    count: filteredEntities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ENTITY_ROW_HEIGHT,
    overscan: 5, // Render 5 extra items above and below visible area
    enabled: shouldVirtualize,
  });

  const virtualItems = virtualizer.getVirtualItems();

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

      {/* Scrollable container */}
      <nav
        ref={parentRef}
        style={{
          flex: 1,
          overflow: 'auto',
          contain: 'strict',
        }}
        aria-label="Entity list"
      >
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

        {filteredEntities.length > 0 && !shouldVirtualize && (
          /* Non-virtualized rendering for small lists */
          <Stack gap={4} aria-label="Available entities">
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

        {filteredEntities.length > 0 && shouldVirtualize && (
          /* Virtualized rendering for large lists */
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualRow) => {
              const entity = filteredEntities[virtualRow.index];
              return (
                <div
                  key={entity.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <NavLink
                    label={entity.name}
                    description={`${entity.tableName} (${entity.fields.length} fields)`}
                    leftSection={<IconTable size={16} aria-hidden="true" />}
                    active={selectedEntityId === entity.id}
                    onClick={() => selectEntity(entity.id)}
                    variant="light"
                    role="listitem"
                    aria-current={selectedEntityId === entity.id ? 'true' : undefined}
                  />
                </div>
              );
            })}
          </div>
        )}
      </nav>
    </Stack>
  );
}
