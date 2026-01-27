# Multi-Language Support for Microservices

## Overview

This feature allows each microservice in a project to use a different programming language and framework. For example, one service can use Java/Spring Boot while another uses Python/FastAPI.

## Architecture

### Design Principles

1. **Optional Configuration**: Services without explicit language configuration inherit from the project
2. **Backward Compatibility**: Existing projects continue working without changes
3. **Database Compatibility Awareness**: UI warns about unsupported database/language combinations
4. **Clear UX**: Visual indicators show when a service uses a different language

### Data Flow

```
ServiceDesign.config.targetConfig  ─┐
                                    ├─> buildProjectConfig() ─> generateWithServer()
ProjectConfig.targetConfig ─────────┘
                                    (service config takes precedence if defined)
```

## Implementation Details

### Phase 1: Types (`src/types/service.ts`)

Add optional `targetConfig` to `ServiceConfig`:

```typescript
import type { TargetConfig } from './target';

export interface ServiceConfig {
  // ... existing fields ...

  /** Per-service language/framework. If undefined, inherits from project. */
  targetConfig?: TargetConfig;
}

export const defaultServiceConfig: ServiceConfig = {
  // ... existing defaults ...
  targetConfig: undefined, // Inherits from project
};
```

### Phase 2: Database Compatibility (`src/types/config/databaseCompatibility.ts`)

New file defining which databases are compatible with which languages:

```typescript
import type { Language } from '../target';
import type { ServiceDatabaseType } from '../service';

export const DATABASE_COMPATIBILITY: Record<Language, ServiceDatabaseType[]> = {
  java: ['postgresql', 'mysql', 'mongodb', 'redis', 'h2'],
  kotlin: ['postgresql', 'mysql', 'mongodb', 'redis', 'h2'],
  python: ['postgresql', 'mysql', 'mongodb', 'redis'],
  typescript: ['postgresql', 'mysql', 'mongodb', 'redis'],
  php: ['postgresql', 'mysql', 'mongodb', 'redis'],
  go: ['postgresql', 'mysql', 'mongodb', 'redis'],
  rust: ['postgresql', 'mysql', 'redis'], // Limited MongoDB support
  csharp: ['postgresql', 'mysql', 'mongodb', 'redis'],
};

export function isDatabaseCompatible(
  language: Language,
  database: ServiceDatabaseType
): boolean;

export function getCompatibleDatabases(language: Language): ServiceDatabaseType[];
```

### Phase 3: Store Actions (`src/store/serviceStore.ts`)

Add action to update service target configuration:

```typescript
interface ServiceState {
  // ... existing state ...

  // New action
  setServiceTargetConfig: (
    serviceId: string,
    targetConfig: TargetConfig | undefined
  ) => void;
}
```

### Phase 4: Project Config Builder (`src/utils/projectConfigBuilder.ts`)

Modify `buildProjectConfig` to use service-specific target:

```typescript
export function buildProjectConfig(
  baseProject: ProjectConfig,
  service?: ServiceDesign,
): ProjectConfig {
  // Use service target if exists, otherwise project target
  const effectiveTargetConfig = service?.config.targetConfig ?? baseProject.targetConfig;

  // Build config with effective target
  const builtTargetConfig = buildTargetConfig({
    ...baseProject,
    targetConfig: effectiveTargetConfig,
  });

  // ... rest of function uses builtTargetConfig ...
}
```

### Phase 5: Multi-Service Export (`src/hooks/useMultiServiceExport.ts`)

Pass the effective target configuration when generating each service:

```typescript
const generateServiceProject = useCallback(
  async (service: ServiceDesign): Promise<ServiceExportResult> => {
    // Use service target if defined, otherwise project target
    const effectiveTarget = service.config.targetConfig ?? project.targetConfig;

    const projectConfig = buildProjectConfig(project, service);

    const target = effectiveTarget ? {
      language: effectiveTarget.language,
      framework: effectiveTarget.framework,
    } : undefined;

    const blob = await generateWithServer({
      project: projectConfig,
      target, // Service-specific target
      sql: serviceSql,
    });
    // ...
  },
  [project, ...]
);
```

