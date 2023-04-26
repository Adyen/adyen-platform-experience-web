import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { RequestPageCallback, RequestPageCallbackRequiredParams, UsePaginationSetupConfig } from './types';
import useBooleanState from '../../../../hooks/useBooleanState';
import useMounted from '../../../../hooks/useMounted';
import { UsePagination } from '../types';

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

const noop = Object.freeze(() => {});

const usePagination = <PageNeighbour, RequestPageParams extends RequestPageCallbackRequiredParams>(
    paginationSetupConfig: UsePaginationSetupConfig<PageNeighbour, RequestPageParams>,
    requestPageCallback?: RequestPageCallback<PageNeighbour, RequestPageParams>,
    pageLimit: number = DEFAULT_PAGE_LIMIT
): UsePagination => {
    const $controller = useRef<AbortController>();
    const $maxVisitedPage = useRef<number>();
    const $maxVisitedPageSize = useRef<number>();
    const $page = useRef<number>();

    const $mounted = useMounted(useCallback(() => {
        $controller.current?.abort();
        $controller.current = undefined;
    }, []));

    const [ page, setCurrentPage ] = useState($page.current);
    const [ paginationChanged, updatePaginationChanged ] = useBooleanState(false);
    const limit = useMemo(() => Math.max(1, Math.min(MAX_PAGE_LIMIT, pageLimit || DEFAULT_PAGE_LIMIT)), [pageLimit]);

    const { getPageCount, getPageParams, resetPageCount, updatePagination } = paginationSetupConfig;

    const goto = useMemo(() => {
        resetPageCount();
        $maxVisitedPage.current = $maxVisitedPageSize.current = $page.current = undefined;
        $mounted.current && setCurrentPage($page.current);

        return requestPageCallback
            ? (page: number) => {
                if (!Number.isInteger(page)) return;

                const PAGES = getPageCount();
                const requestedPage = page < 0 ? page + PAGES + 1 : page;
                const isValidPageRequest = requestedPage > 0 && (PAGES ? requestedPage <= PAGES : requestedPage === 1);

                if (!isValidPageRequest) return;

                $controller.current?.abort();
                $controller.current = new AbortController();

                if (!$mounted.current) return;

                if (($page.current = requestedPage) > 1 || PAGES) {
                    setCurrentPage($page.current);
                }

                (async () => {
                    const { signal } = $controller.current as AbortController;
                    const params = { ...getPageParams(requestedPage, limit), limit, signal };

                    try {
                        const data = await requestPageCallback(params);
                        if (!data || !$mounted.current) return;

                        const { size, ...paginationData } = data;

                        updatePagination(requestedPage, limit, paginationData);
                        $maxVisitedPage.current = $page.current && Math.max($page.current, $maxVisitedPage.current || -Infinity);

                        if ($page.current && $page.current === $maxVisitedPage.current) $maxVisitedPageSize.current = size;
                        if ($page.current === 1 && size > 0) setCurrentPage($page.current);

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

    const next = useCallback(() => { page && goto(Math.min(page + 1, getPageCount())) }, [goto, page]);
    const prev = useCallback(() => { page && goto(Math.max(page - 1, 1)) }, [goto, page]);
    const pages = useMemo(() => getPageCount() || page || undefined, [goto, paginationChanged]);
    const hasNext = useMemo(() => !!(page && pages) && page < pages, [page, pages]);
    const hasPrev = useMemo(() => !!page && page > 1, [page]);

    const size = useMemo(() => (
        $maxVisitedPage.current && ($maxVisitedPage.current - 1) * limit + ($maxVisitedPageSize.current || 0)
    ), [goto, paginationChanged]);

    const pageSize = useMemo(() => limit && Math.min(limit, size || Infinity), [limit, size]);

    useEffect(() => {
        if ($mounted.current && paginationChanged) {
            updatePaginationChanged(false);
        }
    }, [paginationChanged]);

    return { goto, hasNext, hasPrev, limit, next, page, pages, pageSize, prev, size };
};

export default usePagination;
