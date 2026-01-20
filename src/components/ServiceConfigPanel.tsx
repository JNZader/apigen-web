import {
  Badge,
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
  IconDatabase,
  IconNetwork,
  IconServer,
  IconSettings,
  IconShield,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useServiceActions, useServices } from '../store/projectStore';
import type { ServiceConfig, ServiceDatabaseType, ServiceDiscoveryType } from '../types';

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

export function ServiceConfigPanel({
  serviceId,
  opened,
  onClose,
}: Readonly<ServiceConfigPanelProps>) {
  const services = useServices();
  const { updateService } = useServiceActions();

  const service = services.find((s) => s.id === serviceId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<ServiceConfig>({
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
  });

  // Load service data when service changes
  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || '');
      setConfig(service.config);
    }
  }, [service]);

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

        <Tabs defaultValue="general">
          <Tabs.List>
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
