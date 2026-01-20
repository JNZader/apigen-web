import {
  ActionIcon,
  AppShell,
  Group,
  LoadingOverlay,
  Menu,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
  VisuallyHidden,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDatabase,
  IconDownload,
  IconFileExport,
  IconHelp,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMoon,
  IconSettings,
  IconSun,
  IconTemplate,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { saveAs } from 'file-saver';
import { lazy, type ReactNode, Suspense, useCallback, useRef, useState } from 'react';
import { useHistory, useProjectGeneration } from '../hooks';
import { useProjectStore } from '../store/projectStore';
import { Onboarding } from './Onboarding';

// Lazy load modals for better initial load performance
const ProjectSettings = lazy(() =>
  import('./ProjectSettings').then((m) => ({ default: m.ProjectSettings })),
);
const TemplateSelector = lazy(() =>
  import('./TemplateSelector').then((m) => ({ default: m.TemplateSelector })),
);
const SqlImportExport = lazy(() =>
  import('./SqlImportExport').then((m) => ({ default: m.SqlImportExport })),
);

interface LayoutProps {
  readonly children: ReactNode;
  readonly sidebar?: ReactNode;
}

export function Layout({ children, sidebar }: Readonly<LayoutProps>) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const [templatesOpened, { open: openTemplates, close: closeTemplates }] = useDisclosure(false);
  const [sqlOpened, { open: openSql, close: closeSql }] = useDisclosure(false);
  const [sidebarCollapsed, { toggle: toggleSidebar }] = useDisclosure(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Ref to prevent rapid consecutive exports
  const isExportingRef = useRef(false);

  // Use custom hooks
  const { generating, generateProject } = useProjectGeneration();
  const { undo, redo, canUndo, canRedo } = useHistory();

  // Atomic selectors for better performance
  const project = useProjectStore((state) => state.project);
  const entities = useProjectStore((state) => state.entities);
  const relations = useProjectStore((state) => state.relations);
  const exportProject = useProjectStore((state) => state.exportProject);
  const importProject = useProjectStore((state) => state.importProject);
  const resetProject = useProjectStore((state) => state.resetProject);

  const handleExportJSON = useCallback(() => {
    // Prevent rapid consecutive exports
    if (isExportingRef.current) return;
    isExportingRef.current = true;

    try {
      const json = exportProject();
      const blob = new Blob([json], { type: 'application/json' });
      saveAs(blob, `${project.artifactId}-design.json`);
      notifications.show({
        title: 'Exported',
        message: 'Project design exported successfully',
        color: 'green',
      });
    } finally {
      // Small delay to prevent accidental double-clicks
      setTimeout(() => {
        isExportingRef.current = false;
      }, 500);
    }
  }, [exportProject, project.artifactId]);

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          importProject(text);
          notifications.show({
            title: 'Imported',
            message: 'Project design imported successfully',
            color: 'green',
          });
        } catch {
          notifications.show({
            title: 'Error',
            message: 'Failed to import project design',
            color: 'red',
          });
        }
      }
    };
    input.click();
  };

  const handleReset = () => {
    modals.openConfirmModal({
      title: 'Reset Project',
      children:
        'Are you sure you want to reset the project? This will delete all entities and relations.',
      labels: { confirm: 'Reset', cancel: 'Cancel' },
      confirmProps: { color: 'red', 'aria-label': 'Confirm reset project' },
      cancelProps: { 'aria-label': 'Cancel reset' },
      onConfirm: () => {
        resetProject();
        notifications.show({
          title: 'Reset',
          message: 'Project reset successfully',
          color: 'blue',
        });
      },
    });
  };

  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '6px';
          e.currentTarget.style.top = '6px';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.overflow = 'visible';
          e.currentTarget.style.zIndex = '9999';
          e.currentTarget.style.background = 'var(--mantine-color-blue-6)';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.padding = '8px 16px';
          e.currentTarget.style.borderRadius = '4px';
          e.currentTarget.style.textDecoration = 'none';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
          e.currentTarget.style.width = '1px';
          e.currentTarget.style.height = '1px';
          e.currentTarget.style.overflow = 'hidden';
        }}
      >
        Skip to main content
      </a>

      <AppShell
        header={{ height: 60 }}
        navbar={
          sidebar
            ? {
                width: 320,
                breakpoint: 'sm',
                collapsed: { desktop: sidebarCollapsed, mobile: sidebarCollapsed },
              }
            : undefined
        }
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group wrap="nowrap">
              {sidebar && (
                <Tooltip label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}>
                  <ActionIcon
                    variant="subtle"
                    onClick={toggleSidebar}
                    aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                    aria-expanded={!sidebarCollapsed}
                  >
                    {sidebarCollapsed ? (
                      <IconLayoutSidebarLeftExpand size={20} aria-hidden="true" />
                    ) : (
                      <IconLayoutSidebarLeftCollapse size={20} aria-hidden="true" />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
              <Title order={3} c="blue">
                APiGen Studio
              </Title>
              <Text size="sm" c="dimmed">
                v1.0.0
              </Text>
            </Group>

            <Group wrap="nowrap">
              {/* Status announcement for screen readers */}
              <Text component="output" size="sm" c="dimmed" aria-live="polite" aria-atomic="true">
                {entities.length} entities, {relations.length} relations
              </Text>

              {/* Undo/Redo buttons */}
              <Tooltip label="Undo (Ctrl+Z)">
                <ActionIcon
                  variant="default"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo last action"
                >
                  <IconArrowBackUp size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Redo (Ctrl+Y)">
                <ActionIcon
                  variant="default"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo last undone action"
                >
                  <IconArrowForwardUp size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>

              <Menu shadow="md" width={180}>
                <Menu.Target>
                  <Tooltip label="Templates & Help">
                    <ActionIcon
                      variant="default"
                      aria-label="Templates and help menu"
                      aria-haspopup="menu"
                    >
                      <IconTemplate size={18} aria-hidden="true" />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconTemplate size={16} aria-hidden="true" />}
                    onClick={openTemplates}
                  >
                    Templates Gallery
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconHelp size={16} aria-hidden="true" />}
                    onClick={() => setShowOnboarding(true)}
                  >
                    Show Tutorial
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              <Tooltip label="SQL Import/Export">
                <ActionIcon
                  variant="default"
                  onClick={openSql}
                  aria-label="Open SQL import and export"
                >
                  <IconDatabase size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Project Settings">
                <ActionIcon
                  variant="default"
                  onClick={openSettings}
                  aria-label="Open project settings"
                >
                  <IconSettings size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Import Design (JSON)">
                <ActionIcon
                  variant="default"
                  onClick={handleImportJSON}
                  aria-label="Import project design from JSON file"
                >
                  <IconUpload size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Export Design (JSON)">
                <ActionIcon
                  variant="default"
                  onClick={handleExportJSON}
                  aria-label="Export project design to JSON file"
                >
                  <IconFileExport size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Generate & Download Project">
                <ActionIcon
                  variant="filled"
                  color="blue"
                  size="xl"
                  loading={generating}
                  onClick={generateProject}
                  aria-label={
                    generating ? 'Generating project, please wait' : 'Generate and download project'
                  }
                  aria-busy={generating}
                >
                  <IconDownload size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Reset Project">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={handleReset}
                  aria-label="Reset project and delete all entities"
                >
                  <IconTrash size={18} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}>
                <ActionIcon
                  variant="default"
                  onClick={() => toggleColorScheme()}
                  aria-label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {colorScheme === 'dark' ? (
                    <IconSun size={18} aria-hidden="true" />
                  ) : (
                    <IconMoon size={18} aria-hidden="true" />
                  )}
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </AppShell.Header>

        {sidebar && (
          <AppShell.Navbar p="md" aria-label="Entity navigation sidebar">
            {sidebar}
          </AppShell.Navbar>
        )}

        <AppShell.Main id="main-content" tabIndex={-1}>
          <VisuallyHidden>
            <h1>APiGen Studio - Entity Designer</h1>
          </VisuallyHidden>
          {children}
        </AppShell.Main>

        {/* Lazy-loaded modals with Suspense */}
        <Suspense fallback={<LoadingOverlay visible />}>
          {settingsOpened && <ProjectSettings opened={settingsOpened} onClose={closeSettings} />}
        </Suspense>
        <Suspense fallback={<LoadingOverlay visible />}>
          {templatesOpened && (
            <TemplateSelector opened={templatesOpened} onClose={closeTemplates} />
          )}
        </Suspense>
        <Suspense fallback={<LoadingOverlay visible />}>
          {sqlOpened && <SqlImportExport opened={sqlOpened} onClose={closeSql} />}
        </Suspense>
      </AppShell>

      {/* Live region for generation status */}
      <output
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {generating ? 'Generating project, please wait...' : ''}
      </output>

      {/* Onboarding modal for first-time users */}
      <Onboarding forceShow={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </>
  );
}
