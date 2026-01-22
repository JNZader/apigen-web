import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconCloud,
  IconCube,
  IconDatabase,
  IconNetwork,
  IconServer,
  IconSettings,
  IconShield,
} from '@tabler/icons-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useRef, useState } from 'react';
import { useEntities, useServiceActions, useServices } from '../store/projectStore';
import type { ServiceConfig, ServiceDatabaseType, ServiceDiscoveryType } from '../types';

// Estimated row height for entity checkbox items
const ENTITY_ROW_HEIGHT = 72;
// Threshold for enabling virtualization
const VIRTUALIZATION_THRESHOLD = 15;

interface ServiceConfigPanelProps {
  serviceId: string | null;
  opened: boolean;
  onClose: () => void;
}

const DATABASE_OPTIONS: Array<{ value: ServiceDatabaseType; label: string }> = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'redis', label: 'Redis' },
  { value: 'h2', label: 'H2 (In-Memory)' },
];

const SERVICE_DISCOVERY_OPTIONS: Array<{ value: ServiceDiscoveryType; label: string }> = [
  { value: 'NONE', label: 'None' },
  { value: 'EUREKA', label: 'Netflix Eureka' },
  { value: 'CONSUL', label: 'HashiCorp Consul' },
  { value: 'KUBERNETES', label: 'Kubernetes' },
];

// Helper function to get entity description (avoids nested ternary)
function getEntityDescription(
  otherServiceName: string | null,
  tableName: string | undefined,
): string | undefined {
  if (otherServiceName) {
    return `Currently assigned to ${otherServiceName}`;
  }
  if (tableName) {
    return `Table: ${tableName}`;
  }
  return undefined;
}

