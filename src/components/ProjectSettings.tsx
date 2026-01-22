import {
  Button,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Tabs,
  TagsInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconBrandGraphql,
  IconClock,
  IconDatabase,
  IconEye,
  IconFileText,
  IconGlobe,
  IconNetwork,
  IconRefresh,
  IconRocket,
  IconRouter,
  IconSettings,
  IconShield,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useProject, useProjectActions } from '../store';
import type {
  FeatureFlag,
  ProjectConfig,
  SupportedLocale,
  TenantStrategy,
  VersioningStrategy,
  WebhookEventType,
} from '../types';
import { isValidArtifactId, isValidGroupId, isValidPackageName } from '../utils/validation';
import { GatewayRouteDesigner } from './GatewayRouteDesigner';

interface ProjectSettingsProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

/**
 * Basic project information form component
 */
function BasicSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  const handleGroupIdChange = (value: string) => {
    form.setFieldValue('groupId', value);
    if (form.values.artifactId) {
      const packageName = `${value}.${form.values.artifactId.replaceAll('-', '')}`;
      form.setFieldValue('packageName', packageName);
    }
  };

  return (
    <Stack>
      <TextInput
        label="Project Name"
        placeholder="My Awesome API"
        {...form.getInputProps('name')}
        required
      />

      <TextInput
        label="Group ID"
        placeholder="com.example"
        description="Maven group identifier"
        {...form.getInputProps('groupId')}
        onChange={(e) => handleGroupIdChange(e.currentTarget.value)}
        required
      />

      <TextInput
        label="Artifact ID"
        placeholder="my-api"
        description="Maven artifact identifier"
        {...form.getInputProps('artifactId')}
        required
      />

      <TextInput
        label="Package Name"
        placeholder="com.example.myapi"
        description="Base Java package name"
        {...form.getInputProps('packageName')}
        required
      />

      <Select
        label="Java Version"
        data={[
          { value: '17', label: 'Java 17' },
          { value: '21', label: 'Java 21 (LTS)' },
        ]}
        {...form.getInputProps('javaVersion')}
      />

      <Select
        label="Spring Boot Version"
        data={[
          { value: '3.2.0', label: '3.2.0' },
          { value: '3.1.0', label: '3.1.0' },
        ]}
        {...form.getInputProps('springBootVersion')}
      />
    </Stack>
  );
}

/**
 * Database configuration form component
 */
function DatabaseSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Select
        label="Database Type"
        data={[
          { value: 'POSTGRESQL', label: 'PostgreSQL' },
          { value: 'MYSQL', label: 'MySQL' },
          { value: 'H2', label: 'H2 (Embedded)' },
        ]}
        {...form.getInputProps('database.type')}
      />

      <TextInput
        label="Database Name"
        placeholder="myapp"
        {...form.getInputProps('database.name')}
      />

      <TextInput
        label="Username"
        placeholder="postgres"
        {...form.getInputProps('database.username')}
      />

      <TextInput
        label="Password"
        placeholder="password"
        type="password"
        {...form.getInputProps('database.password')}
      />

      <TextInput label="Host" placeholder="localhost" {...form.getInputProps('database.host')} />

      <NumberInput label="Port" placeholder="5432" {...form.getInputProps('database.port')} />

      <Switch
        label="Enable Flyway migrations"
        {...form.getInputProps('database.enableFlyway', { type: 'checkbox' })}
      />
    </Stack>
  );
}

/**
 * Security configuration form component
 */
function SecuritySettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable JWT Authentication"
        {...form.getInputProps('securityConfig.jwt.enabled', { type: 'checkbox' })}
      />

      <TextInput
        label="JWT Secret"
        placeholder="your-secret-key-here"
        {...form.getInputProps('securityConfig.jwt.secret')}
      />

      <NumberInput
        label="Token Expiration (minutes)"
        {...form.getInputProps('securityConfig.jwt.expirationMinutes')}
      />

      <Switch
        label="Enable OAuth2"
        {...form.getInputProps('securityConfig.oauth2.enabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Basic Authentication"
        {...form.getInputProps('securityConfig.basicAuth.enabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable API Keys"
        {...form.getInputProps('securityConfig.apiKey.enabled', { type: 'checkbox' })}
      />
    </Stack>
  );
}

/**
 * Rate limiting configuration form component
 */
function RateLimitSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable Rate Limiting"
        {...form.getInputProps('rateLimitConfig.enabled', { type: 'checkbox' })}
      />

      <NumberInput
        label="Requests per Second"
        description="Maximum requests per second per client"
        {...form.getInputProps('rateLimitConfig.requestsPerSecond')}
      />

      <NumberInput
        label="Requests per Minute"
        description="Maximum requests per minute per client"
        {...form.getInputProps('rateLimitConfig.requestsPerMinute')}
      />

      <NumberInput
        label="Requests per Hour"
        description="Maximum requests per hour per client"
        {...form.getInputProps('rateLimitConfig.requestsPerHour')}
      />

      <Select
        label="Strategy"
        data={[
          { value: 'FIXED_WINDOW', label: 'Fixed Window' },
          { value: 'SLIDING_WINDOW', label: 'Sliding Window' },
          { value: 'TOKEN_BUCKET', label: 'Token Bucket' },
          { value: 'LEAKY_BUCKET', label: 'Leaky Bucket' },
        ]}
        {...form.getInputProps('rateLimitConfig.strategy')}
      />
    </Stack>
  );
}

