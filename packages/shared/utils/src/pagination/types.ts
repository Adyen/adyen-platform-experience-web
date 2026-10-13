import type { DEFAULT_PAGE_LIMITS } from './constants';

export type DefaultPageLimit = (typeof DEFAULT_PAGE_LIMITS)[number];

export interface PaginationConfig<Limit extends number = DefaultPageLimit> {
    initialPageSize?: Limit;
    allowPageSizeSelection?: boolean;
}

export interface PaginationProps<Limit extends number = DefaultPageLimit> {
    pagination?: PaginationConfig<Limit>;
}
