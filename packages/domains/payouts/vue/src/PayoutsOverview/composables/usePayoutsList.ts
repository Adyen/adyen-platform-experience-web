import { computed, watch } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useCursorPaginatedRecords } from '@integration-components/composables-vue/useCursorPaginatedRecords';
import { isFunction } from '@integration-components/utils';
import type { IPayout } from '@integration-components/types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';

interface UsePayoutsListProps {
    fetchEnabled: boolean;
    balanceAccountId: string | undefined;
    createdSince: string;
    createdUntil: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
}

export function usePayoutsList(props: () => UsePayoutsListProps) {
    const config = useConfigContext();
    const getPayouts = computed(() => config.endpoints.getPayouts);
    const canFetch = computed(() => isFunction(getPayouts.value) && props().fetchEnabled);

    const getFiltersKey = () => {
        const { balanceAccountId, createdSince, createdUntil } = props();
        return JSON.stringify({ balanceAccountId, createdSince, createdUntil });
    };

    watch(
        getFiltersKey,
        () => {
            const { onFiltersChanged, balanceAccountId, createdSince, createdUntil } = props();

            if (isFunction(onFiltersChanged)) {
                onFiltersChanged({ balanceAccountId, createdSince, createdUntil });
            }
        },
        { immediate: true }
    );

    return useCursorPaginatedRecords<IPayout>({
        getFetchKey: () => {
            if (!canFetch.value) return null;
            const { balanceAccountId, createdSince, createdUntil } = props();
            return JSON.stringify({ balanceAccountId, createdSince, createdUntil });
        },
        fetchPage: async ({ cursor, limit, signal }) => {
            const fn = getPayouts.value;
            if (!isFunction(fn)) return { records: undefined };

            const { balanceAccountId, createdSince, createdUntil } = props();

            const query: NonNullable<Parameters<NonNullable<typeof config.endpoints.getPayouts>>[1]>['query'] = {
                limit,
                balanceAccountId: balanceAccountId ?? '',
                createdSince,
                createdUntil,
                ...(cursor ? { cursor } : {}),
            };

            const json = await fn({ signal }, { query });

            return {
                records: json?.data,
                nextCursor: json?._links?.next?.cursor,
                previousCursor: json?._links?.prev?.cursor,
            };
        },
        preferredLimit: props().preferredLimit ?? DEFAULT_PAGE_LIMIT,
        limitOptions: () => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined),
    });
}
