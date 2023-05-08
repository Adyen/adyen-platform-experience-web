import { useMemo } from 'preact/hooks';
import { UseCalendarConfig } from './types';
import useCalendar from './useCalendar';
import useCoreContext from '../../../core/Context/useCoreContext';

export default function Calendar({
    calendarMonths = 1,
    firstWeekDay = 0,
    startDate = Date.now()
}: UseCalendarConfig) {
    const { i18n } = useCoreContext();
    const { calendar, offset } = useCalendar({ calendarMonths, firstWeekDay, startDate });
    const weekends =  useMemo(() => [0, 1].map(seed => (6 - firstWeekDay + seed) % 7), [firstWeekDay]);

    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 20rem))', justifyContent: 'center' }}>{
        calendar.offsets.map(([startIndex, monthStartIndex, monthEndIndex, endIndex]) => {
            const dates = calendar.dates.slice(startIndex, endIndex);
            const month = (dates[monthStartIndex] as string).replace(/-\d+$/, '');
            const displayedMonth = new Date(month).toLocaleDateString(i18n.locale, { month: 'short', year: 'numeric' });

            return <div key={month} style={{ marginInline: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25em', fontWeight: 600, marginBlock: '1rem' }}>{displayedMonth}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', justifyContent: 'space-around', rowGap: '0.75rem' }}>{
                    dates.map((date, index) => {
                        const isFirstDayOfWeek = !(index % 7);
                        const isWeekend = weekends.includes(index % 7);
                        const isWithinMonth = index >= monthStartIndex && index < monthEndIndex;

                        return <span key={date} style={{
                            color: isFirstDayOfWeek ? 'red' : isWeekend ? 'green' : 'black',
                            fontSize: '0.875em',
                            opacity: isWithinMonth ? 1 : 0.3
                        }}>{+date.slice(-2)}</span>;
                    })
                }</div>
            </div>;
        })
    }</div>;
}
