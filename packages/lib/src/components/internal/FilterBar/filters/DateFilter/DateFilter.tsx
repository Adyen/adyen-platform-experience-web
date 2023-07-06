import { useEffect, useMemo, useState } from 'preact/hooks';
import { EditAction, FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import { DateFilterProps, DateRangeFilterParam } from './types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Language from '../../../../../language';
import Calendar from '@src/components/internal/Calendar/Calendar';
import { DAY_MS } from '@src/components/internal/Calendar/internal/utils';
import { CalendarTraversalControls } from '@src/components/internal/Calendar/types';
import useDatePickerCalendarControls from '@src/components/internal/DatePicker/hooks/useDatePickerCalendarControls';
import '@src/components/internal/DatePicker/DatePicker.scss';
import './DateFilter.scss';

const dateRangeFilterParams = [DateRangeFilterParam.FROM, DateRangeFilterParam.TO] as const;

const computeDateFilterValue = (i18n: Language, fromDate?: string, toDate?: string) => {
    const from = fromDate && i18n.fullDate(fromDate);
    const to = toDate && i18n.fullDate(toDate);

    if (from && to) return `${from} - ${to}`;
    if (from) return i18n.get('filter.date.since', { values: { date: from } });
    if (to) return i18n.get('filter.date.until', { values: { date: to } });
};

const resolveDate = (date?: any) => {
    try {
        if (date) return new Date(date).toISOString();
    } catch {
        /* invalid date: fallback to empty string */
    }
    return '';
};

const renderDateFilterModalBody = (() => {
    const DateFilterEditModalBody = (props: FilterEditModalRenderProps<DateFilterProps>) => {
        const { editAction, from, to, onChange, onValueUpdated } = props;

        const { i18n } = useCoreContext();
        const [fromValue, setFromValue] = useState<string>();
        const [toValue, setToValue] = useState<string>();
        const [calendarOriginDate, setCalendarOriginDate] = useState<number>();
        const [renderControl, calendarControlsContainerRef] = useDatePickerCalendarControls();

        const [selectDate, resetValues] = useMemo(() => {
            let [[fromTimestampOffset, fromTimestamp] = [], [toTimestampOffset, toTimestamp] = []] = [from, to].map(dateValue => {
                let date: Date | undefined | number = dateValue ? new Date(dateValue) : undefined;
                const offset = date && +date - (date = date.setHours(0, 0, 0, 0));
                return [offset, date] as const;
            });

            const updateValue = (field: DateRangeFilterParam, value: string | number) => {
                const isFromField = field === DateRangeFilterParam.FROM;
                const setValue = isFromField ? setFromValue : setToValue;
                const dateValue = typeof value === 'number' ? value + ((isFromField ? fromTimestampOffset : toTimestampOffset) || 0) : value;

                setValue(previous => {
                    const current = resolveDate(dateValue);
                    if (current !== previous) setCalendarOriginDate(typeof dateValue === 'number' ? dateValue : undefined);
                    return current;
                });
            };

            const resetValues = () => dateRangeFilterParams.forEach(field => updateValue(field, ''));

            const selectDate = (date: string) => {
                const timestamp = new Date(date).setHours(0, 0, 0, 0);

                if (fromTimestamp || toTimestamp) {
                    if (!fromTimestamp) {
                        fromTimestamp = toTimestamp;
                        timestamp - DAY_MS < (toTimestamp as number) ? (fromTimestamp = timestamp) : (toTimestamp = timestamp);
                    } else if (!toTimestamp) {
                        toTimestamp = fromTimestamp;
                        timestamp < (fromTimestamp as number) ? (fromTimestamp = timestamp) : (toTimestamp = timestamp);
                    } else if (timestamp < fromTimestamp) fromTimestamp = timestamp;
                    else if (timestamp - DAY_MS >= toTimestamp) toTimestamp = timestamp;
                    else if (timestamp - fromTimestamp > toTimestamp - timestamp) fromTimestamp = timestamp;
                    else toTimestamp = timestamp;
                } else fromTimestamp = timestamp;

                timestamp === fromTimestamp && updateValue(DateRangeFilterParam.FROM, fromTimestamp);
                timestamp === toTimestamp && updateValue(DateRangeFilterParam.TO, toTimestamp);
            };

            updateValue(DateRangeFilterParam.FROM, fromTimestamp || '');
            updateValue(DateRangeFilterParam.TO, toTimestamp || '');
            setCalendarOriginDate(fromTimestamp || toTimestamp || undefined);

            return [selectDate, resetValues] as const;
        }, [from, to]);

        useEffect(() => {
            onValueUpdated(computeDateFilterValue(i18n, fromValue, toValue));
        }, [i18n, fromValue, toValue, onValueUpdated]);

        useEffect(() => {
            switch (editAction) {
                case EditAction.APPLY:
                    onChange({
                        [DateRangeFilterParam.FROM]: fromValue,
                        [DateRangeFilterParam.TO]: toValue,
                    });
                    break;

                case EditAction.CLEAR:
                    resetValues();
            }
        }, [editAction, fromValue, toValue, onChange, resetValues]);

        return (
            <>
                <div ref={calendarControlsContainerRef} className={'adyen-fp-datepicker__controls'} role="group" />
                <Calendar
                    firstWeekDay={1}
                    onlyMonthDays={true}
                    onSelected={selectDate}
                    originDate={calendarOriginDate}
                    renderControl={renderControl}
                    traversalControls={CalendarTraversalControls.CONDENSED}
                />
            </>
        );
    };

    return (props: FilterEditModalRenderProps<DateFilterProps>) => <DateFilterEditModalBody {...props} />;
})();

export default function DateFilter<T extends DateFilterProps = DateFilterProps>(props: FilterProps<T>) {
    const { from, to } = props;

    const { i18n } = useCoreContext();
    const fromDate = useMemo(() => resolveDate(from), [from]);
    const toDate = useMemo(() => resolveDate(to), [to]);
    const value = useMemo(() => computeDateFilterValue(i18n, fromDate, toDate), [i18n, fromDate, toDate]);

    return <BaseFilter<T> {...props} from={fromDate} to={toDate} value={value} type={'date'} render={renderDateFilterModalBody} />;
}
