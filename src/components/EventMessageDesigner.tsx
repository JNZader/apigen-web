import {
  ActionIcon,
  Badge,
  Box,
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
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconBrandAws,
  IconCloud,
  IconInfoCircle,
  IconPlug,
  IconPlugConnected,
  IconServer,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useServiceConnectionActions, useServiceConnections, useServices } from '../store/projectStore';
import type { SerializationFormat, ServiceConnectionDesign } from '../types';
import { COMMUNICATION_COLORS } from '../types';

type BrokerFilter = 'all' | 'Kafka' | 'RabbitMQ';

interface EventFormValues {
  // Connection metadata
  label: string;
  // Kafka specific
  topicName: string;
  partitions: number;
  replicationFactor: number;
  retentionMs: number;
  // RabbitMQ specific
  exchangeName: string;
  exchangeType: 'direct' | 'topic' | 'fanout' | 'headers';
  routingKey: string;
  queueName: string;
  durableQueue: boolean;
  // Common settings
  serializationFormat: SerializationFormat;
  timeout: number;
  retryEnabled: boolean;
  retryAttempts: number;
}

const SERIALIZATION_FORMATS: Array<{ value: SerializationFormat; label: string }> = [
  { value: 'JSON', label: 'JSON' },
  { value: 'AVRO', label: 'Apache Avro' },
  { value: 'PROTOBUF', label: 'Protocol Buffers' },
];

const EXCHANGE_TYPES = [
  { value: 'direct', label: 'Direct' },
  { value: 'topic', label: 'Topic' },
  { value: 'fanout', label: 'Fanout' },
  { value: 'headers', label: 'Headers' },
];

