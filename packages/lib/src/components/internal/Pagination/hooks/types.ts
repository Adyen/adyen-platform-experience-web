import {
    UseFilters,
    UsePagination,
    WithNextPageNeighbour,
    WithPageNeighbours,
    WithPaginationCursor,
    WithPrevPageNeighbour
} from '../types';
import { UseReactiveStateRecord } from '../../../../hooks/useReactiveStateWithParams/types';

export type WithEitherPages = WithPageNeighbours<URLSearchParams>;
export type WithNextPage = WithNextPageNeighbour<URLSearchParams>;
export type WithPrevPage = WithPrevPageNeighbour<URLSearchParams>;

export type PaginatedRecordsFetcherParams<FilterValue extends any, FilterParam extends string> =
    WithPaginationCursor<Partial<Record<FilterParam, FilterValue>>> & { signal: AbortSignal };

export type PaginatedRecordsFetcher<T extends Record<any, any>, FilterValue extends any, FilterParam extends string> =
    (params: PaginatedRecordsFetcherParams<FilterValue, FilterParam>) => Promise<[T[], WithEitherPages]>;

export type UsePaginatedRecordsFilters<FilterValue extends any, FilterParam extends string> =
    UseFilters<UseReactiveStateRecord<FilterValue, FilterParam>>

export interface UsePaginatedRecords<T extends Record<any, any>, FilterValue extends any, FilterParam extends string> extends
    UsePagination,
    Omit<UsePaginatedRecordsFilters<FilterValue, FilterParam>, 'defaultFilters'> {
    fetching: boolean;
    records: T[];
}
