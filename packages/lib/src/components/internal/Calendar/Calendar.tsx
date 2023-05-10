import {CalendarMonth, CalendarMapIteratorCallback, CalendarProps, CalendarMonthView} from './types';
import useCalendar from './internal/useCalendar';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';

const renderCalendarDateFallback: CalendarMapIteratorCallback<string> = (date, index, month) => {
    return <span key={date} style={{
        // color: month.isFirstWeekDayAt(index) ? 'red' : month.isWeekendAt(index) ? 'green' : 'black',
        // fontSize: '0.875em',
        // opacity: month.isWithinMonthAt(index) ? 1 : 0.3
    }}>{+date.slice(-2)}</span>;
};

const renderCalendarMonthFallback = (() => {
    const CalendarMonth = ({ month, renderCalendarDate }: { month: CalendarMonthView, renderCalendarDate: CalendarMapIteratorCallback<string> }) => {
        const { i18n } = useCoreContext();
        const key = useMemo(() => `${month.year}-${month.month}`, [month]);
        const humanizedMonth = useMemo(() => (
            new Date(key).toLocaleDateString(i18n.locale, { month: 'short', year: 'numeric' })
        ), [i18n, key]);

        return <div key={key} style={{ marginInline: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25em', fontWeight: 600, marginBlockEnd: '2rem' }}>{humanizedMonth}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', justifyContent: 'space-around', rowGap: '0.75rem' }}>{
                [...month.map(renderCalendarDate)]
            }</div>
        </div>;
    };

    return ((month) => (
        <CalendarMonth month={month} renderCalendarDate={renderCalendarDateFallback} />
    )) as CalendarMapIteratorCallback<CalendarMonthView>;
})();

export default function Calendar({
    calendarMonths = 1,
    firstWeekDay = 0,
    startDate = Date.now(),
    renderMonth
}: CalendarProps) {
    const { calendar } = useCalendar({ calendarMonths, firstWeekDay, startDate });
    const renderCalendarMonth = useMemo(() => renderMonth || renderCalendarMonthFallback, [renderMonth]);

    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 20rem))', justifyContent: 'center' }}>{
        [...calendar.map(renderCalendarMonth)]
    }</div>;
}
