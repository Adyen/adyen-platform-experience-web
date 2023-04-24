import {
    UseFilters,
    UsePagination,
    WithPageNeighbours,
    WithPaginationCursor,
    WithPaginationLimit,
    WithPaginationRecordSize
} from '../types';
import { UseReactiveStateRecord } from '../../../../hooks/useReactiveStateWithParams/types';

type MaybePromise<T extends any = any> = T | Promise<T>;

export type PaginatedRecordsFetcherParams<FilterValue extends any, FilterParam extends string> =
    Partial<Record<FilterParam, FilterValue>> &
    Required<WithPaginationLimit> &
    { signal: AbortSignal };

export type PaginatedRecordsFetcherReturnValue<T extends Record<any, any>, PageNeighbour extends any = any> =
    [T[], WithPageNeighbours<PageNeighbour>];

export type PaginatedRecordsFetcher<T extends Record<any, any>, PageNeighbour extends any, FilterValue extends any, FilterParam extends string> =
    (params: PaginatedRecordsFetcherParams<FilterValue, FilterParam>) => MaybePromise<PaginatedRecordsFetcherReturnValue<T, PageNeighbour>>;

export type RequestPageCallbackParams = Pick<PaginatedRecordsFetcherParams<any, any>, 'limit' | 'signal'>;
export type RequestPageCallbackParamsWithCursor = RequestPageCallbackParams & WithPaginationCursor;

export type RequestPageCallbackReturnValue<PageNeighbour extends any> = (
    PaginatedRecordsFetcherReturnValue<any, PageNeighbour>[1] &
    Required<WithPaginationRecordSize>
) | undefined;

export type RequestPageCallback<PageNeighbour extends any, RequestPageParams extends RequestPageCallbackParams> =
    (params: RequestPageParams) => MaybePromise<RequestPageCallbackReturnValue<PageNeighbour>>;

export type PaginatedRecordsInitOptions<T extends Record<any, any>, PageNeighbour extends any, FilterValue extends any, FilterParam extends string> =
    WithPaginationLimit<{
        fetchRecords: PaginatedRecordsFetcher<T, PageNeighbour, FilterValue, FilterParam>;
        filterParams?: FilterParam[];
    }>;

export type UsePaginatedRecordsFilters<FilterValue extends any, FilterParam extends string> =
    UseFilters<UseReactiveStateRecord<FilterValue, FilterParam>>;

export interface UseFetchPaginatedRecords<T extends Record<any, any>, PageNeighbour extends any, FilterValue extends any, FilterParam extends string> {
    exception: any;
    fetching: boolean;
    pagination: PaginatedRecordsFetcherReturnValue<T, PageNeighbour>[1];
    records: T[];
}

export interface UsePaginatedRecords<T extends Record<any, any>, PageNeighbour extends any, FilterValue extends any, FilterParam extends string> extends
    UsePagination,
    Omit<UsePaginatedRecordsFilters<FilterValue, FilterParam>, 'defaultFilters'>,
    Pick<UseFetchPaginatedRecords<T, PageNeighbour, FilterValue, FilterParam>, 'fetching' | 'records'> {}
