/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/preact';
import useBalanceAccounts from './useBalanceAccounts';
import { useConfigContext } from '../core/ConfigContext';
import { EMPTY_OBJECT } from '../utils';

vi.mock('../core/ConfigContext');

describe('useBalanceAccounts', () => {
    const mockUseConfigContext = vi.mocked(useConfigContext);
    let mockGetBalanceAccounts: any;

    const BALANCE_ACCOUNTS = [
        { id: 'BA1', defaultCurrencyCode: 'EUR', timeZone: 'Europe/Amsterdam' },
        { id: 'BA2', defaultCurrencyCode: 'USD', timeZone: 'America/New_York' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetBalanceAccounts = vi.fn();
        mockUseConfigContext.mockReturnValue({
            endpoints: { getBalanceAccounts: mockGetBalanceAccounts },
        } as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should fetch and return balance accounts', async () => {
        mockGetBalanceAccounts.mockResolvedValue({ data: BALANCE_ACCOUNTS });

        const { result } = renderHook(() => useBalanceAccounts());

        expect(result.current.isFetching).toBe(true);
        expect(result.current.balanceAccounts).toBeUndefined();

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.balanceAccounts).toEqual(BALANCE_ACCOUNTS);
        expect(result.current.error).toBeUndefined();
        expect(result.current.isBalanceAccountIdWrong).toBe(false);
        expect(mockGetBalanceAccounts).toHaveBeenCalledWith(EMPTY_OBJECT);
    });

    test('should filter balance accounts by ID', async () => {
        mockGetBalanceAccounts.mockResolvedValue({ data: BALANCE_ACCOUNTS });

        const { result } = renderHook(() => useBalanceAccounts('BA1'));

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.balanceAccounts).toEqual([BALANCE_ACCOUNTS[0]]);
        expect(result.current.isBalanceAccountIdWrong).toBe(false);
    });

    test('should handle invalid balance account ID', async () => {
        mockGetBalanceAccounts.mockResolvedValue({ data: BALANCE_ACCOUNTS });

        const { result } = renderHook(() => useBalanceAccounts('INVALID_ID'));

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.balanceAccounts).toEqual([]);
        expect(result.current.isBalanceAccountIdWrong).toBe(true);
    });

    test('should not mark balance account ID as wrong if no accounts are available', async () => {
        mockGetBalanceAccounts.mockResolvedValue({ data: [] });

        const { result } = renderHook(() => useBalanceAccounts('ANY_ID'));

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.balanceAccounts).toEqual([]);
        expect(result.current.isBalanceAccountIdWrong).toBe(false);
    });

    test('should handle fetch errors', async () => {
        const error = new Error('Fetch failed');
        mockGetBalanceAccounts.mockRejectedValue(error);

        const { result } = renderHook(() => useBalanceAccounts());

        await waitFor(() => expect(result.current.isFetching).toBe(false));

        expect(result.current.error).toBe(error);
        expect(result.current.balanceAccounts).toBeUndefined();
    });

    test('should not fetch when disabled', () => {
        const { result } = renderHook(() => useBalanceAccounts(undefined, false));

        expect(result.current.isFetching).toBe(false);
        expect(mockGetBalanceAccounts).not.toHaveBeenCalled();
    });

    test('should use cached data if available', async () => {
        mockGetBalanceAccounts.mockResolvedValue({ data: BALANCE_ACCOUNTS });

        // First render to populate cache
        const { result, unmount } = renderHook(() => useBalanceAccounts());
        await waitFor(() => expect(result.current.isFetching).toBe(false));
        expect(result.current.balanceAccounts).toEqual(BALANCE_ACCOUNTS);

        unmount();

        // Second render should use cache immediately
        const { result: result2 } = renderHook(() => useBalanceAccounts());

        expect(result2.current.isFetching).toBe(false);
        expect(result2.current.balanceAccounts).toEqual(BALANCE_ACCOUNTS);
        expect(mockGetBalanceAccounts).toHaveBeenCalledTimes(1);
    });

    test('should handle missing getBalanceAccounts endpoint', () => {
        mockUseConfigContext.mockReturnValue({
            endpoints: {},
        } as any);

        const { result } = renderHook(() => useBalanceAccounts());

        expect(result.current.isFetching).toBe(false);
        expect(result.current.balanceAccounts).toBeUndefined();
    });
});