### Phase 6: Service Language Selector (`src/components/ServiceLanguageSelector/`)

New component for selecting service language:

```typescript
interface ServiceLanguageSelectorProps {
  readonly currentTarget?: TargetConfig;
  readonly projectTarget: TargetConfig;
  readonly onTargetChange: (target: TargetConfig | undefined) => void;
  readonly databaseType: ServiceDatabaseType;
}

export function ServiceLanguageSelector({ ... }: ServiceLanguageSelectorProps) {
  const isInherited = !currentTarget;

  return (
    <Stack gap="md">
      <Switch
        label="Use project configuration"
        checked={isInherited}
        onChange={(e) => onTargetChange(
          e.currentTarget.checked ? undefined : { ...projectTarget }
        )}
      />

      {!isInherited && (
        <>
          <LanguageSelector ... />
          <FrameworkSelector ... />
          <VersionSelectors ... />

          {/* Compatibility warning */}
          {!isDatabaseCompatible(currentTarget.language, databaseType) && (
            <Alert color="yellow">
              {databaseType} may have limited support with {currentTarget.language}
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
}
```

### Phase 7: Service Config Panel (`src/components/ServiceConfigPanel.tsx`)

Add new "Language" tab:

```tsx
<Tabs.Tab value="language" leftSection={<IconCode size={14} />}>
  Language
</Tabs.Tab>

<Tabs.Panel value="language" pt="md">
  <ServiceLanguageSelector
    currentTarget={config.targetConfig}
    projectTarget={projectTargetConfig}
    onTargetChange={(target) => setConfig(prev => ({ ...prev, targetConfig: target }))}
    databaseType={config.databaseType}
  />
</Tabs.Panel>
```

### Phase 8: Service Node Badge (`src/components/canvas/ServiceNode.tsx`)

Show language badge when service uses different language:

```tsx
{service.config.targetConfig && (
  <Badge
    size="xs"
    variant="light"
    color={LANGUAGE_COLORS[service.config.targetConfig.language]}
  >
    {LANGUAGE_METADATA[service.config.targetConfig.language].label}
  </Badge>
)}
```

## Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `src/types/service.ts` | Modified | Add `targetConfig` to ServiceConfig |
| `src/types/config/databaseCompatibility.ts` | New | Database/language compatibility matrix |
| `src/types/config/index.ts` | Modified | Export new compatibility types |
| `src/store/serviceStore.ts` | Modified | Add `setServiceTargetConfig` action |
| `src/utils/projectConfigBuilder.ts` | Modified | Use service target config |
| `src/hooks/useMultiServiceExport.ts` | Modified | Pass service target to generator |
| `src/components/ServiceLanguageSelector/ServiceLanguageSelector.tsx` | New | Language selection UI |
| `src/components/ServiceLanguageSelector/index.ts` | New | Re-export |
| `src/components/ServiceConfigPanel.tsx` | Modified | Add Language tab |
| `src/components/canvas/ServiceNode.tsx` | Modified | Show language badge |

## Backward Compatibility

- `targetConfig` is optional - existing services work unchanged
- `undefined` means "inherit from project" - current default behavior
- No data migration required
- Exported JSON format is backward compatible

## Usage Example

1. Create a project with Java/Spring Boot as default language
2. Add services: UserService, OrderService, NotificationService
3. Configure UserService to use default (Java/Spring Boot)
4. Configure OrderService to use Python/FastAPI
5. Configure NotificationService to use Go/Chi
6. Export all services - each generates with its configured language

## Testing Checklist

- [ ] Service without targetConfig uses project language
- [ ] Service with targetConfig uses its own language
- [ ] Database compatibility warning shows for incompatible combos
- [ ] H2 database shows error for non-Java/Kotlin languages
- [ ] Language badge appears on ServiceNode when different from project
- [ ] Exported ZIP contains correct language code for each service
- [ ] Import/Export preserves service targetConfig
