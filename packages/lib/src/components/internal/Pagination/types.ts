import { UseReactiveStateRecord } from '../../../hooks/useReactiveStateWithParams/types';

export const enum PageNeighbours {
    NEXT = 'next',
    PREV = 'prev',
}

export type BothPageNeighbours<T = any> = { [P in PageNeighbours]: T };
export type NextPageNeighbour<T = any> = Omit<BothPageNeighbours<T>, PageNeighbours.PREV>;
export type PrevPageNeighbour<T = any> = Omit<BothPageNeighbours<T>, PageNeighbours.NEXT>;

export type WithNextPageNeighbour<T = any> = BothPageNeighbours<T> | NextPageNeighbour<T>;
export type WithPrevPageNeighbour<T = any> = BothPageNeighbours<T> | PrevPageNeighbour<T>;
export type WithPageNeighbours<T = any> = WithNextPageNeighbour<T> | WithPrevPageNeighbour<T>;
export type WithPaginationCursor<T extends Record<any, any> = {}> = T & { cursor?: string };

export interface UseFilters<S extends UseReactiveStateRecord> {
    canResetFilters: S['canResetState'];
    defaultFilters: S['defaultState'],
    filters: S['state'];
    resetFilters: S['resetState'];
    updateFilters: S['updateState'];
}

export interface UsePagination {
    goto: (page?: number) => void;
    next: () => void;
    page: number | undefined;
    pages: number | undefined;
    prev: () => void;
}

export type PaginationProps =
    Omit<UsePagination, 'goto'> &
    Partial<Pick<UsePagination, 'goto'>>;
