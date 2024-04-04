import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import {
    BasePaginatedRecordsInitOptions,
    PaginatedRecordsFetcherReturnValue,
    RequestPageCallback,
    RequestPageCallbackParams,
    RequestPageCallbackReturnValue,
    UsePaginatedRecords,
} from './types';
import usePageLimit from './usePageLimit';
import useCursorPagination from './useCursorPagination';
import useOffsetPagination from './useOffsetPagination';
import usePaginatedRecordsFilters from './usePaginatedRecordsFilters';
import useBooleanState from '@src/hooks/useBooleanState';
import useMounted from '@src/hooks/useMounted';
import {
    PageNeighbour,
    PaginatedResponseData,
    PaginatedResponseDataField,
    PaginatedResponseDataWithLinks,
    PaginationType,
    WithEitherPages,
} from '../types';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';

const pageNeighbours = [PageNeighbour.NEXT, PageNeighbour.PREV] as const;
const offsetPaginatedResponseFields = ['hasNext', 'hasPrevious'] as const;

const isCursorPaginatedResponseData = <T, DataField extends string>(
    data: PaginatedResponseData<T, DataField>
): data is PaginatedResponseDataWithLinks<T, DataField> => {
    const dataProperties = Object.getOwnPropertyNames(data as PaginatedResponseDataWithLinks<T, DataField>);
    return !offsetPaginatedResponseFields.some(prop => dataProperties.includes(prop));
};

const parseCursorPaginatedResponseData = <T, DataField extends string>(
    data: PaginatedResponseData<T, DataField>,
    dataField: PaginatedResponseDataField<DataField> = 'data' as PaginatedResponseDataField<DataField>
) => {
    const records = data[dataField] as T[];

    if (isCursorPaginatedResponseData<T, DataField>(data)) {
        const paginationData = Object.fromEntries(
            (Object.entries(data || EMPTY_OBJECT) as [PageNeighbour, string][]).filter(
                ([neighbour, cursor]) => pageNeighbours.includes(neighbour as PageNeighbour) && cursor
            )
        ) as WithEitherPages<PaginationType.CURSOR>;

        return { records, paginationData };
    }

    throw new TypeError('MALFORMED_PAGINATED_DATA');
};

const parseOffsetPaginatedResponseData = <T, DataField extends string>(
    data: PaginatedResponseData<T, DataField>,
    dataField: PaginatedResponseDataField<DataField> = 'data' as PaginatedResponseDataField<DataField>
) => {
    const records = data[dataField] as T[];

    if (!isCursorPaginatedResponseData<T, DataField>(data)) {
        const { hasNext, hasPrevious } = data;

        const paginationData = {
            [PageNeighbour.NEXT]: hasNext === true,
            [PageNeighbour.PREV]: hasPrevious === true,
        } as WithEitherPages<PaginationType.OFFSET>;

        return { records, paginationData };
    }

    throw new TypeError('MALFORMED_PAGINATED_DATA');
};

const usePaginatedRecords = <T, DataField extends string, FilterValue extends string, FilterParam extends string>({
    dataField = 'data' as PaginatedResponseDataField<DataField>,
    fetchRecords,
    filterParams = EMPTY_OBJECT,
    initialFiltersSameAsDefault = true,
    initialize,
    onFiltersChanged,
    onLimitChanged,
    pagination,
    preferredLimit,
    preferredLimitOptions,
    enabled,
}: BasePaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    const [records, setRecords] = useState<T[]>([]);
    const [fetching, updateFetching] = useBooleanState(true);
    const [error, setError] = useState<AdyenPlatformExperienceError>();
    const [preferredPageLimit, setPreferredPageLimit] = useState(preferredLimit);

    const $mounted = useMounted();
    const $initialFetchInProgress = useRef(true);
    const $lastRequestedPage = useRef(1);
    const $recordsFilters = usePaginatedRecordsFilters<FilterValue, FilterParam>(filterParams, initialFiltersSameAsDefault);

    const { limit, limitOptions } = usePageLimit({ preferredLimit: preferredPageLimit, preferredLimitOptions });
    const { defaultFilters, filters, updateFilters, ...filtersProps } = $recordsFilters;

    const [parsePaginatedResponseData, usePagination] = useMemo(
        () =>
            pagination === PaginationType.CURSOR
                ? [parseCursorPaginatedResponseData, useCursorPagination]
                : [parseOffsetPaginatedResponseData, useOffsetPagination],
        []
    );

    const updateLimit = useCallback((limit: number) => setPreferredPageLimit(limit), []);

    const { goto, page, pages, resetPagination, ...paginationProps } = usePagination(
        useCallback(
            async (
                { page, ...pageRequestParams }: RequestPageCallbackParams<PaginationType>,
                signal?: AbortSignal
            ): Promise<RequestPageCallbackReturnValue<PaginationType>> => {
                try {
                    setError(undefined);
                    $lastRequestedPage.current = page;

                    if (!$mounted.current || <undefined>updateFetching(true)) return;

                    const res = await fetchRecords({ ...pageRequestParams, ...filters }, signal);
                    const { records, paginationData } = parsePaginatedResponseData<T, DataField>(res, dataField);

                    if ($initialFetchInProgress.current) {
                        initialize?.([records, paginationData] as PaginatedRecordsFetcherReturnValue<PaginationType, T>, $recordsFilters);
                        $initialFetchInProgress.current = false;
                    }

                    if ($mounted.current) {
                        setRecords(records);
                        updateFetching(false);
                    }

                    return { ...paginationData, size: records?.length };
                } catch (err) {
                    // TODO - Handle signal abortion and updateFetching
                    if (signal?.aborted) return;
                    updateFetching(false);
                    setError(err as AdyenPlatformExperienceError);

                    console.error(err);
                }
            },
            [fetchRecords, filters, limit]
        ) as RequestPageCallback<PaginationType>,
        limit
    );

    useMemo(() => {
        $initialFetchInProgress.current = true;
        /* eslint-disable-next-line */
    }, [filterParams]);

    useMemo(() => {
        resetPagination();
        $lastRequestedPage.current = 1;
        /* eslint-disable-next-line */
    }, [filters, limit, resetPagination]);

    useEffect(() => {
        if (enabled) goto($lastRequestedPage.current);
    }, [goto, enabled]);

    useEffect(() => {
        onFiltersChanged?.(filters);
    }, [filters]);

    useEffect(() => {
        onLimitChanged?.(limit);
    }, [limit]);

    return { error, fetching, filters, goto, limitOptions, page, pages, records, updateFilters, updateLimit, ...filtersProps, ...paginationProps };
};

export default usePaginatedRecords;
