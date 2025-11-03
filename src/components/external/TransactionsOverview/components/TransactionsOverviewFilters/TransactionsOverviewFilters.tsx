import MultiSelectionFilter, { selectionOptionsFor } from '../MultiSelectionFilter';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useMultiSelectionFilterProps from '../../hooks/useMultiSelectionFilterProps';
import useMultiSelectionFilterCallbacks from '../../hooks/useMultiSelectionFilterCallbacks';
import useBalanceAccountSelectorProps from '../../hooks/useBalanceAccountSelectorProps';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import TransactionsOverviewDateFilter from '../TransactionsOverviewDateFilter/TransactionsOverviewDateFilter';
import { TransactionsOverviewSplitView, useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import { RangeTimestamps } from '../../../../internal/Calendar/calendar/timerange';
import { FilterBar } from '../../../../internal/FilterBar';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../../../../utils';
import {
    TRANSACTION_CATEGORIES,
    TRANSACTION_DATE_RANGE_CUSTOM,
    TRANSACTION_DATE_RANGES,
    TRANSACTION_DATE_RANGE_DEFAULT,
    /* TRANSACTION_STATUSES, */
    type TransactionDateRange,
} from './constants';

const TransactionsOverviewFilters = () => {
    const ctx = useTransactionsOverviewContext();
    const isTransactionsView = ctx.currentView === TransactionsOverviewSplitView.TRANSACTIONS;

    return (
        <FilterBar {...ctx.filterBar} ariaLabelKey="transactions.overview.filters.label">
            <TransactionsOverviewFilters.BalanceAccount />
            <TransactionsOverviewFilters.Date />
            {/*{isTransactionsView && <TransactionsOverviewFilters.Status />}*/}
            {isTransactionsView && <TransactionsOverviewFilters.Category />}
            {isTransactionsView && <TransactionsOverviewFilters.Currency />}
        </FilterBar>
    );
};

TransactionsOverviewFilters.BalanceAccount = () => {
    const { balanceAccounts, setBalanceAccount, eventCategory } = useTransactionsOverviewContext();
    const balanceAccountSelectorProps = useBalanceAccountSelectorProps({
        onUpdateSelection: setBalanceAccount,
        balanceAccounts,
        eventCategory,
    });
    return <BalanceAccountSelector {...balanceAccountSelectorProps} />;
};

TransactionsOverviewFilters.Date = () => {
    const { i18n } = useCoreContext();
    const { balanceAccount, dateRange, setDateRange } = useTransactionsOverviewContext();
    const mapOptionName = useCallback((option: TransactionDateRange) => i18n.get(option), [i18n]);

    const currentOption = useMemo(() => {
        if (dateRange) {
            const entries = Object.entries(TRANSACTION_DATE_RANGES ?? EMPTY_OBJECT) as [TransactionDateRange, RangeTimestamps][];
            return entries.find(([, range]) => range === dateRange)?.[0] ?? TRANSACTION_DATE_RANGE_CUSTOM;
        }
    }, [dateRange]);

    // [TODO]: Provide filter modification callbacks (such as logging events)
    return (
        <TransactionsOverviewDateFilter<TransactionDateRange>
            currentOption={currentOption}
            customOption={TRANSACTION_DATE_RANGE_CUSTOM}
            defaultOption={TRANSACTION_DATE_RANGE_DEFAULT}
            mapOptionName={mapOptionName}
            onChange={setDateRange}
            ranges={TRANSACTION_DATE_RANGES}
            timezone={balanceAccount?.timeZone}
        />
    );
};

// TransactionsOverviewFilters.Status = () => {
//     const { i18n } = useCoreContext();
//     const { statuses, setStatuses, eventCategory } = useTransactionsOverviewContext();
//     const selectionOptions = useMemo(() => selectionOptionsFor(TRANSACTION_STATUSES), []);
//     const placeholder = useMemo(() => i18n.get('transactions.overview.filters.types.status.label'), [i18n]);
//
//     const multiSelectionFilterProps = useMultiSelectionFilterProps({
//         ...useMultiSelectionFilterCallbacks<(typeof statuses)[number]>({
//             onUpdateFilter: setStatuses,
//             eventLabel: 'Status filter',
//             eventCategory,
//         }),
//         selection: statuses,
//         selectionOptions,
//     });
//
//     return <MultiSelectionFilter {...multiSelectionFilterProps} placeholder={placeholder} />;
// };

TransactionsOverviewFilters.Category = () => {
    const { i18n } = useCoreContext();
    const { categories, setCategories, eventCategory } = useTransactionsOverviewContext();
    const selectionOptions = useMemo(() => selectionOptionsFor(TRANSACTION_CATEGORIES), []);
    const placeholder = useMemo(() => i18n.get('transactions.overview.filters.types.category.label'), [i18n]);

    const multiSelectionFilterProps = useMultiSelectionFilterProps({
        ...useMultiSelectionFilterCallbacks<(typeof categories)[number]>({
            onUpdateFilter: setCategories,
            eventLabel: 'Category filter',
            eventCategory,
        }),
        selection: categories,
        selectionOptions,
    });

    return <MultiSelectionFilter {...multiSelectionFilterProps} placeholder={placeholder} />;
};

TransactionsOverviewFilters.Currency = () => {
    const { i18n } = useCoreContext();
    const { availableCurrencies, currencies, setCurrencies, eventCategory } = useTransactionsOverviewContext();
    const selectionOptions = useMemo(() => selectionOptionsFor(availableCurrencies), [availableCurrencies]);
    const placeholder = useMemo(() => i18n.get('transactions.overview.filters.types.currency.label'), [i18n]);

    const multiSelectionFilterProps = useMultiSelectionFilterProps({
        ...useMultiSelectionFilterCallbacks<(typeof currencies)[number]>({
            onUpdateFilter: setCurrencies,
            eventLabel: 'Currency filter',
            eventCategory,
        }),
        selection: currencies,
        selectionOptions,
    });

    return <MultiSelectionFilter {...multiSelectionFilterProps} placeholder={placeholder} />;
};

export default TransactionsOverviewFilters;
