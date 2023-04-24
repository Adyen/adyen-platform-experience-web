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
export type WithPaginationLimit<T extends Record<any, any> = {}> = T & { limit?: number };
export type WithPaginationRecordSize<T extends Record<any, any> = {}> = T & { size?: number };

export interface UseFilters<S extends UseReactiveStateRecord> {
    canResetFilters: S['canResetState'];
    defaultFilters: S['defaultState'],
    filters: S['state'];
    resetFilters: S['resetState'];
    updateFilters: S['updateState'];
}

export interface UsePagination extends Required<WithPaginationLimit>, WithPaginationRecordSize {
    goto: (page?: number) => void;
    hasNext: boolean;
    hasPrev: boolean;
    next: () => void;
    page: number | undefined;
    pages: number | undefined;
    pageSize: number | undefined;
    prev: () => void;
}

export type PaginationProps =
    Omit<UsePagination, 'goto'> &
    Partial<Pick<UsePagination, 'goto'>>;
