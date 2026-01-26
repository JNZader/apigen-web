# T-009: Actualizar projectStore.ts

> Fase: [[Phases/00-FOUNDATION]] | Iteracion: 0.5 Store Updates

---

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | T-009 |
| **Tipo** | Setup |
| **Estimado** | 1h |
| **Dependencias** | [[T-005]] |
| **Branch** | `feat/foundation-types` |
| **Estado** | Pending |

---

## Objetivo

Actualizar el store principal de Zustand para manejar el nuevo state de target config y Feature Pack 2025.

---

## Tareas

- [ ] Agregar `targetConfig` al state
- [ ] Agregar configs del Feature Pack al state
- [ ] Crear actions para actualizar cada config
- [ ] Crear selectores atomicos
- [ ] Actualizar persistencia (si aplica)
- [ ] Mantener backward compatibility

---

## Archivos a Modificar

```
src/store/
└── projectStore.ts              ← MODIFICAR (~80 lineas adicionales)
```

**LOC Estimado:** ~80 adicionales

---

## Codigo de Referencia

```typescript
// src/store/projectStore.ts - AGREGAR

import type {
  TargetConfig,
  Language,
  Framework,
} from '@/types/target';
import type {
  SocialLoginConfig,
  MailConfig,
  StorageConfig,
  JteConfig,
  FeaturePackConfig,
  DEFAULT_SOCIAL_LOGIN_CONFIG,
  DEFAULT_MAIL_CONFIG,
  DEFAULT_STORAGE_CONFIG,
  DEFAULT_JTE_CONFIG,
} from '@/types/config/featurepack';
import type { RustAxumOptions } from '@/types/config/rust';
import { getLanguageMetadata } from '@/types/target';

// ============================================
// EXTENDED STATE INTERFACE
// ============================================

interface ProjectState {
  // ... existing state ...

  // Target Configuration (NEW)
  targetConfig: TargetConfig | null;

  // Feature Pack 2025 (NEW)
  socialLoginConfig: SocialLoginConfig;
  mailConfig: MailConfig;
  storageConfig: StorageConfig;
  jteConfig: JteConfig;
  passwordReset: boolean;

  // Rust Options (NEW - only used when target.language === 'rust')
  rustOptions: RustAxumOptions | null;
}

// ============================================
// EXTENDED ACTIONS INTERFACE
// ============================================

interface ProjectActions {
  // ... existing actions ...

  // Target Actions (NEW)
  setTargetLanguage: (language: Language, framework: Framework) => void;
  clearTarget: () => void;

  // Feature Pack Actions (NEW)
  updateSocialLoginConfig: (updates: Partial<SocialLoginConfig>) => void;
  updateMailConfig: (updates: Partial<MailConfig>) => void;
  updateStorageConfig: (updates: Partial<StorageConfig>) => void;
  updateJteConfig: (updates: Partial<JteConfig>) => void;
  setPasswordReset: (enabled: boolean) => void;

  // Rust Options Actions (NEW)
  setRustPreset: (preset: RustPreset) => void;
  updateRustOptions: (updates: Partial<RustAxumOptions>) => void;
}

// ============================================
// INITIAL STATE ADDITIONS
// ============================================

const initialState: ProjectState = {
  // ... existing initial state ...

  // Target (default to Java/Spring for backward compat)
  targetConfig: {
    language: 'java',
    framework: 'spring-boot',
  },

  // Feature Pack 2025 (all disabled by default)
  socialLoginConfig: DEFAULT_SOCIAL_LOGIN_CONFIG,
  mailConfig: DEFAULT_MAIL_CONFIG,
  storageConfig: DEFAULT_STORAGE_CONFIG,
  jteConfig: DEFAULT_JTE_CONFIG,
  passwordReset: false,

  // Rust Options (null until Rust is selected)
  rustOptions: null,
};

// ============================================
// ACTION IMPLEMENTATIONS
// ============================================

export const useProjectStore = create<ProjectState & ProjectActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ... existing actions ...

      // ========== TARGET ACTIONS ==========

      setTargetLanguage: (language, framework) => {
        const metadata = getLanguageMetadata(language, framework);

        set({
          targetConfig: { language, framework },
          // Initialize rust options if Rust is selected
          rustOptions: language === 'rust'
            ? getDefaultRustOptions('cloud')
            : null,
        });

        // Auto-disable unsupported features
        if (metadata) {
          const currentFeatures = get().features;
          const updates: Partial<typeof currentFeatures> = {};

          if (!metadata.supportedFeatures.jteTemplates && get().jteConfig.enabled) {
            set({ jteConfig: { ...get().jteConfig, enabled: false } });
          }
          if (!metadata.supportedFeatures.socialLogin && get().socialLoginConfig.enabled) {
            set({ socialLoginConfig: { ...get().socialLoginConfig, enabled: false } });
          }
          // ... etc for other features
        }
      },

      clearTarget: () => {
        set({
          targetConfig: null,
          rustOptions: null,
        });
      },

      // ========== FEATURE PACK ACTIONS ==========

      updateSocialLoginConfig: (updates) => {
        set((state) => ({
          socialLoginConfig: { ...state.socialLoginConfig, ...updates },
        }));
      },

      updateMailConfig: (updates) => {
        set((state) => ({
          mailConfig: { ...state.mailConfig, ...updates },
        }));
      },

      updateStorageConfig: (updates) => {
        set((state) => ({
          storageConfig: { ...state.storageConfig, ...updates },
        }));
      },

      updateJteConfig: (updates) => {
        set((state) => ({
          jteConfig: { ...state.jteConfig, ...updates },
        }));
      },

      setPasswordReset: (enabled) => {
        set({ passwordReset: enabled });
      },

      // ========== RUST OPTIONS ACTIONS ==========

      setRustPreset: (preset) => {
        set({
          rustOptions: getDefaultRustOptions(preset),
        });
      },

      updateRustOptions: (updates) => {
        set((state) => ({
          rustOptions: state.rustOptions
            ? { ...state.rustOptions, ...updates }
            : null,
        }));
      },

      // ========== OVERRIDE RESET ==========

      resetProject: () => {
        set({
          ...initialState,
          // Keep any user preferences if needed
        });
      },
    }),
    {
      name: 'apigen-project-store',
      // Add new fields to persisted state
      partialize: (state) => ({
        // ... existing persisted fields ...
        targetConfig: state.targetConfig,
        socialLoginConfig: state.socialLoginConfig,
        mailConfig: state.mailConfig,
        storageConfig: state.storageConfig,
        jteConfig: state.jteConfig,
        passwordReset: state.passwordReset,
        rustOptions: state.rustOptions,
      }),
    }
  )
);

// ============================================
// ATOMIC SELECTORS (NEW)
// ============================================

// Target selectors
export const useTargetConfig = () =>
  useProjectStore((s) => s.targetConfig);
export const useTargetLanguage = () =>
  useProjectStore((s) => s.targetConfig?.language);
export const useIsRust = () =>
  useProjectStore((s) => s.targetConfig?.language === 'rust');

// Feature Pack selectors
export const useSocialLoginConfig = () =>
  useProjectStore((s) => s.socialLoginConfig);
export const useMailConfig = () =>
  useProjectStore((s) => s.mailConfig);
export const useStorageConfig = () =>
  useProjectStore((s) => s.storageConfig);
export const useJteConfig = () =>
  useProjectStore((s) => s.jteConfig);
export const usePasswordReset = () =>
  useProjectStore((s) => s.passwordReset);

// Rust selectors
export const useRustOptions = () =>
  useProjectStore((s) => s.rustOptions);

// Computed selectors
export const useHasFeaturePackEnabled = () =>
  useProjectStore((s) =>
    s.socialLoginConfig.enabled ||
    s.mailConfig.enabled ||
    s.storageConfig.type !== 'local' ||
    s.jteConfig.enabled ||
    s.passwordReset
  );
```

