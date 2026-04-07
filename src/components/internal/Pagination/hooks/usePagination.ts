import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { RequestPageCallback, RequestPageCallbackParams, UsePaginationSetupConfig } from './types';
import useBooleanState from '../../../../hooks/useBooleanState';
import useMounted from '../../../../hooks/useMounted';
import { PaginationType, UsePagination } from '../types';
import { getClampedPageLimit } from '../utils';
import { clamp, noop } from '../../../../utils';

const usePagination = <Pagination extends PaginationType>(
    paginationSetupConfig: UsePaginationSetupConfig<Pagination>,
    requestPageCallback?: RequestPageCallback<Pagination>,
    pageLimit?: number
): UsePagination => {
    const $controllerRef = useRef<AbortController>();
    const $maxVisitedPageRef = useRef<number>();
    const $maxVisitedPageSizeRef = useRef<number>();
    const $pageRef = useRef<number>();

    const $mounted = useMounted(
        useCallback(() => {
            $controllerRef.current?.abort();
            $controllerRef.current = undefined;
        }, [])
    );

    const [page, setCurrentPage] = useState($pageRef.current);
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

                  $controllerRef.current?.abort();
                  $controllerRef.current = new AbortController();

                  if (!$mounted.current) return;

                  if (($pageRef.current = requestedPage) > 1 || PAGES) {
                      setCurrentPage($pageRef.current);
                  }

                  (async () => {
                      const { signal } = $controllerRef.current as AbortController;
                      const params = { ...getPageParams(requestedPage, limit), limit, page: requestedPage } as RequestPageCallbackParams<Pagination>;

                      try {
                          const data = await requestPageCallback(params, signal);
                          if (!data || !$mounted.current) return;

                          const { size, ...paginationData } = data;

                          updatePagination(requestedPage, limit, paginationData);
                          $maxVisitedPageRef.current = $pageRef.current && Math.max($pageRef.current, $maxVisitedPageRef.current || -Infinity);

                          if ($pageRef.current && $pageRef.current === $maxVisitedPageRef.current) {
                              $maxVisitedPageSizeRef.current = size;
                          }
                          if ($pageRef.current === 1 && size > 0) {
                              setCurrentPage($pageRef.current);
                          }

                          $pageRef.current = undefined;
                          updatePaginationChanged(true);
                      } catch (ex) {
                          if (signal.aborted) return;
                          console.error(ex); // throw ex;
                      }
                  })();
              }
            : (noop as UsePagination['goto']);
    }, [limit, requestPageCallback, $mounted, getPageCount, getPageParams, updatePagination, updatePaginationChanged]);

    const next = useCallback(() => {
        if (page) {
            goto(Math.min(page + 1, getPageCount()));
        }
    }, [goto, page, getPageCount]);

    const prev = useCallback(() => {
        if (page) {
            goto(Math.max(page - 1, 1));
        }
    }, [goto, page]);

    const pages = useMemo(
        () => getPageCount() || page || undefined,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getPageCount, page, paginationChanged]
    );

    const hasNext = useMemo(() => !!(page && pages) && page < pages, [page, pages]);
    const hasPrev = useMemo(() => !!page && page > 1, [page]);

    const size = useMemo(
        () => ($maxVisitedPageRef.current ? ($maxVisitedPageRef.current - 1) * limit + ($maxVisitedPageSizeRef.current || 0) : 0),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [limit, paginationChanged]
    );

    const pageSize = useMemo(() => (page ? clamp(0, size - (page - 1) * limit, limit) : 0), [limit, size, page]);

    const resetPagination = useCallback(() => {
        resetPageCount();
        $maxVisitedPageRef.current = $maxVisitedPageSizeRef.current = $pageRef.current = undefined;
        if ($mounted.current) {
            setCurrentPage($pageRef.current);
        }
    }, [resetPageCount, $mounted]);

    useEffect(() => {
        if ($mounted.current && paginationChanged) {
            updatePaginationChanged(false);
        }
    }, [paginationChanged, $mounted, updatePaginationChanged]);

    return { goto, hasNext, hasPrev, limit, next, page, pages, pageSize, prev, resetPagination, size };
};

export default usePagination;
