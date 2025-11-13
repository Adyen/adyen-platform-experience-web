import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { FilterBar } from '../../../../internal/FilterBar';
import { TransactionsView } from '../TransactionsOverview/constants';
import MultiSelectionFilter, { selectionOptionsFor } from '../MultiSelectionFilter';
import BalanceAccountSelector from '../../../../internal/FormFields/Select/BalanceAccountSelector';
import useMultiSelectionFilterProps from '../../../../../hooks/useMultiSelectionFilterProps';
import useBalanceAccountSelection from '../../../../../hooks/useBalanceAccountSelection';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import createRangeTimestampsFactory, { RangeTimestamps } from '../../../../internal/Calendar/calendar/timerange';
import { DateFilterProps, DateRangeFilterParam } from '../../../../internal/FilterBar/filters/DateFilter/types';
import DateFilterCore from '../../../../internal/FilterBar/filters/DateFilter/DateFilterCore';
import useFilterAnalyticsEvent from '../../../../../hooks/analytics/useFilterAnalyticsEvent';
import type { TransactionsOverviewFilters } from './types';
import { EMPTY_OBJECT } from '../../../../../utils';
import {
    INITIAL_FILTERS,
    TRANSACTION_CATEGORIES,
    TRANSACTION_DATE_RANGE_CUSTOM,
    TRANSACTION_DATE_RANGE_DEFAULT,
    TRANSACTION_DATE_RANGE_MAX_MONTHS,
    TRANSACTION_DATE_RANGES,
    TransactionDateRange,
    /*TRANSACTION_STATUSES,*/
} from './constants';
import { FilterBarState } from '../../../../internal/FilterBar/types';
import { IBalanceAccountBase } from '../../../../../types';

export const getCustomRangeTimestamps = ([from, to]: [number, number]) => createRangeTimestampsFactory({ from, to })();

export interface TransactionsOverviewFiltersProps extends Omit<FilterBarState, 'setShowingFilters'> {
    activeView: TransactionsView;
    availableCurrencies?: string[];
    balanceAccounts?: IBalanceAccountBase[];
    eventCategory?: string;
    onChange?: (filters: Readonly<TransactionsOverviewFilters>) => void;
}

