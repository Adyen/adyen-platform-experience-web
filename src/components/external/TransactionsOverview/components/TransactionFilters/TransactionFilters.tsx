import {
    TRANSACTION_ANALYTICS_CATEGORY,
    TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS,
    TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
    TRANSACTION_CATEGORIES,
} from '../../constants';
import { FilterBar } from '../../../../internal/FilterBar';
import { selectionOptionsFor } from '../MultiSelectionFilter';
import { IBalanceAccountBase } from '../../../../../types';
import { FilterBarState } from '../../../../internal/FilterBar/types';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import TransactionMultiSelectionFilter from './TransactionMultiSelectionFilter';
import TransactionPspReferenceFilter from './TransactionPspReferenceFilter';
import useTransactionsFilters from '../../hooks/useTransactionsFilters';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useCurrencySelection from '../../hooks/useCurrencySelection';
import TransactionDateFilter from './TransactionDateFilter';
import Select from '../../../../internal/FormFields/Select';

const eventCategory = TRANSACTION_ANALYTICS_CATEGORY;

export interface TransactionsFiltersProps extends Omit<FilterBarState, 'setShowingFilters'> {
    availableCurrencies: readonly string[];
    balanceAccounts?: IBalanceAccountBase[];
    isTransactionsView: boolean;
    insightsCurrency?: string;
    setInsightsCurrency?: (currency?: string) => void;
    filters: ReturnType<typeof useTransactionsFilters>;
}

const TransactionsFilters = ({
    availableCurrencies,
    balanceAccounts,
    isTransactionsView,
    insightsCurrency,
    setInsightsCurrency,
    filters,
    ...filterBarProps
}: TransactionsFiltersProps) => {
    const { i18n } = useCoreContext();

    const eventSubCategory = isTransactionsView ? TRANSACTION_ANALYTICS_SUBCATEGORY_LIST : TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS;
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    const activeBalanceAccount = filters.balanceAccount.value;
    const cachedBalanceAccount = useRef(activeBalanceAccount);
    const cachedAvailableCurrencies = useRef<typeof availableCurrencies>();

    // const statusesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_STATUSES), []);
    // const statusesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.status.label'), [i18n]);

    const categoriesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_CATEGORIES), []);
    const categoriesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.category.label'), [i18n]);

    const currenciesFilterOptions = useMemo(() => selectionOptionsFor(availableCurrencies ?? []), [availableCurrencies]);
    const currenciesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.currency.label'), [i18n]);
    const currencyFilterEventLabel = 'Currency filter';

    const { resetBalanceAccountSelection, ...balanceAccountFilterProps } = useBalanceAccountSelection({
        allowAllSelection: false,
        selectedBalanceAccountId: activeBalanceAccount?.id,
        onUpdateSelection: filters.balanceAccount.set as any,
        balanceAccounts,
        eventCategory,
        eventSubCategory,
    });

    const { activeCurrency, currencySelectionOptions, onCurrencySelection } = useCurrencySelection({
        eventLabel: currencyFilterEventLabel,
        onUpdateSelection: setInsightsCurrency,
        selectedCurrency: insightsCurrency ?? activeBalanceAccount?.defaultCurrencyCode,
        availableCurrencies,
        eventCategory,
        eventSubCategory,
    });

    useEffect(() => {
        if (cachedAvailableCurrencies.current !== availableCurrencies) {
            cachedAvailableCurrencies.current = availableCurrencies;

            if (cachedBalanceAccount.current !== activeBalanceAccount) {
                cachedBalanceAccount.current = activeBalanceAccount;
                filters.currencies.reset();
                // setInsightsCurrency?.(activeBalanceAccount?.defaultCurrencyCode);
            }
        }
    }, [availableCurrencies, activeBalanceAccount, filters.currencies.reset]);

    return (
        <FilterBar
            {...filterBarProps}
            ariaLabelKey="transactions.overview.filters.label"
            canResetFilters={filters.canReset && false} // Prevents resetting all filters at once using `&& false`
            resetFilters={filters.reset}
        >
            <BalanceAccountSelector {...balanceAccountFilterProps} />
            <TransactionDateFilter
                createdDate={filters.createdDate.value}
                eventCategory={eventCategory}
                eventSubCategory={eventSubCategory}
                setCreatedDate={filters.createdDate.set}
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
                    {/*    selection={filters.statuses.value}*/}
                    {/*    onUpdateFilter={filters.statuses.set}*/}
                    {/*/>*/}
                    <TransactionMultiSelectionFilter
                        eventLabel="Category filter"
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        placeholder={categoriesFilterPlaceholder}
                        selectionOptions={categoriesFilterOptions}
                        selection={filters.categories.value}
                        onUpdateFilter={filters.categories.set}
                    />
                    <TransactionMultiSelectionFilter
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        eventLabel={currencyFilterEventLabel}
                        placeholder={currenciesFilterPlaceholder}
                        selectionOptions={currenciesFilterOptions}
                        selection={filters.currencies.value}
                        onUpdateFilter={filters.currencies.set}
                    />
                    <TransactionPspReferenceFilter
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        onChange={filters.paymentPspReference.set}
                        value={filters.paymentPspReference.value}
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
