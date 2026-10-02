import type { DEFAULT_PAGE_LIMITS } from '@integration-components/utils';

export type DefaultPageLimit = (typeof DEFAULT_PAGE_LIMITS)[number];

export interface PaginationProps<Limit extends number = DefaultPageLimit> {
    allowLimitSelection?: boolean;
    preferredLimit?: Limit;
}