---

## Criterios de Completado

- [ ] Nuevo state agregado sin romper existente
- [ ] Actions funcionan correctamente
- [ ] Selectores atomicos exportados
- [ ] Persistencia incluye nuevos campos
- [ ] Backward compatibility (Java/Spring default)
- [ ] `npm run check` pasa
- [ ] Tests existentes siguen pasando

---

## Notas

- Mantener backward compatibility para proyectos existentes
- Default a Java/Spring Boot para no romper UX actual
- Rust options solo se inicializa cuando se selecciona Rust
- Usar selectores atomicos para evitar re-renders

---

## Pre-Commit Checklist

> **Antes de commitear**, ejecutar en orden:

```bash
npm run check:fix && npm run test:run && gga run
```

- [ ] `npm run build` - Sin errores de tipos
- [ ] `npm run check:fix` - Lint/formato OK
- [ ] `npm run test:run` - Tests pasan
- [ ] `gga run` - STATUS: PASSED

> Ver detalles: [[WORKFLOW-PRECOMMIT]]

---

## Log de Trabajo

| Fecha | Tiempo | Notas |
|-------|--------|-------|
| - | - | - |

---

#task #fase-0 #setup #pending

[[T-005]] → [[T-009]] → [[T-010]] | [[Phases/00-FOUNDATION]]
