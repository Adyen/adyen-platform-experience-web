import { useMemo } from 'preact/hooks';
import { RequestPageCallback, RequestPageCallbackParamsWithOffset } from './types';
import { UsePagination, WithNextPageNeighbour, WithPageNeighbours } from '../types';
import usePagination from './usePagination';

export type WithEitherPages = WithPageNeighbours<boolean>;
export type WithNextPage = WithNextPageNeighbour<boolean>;
export const withNextPage = (value: WithEitherPages): value is WithNextPage => (value as WithNextPage).next;

const useOffsetPagination = (
    requestPageCallback?: RequestPageCallback<boolean, RequestPageCallbackParamsWithOffset>,
    pageLimit?: number
): UsePagination => {
    const paginationSetupConfig = useMemo(() => {
        let currentPage = 0;
        const getPageCount = () => currentPage;
        const resetPageCount = () => { currentPage = 0 };
        const getPageParams = (page: number, limit: number) => ({ offset: (page - 1) * limit });

        const updatePagination = (page: number, limit: number, paginationData: WithEitherPages) => {
            if (withNextPage(paginationData) && paginationData.next) {
                currentPage = Math.max(currentPage, page + 1);
            }
        };

        return { getPageCount, getPageParams, resetPageCount, updatePagination };
    }, []);

    return usePagination<boolean, RequestPageCallbackParamsWithOffset>(
        paginationSetupConfig,
        requestPageCallback,
        pageLimit
    );
};

export default useOffsetPagination;
