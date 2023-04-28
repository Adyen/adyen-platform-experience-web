// import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { PaginatedRecordsInitOptions, UsePaginatedRecords } from './types';
// import { withNextPage, withPrevPage } from './useCursorPagination';
// import { ReactiveStateUpdateRequestWithField } from '../../../../hooks/useReactiveStateWithParams/types';
import { PaginatedResponseDataField, PaginationType } from '../types';
import usePaginatedRecords from './usePaginatedRecords';

const useCursorPaginatedRecords = <T, DataField extends PaginatedResponseDataField, FilterValue extends string, FilterParam extends string>(
    initOptions: PaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>
): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    return usePaginatedRecords<T, DataField, FilterValue, FilterParam>({
        ...initOptions,
        pagination: PaginationType.CURSOR
    });
};

// const useCursorPaginatedRecords = <T, FilterValue extends string, FilterParam extends string>({
//    fetchRecords,
//    filterParams = [],
//    limit: pageLimit
// }: PaginatedRecordsInitOptions<T, URLSearchParams, FilterValue, FilterParam>): UsePaginatedRecords<T, URLSearchParams, FilterValue, FilterParam> => {
//     const [ records, setRecords ] = useState<T[]>([]);
//     const [ fetching, updateFetching ] = useBooleanState(false);
//     const { defaultFilters, filters, updateFilters, ...filtersProps } = usePaginatedRecordsFilters<FilterValue, FilterParam>(filterParams, false);
//
//     const $mounted = useMounted();
//     const $requestedPageAtLeastOnce = useRef(false);
//     const $filtersVersion = useRef(0);
//     const filtersVersion = useMemo(() => $filtersVersion.current++ || 1, [filters]);
//
//     const { goto, page, pages, ...paginationProps } = useCursorPagination(
//         useCallback(async (
//             pageRequestParams: RequestPageCallbackParamsWithCursor
//         ): Promise<RequestPageCallbackReturnValue<URLSearchParams>> => {
//             try {
//                 if (!$mounted.current || <undefined>updateFetching(true)) return;
//
//                 const [ records, paginationData ] = await fetchRecords({ ...filters, ...pageRequestParams });
//
//                 if (!$requestedPageAtLeastOnce.current) {
//                     const params =
//                         (withNextPage(paginationData) && paginationData.next) ||
//                         (withPrevPage(paginationData) && paginationData.prev) ||
//                         new URLSearchParams();
//
//                     for (const param of filterParams) {
//                         const value = params.get(param);
//                         updateFilters({
//                             [param]: value ? decodeURIComponent(value) : undefined
//                         } as ReactiveStateUpdateRequestWithField<FilterValue, FilterParam>);
//                     }
//
//                     $requestedPageAtLeastOnce.current = true;
//                 }
//
//                 $mounted.current && setRecords(records);
//                 return { ...paginationData, size: records.length };
//             } catch (ex) {
//                 $mounted.current && setRecords([]);
//                 throw ex;
//             } finally {
//                 $mounted.current && updateFetching(false);
//             }
//         }, [filtersVersion]),
//         pageLimit
//     );
//
//     useEffect(() => {
//         $mounted.current && goto(1);
//     }, [filtersVersion, pageLimit]);
//
//     return { fetching, filters, goto, page, pages, records, updateFilters, ...filtersProps, ...paginationProps };
// };

export default useCursorPaginatedRecords;
