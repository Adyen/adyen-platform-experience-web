import { useEffect, useMemo } from 'preact/hooks';
import { EditAction, FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import { DateFilterProps, DateRangeFilterParam } from './types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Language from '../../../../../language';
import Calendar from '@src/components/internal/Calendar/Calendar';
import { CalendarTraversalControls } from '@src/components/internal/Calendar/types';
import useDatePicker, { resolveDate } from '@src/components/internal/DatePicker/hooks/useDatePicker';
import useDatePickerCalendarControls from '@src/components/internal/DatePicker/hooks/useDatePickerCalendarControls';
import '@src/components/internal/DatePicker/DatePicker.scss';
import './DateFilter.scss';

const computeDateFilterValue = (i18n: Language, fromDate?: string, toDate?: string) => {
    const from = fromDate && i18n.fullDate(fromDate);
    const to = toDate && i18n.fullDate(toDate);

    if (from && to) return `${from} - ${to}`;
    if (from) return i18n.get('filter.date.since', { values: { date: from } });
    if (to) return i18n.get('filter.date.until', { values: { date: to } });
};

const renderDateFilterModalBody = (() => {
    const DateFilterEditModalBody = (props: FilterEditModalRenderProps<DateFilterProps>) => {
        const { editAction, from, to, onChange, onValueUpdated } = props;

        const { i18n } = useCoreContext();
        const { fromValue, originDate, prepare, resetRange, selectDate, toValue } = useDatePicker({ from, to });
        const [renderControl, calendarControlsContainerRef] = useDatePickerCalendarControls();

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
                    resetRange();
            }
        }, [editAction, fromValue, toValue, onChange, resetRange]);

        return (
            <>
                <div ref={calendarControlsContainerRef} className={'adyen-fp-datepicker__controls'} role="group" />
                <Calendar
                    dynamicMonthWeeks={false}
                    firstWeekDay={1}
                    onlyMonthDays={true}
                    onSelected={selectDate}
                    originDate={originDate}
                    prepare={prepare}
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
