import {
  Accordion,
  Badge,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  TagsInput,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconApi,
  IconBrandDocker,
  IconBrandGraphql,
  IconChartBar,
  IconCloud,
  IconClock,
  IconDatabase,
  IconExchange,
  IconEye,
  IconFileText,
  IconFlag,
  IconGlobe,
  IconKey,
  IconLanguage,
  IconNetwork,
  IconRefresh,
  IconRocket,
  IconRouter,
  IconServer,
  IconSettings,
  IconShield,
  IconShieldCheck,
  IconTimeline,
  IconVersions,
  IconWebhook,
} from '@tabler/icons-react';
import { useProjectStore } from '../store/projectStore';
import { GatewayRouteDesigner } from './GatewayRouteDesigner';
import type {
  FeatureFlag,
  ProjectConfig,
  SupportedLocale,
  TenantStrategy,
  VersioningStrategy,
  WebhookEventType,
} from '../types';
import { isValidArtifactId, isValidGroupId, isValidPackageName } from '../utils/validation';

interface ProjectSettingsProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

export function ProjectSettings({ opened, onClose }: Readonly<ProjectSettingsProps>) {
  const { project, setProject } = useProjectStore();

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

  const handleGroupIdChange = (value: string) => {
    form.setFieldValue('groupId', value);
    if (form.values.artifactId) {
      const packageName = `${value}.${form.values.artifactId.replaceAll('-', '')}`;
      form.setFieldValue('packageName', packageName);
    }
  };

  const handleArtifactIdChange = (value: string) => {
    form.setFieldValue('artifactId', value);
    if (form.values.groupId) {
      const packageName = `${form.values.groupId}.${value.replaceAll('-', '')}`;
      form.setFieldValue('packageName', packageName);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconSettings size={20} />
          <Text fw={600}>Project Settings</Text>
        </Group>
      }
      size="xl"
      closeButtonProps={{ 'aria-label': 'Close' }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <ScrollArea h={500} offsetScrollbars>
          <Tabs defaultValue="general" orientation="vertical">
            <Tabs.List w={160}>
              <Tabs.Tab value="general" leftSection={<IconSettings size={14} />}>
                General
              </Tabs.Tab>
              <Tabs.Tab value="modules" leftSection={<IconRocket size={14} />}>
                Modules
              </Tabs.Tab>
              <Tabs.Tab value="features" leftSection={<IconApi size={14} />}>
                Features
              </Tabs.Tab>
              <Tabs.Tab value="security" leftSection={<IconShield size={14} />}>
                Security
              </Tabs.Tab>
              <Tabs.Tab value="database" leftSection={<IconDatabase size={14} />}>
                Database
              </Tabs.Tab>
              <Tabs.Tab value="advanced" leftSection={<IconServer size={14} />}>
                Advanced
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general" pl="md">
              <GeneralTab form={form} onGroupIdChange={handleGroupIdChange} onArtifactIdChange={handleArtifactIdChange} />
            </Tabs.Panel>

            <Tabs.Panel value="modules" pl="md">
              <ModulesTab form={form} />
            </Tabs.Panel>

            <Tabs.Panel value="features" pl="md">
              <FeaturesTab form={form} />
            </Tabs.Panel>

            <Tabs.Panel value="security" pl="md">
              <SecurityTab form={form} />
            </Tabs.Panel>

            <Tabs.Panel value="database" pl="md">
              <DatabaseTab form={form} />
            </Tabs.Panel>

            <Tabs.Panel value="advanced" pl="md">
              <AdvancedTab form={form} />
            </Tabs.Panel>
          </Tabs>
        </ScrollArea>

        <Divider my="md" />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Settings</Button>
        </Group>
      </form>
    </Modal>
  );
}

// ============================================================================
// GENERAL TAB
// ============================================================================

interface TabProps {
  form: ReturnType<typeof useForm<ProjectConfig>>;
}

interface GeneralTabProps extends TabProps {
  onGroupIdChange: (value: string) => void;
  onArtifactIdChange: (value: string) => void;
}

function GeneralTab({ form, onGroupIdChange, onArtifactIdChange }: Readonly<GeneralTabProps>) {
  return (
    <Stack>
      <TextInput
        label="Project Name"
        description="Display name for your project"
        placeholder="My API"
        {...form.getInputProps('name')}
      />

      <Group grow>
        <TextInput
          label="Group ID"
          description="Maven group ID"
          placeholder="com.example"
          {...form.getInputProps('groupId')}
          onChange={(e) => onGroupIdChange(e.target.value)}
        />
        <TextInput
          label="Artifact ID"
          description="Maven artifact ID"
          placeholder="my-api"
          {...form.getInputProps('artifactId')}
          onChange={(e) => onArtifactIdChange(e.target.value)}
        />
      </Group>

      <TextInput
        label="Package Name"
        description="Base Java package"
        placeholder="com.example.myapi"
        {...form.getInputProps('packageName')}
      />

      <Group grow>
        <Select
          label="Java Version"
          data={[
            { value: '21', label: 'Java 21 (LTS)' },
            { value: '25', label: 'Java 25 (Latest)' },
          ]}
          {...form.getInputProps('javaVersion')}
        />
        <TextInput
          label="Spring Boot Version"
          disabled
          value={form.values.springBootVersion}
        />
      </Group>
    </Stack>
  );
}

// ============================================================================
// MODULES TAB
// ============================================================================

function ModulesTab({ form }: Readonly<TabProps>) {
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        Select which APiGen modules to include in your project.
      </Text>

      <ModuleCard
        icon={<IconApi size={20} />}
        color="blue"
        name="apigen-core"
        description="Base entities, services, controllers, HATEOAS, filtering"
        required
      />

      <ModuleCard
        icon={<IconShield size={20} />}
        color="orange"
        name="apigen-security"
        description="JWT/OAuth2 authentication, PKCE, rate limiting, security headers"
        checked={form.values.modules.security}
        onChange={(checked) => form.setFieldValue('modules.security', checked)}
      />

      <ModuleCard
        icon={<IconBrandGraphql size={20} />}
        color="pink"
        name="apigen-graphql"
        description="GraphQL API with DataLoader, schema builder, introspection"
        checked={form.values.modules.graphql}
        onChange={(checked) => form.setFieldValue('modules.graphql', checked)}
      >
        <Collapse in={form.values.modules.graphql}>
          <Divider my="sm" />
          <Stack gap="sm">
            <SimpleGrid cols={2}>
              <TextInput
                label="GraphQL Path"
                {...form.getInputProps('graphqlConfig.path')}
              />
              <NumberInput
                label="Max Query Depth"
                min={1}
                max={50}
                {...form.getInputProps('graphqlConfig.maxQueryDepth')}
              />
            </SimpleGrid>
            <Group>
              <Switch
                label="Enable Tracing"
                checked={form.values.graphqlConfig.tracingEnabled}
                onChange={(e) => form.setFieldValue('graphqlConfig.tracingEnabled', e.currentTarget.checked)}
              />
              <Switch
                label="Enable Introspection"
                checked={form.values.graphqlConfig.introspectionEnabled}
                onChange={(e) => form.setFieldValue('graphqlConfig.introspectionEnabled', e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Collapse>
      </ModuleCard>

      <ModuleCard
        icon={<IconNetwork size={20} />}
        color="cyan"
        name="apigen-grpc"
        description="gRPC server/client, interceptors, health checks, protobuf"
        checked={form.values.modules.grpc}
        onChange={(checked) => form.setFieldValue('modules.grpc', checked)}
      >
        <Collapse in={form.values.modules.grpc}>
          <Divider my="sm" />
          <Stack gap="sm">
            <SimpleGrid cols={2}>
              <NumberInput
                label="Server Port"
                min={1024}
                max={65535}
                {...form.getInputProps('grpcConfig.serverPort')}
              />
              <NumberInput
                label="Client Deadline (ms)"
                min={1000}
                max={60000}
                {...form.getInputProps('grpcConfig.clientDeadlineMs')}
              />
            </SimpleGrid>
            <Group>
              <Switch
                label="Enable Logging"
                checked={form.values.grpcConfig.loggingEnabled}
                onChange={(e) => form.setFieldValue('grpcConfig.loggingEnabled', e.currentTarget.checked)}
              />
              <Switch
                label="Health Check"
                checked={form.values.grpcConfig.healthCheckEnabled}
                onChange={(e) => form.setFieldValue('grpcConfig.healthCheckEnabled', e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Collapse>
      </ModuleCard>

      <ModuleCard
        icon={<IconRouter size={20} />}
        color="grape"
        name="apigen-gateway"
        description="API Gateway with routing, circuit breaker, rate limiting"
        checked={form.values.modules.gateway}
        onChange={(checked) => form.setFieldValue('modules.gateway', checked)}
      >
        <Collapse in={form.values.modules.gateway}>
          <Divider my="sm" />
          <Stack gap="sm">
            <SimpleGrid cols={2}>
              <NumberInput
                label="Default Rate Limit (req/s)"
                min={1}
                max={10000}
                {...form.getInputProps('gatewayConfig.defaultRateLimitRequests')}
              />
              <NumberInput
                label="Circuit Breaker Timeout (s)"
                min={1}
                max={60}
                {...form.getInputProps('gatewayConfig.circuitBreakerTimeoutSeconds')}
              />
            </SimpleGrid>
            <Group>
              <Switch
                label="Enable Auth"
                checked={form.values.gatewayConfig.authEnabled}
                onChange={(e) => form.setFieldValue('gatewayConfig.authEnabled', e.currentTarget.checked)}
              />
              <Switch
                label="Enable Logging"
                checked={form.values.gatewayConfig.loggingEnabled}
                onChange={(e) => form.setFieldValue('gatewayConfig.loggingEnabled', e.currentTarget.checked)}
              />
              <Switch
                label="Circuit Breaker"
                checked={form.values.gatewayConfig.circuitBreakerEnabled}
                onChange={(e) => form.setFieldValue('gatewayConfig.circuitBreakerEnabled', e.currentTarget.checked)}
              />
            </Group>

            <Divider my="sm" label="Routes" labelPosition="left" />

            <GatewayRouteDesigner
              routes={form.values.gatewayConfig.routes}
              onRoutesChange={(routes) => form.setFieldValue('gatewayConfig.routes', routes)}
            />
          </Stack>
        </Collapse>
      </ModuleCard>
    </Stack>
  );
}

// ============================================================================
// FEATURES TAB
// ============================================================================

function FeaturesTab({ form }: Readonly<TabProps>) {
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        Enable or disable features for your API.
      </Text>

      <Accordion variant="separated" defaultValue="core">
        <Accordion.Item value="core">
          <Accordion.Control icon={<IconApi size={16} />}>Core Features</Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={2}>
              <FeatureSwitch
                icon={<IconApi size={16} />}
                label="HATEOAS"
                description="Hypermedia links in responses"
                checked={form.values.features.hateoas}
                onChange={(checked) => form.setFieldValue('features.hateoas', checked)}
              />
              <FeatureSwitch
                icon={<IconFileText size={16} />}
                label="Swagger/OpenAPI"
                description="API documentation"
                checked={form.values.features.swagger}
                onChange={(checked) => form.setFieldValue('features.swagger', checked)}
              />
              <FeatureSwitch
                icon={<IconEye size={16} />}
                label="Soft Delete"
                description="Logical deletion with restore"
                checked={form.values.features.softDelete}
                onChange={(checked) => form.setFieldValue('features.softDelete', checked)}
              />
              <FeatureSwitch
                icon={<IconClock size={16} />}
                label="Auditing"
                description="Track created/modified by/at"
                checked={form.values.features.auditing}
                onChange={(checked) => form.setFieldValue('features.auditing', checked)}
              />
              <FeatureSwitch
                icon={<IconTimeline size={16} />}
                label="Domain Events"
                description="Publish entity lifecycle events"
                checked={form.values.features.domainEvents}
                onChange={(checked) => form.setFieldValue('features.domainEvents', checked)}
              />
              <FeatureSwitch
                icon={<IconRefresh size={16} />}
                label="ETag Support"
                description="Conditional requests & caching"
                checked={form.values.features.etagSupport}
                onChange={(checked) => form.setFieldValue('features.etagSupport', checked)}
              />
            </SimpleGrid>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="performance">
          <Accordion.Control icon={<IconRocket size={16} />}>Performance</Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={2}>
              <FeatureSwitch
                icon={<IconRocket size={16} />}
                label="Caching"
                description="Entity and list caching"
                checked={form.values.features.caching}
                onChange={(checked) => form.setFieldValue('features.caching', checked)}
              />
              <FeatureSwitch
                icon={<IconDatabase size={16} />}
                label="Cursor Pagination"
                description="Efficient keyset pagination"
                checked={form.values.features.cursorPagination}
                onChange={(checked) => form.setFieldValue('features.cursorPagination', checked)}
              />
              <FeatureSwitch
                icon={<IconServer size={16} />}
                label="Virtual Threads"
                description="Java 21+ virtual threads"
                checked={form.values.features.virtualThreads}
                onChange={(checked) => form.setFieldValue('features.virtualThreads', checked)}
              />
              <FeatureSwitch
                icon={<IconExchange size={16} />}
                label="Batch Operations"
                description="Parallel batch processing"
                checked={form.values.features.batchOperations}
                onChange={(checked) => form.setFieldValue('features.batchOperations', checked)}
              />
            </SimpleGrid>

            <Collapse in={form.values.features.caching}>
              <Paper p="sm" withBorder mt="sm">
                <Text size="sm" fw={500} mb="xs">Cache Configuration</Text>
                <SimpleGrid cols={2}>
                  <Select
                    label="Cache Type"
                    data={[
                      { value: 'local', label: 'Local (Caffeine)' },
                      { value: 'redis', label: 'Distributed (Redis)' },
                    ]}
                    value={form.values.cacheConfig.type}
                    onChange={(v) => form.setFieldValue('cacheConfig.type', v as 'local' | 'redis')}
                  />
                  <NumberInput
                    label="Entity Cache Size"
                    min={100}
                    max={100000}
                    {...form.getInputProps('cacheConfig.entities.maxSize')}
                  />
                </SimpleGrid>
                <Collapse in={form.values.cacheConfig.type === 'redis'}>
                  <SimpleGrid cols={2} mt="sm">
                    <TextInput label="Redis Host" {...form.getInputProps('cacheConfig.redis.host')} />
                    <NumberInput label="Redis Port" {...form.getInputProps('cacheConfig.redis.port')} />
                  </SimpleGrid>
                </Collapse>
              </Paper>
            </Collapse>

            <Collapse in={form.values.features.batchOperations}>
              <Paper p="sm" withBorder mt="sm">
                <Text size="sm" fw={500} mb="xs">Batch Configuration</Text>
                <SimpleGrid cols={3}>
                  <NumberInput label="Batch Size" min={10} max={1000} {...form.getInputProps('batchConfig.defaultBatchSize')} />
                  <NumberInput label="Max Concurrent" min={1} max={100} {...form.getInputProps('batchConfig.maxConcurrent')} />
                  <NumberInput label="Timeout (s)" min={10} max={300} {...form.getInputProps('batchConfig.timeoutSeconds')} />
                </SimpleGrid>
              </Paper>
            </Collapse>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="integration">
          <Accordion.Control icon={<IconGlobe size={16} />}>Integration</Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={2}>
              <FeatureSwitch
                icon={<IconLanguage size={16} />}
                label="Internationalization"
                description="Multi-language support (i18n)"
                checked={form.values.features.i18n}
                onChange={(checked) => form.setFieldValue('features.i18n', checked)}
              />
              <FeatureSwitch
                icon={<IconWebhook size={16} />}
                label="Webhooks"
                description="Event notifications with HMAC"
                checked={form.values.features.webhooks}
                onChange={(checked) => form.setFieldValue('features.webhooks', checked)}
              />
              <FeatureSwitch
                icon={<IconFileText size={16} />}
                label="Bulk Import/Export"
                description="CSV and Excel support"
                checked={form.values.features.bulkOperations}
                onChange={(checked) => form.setFieldValue('features.bulkOperations', checked)}
              />
              <FeatureSwitch
                icon={<IconCloud size={16} />}
                label="SSE Updates"
                description="Server-Sent Events for real-time"
                checked={form.values.features.sseUpdates}
                onChange={(checked) => form.setFieldValue('features.sseUpdates', checked)}
              />
            </SimpleGrid>

            <Collapse in={form.values.features.i18n}>
              <Paper p="sm" withBorder mt="sm">
                <Text size="sm" fw={500} mb="xs">i18n Configuration</Text>
                <SimpleGrid cols={2}>
                  <Select
                    label="Default Locale"
                    data={LOCALE_OPTIONS}
                    value={form.values.i18nConfig.defaultLocale}
                    onChange={(v) => form.setFieldValue('i18nConfig.defaultLocale', v as SupportedLocale)}
                  />
                  <MultiSelect
                    label="Supported Locales"
                    data={LOCALE_OPTIONS}
                    value={form.values.i18nConfig.supportedLocales}
                    onChange={(v) => form.setFieldValue('i18nConfig.supportedLocales', v as SupportedLocale[])}
                  />
                </SimpleGrid>
              </Paper>
            </Collapse>

            <Collapse in={form.values.features.webhooks}>
              <Paper p="sm" withBorder mt="sm">
                <Text size="sm" fw={500} mb="xs">Webhook Configuration</Text>
                <MultiSelect
                  label="Enabled Events"
                  data={WEBHOOK_EVENT_OPTIONS}
                  value={form.values.webhooksConfig.events}
                  onChange={(v) => form.setFieldValue('webhooksConfig.events', v as WebhookEventType[])}
                />
                <SimpleGrid cols={3} mt="sm">
                  <NumberInput label="Max Retries" min={0} max={10} {...form.getInputProps('webhooksConfig.maxRetries')} />
                  <NumberInput label="Timeout (s)" min={5} max={120} {...form.getInputProps('webhooksConfig.requestTimeoutSeconds')} />
                  <NumberInput label="Retry Delay (s)" min={1} max={60} {...form.getInputProps('webhooksConfig.retryBaseDelaySeconds')} />
                </SimpleGrid>
              </Paper>
            </Collapse>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="architecture">
          <Accordion.Control icon={<IconServer size={16} />}>Architecture</Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={2}>
              <FeatureSwitch
                icon={<IconServer size={16} />}
                label="Multi-Tenancy"
                description="Tenant isolation support"
                checked={form.values.features.multiTenancy}
                onChange={(checked) => form.setFieldValue('features.multiTenancy', checked)}
              />
              <FeatureSwitch
                icon={<IconTimeline size={16} />}
                label="Event Sourcing"
                description="Event store with snapshots"
                checked={form.values.features.eventSourcing}
                onChange={(checked) => form.setFieldValue('features.eventSourcing', checked)}
              />
              <FeatureSwitch
                icon={<IconVersions size={16} />}
                label="API Versioning"
                description="Version headers and deprecation"
                checked={form.values.features.apiVersioning}
                onChange={(checked) => form.setFieldValue('features.apiVersioning', checked)}
              />
              <FeatureSwitch
                icon={<IconBrandDocker size={16} />}
                label="Docker"
                description="Dockerfile & docker-compose"
                checked={form.values.features.docker}
                onChange={(checked) => form.setFieldValue('features.docker', checked)}
              />
            </SimpleGrid>

            <Collapse in={form.values.features.multiTenancy}>
              <Paper p="sm" withBorder mt="sm">
                <Text size="sm" fw={500} mb="xs">Multi-Tenancy Configuration</Text>
                <SimpleGrid cols={2}>
                  <MultiSelect
                    label="Resolution Strategies"
                    data={TENANT_STRATEGY_OPTIONS}
                    value={form.values.multiTenancyConfig.strategies}
                    onChange={(v) => form.setFieldValue('multiTenancyConfig.strategies', v as TenantStrategy[])}
                  />
                  <TextInput label="Tenant Header" {...form.getInputProps('multiTenancyConfig.tenantHeader')} />
                </SimpleGrid>
                <Group mt="sm">
                  <Switch
                    label="Require Tenant"
                    checked={form.values.multiTenancyConfig.requireTenant}
                    onChange={(e) => form.setFieldValue('multiTenancyConfig.requireTenant', e.currentTarget.checked)}
                  />
                </Group>
              </Paper>
            </Collapse>

            <Collapse in={form.values.features.apiVersioning}>
              <Paper p="sm" withBorder mt="sm">
                <Text size="sm" fw={500} mb="xs">API Versioning Configuration</Text>
                <SimpleGrid cols={2}>
                  <TextInput label="Default Version" {...form.getInputProps('apiVersioningConfig.defaultVersion')} />
                  <MultiSelect
                    label="Strategies"
                    data={VERSIONING_STRATEGY_OPTIONS}
                    value={form.values.apiVersioningConfig.strategies}
                    onChange={(v) => form.setFieldValue('apiVersioningConfig.strategies', v as VersioningStrategy[])}
                  />
                </SimpleGrid>
              </Paper>
            </Collapse>

            <Collapse in={form.values.features.eventSourcing}>
              <Paper p="sm" withBorder mt="sm">
                <Text size="sm" fw={500} mb="xs">Event Sourcing Configuration</Text>
                <SimpleGrid cols={2}>
                  <NumberInput label="Snapshot Threshold" min={10} max={1000} {...form.getInputProps('eventSourcingConfig.snapshotThreshold')} />
                  <TextInput label="Event Table" {...form.getInputProps('eventSourcingConfig.eventTableName')} />
                </SimpleGrid>
              </Paper>
            </Collapse>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

// ============================================================================
// SECURITY TAB
// ============================================================================

function SecurityTab({ form }: Readonly<TabProps>) {
  const isJwtMode = form.values.securityConfig.mode === 'jwt';

  return (
    <Stack>
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon color="orange" size="lg" radius="md">
              <IconShield size={20} />
            </ThemeIcon>
            <div>
              <Text fw={500}>Security Module</Text>
              <Text size="xs" c="dimmed">Authentication and authorization</Text>
            </div>
          </Group>
          <Switch
            checked={form.values.modules.security}
            onChange={(e) => form.setFieldValue('modules.security', e.currentTarget.checked)}
          />
        </Group>

        <Collapse in={form.values.modules.security}>
          <SegmentedControl
            fullWidth
            mb="md"
            data={[
              { value: 'jwt', label: 'JWT (Self-managed)' },
              { value: 'oauth2', label: 'OAuth2 (External Provider)' },
            ]}
            value={form.values.securityConfig.mode}
            onChange={(v) => form.setFieldValue('securityConfig.mode', v as 'jwt' | 'oauth2')}
          />

          {isJwtMode ? (
            <JwtSecurityConfig form={form} />
          ) : (
            <OAuth2SecurityConfig form={form} />
          )}

          <Divider my="md" label="Security Headers" labelPosition="center" />
          <SecurityHeadersConfig form={form} />

          <Divider my="md" label="Rate Limiting" labelPosition="center" />
          <RateLimitingConfig form={form} />
        </Collapse>
      </Paper>
    </Stack>
  );
}

function JwtSecurityConfig({ form }: Readonly<TabProps>) {
  return (
    <Stack gap="sm">
      <SimpleGrid cols={2}>
        <Select
          label="JWT Secret Length"
          data={[
            { value: '32', label: '32 bytes (256 bits)' },
            { value: '64', label: '64 bytes (512 bits)' },
            { value: '128', label: '128 bytes (1024 bits)' },
          ]}
          value={String(form.values.securityConfig.jwtSecretLength)}
          onChange={(v) => form.setFieldValue('securityConfig.jwtSecretLength', Number(v) as 32 | 64 | 128)}
        />
        <NumberInput
          label="Access Token Expiration (min)"
          min={5}
          max={1440}
          {...form.getInputProps('securityConfig.accessTokenExpiration')}
        />
      </SimpleGrid>

      <SimpleGrid cols={2}>
        <NumberInput
          label="Refresh Token Expiration (days)"
          min={1}
          max={90}
          {...form.getInputProps('securityConfig.refreshTokenExpiration')}
        />
        <NumberInput
          label="Lockout Duration (min)"
          min={1}
          max={1440}
          {...form.getInputProps('securityConfig.lockoutMinutes')}
        />
      </SimpleGrid>

      <SimpleGrid cols={2}>
        <NumberInput
          label="Password Min Length"
          min={6}
          max={32}
          {...form.getInputProps('securityConfig.passwordMinLength')}
        />
        <NumberInput
          label="Max Login Attempts"
          min={3}
          max={10}
          {...form.getInputProps('securityConfig.maxLoginAttempts')}
        />
      </SimpleGrid>

      <Group>
        <Switch
          label="Enable Refresh Token"
          checked={form.values.securityConfig.enableRefreshToken}
          onChange={(e) => form.setFieldValue('securityConfig.enableRefreshToken', e.currentTarget.checked)}
        />
        <Switch
          label="Enable Token Blacklist"
          checked={form.values.securityConfig.enableTokenBlacklist}
          onChange={(e) => form.setFieldValue('securityConfig.enableTokenBlacklist', e.currentTarget.checked)}
        />
      </Group>

      <Paper p="sm" withBorder>
        <Group justify="space-between" mb="sm">
          <Text size="sm" fw={500}><IconKey size={14} style={{ marginRight: 4 }} />JWT Key Rotation</Text>
          <Switch
            size="sm"
            checked={form.values.securityConfig.keyRotation.enabled}
            onChange={(e) => form.setFieldValue('securityConfig.keyRotation.enabled', e.currentTarget.checked)}
          />
        </Group>
        <Collapse in={form.values.securityConfig.keyRotation.enabled}>
          <TextInput
            label="Current Key ID"
            placeholder="key-2025-01"
            {...form.getInputProps('securityConfig.keyRotation.currentKeyId')}
          />
        </Collapse>
      </Paper>

      <Paper p="sm" withBorder>
        <Group justify="space-between" mb="sm">
          <Text size="sm" fw={500}><IconShieldCheck size={14} style={{ marginRight: 4 }} />PKCE (RFC 7636)</Text>
          <Switch
            size="sm"
            checked={form.values.securityConfig.pkce.enabled}
            onChange={(e) => form.setFieldValue('securityConfig.pkce.enabled', e.currentTarget.checked)}
          />
        </Group>
        <Collapse in={form.values.securityConfig.pkce.enabled}>
          <SimpleGrid cols={2}>
            <NumberInput
              label="Code Expiration (min)"
              min={1}
              max={30}
              {...form.getInputProps('securityConfig.pkce.codeExpirationMinutes')}
            />
            <Switch
              label="Require S256"
              checked={form.values.securityConfig.pkce.requireS256}
              onChange={(e) => form.setFieldValue('securityConfig.pkce.requireS256', e.currentTarget.checked)}
              mt="lg"
            />
          </SimpleGrid>
        </Collapse>
      </Paper>
    </Stack>
  );
}

function OAuth2SecurityConfig({ form }: Readonly<TabProps>) {
  return (
    <Stack gap="sm">
      <TextInput
        label="Issuer URI"
        placeholder="https://your-tenant.auth0.com/"
        {...form.getInputProps('securityConfig.oauth2.issuerUri')}
      />
      <TextInput
        label="Audience"
        placeholder="your-api-identifier"
        {...form.getInputProps('securityConfig.oauth2.audience')}
      />
      <SimpleGrid cols={2}>
        <TextInput
          label="Roles Claim"
          placeholder="permissions"
          {...form.getInputProps('securityConfig.oauth2.rolesClaim')}
        />
        <TextInput
          label="Username Claim"
          placeholder="sub"
          {...form.getInputProps('securityConfig.oauth2.usernameClaim')}
        />
      </SimpleGrid>
    </Stack>
  );
}

function SecurityHeadersConfig({ form }: Readonly<TabProps>) {
  return (
    <Stack gap="sm">
      <TextInput
        label="Content Security Policy"
        {...form.getInputProps('securityConfig.headers.contentSecurityPolicy')}
      />
      <SimpleGrid cols={2}>
        <Select
          label="Referrer Policy"
          data={REFERRER_POLICY_OPTIONS}
          {...form.getInputProps('securityConfig.headers.referrerPolicy')}
        />
        <NumberInput
          label="HSTS Max Age (seconds)"
          min={0}
          max={63072000}
          {...form.getInputProps('securityConfig.headers.hstsMaxAgeSeconds')}
        />
      </SimpleGrid>
      <Group>
        <Switch
          label="Enable HSTS"
          checked={form.values.securityConfig.headers.hstsEnabled}
          onChange={(e) => form.setFieldValue('securityConfig.headers.hstsEnabled', e.currentTarget.checked)}
        />
        <Switch
          label="Include Subdomains"
          checked={form.values.securityConfig.headers.hstsIncludeSubdomains}
          onChange={(e) => form.setFieldValue('securityConfig.headers.hstsIncludeSubdomains', e.currentTarget.checked)}
        />
        <Switch
          label="HSTS Preload"
          checked={form.values.securityConfig.headers.hstsPreload}
          onChange={(e) => form.setFieldValue('securityConfig.headers.hstsPreload', e.currentTarget.checked)}
        />
      </Group>
    </Stack>
  );
}

function RateLimitingConfig({ form }: Readonly<TabProps>) {
  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="sm" fw={500}>Enable Rate Limiting</Text>
        <Switch
          checked={form.values.features.rateLimiting}
          onChange={(e) => form.setFieldValue('features.rateLimiting', e.currentTarget.checked)}
        />
      </Group>
      <Collapse in={form.values.features.rateLimiting}>
        <Stack gap="sm">
          <SegmentedControl
            fullWidth
            data={[
              { value: 'IN_MEMORY', label: 'In-Memory' },
              { value: 'REDIS', label: 'Redis (Distributed)' },
            ]}
            value={form.values.rateLimitConfig.storageMode}
            onChange={(v) => form.setFieldValue('rateLimitConfig.storageMode', v as 'IN_MEMORY' | 'REDIS')}
          />
          <SimpleGrid cols={2}>
            <NumberInput
              label="Requests Per Second"
              min={1}
              max={10000}
              {...form.getInputProps('rateLimitConfig.requestsPerSecond')}
            />
            <NumberInput
              label="Burst Capacity"
              min={1}
              max={10000}
              {...form.getInputProps('rateLimitConfig.burstCapacity')}
            />
          </SimpleGrid>
          <SimpleGrid cols={2}>
            <NumberInput
              label="Auth Requests Per Minute"
              min={1}
              max={100}
              {...form.getInputProps('rateLimitConfig.authRequestsPerMinute')}
            />
            <NumberInput
              label="Block Duration (s)"
              min={10}
              max={3600}
              {...form.getInputProps('rateLimitConfig.blockDurationSeconds')}
            />
          </SimpleGrid>
          <Group>
            <Switch
              label="Per User Limits"
              checked={form.values.rateLimitConfig.enablePerUser}
              onChange={(e) => form.setFieldValue('rateLimitConfig.enablePerUser', e.currentTarget.checked)}
            />
            <Switch
              label="Per Endpoint Limits"
              checked={form.values.rateLimitConfig.enablePerEndpoint}
              onChange={(e) => form.setFieldValue('rateLimitConfig.enablePerEndpoint', e.currentTarget.checked)}
            />
          </Group>
        </Stack>
      </Collapse>
    </Stack>
  );
}

// ============================================================================
// DATABASE TAB
// ============================================================================

function DatabaseTab({ form }: Readonly<TabProps>) {
  return (
    <Stack>
      <Select
        label="Database Type"
        description="Primary database for your application"
        data={[
          { value: 'postgresql', label: 'PostgreSQL (Recommended)' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'mariadb', label: 'MariaDB' },
          { value: 'mongodb', label: 'MongoDB (NoSQL)' },
          { value: 'oracle', label: 'Oracle Database' },
          { value: 'sqlserver', label: 'SQL Server' },
          { value: 'h2', label: 'H2 (In-memory, dev only)' },
        ]}
        {...form.getInputProps('database.type')}
      />

      <Switch
        label="Generate Flyway Migrations"
        description="Create SQL migration files for schema changes"
        checked={form.values.database.generateMigrations}
        onChange={(e) => form.setFieldValue('database.generateMigrations', e.currentTarget.checked)}
      />

      <Divider my="md" label="HikariCP Connection Pool" labelPosition="center" />

      <SimpleGrid cols={2}>
        <NumberInput
          label="Maximum Pool Size"
          min={5}
          max={100}
          {...form.getInputProps('database.hikari.maximumPoolSize')}
        />
        <NumberInput
          label="Minimum Idle"
          min={1}
          max={50}
          {...form.getInputProps('database.hikari.minimumIdle')}
        />
      </SimpleGrid>
      <SimpleGrid cols={2}>
        <NumberInput
          label="Connection Timeout (ms)"
          min={1000}
          max={60000}
          step={1000}
          {...form.getInputProps('database.hikari.connectionTimeoutMs')}
        />
        <NumberInput
          label="Idle Timeout (ms)"
          min={10000}
          max={1800000}
          step={1000}
          {...form.getInputProps('database.hikari.idleTimeoutMs')}
        />
      </SimpleGrid>
    </Stack>
  );
}

// ============================================================================
// ADVANCED TAB
// ============================================================================

function AdvancedTab({ form }: Readonly<TabProps>) {
  return (
    <Stack>
      <Accordion variant="separated">
        <Accordion.Item value="observability">
          <Accordion.Control icon={<IconChartBar size={16} />}>Observability</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Paper p="sm" withBorder>
                <Group justify="space-between" mb="sm">
                  <Text size="sm" fw={500}>OpenTelemetry Tracing</Text>
                  <Switch
                    size="sm"
                    checked={form.values.observabilityConfig.tracing.enabled}
                    onChange={(e) => form.setFieldValue('observabilityConfig.tracing.enabled', e.currentTarget.checked)}
                  />
                </Group>
                <Collapse in={form.values.observabilityConfig.tracing.enabled}>
                  <SimpleGrid cols={2}>
                    <TextInput label="OTLP Endpoint" {...form.getInputProps('observabilityConfig.tracing.otlpEndpoint')} />
                    <NumberInput
                      label="Sampling Probability"
                      min={0}
                      max={1}
                      step={0.1}
                      decimalScale={2}
                      {...form.getInputProps('observabilityConfig.tracing.samplingProbability')}
                    />
                  </SimpleGrid>
                </Collapse>
              </Paper>

              <Paper p="sm" withBorder>
                <Group justify="space-between" mb="sm">
                  <Text size="sm" fw={500}>Metrics</Text>
                  <Switch
                    size="sm"
                    checked={form.values.observabilityConfig.metrics.enabled}
                    onChange={(e) => form.setFieldValue('observabilityConfig.metrics.enabled', e.currentTarget.checked)}
                  />
                </Group>
                <Collapse in={form.values.observabilityConfig.metrics.enabled}>
                  <Group>
                    <Switch
                      label="HikariCP Metrics"
                      checked={form.values.observabilityConfig.metrics.exposeHikariMetrics}
                      onChange={(e) => form.setFieldValue('observabilityConfig.metrics.exposeHikariMetrics', e.currentTarget.checked)}
                    />
                    <Switch
                      label="Prometheus Endpoint"
                      checked={form.values.observabilityConfig.metrics.exposePrometheus}
                      onChange={(e) => form.setFieldValue('observabilityConfig.metrics.exposePrometheus', e.currentTarget.checked)}
                    />
                  </Group>
                </Collapse>
              </Paper>

              <Paper p="sm" withBorder>
                <Group justify="space-between" mb="sm">
                  <Text size="sm" fw={500}>N+1 Query Detection</Text>
                  <Switch
                    size="sm"
                    checked={form.values.observabilityConfig.queryAnalysis.enabled}
                    onChange={(e) => form.setFieldValue('observabilityConfig.queryAnalysis.enabled', e.currentTarget.checked)}
                  />
                </Group>
                <Collapse in={form.values.observabilityConfig.queryAnalysis.enabled}>
                  <SimpleGrid cols={2}>
                    <NumberInput label="Warn Threshold" min={1} max={50} {...form.getInputProps('observabilityConfig.queryAnalysis.warnThreshold')} />
                    <NumberInput label="Error Threshold" min={5} max={100} {...form.getInputProps('observabilityConfig.queryAnalysis.errorThreshold')} />
                  </SimpleGrid>
                  <Group mt="sm">
                    <Switch
                      label="Log Slow Queries"
                      checked={form.values.observabilityConfig.queryAnalysis.logSlowQueries}
                      onChange={(e) => form.setFieldValue('observabilityConfig.queryAnalysis.logSlowQueries', e.currentTarget.checked)}
                    />
                  </Group>
                </Collapse>
              </Paper>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="resilience">
          <Accordion.Control icon={<IconShieldCheck size={16} />}>Resilience</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Paper p="sm" withBorder>
                <Group justify="space-between" mb="sm">
                  <Text size="sm" fw={500}>Circuit Breaker</Text>
                  <Switch
                    size="sm"
                    checked={form.values.resilienceConfig.circuitBreaker.enabled}
                    onChange={(e) => form.setFieldValue('resilienceConfig.circuitBreaker.enabled', e.currentTarget.checked)}
                  />
                </Group>
                <Collapse in={form.values.resilienceConfig.circuitBreaker.enabled}>
                  <SimpleGrid cols={2}>
                    <NumberInput label="Sliding Window Size" min={10} max={1000} {...form.getInputProps('resilienceConfig.circuitBreaker.slidingWindowSize')} />
                    <NumberInput label="Failure Rate (%)" min={1} max={100} {...form.getInputProps('resilienceConfig.circuitBreaker.failureRateThreshold')} />
                  </SimpleGrid>
                  <SimpleGrid cols={2} mt="sm">
                    <NumberInput label="Slow Call Threshold (%)" min={1} max={100} {...form.getInputProps('resilienceConfig.circuitBreaker.slowCallRateThreshold')} />
                    <NumberInput label="Wait Duration (s)" min={1} max={300} {...form.getInputProps('resilienceConfig.circuitBreaker.waitDurationInOpenStateSeconds')} />
                  </SimpleGrid>
                </Collapse>
              </Paper>

              <Paper p="sm" withBorder>
                <Group justify="space-between" mb="sm">
                  <Text size="sm" fw={500}>Retry</Text>
                  <Switch
                    size="sm"
                    checked={form.values.resilienceConfig.retry.enabled}
                    onChange={(e) => form.setFieldValue('resilienceConfig.retry.enabled', e.currentTarget.checked)}
                  />
                </Group>
                <Collapse in={form.values.resilienceConfig.retry.enabled}>
                  <SimpleGrid cols={2}>
                    <NumberInput label="Max Attempts" min={1} max={10} {...form.getInputProps('resilienceConfig.retry.maxAttempts')} />
                    <NumberInput label="Wait Duration (ms)" min={100} max={10000} {...form.getInputProps('resilienceConfig.retry.waitDurationMs')} />
                  </SimpleGrid>
                  <Group mt="sm">
                    <Switch
                      label="Exponential Backoff"
                      checked={form.values.resilienceConfig.retry.enableExponentialBackoff}
                      onChange={(e) => form.setFieldValue('resilienceConfig.retry.enableExponentialBackoff', e.currentTarget.checked)}
                    />
                  </Group>
                </Collapse>
              </Paper>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="featureFlags">
          <Accordion.Control icon={<IconFlag size={16} />}>Feature Flags (Togglz)</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Enable Runtime Feature Flags</Text>
                <Switch
                  checked={form.values.featureFlags.enabled}
                  onChange={(e) => form.setFieldValue('featureFlags.enabled', e.currentTarget.checked)}
                />
              </Group>
              <Collapse in={form.values.featureFlags.enabled}>
                <Switch
                  label="Enable Togglz Console (/togglz-console)"
                  checked={form.values.featureFlags.consoleEnabled}
                  onChange={(e) => form.setFieldValue('featureFlags.consoleEnabled', e.currentTarget.checked)}
                  mb="sm"
                />
                <Text size="sm" c="dimmed" mb="xs">Default flag states:</Text>
                <SimpleGrid cols={2}>
                  {FEATURE_FLAGS.map((flag) => (
                    <Checkbox
                      key={flag}
                      label={flag.replaceAll('_', ' ')}
                      checked={form.values.featureFlags.flags[flag]}
                      onChange={(e) => form.setFieldValue(`featureFlags.flags.${flag}`, e.currentTarget.checked)}
                    />
                  ))}
                </SimpleGrid>
              </Collapse>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="cors">
          <Accordion.Control icon={<IconGlobe size={16} />}>CORS Configuration</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <TagsInput
                label="Allowed Origins"
                placeholder="http://localhost:3000"
                value={form.values.corsConfig.allowedOrigins}
                onChange={(v) => form.setFieldValue('corsConfig.allowedOrigins', v)}
              />
              <TagsInput
                label="Allowed Methods"
                placeholder="GET"
                value={form.values.corsConfig.allowedMethods}
                onChange={(v) => form.setFieldValue('corsConfig.allowedMethods', v)}
              />
              <TagsInput
                label="Allowed Headers"
                placeholder="Authorization"
                value={form.values.corsConfig.allowedHeaders}
                onChange={(v) => form.setFieldValue('corsConfig.allowedHeaders', v)}
              />
              <SimpleGrid cols={2}>
                <NumberInput label="Max Age (seconds)" min={0} max={86400} {...form.getInputProps('corsConfig.maxAgeSeconds')} />
                <Switch
                  label="Allow Credentials"
                  checked={form.values.corsConfig.allowCredentials}
                  onChange={(e) => form.setFieldValue('corsConfig.allowCredentials', e.currentTarget.checked)}
                  mt="lg"
                />
              </SimpleGrid>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ModuleCardProps {
  icon: React.ReactNode;
  color: string;
  name: string;
  description: string;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
}

function ModuleCard({ icon, color, name, description, required, checked, onChange, children }: Readonly<ModuleCardProps>) {
  return (
    <Paper p="md" withBorder>
      <Group justify="space-between">
        <Group>
          <ThemeIcon color={color} size="lg" radius="md">
            {icon}
          </ThemeIcon>
          <div>
            <Text fw={500}>{name}</Text>
            <Text size="xs" c="dimmed">{description}</Text>
          </div>
        </Group>
        {required ? (
          <Badge color="blue">Required</Badge>
        ) : (
          <Switch checked={checked} onChange={(e) => onChange?.(e.currentTarget.checked)} />
        )}
      </Group>
      {children}
    </Paper>
  );
}

interface FeatureSwitchProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly description: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

function FeatureSwitch({ icon, label, description, checked, onChange }: Readonly<FeatureSwitchProps>) {
  return (
    <Paper p="sm" withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size="sm" variant="light" color="gray">
            {icon}
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500}>{label}</Text>
            <Text size="xs" c="dimmed">{description}</Text>
          </div>
        </Group>
        <Switch checked={checked} onChange={(e) => onChange(e.currentTarget.checked)} />
      </Group>
    </Paper>
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOCALE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
];

const WEBHOOK_EVENT_OPTIONS = [
  { value: 'entity.created', label: 'Entity Created' },
  { value: 'entity.updated', label: 'Entity Updated' },
  { value: 'entity.deleted', label: 'Entity Deleted' },
  { value: 'entity.restored', label: 'Entity Restored' },
  { value: 'batch.import_completed', label: 'Batch Import Completed' },
  { value: 'batch.export_completed', label: 'Batch Export Completed' },
  { value: 'user.login', label: 'User Login' },
  { value: 'user.logout', label: 'User Logout' },
  { value: 'user.login_failed', label: 'User Login Failed' },
  { value: 'security.rate_limit_exceeded', label: 'Rate Limit Exceeded' },
  { value: 'security.unauthorized_access', label: 'Unauthorized Access' },
  { value: 'system.ping', label: 'System Ping' },
  { value: 'system.health_changed', label: 'Health Changed' },
];

const TENANT_STRATEGY_OPTIONS = [
  { value: 'HEADER', label: 'HTTP Header' },
  { value: 'SUBDOMAIN', label: 'Subdomain' },
  { value: 'PATH', label: 'URL Path' },
  { value: 'JWT_CLAIM', label: 'JWT Claim' },
];

const VERSIONING_STRATEGY_OPTIONS = [
  { value: 'HEADER', label: 'HTTP Header' },
  { value: 'PATH', label: 'URL Path' },
  { value: 'QUERY_PARAM', label: 'Query Parameter' },
  { value: 'MEDIA_TYPE', label: 'Media Type' },
];

const REFERRER_POLICY_OPTIONS = [
  { value: 'no-referrer', label: 'No Referrer' },
  { value: 'no-referrer-when-downgrade', label: 'No Referrer When Downgrade' },
  { value: 'origin', label: 'Origin' },
  { value: 'origin-when-cross-origin', label: 'Origin When Cross-Origin' },
  { value: 'same-origin', label: 'Same Origin' },
  { value: 'strict-origin', label: 'Strict Origin' },
  { value: 'strict-origin-when-cross-origin', label: 'Strict Origin When Cross-Origin' },
  { value: 'unsafe-url', label: 'Unsafe URL' },
];

const FEATURE_FLAGS: FeatureFlag[] = [
  'CACHING',
  'CIRCUIT_BREAKER',
  'RATE_LIMITING',
  'CURSOR_PAGINATION',
  'ETAG_SUPPORT',
  'SOFT_DELETE',
  'DOMAIN_EVENTS',
  'HATEOAS',
  'AUDIT_LOGGING',
  'SSE_UPDATES',
  'TRACING',
  'METRICS',
  'ADVANCED_FILTERING',
  'BATCH_OPERATIONS',
];
