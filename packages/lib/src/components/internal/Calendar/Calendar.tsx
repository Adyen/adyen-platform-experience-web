import { CalendarMonth, UseCalendarConfig } from './types';
import useCalendar from './internal/useCalendar';
import useCoreContext from '../../../core/Context/useCoreContext';
import createCalendarMonth from "./internal/createCalendarMonth";

export default function Calendar({
    calendarMonths = 1,
    firstWeekDay = 0,
    startDate = Date.now()
}: UseCalendarConfig) {
    const { i18n } = useCoreContext();
    const { calendar, offset } = useCalendar({ calendarMonths, firstWeekDay, startDate });

    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 20rem))', justifyContent: 'center' }}>{
        calendar.offsets.map((_, index) => {
            const month = createCalendarMonth(firstWeekDay, calendar, index as CalendarMonth);
            const displayedMonth = new Date(`${month.year}-${month.month}`).toLocaleDateString(i18n.locale, { month: 'short', year: 'numeric' });

            return <div key={`${month.year}-${month.month}`} style={{ marginInline: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25em', fontWeight: 600, marginBlockEnd: '2rem' }}>{displayedMonth}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', justifyContent: 'space-around', rowGap: '0.75rem' }}>{
                    [...month].map((date, index) => {
                        return <span key={date} style={{
                            color: month.isFirstWeekDayAt(index) ? 'red' : month.isWeekendAt(index) ? 'green' : 'black',
                            fontSize: '0.875em',
                            opacity: month.isWithinMonthAt(index) ? 1 : 0.3
                        }}>{+date.slice(-2)}</span>;
                    })
                }</div>
            </div>;
        })
    }</div>;
}
