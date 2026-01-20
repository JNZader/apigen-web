import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectGeneration } from './useProjectGeneration';

// Mock dependencies
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

vi.mock('../utils/sqlGenerator', () => ({
  generateSQL: vi.fn().mockReturnValue('CREATE TABLE test (id INT);'),
}));

// Mock the API - use a function that returns the mock to avoid hoisting issues
const mockGenerateProject = vi.fn();
vi.mock('../api/generatorApi', () => ({
  generateProject: (...args: unknown[]) => mockGenerateProject(...args),
}));

// Mock the store
const mockStore = {
  project: {
    name: 'Test Project',
    groupId: 'com.test',
    artifactId: 'test-project',
    javaVersion: '21',
    modules: { core: true },
    features: { docker: true },
    database: { type: 'postgresql' as const },
  },
  entities: [{ id: '1', name: 'User', fields: [] }],
  relations: [],
};

vi.mock('../store/projectStore', () => ({
  useProjectStore: (selector: (state: typeof mockStore) => unknown) => selector(mockStore),
}));

describe('useProjectGeneration', () => {
  let resolveGenerate: (blob: Blob) => void;
  let rejectGenerate: (error: Error) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the mock implementation to create a new pending promise for each test
    mockGenerateProject.mockImplementation(
      () =>
        new Promise<Blob>((resolve, reject) => {
          resolveGenerate = resolve;
          rejectGenerate = reject;
        }),
    );

    // Reset store to have entities
    mockStore.entities = [{ id: '1', name: 'User', fields: [] }];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should initialize with generating = false', () => {
      const { result } = renderHook(() => useProjectGeneration());

      expect(result.current.generating).toBe(false);
    });

    it('should set generating to true when generateProject is called', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      act(() => {
        result.current.generateProject();
      });

      expect(result.current.generating).toBe(true);
    });

    it('should set generating to false after generation completes', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      let generatePromise: Promise<boolean>;
      act(() => {
        generatePromise = result.current.generateProject();
      });

      // Resolve the generation
      await act(async () => {
        resolveGenerate(new Blob(['test']));
        await generatePromise;
      });

      expect(result.current.generating).toBe(false);
    });

    it('should return true on successful generation', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      let generateResult: boolean;
      act(() => {
        result.current.generateProject().then((r) => {
          generateResult = r;
        });
      });

      await act(async () => {
        resolveGenerate(new Blob(['test']));
      });

      expect(generateResult!).toBe(true);
    });

    it('should return false on generation error', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      let generateResult: boolean;
      act(() => {
        result.current.generateProject().then((r) => {
          generateResult = r;
        });
      });

      await act(async () => {
        rejectGenerate(new Error('Server error'));
      });

      expect(generateResult!).toBe(false);
    });
  });

  describe('validation', () => {
    it('should return false and not call API when no entities exist', async () => {
      // Set empty entities
      mockStore.entities = [];

      const { result } = renderHook(() => useProjectGeneration());

      let generateResult: boolean;
      await act(async () => {
        generateResult = await result.current.generateProject();
      });

      expect(generateResult!).toBe(false);
      expect(mockGenerateProject).not.toHaveBeenCalled();
    });
  });

  describe('rate limiting - prevents rapid clicks', () => {
    it('should only trigger one server call when clicked rapidly multiple times', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      // Simulate 10 rapid clicks
      const clickResults: Promise<boolean>[] = [];
      act(() => {
        for (let i = 0; i < 10; i++) {
          clickResults.push(result.current.generateProject());
        }
      });

      // Resolve the generation
      await act(async () => {
        resolveGenerate(new Blob(['test']));
        await Promise.all(clickResults);
      });

      // The API should only be called once
      expect(mockGenerateProject).toHaveBeenCalledTimes(1);
    });

    it('should return false for blocked clicks', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      // Simulate 5 rapid clicks and collect promises
      const clickPromises: Promise<boolean>[] = [];
      act(() => {
        for (let i = 0; i < 5; i++) {
          clickPromises.push(result.current.generateProject());
        }
      });

      // Resolve the first (and only) generation
      await act(async () => {
        resolveGenerate(new Blob(['test']));
      });

      // Wait for all promises
      const clickResults = await Promise.all(clickPromises);

      // One click succeeded, rest were blocked
      const successCount = clickResults.filter((r) => r === true).length;
      const blockedCount = clickResults.filter((r) => r === false).length;

      expect(successCount).toBe(1);
      expect(blockedCount).toBe(4);
    });

    it('should allow new generation after previous one completes', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      // First generation
      let firstPromise: Promise<boolean>;
      act(() => {
        firstPromise = result.current.generateProject();
      });

      await act(async () => {
        resolveGenerate(new Blob(['first']));
        await firstPromise;
      });

      // Reset mock for second call
      mockGenerateProject.mockResolvedValueOnce(new Blob(['second']));

      // Second generation - should work
      await act(async () => {
        await result.current.generateProject();
      });

      // Both calls should have happened
      expect(mockGenerateProject).toHaveBeenCalledTimes(2);
    });

    it('should simulate 20 rapid download clicks and only download once', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      // This is the specific test case requested:
      // "si hago 20 clics seguidos en descargar no baje 20 veces"
      const clickPromises: Promise<boolean>[] = [];
      act(() => {
        for (let i = 0; i < 20; i++) {
          clickPromises.push(result.current.generateProject());
        }
      });

      // Resolve generation
      await act(async () => {
        resolveGenerate(new Blob(['downloaded']));
        await Promise.all(clickPromises);
      });

      // API called exactly once
      expect(mockGenerateProject).toHaveBeenCalledTimes(1);

      // Count successful vs blocked results
      const results = await Promise.all(clickPromises);
      const successCount = results.filter((r) => r === true).length;
      const blockedCount = results.filter((r) => r === false).length;

      expect(successCount).toBe(1);
      expect(blockedCount).toBe(19);
    });

    it('should handle error and still allow retry', async () => {
      const { result } = renderHook(() => useProjectGeneration());

      // First call fails
      let firstPromise: Promise<boolean>;
      act(() => {
        firstPromise = result.current.generateProject();
      });

      await act(async () => {
        rejectGenerate(new Error('Network error'));
        await firstPromise;
      });

      // Should not be generating anymore
      expect(result.current.generating).toBe(false);

      // Reset mock for retry
      mockGenerateProject.mockResolvedValueOnce(new Blob(['success']));

      // Retry should work
      let retryResult: boolean;
      await act(async () => {
        retryResult = await result.current.generateProject();
      });

      expect(retryResult!).toBe(true);
      // 2 total calls: first failed, second succeeded
      expect(mockGenerateProject).toHaveBeenCalledTimes(2);
    });
  });
});
