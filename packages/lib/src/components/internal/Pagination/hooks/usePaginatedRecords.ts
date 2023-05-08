import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
    BasePaginatedRecordsInitOptions,
    PaginatedRecordsFetcherReturnValue,
    RequestPageCallback,
    RequestPageCallbackParams,
    RequestPageCallbackReturnValue,
    UsePaginatedRecords
} from './types';
import useCursorPagination from './useCursorPagination';
import useOffsetPagination from './useOffsetPagination';
import usePaginatedRecordsFilters from './usePaginatedRecordsFilters';
import useBooleanState from '../../../../hooks/useBooleanState';
import useMounted from '../../../../hooks/useMounted';
import {
    PageNeighbour,
    PaginatedResponseData,
    PaginatedResponseDataField,
    PaginatedResponseDataLink,
    PaginatedResponseDataWithLinks,
    PaginationType,
    WithEitherPages
} from '../types';

const pageNeighbours = [PageNeighbour.NEXT, PageNeighbour.PREV] as const;
const offsetPaginatedResponseFields = ['hasNext', 'hasPrevious'] as const;

const isCursorPaginatedResponseData = <T, DataField extends string>(
    data: PaginatedResponseData<T, DataField>
): data is PaginatedResponseDataWithLinks<T, DataField> => {
    if ((data as PaginatedResponseDataWithLinks<T, DataField>)._links) return true;

    const dataProperties = Object.getOwnPropertyNames(
        data as PaginatedResponseDataWithLinks<T, DataField>
    );

    return offsetPaginatedResponseFields.some(prop => dataProperties.includes(prop));
};

const parseCursorPaginatedResponseData = <T, DataField extends string>(
    data: PaginatedResponseData<T, DataField>,
    dataField: PaginatedResponseDataField<DataField> = 'data' as PaginatedResponseDataField<DataField>
) => {
    const records = data[dataField] as T[];

    if (isCursorPaginatedResponseData<T, DataField>(data)) {
        const paginationData = Object.fromEntries(
            (Object.entries(data._links || {}) as [PageNeighbour, PaginatedResponseDataLink][])
                .filter(([neighbour, link]) => pageNeighbours.includes(neighbour as PageNeighbour) && link)
                .map(([neighbour, { href }]) => [neighbour, new URL(href).searchParams])
        ) as WithEitherPages<PaginationType.CURSOR>;

        return [records, paginationData];
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
            [PageNeighbour.PREV]: hasPrevious === true
        } as WithEitherPages<PaginationType.OFFSET>;

        return [records, paginationData];
    }

    throw new TypeError('MALFORMED_PAGINATED_DATA');
};

const createAwaitable = <T>() => {
    let $resolve: (valueOrReason: any) => void;
    let $promise: Promise<PaginatedRecordsFetcherReturnValue<PaginationType, T>>;

    (async function refresh(): Promise<void> {
        try { await ($promise = new Promise(resolve => { $resolve = resolve })) }
        finally { return refresh() }
    })();

    return Object.create(null, {
        promise: { get: () => $promise },
        resolve: { get: () => $resolve }
    }) as {
        promise: Promise<PaginatedRecordsFetcherReturnValue<PaginationType, T>>;
        resolve: (valueOrReason: any) => void;
    };
};

const usePaginatedRecords = <T, DataField extends string, FilterValue extends string, FilterParam extends string>({
    data,
    dataField = 'data' as PaginatedResponseDataField<DataField>,
    filterParams = [],
    initialFiltersSameAsDefault = true,
    initializeAndDerivePageLimit,
    limit,
    onPageRequest,
    pagination
}: BasePaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    const [ pageLimit, setPageLimit ] = useState(limit);
    const [ records, setRecords ] = useState<T[]>([]);
    const [ fetching, updateFetching ] = useBooleanState(true);
    const [ shouldRefresh, updateShouldRefresh ] = useBooleanState(false);

    const $mounted = useMounted();
    const $initialFetchInProgress = useRef(true);
    const $awaitable = useRef(createAwaitable<T>());
    const $filtersVersion = useRef(0);
    const $recordsFilters = usePaginatedRecordsFilters<FilterValue, FilterParam>(filterParams, initialFiltersSameAsDefault);

    const { defaultFilters, filters, updateFilters, ...filtersProps } = $recordsFilters;
    const filtersVersion = useMemo(() => $filtersVersion.current++ || 1, [filters]);

    const [ parsePaginatedResponseData, usePagination ] = useMemo(() => (
        pagination === PaginationType.CURSOR
            ? [ parseCursorPaginatedResponseData, useCursorPagination ]
            : [ parseOffsetPaginatedResponseData, useOffsetPagination ]
    ), []);

    const { goto, page, pages, ...paginationProps } = usePagination(
        useCallback(async (
            pageRequestParams: RequestPageCallbackParams<PaginationType>
        ): Promise<RequestPageCallbackReturnValue<PaginationType>> => {
            let records: T[] = [];
            let paginationData = {} as WithEitherPages<PaginationType>;
            let willRefresh = false;

            try {
                if (!$mounted.current || <undefined>updateFetching(true)) return;
                if (!$initialFetchInProgress.current) onPageRequest({...pageRequestParams, ...filters});

                [ records, paginationData ] = await $awaitable.current.promise;

                if ($initialFetchInProgress.current) {
                    try {
                        const derivedPageLimit = initializeAndDerivePageLimit?.(
                            [records, paginationData] as PaginatedRecordsFetcherReturnValue<PaginationType, T>,
                            $recordsFilters,
                            pageLimit
                        ) || pageLimit;

                        setPageLimit(derivedPageLimit);

                        if (derivedPageLimit !== records.length) {
                            updateShouldRefresh(willRefresh = true);
                            return;
                        }
                    } catch (ex) {
                        console.error(ex); /* throw ex; */
                    } finally {
                        $initialFetchInProgress.current = false;
                    }
                }

                return { ...paginationData, size: records.length };
            } finally {
                if ($mounted.current) {
                    setRecords(records);
                    updateFetching(willRefresh);
                }
            }
        }, [filtersVersion, pageLimit]) as RequestPageCallback<PaginationType>,
        pageLimit
    );

    useEffect(() => {
        if (shouldRefresh) updateShouldRefresh(false);
        else goto(1);
    }, [goto, shouldRefresh]);

    useEffect(() => $awaitable.current.resolve(
        (async () => parsePaginatedResponseData(data, dataField))()
    ), [data]);

    return { fetching, filters, goto, page, pages, records, updateFilters, ...filtersProps, ...paginationProps };
};

export default usePaginatedRecords;
