import { effectScope, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { TransactionsFilters } from '../types';
import { useTransactionsContext } from '../../integration/context';
import { useTransactionsTotals } from './useTransactionsTotals';

vi.mock('../../integration/context', () => ({
    useTransactionsContext: vi.fn(),
}));

describe('useTransactionsTotals', () => {
    const mockUseTransactionsContext = vi.mocked(useTransactionsContext);
    type TotalsProps = {
        filters: TransactionsFilters;
        fetchEnabled: boolean;
        applicableFilters?: Set<keyof TransactionsFilters>;
    };
    const defaultFilters: TransactionsFilters = {
        balanceAccountId: 'BA1',
        categories: [],
        statuses: ['Booked'],
        currencies: [],
        createdSince: '2024-01-01T00:00:00.000Z',
        createdUntil: '2024-01-31T23:59:59.999Z',
        paymentPspReference: undefined,
    };

    const createHook = (
        getTransactionTotals: ReturnType<typeof vi.fn> | undefined,
        initialProps: TotalsProps = { filters: defaultFilters, fetchEnabled: true }
    ) => {
        mockUseTransactionsContext.mockReturnValue({
            runtime: {
                canGetTotals: !!getTransactionTotals,
                getTransactionsTotals: getTransactionTotals,
            },
        } as unknown as ReturnType<typeof useTransactionsContext>);

        const props = ref(initialProps);
        const scope = effectScope();
        const result = scope.run(() => useTransactionsTotals(() => props.value))!;

        return { props, result, scope };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('fetches totals with the active transaction filters', async () => {
        const totals = [{ currency: 'USD', expenses: 100, incomings: 500, total: 400, breakdown: { expenses: [], incomings: [] } }];
        const getTransactionTotals = vi.fn().mockResolvedValue({ data: totals });
        const { result, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(result.totals.value).toEqual(totals));

        expect(getTransactionTotals.mock.lastCall?.[0]).toEqual({
            balanceAccountId: 'BA1',
            categories: [],
            createdSince: defaultFilters.createdSince,
            createdUntil: defaultFilters.createdUntil,
            currencies: [],
            paymentPspReference: undefined,
            signal: expect.any(AbortSignal),
            statuses: ['Booked'],
        });
        expect(result.error.value).toBeUndefined();
        expect(result.canRefresh.value).toBe(true);

        scope.stop();
    });

    test('reports waiting while an available endpoint is disabled and no totals are loaded', () => {
        const getTransactionTotals = vi.fn();
        const { result, scope } = createHook(getTransactionTotals, { filters: defaultFilters, fetchEnabled: false });

        expect(result.isAvailable.value).toBe(true);
        expect(result.isFetching.value).toBe(false);
        expect(result.isWaiting.value).toBe(true);
        expect(getTransactionTotals).not.toHaveBeenCalled();

        scope.stop();
    });

    test('does not refetch when re-enabled with unchanged filters', async () => {
        const getTransactionTotals = vi.fn().mockResolvedValue({ data: [] });
        const { props, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledOnce());

        props.value = { ...props.value, fetchEnabled: false };
        await Promise.resolve();

        props.value = { ...props.value, fetchEnabled: true };
        await Promise.resolve();

        expect(getTransactionTotals).toHaveBeenCalledOnce();

        scope.stop();
    });

    test('refetches after an error and when refresh is called', async () => {
        const error = new Error('Totals unavailable');
        const totals = [{ currency: 'USD', expenses: 0, incomings: 0, total: 0, breakdown: { expenses: [], incomings: [] } }];
        const getTransactionTotals = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce({ data: totals });
        const { result, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(result.error.value).toBe(error));

        result.refresh();

        await vi.waitFor(() => expect(result.totals.value).toEqual(totals));
        expect(result.error.value).toBeUndefined();
        expect(getTransactionTotals).toHaveBeenCalledTimes(2);

        scope.stop();
    });

    test('refetches only when applicable filters change', async () => {
        const getTransactionTotals = vi.fn().mockResolvedValue({ data: [] });
        const { props, scope } = createHook(getTransactionTotals, {
            filters: defaultFilters,
            fetchEnabled: true,
            applicableFilters: new Set<keyof TransactionsFilters>(['balanceAccountId', 'createdSince', 'createdUntil']),
        });

        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledOnce());

        props.value = {
            ...props.value,
            filters: { ...defaultFilters, categories: ['Payment'] },
        };
        await Promise.resolve();
        expect(getTransactionTotals).toHaveBeenCalledOnce();

        props.value = {
            ...props.value,
            filters: { ...defaultFilters, createdSince: '2024-02-01T00:00:00.000Z' },
        };
        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledTimes(2));

        scope.stop();
    });

    test('aborts stale requests when filters change or the scope is disposed', async () => {
        const getTransactionTotals = vi.fn().mockReturnValue(new Promise(() => undefined));
        const { props, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledOnce());
        const firstSignal = getTransactionTotals.mock.calls[0]?.[0]?.signal;

        props.value = {
            ...props.value,
            filters: { ...defaultFilters, balanceAccountId: 'BA2' },
        };
        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledTimes(2));
        expect(firstSignal?.aborted).toBe(true);

        const secondSignal = getTransactionTotals.mock.calls[1]?.[0]?.signal;
        scope.stop();
        expect(secondSignal?.aborted).toBe(true);
    });

    test('aborts an in-flight request when fetching is disabled', async () => {
        const getTransactionTotals = vi.fn().mockReturnValue(new Promise(() => undefined));
        const { props, result, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledOnce());
        const signal = getTransactionTotals.mock.calls[0]?.[0]?.signal;

        props.value = { ...props.value, fetchEnabled: false };
        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));

        expect(signal?.aborted).toBe(true);

        scope.stop();
    });
});
