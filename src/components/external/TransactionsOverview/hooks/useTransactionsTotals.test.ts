/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/preact';
import * as ConfigContext from '../../../../core/ConfigContext';
import useTransactionsTotals, { GetQueryParams, UseTransactionsTotalsProps } from './useTransactionsTotals';
import { ITransactionTotal } from '../../../../types';
import { TransactionsFilters } from '../types';

vi.mock('../../../../core/ConfigContext');

describe('useTransactionsTotals', () => {
    const mockUseConfigContext = vi.mocked(ConfigContext.useConfigContext);
    const getQueryParams: GetQueryParams = allQueryParams => allQueryParams;

    const getMockTransactionTotalsEndpoint = () => {
        const mockTransactionTotalsEndpoint = vi.fn();

        mockUseConfigContext.mockReturnValue({
            endpoints: { getTransactionTotals: mockTransactionTotalsEndpoint },
        } as unknown as ReturnType<typeof ConfigContext.useConfigContext>);

        return mockTransactionTotalsEndpoint;
    };

    const getInitialTotals = (currencies: string[]) => {
        const initialTotal: Omit<ITransactionTotal, 'currency'> = {
            expenses: 0,
            incomings: 0,
            total: 0,
            breakdown: { expenses: [], incomings: [] },
        };

        const totals = currencies.map(currency => ({ ...initialTotal, currency }));
        const totalsLookup = Object.fromEntries(currencies.map(currency => [currency, { ...initialTotal, currency }]));
        return { totals, totalsLookup };
    };

    const defaultFilters = {
        balanceAccount: { id: 'BA00000000000000000000001' },
        createdDate: {
            from: new Date('2024-01-01T00:00:00.000Z').getTime(),
            to: new Date('2024-01-31T23:59:59.999Z').getTime(),
        },
    } as Readonly<TransactionsFilters>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return correct initial state when endpoint is not available', () => {
        const currencies = ['USD'];
        const { totals, totalsLookup } = getInitialTotals(currencies);

        mockUseConfigContext.mockReturnValue({
            endpoints: { getTransactionTotals: undefined },
        } as unknown as ReturnType<typeof ConfigContext.useConfigContext>);

        const { result } = renderHook(() =>
            useTransactionsTotals({
                currencies,
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                loadingBalances: false,
                now: Date.now(),
            })
        );

        expect(result.current).toStrictEqual({
            totals,
            totalsLookup,
            error: undefined,
            isAvailable: false,
            isWaiting: false,
        });
    });

    test('should return correct waiting state when fetch is disabled', () => {
        getMockTransactionTotalsEndpoint();

        const currencies = ['USD'];
        const { totals, totalsLookup } = getInitialTotals(currencies);

        const { result } = renderHook(() =>
            useTransactionsTotals({
                currencies,
                getQueryParams,
                fetchEnabled: false,
                filters: defaultFilters,
                loadingBalances: false,
                now: Date.now(),
            })
        );

        expect(result.current).toStrictEqual({
            totals,
            totalsLookup,
            error: undefined,
            isAvailable: true,
            isWaiting: true,
        });
    });

    test('should return correct waiting state when loading balances', () => {
        getMockTransactionTotalsEndpoint();

        const currencies = ['USD'];
        const { totals, totalsLookup } = getInitialTotals(currencies);

        const { result } = renderHook(() =>
            useTransactionsTotals({
                currencies,
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                loadingBalances: true,
                now: Date.now(),
            })
        );

        expect(result.current).toStrictEqual({
            totals,
            totalsLookup,
            error: undefined,
            isAvailable: true,
            isWaiting: true,
        });
    });

    test('should fetch totals and return correct state on success', async () => {
        const currencies = ['USD', 'EUR'];
        const { totals: initialTotals, totalsLookup: initialTotalsLookup } = getInitialTotals(currencies);
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();

        mockTransactionTotalsEndpoint.mockResolvedValue({
            data: [
                {
                    currency: 'USD',
                    expenses: 100,
                    incomings: 500,
                    total: 400,
                    breakdown: {
                        expenses: [],
                        incomings: [],
                    },
                },
            ],
        });

        const { result } = renderHook(() =>
            useTransactionsTotals({
                currencies,
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                loadingBalances: false,
                now: Date.now(),
            })
        );

        expect(result.current.isWaiting).toBe(true);
        expect(result.current.isAvailable).toBe(true);
        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledOnce();
        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledWith(expect.any(Object), {
            query: {
                balanceAccountId: 'BA00000000000000000000001',
                createdSince: '2024-01-01T00:00:00.000Z',
                createdUntil: '2024-01-31T23:59:59.999Z',
            },
        });

        await waitFor(() => expect(result.current.isWaiting).toBe(false));

        const expectedTotals = [
            { currency: 'USD', expenses: 100, incomings: 500, total: 400, breakdown: { expenses: [], incomings: [] } },
            initialTotals[1],
        ];
        const expectedTotalsLookup = {
            USD: { currency: 'USD', expenses: 100, incomings: 500, total: 400, breakdown: { expenses: [], incomings: [] } },
            EUR: initialTotalsLookup.EUR,
        };

        expect(result.current).toStrictEqual({
            totals: expectedTotals,
            totalsLookup: expectedTotalsLookup,
            error: undefined,
            isAvailable: true,
            isWaiting: false,
        });
    });

    test('should return correct state on fetch error', async () => {
        const currencies = ['USD'];
        const { totals, totalsLookup } = getInitialTotals(currencies);
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();

        mockTransactionTotalsEndpoint.mockRejectedValue('Network Error');

        const { result } = renderHook(() =>
            useTransactionsTotals({
                currencies,
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                loadingBalances: false,
                now: Date.now(),
            })
        );

        expect(result.current.isWaiting).toBe(true);

        await waitFor(() => expect(result.current.isWaiting).toBe(false));

        expect(result.current.error).toBe('Network Error');
        expect(result.current.totals).toStrictEqual(totals);
        expect(result.current.totalsLookup).toStrictEqual(totalsLookup);
    });

    test('should abort previous request when filters change', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        const abortSignals: AbortSignal[] = [];
        const now = Date.now();

        mockTransactionTotalsEndpoint.mockImplementation(({ signal }) => {
            abortSignals.push(signal);
            return new Promise(() => {});
        });

        const { rerender } = renderHook((props: UseTransactionsTotalsProps) => useTransactionsTotals(props), {
            initialProps: {
                getQueryParams,
                currencies: ['USD'],
                fetchEnabled: true,
                filters: defaultFilters,
                loadingBalances: false,
                now,
            },
        });

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1);
        expect(abortSignals[0]!.aborted).toBe(false);

        const newFilters = { ...defaultFilters };

        rerender({
            getQueryParams,
            currencies: ['USD'],
            fetchEnabled: true,
            filters: newFilters,
            loadingBalances: false,
            now,
        });

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(2);
        expect(abortSignals[0]!.aborted).toBe(true);
        expect(abortSignals[1]!.aborted).toBe(false);
    });

    test('should handle empty data response', async () => {
        const currencies = ['USD', 'EUR'];
        const { totals, totalsLookup } = getInitialTotals(currencies);
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();

        mockTransactionTotalsEndpoint.mockResolvedValue({ data: [] });

        const { result } = renderHook(() =>
            useTransactionsTotals({
                currencies,
                getQueryParams,
                fetchEnabled: true,
                filters: defaultFilters,
                loadingBalances: false,
                now: Date.now(),
            })
        );

        await waitFor(() => expect(result.current.isWaiting).toBe(false));

        expect(result.current.totals).toStrictEqual(totals);
        expect(result.current.totalsLookup).toStrictEqual(totalsLookup);
    });

    test('should update totals when currencies prop changes', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        const now = Date.now();

        mockTransactionTotalsEndpoint.mockResolvedValue({
            data: [{ currency: 'USD', expenses: 100, incomings: 500, total: 400, breakdown: { expenses: [], incomings: [] } }],
        });

        const { result, rerender } = renderHook((props: UseTransactionsTotalsProps) => useTransactionsTotals(props), {
            initialProps: {
                getQueryParams,
                currencies: ['USD'],
                fetchEnabled: true,
                filters: defaultFilters,
                loadingBalances: false,
                now,
            },
        });

        await waitFor(() => expect(result.current.isWaiting).toBe(false));

        expect(result.current.totals).toHaveLength(1);
        expect(result.current.totalsLookup).toHaveProperty('USD');
        expect(result.current.totalsLookup).not.toHaveProperty('EUR');

        rerender({
            getQueryParams,
            currencies: ['USD', 'EUR'],
            fetchEnabled: true,
            filters: defaultFilters,
            loadingBalances: false,
            now,
        });

        expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1);
        expect(result.current.totals).toHaveLength(2);
        expect(result.current.totalsLookup).toHaveProperty('USD');
        expect(result.current.totalsLookup).toHaveProperty('EUR');
        expect(result.current.totalsLookup.EUR!.total).toBe(0);
    });

    test('should trigger fetch when fetchEnabled changes to true', async () => {
        const mockTransactionTotalsEndpoint = getMockTransactionTotalsEndpoint();
        const now = Date.now();

        mockTransactionTotalsEndpoint.mockResolvedValue({ data: [] });

        const { rerender } = renderHook((props: UseTransactionsTotalsProps) => useTransactionsTotals(props), {
            initialProps: {
                getQueryParams,
                currencies: ['USD'],
                fetchEnabled: false,
                filters: defaultFilters,
                loadingBalances: false,
                now,
            },
        });

        expect(mockTransactionTotalsEndpoint).not.toHaveBeenCalled();

        rerender({
            getQueryParams,
            currencies: ['USD'],
            fetchEnabled: true,
            filters: defaultFilters,
            loadingBalances: false,
            now,
        });

        await waitFor(() => expect(mockTransactionTotalsEndpoint).toHaveBeenCalledTimes(1));
    });
});
