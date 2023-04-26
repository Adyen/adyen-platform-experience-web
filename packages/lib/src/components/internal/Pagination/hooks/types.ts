import {
    UseFilters,
    UsePagination,
    WithPageNeighbours,
    WithPaginationCursor,
    WithPaginationLimit,
    WithPaginationOffset,
    WithPaginationRecordSize
} from '../types';
import { UseReactiveStateRecord } from '../../../../hooks/useReactiveStateWithParams/types';

type MaybePromise<T = any> = T | Promise<T>;

export type PaginatedRecordsFetcherParams<FilterValue, FilterParam extends string> =
    Partial<Record<FilterParam, FilterValue>> &
    Required<WithPaginationLimit> &
    { signal: AbortSignal };

export type PaginatedRecordsFetcherReturnValue<T extends Record<any, any>, PageNeighbour> =
    [T[], WithPageNeighbours<PageNeighbour>];

export type PaginatedRecordsFetcher<T extends Record<any, any>, PageNeighbour, FilterValue, FilterParam extends string> =
    (params: PaginatedRecordsFetcherParams<FilterValue, FilterParam>) => MaybePromise<PaginatedRecordsFetcherReturnValue<T, PageNeighbour>>;

export type RequestPageCallbackRequiredParam = 'limit' | 'signal';
export type RequestPageCallbackRequiredParams = Pick<PaginatedRecordsFetcherParams<any, any>, RequestPageCallbackRequiredParam>;
export type RequestPageCallbackParamsWithCursor = RequestPageCallbackRequiredParams & WithPaginationCursor;
export type RequestPageCallbackParamsWithOffset = RequestPageCallbackRequiredParams & WithPaginationOffset;

export type RequestPageCallbackOptionalParams<RequestPageParams extends RequestPageCallbackRequiredParams> =
    Omit<RequestPageParams, RequestPageCallbackRequiredParam>;

export type RequestPageCallbackReturnValue<PageNeighbour> = (
    PaginatedRecordsFetcherReturnValue<any, PageNeighbour>[1] &
    Required<WithPaginationRecordSize>
) | undefined;

export type RequestPageCallback<PageNeighbour, RequestPageParams extends RequestPageCallbackRequiredParams> = (
    params: RequestPageCallbackOptionalParams<RequestPageParams> & RequestPageCallbackRequiredParams
) => MaybePromise<RequestPageCallbackReturnValue<PageNeighbour>>;

export type PaginatedRecordsInitOptions<T extends Record<any, any>, PageNeighbour, FilterValue, FilterParam extends string> =
    WithPaginationLimit<{
        fetchRecords: PaginatedRecordsFetcher<T, PageNeighbour, FilterValue, FilterParam>;
        filterParams?: FilterParam[];
    }>;

export type UsePaginatedRecordsFilters<FilterValue, FilterParam extends string> =
    UseFilters<UseReactiveStateRecord<FilterValue, FilterParam>>;

export interface UseFetchPaginatedRecords<T extends Record<any, any>, PageNeighbour> {
    exception: any;
    fetching: boolean;
    pagination: PaginatedRecordsFetcherReturnValue<T, PageNeighbour>[1];
    records: T[];
}

export interface UsePaginationSetupConfig<PageNeighbour, RequestPageParams extends RequestPageCallbackRequiredParams> {
    getPageCount: () => number;
    resetPageCount: () => void;
    getPageParams: (page: number, limit: number) => RequestPageCallbackOptionalParams<RequestPageParams>;
    updatePagination: (page: number, limit: number, paginationData: PaginatedRecordsFetcherReturnValue<any, PageNeighbour>[1]) => void;
}

export interface UsePaginatedRecords<T extends Record<any, any>, PageNeighbour, FilterValue, FilterParam extends string> extends
    UsePagination,
    Omit<UsePaginatedRecordsFilters<FilterValue, FilterParam>, 'defaultFilters'>,
    Pick<UseFetchPaginatedRecords<T, PageNeighbour>, 'fetching' | 'records'> {}
