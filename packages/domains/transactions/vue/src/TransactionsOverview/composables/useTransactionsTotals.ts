import { ref, computed, watch, onUnmounted } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import type { ITransactionTotal } from '@integration-components/types';
import type { TransactionsFilters } from '../types';

interface UseTransactionsTotalsProps {
    filters: TransactionsFilters;
    fetchEnabled: boolean;
    applicableFilters?: Set<keyof TransactionsFilters>;
}

export function useTransactionsTotals(props: () => UseTransactionsTotalsProps) {
    const config = useConfigContext();

    const totals = ref<readonly Readonly<ITransactionTotal>[]>([]);
    const error = ref<Error | undefined>(undefined);
    const isFetching = ref(false);

    let abortController: AbortController | null = null;

    const getTransactionTotals = computed(() => config.endpoints.getTransactionTotals);
    const canFetch = computed(() => isFunction(getTransactionTotals.value) && props().fetchEnabled);

    async function fetchTotals() {
        const fn = getTransactionTotals.value;
        if (!isFunction(fn) || !canFetch.value) return;

        if (abortController) abortController.abort();
        abortController = new AbortController();
        const { signal } = abortController;

        isFetching.value = true;
        error.value = undefined;

        try {
            const { filters, applicableFilters } = props();
            const hasApplicableFilter = (key: keyof TransactionsFilters) => !applicableFilters || applicableFilters.has(key);
            const query: { balanceAccountId: string; createdSince?: string; createdUntil?: string; [key: string]: any } = {
                balanceAccountId: filters.balanceAccountId ?? '',
                createdSince: filters.createdSince,
                createdUntil: filters.createdUntil,
            };
            if (hasApplicableFilter('categories') && filters.categories.length) query.categories = filters.categories;
            if (hasApplicableFilter('currencies') && filters.currencies.length) query.currencies = filters.currencies;
            if (hasApplicableFilter('statuses') && filters.statuses.length) query.statuses = filters.statuses;
            if (hasApplicableFilter('paymentPspReference') && filters.paymentPspReference) query.paymentPspReference = filters.paymentPspReference;

            const json = await fn({ signal }, { query } as any);
            if (!signal.aborted) {
                totals.value = Array.isArray(json?.data) ? (json.data as ITransactionTotal[]) : [];
            }
        } catch (e) {
            if (!signal.aborted) {
                error.value = e as Error;
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
            if (!newKey) return;
            void fetchTotals();
        },
        { immediate: true }
    );

    onUnmounted(() => abortController?.abort());

    return {
        totals,
        error,
        isFetching,
        canRefresh: computed(() => !isFetching.value && canFetch.value),
        isAvailable: computed(() => isFunction(getTransactionTotals.value)),
        isWaiting: computed(() => isFetching.value),
        refresh,
    } as const;
}
