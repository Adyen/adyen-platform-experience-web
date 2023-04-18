import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useBooleanState from './useBooleanState';

export const enum PageNeighbours {
    NEXT = 'next',
    PREV = 'prev',
}

type BothPartialRecordSetPageNeighbours = {
    [K in PageNeighbours]: URLSearchParams;
};

type NextPartialRecordSetPageNeighbour = Omit<BothPartialRecordSetPageNeighbours, PageNeighbours.PREV>;
type PrevPartialRecordSetPageNeighbour = Omit<BothPartialRecordSetPageNeighbours, PageNeighbours.NEXT>;

type WithNextPageNeighbour = BothPartialRecordSetPageNeighbours | NextPartialRecordSetPageNeighbour;
type WithPrevPageNeighbour = BothPartialRecordSetPageNeighbours | PrevPartialRecordSetPageNeighbour;

export type PartialRecordSetPageNeighbours = WithNextPageNeighbour | WithPrevPageNeighbour;
export type PartialRecordSetFetcher<T> = (cursor?: string | null) => Promise<[T[], PartialRecordSetPageNeighbours]>;

const withNextPage = (neighbours: PartialRecordSetPageNeighbours): neighbours is WithNextPageNeighbour =>
    (neighbours as WithNextPageNeighbour).next instanceof URLSearchParams;

const withPrevPage = (neighbours: PartialRecordSetPageNeighbours): neighbours is WithPrevPageNeighbour =>
    (neighbours as WithPrevPageNeighbour).prev instanceof URLSearchParams;

const useReactiveRecordParams = <P extends string, T = any>(reactiveParams: P[]) => {
    const [ hasPendingUpdate,, toggleHasPendingUpdate ] = useBooleanState(false);
    const paramsValueSnapshot = useRef<{[K in P]?: T}>({});

    const params = useMemo(() => {
        const params: {[K in P]?: T} = Object.create(null);
        const pendingUpdateBlocks = [0];

        let counter = 0;

        for (let index = 0, len = reactiveParams.length; index < len; index++) {
            const param = reactiveParams[index] as P;
            const block = Math.floor(index / 31);
            const bitmask = 1 << (index % 31);

            let value: T | undefined;

            if (pendingUpdateBlocks[block] === undefined) {
                pendingUpdateBlocks[block] = 0;
            }

            Object.defineProperty(params, param, {
                enumerable: true,
                get: () => value,
                set: (updateValue?: T) => {
                    (value = updateValue) === paramsValueSnapshot.current[param]
                        ? (pendingUpdateBlocks[block] &= ~bitmask)
                        : (pendingUpdateBlocks[block] |= bitmask);

                    const count = counter++;

                    new Promise(resolve => setTimeout(resolve, 100)).then(() => {
                        if (count === counter && pendingUpdateBlocks.some(int => int)) {
                            toggleHasPendingUpdate();
                            paramsValueSnapshot.current = {...params};
                            pendingUpdateBlocks.fill(0);
                            counter = 0;
                            console.log('here...');
                        }
                    });
                },
            });
        }

        return Object.seal(params);
    }, [reactiveParams, toggleHasPendingUpdate]);

    useEffect(() => {
        if (hasPendingUpdate) {
            console.log('fired...');
            toggleHasPendingUpdate();
        }
    }, [hasPendingUpdate, toggleHasPendingUpdate]);

    return params;
};

const usePartialRecordSet = <T, P extends string>(fetchPartialRecordSet: PartialRecordSetFetcher<T>, reactiveParams: P[] = []) => {
    const CURSORS = useRef<(string | null)[]>([null]);
    const params = useReactiveRecordParams<P, string>(reactiveParams);

    const [ hasNext, updateHasNext ] = useBooleanState(false);
    const [ hasPrev, updateHasPrev ] = useBooleanState(false);
    const [ currentPage, setCurrentPage ] = useState(0);
    const [ page, setPage ] = useState(currentPage + 1);
    const [ records, setRecords ] = useState<T[]>([]);

    const goto = useCallback((page: number) => {
        if (page !== 1 && CURSORS.current[page - 1] == undefined) throw 'No records for given page';
        else setCurrentPage(page - 1);
    }, [setCurrentPage]);

    const setCursor = useCallback((neighbour: URLSearchParams, page: number) => {
        const currentCursor = neighbour.get('cursor');
        const existingCursor = CURSORS.current[page];
        if ((page === 0 || page === CURSORS.current.length) && existingCursor == undefined)
            CURSORS.current[page] = currentCursor;
    }, []);

    const update = useCallback((records: T[]) => {
        const page = currentPage + 1;
        setPage(page);
        updateHasNext(page < CURSORS.current.length);
        updateHasPrev(page > 1);
        setRecords(records);
    }, [currentPage, setPage, setRecords, updateHasNext, updateHasPrev]);

    useEffect(() => {
        (async () => {
            try {
                const [records, neighbours] = await fetchPartialRecordSet(CURSORS.current[currentPage]);
                if (withNextPage(neighbours)) setCursor(neighbours.next, currentPage + 1);
                if (withPrevPage(neighbours)) setCursor(neighbours.prev, currentPage - 1);
                update(records);
            } catch (e) {
                update([]);
                throw e;
            }
        })();
    }, [currentPage, fetchPartialRecordSet, setCurrentPage, setCursor, update]);

    return { goto, hasNext, hasPrev, page, params, records };
};

export default usePartialRecordSet;
