import {
  Badge,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconApi,
  IconArrowRight,
  IconBrandAws,
  IconCloud,
  IconCode,
  IconPlugConnected,
  IconServer,
  IconSettings,
} from '@tabler/icons-react';
import { useEffect } from 'react';
import { useServiceConnectionActions, useServices } from '../store/projectStore';
import type { CommunicationType, SerializationFormat, ServiceConnectionDesign } from '../types';
import {
  COMMUNICATION_COLORS,
  COMMUNICATION_LABELS,
  defaultServiceConnectionConfig,
} from '../types';

interface ServiceConnectionFormProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  /** For create mode: provide source and target service IDs */
  readonly pendingConnection?: {
    sourceServiceId: string;
    targetServiceId: string;
  } | null;
  /** For edit mode: provide the existing connection */
  readonly editingConnection?: ServiceConnectionDesign | null;
}

interface FormValues {
  communicationType: CommunicationType;
  label: string;
  // REST specific
  restPath: string;
  restMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  // gRPC specific
  grpcServiceName: string;
  grpcMethodName: string;
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
  circuitBreakerEnabled: boolean;
}

const COMMUNICATION_TYPES: Array<{
  value: CommunicationType;
  label: string;
  icon: typeof IconApi;
}> = [
  { value: 'REST', label: 'REST API', icon: IconApi },
  { value: 'gRPC', label: 'gRPC', icon: IconCode },
  { value: 'Kafka', label: 'Kafka', icon: IconBrandAws },
  { value: 'RabbitMQ', label: 'RabbitMQ', icon: IconCloud },
  { value: 'WebSocket', label: 'WebSocket', icon: IconPlugConnected },
];

const REST_METHODS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
];

const EXCHANGE_TYPES = [
  { value: 'direct', label: 'Direct' },
  { value: 'topic', label: 'Topic' },
  { value: 'fanout', label: 'Fanout' },
  { value: 'headers', label: 'Headers' },
];

const SERIALIZATION_FORMATS: Array<{ value: SerializationFormat; label: string }> = [
  { value: 'JSON', label: 'JSON' },
  { value: 'AVRO', label: 'Apache Avro' },
  { value: 'PROTOBUF', label: 'Protocol Buffers' },
];

const initialFormValues: FormValues = {
  communicationType: 'REST',
  label: '',
  restPath: '/api/v1/',
  restMethod: 'POST',
  grpcServiceName: '',
  grpcMethodName: '',
  topicName: '',
  partitions: 3,
  replicationFactor: 1,
  retentionMs: 604800000,
  exchangeName: '',
  exchangeType: 'topic',
  routingKey: '',
  queueName: '',
  durableQueue: true,
  serializationFormat: 'JSON',
  timeout: 30000,
  retryEnabled: true,
  retryAttempts: 3,
  circuitBreakerEnabled: true,
};

