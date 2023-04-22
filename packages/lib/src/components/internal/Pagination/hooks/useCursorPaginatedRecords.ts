import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { PaginatedRecordsFetcher, UsePaginatedRecords } from './types';
import useCursorPagination, { RequestPageCallbackParams, withNextPage, withPrevPage } from './useCursorPagination';
import usePaginatedRecordsFilters from './usePaginatedRecordsFilters';
import useBooleanState from '../../../../hooks/useBooleanState';
import useMounted from '../../../../hooks/useMounted';
import { ReactiveStateUpdateRequestWithField } from '../../../../hooks/useReactiveStateWithParams/types';

const useCursorPaginatedRecords = <T extends Record<any, any>, FilterValue extends string, FilterParam extends string>(
    fetchRecords: PaginatedRecordsFetcher<T, FilterValue, FilterParam>,
    filterParams: FilterParam[] = []
): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    const [ records, setRecords ] = useState<T[]>([]);
    const [ fetching, updateFetching ] = useBooleanState(false);
    const { defaultFilters, filters, updateFilters, ...filtersProps } = usePaginatedRecordsFilters<FilterValue, FilterParam>(filterParams);

    const $mounted = useMounted();
    const $requestedPageAtLeastOnce = useRef(false);
    const $filtersVersion = useRef(0);
    const filtersVersion = useMemo(() => $filtersVersion.current++ || 1, [filters]);

    const { goto, ...paginationProps } = useCursorPagination(
        useCallback(async ({ cursor, signal }: RequestPageCallbackParams) => {
            try {
                if (!$mounted.current || <undefined>updateFetching(true)) return;

                const [ records, paginationData ] = await fetchRecords({ ...filters, cursor, signal });

                if (!$requestedPageAtLeastOnce.current) {
                    const params =
                        (withNextPage(paginationData) && paginationData.next) ||
                        (withPrevPage(paginationData) && paginationData.prev) ||
                        new URLSearchParams();

                    for (const param of filterParams) {
                        const value = params.get(param);
                        updateFilters({
                            [param]: value ? decodeURIComponent(value) : undefined
                        } as ReactiveStateUpdateRequestWithField<FilterValue, FilterParam>);
                    }

                    $requestedPageAtLeastOnce.current = true;
                }

                $mounted.current && setRecords(records);
                return paginationData;
            } catch (ex) {
                $mounted.current && setRecords([]);
                throw ex;
            } finally {
                $mounted.current && updateFetching(false);
            }
        }, [filtersVersion])
    );

    useEffect(goto, [filtersVersion]);

    return { fetching, filters, goto, records, updateFilters, ...filtersProps, ...paginationProps };
};

export default useCursorPaginatedRecords;
