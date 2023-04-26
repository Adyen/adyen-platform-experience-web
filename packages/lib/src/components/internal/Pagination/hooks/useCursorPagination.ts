import { useMemo } from 'preact/hooks';
import { RequestPageCallback, RequestPageCallbackParamsWithCursor } from './types';
import { UsePagination, WithNextPageNeighbour, WithPageNeighbours, WithPrevPageNeighbour } from '../types';
import usePagination from './usePagination';

export type WithEitherPages = WithPageNeighbours<URLSearchParams>;
export type WithNextPage = WithNextPageNeighbour<URLSearchParams>;
export type WithPrevPage = WithPrevPageNeighbour<URLSearchParams>;

const isParams = (value?: any) => value instanceof URLSearchParams;
export const withNextPage = (value: WithEitherPages): value is WithNextPage => isParams((value as WithNextPage).next);
export const withPrevPage = (value: WithEitherPages): value is WithPrevPage => isParams((value as WithPrevPage).prev);

const useCursorPagination = (
    requestPageCallback?: RequestPageCallback<URLSearchParams, RequestPageCallbackParamsWithCursor>,
    pageLimit?: number
): UsePagination => {
    const paginationSetupConfig = useMemo(() => {
        const cursors: RequestPageCallbackParamsWithCursor['cursor'][] = [];
        const getPageCount = () => cursors.length;
        const resetPageCount = () => { cursors.length = 0 };
        const getPageParams = (page: number) => ({ cursor: cursors[page - 1] });

        const updateCursor = (params: URLSearchParams, page: number) => {
            const cursor = params.get('cursor') as RequestPageCallbackParamsWithCursor['cursor'];
            const currentCursor = cursors[page - 1];

            if ((page === 1 || page === (cursors.length || 1) + 1) && currentCursor === undefined) {
                cursors[page - 1] = cursor ? decodeURIComponent(cursor) : undefined;
            }
        };

        const updatePagination = (page: number, limit: number, paginationData: WithEitherPages) => {
            if (withNextPage(paginationData)) updateCursor(paginationData.next, page + 1);
            if (withPrevPage(paginationData)) updateCursor(paginationData.prev, page - 1);
        };

        return { getPageCount, getPageParams, resetPageCount, updatePagination };
    }, []);

    return usePagination<URLSearchParams, RequestPageCallbackParamsWithCursor>(
        paginationSetupConfig,
        requestPageCallback,
        pageLimit
    );
};

export default useCursorPagination;
