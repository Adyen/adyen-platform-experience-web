import { ref, computed, watch, toRaw } from 'vue';
import { useConfigContext } from '../../../core/ConfigContext';
import { compareTransactionsFilters, getTransactionsFilterQueryParams, isFunction } from '../utils';
import type { ITransactionTotal, TransactionsFilters } from '../types';

type AllQueryParams = ReturnType<typeof getTransactionsFilterQueryParams>;
type TotalsQueryParams = Partial<AllQueryParams> & Pick<AllQueryParams, 'balanceAccountId'>;
export type GetQueryParams = (allQueryParams: AllQueryParams) => TotalsQueryParams;

export interface UseTransactionsTotalsProps {
    fetchEnabled: boolean;
    filters: Readonly<TransactionsFilters>;
    applicableFilters?: Set<keyof TransactionsFilters>;
    getQueryParams: GetQueryParams;
    now: number;
}

export function useTransactionsTotals(props: () => UseTransactionsTotalsProps) {
    const { endpoints } = useConfigContext();

    const data = ref<ITransactionTotal[] | undefined>(undefined);
    const error = ref<Error | undefined>(undefined);
    const isFetching = ref(false);
    const fetchTimestamp = ref(performance.now());
    const lastFetchedTimestamp = ref<number | undefined>(undefined);
    let abortController: AbortController | null = null;
    let cachedFilters: Readonly<TransactionsFilters> | null = null;

    const getTransactionTotals = computed(() => endpoints.getTransactionTotals);
    const canGetTransactionTotals = computed(() => isFunction(getTransactionTotals.value));
    const canFetchTransactionTotals = computed(() => canGetTransactionTotals.value && props().fetchEnabled);
    const shouldFetch = computed(() => canFetchTransactionTotals.value && lastFetchedTimestamp.value !== fetchTimestamp.value);

    async function fetchTotals() {
        const fn = getTransactionTotals.value;
        if (!isFunction(fn) || !shouldFetch.value) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const { filters, getQueryParams, now } = props();
            const query = getQueryParams(getTransactionsFilterQueryParams(toRaw(filters), now));
            const json = await fn({ signal }, { query });
            if (!signal.aborted) {
                data.value = json?.data;
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
            }
        } finally {
            if (!signal.aborted) {
                isFetching.value = false;
                lastFetchedTimestamp.value = fetchTimestamp.value;
            }
        }
    }

    const totals = computed<readonly Readonly<ITransactionTotal>[]>(() => (Array.isArray(data.value) ? data.value : []));

    const canRefresh = computed(() => !isFetching.value && canFetchTransactionTotals.value);

    const refresh = () => {
        if (canRefresh.value) {
            fetchTimestamp.value = performance.now();
        }
    };

    // Watch for applicable filter changes
    watch(
        () => props().filters,
        newFilters => {
            if (cachedFilters === null) {
                cachedFilters = newFilters;
                return;
            }

            const applicableFiltersDidChange = compareTransactionsFilters(newFilters, cachedFilters, props().applicableFilters);

            if (applicableFiltersDidChange) {
                fetchTimestamp.value = performance.now();
                cachedFilters = newFilters;
            }
        }
    );

    // Trigger fetch when timestamp changes
    watch(
        fetchTimestamp,
        () => {
            fetchTotals();
        },
        { immediate: true }
    );

    // Trigger fetch when fetch becomes possible (e.g. balance account selected for the first time)
    watch(canFetchTransactionTotals, canFetch => {
        if (canFetch && shouldFetch.value) {
            fetchTotals();
        }
    });

    return {
        totals,
        error,
        canRefresh,
        refresh,
        isAvailable: canGetTransactionTotals,
        isWaiting: computed(() => isFetching.value || (canGetTransactionTotals.value && !canFetchTransactionTotals.value && !data.value)),
    };
}

export default useTransactionsTotals;
