import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
    BasePaginatedRecordsInitOptions,
    PaginatedRecordsFetcherReturnValue,
    RequestPageCallback,
    RequestPageCallbackParams,
    RequestPageCallbackReturnValue,
    UsePaginatedRecords,
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
    WithEitherPages,
} from '../types';

const pageNeighbours = [PageNeighbour.NEXT, PageNeighbour.PREV] as const;
const offsetPaginatedResponseFields = ['hasNext', 'hasPrevious'] as const;

const isCursorPaginatedResponseData = <T, DataField extends string>(
    data: PaginatedResponseData<T, DataField>
): data is PaginatedResponseDataWithLinks<T, DataField> => {
    if ((data as PaginatedResponseDataWithLinks<T, DataField>)._links) return true;

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
            [PageNeighbour.PREV]: hasPrevious === true,
        } as WithEitherPages<PaginationType.OFFSET>;

        return [records, paginationData];
    }

    throw new TypeError('MALFORMED_PAGINATED_DATA');
};

const createAwaitable = <T>() => {
    let $resolve: (valueOrReason: any) => void;
    let $promise: Promise<PaginatedRecordsFetcherReturnValue<PaginationType, T>>;

    (async function refresh(): Promise<void> {
        try {
            await ($promise = new Promise(resolve => {
                $resolve = resolve;
            }));
        } catch {
            /**
             * Ignore the promise rejection — the goal is to guarantee that a new pending promise is created in its
             * place the moment it is settled. The rejection will be handled later at the usage site of the promise.
             */
        }
        return refresh();
    })();

    return Object.create(null, {
        promise: { get: () => $promise },
        resolve: { get: () => $resolve },
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
    pagination,
    fetchRecords,
}: BasePaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    const [pageLimit, setPageLimit] = useState(data?.[dataField]?.length ?? limit);
    const [records, setRecords] = useState<T[]>([]);
    const [fetching, updateFetching] = useBooleanState(true);
    const [shouldRefresh, updateShouldRefresh] = useBooleanState(false);

    const $mounted = useMounted();
    const $initialFetchInProgress = useRef(true);
    const $awaitable = useRef(createAwaitable<T>());
    const $recordsFilters = usePaginatedRecordsFilters<FilterValue, FilterParam>(filterParams, initialFiltersSameAsDefault);

    const { defaultFilters, filters, filtersVersion, updateFilters, ...filtersProps } = $recordsFilters;

    const [parsePaginatedResponseData, usePagination] = useMemo(
        () =>
            pagination === PaginationType.CURSOR
                ? [parseCursorPaginatedResponseData, useCursorPagination]
                : [parseOffsetPaginatedResponseData, useOffsetPagination],
        []
    );

    const { goto, page, pages, ...paginationProps } = usePagination(
        useCallback(
            async (pageRequestParams: RequestPageCallbackParams<PaginationType>): Promise<RequestPageCallbackReturnValue<PaginationType>> => {
                try {
                    if (!$mounted.current || <undefined>updateFetching(true)) return;
                    if (!$initialFetchInProgress.current) onPageRequest({ ...pageRequestParams, ...filters });

                    const [records, paginationData] = await fetchRecords({ ...filters, ...pageRequestParams });
                    if ($initialFetchInProgress.current) {
                        const derivedPageLimit =
                            initializeAndDerivePageLimit?.(
                                [records, paginationData] as PaginatedRecordsFetcherReturnValue<PaginationType, T>,
                                $recordsFilters,
                                pageLimit
                            ) || pageLimit;

                        setPageLimit(derivedPageLimit);
                        $initialFetchInProgress.current = false;
                    }

                    if ($mounted.current) {
                        setRecords(records);
                        updateFetching(false);
                    }

                    return { ...paginationData, size: records.length };
                } catch (err) {
                    console.error(err);
                }
            },
            [filtersVersion, pageLimit]
        ) as RequestPageCallback<PaginationType>,
        pageLimit
    );

    useEffect(() => {
        if (shouldRefresh) updateShouldRefresh(false);
        else goto(1);
    }, [goto, shouldRefresh]);

    useEffect(() => $awaitable.current.resolve((async () => parsePaginatedResponseData(data, dataField))()), [data]);

    return { fetching, filters, goto, page, pages, records, updateFilters, ...filtersProps, ...paginationProps };
};

export default usePaginatedRecords;
