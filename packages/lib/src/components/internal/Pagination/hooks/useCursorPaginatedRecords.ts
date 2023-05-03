import { useCallback } from 'preact/hooks';
import {
    PaginatedRecordsFetcherReturnValue,
    PaginatedRecordsInitOptions,
    UsePaginatedRecords,
    UsePaginatedRecordsFilters
} from './types';
import usePaginatedRecords from './usePaginatedRecords';
import { hasNextPage, hasPrevPage } from './useCursorPagination';
import { PaginatedResponseDataField, PaginationType } from '../types';
import { ReactiveStateUpdateRequestWithField } from '../../../../hooks/useReactiveStateWithParams/types';

const useCursorPaginatedRecords = <T, DataField extends PaginatedResponseDataField, FilterValue extends string, FilterParam extends string>(
    initOptions: PaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>
): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    const initializeAndDerivePageLimit = useCallback((
        data: PaginatedRecordsFetcherReturnValue<PaginationType, T>,
        recordsFilters: UsePaginatedRecordsFilters<FilterValue, FilterParam>,
        currentPageLimit: number | undefined
    ) => {
        const [ records, paginationData ] = data as PaginatedRecordsFetcherReturnValue<PaginationType.CURSOR, T>;
        const { filters, updateFilters } = recordsFilters;

        const params =
            (hasNextPage(paginationData) && paginationData.next) ||
            (hasPrevPage(paginationData) && paginationData.prev) ||
            new URLSearchParams();

        const limit = parseInt(params.get('limit') as string) || records.length || undefined;

        for (const param of Object.keys(filters)) {
            const value = params.get(param);
            updateFilters({
                [param as FilterParam]: value ? decodeURIComponent(value) : undefined
            } as ReactiveStateUpdateRequestWithField<FilterValue, FilterParam>);
        }

        return currentPageLimit || limit;
    }, []);

    return usePaginatedRecords<T, DataField, FilterValue, FilterParam>({
        ...initOptions,
        initializeAndDerivePageLimit,
        pagination: PaginationType.CURSOR
    });
};

export default useCursorPaginatedRecords;
