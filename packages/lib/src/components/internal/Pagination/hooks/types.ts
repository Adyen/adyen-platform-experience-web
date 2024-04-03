import {
    ForPaginationType,
    PaginatedResponseData,
    PaginatedResponseDataField,
    PaginationType,
    UseFilters,
    UsePagination,
    WithEitherPages,
    WithPaginationCursor,
    WithPaginationLimit,
    WithPaginationOffset,
    WithPaginationRecordSize,
} from '../types';
import { ReactiveStateRecord, UseReactiveStateRecord } from '@src/hooks/useReactiveState/types';

type MaybePromise<T = any> = T | Promise<T>;

export type PaginatedRecordsFetcherParams<FilterValue, FilterParam extends string> = Partial<Record<FilterParam, FilterValue>> &
    Required<WithPaginationLimit> & {
        page: number;
        signal: AbortSignal;
    };

export type PaginatedRecordsFetcherReturnValue<Pagination extends PaginationType, T> = [T[], WithEitherPages<Pagination>];

export type PaginatedRecordsFetcher<Pagination extends PaginationType, T, FilterValue, FilterParam extends string> = (
    params: PaginatedRecordsFetcherParams<FilterValue, FilterParam>
) => MaybePromise<PaginatedRecordsFetcherReturnValue<Pagination, T>>;

export type RequestPageCallbackRequiredParam = 'limit' | 'page' | 'signal';
export type RequestPageCallbackRequiredParams = Pick<PaginatedRecordsFetcherParams<any, any>, RequestPageCallbackRequiredParam>;

export type RequestPageCallbackParams<Pagination extends PaginationType> = ForPaginationType<Pagination, WithPaginationCursor, WithPaginationOffset> &
    RequestPageCallbackRequiredParams;

type RequestPageCallbackOptionalParams<Pagination extends PaginationType> = Omit<
    RequestPageCallbackParams<Pagination>,
    RequestPageCallbackRequiredParam
>;

export type RequestPageCallbackReturnValue<Pagination extends PaginationType> =
    | (PaginatedRecordsFetcherReturnValue<Pagination, any>[1] & Required<WithPaginationRecordSize>)
    | undefined;

export type RequestPageCallback<Pagination extends PaginationType> = (
    params: RequestPageCallbackParams<Pagination>,
    signal?: AbortSignal
) => MaybePromise<RequestPageCallbackReturnValue<Pagination>>;

export type PaginatedRecordsInitOptions<T, DataField extends string, FilterValue, FilterParam extends string> = {
    dataField: PaginatedResponseDataField<DataField>;
    fetchRecords: (params?: any, signal?: AbortSignal) => Promise<PaginatedResponseData<T, DataField>>;
    filterParams?: ReactiveStateRecord<FilterValue, FilterParam>;
    initialFiltersSameAsDefault?: boolean;
    onFiltersChanged?: (filters: ReactiveStateRecord<FilterValue, FilterParam>) => any;
    onLimitChanged?: (limit: number) => any;
    preferredLimit?: number;
    preferredLimitOptions?: readonly number[];
    enabled: boolean;
};

export type BasePaginatedRecordsInitOptions<T, DataField extends string, FilterValue, FilterParam extends string> = PaginatedRecordsInitOptions<
    T,
    DataField,
    FilterValue,
    FilterParam
> & {
    initialize?: (
        data: PaginatedRecordsFetcherReturnValue<PaginationType, T>,
        recordsFilters: UsePaginatedRecordsFilters<FilterValue, FilterParam>
    ) => any;
    pagination: PaginationType;
};

export type UsePaginatedRecordsFilters<FilterValue, FilterParam extends string> = UseFilters<UseReactiveStateRecord<FilterValue, FilterParam>>;

export interface UsePaginationSetupConfig<Pagination extends PaginationType> {
    getPageCount: () => number;
    resetPageCount: () => void;
    getPageParams: (page: number, limit: number) => RequestPageCallbackOptionalParams<Pagination>;
    updatePagination: (page: number, limit: number, paginationData: PaginatedRecordsFetcherReturnValue<Pagination, any>[1]) => void;
}

export interface UsePaginatedRecords<T, FilterValue, FilterParam extends string>
    extends Omit<UsePagination, 'resetPagination'>,
        Omit<UsePaginatedRecordsFilters<FilterValue, FilterParam>, 'defaultFilters' | 'filtersVersion'> {
    error: Error | undefined;
    fetching: boolean;
    limitOptions: PaginatedRecordsInitOptions<T, any, FilterValue, FilterParam>['preferredLimitOptions'];
    updateLimit: (limit: number) => void;
    records: T[];
}
