import { compareTransactionsFilters } from '../utils';
import { FilterBar } from '../../../../internal/FilterBar';
import { selectionOptionsFor } from '../MultiSelectionFilter';
import { IBalanceAccountBase } from '../../../../../types';
import { FilterBarState } from '../../../../internal/FilterBar/types';
import { INITIAL_FILTERS, TRANSACTION_CATEGORIES } from '../../constants';
import { SelectItem } from '../../../../internal/FormFields/Select/types';
import { TransactionsFilters as Filters, TransactionsView } from '../../types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import TransactionMultiSelectionFilter from './TransactionMultiSelectionFilter';
import TransactionPspReferenceFilter from './TransactionPspReferenceFilter';
import TransactionDateFilter from './TransactionDateFilter';
import Select from '../../../../internal/FormFields/Select';

export interface TransactionsFiltersProps extends Omit<FilterBarState, 'setShowingFilters'> {
    activeView: TransactionsView;
    availableCurrencies: readonly string[];
    balanceAccounts?: IBalanceAccountBase[];
    eventCategory?: string;
    insightsCurrency?: string;
    onChange?: (filters: Readonly<Filters>) => void;
    setInsightsCurrency?: (currency?: string) => void;
}

const TransactionsFilters = ({
    activeView,
    availableCurrencies,
    balanceAccounts,
    eventCategory,
    insightsCurrency,
    onChange,
    setInsightsCurrency,
    ...filterBarProps
}: TransactionsFiltersProps) => {
    const { i18n } = useCoreContext();

    const initialFilters = useRef<Filters>({ ...INITIAL_FILTERS });
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const isTransactionsView = activeView !== TransactionsView.INSIGHTS;

    const [statuses, setStatuses] = useState(initialFilters.current.statuses);
    const [categories, setCategories] = useState(initialFilters.current.categories);
    const [currencies, setCurrencies] = useState(initialFilters.current.currencies);
    const [createdDate, setCreatedDate] = useState(initialFilters.current.createdDate);
    const [paymentPspReference, setPaymentPspReference] = useState(initialFilters.current.paymentPspReference);
    const [balanceAccount, setBalanceAccount] = useState(initialFilters.current.balanceAccount);

    if (!initialFilters.current.balanceAccount && balanceAccount) {
        // Update initial balance account selection (first selection only)
        initialFilters.current.balanceAccount = balanceAccount;
    }

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

    const insightsCurrencies = useMemo(
        () => availableCurrencies.map((currency): SelectItem => ({ id: currency, name: currency })),
        [availableCurrencies]
    );

    const onInsightsCurrencyChange = useCallback(
        ({ target }: { target?: { value: string } }) => {
            const selectedCurrency = target?.value;
            const insightsCurrency = selectedCurrency && insightsCurrencies.find(({ id }) => id === selectedCurrency)?.id;
            if (insightsCurrency) setInsightsCurrency?.(insightsCurrency);
        },
        [insightsCurrencies, setInsightsCurrency]
    );

    const { resetBalanceAccountSelection, ...balanceAccountFilterProps } = useBalanceAccountSelection({
        allowAllSelection: false,
        onUpdateSelection: setBalanceAccount,
        balanceAccounts,
        eventCategory,
    });

    // const statusesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_STATUSES), []);
    // const statusesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.status.label'), [i18n]);

    const categoriesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_CATEGORIES), []);
    const categoriesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.category.label'), [i18n]);

    const currenciesFilterOptions = useMemo(() => selectionOptionsFor(availableCurrencies ?? []), [availableCurrencies]);
    const currenciesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.currency.label'), [i18n]);

    useEffect(() => {
        const defaultCurrency = balanceAccount?.defaultCurrencyCode;
        const insightsCurrency = defaultCurrency && insightsCurrencies.find(({ id }) => id === defaultCurrency)?.id;
        setInsightsCurrency?.(insightsCurrency);
    }, [balanceAccount, insightsCurrencies, setInsightsCurrency]);

    useEffect(() => setCurrencies(initialFilters.current.currencies), [availableCurrencies]);
    useEffect(() => onChange?.(currentFilters), [onChange, currentFilters]);

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
                setCreatedDate={setCreatedDate}
                timezone={balanceAccountFilterProps.activeBalanceAccount?.timeZone}
            />
            {isTransactionsView ? (
                <>
                    {/*<TransactionMultiSelectionFilter*/}
                    {/*    eventLabel="Status filter"*/}
                    {/*    eventCategory={eventCategory}*/}
                    {/*    placeholder={statusesFilterPlaceholder}*/}
                    {/*    selectionOptions={statusesFilterOptions}*/}
                    {/*    selection={statuses}*/}
                    {/*    onUpdateFilter={setStatuses}*/}
                    {/*/>*/}
                    <TransactionMultiSelectionFilter
                        eventLabel="Category filter"
                        eventCategory={eventCategory}
                        placeholder={categoriesFilterPlaceholder}
                        selectionOptions={categoriesFilterOptions}
                        selection={categories}
                        onUpdateFilter={setCategories}
                    />
                    <TransactionMultiSelectionFilter
                        eventLabel="Currency filter"
                        eventCategory={eventCategory}
                        placeholder={currenciesFilterPlaceholder}
                        selectionOptions={currenciesFilterOptions}
                        selection={currencies}
                        onUpdateFilter={setCurrencies}
                    />
                    <TransactionPspReferenceFilter eventCategory={eventCategory} onChange={setPaymentPspReference} value={paymentPspReference} />
                </>
            ) : (
                <>
                    {insightsCurrencies.length > 1 ? (
                        <Select
                            filterable={false}
                            multiSelect={false}
                            items={insightsCurrencies}
                            onChange={onInsightsCurrencyChange}
                            selected={insightsCurrency}
                            aria-label={currenciesFilterPlaceholder}
                            placeholder={insightsCurrency || currenciesFilterPlaceholder}
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
