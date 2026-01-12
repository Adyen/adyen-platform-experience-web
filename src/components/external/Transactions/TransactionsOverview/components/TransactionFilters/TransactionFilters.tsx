import {
    INITIAL_FILTERS,
    TRANSACTION_ANALYTICS_CATEGORY,
    TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS,
    TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
    TRANSACTION_CATEGORIES,
} from '../../constants';
import { compareTransactionsFilters } from '../utils';
import { FilterBar } from '../../../../../internal/FilterBar';
import { selectionOptionsFor } from '../MultiSelectionFilter';
import { IBalanceAccountBase } from '../../../../../../types';
import { TransactionsFilters as Filters } from '../../types';
import { FilterBarState } from '../../../../../internal/FilterBar/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import BalanceAccountSelector from '../../../../../internal/FormFields/Select/BalanceAccountSelector';
import useBalanceAccountSelection from '../../../../../../hooks/useBalanceAccountSelection';
import TransactionMultiSelectionFilter from './TransactionMultiSelectionFilter';
import TransactionPspReferenceFilter from './TransactionPspReferenceFilter';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useCurrencySelection from '../../hooks/useCurrencySelection';
import TransactionDateFilter from './TransactionDateFilter';
import Select from '../../../../../internal/FormFields/Select';

const eventCategory = TRANSACTION_ANALYTICS_CATEGORY;

export interface TransactionsFiltersProps extends Omit<FilterBarState, 'setShowingFilters'> {
    availableCurrencies: readonly string[];
    balanceAccounts?: IBalanceAccountBase[];
    isTransactionsView: boolean;
    onChange?: (filters: Readonly<Filters>) => void;
    setInsightsCurrency?: (currency?: string) => void;
}

const TransactionsFilters = ({
    availableCurrencies,
    balanceAccounts,
    isTransactionsView,
    onChange,
    setInsightsCurrency,
    ...filterBarProps
}: TransactionsFiltersProps) => {
    const { i18n } = useCoreContext();

    const eventSubCategory = isTransactionsView ? TRANSACTION_ANALYTICS_SUBCATEGORY_LIST : TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS;
    const initialFilters = useRef<Filters>({ ...INITIAL_FILTERS });
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    const [statuses, setStatuses] = useState(initialFilters.current.statuses);
    const [categories, setCategories] = useState(initialFilters.current.categories);
    const [currencies, setCurrencies] = useState(initialFilters.current.currencies);
    const [createdDate, setCreatedDate] = useState(initialFilters.current.createdDate);
    const [paymentPspReference, setPaymentPspReference] = useState(initialFilters.current.paymentPspReference);
    const [balanceAccount, setBalanceAccount] = useState(initialFilters.current.balanceAccount);

    const currentFilters = useMemo(
        () => ({ balanceAccount, categories, createdDate, currencies, paymentPspReference, statuses }) as const,
        [balanceAccount, categories, createdDate, currencies, paymentPspReference, statuses]
    );

    const canResetFilters = useMemo(() => compareTransactionsFilters(currentFilters, initialFilters.current), [currentFilters]);

    const resetFilters = useCallback(() => {
        setStatuses(initialFilters.current.statuses);
        setCategories(initialFilters.current.categories);
        setCurrencies(initialFilters.current.currencies);
        setCreatedDate(initialFilters.current.createdDate);
        setPaymentPspReference(initialFilters.current.paymentPspReference);
        setBalanceAccount(initialFilters.current.balanceAccount);
    }, []);

    // const statusesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_STATUSES), []);
    // const statusesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.status.label'), [i18n]);

    const categoriesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_CATEGORIES), []);
    const categoriesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.category.label'), [i18n]);

    const currenciesFilterOptions = useMemo(() => selectionOptionsFor(availableCurrencies ?? []), [availableCurrencies]);
    const currenciesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.currency.label'), [i18n]);
    const currencyFilterEventLabel = 'Currency filter';

    const { resetBalanceAccountSelection, ...balanceAccountFilterProps } = useBalanceAccountSelection({
        allowAllSelection: false,
        onUpdateSelection: setBalanceAccount,
        balanceAccounts,
        eventCategory,
        eventSubCategory,
    });

    const { activeCurrency, currencySelectionOptions, onCurrencySelection } = useCurrencySelection({
        eventLabel: currencyFilterEventLabel,
        onUpdateSelection: setInsightsCurrency,
        selectedCurrency: balanceAccount?.defaultCurrencyCode,
        availableCurrencies,
        eventCategory,
        eventSubCategory,
    });

    useEffect(() => setCurrencies(initialFilters.current.currencies), [availableCurrencies]);
    useEffect(() => onChange?.(currentFilters), [onChange, currentFilters]);

    useEffect(() => {
        if (!initialFilters.current.balanceAccount && balanceAccount) {
            // Update initial balance account selection (first selection only)
            initialFilters.current.balanceAccount = balanceAccount;
        }
    }, [balanceAccount]);

    return (
        <FilterBar
            {...filterBarProps}
            ariaLabelKey="transactions.overview.filters.label"
            canResetFilters={canResetFilters && false} // Prevents resetting all filters at once using `&& false`
            resetFilters={resetFilters}
        >
            <BalanceAccountSelector {...balanceAccountFilterProps} />
            <TransactionDateFilter
                createdDate={createdDate}
                eventCategory={eventCategory}
                eventSubCategory={eventSubCategory}
                setCreatedDate={setCreatedDate}
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
                    {/*    selection={statuses}*/}
                    {/*    onUpdateFilter={setStatuses}*/}
                    {/*/>*/}
                    <TransactionMultiSelectionFilter
                        eventLabel="Category filter"
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        placeholder={categoriesFilterPlaceholder}
                        selectionOptions={categoriesFilterOptions}
                        selection={categories}
                        onUpdateFilter={setCategories}
                    />
                    <TransactionMultiSelectionFilter
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        eventLabel={currencyFilterEventLabel}
                        placeholder={currenciesFilterPlaceholder}
                        selectionOptions={currenciesFilterOptions}
                        selection={currencies}
                        onUpdateFilter={setCurrencies}
                    />
                    <TransactionPspReferenceFilter
                        eventCategory={eventCategory}
                        eventSubCategory={eventSubCategory}
                        onChange={setPaymentPspReference}
                        value={paymentPspReference}
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
