import {
  Alert,
  Button,
  Collapse,
  Divider,
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
  Title,
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
  IconInfoCircle,
  IconNetwork,
  IconRefresh,
  IconRocket,
  IconRouter,
  IconSettings,
  IconShield,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useProject, useProjectActions } from '../store';
import type { GatewayRouteConfig, ProjectConfig } from '../types';
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
          { value: '21', label: 'Java 21 (LTS)' },
          { value: '25', label: 'Java 25' },
        ]}
        {...form.getInputProps('javaVersion')}
      />

      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        <Text size="sm">Spring Boot version is determined by APiGen Core (currently 4.0.0)</Text>
      </Alert>
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
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'mariadb', label: 'MariaDB' },
          { value: 'h2', label: 'H2 (Embedded)' },
          { value: 'oracle', label: 'Oracle' },
          { value: 'sqlserver', label: 'SQL Server' },
          { value: 'mongodb', label: 'MongoDB' },
        ]}
        {...form.getInputProps('database.type')}
      />

      <Switch
        label="Generate Migrations"
        description="Generate Flyway/Liquibase migrations"
        {...form.getInputProps('database.generateMigrations', { type: 'checkbox' })}
      />

      <Divider label="Connection Pool (HikariCP)" labelPosition="left" mt="md" />

      <NumberInput
        label="Maximum Pool Size"
        description="Maximum number of connections in the pool"
        min={1}
        max={100}
        {...form.getInputProps('database.hikari.maximumPoolSize')}
      />

      <NumberInput
        label="Minimum Idle"
        description="Minimum number of idle connections to maintain"
        min={0}
        max={50}
        {...form.getInputProps('database.hikari.minimumIdle')}
      />

      <NumberInput
        label="Connection Timeout (ms)"
        description="Maximum time to wait for a connection"
        min={1000}
        step={1000}
        {...form.getInputProps('database.hikari.connectionTimeoutMs')}
      />

      <NumberInput
        label="Idle Timeout (ms)"
        description="Maximum time a connection can remain idle"
        min={10000}
        step={1000}
        {...form.getInputProps('database.hikari.idleTimeoutMs')}
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
        label="Enable Security Module"
        description="Enable authentication and authorization"
        {...form.getInputProps('modules.security', { type: 'checkbox' })}
      />

      <Collapse in={form.values.modules.security}>
        <Stack mt="md">
          <Select
            label="Security Mode"
            description="Authentication/authorization approach"
            data={[
              { value: 'jwt', label: 'JWT (JSON Web Tokens)' },
              { value: 'oauth2', label: 'OAuth2 / OpenID Connect' },
            ]}
            {...form.getInputProps('securityConfig.mode')}
          />

          <Collapse in={form.values.securityConfig.mode === 'jwt'}>
            <Stack mt="md">
              <Title order={6}>JWT Configuration</Title>
              <Select
                label="Secret Key Length"
                data={[
                  { value: '32', label: '32 bytes (256-bit)' },
                  { value: '64', label: '64 bytes (512-bit)' },
                  { value: '128', label: '128 bytes (1024-bit)' },
                ]}
                {...form.getInputProps('securityConfig.jwtSecretLength')}
              />
              <NumberInput
                label="Access Token Expiration (minutes)"
                min={1}
                {...form.getInputProps('securityConfig.accessTokenExpiration')}
              />
              <NumberInput
                label="Refresh Token Expiration (days)"
                min={1}
                {...form.getInputProps('securityConfig.refreshTokenExpiration')}
              />
              <Switch
                label="Enable Refresh Token"
                description="Allow token refresh without re-authentication"
                {...form.getInputProps('securityConfig.enableRefreshToken', { type: 'checkbox' })}
              />
              <Switch
                label="Enable Token Blacklist"
                description="Support logout/token revocation"
                {...form.getInputProps('securityConfig.enableTokenBlacklist', { type: 'checkbox' })}
              />
              <Switch
                label="Enable Key Rotation"
                description="Seamless key rotation without invalidating tokens"
                {...form.getInputProps('securityConfig.keyRotation.enabled', { type: 'checkbox' })}
              />
            </Stack>
          </Collapse>

          <Collapse in={form.values.securityConfig.mode === 'oauth2'}>
            <Stack mt="md">
              <Title order={6}>OAuth2 Configuration</Title>
              <TextInput
                label="Issuer URI"
                placeholder="https://auth.example.com"
                description="OAuth 2.0 issuer URI"
                {...form.getInputProps('securityConfig.oauth2.issuerUri')}
              />
              <TextInput
                label="Audience"
                placeholder="api://my-api"
                description="Expected audience claim value"
                {...form.getInputProps('securityConfig.oauth2.audience')}
              />
              <TextInput
                label="Roles Claim"
                placeholder="permissions"
                description="JWT claim containing user roles"
                {...form.getInputProps('securityConfig.oauth2.rolesClaim')}
              />
              <TextInput
                label="Role Prefix"
                placeholder="ROLE_"
                description="Prefix to add to roles"
                {...form.getInputProps('securityConfig.oauth2.rolePrefix')}
              />
              <TextInput
                label="Username Claim"
                placeholder="sub"
                description="JWT claim containing username"
                {...form.getInputProps('securityConfig.oauth2.usernameClaim')}
              />
              <Switch
                label="Enable PKCE"
                description="Proof Key for Code Exchange (recommended)"
                {...form.getInputProps('securityConfig.pkce.enabled', { type: 'checkbox' })}
              />
            </Stack>
          </Collapse>

          <Divider label="Password Policy" labelPosition="left" mt="md" />

          <NumberInput
            label="Minimum Password Length"
            min={6}
            max={128}
            {...form.getInputProps('securityConfig.passwordMinLength')}
          />

          <NumberInput
            label="Max Login Attempts"
            description="Attempts before account lockout"
            min={1}
            max={20}
            {...form.getInputProps('securityConfig.maxLoginAttempts')}
          />

          <NumberInput
            label="Lockout Duration (minutes)"
            min={1}
            {...form.getInputProps('securityConfig.lockoutMinutes')}
          />

          <Divider label="Security Headers" labelPosition="left" mt="md" />

          <Switch
            label="Enable HSTS"
            description="HTTP Strict Transport Security"
            {...form.getInputProps('securityConfig.headers.hstsEnabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.securityConfig.headers.hstsEnabled}>
            <Stack mt="sm">
              <NumberInput
                label="HSTS Max Age (seconds)"
                min={0}
                {...form.getInputProps('securityConfig.headers.hstsMaxAgeSeconds')}
              />
              <Switch
                label="Include Subdomains"
                {...form.getInputProps('securityConfig.headers.hstsIncludeSubdomains', {
                  type: 'checkbox',
                })}
              />
              <Switch
                label="Enable Preload"
                {...form.getInputProps('securityConfig.headers.hstsPreload', { type: 'checkbox' })}
              />
            </Stack>
          </Collapse>

          <TextInput
            label="Content Security Policy"
            placeholder="default-src 'self'"
            {...form.getInputProps('securityConfig.headers.contentSecurityPolicy')}
          />

          <TextInput
            label="Permissions Policy"
            placeholder="geolocation=(), camera=(), microphone=()"
            {...form.getInputProps('securityConfig.headers.permissionsPolicy')}
          />

          <Select
            label="Referrer Policy"
            data={[
              { value: 'no-referrer', label: 'No Referrer' },
              { value: 'no-referrer-when-downgrade', label: 'No Referrer When Downgrade' },
              { value: 'origin', label: 'Origin' },
              { value: 'origin-when-cross-origin', label: 'Origin When Cross-Origin' },
              { value: 'same-origin', label: 'Same Origin' },
              { value: 'strict-origin', label: 'Strict Origin' },
              {
                value: 'strict-origin-when-cross-origin',
                label: 'Strict Origin When Cross-Origin',
              },
              { value: 'unsafe-url', label: 'Unsafe URL' },
            ]}
            {...form.getInputProps('securityConfig.headers.referrerPolicy')}
          />
        </Stack>
      </Collapse>
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
        {...form.getInputProps('features.rateLimiting', { type: 'checkbox' })}
      />

      <Collapse in={form.values.features.rateLimiting}>
        <Stack mt="md">
          <Select
            label="Storage Mode"
            description="Where to store rate limit counters"
            data={[
              { value: 'IN_MEMORY', label: 'In-Memory (single instance)' },
              { value: 'REDIS', label: 'Redis (distributed)' },
            ]}
            {...form.getInputProps('rateLimitConfig.storageMode')}
          />

          <NumberInput
            label="Requests per Second"
            description="Maximum requests per second per client"
            min={1}
            {...form.getInputProps('rateLimitConfig.requestsPerSecond')}
          />

          <NumberInput
            label="Burst Capacity"
            description="Maximum burst requests allowed"
            min={1}
            {...form.getInputProps('rateLimitConfig.burstCapacity')}
          />

          <Divider label="Authentication Endpoints" labelPosition="left" />

          <NumberInput
            label="Auth Requests per Minute"
            description="Maximum authentication requests per minute"
            min={1}
            {...form.getInputProps('rateLimitConfig.authRequestsPerMinute')}
          />

          <NumberInput
            label="Auth Burst Capacity"
            description="Maximum auth burst requests allowed"
            min={1}
            {...form.getInputProps('rateLimitConfig.authBurstCapacity')}
          />

          <NumberInput
            label="Block Duration (seconds)"
            description="How long to block when rate limit exceeded"
            min={1}
            {...form.getInputProps('rateLimitConfig.blockDurationSeconds')}
          />

          <Switch
            label="Enable Per-User Rate Limiting"
            {...form.getInputProps('rateLimitConfig.enablePerUser', { type: 'checkbox' })}
          />

          <Switch
            label="Enable Per-Endpoint Rate Limiting"
            {...form.getInputProps('rateLimitConfig.enablePerEndpoint', { type: 'checkbox' })}
          />
        </Stack>
      </Collapse>
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
        {...form.getInputProps('features.caching', { type: 'checkbox' })}
      />

      <Collapse in={form.values.features.caching}>
        <Stack mt="md">
          <Select
            label="Cache Provider"
            data={[
              { value: 'local', label: 'Caffeine (In-memory)' },
              { value: 'redis', label: 'Redis' },
            ]}
            {...form.getInputProps('cacheConfig.type')}
          />

          <Divider label="Entity Cache Settings" labelPosition="left" />

          <NumberInput
            label="Entity Cache Max Size"
            description="Maximum number of cached entries"
            min={100}
            {...form.getInputProps('cacheConfig.entities.maxSize')}
          />

          <NumberInput
            label="Entity TTL (minutes)"
            description="Time-to-live for entity cache entries"
            min={1}
            {...form.getInputProps('cacheConfig.entities.expireAfterWriteMinutes')}
          />

          <Divider label="List Cache Settings" labelPosition="left" />

          <NumberInput
            label="List Cache Max Size"
            description="Maximum number of cached list entries"
            min={10}
            {...form.getInputProps('cacheConfig.lists.maxSize')}
          />

          <NumberInput
            label="List TTL (minutes)"
            description="Time-to-live for list cache entries"
            min={1}
            {...form.getInputProps('cacheConfig.lists.expireAfterWriteMinutes')}
          />

          <Collapse in={form.values.cacheConfig.type === 'redis'}>
            <Stack mt="md">
              <Divider label="Redis Configuration" labelPosition="left" />
              <TextInput
                label="Redis Host"
                placeholder="localhost"
                {...form.getInputProps('cacheConfig.redis.host')}
              />
              <NumberInput
                label="Redis Port"
                min={1}
                max={65535}
                {...form.getInputProps('cacheConfig.redis.port')}
              />
              <TextInput
                label="Key Prefix"
                placeholder="apigen:"
                description="Prefix for all cache keys"
                {...form.getInputProps('cacheConfig.redis.keyPrefix')}
              />
              <NumberInput
                label="Default TTL (minutes)"
                description="Default time-to-live for cache entries"
                min={1}
                {...form.getInputProps('cacheConfig.redis.ttlMinutes')}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}

/**
 * Features configuration form component
 */
function FeaturesSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Title order={6}>Core Features</Title>

      <Switch
        label="HATEOAS Links"
        description="Include hypermedia links in responses"
        {...form.getInputProps('features.hateoas', { type: 'checkbox' })}
      />

      <Switch
        label="Swagger/OpenAPI"
        description="Generate API documentation"
        {...form.getInputProps('features.swagger', { type: 'checkbox' })}
      />

      <Switch
        label="Soft Delete"
        description="Logical deletion instead of physical"
        {...form.getInputProps('features.softDelete', { type: 'checkbox' })}
      />

      <Switch
        label="Auditing"
        description="Track createdAt, updatedAt, createdBy, updatedBy"
        {...form.getInputProps('features.auditing', { type: 'checkbox' })}
      />

      <Switch
        label="Virtual Threads"
        description="Use Java 21+ virtual threads"
        {...form.getInputProps('features.virtualThreads', { type: 'checkbox' })}
      />

      <Divider label="Pagination & Caching" labelPosition="left" />

      <Switch
        label="Caching"
        description="Enable response caching"
        {...form.getInputProps('features.caching', { type: 'checkbox' })}
      />

      <Switch
        label="Cursor Pagination"
        description="Enable cursor-based pagination"
        {...form.getInputProps('features.cursorPagination', { type: 'checkbox' })}
      />

      <Switch
        label="ETag Support"
        description="Enable ETags for caching"
        {...form.getInputProps('features.etagSupport', { type: 'checkbox' })}
      />

      <Divider label="Advanced Features" labelPosition="left" />

      <Switch
        label="Rate Limiting"
        description="Enable request rate limiting"
        {...form.getInputProps('features.rateLimiting', { type: 'checkbox' })}
      />

      <Switch
        label="Internationalization (i18n)"
        description="Multi-language support"
        {...form.getInputProps('features.i18n', { type: 'checkbox' })}
      />

      <Switch
        label="Webhooks"
        description="Send event notifications"
        {...form.getInputProps('features.webhooks', { type: 'checkbox' })}
      />

      <Switch
        label="Bulk Operations"
        description="Import/export in bulk"
        {...form.getInputProps('features.bulkOperations', { type: 'checkbox' })}
      />

      <Switch
        label="Batch Operations"
        description="Batch CRUD operations"
        {...form.getInputProps('features.batchOperations', { type: 'checkbox' })}
      />

      <Switch
        label="Domain Events"
        description="Publish domain events"
        {...form.getInputProps('features.domainEvents', { type: 'checkbox' })}
      />

      <Switch
        label="SSE Updates"
        description="Server-Sent Events for real-time updates"
        {...form.getInputProps('features.sseUpdates', { type: 'checkbox' })}
      />

      <Divider label="Architecture" labelPosition="left" />

      <Switch
        label="Multi-Tenancy"
        description="Support multiple tenants"
        {...form.getInputProps('features.multiTenancy', { type: 'checkbox' })}
      />

      <Switch
        label="Event Sourcing"
        description="Store events as source of truth"
        {...form.getInputProps('features.eventSourcing', { type: 'checkbox' })}
      />

      <Switch
        label="API Versioning"
        description="Support multiple API versions"
        {...form.getInputProps('features.apiVersioning', { type: 'checkbox' })}
      />

      <Divider label="Deployment" labelPosition="left" />

      <Switch
        label="Docker"
        description="Generate Dockerfile"
        {...form.getInputProps('features.docker', { type: 'checkbox' })}
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
      <Title order={6}>Distributed Tracing</Title>

      <Switch
        label="Enable Tracing"
        description="Enable distributed tracing with OpenTelemetry"
        {...form.getInputProps('observabilityConfig.tracing.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.observabilityConfig.tracing.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Sampling Probability"
            description="0.0 to 1.0 (1.0 = 100%)"
            min={0}
            max={1}
            step={0.1}
            decimalScale={2}
            {...form.getInputProps('observabilityConfig.tracing.samplingProbability')}
          />
          <TextInput
            label="OTLP Endpoint"
            placeholder="http://localhost:4317"
            description="OpenTelemetry collector endpoint"
            {...form.getInputProps('observabilityConfig.tracing.otlpEndpoint')}
          />
        </Stack>
      </Collapse>

      <Divider label="Metrics" labelPosition="left" />

      <Switch
        label="Enable Metrics"
        description="Enable metrics collection with Micrometer"
        {...form.getInputProps('observabilityConfig.metrics.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.observabilityConfig.metrics.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Slow Query Threshold (ms)"
            description="Threshold for slow query detection"
            min={1}
            {...form.getInputProps('observabilityConfig.metrics.slowQueryThresholdMs')}
          />
          <Switch
            label="Expose HikariCP Metrics"
            description="Expose connection pool metrics"
            {...form.getInputProps('observabilityConfig.metrics.exposeHikariMetrics', {
              type: 'checkbox',
            })}
          />
          <Switch
            label="Expose Prometheus Metrics"
            description="Expose /actuator/prometheus endpoint"
            {...form.getInputProps('observabilityConfig.metrics.exposePrometheus', {
              type: 'checkbox',
            })}
          />
        </Stack>
      </Collapse>

      <Divider label="Query Analysis" labelPosition="left" />

      <Switch
        label="Enable Query Analysis"
        description="Detect N+1 queries and log slow queries"
        {...form.getInputProps('observabilityConfig.queryAnalysis.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.observabilityConfig.queryAnalysis?.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Warning Threshold"
            description="Number of queries to trigger a warning"
            min={1}
            {...form.getInputProps('observabilityConfig.queryAnalysis.warnThreshold')}
          />
          <NumberInput
            label="Error Threshold"
            description="Number of queries to trigger an error"
            min={1}
            {...form.getInputProps('observabilityConfig.queryAnalysis.errorThreshold')}
          />
          <Switch
            label="Log Slow Queries"
            description="Log queries exceeding the threshold"
            {...form.getInputProps('observabilityConfig.queryAnalysis.logSlowQueries', {
              type: 'checkbox',
            })}
          />
          <NumberInput
            label="Slow Query Threshold (ms)"
            min={1}
            {...form.getInputProps('observabilityConfig.queryAnalysis.slowQueryThresholdMs')}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}

/**
 * Resilience configuration form component
 */
function ResilienceSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Title order={6}>Circuit Breaker</Title>

      <Switch
        label="Enable Circuit Breaker"
        {...form.getInputProps('resilienceConfig.circuitBreaker.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.resilienceConfig.circuitBreaker.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Sliding Window Size"
            description="Number of calls to evaluate"
            min={1}
            {...form.getInputProps('resilienceConfig.circuitBreaker.slidingWindowSize')}
          />

          <NumberInput
            label="Minimum Number of Calls"
            description="Minimum calls before circuit breaker can trip"
            min={1}
            {...form.getInputProps('resilienceConfig.circuitBreaker.minimumNumberOfCalls')}
          />

          <NumberInput
            label="Failure Rate Threshold (%)"
            description="Percentage of failures to open circuit"
            min={1}
            max={100}
            {...form.getInputProps('resilienceConfig.circuitBreaker.failureRateThreshold')}
          />

          <NumberInput
            label="Slow Call Rate Threshold (%)"
            description="Percentage of slow calls to open circuit"
            min={1}
            max={100}
            {...form.getInputProps('resilienceConfig.circuitBreaker.slowCallRateThreshold')}
          />

          <NumberInput
            label="Slow Call Duration Threshold (seconds)"
            description="Duration threshold for slow calls"
            min={1}
            {...form.getInputProps(
              'resilienceConfig.circuitBreaker.slowCallDurationThresholdSeconds',
            )}
          />

          <NumberInput
            label="Wait Duration in Open State (seconds)"
            description="Time to wait before transitioning from OPEN to HALF_OPEN"
            min={1}
            {...form.getInputProps(
              'resilienceConfig.circuitBreaker.waitDurationInOpenStateSeconds',
            )}
          />
        </Stack>
      </Collapse>

      <Divider label="Retry" labelPosition="left" />

      <Switch
        label="Enable Retry"
        {...form.getInputProps('resilienceConfig.retry.enabled', { type: 'checkbox' })}
      />

      <Collapse in={form.values.resilienceConfig.retry.enabled}>
        <Stack mt="sm">
          <NumberInput
            label="Max Attempts"
            min={1}
            max={10}
            {...form.getInputProps('resilienceConfig.retry.maxAttempts')}
          />

          <NumberInput
            label="Wait Duration (ms)"
            description="Initial wait duration between retries"
            min={100}
            {...form.getInputProps('resilienceConfig.retry.waitDurationMs')}
          />

          <Switch
            label="Enable Exponential Backoff"
            {...form.getInputProps('resilienceConfig.retry.enableExponentialBackoff', {
              type: 'checkbox',
            })}
          />

          <Collapse in={form.values.resilienceConfig.retry.enableExponentialBackoff}>
            <NumberInput
              label="Backoff Multiplier"
              description="Exponential backoff multiplier"
              min={1}
              step={0.1}
              decimalScale={1}
              mt="sm"
              {...form.getInputProps('resilienceConfig.retry.exponentialBackoffMultiplier')}
            />
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}

/**
 * CORS configuration form component
 */
function CorsSettingsForm({ form }: { form: ReturnType<typeof useForm<ProjectConfig>> }) {
  return (
    <Stack>
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mb="md">
        <Text size="sm">
          CORS (Cross-Origin Resource Sharing) settings control which domains can access your API.
        </Text>
      </Alert>

      <TagsInput
        label="Allowed Origins"
        placeholder="Press Enter to add (e.g., https://example.com)"
        description="Use * to allow all origins"
        {...form.getInputProps('corsConfig.allowedOrigins')}
      />

      <TagsInput
        label="Allowed Methods"
        placeholder="Press Enter to add (e.g., GET, POST)"
        {...form.getInputProps('corsConfig.allowedMethods')}
      />

      <TagsInput
        label="Allowed Headers"
        placeholder="Press Enter to add (e.g., Content-Type)"
        {...form.getInputProps('corsConfig.allowedHeaders')}
      />

      <TagsInput
        label="Exposed Headers"
        placeholder="Press Enter to add"
        description="Headers that browsers are allowed to access"
        {...form.getInputProps('corsConfig.exposedHeaders')}
      />

      <Switch
        label="Allow Credentials"
        description="Allow cookies and authorization headers"
        {...form.getInputProps('corsConfig.allowCredentials', { type: 'checkbox' })}
      />

      <NumberInput
        label="Max Age (seconds)"
        description="How long browsers can cache preflight response"
        min={0}
        {...form.getInputProps('corsConfig.maxAgeSeconds')}
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
        label="Enable GraphQL Module"
        description="Enable GraphQL API endpoint"
        {...form.getInputProps('modules.graphql', { type: 'checkbox' })}
      />

      <Collapse in={form.values.modules.graphql}>
        <Stack mt="md">
          <Switch
            label="Enable GraphQL"
            description="Activate the GraphQL endpoint"
            {...form.getInputProps('graphqlConfig.enabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.graphqlConfig.enabled}>
            <Stack mt="sm">
              <TextInput
                label="GraphQL Endpoint"
                placeholder="/graphql"
                {...form.getInputProps('graphqlConfig.path')}
              />

              <Divider label="Features" labelPosition="left" />

              <Switch
                label="Enable Tracing"
                description="Enable query tracing for debugging"
                {...form.getInputProps('graphqlConfig.tracingEnabled', { type: 'checkbox' })}
              />

              <Switch
                label="Enable Introspection"
                description="Allow schema introspection (disable in production)"
                {...form.getInputProps('graphqlConfig.introspectionEnabled', { type: 'checkbox' })}
              />

              <Divider label="Security Limits" labelPosition="left" />

              <NumberInput
                label="Max Query Depth"
                description="Prevent deeply nested queries"
                min={1}
                {...form.getInputProps('graphqlConfig.maxQueryDepth')}
              />

              <NumberInput
                label="Max Query Complexity"
                description="Limit query complexity score"
                min={1}
                {...form.getInputProps('graphqlConfig.maxQueryComplexity')}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
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
        label="Enable gRPC Module"
        description="Enable gRPC service endpoint"
        {...form.getInputProps('modules.grpc', { type: 'checkbox' })}
      />

      <Collapse in={form.values.modules.grpc}>
        <Stack mt="md">
          <Switch
            label="Enable gRPC Server"
            description="Activate the gRPC server"
            {...form.getInputProps('grpcConfig.enabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.grpcConfig.enabled}>
            <Stack mt="sm">
              <NumberInput
                label="Server Port"
                placeholder="9090"
                min={1}
                max={65535}
                {...form.getInputProps('grpcConfig.serverPort')}
              />

              <Divider label="Features" labelPosition="left" />

              <Switch
                label="Enable Logging"
                description="Log gRPC requests and responses"
                {...form.getInputProps('grpcConfig.loggingEnabled', { type: 'checkbox' })}
              />

              <Switch
                label="Enable Health Check"
                description="gRPC health checking protocol"
                {...form.getInputProps('grpcConfig.healthCheckEnabled', { type: 'checkbox' })}
              />

              <Switch
                label="Use Plaintext"
                description="Disable TLS (development only)"
                {...form.getInputProps('grpcConfig.usePlaintext', { type: 'checkbox' })}
              />

              <Divider label="Limits" labelPosition="left" />

              <NumberInput
                label="Max Inbound Message Size (MB)"
                description="Maximum size of incoming messages"
                min={1}
                max={128}
                {...form.getInputProps('grpcConfig.maxInboundMessageSizeMb')}
              />

              <NumberInput
                label="Client Deadline (ms)"
                description="Default timeout for client requests"
                min={1000}
                step={1000}
                {...form.getInputProps('grpcConfig.clientDeadlineMs')}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
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
        label="Enable Gateway Module"
        description="Enable API Gateway functionality"
        {...form.getInputProps('modules.gateway', { type: 'checkbox' })}
      />

      <Collapse in={form.values.modules.gateway}>
        <Stack mt="md">
          <Switch
            label="Enable Gateway"
            description="Activate the API Gateway"
            {...form.getInputProps('gatewayConfig.enabled', { type: 'checkbox' })}
          />

          <Collapse in={form.values.gatewayConfig.enabled}>
            <Stack mt="sm">
              <Divider label="Authentication" labelPosition="left" />

              <Switch
                label="Enable Authentication"
                description="Require authentication for routes"
                {...form.getInputProps('gatewayConfig.authEnabled', { type: 'checkbox' })}
              />

              <Collapse in={form.values.gatewayConfig.authEnabled}>
                <TagsInput
                  label="Excluded Paths"
                  description="Paths that don't require authentication"
                  placeholder="Press Enter to add (e.g., /public/**)"
                  mt="sm"
                  {...form.getInputProps('gatewayConfig.authExcludedPaths')}
                />
              </Collapse>

              <Divider label="Rate Limiting" labelPosition="left" />

              <NumberInput
                label="Default Rate Limit (requests/second)"
                description="Maximum requests per second per client"
                min={1}
                {...form.getInputProps('gatewayConfig.defaultRateLimitRequests')}
              />

              <NumberInput
                label="Default Burst Capacity"
                description="Maximum burst requests allowed"
                min={1}
                {...form.getInputProps('gatewayConfig.defaultRateLimitBurst')}
              />

              <Divider label="Circuit Breaker" labelPosition="left" />

              <Switch
                label="Enable Circuit Breaker"
                description="Prevent cascading failures"
                {...form.getInputProps('gatewayConfig.circuitBreakerEnabled', { type: 'checkbox' })}
              />

              <Collapse in={form.values.gatewayConfig.circuitBreakerEnabled}>
                <NumberInput
                  label="Circuit Breaker Timeout (seconds)"
                  description="Time to wait before retrying"
                  min={1}
                  mt="sm"
                  {...form.getInputProps('gatewayConfig.circuitBreakerTimeoutSeconds')}
                />
              </Collapse>

              <Divider label="Logging" labelPosition="left" />

              <Switch
                label="Enable Logging"
                description="Log gateway requests and responses"
                {...form.getInputProps('gatewayConfig.loggingEnabled', { type: 'checkbox' })}
              />

              <Collapse in={form.values.gatewayConfig.loggingEnabled}>
                <Stack mt="sm">
                  <Switch
                    label="Include Headers"
                    description="Log request/response headers"
                    {...form.getInputProps('gatewayConfig.loggingIncludeHeaders', {
                      type: 'checkbox',
                    })}
                  />

                  <Switch
                    label="Include Body"
                    description="Log request/response body"
                    {...form.getInputProps('gatewayConfig.loggingIncludeBody', {
                      type: 'checkbox',
                    })}
                  />
                </Stack>
              </Collapse>

              <Divider label="Routes" labelPosition="left" />

              <GatewayRouteDesigner
                routes={form.values.gatewayConfig.routes}
                onRoutesChange={(routes: GatewayRouteConfig[]) =>
                  form.setFieldValue('gatewayConfig.routes', routes)
                }
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}

/**
 * Main ProjectSettings component
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
