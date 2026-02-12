import { UseReactiveStateRecord } from '../../../hooks/useReactiveState/types';
import { TranslationKey } from '../../../translations';

export const enum PageNeighbour {
    NEXT = 'next',
    PREV = 'prev',
}

export const enum PaginationType {
    CURSOR = 'cursor',
    OFFSET = 'offset',
}

export type ForPaginationType<T extends PaginationType, CursorType, OffsetType> = T extends PaginationType.CURSOR
    ? CursorType
    : T extends PaginationType.OFFSET
      ? OffsetType
      : never;

type BothPageNeighbours<T = any> = { [P in PageNeighbour]: T };
type NextPageNeighbour<T = any> = Omit<BothPageNeighbours<T>, PageNeighbour.PREV>;
type PrevPageNeighbour<T = any> = Omit<BothPageNeighbours<T>, PageNeighbour.NEXT>;

type WithNextPageNeighbour<T = any> = BothPageNeighbours<T> | NextPageNeighbour<T>;
type WithPrevPageNeighbour<T = any> = BothPageNeighbours<T> | PrevPageNeighbour<T>;
type WithPageNeighbours<T = any> = WithNextPageNeighbour<T> | WithPrevPageNeighbour<T>;

type WhichPageNeighbour<T extends PaginationType> = ForPaginationType<T, string, boolean>;

export type WithEitherPages<T extends PaginationType> = WithPageNeighbours<WhichPageNeighbour<T>>;
export type WithNextPage<T extends PaginationType> = WithNextPageNeighbour<WhichPageNeighbour<T>>;
export type WithPrevPage<T extends PaginationType> = WithPrevPageNeighbour<WhichPageNeighbour<T>>;

export type WithPaginationCursor<T extends Record<any, any> = {}> = T & { cursor?: string };
export type WithPaginationLimit<T extends Record<any, any> = {}> = T & { limit?: number };
export type WithPaginationOffset<T extends Record<any, any> = {}> = T & { offset: number };
export type WithPaginationRecordSize<T extends Record<any, any> = {}> = T & { size?: number };

export type WithPaginationLimitSelection<T extends Record<any, any> = {}> = T & {
    limitOptions?: readonly number[];
    onLimitSelection?: (limit: number) => void;
};

export type PaginatedResponseDataKeyword = 'hasNext' | 'hasPrevious' | '_links';
export type PaginatedResponseDataField<DataField extends string> = Exclude<DataField | PaginatedResponseDataKeyword, PaginatedResponseDataKeyword>;

export type BasePaginatedResponseData<T = any, DataField extends string = 'data'> = {
    [K in PaginatedResponseDataField<DataField>]?: T[];
};

export type PaginatedResponseDataWithLinks<T = any, DataField extends string = 'data'> = BasePaginatedResponseData<T, DataField> & {
    _links: {
        [K in PageNeighbour]?: { cursor: string };
    };
};

export type PaginatedResponseDataWithoutLinks<T = any, DataField extends string = 'data'> = BasePaginatedResponseData<T, DataField> & {
    hasNext?: boolean;
    hasPrevious?: boolean;
};

export type PaginatedResponseData<T = any, DataField extends string = 'data'> =
    | PaginatedResponseDataWithLinks<T, DataField>
    | PaginatedResponseDataWithoutLinks<T, DataField>;

export interface UseFilters<S extends UseReactiveStateRecord> {
    canResetFilters: S['canResetState'];
    defaultFilters: S['defaultState'];
    filters: S['state'];
    resetFilters: S['resetState'];
    updateFilters: S['updateState'];
}

export interface UsePagination extends Required<WithPaginationLimit>, WithPaginationRecordSize {
    goto: (page: number) => void;
    hasNext: boolean;
    hasPrev: boolean;
    next: () => void;
    page: number | undefined;
    pages: number | undefined;
    pageSize: number | undefined;
    prev: () => void;
    resetPagination: () => void;
}

export type PaginationProps = WithPaginationLimitSelection<Omit<UsePagination, 'goto' | 'resetPagination'> & Partial<Pick<UsePagination, 'goto'>>> & {
    ariaLabelKey?: TranslationKey;
    limitSelectAriaLabelKey?: TranslationKey;
};
