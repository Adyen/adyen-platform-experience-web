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
import { UseReactiveStateRecord } from '../../../../hooks/useReactiveStateWithParams/types';

type MaybePromise<T = any> = T | Promise<T>;

export type PaginatedRecordsFetcherParams<FilterValue, FilterParam extends string> = Partial<Record<FilterParam, FilterValue>> &
    Required<WithPaginationLimit> & { signal: AbortSignal };

export type PaginatedRecordsFetcherReturnValue<Pagination extends PaginationType, T> = [T[], WithEitherPages<Pagination>];

export type PaginatedRecordsFetcher<Pagination extends PaginationType, T, FilterValue, FilterParam extends string> = (
    params: PaginatedRecordsFetcherParams<FilterValue, FilterParam>
) => MaybePromise<PaginatedRecordsFetcherReturnValue<Pagination, T>>;

export type RequestPageCallbackRequiredParam = 'limit' | 'signal';
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
    params: RequestPageCallbackParams<Pagination>
) => MaybePromise<RequestPageCallbackReturnValue<Pagination>>;

export type PaginatedRecordsInitOptions<T, DataField extends string, FilterValue, FilterParam extends string> = WithPaginationLimit<{
    data: PaginatedResponseData<T, DataField>;
    dataField: PaginatedResponseDataField<DataField>;
    filterParams?: FilterParam[];
    initialFiltersSameAsDefault?: boolean;
    onPageRequest: (
        pageRequestParams: RequestPageCallbackOptionalParams<PaginationType> & PaginatedRecordsFetcherParams<FilterValue, FilterParam>
    ) => void;
}>;

export type BasePaginatedRecordsInitOptions<T, DataField extends string, FilterValue, FilterParam extends string> = PaginatedRecordsInitOptions<
    T,
    DataField,
    FilterValue,
    FilterParam
> & {
    pagination: PaginationType;
    initializeAndDerivePageLimit?: (
        data: PaginatedRecordsFetcherReturnValue<PaginationType, T>,
        recordsFilters: UsePaginatedRecordsFilters<FilterValue, FilterParam>,
        currentPageLimit: number | undefined
    ) => number | undefined;
};

export type UsePaginatedRecordsFilters<FilterValue, FilterParam extends string> = UseFilters<UseReactiveStateRecord<FilterValue, FilterParam>>;

export interface UsePaginationSetupConfig<Pagination extends PaginationType> {
    getPageCount: () => number;
    resetPageCount: () => void;
    getPageParams: (page: number, limit: number) => RequestPageCallbackOptionalParams<Pagination>;
    updatePagination: (page: number, limit: number, paginationData: PaginatedRecordsFetcherReturnValue<Pagination, any>[1]) => void;
}

export interface UsePaginatedRecords<T, FilterValue, FilterParam extends string>
    extends UsePagination,
        Omit<UsePaginatedRecordsFilters<FilterValue, FilterParam>, 'defaultFilters' | 'filtersVersion'> {
    fetching: boolean;
    records: T[];
}