/**
 * Caching configuration form component
 */
function CacheSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable Caching"
        {...form.getInputProps('cacheConfig.enabled', { type: 'checkbox' })}
      />

      <Select
        label="Cache Provider"
        data={[
          { value: 'REDIS', label: 'Redis' },
          { value: 'CAFFEINE', label: 'Caffeine (In-memory)' },
          { value: 'EHCACHE', label: 'EhCache' },
        ]}
        {...form.getInputProps('cacheConfig.provider')}
      />

      <TextInput
        label="Redis Host"
        placeholder="localhost"
        {...form.getInputProps('cacheConfig.redis.host')}
      />

      <NumberInput
        label="Redis Port"
        placeholder="6379"
        {...form.getInputProps('cacheConfig.redis.port')}
      />

      <TextInput
        label="Redis Password"
        type="password"
        {...form.getInputProps('cacheConfig.redis.password')}
      />

      <Switch
        label="Enable Cache Metrics"
        {...form.getInputProps('cacheConfig.metrics.enabled', { type: 'checkbox' })}
      />
    </Stack>
  );
}

/**
 * Features configuration form component
 */
function FeaturesSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable Swagger/OpenAPI"
        {...form.getInputProps('features.swagger', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Actuator"
        {...form.getInputProps('features.actuator', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Validation"
        {...form.getInputProps('features.validation', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Lombok"
        {...form.getInputProps('features.lombok', { type: 'checkbox' })}
      />

      <Switch
        label="Enable MapStruct"
        {...form.getInputProps('features.mapstruct', { type: 'checkbox' })}
      />

      <Switch
        label="Enable JUnit 5"
        {...form.getInputProps('features.junit5', { type: 'checkbox' })}
      />

      <Switch
        label="Enable TestContainers"
        {...form.getInputProps('features.testcontainers', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Docker"
        {...form.getInputProps('features.docker', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Kubernetes"
        {...form.getInputProps('features.kubernetes', { type: 'checkbox' })}
      />
    </Stack>
  );
}

/**
 * Observability configuration form component
 */
function ObservabilitySettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable Tracing"
        {...form.getInputProps('observabilityConfig.tracing.enabled', { type: 'checkbox' })}
      />

      <Select
        label="Tracing Provider"
        data={[
          { value: 'JAEGER', label: 'Jaeger' },
          { value: 'ZIPKIN', label: 'Zipkin' },
        ]}
        {...form.getInputProps('observabilityConfig.tracing.provider')}
      />

      <Switch
        label="Enable Metrics"
        {...form.getInputProps('observabilityConfig.metrics.enabled', { type: 'checkbox' })}
      />

      <Select
        label="Metrics Provider"
        data={[
          { value: 'MICROMETER', label: 'Micrometer' },
          { value: 'PROMETHEUS', label: 'Prometheus' },
        ]}
        {...form.getInputProps('observabilityConfig.metrics.provider')}
      />

      <Switch
        label="Enable Health Checks"
        {...form.getInputProps('observabilityConfig.health.enabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Application Info"
        {...form.getInputProps('observabilityConfig.info.enabled', { type: 'checkbox' })}
      />
    </Stack>
  );
}

/**
 * Resilience configuration form component
 */
function ResilienceSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable Circuit Breaker"
        {...form.getInputProps('resilienceConfig.circuitBreaker.enabled', { type: 'checkbox' })}
      />

      <Select
        label="Circuit Breaker Provider"
        data={[
          { value: 'RESILIENCE4J', label: 'Resilience4J' },
          { value: 'HYSTRIX', label: 'Hystrix' },
        ]}
        {...form.getInputProps('resilienceConfig.circuitBreaker.provider')}
      />

      <NumberInput
        label="Failure Threshold"
        description="Number of failures before opening circuit"
        {...form.getInputProps('resilienceConfig.circuitBreaker.failureThreshold')}
      />

      <NumberInput
        label="Recovery Timeout (seconds)"
        description="Time to wait before trying to close circuit"
        {...form.getInputProps('resilienceConfig.circuitBreaker.recoveryTimeoutSeconds')}
      />

      <Switch
        label="Enable Retry"
        {...form.getInputProps('resilienceConfig.retry.enabled', { type: 'checkbox' })}
      />

      <NumberInput
        label="Max Retry Attempts"
        {...form.getInputProps('resilienceConfig.retry.maxAttempts')}
      />

      <Switch
        label="Enable Timeout"
        {...form.getInputProps('resilienceConfig.timeout.enabled', { type: 'checkbox' })}
      />

      <NumberInput
        label="Timeout Duration (seconds)"
        {...form.getInputProps('resilienceConfig.timeout.durationSeconds')}
      />
    </Stack>
  );
}

/**
 * CORS configuration form component
 */
function CorsSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable CORS"
        {...form.getInputProps('corsConfig.enabled', { type: 'checkbox' })}
      />

      <TagsInput
        label="Allowed Origins"
        placeholder="https://example.com, https://app.example.com"
        {...form.getInputProps('corsConfig.allowedOrigins')}
      />

      <TagsInput
        label="Allowed Methods"
        placeholder="GET, POST, PUT, DELETE"
        {...form.getInputProps('corsConfig.allowedMethods')}
      />

      <TagsInput
        label="Allowed Headers"
        placeholder="Content-Type, Authorization"
        {...form.getInputProps('corsConfig.allowedHeaders')}
      />

      <Switch
        label="Allow Credentials"
        {...form.getInputProps('corsConfig.allowCredentials', { type: 'checkbox' })}
      />

      <NumberInput
        label="Max Age (seconds)"
        description="How long the browser can cache preflight response"
        {...form.getInputProps('corsConfig.maxAge')}
      />
    </Stack>
  );
}

/**
 * GraphQL configuration form component
 */
function GraphQLSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable GraphQL"
        {...form.getInputProps('graphqlConfig.enabled', { type: 'checkbox' })}
      />

      <TextInput
        label="GraphQL Endpoint"
        placeholder="/graphql"
        {...form.getInputProps('graphqlConfig.endpoint')}
      />

      <Switch
        label="Enable GraphiQL IDE"
        {...form.getInputProps('graphqlConfig.graphiql.enabled', { type: 'checkbox' })}
      />

      <TextInput
        label="GraphiQL Endpoint"
        placeholder="/graphiql"
        {...form.getInputProps('graphqlConfig.graphiql.endpoint')}
      />

      <Switch
        label="Enable Voyager"
        {...form.getInputProps('graphqlConfig.voyager.enabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Federation"
        {...form.getInputProps('graphqlConfig.federation.enabled', { type: 'checkbox' })}
      />
    </Stack>
  );
}

/**
 * gRPC configuration form component
 */
function GrpcSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable gRPC"
        {...form.getInputProps('grpcConfig.enabled', { type: 'checkbox' })}
      />

      <NumberInput
        label="gRPC Port"
        placeholder="9090"
        {...form.getInputProps('grpcConfig.port')}
      />

      <Switch
        label="Enable Reflection"
        {...form.getInputProps('grpcConfig.reflection.enabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Health Service"
        {...form.getInputProps('grpcConfig.health.enabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Metrics"
        {...form.getInputProps('grpcConfig.metrics.enabled', { type: 'checkbox' })}
      />
    </Stack>
  );
}

/**
 * Gateway configuration form component
 */
function GatewaySettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Switch
        label="Enable Gateway"
        {...form.getInputProps('gatewayConfig.enabled', { type: 'checkbox' })}
      />

      <NumberInput
        label="Gateway Port"
        placeholder="8080"
        {...form.getInputProps('gatewayConfig.port')}
      />

      <TextInput
        label="Gateway Path"
        placeholder="/api/**"
        {...form.getInputProps('gatewayConfig.path')}
      />

      <Switch
        label="Enable Load Balancing"
        {...form.getInputProps('gatewayConfig.loadBalancing.enabled', { type: 'checkbox' })}
      />

      <Select
        label="Load Balancing Strategy"
        data={[
          { value: 'ROUND_ROBIN', label: 'Round Robin' },
          { value: 'RANDOM', label: 'Random' },
          { value: 'WEIGHTED', label: 'Weighted' },
        ]}
        {...form.getInputProps('gatewayConfig.loadBalancing.strategy')}
      />

      <Switch
        label="Enable Circuit Breaker"
        {...form.getInputProps('gatewayConfig.circuitBreaker.enabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Rate Limiting"
        {...form.getInputProps('gatewayConfig.rateLimit.enabled', { type: 'checkbox' })}
      />

      <Switch
        label="Enable Request/Response Logging"
        {...form.getInputProps('gatewayConfig.logging.enabled', { type: 'checkbox' })}
      />

      <GatewayRouteDesigner
        routes={form.values.gatewayConfig.routes}
        onChange={(routes) => form.setFieldValue('gatewayConfig.routes', routes)}
      />
    </Stack>
  );
}

/**
 * Main ProjectSettings component - now much smaller and focused
 */
export function ProjectSettings({ opened, onClose }: Readonly<ProjectSettingsProps>) {
  const project = useProject();
  const { setProject } = useProjectActions();

  const form = useForm<ProjectConfig>({
    initialValues: project,
    validate: {
      name: (v) => (v ? null : 'Project name is required'),
      groupId: (v) => (isValidGroupId(v) ? null : 'Invalid group ID (e.g., com.example)'),
      artifactId: (v) =>
        isValidArtifactId(v) ? null : 'Invalid artifact ID (lowercase, hyphens allowed)',
      packageName: (v) =>
        isValidPackageName(v) ? null : 'Invalid package name (e.g., com.example.myapi)',
    },
  });

  const handleSubmit = (values: ProjectConfig) => {
    setProject(values);
    notifications.show({
      title: 'Saved',
      message: 'Project settings updated',
      color: 'green',
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconSettings size={20} />
          <Text fw={500}>Project Settings</Text>
        </Group>
      }
      size="xl"
      padding="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs defaultValue="basic" orientation="vertical">
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconFileText size={16} />}>
              Basic
            </Tabs.Tab>
            <Tabs.Tab value="database" leftSection={<IconDatabase size={16} />}>
              Database
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
              Security
            </Tabs.Tab>
            <Tabs.Tab value="rate-limit" leftSection={<IconClock size={16} />}>
              Rate Limiting
            </Tabs.Tab>
            <Tabs.Tab value="cache" leftSection={<IconRefresh size={16} />}>
              Cache
            </Tabs.Tab>
            <Tabs.Tab value="features" leftSection={<IconRocket size={16} />}>
              Features
            </Tabs.Tab>
            <Tabs.Tab value="observability" leftSection={<IconEye size={16} />}>
              Observability
            </Tabs.Tab>
            <Tabs.Tab value="resilience" leftSection={<IconShieldCheck size={16} />}>
              Resilience
            </Tabs.Tab>
            <Tabs.Tab value="cors" leftSection={<IconGlobe size={16} />}>
              CORS
            </Tabs.Tab>
            <Tabs.Tab value="graphql" leftSection={<IconBrandGraphql size={16} />}>
              GraphQL
            </Tabs.Tab>
            <Tabs.Tab value="grpc" leftSection={<IconNetwork size={16} />}>
              gRPC
            </Tabs.Tab>
            <Tabs.Tab value="gateway" leftSection={<IconRouter size={16} />}>
              Gateway
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pl="md">
            <ScrollArea h={600}>
              <BasicSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="database" pl="md">
            <ScrollArea h={600}>
              <DatabaseSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="security" pl="md">
            <ScrollArea h={600}>
              <SecuritySettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="rate-limit" pl="md">
            <ScrollArea h={600}>
              <RateLimitSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="cache" pl="md">
            <ScrollArea h={600}>
              <CacheSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="features" pl="md">
            <ScrollArea h={600}>
              <FeaturesSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="observability" pl="md">
            <ScrollArea h={600}>
              <ObservabilitySettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="resilience" pl="md">
            <ScrollArea h={600}>
              <ResilienceSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="cors" pl="md">
            <ScrollArea h={600}>
              <CorsSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="graphql" pl="md">
            <ScrollArea h={600}>
              <GraphQLSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="grpc" pl="md">
            <ScrollArea h={600}>
              <GrpcSettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="gateway" pl="md">
            <ScrollArea h={600}>
              <GatewaySettingsForm form={form} />
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" color="blue">
            Save Settings
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
