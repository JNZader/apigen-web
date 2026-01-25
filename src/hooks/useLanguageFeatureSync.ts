/**
 * useLanguageFeatureSync Hook
 *
 * Manages automatic feature synchronization when language/framework changes.
 * - Disables features not supported by the new language/framework
 * - Enables required dependencies when a feature is enabled
 * - Shows notifications about feature changes
 */

import { useCallback, useMemo, useRef } from 'react';
import { useProjectStoreInternal } from '../store/projectStore';
import type { Language, Framework } from '../types/target';
import type { ProjectFeatures } from '../types/project';
import {
  type FeatureKey,
  FEATURE_LABELS,
  getFeatureDependencies,
  getFeatureDependents,
  getUnsupportedFeatures,
  isFeatureSupportedByFramework,
} from '../types/config/featureCompatibility';
import { notify } from '../utils/notifications';
import { LANGUAGE_METADATA } from '../types/target';

// ============================================================================
// TYPES
// ============================================================================

export interface LanguageFeatureSyncResult {
  /**
   * Handle language change - disables incompatible features and shows notification
   */
  handleLanguageChange: (newLanguage: Language, newFramework: Framework) => DisabledFeaturesResult;

  /**
   * Handle framework change - checks for framework-specific feature compatibility
   */
  handleFrameworkChange: (newFramework: Framework) => DisabledFeaturesResult;

  /**
   * Enable a feature and its dependencies
   */
  enableFeatureWithDependencies: (feature: FeatureKey) => EnabledDependenciesResult;

  /**
   * Disable a feature and its dependents
   */
  disableFeatureWithDependents: (feature: FeatureKey) => DisabledDependentsResult;

  /**
   * Check if a feature is supported by current language/framework
   */
  isFeatureSupported: (feature: FeatureKey) => boolean;

  /**
   * Get list of unsupported features for current language/framework
   */
  unsupportedFeatures: FeatureKey[];
}

export interface DisabledFeaturesResult {
  /** Features that were disabled */
  disabledFeatures: FeatureKey[];
  /** Whether any features were disabled */
  hasDisabledFeatures: boolean;
}

export interface EnabledDependenciesResult {
  /** Dependencies that were automatically enabled */
  enabledDependencies: FeatureKey[];
  /** Whether any dependencies were enabled */
  hasEnabledDependencies: boolean;
}

