import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useCallback, useRef, useState } from 'react';
import { generateProject as generateWithServer } from '../api/generatorApi';
import { useProjectStore } from '../store/projectStore';
import type { EntityDesign, ServiceDesign } from '../types';
import { addServiceToZip } from '../utils/archiveSecurity';
import { notify } from '../utils/notifications';
import { buildProjectConfig } from '../utils/projectConfigBuilder';
import { generateSQL } from '../utils/sqlGenerator';

// Helper function to create service artifact ID
function createServiceArtifactId(serviceName: string): string {
  return `api-${serviceName.toLowerCase().replaceAll(/[^a-z0-9]/g, '-')}`;
}

interface ExportProgress {
  current: number;
  total: number;
  currentServiceName: string;
}

interface ServiceExportResult {
  serviceId: string;
  serviceName: string;
  success: boolean;
  blob?: Blob;
  error?: string;
}

// Helper to show export result notification
function showExportNotification(successCount: number, failedServices: ServiceExportResult[]): void {
  if (successCount === 0) {
    notify.error({
      title: 'Export failed',
      message: 'No services could be exported',
    });
    return;
  }

  if (failedServices.length > 0) {
    notify.warning({
      title: 'Partial export',
      message: `${successCount} services exported. Failed: ${failedServices.map((s) => s.serviceName).join(', ')}`,
    });
  } else {
    notify.success({
      title: 'All services exported',
      message: `${successCount} services have been exported successfully`,
    });
  }
}

/**
 * Custom hook for multi-service project export.
 * Allows exporting individual services or all services as a combined archive.
 */
export function useMultiServiceExport() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const isExportingRef = useRef(false);

  const project = useProjectStore((state) => state.project);
  const entities = useProjectStore((state) => state.entities);
  const relations = useProjectStore((state) => state.relations);
  const services = useProjectStore((state) => state.services);

  /**
   * Get entities belonging to a specific service
   */
  const getServiceEntities = useCallback(
    (service: ServiceDesign): EntityDesign[] => {
      return entities.filter((entity) => service.entityIds.includes(entity.id));
    },
    [entities],
  );

  /**
   * Get relations between entities in a service
   */
  const getServiceRelations = useCallback(
    (serviceEntities: EntityDesign[]) => {
      const entityIds = new Set(serviceEntities.map((e) => e.id));
      return relations.filter(
        (r) => entityIds.has(r.sourceEntityId) && entityIds.has(r.targetEntityId),
      );
    },
    [relations],
  );

  /**
   * Generate a project for a single service
   */
  const generateServiceProject = useCallback(
    async (service: ServiceDesign): Promise<ServiceExportResult> => {
      const serviceEntities = getServiceEntities(service);

      if (serviceEntities.length === 0) {
        return {
          serviceId: service.id,
          serviceName: service.name,
          success: false,
          error: 'No entities assigned to this service',
        };
      }

      try {
        const serviceRelations = getServiceRelations(serviceEntities);
        const serviceSql = generateSQL(serviceEntities, serviceRelations, service.name);

        const projectConfig = buildProjectConfig(project, service);

        // Extract target config to send at request level (backend expects it there)
        const target = projectConfig.targetConfig
          ? {
              language: projectConfig.targetConfig.language,
              framework: projectConfig.targetConfig.framework,
            }
          : undefined;

        const blob = await generateWithServer({
          project: projectConfig,
          target,
          sql: serviceSql,
        });

        return {
          serviceId: service.id,
          serviceName: service.name,
          success: true,
          blob,
        };
      } catch (error) {
        return {
          serviceId: service.id,
          serviceName: service.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [project, getServiceEntities, getServiceRelations],
  );

  /**
   * Export a single service as a ZIP file
   */
  const exportSingleService = useCallback(
    async (serviceId: string): Promise<boolean> => {
      if (isExportingRef.current) return false;

      const service = services.find((s) => s.id === serviceId);
      if (!service) {
        notify.error({
          title: 'Service not found',
          message: 'The selected service could not be found',
        });
        return false;
      }

      isExportingRef.current = true;
      setExporting(true);
      setProgress({ current: 0, total: 1, currentServiceName: service.name });

      try {
        const result = await generateServiceProject(service);

        if (result.success && result.blob) {
          saveAs(result.blob, `${createServiceArtifactId(service.name)}.zip`);

          notify.success({
            title: 'Service exported',
            message: `${service.name} has been exported successfully`,
          });
          return true;
        } else {
          notify.error({
            title: 'Export failed',
            message: result.error || 'Failed to export service',
          });
          return false;
        }
      } finally {
        isExportingRef.current = false;
        setExporting(false);
        setProgress(null);
      }
    },
    [services, generateServiceProject],
  );

  /**
   * Export all services as a combined archive
   */
  const exportAllServices = useCallback(async (): Promise<boolean> => {
    if (isExportingRef.current) return false;

    const servicesWithEntities = services.filter((s) => s.entityIds.length > 0);

    if (servicesWithEntities.length === 0) {
      notify.warning({
        title: 'No services to export',
        message: 'Add entities to services before exporting',
      });
      return false;
    }

    isExportingRef.current = true;
    setExporting(true);

    try {
      const zip = new JSZip();
      const results: ServiceExportResult[] = [];

      for (let i = 0; i < servicesWithEntities.length; i++) {
        const service = servicesWithEntities[i];
        setProgress({
          current: i + 1,
          total: servicesWithEntities.length,
          currentServiceName: service.name,
        });

        const result = await generateServiceProject(service);
        results.push(result);

        if (result.success && result.blob) {
          await addServiceToZip(zip, result.blob, createServiceArtifactId(service.name));
        }
      }

      // Check results and show notification
      const successCount = results.filter((r) => r.success).length;
      const failedServices = results.filter((r) => !r.success);

      if (successCount === 0) {
        showExportNotification(0, failedServices);
        return false;
      }

      // Generate the combined archive
      const combinedBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(combinedBlob, `${project.artifactId}-microservices.zip`);
      showExportNotification(successCount, failedServices);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export services';
      notify.error({
        title: 'Export error',
        message: errorMessage,
      });
      return false;
    } finally {
      isExportingRef.current = false;
      setExporting(false);
      setProgress(null);
    }
  }, [services, project.artifactId, generateServiceProject]);

  return {
    exporting,
    progress,
    services,
    exportSingleService,
    exportAllServices,
    getServiceEntities,
  };
}
