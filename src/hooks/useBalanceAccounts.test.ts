/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/preact';
import useBalanceAccounts from './useBalanceAccounts';
import * as ConfigContext from '../core/ConfigContext';
import * as UseFetch from './useFetch';

// Mock dependencies
vi.mock('../core/ConfigContext');
vi.mock('./useFetch');

describe('useBalanceAccounts', () => {
    const mockBalanceAccountEndpoint = vi.fn();
    const mockUseFetch = vi.mocked(UseFetch.useFetch);
    const mockUseConfigContext = vi.mocked(ConfigContext.useConfigContext);

    const mockBalanceAccountsData = {
        data: [
            { id: 'BA123', name: 'Account 1', status: 'active' },
            { id: 'BA456', name: 'Account 2', status: 'active' },
            { id: 'BA789', name: 'Account 3', status: 'inactive' },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock for useConfigContext
        mockUseConfigContext.mockReturnValue({
            endpoints: {
                getBalanceAccounts: mockBalanceAccountEndpoint,
            },
        } as any);

        // Default mock for useFetch - successful fetch
        mockUseFetch.mockReturnValue({
            data: mockBalanceAccountsData,
            isFetching: false,
            error: undefined,
        });
    });

    describe('fetching all balance accounts', () => {
        test('should fetch all balance accounts when no balanceAccountId is provided', () => {
            const { result } = renderHook(() => useBalanceAccounts());

            expect(result.current.balanceAccounts).toEqual(mockBalanceAccountsData.data);
            expect(result.current.isFetching).toBe(false);
            expect(result.current.error).toBeUndefined();
            expect(result.current.isBalanceAccountIdWrong).toBe(false);
        });

        test('should call useFetch with correct configuration', () => {
            renderHook(() => useBalanceAccounts());

            expect(mockUseFetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    fetchOptions: expect.objectContaining({
                        enabled: true,
                        keepPrevData: true,
                    }),
                    queryFn: expect.any(Function),
                })
            );
        });

        test('should pass isFetching state from useFetch', () => {
            mockUseFetch.mockReturnValue({
                data: undefined,
                isFetching: true,
                error: undefined,
            });

            const { result } = renderHook(() => useBalanceAccounts());

            expect(result.current.isFetching).toBe(true);
            expect(result.current.balanceAccounts).toBeUndefined();
        });

        test('should pass error state from useFetch', () => {
            const mockError = new Error('Failed to fetch balance accounts');
            mockUseFetch.mockReturnValue({
                data: undefined,
                isFetching: false,
                error: mockError,
            });

            const { result } = renderHook(() => useBalanceAccounts());

            expect(result.current.error).toBe(mockError);
            expect(result.current.balanceAccounts).toBeUndefined();
        });
    });

    describe('filtering by balanceAccountId', () => {
        test('should filter balance accounts when balanceAccountId is provided', () => {
            const { result } = renderHook(() => useBalanceAccounts('BA456'));

            expect(result.current.balanceAccounts).toEqual([mockBalanceAccountsData.data[1]]);
            expect(result.current.isBalanceAccountIdWrong).toBe(false);
        });

        test('should return empty array when balanceAccountId does not exist', () => {
            const { result } = renderHook(() => useBalanceAccounts('BA999'));

            expect(result.current.balanceAccounts).toEqual([]);
            expect(result.current.isBalanceAccountIdWrong).toBe(true);
        });

        test('should set isBalanceAccountIdWrong to false when ID is valid', () => {
            const { result } = renderHook(() => useBalanceAccounts('BA123'));

            expect(result.current.isBalanceAccountIdWrong).toBe(false);
            expect(result.current.balanceAccounts).toHaveLength(1);
        });

        test('should not set isBalanceAccountIdWrong when data is empty', () => {
            mockUseFetch.mockReturnValue({
                data: { data: [] },
                isFetching: false,
                error: undefined,
            });

            const { result } = renderHook(() => useBalanceAccounts('BA123'));

            expect(result.current.isBalanceAccountIdWrong).toBe(false);
            expect(result.current.balanceAccounts).toEqual([]);
        });
    });

    describe('enabled parameter', () => {
        test('should disable fetch when enabled is false', () => {
            renderHook(() => useBalanceAccounts(undefined, false));

            expect(mockUseFetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    fetchOptions: expect.objectContaining({
                        enabled: false,
                    }),
                })
            );
        });

        test('should enable fetch when enabled is true', () => {
            renderHook(() => useBalanceAccounts(undefined, true));

            expect(mockUseFetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    fetchOptions: expect.objectContaining({
                        enabled: true,
                    }),
                })
            );
        });

        test('should disable fetch when endpoint is not available', () => {
            mockUseConfigContext.mockReturnValue({
                endpoints: {
                    getBalanceAccounts: undefined,
                },
            } as any);

            renderHook(() => useBalanceAccounts());

            expect(mockUseFetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    fetchOptions: expect.objectContaining({
                        enabled: false,
                    }),
                })
            );
        });
    });

    describe('queryFn execution', () => {
        test('should call balance account endpoint with empty object', async () => {
            mockBalanceAccountEndpoint.mockResolvedValue(mockBalanceAccountsData);

            const { result } = renderHook(() => useBalanceAccounts());

            // Get the queryFn from the useFetch call
            const useFetchCall = mockUseFetch.mock.calls[0]?.[0];
            const queryFn = useFetchCall?.queryFn;

            expect(queryFn).toBeDefined();

            if (queryFn) {
                await queryFn();
                expect(mockBalanceAccountEndpoint).toHaveBeenCalledWith({});
            }
        });

        test('should handle undefined endpoint gracefully', async () => {
            mockUseConfigContext.mockReturnValue({
                endpoints: {
                    getBalanceAccounts: undefined,
                },
            } as any);

            const { result } = renderHook(() => useBalanceAccounts());

            const useFetchCall = mockUseFetch.mock.calls[0]?.[0];
            const queryFn = useFetchCall?.queryFn;

            if (queryFn) {
                const result = await queryFn();
                expect(result).toBeUndefined();
            }
        });
    });

    describe('memoization', () => {
        test('should memoize balanceAccounts based on data and balanceAccountId', () => {
            const { result, rerender } = renderHook(({ id }) => useBalanceAccounts(id), { initialProps: { id: 'BA123' } });

            const firstResult = result.current.balanceAccounts;

            // Rerender with same props
            rerender({ id: 'BA123' });
            expect(result.current.balanceAccounts).toBe(firstResult);

            // Rerender with different id
            rerender({ id: 'BA456' });
            expect(result.current.balanceAccounts).not.toBe(firstResult);
        });

        test('should update when data changes', () => {
            const { result, rerender } = renderHook(() => useBalanceAccounts());

            const firstResult = result.current.balanceAccounts;

            // Update mock data
            mockUseFetch.mockReturnValue({
                data: {
                    data: [{ id: 'BA999', name: 'New Account', status: 'active' }],
                },
                isFetching: false,
                error: undefined,
            });

            rerender();

            expect(result.current.balanceAccounts).not.toBe(firstResult);
            expect(result.current.balanceAccounts).toHaveLength(1);
            expect(result.current.balanceAccounts?.[0]?.id).toBe('BA999');
        });
    });

    describe('edge cases', () => {
        test('should handle undefined data gracefully', () => {
            mockUseFetch.mockReturnValue({
                data: undefined,
                isFetching: false,
                error: undefined,
            });

            const { result } = renderHook(() => useBalanceAccounts());

            expect(result.current.balanceAccounts).toBeUndefined();
            expect(result.current.isBalanceAccountIdWrong).toBe(false);
        });

        test('should handle empty data array', () => {
            mockUseFetch.mockReturnValue({
                data: { data: [] },
                isFetching: false,
                error: undefined,
            });

            const { result } = renderHook(() => useBalanceAccounts());

            expect(result.current.balanceAccounts).toEqual([]);
            expect(result.current.isBalanceAccountIdWrong).toBe(false);
        });

        test('should handle empty string balanceAccountId', () => {
            const { result } = renderHook(() => useBalanceAccounts(''));

            expect(result.current.balanceAccounts).toEqual(mockBalanceAccountsData.data);
            expect(result.current.isBalanceAccountIdWrong).toBe(false);
        });
    });

    describe('return value structure', () => {
        test('should return all expected properties', () => {
            const { result } = renderHook(() => useBalanceAccounts());

            expect(result.current).toHaveProperty('balanceAccounts');
            expect(result.current).toHaveProperty('isBalanceAccountIdWrong');
            expect(result.current).toHaveProperty('isFetching');
            expect(result.current).toHaveProperty('error');
        });
    });
});
