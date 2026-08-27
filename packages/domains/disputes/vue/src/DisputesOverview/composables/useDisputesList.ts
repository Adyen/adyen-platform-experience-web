import { computed } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useCursorPaginatedRecords } from '@integration-components/composables-vue/useCursorPaginatedRecords';
import { isFunction, listFrom } from '@integration-components/utils';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputesOverviewFilters } from '../../../../domain/src';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';

interface UseDisputesListProps {
    fetchEnabled: boolean;
    balanceAccountId: string | undefined;
    statusGroup: IDisputeStatusGroup;
    reasonCategories: string | undefined;
    schemeCodes: string | undefined;
    createdSince: string | undefined;
    createdUntil: string | undefined;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    refreshToken?: number;
    onFiltersChanged?: (filters: DisputesOverviewFilters) => any;
}

export function useDisputesList(props: () => UseDisputesListProps) {
    const config = useConfigContext();
    const getDisputeList = computed(() => config.endpoints.getDisputeList);
    const canFetch = computed(() => isFunction(getDisputeList.value) && props().fetchEnabled);

    return useCursorPaginatedRecords<IDisputeListItem>({
        getFetchKey: () => {
            if (!canFetch.value) return null;
            const { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil, refreshToken } = props();
            return JSON.stringify({ balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil, refreshToken });
        },
        fetchPage: async ({ cursor, limit, signal }) => {
            const fn = getDisputeList.value;
            if (!isFunction(fn)) return { records: undefined };

            const { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil } = props();

            const query: NonNullable<Parameters<NonNullable<typeof config.endpoints.getDisputeList>>[1]>['query'] = {
                statusGroup,
                limit,
                ...(balanceAccountId ? { balanceAccountId } : {}),
                reasonCategories: listFrom(reasonCategories) as NonNullable<typeof query.reasonCategories>,
                schemeCodes: listFrom(schemeCodes) as NonNullable<typeof query.schemeCodes>,
                ...(createdSince ? { createdSince } : {}),
                ...(createdUntil ? { createdUntil } : {}),
                ...(cursor ? { cursor } : {}),
            };

            const json = await fn({ signal, errorLevel: 'error' }, { query });

            return {
                records: json?.data,
                nextCursor: json?._links?.next?.cursor,
                previousCursor: json?._links?.prev?.cursor,
            };
        },
        preferredLimit: props().preferredLimit ?? DEFAULT_PAGE_LIMIT,
        limitOptions: () => (props().allowLimitSelection !== false ? LIMIT_OPTIONS : undefined),
        onSuccess: () => {
            const { onFiltersChanged, balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil } = props();
            if (isFunction(onFiltersChanged)) {
                const filters = { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil };
                onFiltersChanged(filters);
            }
        },
    });
}
