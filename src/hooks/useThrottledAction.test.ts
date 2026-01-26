import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedAction, usePreventConcurrent, useThrottledAction } from './useThrottledAction';

describe('useThrottledAction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useThrottledAction', () => {
    it('should execute the action on first call', async () => {
      const mockAction = vi.fn().mockResolvedValue('result');
      const { result } = renderHook(() => useThrottledAction(mockAction));

      await act(async () => {
        await result.current[0]();
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should return the result of the action', async () => {
      const mockAction = vi.fn().mockResolvedValue('expected-result');
      const { result } = renderHook(() =>
        useThrottledAction<[], string>(mockAction as () => Promise<string>),
      );

      let actionResult: string | undefined;
      await act(async () => {
        actionResult = await result.current[0]();
      });

      expect(actionResult).toBe('expected-result');
    });

    it('should block concurrent calls while action is executing', async () => {
      let resolveAction: () => void = () => {};
      const mockAction = vi.fn().mockImplementation(
        () =>
          new Promise<string>((resolve) => {
            resolveAction = () => resolve('done');
          }),
      );

      const { result } = renderHook(() =>
        useThrottledAction<[], string>(mockAction as () => Promise<string>),
      );

      // Start first call
      let firstPromise: Promise<string | undefined>;
      act(() => {
        firstPromise = result.current[0]();
      });

      // Try to make concurrent calls while first is still executing
      let secondResult: string | undefined;
      let thirdResult: string | undefined;
      act(() => {
        result.current[0]().then((r) => {
          secondResult = r;
        });
        result.current[0]().then((r) => {
          thirdResult = r;
        });
      });

      // Resolve the first action
      await act(async () => {
        resolveAction();
        await firstPromise;
      });

      // Only the first call should have executed
      expect(mockAction).toHaveBeenCalledTimes(1);
      expect(secondResult).toBeUndefined();
      expect(thirdResult).toBeUndefined();
    });

    it('should set isExecuting to true during execution', async () => {
      let resolveAction: () => void = () => {};
      const mockAction = vi.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve;
          }),
      );

      const { result } = renderHook(() => useThrottledAction(mockAction));

      // Initially not executing
      expect(result.current[1]).toBe(false);

      // Start action
      act(() => {
        result.current[0]();
      });

      // Should be executing
      expect(result.current[1]).toBe(true);

      // Resolve and wait
      await act(async () => {
        resolveAction();
      });

      // Should no longer be executing
      expect(result.current[1]).toBe(false);
    });

    it('should allow new calls after action completes', async () => {
      const mockAction = vi.fn().mockResolvedValue('result');
      const { result } = renderHook(() => useThrottledAction(mockAction));

      // First call
      await act(async () => {
        await result.current[0]();
      });

      // Second call should work after first completes
      await act(async () => {
        await result.current[0]();
      });

      expect(mockAction).toHaveBeenCalledTimes(2);
    });

    it('should respect cooldown period', async () => {
      const mockAction = vi.fn().mockResolvedValue('result');
      const cooldownMs = 1000;
      const { result } = renderHook(() =>
        useThrottledAction<[], string>(mockAction as () => Promise<string>, cooldownMs),
      );

      // First call
      await act(async () => {
        await result.current[0]();
      });

      expect(mockAction).toHaveBeenCalledTimes(1);

      // Try immediate second call - should be blocked by cooldown
      let secondResult: string | undefined;
      await act(async () => {
        secondResult = await result.current[0]();
      });

      expect(secondResult).toBeUndefined();
      expect(mockAction).toHaveBeenCalledTimes(1);

      // Advance timer past cooldown
      await act(async () => {
        vi.advanceTimersByTime(cooldownMs + 100);
      });

      // Now it should work
      await act(async () => {
        await result.current[0]();
      });

      expect(mockAction).toHaveBeenCalledTimes(2);
    });

    it('should provide reset function to clear cooldown', async () => {
      const mockAction = vi.fn().mockResolvedValue('result');
      const cooldownMs = 5000;
      const { result } = renderHook(() => useThrottledAction(mockAction, cooldownMs));

      // First call
      await act(async () => {
        await result.current[0]();
      });

      // Call reset to clear cooldown
      act(() => {
        result.current[2](); // reset function
      });

      // Should be able to call immediately
      await act(async () => {
        await result.current[0]();
      });

      expect(mockAction).toHaveBeenCalledTimes(2);
    });

    it('should handle action errors without blocking future calls', async () => {
      const mockAction = vi
        .fn()
        .mockRejectedValueOnce(new Error('First call failed'))
        .mockResolvedValueOnce('success');

      const { result } = renderHook(() =>
        useThrottledAction<[], string>(mockAction as () => Promise<string>),
      );

      // First call fails
      await act(async () => {
        try {
          await result.current[0]();
        } catch {
          // Expected error
        }
      });

      // Second call should still work
      let secondResult: string | undefined;
      await act(async () => {
        secondResult = await result.current[0]();
      });

      expect(secondResult).toBe('success');
      expect(mockAction).toHaveBeenCalledTimes(2);
    });
  });

  describe('usePreventConcurrent', () => {
    it('should execute the action on first call', async () => {
      const mockAction = vi.fn().mockResolvedValue('result');
      const { result } = renderHook(() => usePreventConcurrent(mockAction));

      await act(async () => {
        await result.current();
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should block concurrent calls', async () => {
      let resolveAction: () => void = () => {};
      const mockAction = vi.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve;
          }),
      );

      const { result } = renderHook(() =>
        usePreventConcurrent<[], void>(mockAction as () => Promise<void>),
      );

      // Start first call
      let firstPromise: Promise<undefined>;
      act(() => {
        firstPromise = result.current() as Promise<undefined>;
      });

      // Try concurrent calls
      act(() => {
        result.current().then((r) => {
          // Result is captured but not used in this test
          expect(r).toBeUndefined();
        });
      });

      // Resolve first
      await act(async () => {
        resolveAction();
        await firstPromise;
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should allow sequential calls', async () => {
      const mockAction = vi.fn().mockResolvedValue('result');
      const { result } = renderHook(() => usePreventConcurrent(mockAction));

      await act(async () => {
        await result.current();
      });

      await act(async () => {
        await result.current();
      });

      expect(mockAction).toHaveBeenCalledTimes(2);
    });
  });

  describe('useDebouncedAction', () => {
    it('should not execute immediately', async () => {
      const mockAction = vi.fn();
      const { result } = renderHook(() => useDebouncedAction(mockAction, 500));

      act(() => {
        result.current();
      });

      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should execute after delay', async () => {
      const mockAction = vi.fn();
      const delayMs = 500;
      const { result } = renderHook(() => useDebouncedAction(mockAction, delayMs));

      act(() => {
        result.current();
      });

      expect(mockAction).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(delayMs + 100);
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous call when called again within delay', async () => {
      const mockAction = vi.fn();
      const delayMs = 500;
      const { result } = renderHook(() => useDebouncedAction(mockAction, delayMs));

      // First call
      act(() => {
        result.current();
      });

      // Wait half the delay
      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Second call (should cancel first)
      act(() => {
        result.current();
      });

      // Wait the remaining time from first call
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should not have executed yet (second call reset the timer)
      expect(mockAction).not.toHaveBeenCalled();

      // Complete the full delay from second call
      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Now it should execute once
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the action', async () => {
      const mockAction = vi.fn();
      const delayMs = 100;
      const { result } = renderHook(() => useDebouncedAction(mockAction, delayMs));

      act(() => {
        result.current('arg1', 'arg2');
      });

      act(() => {
        vi.advanceTimersByTime(delayMs + 50);
      });

      expect(mockAction).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should only execute with last arguments when called multiple times', async () => {
      const mockAction = vi.fn();
      const delayMs = 100;
      const { result } = renderHook(() => useDebouncedAction(mockAction, delayMs));

      act(() => {
        result.current('first');
        result.current('second');
        result.current('third');
      });

      act(() => {
        vi.advanceTimersByTime(delayMs + 50);
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
      expect(mockAction).toHaveBeenCalledWith('third');
    });
  });
});

describe('Rate limiting - rapid clicks simulation', () => {
  it('should only execute once when simulating 20 rapid clicks', async () => {
    let resolveAction: () => void = () => {};
    const mockAction = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = () => resolve('downloaded');
        }),
    );

    const { result } = renderHook(() =>
      useThrottledAction<[], string>(mockAction as () => Promise<string>),
    );

    // Simulate 20 rapid clicks
    const clickPromises: Promise<string | undefined>[] = [];
    act(() => {
      for (let i = 0; i < 20; i++) {
        clickPromises.push(result.current[0]());
      }
    });

    // Resolve the action
    await act(async () => {
      resolveAction();
      await Promise.all(clickPromises);
    });

    // Only the first click should have triggered the action
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('should return undefined for blocked calls', async () => {
    let resolveAction: () => void = () => {};
    const mockAction = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveAction = () => resolve('success');
        }),
    );

    const { result } = renderHook(() =>
      useThrottledAction<[], string>(mockAction as () => Promise<string>),
    );

    // Start action and collect promises
    const promises: Promise<string | undefined>[] = [];
    act(() => {
      for (let i = 0; i < 5; i++) {
        promises.push(result.current[0]());
      }
    });

    // Resolve
    await act(async () => {
      resolveAction();
    });

    // Wait for all promises
    const results = await Promise.all(promises);

    // One should succeed, rest should be undefined
    const successCount = results.filter((r) => r === 'success').length;
    const undefinedCount = results.filter((r) => r === undefined).length;

    expect(successCount).toBe(1);
    expect(undefinedCount).toBe(4);
  });
});
