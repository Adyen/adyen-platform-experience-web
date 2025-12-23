import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import createRangeTimestampsFactory, { RangeTimestamps } from '../../../../internal/Calendar/calendar/timerange';
import { DateFilterProps, DateRangeFilterParam } from '../../../../internal/FilterBar/filters/DateFilter/types';
import DateFilterCore from '../../../../internal/FilterBar/filters/DateFilter/DateFilterCore';
import useFilterAnalyticsEvent from '../../../../../hooks/useAnalytics/useFilterAnalyticsEvent';
import { TransactionsDateRange } from '../../types';
import { EMPTY_OBJECT } from '../../../../../utils';
import {
    TRANSACTION_DATE_RANGE_CUSTOM,
    TRANSACTION_DATE_RANGE_DEFAULT,
    TRANSACTION_DATE_RANGE_MAX_YEARS,
    TRANSACTION_DATE_RANGES,
} from '../../constants';

export interface TransactionDateFilterProps {
    createdDate: RangeTimestamps;
    eventCategory?: string;
    setCreatedDate: (createdDate: RangeTimestamps) => void;
    timezone?: string;
}

// [TODO]: Fix date filter bug (reset and select custom date range)
const TransactionDateFilter = ({ createdDate, eventCategory, setCreatedDate, timezone }: TransactionDateFilterProps) => {
    const { i18n } = useCoreContext();
    const { logEvent } = useFilterAnalyticsEvent({ category: eventCategory, label: 'Date filter' });

    // prettier-ignore
    const [from, to] = useMemo(() => [
        new Date(createdDate.from).toISOString(),
        new Date(createdDate.to).toISOString(),
    ], [createdDate]);

    const [sinceDate, untilDate] = useMemo(() => {
        const sinceDate = new Date();
        sinceDate.setFullYear(sinceDate.getFullYear() - TRANSACTION_DATE_RANGE_MAX_YEARS);
        return [sinceDate.toISOString(), new Date().toISOString()];
    }, []);

    const filterLabel = useMemo(() => i18n.get('common.filters.types.date.label'), [i18n]);
    const customDateRange = useMemo(() => i18n.get(TRANSACTION_DATE_RANGE_CUSTOM), [i18n]);
    const defaultDateRange = useMemo(() => i18n.get(TRANSACTION_DATE_RANGE_DEFAULT), [i18n]);

    const [selectedDateRange, setSelectedDateRange] = useState(defaultDateRange);

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
                setCreatedDate(nextCreatedDate);
                logEvent?.('update', `${nextCreatedDate.from},${nextCreatedDate.to}`);
            }
        },
        [i18n, createdDate, customDateRange, defaultDateRange, selectedDateRange, logEvent]
    );

    const onFilterResetAction = useCallback<NonNullable<DateFilterProps['onResetAction']>>(() => void logEvent?.('reset'), [logEvent]);

    useEffect(() => {
        const dateRangeKey = Object.entries(TRANSACTION_DATE_RANGES).find(([_, timestamps]) => timestamps === createdDate)?.[0];
        setSelectedDateRange(dateRangeKey ? i18n.get(dateRangeKey as TransactionsDateRange) : customDateRange);
    }, [createdDate, customDateRange, i18n]);

    return (
        <DateFilterCore
            name={'createdAt'}
            now={Date.now()}
            label={filterLabel}
            aria-label={filterLabel}
            sinceDate={sinceDate}
            untilDate={untilDate}
            from={from}
            to={to}
            onChange={onFilterChange}
            onResetAction={onFilterResetAction} // [TODO]: Ensure filter reset event is logged
            selectedPresetOption={selectedDateRange}
            timeRangePresetOptions={TRANSACTION_DATE_RANGES}
            timezone={timezone}
            showTimezoneInfo
        />
    );
};

export default TransactionDateFilter;
