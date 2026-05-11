import { getDateRangeTimestamps } from '@integration-components/ui-primitives-preact/Calendar/calendar/timerange/utils';
import { TransactionsFilters } from '../types';
import { INITIAL_FILTERS } from '../constants';

const allFilters = Object.keys(INITIAL_FILTERS) as readonly (keyof TransactionsFilters)[];
const allFiltersSet = new Set(allFilters);

export const getTransactionsFilterQueryParams = <T extends TransactionsFilters>(filters: T, now: number) => {
    const { from, to } = getDateRangeTimestamps(filters.createdDate, now, filters.balanceAccount?.timeZone);
    return {
        balanceAccountId: filters.balanceAccount?.id as string, // using type cast to ensure correct type inference
        categories: filters.categories as (typeof filters.categories)[number][],
        createdSince: new Date(from).toISOString(),
        createdUntil: new Date(to).toISOString(),
        currencies: filters.currencies as (typeof filters.currencies)[number][],
        paymentPspReference: filters.paymentPspReference,
        statuses: filters.statuses as (typeof filters.statuses)[number][],
    } as const;
};

export const getTransactionsFilterParams = <T extends TransactionsFilters>(filters: T, now: number) => {
    const { balanceAccountId, categories, currencies, statuses, ...restFilterParams } = getTransactionsFilterQueryParams(filters, now);
    return {
        ...restFilterParams,
        balanceAccountId: balanceAccountId || undefined,
        categories: String(categories) || undefined,
        currencies: String(currencies) || undefined,
        statuses: String(statuses) || undefined,
    } as const;
};

export const compareTransactionsFilters = <T extends TransactionsFilters>(
    filtersA: T,
    filtersB: T,
    filtersSet: Set<keyof TransactionsFilters> = allFiltersSet
) => {
    return allFilters.some(filterName => {
        if (filtersSet.has(filterName)) {
            const filterValueA = filtersA[filterName];
            const filterValueB = filtersB[filterName];

            switch (filterName) {
                case 'categories':
                case 'currencies':
                case 'statuses':
                    return String(filterValueA) !== String(filterValueB);
                default:
                    return filterValueA !== filterValueB;
            }
        }
    });
};
