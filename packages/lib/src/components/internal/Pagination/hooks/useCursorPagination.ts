import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import { PaginatedRecordsFetcherParams, WithEitherPages, WithNextPage, WithPrevPage } from './types';
import useBooleanState from '../../../../hooks/useBooleanState';
import useMounted from '../../../../hooks/useMounted';
import { UsePagination } from '../types';

type MaybePromise<T extends any = any> = T | Promise<T>;
export type RequestPageCallbackParams = Pick<PaginatedRecordsFetcherParams<any, any>, 'cursor' | 'signal'>;
export type RequestPageCallback = (params: RequestPageCallbackParams) => MaybePromise<WithEitherPages | undefined>;

const noop = Object.freeze(() => {});
const isParams = (value?: any) => value instanceof URLSearchParams;
export const withNextPage = (value: WithEitherPages): value is WithNextPage => isParams((value as WithNextPage).next);
export const withPrevPage = (value: WithEitherPages): value is WithPrevPage => isParams((value as WithPrevPage).prev);

const useCursorPagination = <R extends RequestPageCallback>(requestPageCallback?: R): UsePagination => {
    const $controller = useRef<AbortController>();
    const $cursors = useRef<RequestPageCallbackParams['cursor'][]>([]);
    const $page = useRef<number>();

    const $mounted = useMounted(useCallback(() => {
        $controller.current?.abort();
        $controller.current = undefined;
    }, []));

    const [ paginationChanged, updatePaginationChanged ] = useBooleanState(false);

    const updateCursor = useCallback((params: URLSearchParams, page: number) => {
        const cursor = params.get('cursor') as RequestPageCallbackParams['cursor'];
        const currentCursor = $cursors.current[page - 1];

        if ((page === 1 || page === ($cursors.current.length || 1) + 1) && currentCursor === undefined) {
            $cursors.current[page - 1] = cursor ? decodeURIComponent(cursor) : undefined;
        }
    }, []);

    const goto = useMemo(() => {
        $cursors.current.length = 0;
        $page.current = undefined;

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
                $page.current = requestedPage;

                (async () => {
                    const { signal } = $controller.current as AbortController;
                    const cursor = $cursors.current[requestedPage - 1];

                    try {
                        const data = await requestPageCallback({ cursor, signal });

                        if (!(data && (withNextPage(data) || withPrevPage(data)))) return;
                        if (withNextPage(data)) updateCursor(data.next, requestedPage + 1);
                        if (withPrevPage(data)) updateCursor(data.prev, requestedPage - 1);

                        $mounted.current && updatePaginationChanged(true);
                    } catch (ex) {
                        if (signal.aborted) return;
                        console.error(ex); // throw ex;
                    }
                })();
            }
            : noop as UsePagination['goto'];
    }, [requestPageCallback]);

    const page = useMemo(() => $page.current, [paginationChanged]);
    const next = useCallback(() => { page && goto(page + 1) }, [goto, page]);
    const prev = useCallback(() => { page && goto(page - 1) }, [goto, page]);
    const pages = useMemo(() => $cursors.current.length || page || undefined, [page]);

    useEffect(() => {
        if (paginationChanged) $mounted.current && updatePaginationChanged(false);
        else if (page === $page.current) $page.current = undefined;
    }, [page, paginationChanged]);

    return { goto, next, page, pages, prev };
};

export default useCursorPagination;
