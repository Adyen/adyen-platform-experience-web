import { useMemo } from 'preact/hooks';
import { RequestPageCallback } from './types';
import { PaginationType, UsePagination, WithEitherPages, WithNextPage } from '../types';
import usePagination from './usePagination';

export type HasEitherPages = WithEitherPages<PaginationType.OFFSET>;
export type HasNextPage = WithNextPage<PaginationType.OFFSET>;
export const hasNextPage = (value: HasEitherPages): value is HasNextPage => (value as HasNextPage).next;

const useOffsetPagination = (requestPageCallback?: RequestPageCallback<PaginationType.OFFSET>, pageLimit?: number): UsePagination => {
    const paginationSetupConfig = useMemo(() => {
        let currentPage = 0;
        const getPageCount = () => currentPage;
        const resetPageCount = () => {
            currentPage = 0;
        };
        const getPageParams = (page: number, limit: number) => ({ offset: (page - 1) * limit });

        const updatePagination = (page: number, limit: number, paginationData: HasEitherPages) => {
            if (hasNextPage(paginationData) && paginationData.next) {
                currentPage = Math.max(currentPage, page + 1);
            }
        };

        return { getPageCount, getPageParams, resetPageCount, updatePagination };
    }, []);

    return usePagination<PaginationType.OFFSET>(paginationSetupConfig, requestPageCallback, pageLimit);
};

export default useOffsetPagination;
