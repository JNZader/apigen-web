import {
  Badge,
  Box,
  Button,
  Checkbox,
  Grid,
  Group,
  Modal,
  NumberInput,
  Progress,
  Select,
  Stack,
  Stepper,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCloud,
  IconDatabase,
  IconNetwork,
  IconServer,
  IconSettings,
  IconShield,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { useServiceActions, useServices } from '../../store/projectStore';
import type { ServiceConfig, ServiceDatabaseType, ServiceDiscoveryType } from '../../types';
import { defaultServiceConfig, getNextServiceColor } from '../../types';
import { notify } from '../../utils/notifications';

interface ServiceWizardProps {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onComplete?: (serviceId: string) => void;
}

const TOTAL_STEPS = 4;

const DATABASE_OPTIONS: Array<{ value: ServiceDatabaseType; label: string; description: string }> =
  [
    { value: 'postgresql', label: 'PostgreSQL', description: 'Robust relational database' },
    { value: 'mysql', label: 'MySQL', description: 'Popular relational database' },
    { value: 'mongodb', label: 'MongoDB', description: 'Document-oriented NoSQL' },
    { value: 'redis', label: 'Redis', description: 'In-memory key-value store' },
    { value: 'h2', label: 'H2 (In-Memory)', description: 'Embedded database for testing' },
  ];

const SERVICE_DISCOVERY_OPTIONS: Array<{
  value: ServiceDiscoveryType;
  label: string;
  description: string;
}> = [
  { value: 'NONE', label: 'None', description: 'No service discovery' },
  { value: 'EUREKA', label: 'Netflix Eureka', description: 'Spring Cloud Netflix' },
  { value: 'CONSUL', label: 'HashiCorp Consul', description: 'Service mesh solution' },
  { value: 'KUBERNETES', label: 'Kubernetes', description: 'K8s native discovery' },
];

export function ServiceWizard({ opened, onClose, onComplete }: ServiceWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const services = useServices();
  const { addService, updateService } = useServiceActions();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<ServiceConfig>({ ...defaultServiceConfig });

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setConfig({ ...defaultServiceConfig });
    setActiveStep(0);
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    switch (activeStep) {
      case 0:
        return name.trim().length > 0;
      case 1:
      case 2:
      case 3:
        return true;
      default:
        return true;
    }
  }, [activeStep, name]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setActiveStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
    } else if (activeStep === 0) {
      notify.error({
        title: 'Validation Error',
        message: 'Please enter a service name',
      });
    }
  }, [validateCurrentStep, activeStep]);

  const handleBack = useCallback(() => {
    setActiveStep((current) => Math.max(current - 1, 0));
  }, []);

  const handleStepClick = useCallback(
    (step: number) => {
      const canNavigateBack = step < activeStep;
      const canNavigateForward = step === activeStep + 1 && validateCurrentStep();
      if (canNavigateBack || canNavigateForward) {
        setActiveStep(step);
      }
    },
    [activeStep, validateCurrentStep],
  );

  const handleComplete = useCallback(() => {
    if (!name.trim()) {
      notify.error({
        title: 'Validation Error',
        message: 'Please enter a service name',
      });
      return;
    }

    // Get next available color
    const usedColors = services.map((s) => s.color);
    const color = getNextServiceColor(usedColors);

    // Add the service (returns ServiceDesign object)
    const newService = addService(name.trim());

    // Update with full config
    updateService(newService.id, {
      description: description.trim() || undefined,
      color,
      config,
    });

    notify.success({
      title: 'Service Created',
      message: `Service "${name.trim()}" has been created with full configuration`,
    });

    onComplete?.(newService.id);
    onClose();
    resetForm();
  }, [
    name,
    description,
    config,
    services,
    addService,
    updateService,
    onClose,
    onComplete,
    resetForm,
  ]);

  const handleClose = useCallback(() => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  const updateConfig = <K extends keyof ServiceConfig>(key: K, value: ServiceConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const progress = ((activeStep + 1) / TOTAL_STEPS) * 100;
  const isLastStep = activeStep === TOTAL_STEPS - 1;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <IconServer size={20} />
          <Text fw={500}>Create New Service</Text>
        </Group>
      }
      size="lg"
      padding="lg"
      centered
    >
      <Stack gap="lg">
        <Progress value={progress} size="sm" radius="xl" animated color="teal" />

        <Stepper
          active={activeStep}
          onStepClick={handleStepClick}
          size="sm"
          allowNextStepsSelect={false}
          color="teal"
        >
          <Stepper.Step label="Basic Info" description="Name & description" />
          <Stepper.Step label="Database" description="Storage type" />
          <Stepper.Step label="Features" description="Capabilities" />
          <Stepper.Step label="Summary" description="Review" />
        </Stepper>

        <Box mih={280}>
          {/* Step 1: Basic Info */}
          {activeStep === 0 && (
            <Stack gap="md">
              <TextInput
                label="Service Name"
                placeholder="e.g., OrderService, UserService"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
                data-autofocus
                description="A descriptive name for your microservice"
              />
              <TextInput
                label="Description"
                placeholder="Brief description of what this service does"
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                description="Optional description for documentation"
              />
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
            </Stack>
          )}

          {/* Step 2: Database */}
          {activeStep === 1 && (
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Select the database technology for this service. In a microservices architecture,
                each service can use a different database (polyglot persistence).
              </Text>
              <Select
                label="Database Type"
                value={config.databaseType}
                onChange={(val) =>
                  updateConfig('databaseType', (val as ServiceDatabaseType) || 'postgresql')
                }
                data={DATABASE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                description="Database engine for this service"
              />
              <Stack gap="xs">
                {DATABASE_OPTIONS.map((opt) => (
                  <Box
                    key={opt.value}
                    p="sm"
                    style={{
                      border: '1px solid var(--mantine-color-default-border)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      backgroundColor:
                        config.databaseType === opt.value
                          ? 'var(--mantine-color-teal-light)'
                          : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={() => updateConfig('databaseType', opt.value)}
                  >
                    <Group gap="sm">
                      <ThemeIcon
                        size="md"
                        variant={config.databaseType === opt.value ? 'filled' : 'light'}
                        color="teal"
                      >
                        <IconDatabase size={14} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>
                          {opt.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {opt.description}
                        </Text>
                      </div>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}

          {/* Step 3: Features */}
          {activeStep === 2 && (
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Configure additional features for your microservice.
              </Text>

              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconNetwork size={16} />
                      <Text size="sm" fw={500}>
                        Containerization
                      </Text>
                    </Group>
                    <Checkbox
                      label="Generate Dockerfile"
                      description="Multi-stage build"
                      checked={config.generateDocker}
                      onChange={(e) => updateConfig('generateDocker', e.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Generate Docker Compose"
                      description="Service + database"
                      checked={config.generateDockerCompose}
                      onChange={(e) =>
                        updateConfig('generateDockerCompose', e.currentTarget.checked)
                      }
                    />
                  </Stack>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconSettings size={16} />
                      <Text size="sm" fw={500}>
                        Observability
                      </Text>
                    </Group>
                    <Checkbox
                      label="Enable Tracing"
                      description="Micrometer tracing"
                      checked={config.enableTracing}
                      onChange={(e) => updateConfig('enableTracing', e.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Enable Metrics"
                      description="Prometheus metrics"
                      checked={config.enableMetrics}
                      onChange={(e) => updateConfig('enableMetrics', e.currentTarget.checked)}
                    />
                  </Stack>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconShield size={16} />
                      <Text size="sm" fw={500}>
                        Resilience
                      </Text>
                    </Group>
                    <Checkbox
                      label="Circuit Breaker"
                      description="Resilience4j"
                      checked={config.enableCircuitBreaker}
                      onChange={(e) =>
                        updateConfig('enableCircuitBreaker', e.currentTarget.checked)
                      }
                    />
                    <Checkbox
                      label="Rate Limiting"
                      description="Bucket4j"
                      checked={config.enableRateLimiting}
                      onChange={(e) => updateConfig('enableRateLimiting', e.currentTarget.checked)}
                    />
                  </Stack>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconCloud size={16} />
                      <Text size="sm" fw={500}>
                        Service Discovery
                      </Text>
                    </Group>
                    <Checkbox
                      label="Enable Discovery"
                      description="Register with discovery server"
                      checked={config.enableServiceDiscovery}
                      onChange={(e) =>
                        updateConfig('enableServiceDiscovery', e.currentTarget.checked)
                      }
                    />
                    {config.enableServiceDiscovery && (
                      <Select
                        size="xs"
                        value={config.serviceDiscoveryType}
                        onChange={(val) =>
                          updateConfig(
                            'serviceDiscoveryType',
                            (val as ServiceDiscoveryType) || 'EUREKA',
                          )
                        }
                        data={SERVICE_DISCOVERY_OPTIONS.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                      />
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          )}

          {/* Step 4: Summary */}
          {activeStep === 3 && (
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Review your service configuration before creating.
              </Text>

              <Box
                p="md"
                style={{
                  border: '1px solid var(--mantine-color-default-border)',
                  borderRadius: 'var(--mantine-radius-md)',
                }}
              >
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Service Name
                    </Text>
                    <Text size="sm" fw={500}>
                      {name || '-'}
                    </Text>
                  </Group>

                  {description && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Description
                      </Text>
                      <Text size="sm">{description}</Text>
                    </Group>
                  )}

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Port / Context Path
                    </Text>
                    <Text size="sm">
                      {config.port} / {config.contextPath}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Database
                    </Text>
                    <Badge color="teal" variant="light">
                      {DATABASE_OPTIONS.find((o) => o.value === config.databaseType)?.label}
                    </Badge>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Features
                    </Text>
                    <Group gap="xs">
                      {config.generateDocker && (
                        <Badge size="sm" variant="dot" color="blue">
                          Docker
                        </Badge>
                      )}
                      {config.enableTracing && (
                        <Badge size="sm" variant="dot" color="violet">
                          Tracing
                        </Badge>
                      )}
                      {config.enableMetrics && (
                        <Badge size="sm" variant="dot" color="green">
                          Metrics
                        </Badge>
                      )}
                      {config.enableCircuitBreaker && (
                        <Badge size="sm" variant="dot" color="orange">
                          Circuit Breaker
                        </Badge>
                      )}
                      {config.enableRateLimiting && (
                        <Badge size="sm" variant="dot" color="red">
                          Rate Limit
                        </Badge>
                      )}
                    </Group>
                  </Group>

                  {config.enableServiceDiscovery && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Service Discovery
                      </Text>
                      <Badge color="cyan" variant="light">
                        {
                          SERVICE_DISCOVERY_OPTIONS.find(
                            (o) => o.value === config.serviceDiscoveryType,
                          )?.label
                        }
                      </Badge>
                    </Group>
                  )}
                </Stack>
              </Box>

              <Text size="xs" c="dimmed">
                After creating the service, you can assign entities to it and configure additional
                settings.
              </Text>
            </Stack>
          )}
        </Box>

        <Group justify="space-between" mt="md">
          <Button
            variant="default"
            onClick={handleBack}
            disabled={activeStep === 0}
            leftSection={<IconArrowLeft size={16} />}
          >
            Back
          </Button>
          <Group gap="sm">
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            {isLastStep ? (
              <Button color="teal" onClick={handleComplete} leftSection={<IconCheck size={16} />}>
                Create Service
              </Button>
            ) : (
              <Button color="teal" onClick={handleNext} rightSection={<IconArrowRight size={16} />}>
                Next
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
