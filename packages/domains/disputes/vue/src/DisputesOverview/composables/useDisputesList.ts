import { computed, watch } from 'vue';
import { useCursorPaginatedRecords } from '@integration-components/composables-vue/useCursorPaginatedRecords';
import { isFunction, listFrom } from '@integration-components/utils';
import type { IDisputeListItem, IDisputeReasonCategory, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import { DISPUTE_PAYMENT_SCHEMES, type DisputesOverviewFilters } from '../../../../domain/src';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../constants';
import { useDisputesContext } from '../../integration/context';

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
    const { runtime } = useDisputesContext();
    const canFetch = computed(() => props().fetchEnabled);

    const getFiltersKey = () => {
        const { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil } = props();
        return JSON.stringify({ balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil });
    };

    watch(
        getFiltersKey,
        () => {
            const { onFiltersChanged, balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil } = props();

            if (isFunction(onFiltersChanged)) {
                const filters = { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil };
                onFiltersChanged(filters);
            }
        },
        { immediate: true }
    );

    return useCursorPaginatedRecords<IDisputeListItem>({
        getFetchKey: () => {
            if (!canFetch.value) return null;
            const { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil, refreshToken } = props();
            return JSON.stringify({ balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil, refreshToken });
        },
        fetchPage: async ({ cursor, limit, signal }) => {
            const { balanceAccountId, statusGroup, reasonCategories, schemeCodes, createdSince, createdUntil } = props();
            const json = await runtime.getDisputes({
                statusGroup,
                limit,
                ...(balanceAccountId ? { balanceAccountId } : {}),
                reasonCategories: listFrom<IDisputeReasonCategory>(reasonCategories),
                schemeCodes: listFrom<keyof typeof DISPUTE_PAYMENT_SCHEMES>(schemeCodes),
                ...(createdSince ? { createdSince } : {}),
                ...(createdUntil ? { createdUntil } : {}),
                ...(cursor ? { cursor } : {}),
                signal,
            });

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