export function ServiceConnectionForm({
  opened,
  onClose,
  pendingConnection,
  editingConnection,
}: Readonly<ServiceConnectionFormProps>) {
  const services = useServices();
  const { addServiceConnection, updateServiceConnection } = useServiceConnectionActions();

  const isEditMode = !!editingConnection;
  const sourceServiceId = editingConnection?.sourceServiceId || pendingConnection?.sourceServiceId;
  const targetServiceId = editingConnection?.targetServiceId || pendingConnection?.targetServiceId;

  const sourceService = services.find((s) => s.id === sourceServiceId);
  const targetService = services.find((s) => s.id === targetServiceId);

  const form = useForm<FormValues>({
    initialValues: initialFormValues,
    validate: {
      topicName: (value, values) =>
        values.communicationType === 'Kafka' && !value.trim() ? 'Topic name is required' : null,
      exchangeName: (value, values) =>
        values.communicationType === 'RabbitMQ' && !value.trim()
          ? 'Exchange name is required'
          : null,
      grpcServiceName: (value, values) =>
        values.communicationType === 'gRPC' && !value.trim() ? 'Service name is required' : null,
    },
  });

  // Reset form when opening with new data
  // biome-ignore lint/correctness/useExhaustiveDependencies: We intentionally only re-run when opened changes or connection ID changes
  useEffect(() => {
    if (opened) {
      if (editingConnection) {
        // Edit mode: populate form with existing values
        form.setValues({
          communicationType: editingConnection.communicationType,
          label: editingConnection.label || '',
          restPath: editingConnection.config.restPath || '/api/v1/',
          restMethod: editingConnection.config.restMethod || 'POST',
          grpcServiceName: editingConnection.config.grpcServiceName || '',
          grpcMethodName: editingConnection.config.grpcMethodName || '',
          topicName: editingConnection.config.topicName || '',
          partitions: 3,
          replicationFactor: 1,
          retentionMs: 604800000,
          exchangeName: editingConnection.config.exchangeName || '',
          exchangeType: 'topic',
          routingKey: editingConnection.config.routingKey || '',
          queueName: editingConnection.config.queueName || '',
          durableQueue: true,
          serializationFormat: 'JSON',
          timeout: editingConnection.config.timeout || 30000,
          retryEnabled: editingConnection.config.retryEnabled ?? true,
          retryAttempts: editingConnection.config.retryAttempts || 3,
          circuitBreakerEnabled: editingConnection.config.circuitBreakerEnabled ?? true,
        });
      } else {
        // Create mode: reset to defaults
        form.reset();
      }
    }
  }, [opened, editingConnection]);

  const handleSubmit = () => {
    if (form.validate().hasErrors) return;

    const { communicationType } = form.values;

    const config = {
      ...defaultServiceConnectionConfig,
      // REST
      ...(communicationType === 'REST' && {
        restPath: form.values.restPath,
        restMethod: form.values.restMethod,
      }),
      // gRPC
      ...(communicationType === 'gRPC' && {
        grpcServiceName: form.values.grpcServiceName,
        grpcMethodName: form.values.grpcMethodName,
      }),
      // Kafka
      ...(communicationType === 'Kafka' && {
        topicName: form.values.topicName,
      }),
      // RabbitMQ
      ...(communicationType === 'RabbitMQ' && {
        exchangeName: form.values.exchangeName,
        routingKey: form.values.routingKey,
        queueName: form.values.queueName,
      }),
      // Common
      timeout: form.values.timeout,
      retryEnabled: form.values.retryEnabled,
      retryAttempts: form.values.retryAttempts,
      circuitBreakerEnabled: form.values.circuitBreakerEnabled,
    };

    if (isEditMode && editingConnection) {
      // Update existing connection
      updateServiceConnection(editingConnection.id, {
        communicationType,
        label: form.values.label || undefined,
        config,
      });
      notifications.show({
        title: 'Connection updated',
        message: `${COMMUNICATION_LABELS[communicationType]} connection has been updated`,
        color: 'green',
      });
    } else if (sourceServiceId && targetServiceId) {
      // Create new connection
      addServiceConnection({
        sourceServiceId,
        targetServiceId,
        communicationType,
        label: form.values.label || undefined,
        config,
      });
      notifications.show({
        title: 'Connection created',
        message: `${COMMUNICATION_LABELS[communicationType]} connection has been created`,
        color: 'green',
      });
    }

    onClose();
  };

  const communicationType = form.values.communicationType;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconPlugConnected size={20} />
          <Text fw={600}>{isEditMode ? 'Edit Connection' : 'Create Connection'}</Text>
        </Group>
      }
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Stack gap="md">
          {/* Source/Target info */}
          <Group
            justify="center"
            p="sm"
            style={{
              background: 'var(--mantine-color-gray-0)',
              borderRadius: 'var(--mantine-radius-sm)',
            }}
          >
            <Badge
              size="lg"
              variant="light"
              leftSection={
                <ThemeIcon size="xs" variant="transparent">
                  <IconServer size={12} />
                </ThemeIcon>
              }
            >
              {sourceService?.name || 'Source'}
            </Badge>
            <IconArrowRight size={16} color="var(--mantine-color-dimmed)" />
            <Badge
              size="lg"
              variant="light"
              leftSection={
                <ThemeIcon size="xs" variant="transparent">
                  <IconServer size={12} />
                </ThemeIcon>
              }
            >
              {targetService?.name || 'Target'}
            </Badge>
          </Group>

          {/* Communication Type Selector */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              Communication Type
            </Text>
            <SegmentedControl
              fullWidth
              value={communicationType}
              onChange={(v) => form.setFieldValue('communicationType', v as CommunicationType)}
              data={COMMUNICATION_TYPES.map((type) => ({
                value: type.value,
                label: (
                  <Group gap={6} wrap="nowrap" justify="center">
                    <type.icon size={14} />
                    <span>{type.label}</span>
                  </Group>
                ),
              }))}
              color={COMMUNICATION_COLORS[communicationType]}
            />
          </div>

          <TextInput
            label="Connection Label"
            description="Optional display name for this connection"
            placeholder={`e.g., ${sourceService?.name || 'Service'} to ${targetService?.name || 'Service'}`}
            {...form.getInputProps('label')}
          />

          <Divider />

          <Tabs defaultValue="config">
            <Tabs.List>
              <Tabs.Tab value="config" leftSection={<IconPlugConnected size={14} />}>
                {COMMUNICATION_LABELS[communicationType]} Config
              </Tabs.Tab>
              <Tabs.Tab value="reliability" leftSection={<IconSettings size={14} />}>
                Reliability
              </Tabs.Tab>
            </Tabs.List>

            {/* REST Configuration */}
            {communicationType === 'REST' && (
              <Tabs.Panel value="config" pt="md">
                <Stack gap="md">
                  <Grid>
                    <Grid.Col span={4}>
                      <Select
                        label="HTTP Method"
                        data={REST_METHODS}
                        {...form.getInputProps('restMethod')}
                      />
                    </Grid.Col>
                    <Grid.Col span={8}>
                      <TextInput
                        label="Endpoint Path"
                        placeholder="/api/v1/resource"
                        {...form.getInputProps('restPath')}
                      />
                    </Grid.Col>
                  </Grid>
                  <Text size="xs" c="dimmed">
                    Configure the REST endpoint that will be called on the target service.
                  </Text>
                </Stack>
              </Tabs.Panel>
            )}

            {/* gRPC Configuration */}
            {communicationType === 'gRPC' && (
              <Tabs.Panel value="config" pt="md">
                <Stack gap="md">
                  <TextInput
                    label="Service Name"
                    description="The gRPC service to call"
                    placeholder="com.example.UserService"
                    required
                    {...form.getInputProps('grpcServiceName')}
                  />
                  <TextInput
                    label="Method Name"
                    description="The RPC method to invoke"
                    placeholder="GetUser"
                    {...form.getInputProps('grpcMethodName')}
                  />
                  <Text size="xs" c="dimmed">
                    Define the gRPC service and method for this connection.
                  </Text>
                </Stack>
              </Tabs.Panel>
            )}

            {/* Kafka Configuration */}
            {communicationType === 'Kafka' && (
              <Tabs.Panel value="config" pt="md">
                <Stack gap="md">
                  <TextInput
                    label="Topic Name"
                    description="Kafka topic for publishing/subscribing"
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
            {communicationType === 'RabbitMQ' && (
              <Tabs.Panel value="config" pt="md">
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
                </Stack>
              </Tabs.Panel>
            )}

            {/* WebSocket Configuration */}
            {communicationType === 'WebSocket' && (
              <Tabs.Panel value="config" pt="md">
                <Stack gap="md">
                  <TextInput
                    label="Endpoint Path"
                    description="WebSocket endpoint path"
                    placeholder="/ws/events"
                    {...form.getInputProps('restPath')}
                  />
                  <Text size="xs" c="dimmed">
                    Configure the WebSocket endpoint for real-time bidirectional communication.
                  </Text>
                </Stack>
              </Tabs.Panel>
            )}

            {/* Reliability Tab */}
            <Tabs.Panel value="reliability" pt="md">
              <Stack gap="md">
                <NumberInput
                  label="Timeout (ms)"
                  description="Maximum wait time for response/acknowledgment"
                  min={1000}
                  max={300000}
                  step={1000}
                  {...form.getInputProps('timeout')}
                />

                <Checkbox
                  label="Enable Retry"
                  description="Automatically retry failed requests"
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

                <Checkbox
                  label="Enable Circuit Breaker"
                  description="Prevent cascading failures with circuit breaker pattern"
                  checked={form.values.circuitBreakerEnabled}
                  onChange={(e) =>
                    form.setFieldValue('circuitBreakerEnabled', e.currentTarget.checked)
                  }
                />

                <Text size="xs" c="dimmed" mt="md">
                  These settings control reliability and error handling for this connection.
                </Text>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Divider />

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color={COMMUNICATION_COLORS[communicationType]}>
              {isEditMode ? 'Save Changes' : 'Create Connection'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
