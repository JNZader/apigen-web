import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Drawer,
  Grid,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconEdit,
  IconFilter,
  IconPlus,
  IconRoute,
  IconSettings,
  IconShield,
  IconTrash,
} from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { useServices } from '../store/projectStore';
import type { GatewayRouteConfig } from '../types';

interface GatewayRouteDesignerProps {
  routes: GatewayRouteConfig[];
  onRoutesChange: (routes: GatewayRouteConfig[]) => void;
}

interface RouteFormValues {
  id: string;
  path: string;
  uri: string;
  filters: string[];
  predicates: string[];
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitBurst: number;
  circuitBreakerEnabled: boolean;
  authRequired: boolean;
  // Additional form fields
  method: string;
  rewritePath: string;
  addRequestHeader: string;
  addResponseHeader: string;
}

const HTTP_METHODS = [
  { value: '', label: 'Any Method' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
];

const COMMON_FILTERS = [
  { value: 'RewritePath', label: 'Rewrite Path', description: 'Transform the request path' },
  {
    value: 'AddRequestHeader',
    label: 'Add Request Header',
    description: 'Add headers to requests',
  },
  {
    value: 'AddResponseHeader',
    label: 'Add Response Header',
    description: 'Add headers to responses',
  },
  { value: 'CircuitBreaker', label: 'Circuit Breaker', description: 'Enable fault tolerance' },
  { value: 'Retry', label: 'Retry', description: 'Retry failed requests' },
  { value: 'RequestRateLimiter', label: 'Rate Limiter', description: 'Limit request rate' },
  { value: 'StripPrefix', label: 'Strip Prefix', description: 'Remove path prefix segments' },
  { value: 'PrefixPath', label: 'Prefix Path', description: 'Add path prefix' },
];

function generateRouteId(): string {
  return `route-${nanoid(12)}`;
}

export function GatewayRouteDesigner({
  routes,
  onRoutesChange,
}: Readonly<GatewayRouteDesignerProps>) {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const services = useServices();

  const form = useForm<RouteFormValues>({
    initialValues: {
      id: '',
      path: '/api/**',
      uri: 'lb://service-name',
      filters: [],
      predicates: [],
      rateLimitEnabled: false,
      rateLimitRequests: 100,
      rateLimitBurst: 200,
      circuitBreakerEnabled: true,
      authRequired: true,
      method: '',
      rewritePath: '',
      addRequestHeader: '',
      addResponseHeader: '',
    },
    validate: {
      path: (value) => (value.trim() ? null : 'Path is required'),
      uri: (value) => (value.trim() ? null : 'Target URI is required'),
    },
  });

  const handleAddRoute = () => {
    setEditingRouteId(null);
    form.reset();
    form.setFieldValue('id', generateRouteId());
    openDrawer();
  };

  const handleEditRoute = (route: GatewayRouteConfig) => {
    setEditingRouteId(route.id);
    form.setValues({
      id: route.id,
      path: route.path,
      uri: route.uri,
      filters: route.filters,
      predicates: route.predicates,
      rateLimitEnabled: route.rateLimitEnabled,
      rateLimitRequests: route.rateLimitRequests,
      rateLimitBurst: route.rateLimitBurst,
      circuitBreakerEnabled: route.circuitBreakerEnabled,
      authRequired: route.authRequired,
      method: route.predicates.find((p) => p.startsWith('Method='))?.replace('Method=', '') || '',
      rewritePath:
        route.filters.find((f) => f.startsWith('RewritePath='))?.replace('RewritePath=', '') || '',
      addRequestHeader: '',
      addResponseHeader: '',
    });
    openDrawer();
  };

  const handleDeleteRoute = (routeId: string) => {
    const newRoutes = routes.filter((r) => r.id !== routeId);
    onRoutesChange(newRoutes);
    notifications.show({
      title: 'Route deleted',
      message: 'Gateway route has been removed',
      color: 'orange',
    });
  };

  const handleSaveRoute = () => {
    if (form.validate().hasErrors) return;

    // Build predicates from form
    const predicates: string[] = [`Path=${form.values.path}`];
    if (form.values.method) {
      predicates.push(`Method=${form.values.method}`);
    }

    // Build filters from form
    const filters: string[] = [];
    if (form.values.rewritePath) {
      filters.push(`RewritePath=${form.values.rewritePath}`);
    }
    if (form.values.addRequestHeader) {
      filters.push(`AddRequestHeader=${form.values.addRequestHeader}`);
    }
    if (form.values.addResponseHeader) {
      filters.push(`AddResponseHeader=${form.values.addResponseHeader}`);
    }
    if (form.values.circuitBreakerEnabled) {
      filters.push('CircuitBreaker=gateway-cb');
    }
    if (form.values.rateLimitEnabled) {
      filters.push(
        `RequestRateLimiter=${form.values.rateLimitRequests},${form.values.rateLimitBurst}`,
      );
    }

    const routeConfig: GatewayRouteConfig = {
      id: form.values.id,
      path: form.values.path,
      uri: form.values.uri,
      filters,
      predicates,
      rateLimitEnabled: form.values.rateLimitEnabled,
      rateLimitRequests: form.values.rateLimitRequests,
      rateLimitBurst: form.values.rateLimitBurst,
      circuitBreakerEnabled: form.values.circuitBreakerEnabled,
      authRequired: form.values.authRequired,
    };

    if (editingRouteId) {
      // Update existing route
      const newRoutes = routes.map((r) => (r.id === editingRouteId ? routeConfig : r));
      onRoutesChange(newRoutes);
      notifications.show({
        title: 'Route updated',
        message: 'Gateway route has been updated',
        color: 'blue',
      });
    } else {
      // Add new route
      onRoutesChange([...routes, routeConfig]);
      notifications.show({
        title: 'Route created',
        message: 'New gateway route has been added',
        color: 'green',
      });
    }

    closeDrawer();
  };

  // Generate service URI options
  const serviceUriOptions = services.map((service) => ({
    value: `lb://${service.name.toLowerCase().replaceAll(/\s+/g, '-')}`,
    label: `${service.name} (lb://${service.name.toLowerCase().replaceAll(/\s+/g, '-')})`,
  }));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <IconRoute size={20} />
          <Title order={5}>Gateway Routes</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} size="xs" onClick={handleAddRoute}>
          Add Route
        </Button>
      </Group>

      {routes.length === 0 ? (
        <Paper p="xl" withBorder ta="center">
          <Stack align="center" gap="sm">
            <IconRoute size={48} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">No routes configured</Text>
            <Text size="xs" c="dimmed">
              Add routes to define how the API Gateway proxies requests to your services.
            </Text>
            <Button variant="light" leftSection={<IconPlus size={14} />} onClick={handleAddRoute}>
              Create First Route
            </Button>
          </Stack>
        </Paper>
      ) : (
        <ScrollArea.Autosize mah={400}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Path</Table.Th>
                <Table.Th>Target</Table.Th>
                <Table.Th>Features</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {routes.map((route) => (
                <Table.Tr key={route.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <Badge size="xs" variant="light" color="blue">
                        {route.predicates
                          .find((p) => p.startsWith('Method='))
                          ?.replace('Method=', '') || 'ANY'}
                      </Badge>
                      <Text size="sm" fw={500}>
                        {route.path}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <IconArrowRight size={14} color="var(--mantine-color-dimmed)" />
                      <Text size="sm" c="dimmed">
                        {route.uri}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {route.authRequired && (
                        <Tooltip label="Authentication required">
                          <Badge size="xs" color="green" variant="dot">
                            Auth
                          </Badge>
                        </Tooltip>
                      )}
                      {route.rateLimitEnabled && (
                        <Tooltip label={`Rate limit: ${route.rateLimitRequests}/s`}>
                          <Badge size="xs" color="orange" variant="dot">
                            RateLimit
                          </Badge>
                        </Tooltip>
                      )}
                      {route.circuitBreakerEnabled && (
                        <Tooltip label="Circuit breaker enabled">
                          <Badge size="xs" color="violet" variant="dot">
                            CB
                          </Badge>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Edit route">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => handleEditRoute(route)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete route">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteRoute(route.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      )}

      {/* Route Configuration Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <Group gap="sm">
            <IconRoute size={20} />
            <Title order={4}>{editingRouteId ? 'Edit Route' : 'New Route'}</Title>
          </Group>
        }
        position="right"
        size="lg"
        padding="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveRoute();
          }}
        >
          <Stack gap="md">
            <Tabs defaultValue="basic">
              <Tabs.List>
                <Tabs.Tab value="basic" leftSection={<IconSettings size={14} />}>
                  Basic
                </Tabs.Tab>
                <Tabs.Tab value="filters" leftSection={<IconFilter size={14} />}>
                  Filters
                </Tabs.Tab>
                <Tabs.Tab value="resilience" leftSection={<IconShield size={14} />}>
                  Resilience
                </Tabs.Tab>
              </Tabs.List>

              {/* Basic Tab */}
              <Tabs.Panel value="basic" pt="md">
                <Stack gap="md">
                  <TextInput
                    label="Route Path"
                    description="The path pattern to match (supports ** wildcards)"
                    placeholder="/api/users/**"
                    required
                    {...form.getInputProps('path')}
                  />

                  <Select
                    label="HTTP Method"
                    description="Restrict to specific HTTP method or allow any"
                    data={HTTP_METHODS}
                    {...form.getInputProps('method')}
                    clearable
                  />

                  <Divider label="Target Service" labelPosition="left" />

                  {services.length > 0 ? (
                    <Select
                      label="Target Service"
                      description="Select a service or enter a custom URI"
                      data={[...serviceUriOptions, { value: 'custom', label: '-- Custom URI --' }]}
                      value={
                        serviceUriOptions.some((s) => s.value === form.values.uri)
                          ? form.values.uri
                          : 'custom'
                      }
                      onChange={(value) => {
                        if (value && value !== 'custom') {
                          form.setFieldValue('uri', value);
                        }
                      }}
                    />
                  ) : null}

                  <TextInput
                    label="Target URI"
                    description="Use lb://service-name for load-balanced, or http://host:port"
                    placeholder="lb://order-service"
                    required
                    {...form.getInputProps('uri')}
                  />

                  <Checkbox
                    label="Require Authentication"
                    description="Route requires valid authentication token"
                    checked={form.values.authRequired}
                    onChange={(e) => form.setFieldValue('authRequired', e.currentTarget.checked)}
                  />
                </Stack>
              </Tabs.Panel>

              {/* Filters Tab */}
              <Tabs.Panel value="filters" pt="md">
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Filters modify the request/response as it passes through the gateway.
                  </Text>

                  <Card withBorder padding="sm">
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        Common Filters
                      </Text>
                      <Grid>
                        {COMMON_FILTERS.map((filter) => (
                          <Grid.Col span={6} key={filter.value}>
                            <Tooltip label={filter.description}>
                              <Badge
                                size="sm"
                                variant="light"
                                color={
                                  form.values.filters.some((f) => f.startsWith(filter.value))
                                    ? 'blue'
                                    : 'gray'
                                }
                                style={{ cursor: 'pointer' }}
                              >
                                {filter.label}
                              </Badge>
                            </Tooltip>
                          </Grid.Col>
                        ))}
                      </Grid>
                    </Stack>
                  </Card>

                  <Divider label="Path Rewriting" labelPosition="left" />

                  <TextInput
                    label="Rewrite Path"
                    description="Transform path (e.g., /api/(?<segment>.*), /$\{segment})"
                    placeholder="/api/(?<segment>.*), /${segment}"
                    {...form.getInputProps('rewritePath')}
                  />

                  <Divider label="Headers" labelPosition="left" />

                  <TextInput
                    label="Add Request Header"
                    description="Add header to requests (format: Name, Value)"
                    placeholder="X-Request-Source, gateway"
                    {...form.getInputProps('addRequestHeader')}
                  />

                  <TextInput
                    label="Add Response Header"
                    description="Add header to responses (format: Name, Value)"
                    placeholder="X-Response-Time, ${responseTime}"
                    {...form.getInputProps('addResponseHeader')}
                  />
                </Stack>
              </Tabs.Panel>

              {/* Resilience Tab */}
              <Tabs.Panel value="resilience" pt="md">
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Configure resilience patterns to handle failures gracefully.
                  </Text>

                  <Card withBorder padding="sm">
                    <Stack gap="sm">
                      <Checkbox
                        label="Enable Circuit Breaker"
                        description="Prevent cascading failures with automatic circuit breaking"
                        checked={form.values.circuitBreakerEnabled}
                        onChange={(e) =>
                          form.setFieldValue('circuitBreakerEnabled', e.currentTarget.checked)
                        }
                      />
                    </Stack>
                  </Card>

                  <Divider label="Rate Limiting" labelPosition="left" />

                  <Checkbox
                    label="Enable Rate Limiting"
                    description="Limit the number of requests per second"
                    checked={form.values.rateLimitEnabled}
                    onChange={(e) =>
                      form.setFieldValue('rateLimitEnabled', e.currentTarget.checked)
                    }
                  />

                  <Collapse in={form.values.rateLimitEnabled}>
                    <Grid>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Requests per second"
                          description="Steady state rate"
                          min={1}
                          max={10000}
                          {...form.getInputProps('rateLimitRequests')}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Burst capacity"
                          description="Maximum burst size"
                          min={1}
                          max={10000}
                          {...form.getInputProps('rateLimitBurst')}
                        />
                      </Grid.Col>
                    </Grid>
                  </Collapse>

                  <Text size="xs" c="dimmed" mt="md">
                    Rate limiting uses Redis for distributed limiting when configured. Falls back to
                    in-memory limiting for single-instance deployments.
                  </Text>
                </Stack>
              </Tabs.Panel>
            </Tabs>

            <Divider />

            <Group justify="flex-end">
              <Button variant="default" onClick={closeDrawer}>
                Cancel
              </Button>
              <Button type="submit">{editingRouteId ? 'Update Route' : 'Create Route'}</Button>
            </Group>
          </Stack>
        </form>
      </Drawer>
    </Stack>
  );
}