export interface DisabledDependentsResult {
  /** Dependent features that were automatically disabled */
  disabledDependents: FeatureKey[];
  /** Whether any dependents were disabled */
  hasDisabledDependents: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useLanguageFeatureSync(): LanguageFeatureSyncResult {
  const project = useProjectStoreInternal((s) => s.project);
  const setProject = useProjectStoreInternal((s) => s.setProject);

  // Track previous language to avoid duplicate notifications
  const previousLanguageRef = useRef<Language>(project.targetConfig.language);
  const previousFrameworkRef = useRef<Framework>(project.targetConfig.framework);

  /**
   * Get current unsupported features
   */
  const unsupportedFeatures = useMemo(() => {
    return getUnsupportedFeatures(
      project.targetConfig.language,
      project.targetConfig.framework
    );
  }, [project.targetConfig.language, project.targetConfig.framework]);

  /**
   * Check if a feature is supported by current language/framework
   */
  const isFeatureSupported = useCallback(
    (feature: FeatureKey): boolean => {
      return isFeatureSupportedByFramework(
        project.targetConfig.language,
        project.targetConfig.framework,
        feature
      );
    },
    [project.targetConfig.language, project.targetConfig.framework]
  );

  /**
   * Handle language change - disable incompatible features
   */
  const handleLanguageChange = useCallback(
    (newLanguage: Language, newFramework: Framework): DisabledFeaturesResult => {
      // Skip if language hasn't actually changed
      if (
        newLanguage === previousLanguageRef.current &&
        newFramework === previousFrameworkRef.current
      ) {
        return { disabledFeatures: [], hasDisabledFeatures: false };
      }

      previousLanguageRef.current = newLanguage;
      previousFrameworkRef.current = newFramework;

      // Get features that will become unsupported
      const unsupported = getUnsupportedFeatures(newLanguage, newFramework);

      // Find which currently enabled features need to be disabled
      const featuresToDisable: FeatureKey[] = [];
      const currentFeatures = project.features;

      for (const feature of unsupported) {
        if (currentFeatures[feature]) {
          featuresToDisable.push(feature);
        }
      }

      if (featuresToDisable.length === 0) {
        return { disabledFeatures: [], hasDisabledFeatures: false };
      }

      // Create updated features object
      const updatedFeatures: Partial<ProjectFeatures> = {};
      for (const feature of featuresToDisable) {
        updatedFeatures[feature] = false;
      }

      // Update store
      setProject({
        features: {
          ...currentFeatures,
          ...updatedFeatures,
        },
      });

      // Show notification
      const languageLabel = LANGUAGE_METADATA[newLanguage].label;
      const featureLabels = featuresToDisable.map((f) => FEATURE_LABELS[f]);

      if (featuresToDisable.length === 1) {
        notify.warning({
          title: 'Feature Disabled',
          message: `${featureLabels[0]} is not supported by ${languageLabel} and has been disabled.`,
        });
      } else if (featuresToDisable.length <= 3) {
        notify.warning({
          title: 'Features Disabled',
          message: `${featureLabels.join(', ')} are not supported by ${languageLabel} and have been disabled.`,
        });
      } else {
        notify.warning({
          title: 'Features Disabled',
          message: `${featuresToDisable.length} features are not supported by ${languageLabel} and have been disabled.`,
          autoClose: 6000,
        });
      }

      return {
        disabledFeatures: featuresToDisable,
        hasDisabledFeatures: true,
      };
    },
    [project.features, setProject]
  );

  /**
   * Handle framework change only (language stays the same)
   */
  const handleFrameworkChange = useCallback(
    (newFramework: Framework): DisabledFeaturesResult => {
      return handleLanguageChange(project.targetConfig.language, newFramework);
    },
    [project.targetConfig.language, handleLanguageChange]
  );

  /**
   * Enable a feature and automatically enable its dependencies
   */
  const enableFeatureWithDependencies = useCallback(
    (feature: FeatureKey): EnabledDependenciesResult => {
      const dependencies = getFeatureDependencies(feature);
      const currentFeatures = project.features;

      // Find dependencies that need to be enabled
      const dependenciesToEnable = dependencies.filter(
        (dep) => !currentFeatures[dep] && isFeatureSupportedByFramework(
          project.targetConfig.language,
          project.targetConfig.framework,
          dep
        )
      );

      if (dependenciesToEnable.length === 0) {
        // Just enable the feature itself
        setProject({
          features: {
            ...currentFeatures,
            [feature]: true,
          },
        });
        return { enabledDependencies: [], hasEnabledDependencies: false };
      }

      // Enable feature and its dependencies
      const updatedFeatures: Partial<ProjectFeatures> = { [feature]: true };
      for (const dep of dependenciesToEnable) {
        updatedFeatures[dep] = true;
      }

      setProject({
        features: {
          ...currentFeatures,
          ...updatedFeatures,
        },
      });

      // Show notification about auto-enabled dependencies
      const depLabels = dependenciesToEnable.map((d) => FEATURE_LABELS[d]);
      const featureLabel = FEATURE_LABELS[feature];

      if (dependenciesToEnable.length === 1) {
        notify.info({
          title: 'Dependency Enabled',
          message: `${depLabels[0]} was automatically enabled (required by ${featureLabel}).`,
        });
      } else {
        notify.info({
          title: 'Dependencies Enabled',
          message: `${depLabels.join(', ')} were automatically enabled (required by ${featureLabel}).`,
        });
      }

      return {
        enabledDependencies: dependenciesToEnable,
        hasEnabledDependencies: true,
      };
    },
    [project.features, project.targetConfig.language, project.targetConfig.framework, setProject]
  );

  /**
   * Disable a feature and automatically disable its dependents
   */
  const disableFeatureWithDependents = useCallback(
    (feature: FeatureKey): DisabledDependentsResult => {
      const dependents = getFeatureDependents(feature);
      const currentFeatures = project.features;

      // Find dependents that are currently enabled
      const dependentsToDisable = dependents.filter((dep) => currentFeatures[dep]);

      // Disable the feature and its dependents
      const updatedFeatures: Partial<ProjectFeatures> = { [feature]: false };
      for (const dep of dependentsToDisable) {
        updatedFeatures[dep] = false;
      }

      setProject({
        features: {
          ...currentFeatures,
          ...updatedFeatures,
        },
      });

      if (dependentsToDisable.length === 0) {
        return { disabledDependents: [], hasDisabledDependents: false };
      }

      // Show notification about auto-disabled dependents
      const depLabels = dependentsToDisable.map((d) => FEATURE_LABELS[d]);
      const featureLabel = FEATURE_LABELS[feature];

      if (dependentsToDisable.length === 1) {
        notify.info({
          title: 'Dependent Feature Disabled',
          message: `${depLabels[0]} was automatically disabled (depends on ${featureLabel}).`,
        });
      } else {
        notify.info({
          title: 'Dependent Features Disabled',
          message: `${depLabels.join(', ')} were automatically disabled (depend on ${featureLabel}).`,
        });
      }

      return {
        disabledDependents: dependentsToDisable,
        hasDisabledDependents: true,
      };
    },
    [project.features, setProject]
  );

  return {
    handleLanguageChange,
    handleFrameworkChange,
    enableFeatureWithDependencies,
    disableFeatureWithDependents,
    isFeatureSupported,
    unsupportedFeatures,
  };
}
