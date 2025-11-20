import { h } from 'preact';
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
import InputBase from '../../../../internal/FormFields/InputBase';
import Typography from '../../../../internal/Typography/Typography';
import TextFilter from '../../../../internal/FilterBar/filters/TextFilter';
import { TextFilterProps } from '../../../../internal/FilterBar/filters/TextFilter/types';
import { FilterEditModalRenderProps } from '../../../../internal/FilterBar/filters/BaseFilter/types';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { TransactionsOverviewFilters as Filters } from './types';
import { CommitAction } from '../../../../../hooks/useCommitAction';
import { FilterBarState } from '../../../../internal/FilterBar/types';
import { IBalanceAccountBase } from '../../../../../types';
import { EMPTY_OBJECT, uniqueId } from '../../../../../utils';
import {
    INITIAL_FILTERS,
    TRANSACTION_CATEGORIES,
    TRANSACTION_DATE_RANGE_CUSTOM,
    TRANSACTION_DATE_RANGE_DEFAULT,
    TRANSACTION_DATE_RANGE_MAX_MONTHS,
    TRANSACTION_DATE_RANGES,
    TransactionDateRange,
} from './constants';
import './TransactionsOverviewFilters.scss';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';

export const getCustomRangeTimestamps = ([from, to]: [number, number]) => createRangeTimestampsFactory({ from, to })();

export interface TransactionsOverviewFiltersProps extends Omit<FilterBarState, 'setShowingFilters'> {
    activeView: TransactionsView;
    availableCurrencies: readonly string[];
    balanceAccounts?: IBalanceAccountBase[];
    eventCategory?: string;
    onChange?: (filters: Readonly<Filters>) => void;
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
    const [pspReference, setPspReference] = useState(INITIAL_FILTERS.pspReference);
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

    // prettier-ignore
    const [from, to] = useMemo(() => [
        new Date(createdDate.from).toISOString(),
        new Date(createdDate.to).toISOString(),
    ], [createdDate]);

    const [sinceDate, untilDate] = useMemo(() => {
        const sinceDate = new Date();
        sinceDate.setMonth(sinceDate.getMonth() - TRANSACTION_DATE_RANGE_MAX_MONTHS);
        return [sinceDate.toISOString(), new Date().toISOString()];
    }, []);

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
    const pspReferenceFilterLabel = useMemo(() => i18n.get('transactions.overview.filters.types.pspReference.label'), [i18n]);
    const dateFilterLabel = useMemo(() => i18n.get('common.filters.types.date.label'), [i18n]);

    const isTransactionsListView = activeView === TransactionsView.TRANSACTIONS;

    // const canResetFilters = useMemo(
    //     () =>
    //         (!!balanceAccount && initialBalanceAccount.current !== balanceAccount) ||
    //         INITIAL_FILTERS.pspReference !== pspReference ||
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
        setPspReference(INITIAL_FILTERS.pspReference);
        setBalanceAccount(initialBalanceAccount.current);
        setSelectedDateRange(defaultDateRange);
    }, [defaultDateRange]);

    useEffect(() => {
        onChange?.({
            balanceAccount,
            createdDate,
            categories,
            currencies,
            pspReference,
            statuses,
        } as const);
    }, [onChange, balanceAccount, createdDate, categories, currencies, pspReference, statuses]);

    return (
        <FilterBar
            {...filterBarProps}
            ariaLabelKey="transactions.overview.filters.label"
            canResetFilters={canResetFilters}
            resetFilters={resetFilters}
        >
            <BalanceAccountSelector {...balanceAccountFilterProps} />
            <DateFilterCore
                name={'createdAt'}
                now={Date.now()}
                label={dateFilterLabel}
                aria-label={dateFilterLabel}
                sinceDate={sinceDate}
                untilDate={untilDate}
                from={from}
                to={to}
                onChange={onDateFilterChange}
                onResetAction={onDateFilterResetAction} // [TODO]: Ensure filter reset event is logged
                selectedPresetOption={selectedDateRange}
                timeRangePresetOptions={TRANSACTION_DATE_RANGES}
                timezone={balanceAccountFilterProps.activeBalanceAccount?.timeZone}
                showTimezoneInfo
            />
            {isTransactionsListView && (
                <>
                    {/* <MultiSelectionFilter {...statusesFilterProps} placeholder={statusesFilterPlaceholder} /> */}
                    <MultiSelectionFilter {...categoriesFilterProps} placeholder={categoriesFilterPlaceholder} />
                    <MultiSelectionFilter {...currenciesFilterProps} placeholder={currenciesFilterPlaceholder} />
                    <TextFilter
                        name="pspReference"
                        label={pspReference ?? pspReferenceFilterLabel}
                        aria-label={pspReferenceFilterLabel}
                        onChange={setPspReference} // [TODO]: Ensure filter update and reset events are logged
                        render={props => <TransactionsOverviewFilters.PspReference {...props} />}
                        value={pspReference}
                    />
                </>
            )}
        </FilterBar>
    );
};