export function EventMessageDesigner() {
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);
  const [brokerFilter, setBrokerFilter] = useState<BrokerFilter>('all');

  const services = useServices();
  const serviceConnections = useServiceConnections();
  const { updateServiceConnection, removeServiceConnection } = useServiceConnectionActions();

  // Filter connections to only show Kafka and RabbitMQ
  const asyncConnections = serviceConnections.filter(
    (conn) =>
      (conn.communicationType === 'Kafka' || conn.communicationType === 'RabbitMQ') &&
      (brokerFilter === 'all' || conn.communicationType === brokerFilter)
  );

  const form = useForm<EventFormValues>({
    initialValues: {
      label: '',
      topicName: '',
      partitions: 3,
      replicationFactor: 1,
      retentionMs: 604800000, // 7 days
      exchangeName: '',
      exchangeType: 'topic',
      routingKey: '',
      queueName: '',
      durableQueue: true,
      serializationFormat: 'JSON',
      timeout: 30000,
      retryEnabled: true,
      retryAttempts: 3,
    },
    validate: {
      topicName: (value) =>
        editingConnectionId &&
        serviceConnections.find((c) => c.id === editingConnectionId)?.communicationType === 'Kafka' &&
        !value.trim()
          ? 'Topic name is required'
          : null,
      exchangeName: (value) =>
        editingConnectionId &&
        serviceConnections.find((c) => c.id === editingConnectionId)?.communicationType ===
          'RabbitMQ' &&
        !value.trim()
          ? 'Exchange name is required'
          : null,
    },
  });

  const getServiceName = (serviceId: string): string => {
    return services.find((s) => s.id === serviceId)?.name || 'Unknown Service';
  };

  const handleEditConnection = (connection: ServiceConnectionDesign) => {
    setEditingConnectionId(connection.id);
    form.setValues({
      label: connection.label || '',
      topicName: connection.config.topicName || '',
      partitions: 3, // Default values for Kafka
      replicationFactor: 1,
      retentionMs: 604800000,
      exchangeName: connection.config.exchangeName || '',
      exchangeType: 'topic',
      routingKey: connection.config.routingKey || '',
      queueName: connection.config.queueName || '',
      durableQueue: true,
      serializationFormat: 'JSON',
      timeout: connection.config.timeout || 30000,
      retryEnabled: connection.config.retryEnabled ?? true,
      retryAttempts: connection.config.retryAttempts || 3,
    });
    openDrawer();
  };

  const handleDeleteConnection = (connectionId: string) => {
    removeServiceConnection(connectionId);
    notifications.show({
      title: 'Event connection deleted',
      message: 'The event/message connection has been removed',
      color: 'orange',
    });
  };

  const handleSave = () => {
    if (form.validate().hasErrors || !editingConnectionId) return;

    const connection = serviceConnections.find((c) => c.id === editingConnectionId);
    if (!connection) return;

    const isKafka = connection.communicationType === 'Kafka';
    const isRabbitMQ = !isKafka;

    updateServiceConnection(editingConnectionId, {
      label: form.values.label || undefined,
      config: {
        ...connection.config,
        topicName: isKafka ? form.values.topicName : undefined,
        exchangeName: isRabbitMQ ? form.values.exchangeName : undefined,
        routingKey: isRabbitMQ ? form.values.routingKey : undefined,
        queueName: isRabbitMQ ? form.values.queueName : undefined,
        timeout: form.values.timeout,
        retryEnabled: form.values.retryEnabled,
        retryAttempts: form.values.retryAttempts,
      },
    });

    notifications.show({
      title: 'Event connection updated',
      message: 'The event/message configuration has been saved',
      color: 'green',
    });

    closeDrawer();
    setEditingConnectionId(null);
  };

  const editingConnection = editingConnectionId
    ? serviceConnections.find((c) => c.id === editingConnectionId)
    : null;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <IconPlugConnected size={20} />
          <Title order={5}>Event / Message Streams</Title>
        </Group>
        <SegmentedControl
          size="xs"
          value={brokerFilter}
          onChange={(v) => setBrokerFilter(v as BrokerFilter)}
          data={[
            { value: 'all', label: 'All' },
            {
              value: 'Kafka',
              label: (
                <Group gap={4}>
                  <IconBrandAws size={12} />
                  <span>Kafka</span>
                </Group>
              ),
            },
            {
              value: 'RabbitMQ',
              label: (
                <Group gap={4}>
                  <IconCloud size={12} />
                  <span>RabbitMQ</span>
                </Group>
              ),
            },
          ]}
        />
      </Group>

      {asyncConnections.length === 0 ? (
        <Paper p="xl" withBorder ta="center">
          <Stack align="center" gap="sm">
            <IconPlug size={48} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">No event streams configured</Text>
            <Text size="xs" c="dimmed">
              Create Kafka or RabbitMQ connections between services in the canvas view to see them
              here.
            </Text>
            <Alert icon={<IconInfoCircle size={16} />}>
              <Text size="xs">
                Switch to the Services view in the canvas, then drag from one service's output
                handle to another service's input handle. Choose Kafka or RabbitMQ as the
                communication type.
              </Text>
            </Alert>
          </Stack>
        </Paper>
      ) : (
        <ScrollArea.Autosize mah={500}>
          <Stack gap="sm">
            {asyncConnections.map((connection) => (
              <Card key={connection.id} withBorder padding="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <ThemeIcon
                      size="lg"
                      variant="light"
                      color={COMMUNICATION_COLORS[connection.communicationType]}
                    >
                      {connection.communicationType === 'Kafka' ? (
                        <IconBrandAws size={18} />
                      ) : (
                        <IconCloud size={18} />
                      )}
                    </ThemeIcon>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs">
                        <Text fw={500} size="sm" truncate>
                          {connection.label || `${connection.communicationType} Stream`}
                        </Text>
                        <Badge
                          size="xs"
                          color={COMMUNICATION_COLORS[connection.communicationType]}
                          variant="light"
                        >
                          {connection.communicationType}
                        </Badge>
                      </Group>

                      <Group gap="xs" mt={4}>
                        <Badge size="xs" variant="outline" color="gray">
                          <Group gap={4}>
                            <IconServer size={10} />
                            {getServiceName(connection.sourceServiceId)}
                          </Group>
                        </Badge>
                        <IconArrowRight size={12} color="var(--mantine-color-dimmed)" />
                        <Badge size="xs" variant="outline" color="gray">
                          <Group gap={4}>
                            <IconServer size={10} />
                            {getServiceName(connection.targetServiceId)}
                          </Group>
                        </Badge>
                      </Group>

                      {/* Show topic/exchange info */}
                      {connection.config.topicName && (
                        <Text size="xs" c="dimmed" mt={4}>
                          Topic: <strong>{connection.config.topicName}</strong>
                        </Text>
                      )}
                      {connection.config.exchangeName && (
                        <Text size="xs" c="dimmed" mt={4}>
                          Exchange: <strong>{connection.config.exchangeName}</strong>
                          {connection.config.routingKey && ` → ${connection.config.routingKey}`}
                        </Text>
                      )}
                    </Box>
                  </Group>

                  <Group gap="xs">
                    <Tooltip label="Configure">
                      <ActionIcon variant="subtle" onClick={() => handleEditConnection(connection)}>
                        <IconSettings size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteConnection(connection.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </ScrollArea.Autosize>
      )}

      {/* Configuration Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={() => {
          closeDrawer();
          setEditingConnectionId(null);
        }}
        title={
          <Group gap="sm">
            {editingConnection?.communicationType === 'Kafka' ? (
              <IconBrandAws size={20} />
            ) : (
              <IconCloud size={20} />
            )}
            <Title order={4}>
              Configure {editingConnection?.communicationType || 'Event'} Stream
            </Title>
          </Group>
        }
        position="right"
        size="lg"
        padding="lg"
      >
        {editingConnection && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <Stack gap="md">
              {/* Connection info */}
              <Card withBorder bg="gray.0" padding="sm">
                <Group gap="sm">
                  <Badge size="sm" variant="light">
                    {getServiceName(editingConnection.sourceServiceId)}
                  </Badge>
                  <IconArrowRight size={14} />
                  <Badge size="sm" variant="light">
                    {getServiceName(editingConnection.targetServiceId)}
                  </Badge>
                </Group>
              </Card>

              <TextInput
                label="Stream Label"
                description="Optional display name for this event stream"
                placeholder="e.g., Order Events, User Notifications"
                {...form.getInputProps('label')}
              />

              <Divider />

              <Tabs defaultValue="broker">
                <Tabs.List>
                  <Tabs.Tab value="broker" leftSection={<IconPlugConnected size={14} />}>
                    {editingConnection.communicationType === 'Kafka' ? 'Kafka' : 'RabbitMQ'}
                  </Tabs.Tab>
                  <Tabs.Tab value="reliability" leftSection={<IconSettings size={14} />}>
                    Reliability
                  </Tabs.Tab>
                </Tabs.List>

                {/* Kafka Configuration */}
                {editingConnection.communicationType === 'Kafka' && (
                  <Tabs.Panel value="broker" pt="md">
                    <Stack gap="md">
                      <TextInput
                        label="Topic Name"
                        description="Kafka topic for this event stream"
                        placeholder="e.g., order-events, user-created"
                        required
                        {...form.getInputProps('topicName')}
                      />

                      <Grid>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Partitions"
                            description="Number of topic partitions"
                            min={1}
                            max={100}
                            {...form.getInputProps('partitions')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Replication Factor"
                            description="Number of replicas"
                            min={1}
                            max={10}
                            {...form.getInputProps('replicationFactor')}
                          />
                        </Grid.Col>
                      </Grid>

                      <NumberInput
                        label="Retention (ms)"
                        description="How long to retain messages"
                        min={0}
                        step={86400000}
                        {...form.getInputProps('retentionMs')}
                      />

                      <Select
                        label="Serialization Format"
                        description="Message serialization format"
                        data={SERIALIZATION_FORMATS}
                        {...form.getInputProps('serializationFormat')}
                      />
                    </Stack>
                  </Tabs.Panel>
                )}

                {/* RabbitMQ Configuration */}
                {editingConnection.communicationType === 'RabbitMQ' && (
                  <Tabs.Panel value="broker" pt="md">
                    <Stack gap="md">
                      <TextInput
                        label="Exchange Name"
                        description="RabbitMQ exchange for publishing messages"
                        placeholder="e.g., orders.exchange"
                        required
                        {...form.getInputProps('exchangeName')}
                      />

                      <Select
                        label="Exchange Type"
                        description="Message routing strategy"
                        data={EXCHANGE_TYPES}
                        {...form.getInputProps('exchangeType')}
                      />

                      <TextInput
                        label="Routing Key"
                        description="Key for routing messages"
                        placeholder="e.g., order.created, user.#"
                        {...form.getInputProps('routingKey')}
                      />

                      <Divider label="Queue Configuration" labelPosition="left" />

                      <TextInput
                        label="Queue Name"
                        description="Consumer queue name"
                        placeholder="e.g., order-processor-queue"
                        {...form.getInputProps('queueName')}
                      />

                      <Checkbox
                        label="Durable Queue"
                        description="Queue survives broker restart"
                        checked={form.values.durableQueue}
                        onChange={(e) => form.setFieldValue('durableQueue', e.currentTarget.checked)}
                      />

                      <Select
                        label="Serialization Format"
                        description="Message serialization format"
                        data={SERIALIZATION_FORMATS}
                        {...form.getInputProps('serializationFormat')}
                      />
                    </Stack>
                  </Tabs.Panel>
                )}

                {/* Reliability Tab */}
                <Tabs.Panel value="reliability" pt="md">
                  <Stack gap="md">
                    <NumberInput
                      label="Timeout (ms)"
                      description="Maximum wait time for acknowledgment"
                      min={1000}
                      max={300000}
                      step={1000}
                      {...form.getInputProps('timeout')}
                    />

                    <Checkbox
                      label="Enable Retry"
                      description="Automatically retry failed messages"
                      checked={form.values.retryEnabled}
                      onChange={(e) => form.setFieldValue('retryEnabled', e.currentTarget.checked)}
                    />

                    <Collapse in={form.values.retryEnabled}>
                      <NumberInput
                        label="Retry Attempts"
                        description="Maximum number of retry attempts"
                        min={1}
                        max={10}
                        {...form.getInputProps('retryAttempts')}
                      />
                    </Collapse>

                    <Text size="xs" c="dimmed" mt="md">
                      These settings control message delivery guarantees and error handling for this
                      event stream.
                    </Text>
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              <Divider />

              <Group justify="flex-end">
                <Button
                  variant="default"
                  onClick={() => {
                    closeDrawer();
                    setEditingConnectionId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Configuration</Button>
              </Group>
            </Stack>
          </form>
        )}
      </Drawer>
    </Stack>
  );
}

// Missing Alert import - need to add it
function Alert({ icon, children }: Readonly<{ icon: React.ReactNode; children: React.ReactNode }>) {
  return (
    <Paper p="sm" withBorder bg="blue.0">
      <Group gap="xs" wrap="nowrap">
        {icon}
        {children}
      </Group>
    </Paper>
  );
}
