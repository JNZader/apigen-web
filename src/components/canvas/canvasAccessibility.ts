/**
 * Accessibility helpers for canvas screen reader descriptions.
 */

interface EntityForDescription {
  id: string;
  name: string;
  fields: unknown[];
}

interface RelationForDescription {
  sourceEntityId: string;
  targetEntityId: string;
  type: string;
}

interface ServiceForDescription {
  id: string;
  name: string;
  entityIds: string[];
}

interface ServiceConnectionForDescription {
  sourceServiceId: string;
  targetServiceId: string;
  communicationType: string;
}

/**
 * Generate entity view description for accessibility (screen readers).
 */
export function buildEntityViewDescription(
  entities: EntityForDescription[],
  relations: RelationForDescription[],
  selectedEntityId: string | null,
): string {
  if (entities.length === 0) {
    return 'Empty entity diagram canvas. Use the Add Entity button to create your first entity.';
  }

  const entityNames = entities.map((e) => e.name).join(', ');
  const relationDescriptions = relations.map((r) => {
    const source = entities.find((e) => e.id === r.sourceEntityId)?.name || 'Unknown';
    const target = entities.find((e) => e.id === r.targetEntityId)?.name || 'Unknown';
    return `${source} to ${target} (${r.type})`;
  });

  let description = `Entity diagram with ${entities.length} ${entities.length === 1 ? 'entity' : 'entities'}: ${entityNames}.`;

  if (relations.length > 0) {
    description += ` ${relations.length} ${relations.length === 1 ? 'relation' : 'relations'}: ${relationDescriptions.join('; ')}.`;
  }

  if (selectedEntityId) {
    const selected = entities.find((e) => e.id === selectedEntityId);
    if (selected) {
      description += ` Currently selected: ${selected.name} with ${selected.fields.length} fields.`;
    }
  }

  return description;
}

/**
 * Generate services view description for accessibility (screen readers).
 */
export function buildServicesViewDescription(
  services: ServiceForDescription[],
  serviceConnections: ServiceConnectionForDescription[],
  selectedServiceId: string | null,
): string {
  if (services.length === 0) {
    return 'Empty microservices canvas. Use the Add Service button to create your first service.';
  }

  const serviceNames = services.map((s) => s.name).join(', ');
  const connectionDescriptions = serviceConnections.map((c) => {
    const source = services.find((s) => s.id === c.sourceServiceId)?.name || 'Unknown';
    const target = services.find((s) => s.id === c.targetServiceId)?.name || 'Unknown';
    return `${source} to ${target} (${c.communicationType})`;
  });

  let description = `Microservices diagram with ${services.length} ${services.length === 1 ? 'service' : 'services'}: ${serviceNames}.`;

  if (serviceConnections.length > 0) {
    description += ` ${serviceConnections.length} ${serviceConnections.length === 1 ? 'connection' : 'connections'}: ${connectionDescriptions.join('; ')}.`;
  }

  if (selectedServiceId) {
    const selected = services.find((s) => s.id === selectedServiceId);
    if (selected) {
      description += ` Currently selected: ${selected.name} with ${selected.entityIds.length} entities.`;
    }
  }

  return description;
}
