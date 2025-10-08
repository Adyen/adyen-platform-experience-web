import { ITransaction } from '../../../../types';
import { FilterParam } from '../../../types';
import {
    DEFAULT_TRANSACTIONS_OVERVIEW_MULTI_SELECTION_FILTER_PARAMS as defaultFilters,
    TRANSACTION_CATEGORIES,
    TRANSACTION_STATUSES,
    TransactionsOverviewMultiSelectionFilterParam,
    useMultiSelectionFilter,
    UseMultiSelectionFilterConfig,
} from '../components/MultiSelectionFilter';

const useTransactionsOverviewMultiSelectionFilters = (
    filtersConfig: Pick<UseMultiSelectionFilterConfig<TransactionsOverviewMultiSelectionFilterParam>, 'filters' | 'updateFilters'>,
    currencies: ITransaction['amount']['currency'][] | undefined
) => {
    const categoriesFilter = useMultiSelectionFilter({
        filterParam: FilterParam.CATEGORIES,
        filterValues: TRANSACTION_CATEGORIES,
        defaultFilters,
        ...filtersConfig,
    });
    const statusesFilter = useMultiSelectionFilter({
        filterParam: FilterParam.STATUSES,
        filterValues: TRANSACTION_STATUSES,
        defaultFilters,
        ...filtersConfig,
    });

    const currenciesFilter = useMultiSelectionFilter({
        filterParam: FilterParam.CURRENCIES,
        filterValues: currencies,
        defaultFilters,
        ...filtersConfig,
    });

    return {
        categoriesFilter,
        currenciesFilter,
        statusesFilter,
    } as const;
};

export default useTransactionsOverviewMultiSelectionFilters;
