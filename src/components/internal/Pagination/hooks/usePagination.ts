import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { RequestPageCallback, RequestPageCallbackParams, UsePaginationSetupConfig } from './types';
import useBooleanState from '../../../../hooks/useBooleanState';
import useMounted from '../../../../hooks/useMounted';
import { PaginationType, UsePagination } from '../types';
import { getClampedPageLimit } from '../utils';
import { noop } from '../../../../utils';

const usePagination = <Pagination extends PaginationType>(
    paginationSetupConfig: UsePaginationSetupConfig<Pagination>,
    requestPageCallback?: RequestPageCallback<Pagination>,
    pageLimit?: number
): UsePagination => {
    const $controller = useRef<AbortController>();
    const $maxVisitedPage = useRef<number>();
    const $maxVisitedPageSize = useRef<number>();
    const $page = useRef<number>();

    const $mounted = useMounted(
        useCallback(() => {
            $controller.current?.abort();
            $controller.current = undefined;
        }, [])
    );

    const [page, setCurrentPage] = useState($page.current);
    const [paginationChanged, updatePaginationChanged] = useBooleanState(false);
    const limit = useMemo(() => getClampedPageLimit(pageLimit), [pageLimit]);

    const { getPageCount, getPageParams, resetPageCount, updatePagination } = paginationSetupConfig;

    const goto = useMemo(() => {
        return requestPageCallback
            ? (page: number) => {
                  if (!(limit && Number.isInteger(page))) return;

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
                      const params = { ...getPageParams(requestedPage, limit), limit, page: requestedPage } as RequestPageCallbackParams<Pagination>;

                      try {
                          const data = await requestPageCallback(params, signal);
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
            : (noop as UsePagination['goto']);
    }, [limit, requestPageCallback]);

    const next = useCallback(() => {
        page && goto(Math.min(page + 1, getPageCount()));
    }, [goto, page]);

    const prev = useCallback(() => {
        page && goto(Math.max(page - 1, 1));
    }, [goto, page]);

    const pages = useMemo(() => getPageCount() || page || undefined, [goto, paginationChanged]);
    const hasNext = useMemo(() => !!(page && pages) && page < pages, [page, pages]);
    const hasPrev = useMemo(() => !!page && page > 1, [page]);

    const size = useMemo(
        () => ($maxVisitedPage.current ? ($maxVisitedPage.current - 1) * limit + ($maxVisitedPageSize.current || 0) : 0),
        [goto, paginationChanged]
    );

    const pageSize = useMemo(() => (page ? Math.min(limit, size - (page - 1) * limit) : 0), [limit, size, page]);

    const resetPagination = useCallback(() => {
        resetPageCount();
        $maxVisitedPage.current = $maxVisitedPageSize.current = $page.current = undefined;
        $mounted.current && setCurrentPage($page.current);
    }, [resetPageCount]);

    useEffect(() => {
        if ($mounted.current && paginationChanged) {
            updatePaginationChanged(false);
        }
    }, [paginationChanged]);

    return { goto, hasNext, hasPrev, limit, next, page, pages, pageSize, prev, resetPagination, size };
};

export default usePagination;
