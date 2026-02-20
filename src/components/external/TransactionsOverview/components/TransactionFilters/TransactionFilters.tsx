import {
    TRANSACTION_ANALYTICS_CATEGORY,
    TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS,
    TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
    TRANSACTION_CATEGORIES,
} from '../../constants';
import { FilterBar } from '../../../../internal/FilterBar';
import { selectionOptionsFor } from '../MultiSelectionFilter';
import { useMemo } from 'preact/hooks';
import { useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import TransactionMultiSelectionFilter from './TransactionMultiSelectionFilter';
import TransactionPspReferenceFilter from './TransactionPspReferenceFilter';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useCurrencySelection from '../../hooks/useCurrencySelection';
import TransactionDateFilter from './TransactionDateFilter';
import Select from '../../../../internal/FormFields/Select';

const eventCategory = TRANSACTION_ANALYTICS_CATEGORY;

const TransactionsFilters = () => {
    // prettier-ignore
    const {
        filterBarState,
        balanceAccounts,
        currenciesLookupResult,
        transactionsFiltersResult,
        transactionsViewState,
    } = useTransactionsOverviewContext();

    const { i18n } = useCoreContext();
    const { isTransactionsView } = transactionsViewState;
    const { setShowingFilters, ...filterBarProps } = filterBarState;
    const { filters, balanceAccount, categories, currencies, createdDate, paymentPspReference, insightsCurrency } = transactionsFiltersResult;

    const availableCurrencies = currenciesLookupResult.sortedCurrencies;
    const eventSubCategory = isTransactionsView ? TRANSACTION_ANALYTICS_SUBCATEGORY_LIST : TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS;
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    // const statusesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_STATUSES), []);
    // const statusesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.status.label'), [i18n]);

    const categoriesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_CATEGORIES), []);
    const categoriesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.category.label'), [i18n]);

    const currenciesFilterOptions = useMemo(() => selectionOptionsFor(availableCurrencies ?? []), [availableCurrencies]);
    const currenciesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.currency.label'), [i18n]);
    const currencyFilterEventLabel = 'Currency filter';

    const { resetBalanceAccountSelection, ...balanceAccountFilterProps } = useBalanceAccountSelection({
        allowAllSelection: false,
        onUpdateSelection: balanceAccount.set,
        balanceAccounts,
        eventCategory,
        eventSubCategory,
    });

    const { activeCurrency, currencySelectionOptions, onCurrencySelection } = useCurrencySelection({
        eventLabel: currencyFilterEventLabel,
        onUpdateSelection: insightsCurrency.set,
        selectedCurrency: insightsCurrency.$value ?? balanceAccount.$value?.defaultCurrencyCode,
        availableCurrencies,
        eventCategory,
        eventSubCategory,
    });

    return (
        <FilterBar
            {...filterBarProps}
            ariaLabelKey="transactions.overview.filters.label"
            canResetFilters={!filters.pristine && false} // Prevents resetting all filters at once using `&& false`
            resetFilters={() => filters.reset()}
        >
            <BalanceAccountSelector {...balanceAccountFilterProps} />
            <TransactionDateFilter
                createdDate={createdDate.$value}
                eventCategory={eventCategory}
                eventSubCategory={eventSubCategory}
                setCreatedDate={createdDate.set}
                timezone={balanceAccountFilterProps.activeBalanceAccount?.timeZone}
            />
            {isTransactionsView ? (
                <>
                    {/*<TransactionMultiSelectionFilter*/}
                    {/*    eventLabel="Status filter"*/}
                    {/*    eventCategory={eventCategory}*/}
                    {/*    eventSubCategory={eventSubCategory}*/}
                    {/*    placeholder={statusesFilterPlaceholder}*/}
                    {/*    selectionOptions={statusesFilterOptions}*/}
                    {/*    selection={statuses.$value}*/}
                    {/*    onUpdateFilter={statuses.set}*/}
                    {/*/>*/}
                    <TransactionMultiSelectionFilter
                        eventLabel="Category filter"
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        placeholder={categoriesFilterPlaceholder}
                        selectionOptions={categoriesFilterOptions}
                        selection={categories.$value}
                        onUpdateFilter={categories.set}
                    />
                    <TransactionMultiSelectionFilter
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        eventLabel={currencyFilterEventLabel}
                        placeholder={currenciesFilterPlaceholder}
                        selectionOptions={currenciesFilterOptions}
                        selection={currencies.$value}
                        onUpdateFilter={currencies.set}
                    />
                    <TransactionPspReferenceFilter
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        onChange={paymentPspReference.set}
                        value={paymentPspReference.$value}
                    />
                </>
            ) : (
                <>
                    {currencySelectionOptions.length > 1 ? (
                        <Select
                            filterable={false}
                            multiSelect={false}
                            items={currencySelectionOptions}
                            onChange={onCurrencySelection}
                            selected={activeCurrency}
                            aria-label={currenciesFilterPlaceholder}
                            placeholder={activeCurrency || currenciesFilterPlaceholder}
                            showOverlay={isSmContainer}
                            withoutCollapseIndicator
                        />
                    ) : null}
                </>
            )}
        </FilterBar>
    );
};

export default TransactionsFilters;
