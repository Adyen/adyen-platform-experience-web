/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/preact';
import * as ConfigContext from '../../../../core/ConfigContext';
import useTransactionsTotals, { GetQueryParams, UseTransactionsTotalsProps } from './useTransactionsTotals';
import { TransactionsFilters } from '../types';

vi.mock('../../../../core/ConfigContext');

describe('useTransactionsTotals', () => {
    const mockUseConfigContext = vi.mocked(ConfigContext.useConfigContext);
    const getQueryParams: GetQueryParams = allQueryParams => allQueryParams;
    const now = Date.now();

    const defaultFilters = {
        balanceAccount: { id: 'BA00000000000000000000001' },
        createdDate: {
            from: new Date('2024-01-01T00:00:00.000Z').getTime(),
            to: new Date('2024-01-31T23:59:59.999Z').getTime(),
        },
    } as Readonly<TransactionsFilters>;

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
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                now,
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
                getQueryParams,
                fetchEnabled: false,
                filters: defaultFilters,
                now,
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
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                now,
            })
        );

        expect(result.current.isWaiting).toBe(true);
        expect(result.current.isAvailable).toBe(true);

        await waitFor(() => expect(result.current.isWaiting).toBe(false));

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledOnce();
        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledWith(expect.any(Object), {
            query: {
                balanceAccountId: 'BA00000000000000000000001',
                createdSince: '2024-01-01T00:00:00.000Z',
                createdUntil: '2024-01-31T23:59:59.999Z',
            },
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
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                now,
            })
        );

        expect(result.current.isWaiting).toBe(true);

        await waitFor(() => expect(result.current.isWaiting).toBe(false));

        expect(result.current.error).toBe('Network Error');
        expect(result.current.totals).toEqual([]);
    });

    test('should abort previous request when filters change', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        const abortSignals: AbortSignal[] = [];

        mockTransactionTotalsEndpoint.mockImplementation(({ signal }) => {
            abortSignals.push(signal);
            return new Promise(() => {});
        });

        const { rerender } = renderHook((props: UseTransactionsTotalsProps) => useTransactionsTotals(props), {
            initialProps: {
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                now,
            },
        });

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1);
        expect(abortSignals[0]!.aborted).toBe(false);

        const newFilters = { ...defaultFilters, balanceAccount: { id: 'BA2' } } as typeof defaultFilters;

        rerender({
            getQueryParams,
            fetchEnabled: true,
            filters: newFilters,
            now,
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
                getQueryParams,
                fetchEnabled: false,
                filters: defaultFilters,
                now,
            },
        });

        expect(mockTransactionTotalsEndpoint).not.toHaveBeenCalled();

        rerender({
            getQueryParams,
            fetchEnabled: true,
            filters: defaultFilters,
            now,
        });

        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1));
    });

    test('should respect applicableFilters when determining if fetch is needed', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        mockTransactionTotalsEndpoint.mockResolvedValue({ data: [] });

        const applicableFilters = new Set<keyof TransactionsFilters>(['balanceAccount']);

        const { rerender } = renderHook((props: UseTransactionsTotalsProps) => useTransactionsTotals(props), {
            initialProps: {
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                applicableFilters,
                now,
            },
        });

        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1));

        const newFiltersIgnored = {
            ...defaultFilters,
            createdDate: { from: 0, to: 1 },
        } as typeof defaultFilters;

        rerender({
            getQueryParams,
            fetchEnabled: true,
            filters: newFiltersIgnored,
            applicableFilters,
            now,
        });

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1);

        const newFiltersRelevant = {
            ...newFiltersIgnored,
            balanceAccount: { id: 'BA_NEW' },
        } as typeof defaultFilters;

        rerender({
            getQueryParams,
            fetchEnabled: true,
            filters: newFiltersRelevant,
            applicableFilters,
            now,
        });

        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(2));
    });

    test('should refresh data when refresh is called', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        mockTransactionTotalsEndpoint.mockResolvedValue({ data: [] });

        const { result } = renderHook(() =>
            useTransactionsTotals({
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                now,
            })
        );

        await waitFor(() => expect(result.current.isWaiting).toBe(false));
        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1);

        expect(result.current.canRefresh).toBe(true);

        await act(() => result.current.refresh());
        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(2));
    });
});
