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

const isCursorPaginatedResponseData = <T, DataField extends PaginatedResponseDataField>(
    data: PaginatedResponseData<T, DataField>
): data is PaginatedResponseDataWithLinks<T, DataField> => {
    if ((data as PaginatedResponseDataWithLinks<T, DataField>)._links) return true;

    const dataProperties = Object.getOwnPropertyNames(
        data as PaginatedResponseDataWithLinks<T, DataField>
    );

    return offsetPaginatedResponseFields.some(prop => dataProperties.includes(prop));
};

const parseCursorPaginatedResponseData = <T, DataField extends PaginatedResponseDataField>(
    data: PaginatedResponseData<T, DataField>,
    dataField: DataField = 'data' as DataField
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

const parseOffsetPaginatedResponseData = <T, DataField extends PaginatedResponseDataField>(
    data: PaginatedResponseData<T, DataField>,
    dataField: DataField = 'data' as DataField
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

const usePaginatedRecords = <T, DataField extends PaginatedResponseDataField, FilterValue extends string, FilterParam extends string>({
    data,
    dataField = 'data' as DataField,
    filterParams = [],
    initialFiltersSameAsDefault = true,
    limit,
    onPageRequest,
    pagination
}: BasePaginatedRecordsInitOptions<T, DataField, FilterValue, FilterParam>): UsePaginatedRecords<T, FilterValue, FilterParam> => {
    const [ records, setRecords ] = useState<T[]>([]);
    const [ fetching, updateFetching ] = useBooleanState(false);
    const { defaultFilters, filters, updateFilters, ...filtersProps } =
        usePaginatedRecordsFilters<FilterValue, FilterParam>(filterParams, initialFiltersSameAsDefault);

    const $mounted = useMounted();
    const $resolve = useRef<(valueOrReason: any) => void>();
    const $promise = useRef(new Promise<PaginatedRecordsFetcherReturnValue<PaginationType, T>>(resolve => { $resolve.current = resolve }));
    const $filtersVersion = useRef(0);

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
            try {
                if (!$mounted.current || <undefined>updateFetching(true)) return;
                onPageRequest({ ...pageRequestParams, ...filters });

                const [ records, paginationData ] = await $promise.current;

                // postFetchCallback();
                $mounted.current && setRecords(records);
                return { ...paginationData, size: records.length };
            } catch (ex) {
                $mounted.current && setRecords([]);
                throw ex;
            } finally {
                $mounted.current && updateFetching(false);
                $promise.current = new Promise<PaginatedRecordsFetcherReturnValue<PaginationType, T>>(resolve => { $resolve.current = resolve });
            }
        }, [filtersVersion, limit]) as RequestPageCallback<PaginationType>,
        limit
    );

    useEffect(() => {
        $resolve.current && $resolve.current((async () => parsePaginatedResponseData(data, dataField))());
    }, [data]);

    useEffect(() => {
        $mounted.current && goto(1);
    }, [filtersVersion]);

    return { fetching, filters, goto, page, pages, records, updateFilters, ...filtersProps, ...paginationProps };
};

export default usePaginatedRecords;
