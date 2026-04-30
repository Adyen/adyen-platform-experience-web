import { MAX_PAGE_LIMIT } from './constants';

export const getClampedPageLimit = (pageLimit?: number) => {
    const limit = ~~(pageLimit as number);
    return limit === pageLimit && limit > 0 ? Math.min(limit, MAX_PAGE_LIMIT) : Math.max(limit, 0);
};
