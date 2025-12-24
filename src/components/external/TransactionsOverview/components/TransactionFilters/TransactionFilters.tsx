import { FilterBar } from '../../../../internal/FilterBar';
import { selectionOptionsFor } from '../MultiSelectionFilter';
import { IBalanceAccountBase } from '../../../../../types';
import { FilterBarState } from '../../../../internal/FilterBar/types';
import { INITIAL_FILTERS, TRANSACTION_CATEGORIES } from '../../constants';
import { TransactionsFilters as Filters } from '../../types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import TransactionMultiSelectionFilter from './TransactionMultiSelectionFilter';
import TransactionDateFilter from './TransactionDateFilter';

export interface TransactionsFiltersProps extends Omit<FilterBarState, 'setShowingFilters'> {
    availableCurrencies: readonly string[];
    balanceAccounts?: IBalanceAccountBase[];
    eventCategory?: string;
    onChange?: (filters: Readonly<Filters>) => void;
}

const TransactionsFilters = ({ availableCurrencies, balanceAccounts, eventCategory, onChange, ...filterBarProps }: TransactionsFiltersProps) => {
    const { i18n } = useCoreContext();

    const [statuses, setStatuses] = useState(INITIAL_FILTERS.statuses);
    const [categories, setCategories] = useState(INITIAL_FILTERS.categories);
    const [currencies, setCurrencies] = useState(INITIAL_FILTERS.currencies);
    const [createdDate, setCreatedDate] = useState(INITIAL_FILTERS.createdDate);
    const [paymentPspReference, setPaymentPspReference] = useState(INITIAL_FILTERS.paymentPspReference);
    const [balanceAccount, setBalanceAccount] = useState(INITIAL_FILTERS.balanceAccount);

    const cachedAvailableCurrencies = useRef(availableCurrencies);
    const initialBalanceAccount = useRef(balanceAccount);

    if (cachedAvailableCurrencies.current !== availableCurrencies) {
        cachedAvailableCurrencies.current = availableCurrencies;
        setCurrencies(INITIAL_FILTERS.currencies);
    }

    if (!initialBalanceAccount.current && balanceAccount) {
        initialBalanceAccount.current = balanceAccount;
    }

    const { resetBalanceAccountSelection, ...balanceAccountFilterProps } = useBalanceAccountSelection({
        allowAllSelection: false,
        onUpdateSelection: setBalanceAccount,
        balanceAccounts,
        eventCategory,
    });

    // const statusesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_STATUSES), []);
    const categoriesFilterOptions = useMemo(() => selectionOptionsFor(TRANSACTION_CATEGORIES), []);
    const currenciesFilterOptions = useMemo(() => selectionOptionsFor(availableCurrencies ?? []), [availableCurrencies]);

    // const statusesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.status.label'), [i18n]);
    const categoriesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.category.label'), [i18n]);
    const currenciesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.currency.label'), [i18n]);

    // const canResetFilters = useMemo(
    //     () =>
    //         (!!balanceAccount && initialBalanceAccount.current !== balanceAccount) ||
    //         INITIAL_FILTERS.pspReference !== pspReference ||
    //         INITIAL_FILTERS.createdDate !== createdDate ||
    //         String(INITIAL_FILTERS.statuses) !== String(statuses) ||
    //         String(INITIAL_FILTERS.categories) !== String(categories) ||
    //         String(INITIAL_FILTERS.currencies) !== String(currencies),
    //     [balanceAccount, createdDate, categories, currencies, statuses, pspReference]
    // );
    const canResetFilters = false;

    const resetFilters = useCallback(() => {
        setStatuses(INITIAL_FILTERS.statuses);
        setCategories(INITIAL_FILTERS.categories);
        setCurrencies(INITIAL_FILTERS.currencies);
        setCreatedDate(INITIAL_FILTERS.createdDate);
        setPaymentPspReference(INITIAL_FILTERS.paymentPspReference);
        setBalanceAccount(initialBalanceAccount.current);
    }, []);

    useEffect(() => {
        onChange?.({
            balanceAccount,
            createdDate,
            categories,
            currencies,
            paymentPspReference,
            statuses,
        } as const);
    }, [onChange, balanceAccount, createdDate, categories, currencies, paymentPspReference, statuses]);

    return (
        <FilterBar
            {...filterBarProps}
            ariaLabelKey="transactions.overview.filters.label"
            canResetFilters={canResetFilters}
            resetFilters={resetFilters}
        >
            <BalanceAccountSelector {...balanceAccountFilterProps} />
            <TransactionDateFilter
                createdDate={createdDate}
                eventCategory={eventCategory}
                setCreatedDate={setCreatedDate}
                timezone={balanceAccountFilterProps.activeBalanceAccount?.timeZone}
            />
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
        </FilterBar>
    );
};

export default TransactionsFilters;
