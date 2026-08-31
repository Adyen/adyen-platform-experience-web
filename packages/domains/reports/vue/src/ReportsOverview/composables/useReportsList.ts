import { watch } from 'vue';
import { useCursorPaginatedRecords } from '@integration-components/composables-vue/useCursorPaginatedRecords';
import type { IReport } from '@integration-components/types';
import { DEFAULT_PAGE_LIMIT, LIMIT_OPTIONS } from '../../../../domain/src';
import { useReportsContext } from '../../integration/context';

interface UseReportsListProps {
    fetchEnabled: boolean;
    balanceAccountId: string | undefined;
    createdSince: string;
    createdUntil: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
}

export function useReportsList(props: () => UseReportsListProps) {
    const { runtime } = useReportsContext();

    const getFiltersKey = () => {
        const { balanceAccountId, createdSince, createdUntil } = props();
        return JSON.stringify({ balanceAccountId, createdSince, createdUntil });
    };

    watch(
        getFiltersKey,
        () => {
            const { onFiltersChanged, balanceAccountId, createdSince, createdUntil } = props();

            if (onFiltersChanged) {
                onFiltersChanged({ balanceAccountId, createdSince, createdUntil });
            }
        },
        { immediate: true }
    );

    return useCursorPaginatedRecords<IReport>({
        getFetchKey: () => {
            if (!props().fetchEnabled) return null;
            const { balanceAccountId, createdSince, createdUntil } = props();
            return JSON.stringify({ balanceAccountId, createdSince, createdUntil });
        },
        fetchPage: async ({ cursor, limit, signal }) => {
            const { balanceAccountId, createdSince, createdUntil } = props();
            const json = await runtime.getReports({
                balanceAccountId: balanceAccountId ?? '',
                createdSince,
                createdUntil,
                cursor,
                limit,
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
