import { useMemo } from 'preact/hooks';
import { RequestPageCallback, RequestPageCallbackParams } from './types';
import { PaginationType, UsePagination, WithEitherPages, WithNextPage, WithPrevPage } from '../types';
import usePagination from './usePagination';

type HasEitherPages = WithEitherPages<PaginationType.CURSOR>;
type HasNextPage = WithNextPage<PaginationType.CURSOR>;
type HasPrevPage = WithPrevPage<PaginationType.CURSOR>;
type PageCursorType = RequestPageCallbackParams<PaginationType.CURSOR>['cursor'];

const isParams = (value?: any) => value instanceof URLSearchParams;
export const hasNextPage = (value: HasEitherPages): value is HasNextPage => isParams((value as HasNextPage).next);
export const hasPrevPage = (value: HasEitherPages): value is HasPrevPage => isParams((value as HasPrevPage).prev);

const useCursorPagination = (
    requestPageCallback?: RequestPageCallback<PaginationType.CURSOR>,
    pageLimit?: number
): UsePagination => {
    const paginationSetupConfig = useMemo(() => {
        const cursors: PageCursorType[] = [];
        const getPageCount = () => cursors.length;
        const resetPageCount = () => { cursors.length = 0 };
        const getPageParams = (page: number) => ({ cursor: cursors[page - 1] });

        const updateCursor = (params: URLSearchParams, page: number) => {
            const cursor = params.get('cursor') as PageCursorType;
            const currentCursor = cursors[page - 1];

            if ((page === 1 || page === (cursors.length || 1) + 1) && currentCursor === undefined) {
                cursors[page - 1] = cursor ? decodeURIComponent(cursor) : undefined;
            }
        };

        const updatePagination = (page: number, limit: number, paginationData: HasEitherPages) => {
            if (hasNextPage(paginationData)) updateCursor(paginationData.next, page + 1);
            if (hasPrevPage(paginationData)) updateCursor(paginationData.prev, page - 1);
        };

        return { getPageCount, getPageParams, resetPageCount, updatePagination };
    }, []);

    return usePagination<PaginationType.CURSOR>(paginationSetupConfig, requestPageCallback, pageLimit);
};

export default useCursorPagination;
