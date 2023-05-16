import classnames from 'classnames';
import useCalendar from './internal/useCalendar';
import useCoreContext from '../../../core/Context/useCoreContext';
import { CalendarProps } from './types';
import { useMemo } from 'preact/hooks';
import './Calendar.scss';

export default function Calendar(props: CalendarProps) {
    const { i18n } = useCoreContext();
    const [ calendar, shiftCalendar ] = useCalendar(useMemo(() => ({ ...props, locale: i18n.locale }), [i18n, props]));

    return <>
        <button onClick={() => shiftCalendar(-1)}>&laquo;</button>
        <div className={'calendar'}>{
            [...calendar.months.map(month => {
                const monthKey = `${month.year}-${month.month + 1}`;
                const humanizedMonth = new Date(monthKey).toLocaleDateString(i18n.locale, { month: 'short', year: 'numeric' });

                return <div key={monthKey} className={'calendar__month'}>
                    <div className={'calendar__month-name'}>{humanizedMonth}</div>
                    <div className={'calendar__month-grid'}>{
                        [...month.weeks.map((week, index) => (
                            <div key={`${monthKey}:${index}`} className={'calendar__week'}>{
                                [...week.map((date, index) => {
                                    const isWithinMonth = week.isWithinMonthAt(index);

                                    const classes = classnames('calendar__date', {
                                        'calendar__date--first-week-day': week.isFirstWeekDayAt(index),
                                        'calendar__date--weekend': week.isWeekendAt(index),
                                        'calendar__date--within-month': isWithinMonth
                                    });

                                    return <span key={date} className={classes}>{isWithinMonth && +date.slice(-2)}</span>
                                })]
                            }</div>
                        ))]
                    }</div>
                </div>;
            })]
        }</div>
        <button onClick={() => shiftCalendar(1)}>&raquo;</button>
    </>;
}
