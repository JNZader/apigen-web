import { saveAs } from 'file-saver';
import { useCallback, useRef, useState } from 'react';
import { generateProject as generateWithServer, RateLimitError } from '../api/generatorApi';
import { useProjectStore } from '../store/projectStore';
import { notify } from '../utils/notifications';
import { buildProjectConfig } from '../utils/projectConfigBuilder';
import { generateSQL } from '../utils/sqlGenerator';

/**
 * Custom hook for project generation using APiGen Server.
 * Extracts generation logic from Layout for reusability and cleaner code.
 *
 * Includes protection against rapid consecutive clicks - if the user clicks
 * multiple times quickly, only the first click will trigger generation.
 */
export function useProjectGeneration() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ref for synchronous blocking - prevents race conditions before React re-renders
  const isGeneratingRef = useRef(false);

  const project = useProjectStore((state) => state.project);
  const entities = useProjectStore((state) => state.entities);
  const relations = useProjectStore((state) => state.relations);

  /** Clears the error state. Call this before retrying generation. */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Returns the project configuration for server-side generation.
   * Used by GitHub push to send config to backend which generates and pushes.
   * @throws Error if no entities exist
   */
  const getProjectConfig = useCallback(() => {
    if (entities.length === 0) {
      throw new Error('Add at least one entity before generating');
    }

    const sql = generateSQL(entities, relations, project.name);
    const projectConfig = buildProjectConfig(project);

    // Extract target config to send at request level (backend expects it there)
    const target = projectConfig.targetConfig
      ? {
          language: projectConfig.targetConfig.language,
          framework: projectConfig.targetConfig.framework,
        }
      : undefined;

    return {
      project: projectConfig as Record<string, unknown>,
      target,
      sql,
    };
  }, [project, entities, relations]);

  /**
   * Generates the project ZIP blob without downloading.
   * Used by GitHub push functionality to get the blob for upload.
   * @throws Error if generation fails or no entities exist
   */
  const generateProjectZip = useCallback(async (): Promise<Blob> => {
    if (entities.length === 0) {
      throw new Error('Add at least one entity before generating');
    }

    const sql = generateSQL(entities, relations, project.name);
    const projectConfig = buildProjectConfig(project);

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
      sql,
    });

    return blob;
  }, [project, entities, relations]);

  const generateProject = useCallback(async (): Promise<boolean> => {
    // Synchronous check prevents multiple calls even before React updates state
    if (isGeneratingRef.current) {
      return false;
    }

    if (entities.length === 0) {
      notify.warning({
        title: 'No entities',
        message: 'Add at least one entity before downloading',
      });
      return false;
    }

    // Set ref immediately (synchronous) to block any concurrent calls
    isGeneratingRef.current = true;
    setGenerating(true);
    setError(null);

    try {
      const blob = await generateProjectZip();

      saveAs(blob, `${project.artifactId}.zip`);

      notify.success({
        title: 'Generated with APiGen',
        message: `Project ${project.artifactId}.zip generated successfully using apigen templates`,
      });
      return true;
    } catch (err) {
      // Handle rate limit error with specific message
      if (err instanceof RateLimitError) {
        const seconds = Math.ceil(err.retryAfterMs / 1000);
        const displayMessage = `Too many generation requests. Please wait ${seconds} seconds before trying again.`;
        setError(displayMessage);
        notify.warning({
          title: 'Rate Limit',
          message: displayMessage,
        });
        return false;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to generate project';
      const displayMessage = errorMessage.includes('fetch')
        ? 'Could not connect to APiGen Server. Make sure it is running on localhost:8081'
        : errorMessage;

      setError(displayMessage);
      notify.error({
        title: 'Server Error',
        message: displayMessage,
      });
      return false;
    } finally {
      isGeneratingRef.current = false;
      setGenerating(false);
    }
  }, [project.artifactId, entities.length, generateProjectZip]);

  return {
    generating,
    error,
    clearError,
    generateProject,
    /** Generate project ZIP blob without downloading (for GitHub push) */
    generateProjectZip,
    /** Get project config for server-side generation (for GitHub push) */
    getProjectConfig,
  };
}
