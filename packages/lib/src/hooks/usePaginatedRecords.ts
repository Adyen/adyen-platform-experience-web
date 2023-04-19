import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useReactiveObject from './useReactiveObject';
import useBooleanState from './useBooleanState';

export const enum PageNeighbours {
    NEXT = 'next',
    PREV = 'prev',
}

type BothPageNeighbours = { [P in PageNeighbours]: URLSearchParams };
type NextPageNeighbour = Omit<BothPageNeighbours, PageNeighbours.PREV>;
type PrevPageNeighbour = Omit<BothPageNeighbours, PageNeighbours.NEXT>;
type WithNextPageNeighbour = BothPageNeighbours | NextPageNeighbour;
type WithPrevPageNeighbour = BothPageNeighbours | PrevPageNeighbour;

export type WithPageNeighbours = WithNextPageNeighbour | WithPrevPageNeighbour;
export type PaginatedRecordsFetcherParams<Param extends string, Value = any> = { [P in Param]?: Value } & { cursor?: string };
export type PaginatedRecordsFetcher<T, Param extends string, Value = any> = (signal: AbortSignal, params?: PaginatedRecordsFetcherParams<Param, Value>) => Promise<[T[], WithPageNeighbours]>;

const withNextPageNeighbour = (neighbours: WithPageNeighbours): neighbours is WithNextPageNeighbour =>
    (neighbours as WithNextPageNeighbour).next instanceof URLSearchParams;

const withPrevPageNeighbour = (neighbours: WithPageNeighbours): neighbours is WithPrevPageNeighbour =>
    (neighbours as WithPrevPageNeighbour).prev instanceof URLSearchParams;

const usePaginatedRecords = <Record, Param extends string>(fetchRecords: PaginatedRecordsFetcher<Record, Param, string>, filterParams: Param[] = []) => {
    const CONTROLLER = useRef(new AbortController());
    const CURSORS = useRef<(string | undefined)[]>([]);
    const PAGE = useRef<number | null>(null);

    const [ needsRefresh, updateNeedsRefresh ] = useBooleanState(false);
    const [ fetching, updateFetching ] = useBooleanState(false);
    const [ hasNext, updateHasNext ] = useBooleanState(false);
    const [ hasPrev, updateHasPrev ] = useBooleanState(false);
    const [ currentPage, setCurrentPage ] = useState(0);
    const [ page, setPage ] = useState(1);
    const [ records, setRecords ] = useState<Record[]>([]);
    const [ filters, filtersVersion ] = useReactiveObject<Param, string>(filterParams);
    const [ defaultFilters, setDefaultFilters ] = useState<Readonly<{[P in Param]?: string}> | null>(null);

    const goto = useCallback((page: number) => {
        if (page !== 1 && CURSORS.current[page - 1] == undefined) throw new RangeError();
        else setCurrentPage(page - 1);
    }, []);

    const getFilter = useCallback((filter: Param) => filters[filter], [filters]);

    const updateFilter = useCallback((filter: Param, value: string | undefined) => {
        filters[filter] = (value || undefined) ?? defaultFilters?.[filter];
    }, [defaultFilters, filters]);

    const updateWithSearchParams = useCallback((neighbour: URLSearchParams, page: number) => {
        const currentCursor = neighbour.get('cursor');
        const existingCursor = CURSORS.current[page];

        if ((page === 0 || page === (CURSORS.current.length || 1)) && existingCursor === undefined)
            CURSORS.current[page] = currentCursor ? decodeURIComponent(currentCursor) : undefined;

        for (const param of filterParams) {
            const value = neighbour.get(param);
            updateFilter(param, value ? decodeURIComponent(value) : undefined);
        }
    }, [filters, filterParams]);

    const updateState = useCallback((records: Record[], page: number) => {
        setPage(page);
        setRecords(records);
        updateHasNext(page < CURSORS.current.length);
        updateHasPrev(page > 1);

        if (!defaultFilters) setDefaultFilters(Object.freeze({...filters}));
    }, [defaultFilters, filters]);

    const navigate = useCallback((neighbour: PageNeighbours) => {
        try {
            if (neighbour === PageNeighbours.NEXT && hasNext) goto(page + 1);
            else if (neighbour === PageNeighbours.PREV && hasPrev) goto(page - 1);
        } catch (e) { console.error(e); }
    }, [hasNext, hasPrev, page]);

    const canResetFilters = useMemo(() => {
        if (defaultFilters) {
            for (const [filter, value] of Object.entries(defaultFilters))
                if (value !== filters[filter as Param]) return true;
        }
        return false;
    }, [defaultFilters, filters, filtersVersion]);

    const resetFilters = useCallback(() => {
        if (!defaultFilters) return;
        for (const filter of Object.keys(defaultFilters))
            updateFilter(filter as Param, undefined);
    }, [defaultFilters, updateFilter]);

    const fetchRecordsIfNecessary = useCallback(async (currentPage: number) => {
        if (!needsRefresh) return;

        try {
            CONTROLLER.current.abort();
            CONTROLLER.current = new AbortController();
            updateFetching(true);
            updateNeedsRefresh(false);

            const [records, neighbours] = await fetchRecords(
                CONTROLLER.current.signal,
                {...filters, cursor: CURSORS.current[currentPage]}
            );

            if (withNextPageNeighbour(neighbours)) updateWithSearchParams(neighbours.next, currentPage + 1);
            if (withPrevPageNeighbour(neighbours)) updateWithSearchParams(neighbours.prev, currentPage - 1);

            updateState(records, currentPage + 1);
        } catch (e) {
            updateState([], currentPage + 1);
            console.error(e);
            // throw e;
        } finally {
            PAGE.current = currentPage;
            updateFetching(false);
        }
    }, [fetchRecords, filters, needsRefresh, updateState, updateWithSearchParams]);

    useEffect(() => {
        if (filtersVersion > 1) {
            PAGE.current = null;
            CURSORS.current.length = 0;

            setPage(1);
            setRecords([]);
            updateFetching(false);
            updateHasNext(false);
            updateHasPrev(false);
            setCurrentPage(0);
            updateNeedsRefresh(true);
        }
    }, [filtersVersion]);

    useEffect(() => {
        if (PAGE.current === null || PAGE.current !== currentPage) {
            updateNeedsRefresh(true);
        }
    }, [currentPage]);

    useEffect(() => {
        (async () => fetchRecordsIfNecessary(currentPage))();
    }, [currentPage, fetchRecordsIfNecessary]);

    return { canResetFilters, fetching, getFilter, hasNext, hasPrev, navigate, page, records, resetFilters, updateFilter };
};

export default usePaginatedRecords;
