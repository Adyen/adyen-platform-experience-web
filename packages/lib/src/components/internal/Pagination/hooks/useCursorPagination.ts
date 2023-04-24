import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { RequestPageCallback, RequestPageCallbackParamsWithCursor } from './types';
import useBooleanState from '../../../../hooks/useBooleanState';
import useMounted from '../../../../hooks/useMounted';
import {
    UsePagination,
    WithNextPageNeighbour,
    WithPageNeighbours,
    WithPrevPageNeighbour
} from '../types';

export type WithEitherPages = WithPageNeighbours<URLSearchParams>;
export type WithNextPage = WithNextPageNeighbour<URLSearchParams>;
export type WithPrevPage = WithPrevPageNeighbour<URLSearchParams>;

const noop = Object.freeze(() => {});
const isParams = (value?: any) => value instanceof URLSearchParams;
export const withNextPage = (value: WithEitherPages): value is WithNextPage => isParams((value as WithNextPage).next);
export const withPrevPage = (value: WithEitherPages): value is WithPrevPage => isParams((value as WithPrevPage).prev);

export const DEFAULT_PAGE_LIMIT = 20;

const useCursorPagination = (
    requestPageCallback?: RequestPageCallback<URLSearchParams, RequestPageCallbackParamsWithCursor>,
    pageLimit: number = DEFAULT_PAGE_LIMIT
): UsePagination => {
    const $controller = useRef<AbortController>();
    const $cursors = useRef<RequestPageCallbackParamsWithCursor['cursor'][]>([]);
    const $maxVisitedPage = useRef<number>();
    const $maxVisitedPageSize = useRef<number>();
    const $page = useRef<number>();

    const $mounted = useMounted(useCallback(() => {
        $controller.current?.abort();
        $controller.current = undefined;
    }, []));

    const [ page, setCurrentPage ] = useState($page.current);
    const [ paginationChanged, updatePaginationChanged ] = useBooleanState(false);
    const limit = useMemo(() => Math.max(1, pageLimit || DEFAULT_PAGE_LIMIT), [pageLimit]);

    const updateCursor = useCallback((params: URLSearchParams, page: number) => {
        const cursor = params.get('cursor') as RequestPageCallbackParamsWithCursor['cursor'];
        const currentCursor = $cursors.current[page - 1];

        if ((page === 1 || page === ($cursors.current.length || 1) + 1) && currentCursor === undefined) {
            $cursors.current[page - 1] = cursor ? decodeURIComponent(cursor) : undefined;
        }
    }, []);

    const goto = useMemo(() => {
        $cursors.current.length = 0;
        $maxVisitedPage.current = $maxVisitedPageSize.current = $page.current = undefined;
        $mounted.current && setCurrentPage($page.current);

        return requestPageCallback
            ? (page: number = 1) => {
                if (!Number.isInteger(page)) return;

                const requestedPage = page < 0
                    ? page + $cursors.current.length + 1
                    : page;

                const isValidPageRequest = requestedPage > 0 && (
                    $cursors.current.length
                        ? requestedPage <= $cursors.current.length
                        : requestedPage === 1
                );

                if (!isValidPageRequest) return;

                $controller.current?.abort();
                $controller.current = new AbortController();

                if (!$mounted.current) return;

                if (($page.current = requestedPage) > 1 || $cursors.current.length) {
                    setCurrentPage($page.current);
                }

                (async () => {
                    const { signal } = $controller.current as AbortController;
                    const cursor = $cursors.current[requestedPage - 1];

                    try {
                        const data = await requestPageCallback({ cursor, limit, signal });

                        if (!data || !$mounted.current) return;
                        if (withNextPage(data)) updateCursor(data.next, requestedPage + 1);
                        if (withPrevPage(data)) updateCursor(data.prev, requestedPage - 1);

                        $maxVisitedPage.current = $page.current && Math.max($page.current, $maxVisitedPage.current || -Infinity);

                        if ($page.current && $page.current === $maxVisitedPage.current) {
                            $maxVisitedPageSize.current = data.size;
                        }

                        if ($page.current === 1 && data.size > 0) {
                            setCurrentPage($page.current);
                        }

                        $page.current = undefined;
                        updatePaginationChanged(true);
                    } catch (ex) {
                        if (signal.aborted) return;
                        console.error(ex); // throw ex;
                    }
                })();
            }
            : noop as UsePagination['goto'];
    }, [limit, requestPageCallback]);

    const next = useCallback(() => { page && goto(Math.min(page + 1, $cursors.current.length)) }, [goto, page]);
    const prev = useCallback(() => { page && goto(Math.max(page - 1, 1)) }, [goto, page]);
    const pages = useMemo(() => $cursors.current.length || page || undefined, [page, paginationChanged]);
    const hasNext = useMemo(() => !!(page && pages) && page < pages, [page, pages]);
    const hasPrev = useMemo(() => !!page && page > 1, [page]);

    const size = useMemo(() => (
        $maxVisitedPage.current && ($maxVisitedPage.current - 1) * limit + ($maxVisitedPageSize.current || 0)
    ), [limit, paginationChanged]);

    const pageSize = useMemo(() => limit && Math.min(limit, size || Infinity), [size]);

    useEffect(() => {
        if ($mounted.current && paginationChanged) {
             updatePaginationChanged(false);
        }
    }, [paginationChanged]);

    return { goto, hasNext, hasPrev, limit, next, page, pages, pageSize, prev, size };
};

export default useCursorPagination;