const TransactionsOverviewFilters = ({
    activeView,
    availableCurrencies,
    balanceAccounts,
    eventCategory,
    onChange,
    ...filterBarProps
}: TransactionsOverviewFiltersProps) => {
    const { i18n } = useCoreContext();
    const { logEvent: logDateFilterEvent } = useFilterAnalyticsEvent({ category: eventCategory, label: 'Date filter' });

    const [statuses, setStatuses] = useState(INITIAL_FILTERS.statuses);
    const [categories, setCategories] = useState(INITIAL_FILTERS.categories);
    const [currencies, setCurrencies] = useState(INITIAL_FILTERS.currencies);
    const [createdDate, setCreatedDate] = useState(INITIAL_FILTERS.createdDate);
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

    const customDateRange = useMemo(() => i18n.get(TRANSACTION_DATE_RANGE_CUSTOM), [i18n]);
    const defaultDateRange = useMemo(() => i18n.get(TRANSACTION_DATE_RANGE_DEFAULT), [i18n]);
    const [selectedDateRange, setSelectedDateRange] = useState(defaultDateRange);

    const onDateFilterChange = useCallback<DateFilterProps['onChange']>(
        (params = EMPTY_OBJECT) => {
            const selected = params.selectedPresetOption || defaultDateRange;

            if (selected !== selectedDateRange || selected === customDateRange) {
                let nextCreatedDate: RangeTimestamps;

                if (selected === customDateRange) {
                    const since = params[DateRangeFilterParam.FROM];
                    const until = params[DateRangeFilterParam.TO];

                    nextCreatedDate = getCustomRangeTimestamps([
                        since ? new Date(since).getTime() : createdDate.from,
                        until ? new Date(until).getTime() : createdDate.to,
                    ]);
                } else {
                    nextCreatedDate = Object.entries(TRANSACTION_DATE_RANGES).find(
                        ([range]) => i18n.get(range as TransactionDateRange) === selected
                    )![1];
                }

                setSelectedDateRange(selected);
                setCreatedDate(nextCreatedDate);
                logDateFilterEvent?.('update', `${nextCreatedDate.from},${nextCreatedDate.to}`);
            }
        },
        [i18n, createdDate, customDateRange, defaultDateRange, selectedDateRange, logDateFilterEvent]
    );

    const onDateFilterResetAction = useCallback<NonNullable<DateFilterProps['onResetAction']>>(
        () => void logDateFilterEvent?.('reset'),
        [logDateFilterEvent]
    );

    const { resetBalanceAccountSelection, ...balanceAccountFilterProps } = useBalanceAccountSelection({
        allowAllSelection: false,
        onUpdateSelection: setBalanceAccount,
        balanceAccounts,
        eventCategory,
    });

    // const statusesFilterProps = useMultiSelectionFilterProps({
    //     eventCategory,
    //     eventLabel: 'Status filter',
    //     onUpdateFilter: setStatuses,
    //     selection: statuses,
    //     selectionOptions: useMemo(() => selectionOptionsFor(TRANSACTION_STATUSES), []),
    // });

    const categoriesFilterProps = useMultiSelectionFilterProps({
        eventCategory,
        eventLabel: 'Category filter',
        onUpdateFilter: setCategories,
        selection: categories,
        selectionOptions: useMemo(() => selectionOptionsFor(TRANSACTION_CATEGORIES), []),
    });

    const currenciesFilterProps = useMultiSelectionFilterProps({
        eventCategory,
        eventLabel: 'Currency filter',
        onUpdateFilter: setCurrencies,
        selection: currencies,
        selectionOptions: useMemo(() => selectionOptionsFor(availableCurrencies ?? []), [availableCurrencies]),
    });

    // const statusesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.status.label'), [i18n]);
    const categoriesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.category.label'), [i18n]);
    const currenciesFilterPlaceholder = useMemo(() => i18n.get('transactions.overview.filters.types.currency.label'), [i18n]);

    const isTransactionsListView = activeView === TransactionsView.TRANSACTIONS;

    // const canResetFilters = useMemo(
    //     () =>
    //         (!!balanceAccount && initialBalanceAccount.current !== balanceAccount) ||
    //         INITIAL_FILTERS.createdDate !== createdDate ||
    //         String(INITIAL_FILTERS.statuses) !== String(statuses) ||
    //         String(INITIAL_FILTERS.categories) !== String(categories) ||
    //         String(INITIAL_FILTERS.currencies) !== String(currencies),
    //     [balanceAccount, createdDate, categories, currencies, statuses]
    // );
    const canResetFilters = false;

    const resetFilters = useCallback(() => {
        setStatuses(INITIAL_FILTERS.statuses);
        setCategories(INITIAL_FILTERS.categories);
        setCurrencies(INITIAL_FILTERS.currencies);
        setCreatedDate(INITIAL_FILTERS.createdDate);
        setBalanceAccount(initialBalanceAccount.current);
        setSelectedDateRange(defaultDateRange);
    }, [defaultDateRange]);

    useEffect(() => {
        onChange?.({
            balanceAccount,
            createdDate,
            categories,
            currencies,
            statuses,
        } as const);
    }, [onChange, balanceAccount, createdDate, categories, currencies, statuses]);

    return (
        <FilterBar
            {...filterBarProps}
            ariaLabelKey="transactions.overview.filters.label"
            canResetFilters={canResetFilters}
            resetFilters={resetFilters}
        >
            <BalanceAccountSelector {...balanceAccountFilterProps} />

            <TransactionsDateFilter
                createdDate={createdDate}
                onChange={onDateFilterChange}
                onResetAction={onDateFilterResetAction}
                selectedDateRange={selectedDateRange}
                timezone={balanceAccountFilterProps.activeBalanceAccount?.timeZone}
            />

            {isTransactionsListView && (
                <>
                    {/* <MultiSelectionFilter {...statusesFilterProps} placeholder={statusesFilterPlaceholder} /> */}
                    <MultiSelectionFilter {...categoriesFilterProps} placeholder={categoriesFilterPlaceholder} />
                    <MultiSelectionFilter {...currenciesFilterProps} placeholder={currenciesFilterPlaceholder} />
                </>
            )}
        </FilterBar>
    );
};

// [TODO]: Replace date filter
const TransactionsDateFilter = ({
    createdDate,
    onChange,
    onResetAction,
    selectedDateRange,
    timezone,
}: {
    createdDate: RangeTimestamps;
    onChange: DateFilterProps['onChange'];
    onResetAction: DateFilterProps['onResetAction'];
    selectedDateRange: string;
    timezone?: string;
}) => {
    const { i18n } = useCoreContext();

    // prettier-ignore
    const [from, to] = useMemo(() => [
        new Date(createdDate.from).toISOString(),
        new Date(createdDate.to).toISOString(),
    ], [createdDate]);

    const sinceDate = useMemo(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - TRANSACTION_DATE_RANGE_MAX_MONTHS);
        return date.toISOString();
    }, []);

    const label = useMemo(() => i18n.get('common.filters.types.date.label'), [i18n]);

    return (
        <DateFilterCore
            label={label}
            aria-label={label}
            name={'createdAt'}
            now={Date.now()}
            sinceDate={sinceDate}
            untilDate={new Date().toISOString()}
            from={from}
            to={to}
            selectedPresetOption={selectedDateRange}
            timeRangePresetOptions={TRANSACTION_DATE_RANGES}
            timezone={timezone}
            onChange={onChange}
            onResetAction={onResetAction}
            showTimezoneInfo
        />
    );
};

export default TransactionsOverviewFilters;
