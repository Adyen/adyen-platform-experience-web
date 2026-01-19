import {
    TRANSACTION_DATE_RANGE_CUSTOM,
    TRANSACTION_DATE_RANGE_DEFAULT,
    TRANSACTION_DATE_RANGE_LAST_180_DAYS,
    TRANSACTION_DATE_RANGE_LAST_30_DAYS,
    TRANSACTION_DATE_RANGE_LAST_7_DAYS,
    TRANSACTION_DATE_RANGE_LAST_MONTH,
    TRANSACTION_DATE_RANGE_LAST_WEEK,
    TRANSACTION_DATE_RANGE_MAX_YEARS,
    TRANSACTION_DATE_RANGE_THIS_MONTH,
    TRANSACTION_DATE_RANGE_THIS_WEEK,
    TRANSACTION_DATE_RANGE_YEAR_TO_DATE,
    TRANSACTION_DATE_RANGES,
} from '../../constants';
import { TransactionsDateRange } from '../../types';
import { EMPTY_OBJECT, unreachable } from '../../../../../utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getDateRangeTimestamps } from '../../../../internal/Calendar/calendar/timerange/utils';
import { DateFilterProps, DateRangeFilterParam } from '../../../../internal/FilterBar/filters/DateFilter/types';
import createRangeTimestampsFactory, { RangeTimestamps } from '../../../../internal/Calendar/calendar/timerange';
import DateFilterCore from '../../../../internal/FilterBar/filters/DateFilter/DateFilterCore';
import useFilterAnalyticsEvent from '../../../../../hooks/useAnalytics/useFilterAnalyticsEvent';
import useCoreContext from '../../../../../core/Context/useCoreContext';

export interface TransactionDateFilterProps {
    createdDate: RangeTimestamps;
    eventCategory?: string;
    eventSubCategory?: string;
    setCreatedDate: (createdDate: RangeTimestamps) => void;
    timezone?: string;
    now: number;
}

const getDateRangeSelectionEventValue = (dateRangeSelection: TransactionsDateRange) => {
    switch (dateRangeSelection) {
        case TRANSACTION_DATE_RANGE_CUSTOM:
            return 'Custom';
        case TRANSACTION_DATE_RANGE_LAST_7_DAYS:
            return 'Last 7 days';
        case TRANSACTION_DATE_RANGE_LAST_30_DAYS:
            return 'Last 30 days';
        case TRANSACTION_DATE_RANGE_LAST_180_DAYS:
            return 'Last 180 days';
        case TRANSACTION_DATE_RANGE_THIS_WEEK:
            return 'This week';
        case TRANSACTION_DATE_RANGE_LAST_WEEK:
            return 'Last week';
        case TRANSACTION_DATE_RANGE_THIS_MONTH:
            return 'This month';
        case TRANSACTION_DATE_RANGE_LAST_MONTH:
            return 'Last month';
        case TRANSACTION_DATE_RANGE_YEAR_TO_DATE:
            return 'Year to date';
        default:
            return unreachable(dateRangeSelection);
    }
};

const TransactionDateFilter = ({ createdDate, eventCategory, eventSubCategory, now, setCreatedDate, timezone }: TransactionDateFilterProps) => {
    const { i18n } = useCoreContext();

    const filterLabel = useMemo(() => i18n.get('common.filters.types.date.label'), [i18n]);
    const customDateRange = useMemo(() => i18n.get(TRANSACTION_DATE_RANGE_CUSTOM), [i18n]);
    const defaultDateRange = useMemo(() => i18n.get(TRANSACTION_DATE_RANGE_DEFAULT), [i18n]);
    const cachedCreatedDate = useRef(createdDate);

    const [selectedDateRange, setSelectedDateRange] = useState(defaultDateRange);
    const [pendingResetAction, setPendingResetAction] = useState(false);

    const { from, to, since, until } = useMemo(() => {
        const { from, to } = getDateRangeTimestamps(createdDate, now, timezone);
        const fromDate = new Date(from);
        const toDate = new Date(to);
        const sinceDate = new Date(now);
        const untilDate = new Date(now);

        sinceDate.setFullYear(sinceDate.getFullYear() - TRANSACTION_DATE_RANGE_MAX_YEARS);

        return {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
            since: sinceDate.toISOString(),
            until: untilDate.toISOString(),
        } as const;
    }, [createdDate, now, timezone]);

    const { logEvent } = useFilterAnalyticsEvent({ category: eventCategory, subCategory: eventSubCategory, label: 'Date filter' });

    const onFilterChange = useCallback<DateFilterProps['onChange']>(
        (params = EMPTY_OBJECT) => {
            const selected = params.selectedPresetOption || defaultDateRange;

            if (selected !== selectedDateRange || selected === customDateRange) {
                let selectedDateRangeKey: TransactionsDateRange = TRANSACTION_DATE_RANGE_CUSTOM;
                let nextCreatedDate: RangeTimestamps;

                if (selected === customDateRange) {
                    const since = params[DateRangeFilterParam.FROM];
                    const until = params[DateRangeFilterParam.TO];

                    nextCreatedDate = createRangeTimestampsFactory({
                        from: new Date(since || from).getTime(),
                        to: new Date(until || to).getTime(),
                    })();
                } else {
                    [selectedDateRangeKey, nextCreatedDate] = (
                        Object.entries(TRANSACTION_DATE_RANGES) as [TransactionsDateRange, RangeTimestamps][]
                    ).find(([range]) => i18n.get(range as TransactionsDateRange) === selected)!;
                }

                const eventValue =
                    selected === customDateRange
                        ? String([nextCreatedDate.from, nextCreatedDate.to])
                        : getDateRangeSelectionEventValue(selectedDateRangeKey);

                setSelectedDateRange(selected);
                setCreatedDate((cachedCreatedDate.current = nextCreatedDate));
                logEvent?.('update', eventValue);
            }
        },
        [i18n, from, to, customDateRange, defaultDateRange, selectedDateRange, logEvent]
    );

    const onFilterResetAction = useCallback(() => setPendingResetAction(true), []);

    useEffect(() => {
        if (!pendingResetAction) return;
        setPendingResetAction(false);
        if (cachedCreatedDate.current !== createdDate) logEvent?.('reset');
    }, [pendingResetAction, createdDate, logEvent]);

    useEffect(() => {
        const dateRangeKey = Object.entries(TRANSACTION_DATE_RANGES).find(([_, timestamps]) => timestamps === createdDate)?.[0];
        setSelectedDateRange(dateRangeKey ? i18n.get(dateRangeKey as TransactionsDateRange) : customDateRange);
    }, [createdDate, customDateRange, i18n]);

    return (
        <DateFilterCore
            name={'createdAt'}
            now={now}
            label={filterLabel}
            aria-label={filterLabel}
            sinceDate={since}
            untilDate={until}
            from={from}
            to={to}
            onChange={onFilterChange}
            onResetAction={onFilterResetAction}
            selectedPresetOption={selectedDateRange}
            timeRangePresetOptions={TRANSACTION_DATE_RANGES}
            timezone={timezone}
            showTimezoneInfo
        />
    );
};

export default TransactionDateFilter;
