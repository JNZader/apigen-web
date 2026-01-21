import { Badge, Group, Tabs } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import type { EntityServiceFilter } from '../../store/layoutStore';
import { useEntities, useLayoutActions, useServices } from '../../store/projectStore';

interface EntityServiceTabsProps {
  readonly entityServiceFilter: EntityServiceFilter;
}

export function EntityServiceTabs({ entityServiceFilter }: EntityServiceTabsProps) {
  const entities = useEntities();
  const services = useServices();
  const { setEntityServiceFilter } = useLayoutActions();

  // Reset filter to 'all' if the currently selected service is deleted
  useEffect(() => {
    if (
      entityServiceFilter !== 'all' &&
      entityServiceFilter !== 'unassigned' &&
      !services.some((s) => s.id === entityServiceFilter)
    ) {
      setEntityServiceFilter('all');
    }
  }, [entityServiceFilter, services, setEntityServiceFilter]);

  // Calculate entity counts for each filter option
  const counts = useMemo(() => {
    const entityIdSet = new Set(entities.map((e) => e.id));
    const assignedEntityIds = new Set(services.flatMap((s) => s.entityIds));
    const unassignedCount = entities.filter((e) => !assignedEntityIds.has(e.id)).length;

    const serviceCounts = services.map((service) => {
      const validEntityCount = service.entityIds.filter((id) => entityIdSet.has(id)).length;
      return {
        id: service.id,
        name: service.name,
        color: service.color,
        count: validEntityCount,
      };
    });

    return {
      all: entities.length,
      unassigned: unassignedCount,
      services: serviceCounts,
    };
  }, [entities, services]);

  // Don't render if no services
  if (services.length === 0) {
    return null;
  }

  return (
    <Tabs
      value={entityServiceFilter}
      onChange={(value) => setEntityServiceFilter(value as EntityServiceFilter)}
      variant="pills"
      radius="xl"
    >
      <Tabs.List>
        <Tabs.Tab value="all">
          <Group gap={4} wrap="nowrap">
            <span>All</span>
            <Badge size="xs" variant="light" color="gray" circle>
              {counts.all}
            </Badge>
          </Group>
        </Tabs.Tab>

        {counts.services.map((service) => (
          <Tabs.Tab key={service.id} value={service.id}>
            <Group gap={4} wrap="nowrap">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: service.color,
                  display: 'inline-block',
                }}
              />
              <span>{service.name}</span>
              <Badge size="xs" variant="light" color="gray" circle>
                {service.count}
              </Badge>
            </Group>
          </Tabs.Tab>
        ))}

        <Tabs.Tab value="unassigned">
          <Group gap={4} wrap="nowrap">
            <span>Unassigned</span>
            <Badge size="xs" variant="light" color="gray" circle>
              {counts.unassigned}
            </Badge>
          </Group>
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
