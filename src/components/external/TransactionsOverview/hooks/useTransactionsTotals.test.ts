/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/preact';
import * as ConfigContext from '../../../../core/ConfigContext';
import { TransactionsListQueryParams } from './useTransactionsFilters';
import useTransactionsTotals, { UseTransactionsTotalsProps } from './useTransactionsTotals';

vi.mock('../../../../core/ConfigContext');

describe('useTransactionsTotals', () => {
    const mockUseConfigContext = vi.mocked(ConfigContext.useConfigContext);

    const defaultQueryParams: TransactionsListQueryParams = {
        balanceAccountId: 'BA00000000000000000000001',
        categories: [],
        createdSince: '2024-01-01T00:00:00.000Z',
        createdUntil: '2024-01-31T23:59:59.999Z',
        currencies: [],
        paymentPspReference: undefined,
        statuses: ['Booked'],
    };

    const getMockTransactionTotalsEndpoint = () => {
        const mockTransactionTotalsEndpoint = vi.fn();

        mockUseConfigContext.mockReturnValue({
            endpoints: { getTransactionTotals: mockTransactionTotalsEndpoint },
        } as unknown as ReturnType<typeof ConfigContext.useConfigContext>);

        return mockTransactionTotalsEndpoint;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return correct initial state when endpoint is not available', () => {
        mockUseConfigContext.mockReturnValue({
            endpoints: { getTransactionTotals: undefined },
        } as unknown as ReturnType<typeof ConfigContext.useConfigContext>);

        const { result } = renderHook(() =>
            useTransactionsTotals({
                fetchEnabled: true,
                queryParams: defaultQueryParams,
            })
        );

        expect(result.current).toStrictEqual({
            totals: [],
            error: undefined,
            isAvailable: false,
            isWaiting: false,
            canRefresh: false,
            refresh: expect.any(Function),
        });
    });

    test('should return correct waiting state when fetch is disabled', () => {
        getMockTransactionTotalsEndpoint();

        const { result } = renderHook(() =>
            useTransactionsTotals({
                fetchEnabled: false,
                queryParams: defaultQueryParams,
            })
        );

        expect(result.current).toMatchObject({
            totals: [],
            error: undefined,
            isAvailable: true,
            isWaiting: true,
        });
    });

    test('should fetch totals and return correct state on success', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        const mockData = [
            {
                currency: 'USD',
                expenses: 100,
                incomings: 500,
                total: 400,
                breakdown: { expenses: [], incomings: [] },
            },
        ];

        mockTransactionTotalsEndpoint.mockResolvedValue({ data: mockData });

        const { result } = renderHook(() =>
            useTransactionsTotals({
                fetchEnabled: true,
                queryParams: defaultQueryParams,
            })
        );

        expect(result.current.isWaiting).toBe(true);
        expect(result.current.isAvailable).toBe(true);

        await waitFor(() => expect(result.current.isWaiting).toBe(false));

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledOnce();
        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledWith(expect.any(Object), {
            query: defaultQueryParams,
        });

        expect(result.current).toMatchObject({
            totals: mockData,
            error: undefined,
            isAvailable: true,
            isWaiting: false,
        });
    });

    test('should return correct state on fetch error', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        mockTransactionTotalsEndpoint.mockRejectedValue('Network Error');

        const { result } = renderHook(() =>
            useTransactionsTotals({
                fetchEnabled: true,
                queryParams: defaultQueryParams,
            })
        );

        expect(result.current.isWaiting).toBe(true);

        await waitFor(() => expect(result.current.isWaiting).toBe(false));

        expect(result.current.error).toBe('Network Error');
        expect(result.current.totals).toEqual([]);
    });

    test('should abort previous request when query params change', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        const abortSignals: AbortSignal[] = [];

        mockTransactionTotalsEndpoint.mockImplementation(({ signal }) => {
            abortSignals.push(signal);
            return new Promise(() => {});
        });

        const { rerender } = renderHook((props: UseTransactionsTotalsProps) => useTransactionsTotals(props), {
            initialProps: {
                fetchEnabled: true,
                queryParams: defaultQueryParams,
            },
        });

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1);
        expect(abortSignals[0]!.aborted).toBe(false);

        const newQueryParams = { ...defaultQueryParams, balanceAccountId: 'BA2' };

        rerender({
            fetchEnabled: true,
            queryParams: newQueryParams,
        });

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(2);
        expect(abortSignals[0]!.aborted).toBe(true);
        expect(abortSignals[1]!.aborted).toBe(false);
    });

    test('should trigger fetch when fetchEnabled changes to true', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        mockTransactionTotalsEndpoint.mockResolvedValue({ data: [] });

        const { rerender } = renderHook((props: UseTransactionsTotalsProps) => useTransactionsTotals(props), {
            initialProps: {
                fetchEnabled: false,
                queryParams: defaultQueryParams,
            },
        });

        expect(mockTransactionTotalsEndpoint).not.toHaveBeenCalled();

        rerender({
            fetchEnabled: true,
            queryParams: defaultQueryParams,
        });

        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1));
    });

    test('should trigger fetch only when query params object changes', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        mockTransactionTotalsEndpoint.mockResolvedValue({ data: [] });

        const { rerender } = renderHook((props: UseTransactionsTotalsProps) => useTransactionsTotals(props), {
            initialProps: {
                fetchEnabled: true,
                queryParams: defaultQueryParams,
            },
        });

        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1));

        rerender({
            fetchEnabled: true,
            queryParams: defaultQueryParams,
        });

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1);

        const newQueryParams = { ...defaultQueryParams, categories: ['Payment'] as const };

        rerender({
            fetchEnabled: true,
            queryParams: { ...newQueryParams, categories: [...newQueryParams.categories] },
        });

        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(2));
    });

    test('should refresh data when refresh is called', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        mockTransactionTotalsEndpoint.mockResolvedValue({ data: [] });

        const { result } = renderHook(() =>
            useTransactionsTotals({
                fetchEnabled: true,
                queryParams: defaultQueryParams,
            })
        );

        await waitFor(() => expect(result.current.isWaiting).toBe(false));
        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1);

        expect(result.current.canRefresh).toBe(true);

        await act(() => result.current.refresh());
        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(2));
    });
});
