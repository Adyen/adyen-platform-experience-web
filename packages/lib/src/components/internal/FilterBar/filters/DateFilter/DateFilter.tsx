import { useEffect, useMemo } from 'preact/hooks';
import { EditAction, FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import { DateFilterProps, DateRangeFilterParam } from './types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Language from '../../../../../language';
import Calendar from '@src/components/internal/Calendar';
import calendar from '@src/components/internal/Calendar/calendar';
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
        const { editAction, from, to, rangeStart, rangeEnd, onChange, onValueUpdated } = props;

        const { i18n } = useCoreContext();
        const { fromValue, originDate, prepare, resetRange, selectDate, toValue } = useDatePicker({ from, to, rangeStart, rangeEnd });
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
                    controls={calendar.controls.MINIMAL}
                    dynamicBlockRows={false}
                    firstWeekDay={1}
                    highlight={calendar.highlight.MANY}
                    onHighlight={selectDate}
                    onlyCellsWithin={false}
                    // originDate={originDate}
                    prepare={prepare}
                    renderControl={renderControl}
                    sinceDate={rangeStart ? new Date(rangeStart) : undefined}
                    untilDate={rangeEnd ? new Date(rangeEnd) : undefined}
                />
            </>
        );
    };

    return (props: FilterEditModalRenderProps<DateFilterProps>) => <DateFilterEditModalBody {...props} />;
})();

export default function DateFilter<T extends DateFilterProps = DateFilterProps>(props: FilterProps<T>) {
    const { from, to, rangeStart, rangeEnd } = props;

    const { i18n } = useCoreContext();
    const fromDate = useMemo(() => resolveDate(from), [from]);
    const toDate = useMemo(() => resolveDate(to), [to]);
    const rangeStartDate = useMemo(() => resolveDate(rangeStart), [rangeStart]);
    const rangeEndDate = useMemo(() => resolveDate(rangeEnd), [rangeEnd]);
    const value = useMemo(() => computeDateFilterValue(i18n, fromDate, toDate), [i18n, fromDate, toDate]);

    return (
        <BaseFilter<T>
            {...props}
            from={fromDate}
            to={toDate}
            rangeStart={rangeStartDate}
            rangeEnd={rangeEndDate}
            value={value}
            type={'date'}
            render={renderDateFilterModalBody}
        />
    );
}
