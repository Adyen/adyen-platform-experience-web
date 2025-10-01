/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import useMutation from './useMutation';

describe('useMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('Initial State', () => {
        test('should initialize with correct default values', () => {
            const mockQueryFn = vi.fn();
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn }));

            expect(result.current.data).toBeNull();
            expect(result.current.error).toBeNull();
            expect(result.current.status).toBe('idle');
            expect(result.current.isIdle).toBe(true);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.isSuccess).toBe(false);
            expect(result.current.isError).toBe(false);
            expect(typeof result.current.mutate).toBe('function');
            expect(typeof result.current.reset).toBe('function');
        });

        test('should work with undefined queryFn', () => {
            const { result } = renderHook(() => useMutation({ queryFn: undefined }));

            expect(result.current.data).toBeNull();
            expect(result.current.error).toBeNull();
            expect(result.current.status).toBe('idle');
        });

        test('should handle empty options object', () => {
            const mockQueryFn = vi.fn();
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn, options: {} }));

            expect(result.current.data).toBeNull();
            expect(result.current.error).toBeNull();
            expect(result.current.status).toBe('idle');
        });
    });

    describe('Basic Functionality', () => {
        test('should execute mutation successfully', async () => {
            const mockData = { id: 1, name: 'test' };
            const mockQueryFn = vi.fn().mockResolvedValue(mockData);
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn }));

            await act(async () => {
                await result.current.mutate('arg1', 'arg2');
            });

            expect(mockQueryFn).toHaveBeenCalledWith('arg1', 'arg2');
            expect(result.current.data).toEqual(mockData);
            expect(result.current.error).toBeNull();
            expect(result.current.status).toBe('success');
            expect(result.current.isSuccess).toBe(true);
            expect(result.current.isLoading).toBe(false);
        });

        test('should handle mutation errors', async () => {
            const mockError = new Error('Test error');
            const mockQueryFn = vi.fn().mockRejectedValue(mockError);
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn }));

            let caughtError;
            await act(async () => {
                try {
                    await result.current.mutate();
                } catch (error) {
                    caughtError = error;
                }
            });
            expect(caughtError).toEqual(mockError);

            expect(result.current.data).toBeNull();
            expect(result.current.error).toEqual(mockError);
            expect(result.current.status).toBe('error');
            expect(result.current.isError).toBe(true);
            expect(result.current.isLoading).toBe(false);
        });

        test('should set loading state during mutation', async () => {
            let resolvePromise: (value: any) => void;
            const promise = new Promise(resolve => {
                resolvePromise = resolve;
            });
            const mockQueryFn = vi.fn().mockReturnValue(promise);
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn }));

            act(() => {
                result.current.mutate();
            });

            expect(result.current.status).toBe('loading');
            expect(result.current.isLoading).toBe(true);

            await act(async () => {
                resolvePromise!({ success: true });
                await promise;
            });
        });

        test('should reset state correctly', async () => {
            const mockData = { id: 1 };
            const mockQueryFn = vi.fn().mockResolvedValue(mockData);
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn }));

            // First mutation
            await act(async () => {
                await result.current.mutate();
            });

            expect(result.current.data).toEqual(mockData);
            expect(result.current.status).toBe('success');

            // Reset
            act(() => {
                result.current.reset();
            });

            expect(result.current.data).toBeNull();
            expect(result.current.error).toBeNull();
            expect(result.current.status).toBe('idle');
            expect(result.current.isIdle).toBe(true);
        });
    });

    describe('Callbacks', () => {
        test('should call onSuccess callback with correct data', async () => {
            const mockData = { id: 1, name: 'test' };
            const mockQueryFn = vi.fn().mockResolvedValue(mockData);
            const onSuccess = vi.fn();
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn, options: { onSuccess } }));

            await act(async () => {
                await result.current.mutate();
            });

            // Wait for callback to execute (it's scheduled asynchronously)
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(onSuccess).toHaveBeenCalledWith(mockData);
        });

        test('should call onError callback with correct error', async () => {
            const mockError = new Error('Test error');
            const mockQueryFn = vi.fn().mockRejectedValue(mockError);
            const onError = vi.fn();
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn, options: { onError } }));

            let caughtError;
            await act(async () => {
                try {
                    await result.current.mutate();
                } catch (error) {
                    caughtError = error;
                }
            });
            expect(caughtError).toEqual(mockError);

            // Wait for callback to execute
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(onError).toHaveBeenCalledWith(mockError);
        });

        test('should call onSettled callback on success', async () => {
            const mockData = { id: 1 };
            const mockQueryFn = vi.fn().mockResolvedValue(mockData);
            const onSettled = vi.fn();
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn, options: { onSettled } }));

            await act(async () => {
                await result.current.mutate();
            });

            // Wait for callback to execute
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(onSettled).toHaveBeenCalledWith(mockData, null);
        });

        test('should call onSettled callback on error', async () => {
            const mockError = new Error('Test error');
            const mockQueryFn = vi.fn().mockRejectedValue(mockError);
            const onSettled = vi.fn();
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn, options: { onSettled } }));

            let caughtError;
            await act(async () => {
                try {
                    await result.current.mutate();
                } catch (error) {
                    caughtError = error;
                }
            });
            expect(caughtError).toEqual(mockError);

            // Wait for callback to execute
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(onSettled).toHaveBeenCalledWith(undefined, mockError);
        });

        test('should handle async callbacks', async () => {
            const mockData = { id: 1 };
            const mockQueryFn = vi.fn().mockResolvedValue(mockData);
            const onSuccess = vi.fn().mockResolvedValue(undefined);
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn, options: { onSuccess } }));

            await act(async () => {
                await result.current.mutate();
            });

            // Wait for callback to execute
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(onSuccess).toHaveBeenCalledWith(mockData);
        });
    });

    describe('Retry Logic', () => {
        test('should retry on failure when retry is enabled', async () => {
            const mockError = new Error('Network error');
            const mockQueryFn = vi.fn().mockRejectedValueOnce(mockError).mockResolvedValueOnce({ success: true });

            const { result } = renderHook(() =>
                useMutation({
                    queryFn: mockQueryFn,
                    options: { retry: 1, retryDelay: 0 },
                })
            );

            await act(async () => {
                try {
                    await result.current.mutate();
                } catch (error) {
                    console.error(error);
                }
            });

            expect(mockQueryFn).toHaveBeenCalledTimes(2);
            expect(result.current.data).toEqual({ success: true });
            expect(result.current.status).toBe('success');
        });

        test('should respect retry count limit', async () => {
            const mockError = new Error('Network error');
            const mockQueryFn = vi.fn().mockRejectedValue(mockError);

            const { result } = renderHook(() =>
                useMutation({
                    queryFn: mockQueryFn,
                    options: { retry: 2, retryDelay: 0 },
                })
            );

            let caughtError;
            await act(async () => {
                try {
                    await result.current.mutate();
                } catch (error) {
                    caughtError = error;
                }
            });
            expect(caughtError).toEqual(mockError);

            expect(mockQueryFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
            expect(result.current.error).toEqual(mockError);
            expect(result.current.status).toBe('error');
        });

        test('should use custom retry delay function', async () => {
            const mockError = new Error('Network error');
            const mockQueryFn = vi.fn().mockRejectedValueOnce(mockError).mockResolvedValueOnce({ success: true });

            const retryDelay = vi.fn().mockReturnValue(0);

            const { result } = renderHook(() =>
                useMutation({
                    queryFn: mockQueryFn,
                    options: { retry: 1, retryDelay },
                })
            );

            await act(async () => {
                await result.current.mutate();
            });

            expect(retryDelay).toHaveBeenCalledWith(1);
            expect(mockQueryFn).toHaveBeenCalledTimes(2);
        });

        test('should respect shouldRetry function', async () => {
            const mockError = new Error('Network error');
            const mockQueryFn = vi.fn().mockRejectedValue(mockError);
            const shouldRetry = vi.fn().mockReturnValue(false);

            const { result } = renderHook(() =>
                useMutation({
                    queryFn: mockQueryFn,
                    options: { retry: 1, shouldRetry },
                })
            );

            let caughtError;
            await act(async () => {
                try {
                    await result.current.mutate();
                } catch (error) {
                    caughtError = error;
                }
            });
            expect(caughtError).toEqual(mockError);

            expect(shouldRetry).toHaveBeenCalledWith(mockError);
            expect(mockQueryFn).toHaveBeenCalledTimes(1);
            expect(result.current.error).toEqual(mockError);
        });

        test('should retry when shouldRetry returns true', async () => {
            const mockError = new Error('Network error');
            const mockQueryFn = vi.fn().mockRejectedValueOnce(mockError).mockResolvedValueOnce({ success: true });
            const shouldRetry = vi.fn().mockReturnValue(true);

            const { result } = renderHook(() =>
                useMutation({
                    queryFn: mockQueryFn,
                    options: { retry: 1, shouldRetry, retryDelay: 0 },
                })
            );

            await act(async () => {
                await result.current.mutate();
            });

            expect(shouldRetry).toHaveBeenCalledWith(mockError);
            expect(mockQueryFn).toHaveBeenCalledTimes(2);
            expect(result.current.data).toEqual({ success: true });
        });
    });

    describe('Lifecycle & Cleanup', () => {
        test('should not update state after unmount', async () => {
            let resolvePromise: (value: any) => void;
            const promise = new Promise(resolve => {
                resolvePromise = resolve;
            });
            const mockQueryFn = vi.fn().mockReturnValue(promise);
            const { result, unmount } = renderHook(() => useMutation({ queryFn: mockQueryFn }));

            act(() => {
                result.current.mutate();
            });

            // Unmount before mutation completes
            unmount();

            // Complete the mutation
            await act(async () => {
                resolvePromise!({ success: true });
                await promise;
            });

            // State should not have been updated after unmount
            // We can't check result.current after unmount, but the hook should handle it gracefully
        });

        test('should not call callbacks after unmount', async () => {
            let resolvePromise: (value: any) => void;
            const promise = new Promise(resolve => {
                resolvePromise = resolve;
            });
            const mockQueryFn = vi.fn().mockReturnValue(promise);
            const onSuccess = vi.fn();
            const { result, unmount } = renderHook(() => useMutation({ queryFn: mockQueryFn, options: { onSuccess } }));

            act(() => {
                result.current.mutate();
            });

            // Unmount before mutation completes
            unmount();

            // Complete the mutation
            await act(async () => {
                resolvePromise!({ success: true });
                await promise;
            });

            // Wait for any potential callbacks
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Callback should not have been called after unmount
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        test('should handle multiple concurrent mutations', async () => {
            const mockQueryFn = vi.fn().mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 2 });
            const { result } = renderHook(() => useMutation({ queryFn: mockQueryFn }));

            // Start two mutations concurrently
            const promise1 = act(async () => result.current.mutate('first'));
            const promise2 = act(async () => result.current.mutate('second'));

            await Promise.all([promise1, promise2]);

            // The last mutation should be the final state
            expect(result.current.data).toEqual({ id: 2 });
            expect(result.current.status).toBe('success');
        });
    });
});
