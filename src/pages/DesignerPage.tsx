import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconArchive,
  IconInfoCircle,
  IconLayoutBoard,
  IconLayoutGrid,
  IconPlug,
  IconPlus,
} from '@tabler/icons-react';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import { DesignerCanvas } from '../components/canvas/DesignerCanvas';
import { EntityCard } from '../components/EntityCard';
import { EntityDetailPanel } from '../components/EntityDetailPanel';
import { EntityForm } from '../components/EntityForm';
import { EntityList } from '../components/EntityList';
import { EventMessageDesigner } from '../components/EventMessageDesigner';
import { Layout } from '../components/Layout';
import { MultiServiceExport } from '../components/MultiServiceExport';
import { RelationForm } from '../components/RelationForm';
import { SectionErrorBoundary } from '../components/SectionErrorBoundary';
import { ServiceConfigPanel } from '../components/ServiceConfigPanel';
import { useEntityDeletion, useHistory, useKeyboardShortcuts, useSelectedEntity } from '../hooks';
import { useProjectStore, useServiceActions } from '../store/projectStore';

type ViewMode = 'canvas' | 'grid';

export function DesignerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [entityFormOpened, { open: openEntityForm, close: closeEntityForm }] = useDisclosure(false);
  const [relationFormOpened, { open: openRelationForm, close: closeRelationForm }] =
    useDisclosure(false);
  const [serviceFormOpened, { open: openServiceForm, close: closeServiceForm }] =
    useDisclosure(false);
  const [serviceConfigOpened, { open: openServiceConfig, close: closeServiceConfig }] =
    useDisclosure(false);
  const [eventDesignerOpened, { open: openEventDesigner, close: closeEventDesigner }] =
    useDisclosure(false);
  const [serviceExportOpened, { open: openServiceExport, close: closeServiceExport }] =
    useDisclosure(false);
  const [editingEntity, setEditingEntity] = useState<string | null>(null);
  const [relationSource, setRelationSource] = useState<string>('');
  const [relationTarget, setRelationTarget] = useState<string>('');
  const [newServiceName, setNewServiceName] = useState('');
  const [configureServiceId, setConfigureServiceId] = useState<string | null>(null);

  // Use custom hooks for cleaner code
  const {
    selectedEntity,
    selectedEntityId,
    selectEntity,
    clearSelection,
    updateSelectedField,
    removeSelectedField,
  } = useSelectedEntity();

  const { confirmDelete } = useEntityDeletion();
  const { undo, redo } = useHistory();

  // Get entities list and store actions (atomic selectors)
  const entities = useProjectStore((state) => state.entities);
  const getEntity = useProjectStore((state) => state.getEntity);
  const project = useProjectStore((state) => state.project);
  const exportProject = useProjectStore((state) => state.exportProject);

  // Service actions
  const { addService } = useServiceActions();

  // Event handlers
  const handleEditEntity = (entityId: string) => {
    setEditingEntity(entityId);
    openEntityForm();
  };

  const handleAddEntity = () => {
    setEditingEntity(null);
    openEntityForm();
  };

  const handleAddRelation = (sourceId: string, targetId: string) => {
    setRelationSource(sourceId);
    setRelationTarget(targetId);
    openRelationForm();
  };

  // Service handlers
  const handleAddService = () => {
    setNewServiceName('');
    openServiceForm();
  };

  const handleCreateService = () => {
    if (!newServiceName.trim()) {
      notifications.show({
        title: 'Invalid name',
        message: 'Please enter a service name',
        color: 'red',
      });
      return;
    }
    addService(newServiceName.trim());
    closeServiceForm();
    setNewServiceName('');
    notifications.show({
      title: 'Service created',
      message: `Service "${newServiceName.trim()}" has been created`,
      color: 'green',
    });
  };

  const handleConfigureService = (serviceId: string) => {
    setConfigureServiceId(serviceId);
    openServiceConfig();
  };

  // Quick save function for keyboard shortcut
  const handleQuickSave = () => {
    const json = exportProject();
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `${project.artifactId}-design.json`);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSave: handleQuickSave,
    onAddEntity: handleAddEntity,
    onDelete: () => {
      if (selectedEntityId) {
        confirmDelete(selectedEntityId);
      }
    },
    onEscape: () => {
      if (entityFormOpened) {
        closeEntityForm();
        setEditingEntity(null);
      } else if (relationFormOpened) {
        closeRelationForm();
      } else {
        clearSelection();
      }
    },
  });

  const sidebar = <EntityList onAddEntity={handleAddEntity} />;

  return (
    <Layout sidebar={sidebar}>
      {/* View mode toggle */}
      <Group justify="space-between" mb="md">
        <SegmentedControl
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
          aria-label="View mode selection. Use arrow keys to switch views"
          data={[
            {
              value: 'canvas',
              label: (
                <Group gap={6} wrap="nowrap" align="center">
                  <IconLayoutBoard size={16} aria-hidden="true" />
                  <span>Canvas</span>
                </Group>
              ),
            },
            {
              value: 'grid',
              label: (
                <Group gap={6} wrap="nowrap" align="center">
                  <IconLayoutGrid size={16} aria-hidden="true" />
                  <span>Grid</span>
                </Group>
              ),
            },
          ]}
        />
        <Group gap="md">
          {viewMode === 'canvas' && (
            <Text size="xs" c="dimmed">
              Drag entities to position them. Connect handles to create relations.
            </Text>
          )}
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlug size={14} />}
            onClick={openEventDesigner}
          >
            Event Streams
          </Button>
          <Button
            variant="light"
            size="xs"
            color="teal"
            leftSection={<IconArchive size={14} />}
            onClick={openServiceExport}
          >
            Export Services
          </Button>
        </Group>
      </Group>

      {viewMode === 'canvas' ? (
        /* Canvas View */
        <Grid gutter="md">
          <Grid.Col span={selectedEntity ? 8 : 12}>
            <Paper withBorder style={{ height: 'calc(100vh - 160px)' }}>
              <SectionErrorBoundary section="Canvas" variant="full">
                <DesignerCanvas
                  onAddEntity={handleAddEntity}
                  onEditEntity={handleEditEntity}
                  onSelectEntity={selectEntity}
                  onAddRelation={handleAddRelation}
                  onAddService={handleAddService}
                  onConfigureService={handleConfigureService}
                />
              </SectionErrorBoundary>
            </Paper>
          </Grid.Col>

          {/* Detail panel for canvas view - using shared component */}
          {selectedEntity && (
            <Grid.Col span={4}>
              <SectionErrorBoundary section="Entity Details" variant="panel">
                <EntityDetailPanel
                  entity={selectedEntity}
                  onEdit={() => handleEditEntity(selectedEntity.id)}
                  onClose={clearSelection}
                  onUpdateField={updateSelectedField}
                  onRemoveField={removeSelectedField}
                  showEditButton={true}
                />
              </SectionErrorBoundary>
            </Grid.Col>
          )}
        </Grid>
      ) : (
        /* Grid View */
        <Grid gutter="md">
          <Grid.Col span={selectedEntity ? 6 : 12}>
            <Paper p="md" withBorder h="calc(100vh - 160px)">
              <Stack h="100%">
                <Group justify="space-between">
                  <Title order={4}>Entities</Title>
                  <Button
                    leftSection={<IconPlus size={16} aria-hidden="true" />}
                    size="xs"
                    onClick={handleAddEntity}
                  >
                    Add Entity
                  </Button>
                </Group>

                <Divider />

                {entities.length === 0 ? (
                  <Stack align="center" justify="center" style={{ flex: 1 }}>
                    <Alert
                      icon={<IconInfoCircle size={16} aria-hidden="true" />}
                      title="No entities yet"
                      color="blue"
                    >
                      <Text size="sm">
                        Start by creating your first entity. Each entity will generate:
                      </Text>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        <li>Entity class (extends Base)</li>
                        <li>DTO record</li>
                        <li>Repository interface</li>
                        <li>Service implementation</li>
                        <li>REST Controller (12+ endpoints)</li>
                        <li>HATEOAS Resource Assembler</li>
                      </ul>
                      <Button
                        mt="sm"
                        leftSection={<IconPlus size={14} aria-hidden="true" />}
                        onClick={handleAddEntity}
                      >
                        Create First Entity
                      </Button>
                    </Alert>
                  </Stack>
                ) : (
                  <Box
                    component="ul"
                    style={{
                      overflow: 'auto',
                      flex: 1,
                      display: 'grid',
                      gridTemplateColumns: `repeat(auto-fill, minmax(${selectedEntity ? '100%' : '300px'}, 1fr))`,
                      gap: 'var(--mantine-spacing-md)',
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                    aria-label="Entity cards"
                  >
                    {entities.map((entity) => (
                      <li key={entity.id}>
                        <EntityCard
                          entity={entity}
                          isSelected={selectedEntityId === entity.id}
                          onSelect={() => selectEntity(entity.id)}
                          onEdit={() => handleEditEntity(entity.id)}
                          onDelete={() => confirmDelete(entity.id)}
                        />
                      </li>
                    ))}
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Detail panel for grid view - using shared component */}
          {selectedEntity && (
            <Grid.Col span={6}>
              <SectionErrorBoundary section="Entity Details" variant="panel">
                <EntityDetailPanel
                  entity={selectedEntity}
                  onClose={clearSelection}
                  onUpdateField={updateSelectedField}
                  onRemoveField={removeSelectedField}
                  showEditButton={false}
                />
              </SectionErrorBoundary>
            </Grid.Col>
          )}
        </Grid>
      )}

      <EntityForm
        key={editingEntity ?? 'new'}
        opened={entityFormOpened}
        onClose={() => {
          closeEntityForm();
          setEditingEntity(null);
        }}
        entity={editingEntity ? getEntity(editingEntity) : undefined}
      />

      <RelationForm
        key={`${relationSource}-${relationTarget}`}
        opened={relationFormOpened}
        onClose={closeRelationForm}
        sourceEntityId={relationSource}
        targetEntityId={relationTarget}
      />

      {/* Service creation modal */}
      <Modal
        opened={serviceFormOpened}
        onClose={closeServiceForm}
        title="Create New Service"
        size="sm"
      >
        <Stack>
          <TextInput
            label="Service Name"
            placeholder="e.g., OrderService, UserService"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.currentTarget.value)}
            data-autofocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateService();
              }
            }}
          />
          <Text size="xs" c="dimmed">
            Each service can contain multiple entities and will be generated as an independent
            Spring Boot application.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeServiceForm}>
              Cancel
            </Button>
            <Button color="teal" onClick={handleCreateService}>
              Create Service
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Service configuration panel */}
      <ServiceConfigPanel
        key={configureServiceId ?? 'none'}
        serviceId={configureServiceId}
        opened={serviceConfigOpened}
        onClose={() => {
          closeServiceConfig();
          setConfigureServiceId(null);
        }}
      />

      {/* Event/Message designer drawer */}
      <Drawer
        opened={eventDesignerOpened}
        onClose={closeEventDesigner}
        title={
          <Group gap="sm">
            <IconPlug size={20} />
            <Title order={4}>Event Streams</Title>
          </Group>
        }
        position="right"
        size="xl"
        padding="lg"
      >
        <SectionErrorBoundary section="Event Designer" variant="modal">
          <EventMessageDesigner />
        </SectionErrorBoundary>
      </Drawer>

      {/* Multi-service export drawer */}
      <Drawer
        opened={serviceExportOpened}
        onClose={closeServiceExport}
        title={
          <Group gap="sm">
            <IconArchive size={20} />
            <Title order={4}>Export Services</Title>
          </Group>
        }
        position="right"
        size="lg"
        padding="lg"
      >
        <SectionErrorBoundary section="Service Export" variant="modal">
          <MultiServiceExport />
        </SectionErrorBoundary>
      </Drawer>
    </Layout>
  );
}
