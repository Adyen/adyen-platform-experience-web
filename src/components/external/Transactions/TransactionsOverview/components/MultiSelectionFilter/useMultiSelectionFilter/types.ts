import type { UsePaginatedRecords } from '../../../../../../internal/Pagination/hooks/types';
import { TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTERS } from './constants';

export type SelectionOptionsList<T extends string = string> = readonly T[] | T[];

export type TransactionsOverviewMultiSelectionFilterParam = (typeof TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTERS)[number];

export type UseMultiSelectionFilterConfig<FilterParam extends string = string, FilterValue extends string = string> = {
    defaultFilters?: UseMultiSelectionFilterConfig<FilterParam, FilterValue>['filters'];
    filterParam: FilterParam;
    filterValues?: SelectionOptionsList<FilterValue>;
    mapFilterOptionName?: (id: FilterValue) => string;
} & Partial<Pick<UsePaginatedRecords<any, string, TransactionsOverviewMultiSelectionFilterParam>, 'filters' | 'updateFilters'>>;

export type UseMultiSelectionFilterConfigWithoutValues<FilterParam extends string = string, FilterValue extends string = string> = Omit<
    UseMultiSelectionFilterConfig<FilterParam, FilterValue>,
    'filterValues'
>;
