import { useCallback } from 'preact/hooks';
import { PaginatedRecordsFetcherReturnValue, PaginatedRecordsInitOptions, UsePaginatedRecords, UsePaginatedRecordsFilters } from './types';
import usePaginatedRecords from './usePaginatedRecords';
import { hasNextPage, hasPrevPage } from './useCursorPagination';
import { PaginationType } from '../types';
import { ReactiveStateUpdateRequestWithField } from '@src/hooks/useReactiveStateWithParams/types';

const useCursorPaginatedRecords = <T, DataField extends string, FilterValue extends string, FilterParam extends string>(
    initOptions: PaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>
): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    const initialize = useCallback(
        (data: PaginatedRecordsFetcherReturnValue<PaginationType, T>, recordsFilters: UsePaginatedRecordsFilters<FilterValue, FilterParam>) => {
            const [, paginationData] = data as PaginatedRecordsFetcherReturnValue<PaginationType.CURSOR, T>;
            const { filters, updateFilters } = recordsFilters;

            const params =
                (hasNextPage(paginationData) && paginationData.next) || (hasPrevPage(paginationData) && paginationData.prev) || new URLSearchParams();

            const initialPaginationStateUpdateRequest = {} as ReactiveStateUpdateRequestWithField<FilterValue, FilterParam>;

            for (const param of Object.keys(filters)) {
                const value = params.get(param);
                initialPaginationStateUpdateRequest[param as FilterParam] = (value ? decodeURIComponent(value) : undefined) as FilterValue;
            }

            updateFilters(initialPaginationStateUpdateRequest);
        },
        []
    );

    return usePaginatedRecords<T, DataField, FilterValue, FilterParam>({
        ...initOptions,
        initialize,
        pagination: PaginationType.CURSOR,
    });
};

export default useCursorPaginatedRecords;
