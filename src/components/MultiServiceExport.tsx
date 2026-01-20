import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Paper,
  Progress,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArchive,
  IconCheck,
  IconDatabase,
  IconDownload,
  IconServer,
  IconX,
} from '@tabler/icons-react';
import { useMultiServiceExport } from '../hooks';

export function MultiServiceExport() {
  const {
    exporting,
    progress,
    services,
    exportSingleService,
    exportAllServices,
    getServiceEntities,
  } = useMultiServiceExport();

  const servicesWithEntities = services.filter((s) => s.entityIds.length > 0);
  const emptyServices = services.filter((s) => s.entityIds.length === 0);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <IconArchive size={20} />
          <Title order={5}>Export Services</Title>
        </Group>
        {servicesWithEntities.length > 1 && (
          <Button
            leftSection={<IconDownload size={16} />}
            size="xs"
            onClick={exportAllServices}
            loading={exporting}
            disabled={exporting}
          >
            Export All ({servicesWithEntities.length})
          </Button>
        )}
      </Group>

      {/* Progress indicator */}
      {exporting && progress && (
        <Paper p="sm" withBorder bg="blue.0">
          <Stack gap="xs">
            <Group gap="sm">
              <Loader size="sm" />
              <Text size="sm">
                Exporting {progress.currentServiceName}... ({progress.current}/{progress.total})
              </Text>
            </Group>
            <Progress value={(progress.current / progress.total) * 100} size="sm" animated />
          </Stack>
        </Paper>
      )}

      {services.length === 0 ? (
        <Paper p="xl" withBorder ta="center">
          <Stack align="center" gap="sm">
            <IconServer size={48} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">No services defined</Text>
            <Text size="xs" c="dimmed">
              Create services in the canvas view and assign entities to them.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <ScrollArea.Autosize mah={400}>
          <Stack gap="sm">
            {/* Services with entities */}
            {servicesWithEntities.map((service) => {
              const serviceEntities = getServiceEntities(service);
              return (
                <Card key={service.id} withBorder padding="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                      <ThemeIcon size="lg" color={service.color} variant="light">
                        <IconServer size={18} />
                      </ThemeIcon>

                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group gap="xs">
                          <Text fw={500} size="sm" truncate>
                            {service.name}
                          </Text>
                          <Badge size="xs" color="green" variant="light">
                            Ready
                          </Badge>
                        </Group>

                        <Group gap="xs" mt={4}>
                          <Badge size="xs" variant="outline" color="gray">
                            <Group gap={4}>
                              <IconDatabase size={10} />
                              {serviceEntities.length} entities
                            </Group>
                          </Badge>
                          <Badge size="xs" variant="outline" color="gray">
                            Port {service.config.port}
                          </Badge>
                          <Badge size="xs" variant="outline" color="gray">
                            {service.config.databaseType}
                          </Badge>
                        </Group>

                        {service.description && (
                          <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
                            {service.description}
                          </Text>
                        )}
                      </Box>
                    </Group>

                    <Tooltip label="Export this service">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        size="lg"
                        onClick={() => exportSingleService(service.id)}
                        disabled={exporting}
                      >
                        <IconDownload size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Card>
              );
            })}

            {/* Empty services */}
            {emptyServices.length > 0 && (
              <>
                <Divider label="No entities assigned" labelPosition="center" />
                {emptyServices.map((service) => (
                  <Card key={service.id} withBorder padding="sm" bg="gray.0">
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <ThemeIcon size="lg" color="gray" variant="light">
                          <IconServer size={18} />
                        </ThemeIcon>

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs">
                            <Text fw={500} size="sm" truncate c="dimmed">
                              {service.name}
                            </Text>
                            <Badge size="xs" color="gray" variant="light">
                              Empty
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed" mt={4}>
                            Assign entities to export this service
                          </Text>
                        </Box>
                      </Group>

                      <Tooltip label="No entities to export">
                        <ActionIcon variant="light" color="gray" size="lg" disabled>
                          <IconX size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Card>
                ))}
              </>
            )}
          </Stack>
        </ScrollArea.Autosize>
      )}

      {/* Export summary */}
      {servicesWithEntities.length > 0 && (
        <Paper p="sm" withBorder bg="gray.0">
          <Group gap="xs">
            <IconCheck size={16} color="var(--mantine-color-green-6)" />
            <Text size="xs">
              {servicesWithEntities.length} service{servicesWithEntities.length === 1 ? '' : 's'}{' '}
              ready to export
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            Each service will be generated as an independent Spring Boot application with its own
            database configuration, entities, and REST APIs.
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