export function ServiceConfigPanel({
  serviceId,
  opened,
  onClose,
}: Readonly<ServiceConfigPanelProps>) {
  const services = useServices();
  const entities = useEntities();
  const { updateService, assignEntityToService, removeEntityFromService } = useServiceActions();

  const service = services.find((s) => s.id === serviceId);

  // Get entities assigned to other services (to show which are already taken)
  const getEntityServiceName = useCallback(
    (entityId: string): string | null => {
      for (const s of services) {
        if (s.id !== serviceId && s.entityIds.includes(entityId)) {
          return s.name;
        }
      }
      return null;
    },
    [services, serviceId],
  );

  // Ref for the scrollable container (virtualization)
  const parentRef = useRef<HTMLDivElement>(null);

  // Initialize state directly from service - use key prop at usage site to reset
  const [name, setName] = useState(service?.name ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [config, setConfig] = useState<ServiceConfig>(
    service?.config ?? {
      port: 8080,
      contextPath: '/api',
      databaseType: 'postgresql',
      generateDocker: true,
      generateDockerCompose: true,
      enableServiceDiscovery: false,
      serviceDiscoveryType: 'NONE',
      enableCircuitBreaker: true,
      enableRateLimiting: true,
      enableTracing: true,
      enableMetrics: true,
    },
  );

  const handleSave = () => {
    if (serviceId && name.trim()) {
      updateService(serviceId, {
        name: name.trim(),
        description: description.trim() || undefined,
        config,
      });
      onClose();
    }
  };

  const updateConfig = <K extends keyof ServiceConfig>(key: K, value: ServiceConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Handle entity assignment toggle
  const handleEntityToggle = (entityId: string, checked: boolean) => {
    if (!serviceId) return;
    if (checked) {
      assignEntityToService(entityId, serviceId);
    } else {
      removeEntityFromService(entityId, serviceId);
    }
  };

  // Only use virtualization for large entity lists
  const shouldVirtualize = entities.length > VIRTUALIZATION_THRESHOLD;

  // Virtual list configuration for entity checkboxes
  const virtualizer = useVirtualizer({
    count: entities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ENTITY_ROW_HEIGHT,
    overscan: 3,
    enabled: shouldVirtualize,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (!service) return null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconServer size={20} />
          <Title order={4}>Configure Service</Title>
        </Group>
      }
      position="right"
      size="lg"
      padding="lg"
    >
      <Stack gap="md">
        {/* Service Basic Info */}
        <Stack gap="xs">
          <TextInput
            label="Service Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="e.g., OrderService"
          />
          <TextInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            placeholder="Brief description of the service"
          />
          <Group gap="xs">
            <Badge color={service.color} size="lg">
              {service.entityIds.length} entities
            </Badge>
          </Group>
        </Stack>

        <Divider />

        <Tabs defaultValue="entities">
          <Tabs.List>
            <Tabs.Tab value="entities" leftSection={<IconCube size={14} />}>
              Entities
            </Tabs.Tab>
            <Tabs.Tab value="general" leftSection={<IconSettings size={14} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab value="database" leftSection={<IconDatabase size={14} />}>
              Database
            </Tabs.Tab>
            <Tabs.Tab value="discovery" leftSection={<IconCloud size={14} />}>
              Discovery
            </Tabs.Tab>
            <Tabs.Tab value="resilience" leftSection={<IconShield size={14} />}>
              Resilience
            </Tabs.Tab>
            <Tabs.Tab value="docker" leftSection={<IconNetwork size={14} />}>
              Docker
            </Tabs.Tab>
          </Tabs.List>

          {/* Entities Tab */}
          <Tabs.Panel value="entities" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Select which entities belong to this service. Each entity can only belong to one
                service.
              </Text>

              {entities.length === 0 ? (
                <Box
                  p="xl"
                  style={{
                    textAlign: 'center',
                    border: '1px dashed var(--mantine-color-gray-4)',
                    borderRadius: 'var(--mantine-radius-md)',
                  }}
                >
                  <IconCube size={32} style={{ opacity: 0.5 }} />
                  <Text size="sm" c="dimmed" mt="sm">
                    No entities created yet. Create entities in the Entities view first.
                  </Text>
                </Box>
              ) : (
                /* Scrollable container for entity list */
                <div
                  ref={parentRef}
                  style={{
                    maxHeight: 300,
                    overflow: 'auto',
                    contain: 'strict',
                  }}
                >
                  {/* Non-virtualized rendering for small lists */}
                  {!shouldVirtualize && (
                    <Stack gap="xs">
                      {entities.map((entity) => {
                        const isAssigned = service.entityIds.includes(entity.id);
                        const otherServiceName = getEntityServiceName(entity.id);

                        return (
                          <Box
                            key={entity.id}
                            p="sm"
                            style={{
                              border: '1px solid var(--mantine-color-default-border)',
                              borderRadius: 'var(--mantine-radius-sm)',
                              backgroundColor: isAssigned
                                ? 'var(--mantine-color-blue-light)'
                                : undefined,
                            }}
                          >
                            <Group justify="space-between">
                              <Checkbox
                                label={
                                  <Group gap="xs">
                                    <Text fw={500}>{entity.name}</Text>
                                    <Badge size="xs" variant="light" color="gray">
                                      {entity.fields.length} fields
                                    </Badge>
                                  </Group>
                                }
                                checked={isAssigned}
                                onChange={(e) =>
                                  handleEntityToggle(entity.id, e.currentTarget.checked)
                                }
                                description={getEntityDescription(otherServiceName, entity.tableName)}
                              />
                            </Group>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}

                  {/* Virtualized rendering for large lists */}
                  {shouldVirtualize && (
                    <div
                      style={{
                        height: virtualizer.getTotalSize(),
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {virtualItems.map((virtualRow) => {
                        const entity = entities[virtualRow.index];
                        const isAssigned = service.entityIds.includes(entity.id);
                        const otherServiceName = getEntityServiceName(entity.id);

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
                            <Box
                              p="sm"
                              style={{
                                border: '1px solid var(--mantine-color-default-border)',
                                borderRadius: 'var(--mantine-radius-sm)',
                                backgroundColor: isAssigned
                                  ? 'var(--mantine-color-blue-light)'
                                  : undefined,
                                height: '100%',
                                boxSizing: 'border-box',
                              }}
                            >
                              <Group justify="space-between">
                                <Checkbox
                                  label={
                                    <Group gap="xs">
                                      <Text fw={500}>{entity.name}</Text>
                                      <Badge size="xs" variant="light" color="gray">
                                        {entity.fields.length} fields
                                      </Badge>
                                    </Group>
                                  }
                                  checked={isAssigned}
                                  onChange={(e) =>
                                    handleEntityToggle(entity.id, e.currentTarget.checked)
                                  }
                                  description={getEntityDescription(otherServiceName, entity.tableName)}
                                />
                              </Group>
                            </Box>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Text size="xs" c="dimmed">
                Tip: Assigning an entity to this service will automatically remove it from any other
                service.
              </Text>
            </Stack>
          </Tabs.Panel>

          {/* General Tab */}
          <Tabs.Panel value="general" pt="md">
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Port"
                    value={config.port}
                    onChange={(val) => updateConfig('port', Number(val) || 8080)}
                    min={1}
                    max={65535}
                    description="HTTP port for the service"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Context Path"
                    value={config.contextPath}
                    onChange={(e) => updateConfig('contextPath', e.currentTarget.value)}
                    placeholder="/api"
                    description="Base path for REST endpoints"
                  />
                </Grid.Col>
              </Grid>

              <Divider label="Observability" labelPosition="left" />

              <Grid>
                <Grid.Col span={6}>
                  <Checkbox
                    label="Enable Tracing"
                    description="Distributed tracing with Micrometer"
                    checked={config.enableTracing}
                    onChange={(e) => updateConfig('enableTracing', e.currentTarget.checked)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Checkbox
                    label="Enable Metrics"
                    description="Prometheus metrics endpoint"
                    checked={config.enableMetrics}
                    onChange={(e) => updateConfig('enableMetrics', e.currentTarget.checked)}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          {/* Database Tab */}
          <Tabs.Panel value="database" pt="md">
            <Stack gap="md">
              <Select
                label="Database Type"
                value={config.databaseType}
                onChange={(val) =>
                  updateConfig('databaseType', (val as ServiceDatabaseType) || 'postgresql')
                }
                data={DATABASE_OPTIONS}
                description="Database engine for this service"
              />

              <Text size="sm" c="dimmed">
                Each service can have its own database type in a microservices architecture. This
                enables polyglot persistence where each service uses the database best suited for
                its data model.
              </Text>
            </Stack>
          </Tabs.Panel>

          {/* Service Discovery Tab */}
          <Tabs.Panel value="discovery" pt="md">
            <Stack gap="md">
              <Checkbox
                label="Enable Service Discovery"
                description="Register service with a discovery server"
                checked={config.enableServiceDiscovery}
                onChange={(e) => updateConfig('enableServiceDiscovery', e.currentTarget.checked)}
              />

              {config.enableServiceDiscovery && (
                <Select
                  label="Discovery Type"
                  value={config.serviceDiscoveryType}
                  onChange={(val) =>
                    updateConfig('serviceDiscoveryType', (val as ServiceDiscoveryType) || 'EUREKA')
                  }
                  data={SERVICE_DISCOVERY_OPTIONS}
                  description="Service registry to use"
                />
              )}

              <Text size="sm" c="dimmed">
                Service discovery enables automatic detection and load balancing between
                microservices without hardcoded URLs.
              </Text>
            </Stack>
          </Tabs.Panel>

          {/* Resilience Tab */}
          <Tabs.Panel value="resilience" pt="md">
            <Stack gap="md">
              <Checkbox
                label="Enable Circuit Breaker"
                description="Resilience4j circuit breaker for fault tolerance"
                checked={config.enableCircuitBreaker}
                onChange={(e) => updateConfig('enableCircuitBreaker', e.currentTarget.checked)}
              />

              <Checkbox
                label="Enable Rate Limiting"
                description="Bucket4j rate limiting for API protection"
                checked={config.enableRateLimiting}
                onChange={(e) => updateConfig('enableRateLimiting', e.currentTarget.checked)}
              />

              <Text size="sm" c="dimmed">
                Resilience patterns help your service handle failures gracefully and prevent
                cascading failures across the system.
              </Text>
            </Stack>
          </Tabs.Panel>

          {/* Docker Tab */}
          <Tabs.Panel value="docker" pt="md">
            <Stack gap="md">
              <Checkbox
                label="Generate Dockerfile"
                description="Multi-stage Dockerfile for the service"
                checked={config.generateDocker}
                onChange={(e) => updateConfig('generateDocker', e.currentTarget.checked)}
              />

              <Checkbox
                label="Generate Docker Compose"
                description="docker-compose.yml with service and database"
                checked={config.generateDockerCompose}
                onChange={(e) => updateConfig('generateDockerCompose', e.currentTarget.checked)}
              />

              <Text size="sm" c="dimmed">
                Docker configuration enables easy containerization and deployment of your
                microservice with all required dependencies.
              </Text>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
