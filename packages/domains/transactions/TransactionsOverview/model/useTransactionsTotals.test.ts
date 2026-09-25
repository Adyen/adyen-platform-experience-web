import { effectScope, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useConfigContext } from '@integration-components/core/vue';
import type { TransactionsFilters } from '../../domain/src/TransactionsOverview/types';
import { useTransactionsTotals } from './useTransactionsTotals';

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: vi.fn(),
}));

describe('useTransactionsTotals', () => {
    const mockUseConfigContext = vi.mocked(useConfigContext);
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
        mockUseConfigContext.mockReturnValue({
            endpoints: { getTransactionTotals },
        } as unknown as ReturnType<typeof useConfigContext>);

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

        expect(getTransactionTotals.mock.lastCall?.[1]?.query).toEqual({
            balanceAccountId: 'BA1',
            createdSince: defaultFilters.createdSince,
            createdUntil: defaultFilters.createdUntil,
            statuses: ['Booked'],
        });
        expect(result.error.value).toBeUndefined();
        expect(result.canRefresh.value).toBe(true);

        scope.stop();
    });

    test('includes selected optional filters and defaults a missing balance account ID', async () => {
        const getTransactionTotals = vi.fn().mockResolvedValue({ data: [] });
        const { scope } = createHook(getTransactionTotals, {
            filters: {
                ...defaultFilters,
                balanceAccountId: undefined,
                categories: ['Payment'],
                currencies: ['USD'],
                statuses: [],
                paymentPspReference: 'PSP-123',
            },
            fetchEnabled: true,
        });

        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledOnce());
        expect(getTransactionTotals.mock.lastCall?.[1]?.query).toEqual({
            balanceAccountId: '',
            createdSince: defaultFilters.createdSince,
            createdUntil: defaultFilters.createdUntil,
            categories: ['Payment'],
            currencies: ['USD'],
            paymentPspReference: 'PSP-123',
        });

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

    test.each([
        ['missing', undefined],
        ['non-array', { data: { currency: 'USD' } }],
    ])('treats %s totals responses as empty', async (_, response) => {
        const getTransactionTotals = vi.fn().mockResolvedValue(response);
        const { result, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));
        expect(getTransactionTotals).toHaveBeenCalledOnce();
        expect(result.totals.value).toEqual([]);
        expect(result.error.value).toBeUndefined();
        expect(result.isWaiting.value).toBe(false);

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

    test('does not refresh while fetching or when fetching is disabled', async () => {
        const pending = Promise.withResolvers<{ data: [] }>();
        const getTransactionTotals = vi.fn().mockReturnValue(pending.promise);
        const { props, result, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledOnce());
        result.refresh();
        expect(getTransactionTotals).toHaveBeenCalledOnce();

        pending.resolve({ data: [] });
        await vi.waitFor(() => expect(result.isFetching.value).toBe(false));
        props.value = { ...props.value, fetchEnabled: false };
        await Promise.resolve();
        result.refresh();
        expect(getTransactionTotals).toHaveBeenCalledOnce();
        expect(result.canRefresh.value).toBe(false);

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

    test('ignores totals from an aborted request while newer totals are loading', async () => {
        const first = Promise.withResolvers<{ data: { currency: string }[] }>();
        const second = Promise.withResolvers<{ data: { currency: string }[] }>();
        const getTransactionTotals = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
        const { props, result, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledOnce());
        const firstSignal = getTransactionTotals.mock.calls[0]?.[0]?.signal;
        props.value = { ...props.value, filters: { ...defaultFilters, balanceAccountId: 'BA2' } };
        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledTimes(2));
        expect(firstSignal?.aborted).toBe(true);

        first.resolve({ data: [{ currency: 'EUR' }] });
        await first.promise;
        await Promise.resolve();
        expect(result.totals.value).toEqual([]);
        expect(result.isFetching.value).toBe(true);

        second.resolve({ data: [{ currency: 'USD' }] });
        await vi.waitFor(() => expect(result.totals.value).toEqual([{ currency: 'USD' }]));
        expect(result.isFetching.value).toBe(false);

        scope.stop();
    });

    test('ignores an aborted request failure while newer totals are loading', async () => {
        const first = Promise.withResolvers<never>();
        const second = Promise.withResolvers<{ data: { currency: string }[] }>();
        const getTransactionTotals = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
        const { props, result, scope } = createHook(getTransactionTotals);

        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledOnce());
        props.value = { ...props.value, filters: { ...defaultFilters, balanceAccountId: 'BA2' } };
        await vi.waitFor(() => expect(getTransactionTotals).toHaveBeenCalledTimes(2));

        first.reject(new Error('Old request failed'));
        await expect(first.promise).rejects.toThrow('Old request failed');
        await Promise.resolve();
        expect(result.error.value).toBeUndefined();
        expect(result.isFetching.value).toBe(true);

        second.resolve({ data: [{ currency: 'USD' }] });
        await vi.waitFor(() => expect(result.totals.value).toEqual([{ currency: 'USD' }]));
        expect(result.isFetching.value).toBe(false);

        scope.stop();
    });
});
