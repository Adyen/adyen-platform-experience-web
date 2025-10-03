/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/preact';
import { useFetch } from './useFetch';

describe('useFetch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initial State', () => {
        test('should return correct initial state when enabled is true', () => {
            const mockQueryFn = vi.fn().mockResolvedValue('test data');

            const { result } = renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                    fetchOptions: { enabled: true },
                })
            );

            expect(result.current).toEqual({
                data: undefined,
                error: undefined,
                isFetching: true,
            });
        });

        test('should return correct initial state when enabled is false and not call queryFn', () => {
            const mockQueryFn = vi.fn().mockResolvedValue('test data');

            const { result } = renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                    fetchOptions: { enabled: false },
                })
            );

            expect(result.current).toEqual({
                data: undefined,
                error: undefined,
                isFetching: false,
            });
            expect(mockQueryFn).not.toHaveBeenCalled();
        });
    });

    describe('Successful Data Fetching', () => {
        test('should fetch data successfully and update state', async () => {
            const testData = { id: 1, name: 'Test User' };
            const mockQueryFn = vi.fn().mockResolvedValue(testData);

            const { result } = renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                    fetchOptions: { enabled: true },
                })
            );

            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current).toEqual({
                data: testData,
                error: undefined,
                isFetching: false,
            });
            expect(mockQueryFn).toHaveBeenCalledTimes(1);
        });

        test('should call onSuccess callback when fetch succeeds', async () => {
            const testData = { id: 1, name: 'Test User' };
            const mockQueryFn = vi.fn().mockResolvedValue(testData);
            const mockOnSuccess = vi.fn();

            renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                    fetchOptions: { enabled: true, onSuccess: mockOnSuccess },
                })
            );

            await waitFor(() => {
                expect(mockOnSuccess).toHaveBeenCalledWith(testData);
            });
            expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        test('should handle fetch errors and update state', async () => {
            const testError = new Error('Fetch failed');
            const mockQueryFn = vi.fn().mockRejectedValue(testError);

            const { result } = renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                    fetchOptions: { enabled: true },
                })
            );

            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current).toEqual({
                data: undefined,
                error: testError,
                isFetching: false,
            });
            expect(mockQueryFn).toHaveBeenCalledTimes(1);
        });

        test('should not call onSuccess when fetch fails', async () => {
            const testError = new Error('Fetch failed');
            const mockQueryFn = vi.fn().mockRejectedValue(testError);
            const mockOnSuccess = vi.fn();

            renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                    fetchOptions: { enabled: true, onSuccess: mockOnSuccess },
                })
            );

            await waitFor(() => {
                expect(mockQueryFn).toHaveBeenCalledTimes(1);
            });

            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    describe('Keep Previous Data', () => {
        test('should keep previous data when keepPrevData is true during refetch', async () => {
            const initialData = { id: 1, name: 'Initial' };
            const mockQueryFn = vi
                .fn()
                .mockResolvedValueOnce(initialData)
                .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

            const { result, rerender } = renderHook(
                ({ enabled }) =>
                    useFetch({
                        queryFn: mockQueryFn,
                        fetchOptions: { enabled, keepPrevData: true },
                    }),
                { initialProps: { enabled: true } }
            );

            // Wait for initial fetch to complete
            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current.data).toEqual(initialData);

            // Trigger refetch
            rerender({ enabled: false });
            rerender({ enabled: true });

            // Should show loading with previous data
            expect(result.current).toEqual({
                data: initialData,
                error: undefined,
                isFetching: true,
            });
        });

        test('should clear previous data when keepPrevData is false during refetch', async () => {
            const initialData = { id: 1, name: 'Initial' };
            const mockQueryFn = vi
                .fn()
                .mockResolvedValueOnce(initialData)
                .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

            const { result, rerender } = renderHook(
                ({ enabled }) =>
                    useFetch({
                        queryFn: mockQueryFn,
                        fetchOptions: { enabled, keepPrevData: false },
                    }),
                { initialProps: { enabled: true } }
            );

            // Wait for initial fetch to complete
            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current.data).toEqual(initialData);

            // Trigger refetch
            rerender({ enabled: false });
            rerender({ enabled: true });

            // Should show loading without previous data
            expect(result.current).toEqual({
                data: undefined,
                error: undefined,
                isFetching: true,
            });
        });

        test('should handle keepPrevData defaults correctly', async () => {
            const initialData = { id: 1, name: 'Initial' };

            // Test 1: fetchOptions undefined - should default keepPrevData to true
            const mockQueryFn1 = vi
                .fn()
                .mockResolvedValueOnce(initialData)
                .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

            const { result: result1, rerender: rerender1 } = renderHook(
                ({ enabled }) =>
                    useFetch({
                        queryFn: mockQueryFn1,
                        fetchOptions: enabled ? undefined : { enabled },
                    }),
                { initialProps: { enabled: true } }
            );

            await waitFor(() => {
                expect(result1.current.isFetching).toBe(false);
            });

            expect(result1.current.data).toEqual(initialData);

            rerender1({ enabled: false });
            rerender1({ enabled: true });

            // Should keep previous data (default behavior when fetchOptions is undefined)
            expect(result1.current).toEqual({
                data: initialData,
                error: undefined,
                isFetching: true,
            });

            // Test 2: keepPrevData undefined in fetchOptions - should clear data
            const mockQueryFn2 = vi
                .fn()
                .mockResolvedValueOnce(initialData)
                .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

            const { result: result2, rerender: rerender2 } = renderHook(
                ({ enabled }) =>
                    useFetch({
                        queryFn: mockQueryFn2,
                        fetchOptions: { enabled },
                    }),
                { initialProps: { enabled: true } }
            );

            await waitFor(() => {
                expect(result2.current.isFetching).toBe(false);
            });

            expect(result2.current.data).toEqual(initialData);

            rerender2({ enabled: false });
            rerender2({ enabled: true });

            // Should clear previous data when keepPrevData is undefined
            expect(result2.current).toEqual({
                data: undefined,
                error: undefined,
                isFetching: true,
            });
        });
    });

    describe('Dependency Changes', () => {
        test('should refetch when enabled changes from false to true', async () => {
            const testData = { id: 1, name: 'Test User' };
            const mockQueryFn = vi.fn().mockResolvedValue(testData);

            const { result, rerender } = renderHook(
                ({ enabled }) =>
                    useFetch({
                        queryFn: mockQueryFn,
                        fetchOptions: { enabled },
                    }),
                { initialProps: { enabled: false } }
            );

            expect(mockQueryFn).not.toHaveBeenCalled();
            expect(result.current.isFetching).toBe(false);

            // Enable fetching
            rerender({ enabled: true });

            expect(result.current.isFetching).toBe(true);

            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current.data).toEqual(testData);
            expect(mockQueryFn).toHaveBeenCalledTimes(1);
        });

        test('should refetch when queryFn changes', async () => {
            const firstData = { id: 1, name: 'First' };
            const secondData = { id: 2, name: 'Second' };
            const mockQueryFn1 = vi.fn().mockResolvedValue(firstData);
            const mockQueryFn2 = vi.fn().mockResolvedValue(secondData);

            const { result, rerender } = renderHook(
                ({ queryFn }) =>
                    useFetch({
                        queryFn,
                        fetchOptions: { enabled: true },
                    }),
                { initialProps: { queryFn: mockQueryFn1 } }
            );

            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current.data).toEqual(firstData);
            expect(mockQueryFn1).toHaveBeenCalledTimes(1);

            // Change queryFn
            rerender({ queryFn: mockQueryFn2 });

            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current.data).toEqual(secondData);
            expect(mockQueryFn2).toHaveBeenCalledTimes(1);
        });
    });

    describe('Cleanup and Race Conditions', () => {
        test('should prevent state updates after component unmount', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            let resolvePromise: (value: any) => void;
            let rejectPromise: (error: any) => void;
            const mockQueryFn = vi.fn().mockImplementation(
                () =>
                    new Promise((resolve, reject) => {
                        resolvePromise = resolve;
                        rejectPromise = reject;
                    })
            );

            const { unmount } = renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                    fetchOptions: { enabled: true },
                })
            );

            // Unmount before promise resolves
            unmount();

            // Test both success and error scenarios after unmount
            resolvePromise!('test data');

            // Wait for any potential state updates to be processed
            await new Promise(resolve => setTimeout(resolve, 50));

            // Should not have any React warnings about updating unmounted component
            expect(consoleErrorSpy).not.toHaveBeenCalledWith(
                expect.stringContaining("Warning: Can't perform a React state update on an unmounted component")
            );

            // Test error case as well
            rejectPromise!(new Error('Test error'));

            await new Promise(resolve => setTimeout(resolve, 50));

            // Still should not have any React warnings
            expect(consoleErrorSpy).not.toHaveBeenCalledWith(
                expect.stringContaining("Warning: Can't perform a React state update on an unmounted component")
            );

            consoleErrorSpy.mockRestore();
        });

        test('should handle rapid successive enabled changes', async () => {
            const testData = { id: 1, name: 'Test User' };
            const mockQueryFn = vi.fn().mockResolvedValue(testData);

            const { result, rerender } = renderHook(
                ({ enabled }) =>
                    useFetch({
                        queryFn: mockQueryFn,
                        fetchOptions: { enabled },
                    }),
                { initialProps: { enabled: false } }
            );

            // Rapid changes
            rerender({ enabled: true });
            rerender({ enabled: false });
            rerender({ enabled: true });

            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current.data).toEqual(testData);
            // Should have been called at least once for the final enabled: true
            expect(mockQueryFn).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        test('should handle null/undefined queryFn gracefully', async () => {
            const { result } = renderHook(() =>
                useFetch({
                    queryFn: null as any,
                    fetchOptions: { enabled: true },
                })
            );

            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.data).toBeUndefined();
        });

        test('should handle queryFn that returns null/undefined', async () => {
            const mockQueryFn = vi.fn().mockResolvedValue(null);

            const { result } = renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                    fetchOptions: { enabled: true },
                })
            );

            await waitFor(() => {
                expect(result.current.isFetching).toBe(false);
            });

            expect(result.current).toEqual({
                data: null,
                error: undefined,
                isFetching: false,
            });
        });

        test('should handle fetchOptions as undefined and default to enabled', () => {
            const mockQueryFn = vi.fn().mockResolvedValue('test data');

            const { result } = renderHook(() =>
                useFetch({
                    queryFn: mockQueryFn,
                })
            );

            expect(result.current).toEqual({
                data: undefined,
                error: undefined,
                isFetching: true,
            });
        });
    });
});
