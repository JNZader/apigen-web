import { saveAs } from 'file-saver';
import { useCallback, useRef, useState } from 'react';
import { generateProject as generateWithServer } from '../api/generatorApi';
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
      const sql = generateSQL(entities, relations, project.name);

      const projectConfig = buildProjectConfig(project);

      const blob = await generateWithServer({
        project: projectConfig,
        sql,
      });

      saveAs(blob, `${project.artifactId}.zip`);

      notify.success({
        title: 'Generated with APiGen',
        message: `Project ${project.artifactId}.zip generated successfully using apigen templates`,
      });
      return true;
    } catch (err) {
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
  }, [project, entities, relations]);

  return {
    generating,
    error,
    clearError,
    generateProject,
  };
}
