import { TransactionFilterParam } from '../types';
import {
    DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS as defaultFilters,
    TRANSACTION_CATEGORIES,
    TRANSACTION_STATUSES,
    TransactionsOverviewMultiSelectionFilterParam,
    useMultiSelectionFilter,
    UseMultiSelectionFilterConfig,
    useMultiSelectionFilterWithoutValues,
} from '../components/MultiSelectionFilter';

const useTransactionsOverviewMultiSelectionFilters = (
    filtersConfig: Pick<UseMultiSelectionFilterConfig<TransactionsOverviewMultiSelectionFilterParam>, 'filters' | 'updateFilters'>
) => {
    const categoriesFilter = useMultiSelectionFilter({
        filterParam: TransactionFilterParam.CATEGORIES,
        filterValues: TRANSACTION_CATEGORIES,
        defaultFilters,
        ...filtersConfig,
    });
    const statusesFilter = useMultiSelectionFilter({
        filterParam: TransactionFilterParam.STATUSES,
        filterValues: TRANSACTION_STATUSES,
        defaultFilters,
        ...filtersConfig,
    });
    const { updateFilterValues: setTransactionsCurrencies, ...currenciesFilter } = useMultiSelectionFilterWithoutValues({
        filterParam: TransactionFilterParam.CURRENCIES,
        defaultFilters,
        ...filtersConfig,
    });

    return {
        categoriesFilter,
        currenciesFilter,
        statusesFilter,
        setTransactionsCurrencies,
    } as const;
};

export default useTransactionsOverviewMultiSelectionFilters;
