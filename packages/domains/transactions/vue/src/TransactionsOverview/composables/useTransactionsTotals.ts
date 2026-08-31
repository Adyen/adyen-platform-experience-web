import { ref, computed, watch, onScopeDispose } from 'vue';
import type { ITransactionTotal } from '@integration-components/types';
import type { TransactionsFilters } from '../types';
import { useTransactionsContext } from '../../integration/context';

interface UseTransactionsTotalsProps {
    filters: TransactionsFilters;
    fetchEnabled: boolean;
    applicableFilters?: Set<keyof TransactionsFilters>;
}

export function useTransactionsTotals(props: () => UseTransactionsTotalsProps) {
    const { runtime } = useTransactionsContext();

    const totals = ref<readonly Readonly<ITransactionTotal>[]>([]);
    const error = ref<Error | undefined>(undefined);
    const isFetching = ref(false);
    const hasFetchedData = ref(false);
    const lastFetchedKey = ref<string | null>(null);

    let abortController: AbortController | null = null;

    const canFetch = computed(() => runtime.canGetTotals && props().fetchEnabled);

    async function fetchTotals() {
        if (!canFetch.value) return;
        const requestKey = fetchKey.value;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const { filters, applicableFilters } = props();
            const hasApplicableFilter = (key: keyof TransactionsFilters) => !applicableFilters || applicableFilters.has(key);
            const request: TransactionsFilters = {
                balanceAccountId: filters.balanceAccountId ?? '',
                categories: hasApplicableFilter('categories') ? filters.categories : [],
                createdSince: filters.createdSince,
                createdUntil: filters.createdUntil,
                currencies: hasApplicableFilter('currencies') ? filters.currencies : [],
                paymentPspReference: hasApplicableFilter('paymentPspReference') ? filters.paymentPspReference : undefined,
                statuses: hasApplicableFilter('statuses') ? filters.statuses : [],
            };
            const json = await runtime.getTransactionsTotals({ ...request, signal });
            if (!signal.aborted) {
                totals.value = Array.isArray(json?.data) ? (json.data as ITransactionTotal[]) : [];
                hasFetchedData.value = true;
                lastFetchedKey.value = requestKey;
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
                hasFetchedData.value = false;
            }
        } finally {
            if (!signal.aborted) {
                isFetching.value = false;
            }
        }
    }

    const refresh = () => {
        if (!isFetching.value && canFetch.value) {
            void fetchTotals();
        }
    };

    const fetchKey = computed(() => {
        if (!canFetch.value) return null;
        const { filters, applicableFilters } = props();
        const hasApplicableFilter = (key: keyof TransactionsFilters) => !applicableFilters || applicableFilters.has(key);
        const key: Record<string, any> = {
            balanceAccountId: filters.balanceAccountId,
            createdSince: filters.createdSince,
            createdUntil: filters.createdUntil,
        };
        if (hasApplicableFilter('categories')) key.categories = [...filters.categories].sort().join(',');
        if (hasApplicableFilter('currencies')) key.currencies = [...filters.currencies].sort().join(',');
        if (hasApplicableFilter('statuses')) key.statuses = [...filters.statuses].sort().join(',');
        if (hasApplicableFilter('paymentPspReference')) key.paymentPspReference = filters.paymentPspReference;
        return JSON.stringify(key);
    });

    watch(
        fetchKey,
        newKey => {
            if (!newKey) {
                abortController?.abort();
                abortController = null;
                isFetching.value = false;
                return;
            }
            if (newKey === lastFetchedKey.value) return;
            void fetchTotals();
        },
        { immediate: true }
    );

    onScopeDispose(() => abortController?.abort());

    return {
        totals,
        error,
        isFetching,
        canRefresh: computed(() => !isFetching.value && canFetch.value),
        isAvailable: computed(() => runtime.canGetTotals),
        isWaiting: computed(() => isFetching.value || (runtime.canGetTotals && !canFetch.value && !hasFetchedData.value)),
        refresh,
    } as const;
}
