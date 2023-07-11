import { useEffect, useMemo, useState } from 'preact/hooks';
import { EditAction, FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import { DateFilterProps, DateRangeFilterParam } from './types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Language from '../../../../../language';
import Calendar from '@src/components/internal/Calendar/Calendar';
import { DAY_MS } from '@src/components/internal/Calendar/internal/utils';
import {
    CalendarFlag,
    CalendarProps,
    CalendarRenderToken,
    CalendarRenderTokenContext,
    CalendarSelectionSnap,
    CalendarTraversalControls,
} from '@src/components/internal/Calendar/types';
import { withFlag } from '@src/components/internal/Calendar/components/CalendarGrid/utils';
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

        const [selectDate, resetValues, render] = useMemo(() => {
            let [[fromTimestampOffset, fromTimestamp] = [], [toTimestampOffset, toTimestamp] = []] = [from, to].map(dateValue => {
                let date: Date | undefined | number = dateValue ? new Date(dateValue) : undefined;
                const offset = date && +date - (date = date.setHours(0, 0, 0, 0));
                return [offset, date] as const;
            });

            const updateValue = (field: DateRangeFilterParam, value: string | number) => {
                if (fromTimestamp === toTimestamp && (fromTimestampOffset as number) > (toTimestampOffset as number)) {
                    [fromTimestampOffset, toTimestampOffset] = [toTimestampOffset, fromTimestampOffset];
                }

                const isFromField = field === DateRangeFilterParam.FROM;
                const dateValue = typeof value === 'number' ? value + ((isFromField ? fromTimestampOffset : toTimestampOffset) || 0) : value;
                const setValue = isFromField ? setFromValue : setToValue;

                setValue(previous => {
                    const current = resolveDate(dateValue);
                    if (current !== previous) setCalendarOriginDate(typeof dateValue === 'number' ? dateValue : undefined);
                    return current;
                });
            };

            const render = ((token, ctx) => {
                switch (token) {
                    case CalendarRenderToken.DATE: {
                        const { dateTime, flags } = ctx as CalendarRenderTokenContext[typeof token];
                        const props = { flags } as any;

                        if (withFlag(flags, CalendarFlag.WITHIN_MONTH)) {
                            const timestamp = new Date(dateTime).setHours(0, 0, 0, 0);

                            if (timestamp >= (fromTimestamp as number) && timestamp <= (toTimestamp as number))
                                props.flags |= CalendarFlag.WITHIN_SELECTION;

                            if (timestamp === fromTimestamp) props.flags |= CalendarFlag.SELECTION_START;
                            if (timestamp === toTimestamp) props.flags |= CalendarFlag.SELECTION_END;
                        }

                        return { props };
                    }
                    default:
                        return null;
                }
            }) as CalendarProps['render'];

            const resetValues = () => dateRangeFilterParams.forEach(field => updateValue(field, ''));

            const selectDate = (date: string, snapBehavior: CalendarSelectionSnap = CalendarSelectionSnap.START_EDGE) => {
                const timestamp = new Date(date).setHours(0, 0, 0, 0);

                if (fromTimestamp === undefined && toTimestamp === undefined) fromTimestamp = timestamp;
                else if (fromTimestamp !== undefined && toTimestamp !== undefined) {
                    if (timestamp < fromTimestamp) fromTimestamp = timestamp;
                    else if (timestamp - DAY_MS >= toTimestamp) toTimestamp = timestamp;
                    else {
                        switch (snapBehavior) {
                            case CalendarSelectionSnap.END_EDGE:
                                toTimestamp = timestamp;
                                break;
                            case CalendarSelectionSnap.FARTHEST_EDGE:
                            case CalendarSelectionSnap.NEAREST_EDGE: {
                                let fromStart = timestamp - fromTimestamp;
                                let toEnd = toTimestamp - timestamp;

                                if (snapBehavior === CalendarSelectionSnap.NEAREST_EDGE) [fromStart, toEnd] = [toEnd, fromStart];
                                if (fromStart > toEnd) fromTimestamp = timestamp;
                                else toTimestamp = timestamp;

                                break;
                            }
                            case CalendarSelectionSnap.START_EDGE:
                            default:
                                fromTimestamp = timestamp;
                                break;
                        }
                    }
                } else if (fromTimestamp === undefined && toTimestamp !== undefined) {
                    fromTimestamp = toTimestamp;
                    timestamp - DAY_MS < (toTimestamp as number) ? (fromTimestamp = timestamp) : (toTimestamp = timestamp);
                } else if (fromTimestamp !== undefined && toTimestamp === undefined) {
                    toTimestamp = fromTimestamp;
                    timestamp < (fromTimestamp as number) ? (fromTimestamp = timestamp) : (toTimestamp = timestamp);
                }

                if (fromTimestamp === undefined) fromTimestamp = toTimestamp;
                if (toTimestamp === undefined) toTimestamp = fromTimestamp;

                if (timestamp === fromTimestamp) updateValue(DateRangeFilterParam.FROM, fromTimestamp);
                if (timestamp === toTimestamp) updateValue(DateRangeFilterParam.TO, toTimestamp);

                return [fromTimestamp as number, toTimestamp as number];
            };

            if (fromTimestampOffset === undefined) fromTimestampOffset = 0;
            if (toTimestampOffset === undefined) toTimestampOffset = DAY_MS - 1;

            const originDate = fromTimestamp || toTimestamp || Date.now();

            updateValue(DateRangeFilterParam.FROM, fromTimestamp || '');
            updateValue(DateRangeFilterParam.TO, toTimestamp || '');
            setCalendarOriginDate(originDate);

            return [selectDate, resetValues, render] as const;
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
                    dynamicMonthWeeks={false}
                    firstWeekDay={1}
                    onlyMonthDays={true}
                    onSelected={selectDate}
                    originDate={calendarOriginDate}
                    render={render}
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
