import { useCallback, useReducer, useRef } from 'react';

/**
 * Hook that prevents rapid consecutive calls to an async action.
 * Uses a ref for synchronous tracking, preventing multiple calls even before React re-renders.
 *
 * This is useful for:
 * - Preventing multiple server requests when users rapidly click a button
 * - Protecting expensive operations from being triggered multiple times
 *
 * @param action - The async function to protect
 * @param cooldownMs - Optional cooldown period after action completes (default: 0)
 * @returns A tuple of [throttledAction, isExecuting]
 *
 * @example
 * ```tsx
 * const [handleDownload, isDownloading] = useThrottledAction(async () => {
 *   await downloadFile();
 * });
 *
 * return <Button onClick={handleDownload} loading={isDownloading}>Download</Button>;
 * ```
 */
export function useThrottledAction<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  cooldownMs: number = 0,
): [(...args: T) => Promise<R | undefined>, boolean, () => void] {
  const isExecutingRef = useRef(false);
  const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // We need to track the state for the component to re-render
  // But we use ref for synchronous blocking
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const throttledAction = useCallback(
    async (...args: T): Promise<R | undefined> => {
      // Synchronous check - prevents race condition
      if (isExecutingRef.current) {
        return undefined;
      }

      // Set executing immediately (synchronous)
      isExecutingRef.current = true;
      forceUpdate();

      try {
        return await action(...args);
      } finally {
        // If there's a cooldown, wait before allowing next execution
        if (cooldownMs > 0) {
          cooldownTimeoutRef.current = setTimeout(() => {
            isExecutingRef.current = false;
            forceUpdate();
          }, cooldownMs);
        } else {
          isExecutingRef.current = false;
          forceUpdate();
        }
      }
    },
    [action, cooldownMs],
  );

  const reset = useCallback(() => {
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = null;
    }
    isExecutingRef.current = false;
    forceUpdate();
  }, []);

  return [throttledAction, isExecutingRef.current, reset];
}

/**
 * Simpler version that just prevents concurrent calls without tracking state.
 * Useful when you already have loading state managed elsewhere.
 */
export function usePreventConcurrent<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
): (...args: T) => Promise<R | undefined> {
  const isExecutingRef = useRef(false);

  return useCallback(
    async (...args: T): Promise<R | undefined> => {
      if (isExecutingRef.current) {
        return undefined;
      }

      isExecutingRef.current = true;
      try {
        return await action(...args);
      } finally {
        isExecutingRef.current = false;
      }
    },
    [action],
  );
}

/**
 * Hook that debounces an action - only executes after a delay with no new calls.
 * Useful for search-as-you-type or auto-save functionality.
 */
export function useDebouncedAction<T extends unknown[]>(
  action: (...args: T) => void,
  delayMs: number,
): (...args: T) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        action(...args);
      }, delayMs);
    },
    [action, delayMs],
  );
}
