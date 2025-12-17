import {
    TRANSACTION_DATE_RANGE_CUSTOM,
    TRANSACTION_DATE_RANGE_DEFAULT,
    TRANSACTION_DATE_RANGE_MAX_YEARS,
    TRANSACTION_DATE_RANGES,
} from '../../constants';
import { EMPTY_OBJECT } from '../../../../../utils';
import { TransactionsDateRange } from '../../types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
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
}

const TransactionDateFilter = ({ createdDate, eventCategory, eventSubCategory, setCreatedDate, timezone }: TransactionDateFilterProps) => {
    const { i18n } = useCoreContext();

    const filterLabel = useMemo(() => i18n.get('common.filters.types.date.label'), [i18n]);
    const customDateRange = useMemo(() => i18n.get(TRANSACTION_DATE_RANGE_CUSTOM), [i18n]);
    const defaultDateRange = useMemo(() => i18n.get(TRANSACTION_DATE_RANGE_DEFAULT), [i18n]);
    const cachedCreatedDate = useRef(createdDate);

    const [selectedDateRange, setSelectedDateRange] = useState(defaultDateRange);
    const [pendingResetAction, setPendingResetAction] = useState(false);

    const { from, to, since, until, now } = useMemo(() => {
        const now = Date.now();
        const fromDate = new Date(createdDate.from);
        const toDate = new Date(createdDate.to);
        const sinceDate = new Date(now);
        const untilDate = new Date(now);

        sinceDate.setFullYear(sinceDate.getFullYear() - TRANSACTION_DATE_RANGE_MAX_YEARS);

        return {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
            since: sinceDate.toISOString(),
            until: untilDate.toISOString(),
            now,
        } as const;
    }, [createdDate]);

    const { logEvent } = useFilterAnalyticsEvent({ category: eventCategory, subCategory: eventSubCategory, label: 'Date filter' });

    const onFilterChange = useCallback<DateFilterProps['onChange']>(
        (params = EMPTY_OBJECT) => {
            const selected = params.selectedPresetOption || defaultDateRange;

            if (selected !== selectedDateRange || selected === customDateRange) {
                let nextCreatedDate: RangeTimestamps;

                if (selected === customDateRange) {
                    const since = params[DateRangeFilterParam.FROM];
                    const until = params[DateRangeFilterParam.TO];

                    nextCreatedDate = createRangeTimestampsFactory({
                        from: since ? new Date(since).getTime() : createdDate.from,
                        to: until ? new Date(until).getTime() : createdDate.to,
                    })();
                } else {
                    nextCreatedDate = Object.entries(TRANSACTION_DATE_RANGES).find(
                        ([range]) => i18n.get(range as TransactionsDateRange) === selected
                    )![1];
                }

                setSelectedDateRange(selected);
                setCreatedDate((cachedCreatedDate.current = nextCreatedDate));
                logEvent?.('update', `${nextCreatedDate.from},${nextCreatedDate.to}`);
            }
        },
        [i18n, createdDate, customDateRange, defaultDateRange, selectedDateRange, logEvent]
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
