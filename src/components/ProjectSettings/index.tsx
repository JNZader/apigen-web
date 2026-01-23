import { Button, Group, Modal, ScrollArea, Tabs, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
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
import { useProject, useProjectActions } from '../../store';
import type { ProjectConfig } from '../../types';
import { notify } from '../../utils/notifications';
import { isValidArtifactId, isValidGroupId, isValidPackageName } from '../../utils/validation';
import { BasicSettingsForm } from './BasicSettingsForm';
import { CacheSettingsForm } from './CacheSettingsForm';
import { CorsSettingsForm } from './CorsSettingsForm';
import { DatabaseSettingsForm } from './DatabaseSettingsForm';
import { FeaturesSettingsForm } from './FeaturesSettingsForm';
import { GatewaySettingsForm } from './GatewaySettingsForm';
import { GraphQLSettingsForm } from './GraphQLSettingsForm';
import { GrpcSettingsForm } from './GrpcSettingsForm';
import { ObservabilitySettingsForm } from './ObservabilitySettingsForm';
import { RateLimitSettingsForm } from './RateLimitSettingsForm';
import { ResilienceSettingsForm } from './ResilienceSettingsForm';
import { SecuritySettingsForm } from './SecuritySettingsForm';

interface ProjectSettingsProps {
  readonly opened: boolean;
  readonly onClose: () => void;
}

export function ProjectSettings({ opened, onClose }: ProjectSettingsProps) {
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
    notify.success({
      title: 'Saved',
      message: 'Project settings updated',
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