TransactionsOverviewFilters.PspReference = ({
    editAction,
    onChange,
    onValueUpdated,
    name,
    type,
    value,
}: FilterEditModalRenderProps<TextFilterProps>) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting('UTC');
    const fromDate = useMemo(
        () => dateFormat(new Date('2025-03-01T00:00:00.000Z'), { year: 'numeric', month: 'long', day: undefined }),
        [dateFormat]
    );

    const label = useMemo(() => i18n.get('transactions.overview.filters.types.pspReference.label'), [i18n]);
    const placeholder = useMemo(() => i18n.get('transactions.overview.filters.types.pspReference.placeholder'), [i18n]);
    const fromDateInfo = useMemo(() => i18n.get('transactions.overview.filters.types.pspReference.fromDateInfo', { values: { fromDate } }), [i18n]);

    const inputId = useRef(uniqueId()).current;
    const labelId = useRef(uniqueId()).current;
    const firstInputElementRef = useRef<HTMLInputElement | null>(null);

    const [currentValue, setCurrentValue] = useState(value);

    const handleInput = (evt: h.JSX.TargetedEvent<HTMLInputElement>) => {
        const inputElement = evt.currentTarget;
        const selectionEnd = inputElement.selectionEnd;
        const value = inputElement.value
            .replace(/[^a-z\d]/gi, '')
            .slice(0, 80)
            .toUpperCase();

        inputElement.value = value;
        inputElement.setSelectionRange(selectionEnd, selectionEnd);

        if (value !== currentValue) {
            setCurrentValue(value);
            onValueUpdated(value || undefined);
        }
    };

    useEffect(() => {
        switch (editAction) {
            case CommitAction.APPLY:
                onChange(currentValue);
                break;
            case CommitAction.CLEAR:
                onChange();
                break;
        }
    }, [editAction, onChange, currentValue]);

    useEffect(() => {
        if (firstInputElementRef.current) {
            firstInputElementRef.current.focus();
        }
    }, []);

    return (
        <div class="adyen-pe-psp-reference-filter">
            <div className="adyen-pe-psp-reference-filter__title">
                <label id={labelId} htmlFor={inputId}>
                    <Typography el={TypographyElement.DIV} variant={TypographyVariant.BODY} strongest>
                        {label}
                    </Typography>
                </label>
            </div>
            <div className="adyen-pe-psp-reference-filter__input">
                <InputBase
                    autoComplete="off"
                    uniqueId={inputId}
                    ref={firstInputElementRef}
                    data-testid={'pspReference'}
                    placeholder={placeholder}
                    name={name}
                    type={type}
                    value={currentValue}
                    onInput={handleInput}
                />
            </div>
            <Typography className="adyen-pe-psp-reference-filter__info" el={TypographyElement.PARAGRAPH} variant={TypographyVariant.CAPTION}>
                {fromDateInfo}
            </Typography>
        </div>
    );
};

export default TransactionsOverviewFilters;
