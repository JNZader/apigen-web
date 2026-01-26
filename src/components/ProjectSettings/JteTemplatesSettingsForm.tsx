import { Alert, Checkbox, Group, List, Paper, Stack, Switch, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconInfoCircle, IconTemplate } from '@tabler/icons-react';
import { memo } from 'react';
import { useFeaturePackConfig, useProjectStoreInternal, useTargetConfig } from '../../store';
import {
  Alert,
  Badge,
  Checkbox,
  Collapse,
  Group,
  Paper,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import { IconAlertTriangle, IconTemplate } from '@tabler/icons-react';
import { useTargetConfig } from '../../store';
import type { SettingsFormProps } from './types';

const AVAILABLE_TEMPLATES = [
  { id: 'login', name: 'Login Page', description: 'User authentication form' },
  { id: 'register', name: 'Registration Page', description: 'New user signup form' },
  { id: 'dashboard', name: 'Dashboard', description: 'Admin dashboard layout' },
  { id: 'error', name: 'Error Pages', description: '404, 500 error templates' },
  { id: 'email', name: 'Email Templates', description: 'Transactional email layouts' },
] as const;

export const JteTemplatesSettingsForm = memo(function JteTemplatesSettingsForm() {
  const featurePackConfig = useFeaturePackConfig();
  const jteConfig = featurePackConfig.jte;
  const setFeaturePackConfig = useProjectStoreInternal((s) => s.setFeaturePackConfig);
  const targetConfig = useTargetConfig();

  const isSupported = ['java', 'kotlin'].includes(targetConfig.language);

  const updateJteConfig = (updates: Partial<typeof jteConfig>) => {
    setFeaturePackConfig({
      jte: { ...jteConfig, ...updates },
    });
  };

  if (!isSupported) {
    return (
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Not Available"
        color="yellow"
        data-testid="jte-unavailable-alert"
      >
        JTE Templates are only available for Java and Kotlin projects.
        <br />
        Current language: {targetConfig.language}
      </Alert>
    );
  }

  const handleTemplateToggle = (templateId: string, checked: boolean) => {
    const currentTemplates =
      (jteConfig as { selectedTemplates?: string[] }).selectedTemplates || [];
    const newTemplates = checked
      ? [...currentTemplates, templateId]
      : currentTemplates.filter((t) => t !== templateId);
    updateJteConfig({ ...jteConfig, selectedTemplates: newTemplates } as typeof jteConfig);
  };

  const selectedTemplates = (jteConfig as { selectedTemplates?: string[] }).selectedTemplates || [];

  return (
    <Stack gap="md" data-testid="jte-templates-form">
      {/* Master toggle */}
      <Group justify="space-between">
        <div>
          <Group gap="xs">
            <IconTemplate size={20} />
            <Text fw={500}>Enable JTE Templates</Text>
          </Group>
          <Text size="sm" c="dimmed">
            Generate server-side rendered views using Java Template Engine
          </Text>
        </div>
        <Switch
          checked={jteConfig.enabled}
          onChange={(e) => updateJteConfig({ enabled: e.currentTarget.checked })}
          size="md"
          data-testid="jte-enable-toggle"
        />
      </Group>

      {/* Template selection */}
      {jteConfig.enabled && (
        <>
          <Paper withBorder p="md" radius="md" data-testid="jte-template-selection">
            <Text fw={500} mb="sm">
              Select Templates to Generate:
            </Text>
            <Stack gap="xs">
              {AVAILABLE_TEMPLATES.map((template) => (
                <Checkbox
                  key={template.id}
                  data-testid={`jte-template-${template.id}`}
                  label={
                    <div>
                      <Text size="sm" fw={500}>
                        {template.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {template.description}
                      </Text>
                    </div>
                  }
                  checked={selectedTemplates.includes(template.id)}
                  onChange={(e) => handleTemplateToggle(template.id, e.currentTarget.checked)}
                />
              ))}
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text fw={500} mb="sm">
              This will generate:
            </Text>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="green" size={20} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <Text fw={500}>JTE Configuration</Text>
                <Text size="xs" c="dimmed">
                  Template engine setup in application.properties
                </Text>
              </List.Item>
              <List.Item>
                <Text fw={500}>Base Layout</Text>
                <Text size="xs" c="dimmed">
                  Reusable layout template with header/footer
                </Text>
              </List.Item>
              <List.Item>
                <Text fw={500}>Selected Templates</Text>
                <Text size="xs" c="dimmed">
                  {selectedTemplates.length} template(s) selected
                </Text>
              </List.Item>
            </List>
          </Paper>
        </>
      )}
    </Stack>
  );
});
export function JteTemplatesSettingsForm({ form }: SettingsFormProps) {
  const targetConfig = useTargetConfig();
  const isJavaOrKotlin = targetConfig.language === 'java' || targetConfig.language === 'kotlin';
  const selectedTemplates: string[] = form.values.featurePackConfig.jte.selectedTemplates;
  const selectedCount = selectedTemplates.length;

  const handleTemplateToggle = (templateId: string) => {
    const currentTemplates = [...selectedTemplates];
    const index = currentTemplates.indexOf(templateId);

    if (index === -1) {
      currentTemplates.push(templateId);
    } else {
      currentTemplates.splice(index, 1);
    }

    form.setFieldValue('featurePackConfig.jte.selectedTemplates', currentTemplates);
  };

  if (!isJavaOrKotlin) {
    return (
      <Stack>
        <Alert icon={<IconAlertTriangle size={16} />} title="Language Not Supported" color="yellow">
          <Text size="sm">
            JTE (Java Template Engine) templates are only available for Java and Kotlin projects.
            Please select Java or Kotlin as your target language to enable this feature.
          </Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack>
      <Switch
        label="Enable JTE Templates"
        description="Generate server-side view templates using Java Template Engine"
        {...form.getInputProps('features.jteTemplates', { type: 'checkbox' })}
      />

      <Collapse in={form.values.features.jteTemplates}>
        <Stack mt="md">
          <Paper withBorder p="md">
            <Stack gap="xs">
              <Group gap="xs">
                <IconTemplate size={18} />
                <Text fw={500}>What will be generated</Text>
              </Group>
              <Text size="sm" c="dimmed">
                When enabled, the following will be added to your project:
              </Text>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <Text size="sm">JTE Configuration - Template engine setup in application.properties</Text>
                </li>
                <li>
                  <Text size="sm">Base Layout - Reusable layout template with header/footer</Text>
                </li>
                <li>
                  <Text size="sm">Selected Templates - The templates you choose below</Text>
                </li>
              </ul>
            </Stack>
          </Paper>

          <Group justify="space-between">
            <Text fw={500}>Select Templates</Text>
            <Badge variant="light" color={selectedCount > 0 ? 'blue' : 'gray'}>
              {selectedCount} selected
            </Badge>
          </Group>

          <Stack gap="sm">
            {AVAILABLE_TEMPLATES.map((template) => (
              <Checkbox
                key={template.id}
                label={
                  <Group gap="xs">
                    <Text size="sm">{template.name}</Text>
                    <Text size="xs" c="dimmed">
                      - {template.description}
                    </Text>
                  </Group>
                }
                checked={selectedTemplates.includes(template.id)}
                onChange={() => handleTemplateToggle(template.id)}
              />
            ))}
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
}
