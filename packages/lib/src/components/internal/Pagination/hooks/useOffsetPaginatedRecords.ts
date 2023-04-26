import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
    PaginatedRecordsInitOptions,
    RequestPageCallbackParamsWithOffset,
    RequestPageCallbackReturnValue,
    UsePaginatedRecords
} from './types';
import useOffsetPagination from './useOffsetPagination';
import usePaginatedRecordsFilters from './usePaginatedRecordsFilters';
import useBooleanState from '../../../../hooks/useBooleanState';
import useMounted from '../../../../hooks/useMounted';

const useOffsetPaginatedRecords = <T extends Record<any, any>, FilterValue extends string, FilterParam extends string>({
   fetchRecords,
   filterParams = [],
   limit: pageLimit
}: PaginatedRecordsInitOptions<T, boolean, FilterValue, FilterParam>): UsePaginatedRecords<T, boolean, FilterValue, FilterParam> => {
    const [ records, setRecords ] = useState<T[]>([]);
    const [ fetching, updateFetching ] = useBooleanState(false);
    const { defaultFilters, filters, updateFilters, ...filtersProps } = usePaginatedRecordsFilters<FilterValue, FilterParam>(filterParams);

    const $mounted = useMounted();
    const $filtersVersion = useRef(0);
    const filtersVersion = useMemo(() => $filtersVersion.current++ || 1, [filters]);

    const { goto, page, pages, ...paginationProps } = useOffsetPagination(
        useCallback(async (
            pageRequestParams: RequestPageCallbackParamsWithOffset
        ): Promise<RequestPageCallbackReturnValue<boolean>> => {
            try {
                if (!$mounted.current || <undefined>updateFetching(true)) return;

                const [ records, paginationData ] = await fetchRecords({ ...filters, ...pageRequestParams });

                $mounted.current && setRecords(records);
                return { ...paginationData, size: records.length };
            } catch (ex) {
                $mounted.current && setRecords([]);
                throw ex;
            } finally {
                $mounted.current && updateFetching(false);
            }
        }, [filtersVersion]),
        pageLimit
    );

    useEffect(() => {
        $mounted.current && goto(1);
    }, [filtersVersion, pageLimit]);

    return { fetching, filters, goto, page, pages, records, updateFilters, ...filtersProps, ...paginationProps };
};

export default useOffsetPaginatedRecords;
