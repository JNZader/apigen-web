import {
  Alert,
  Checkbox,
  Collapse,
  List,
  Paper,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconCheck, IconInfoCircle, IconTemplate } from '@tabler/icons-react';
import { useFeaturePackConfig, useProjectStoreInternal, useTargetConfig } from '../../store';

const AVAILABLE_TEMPLATES = [
  { id: 'login', name: 'Login Page', description: 'User authentication form' },
  { id: 'register', name: 'Registration Page', description: 'New user signup form' },
  { id: 'dashboard', name: 'Dashboard', description: 'Admin dashboard layout' },
  { id: 'error', name: 'Error Pages', description: '404, 500 error templates' },
  { id: 'email', name: 'Email Templates', description: 'Transactional email layouts' },
] as const;

export function JteTemplatesSettingsForm() {
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
      <Switch
        label={
          <Text component="span" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconTemplate size={16} />
            Enable JTE Templates
          </Text>
        }
        description="Generate server-side rendered views using Java Template Engine"
        checked={jteConfig.enabled}
        onChange={(e) => updateJteConfig({ enabled: e.currentTarget.checked })}
        data-testid="jte-enable-toggle"
      />

      {/* Template selection */}
      <Collapse in={jteConfig.enabled}>
        <Stack mt="md">
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
        </Stack>
      </Collapse>
    </Stack>
  );
}
