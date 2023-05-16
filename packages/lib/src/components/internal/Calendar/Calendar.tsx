import classnames from 'classnames';
import useCalendar from './internal/useCalendar';
import useCoreContext from '../../../core/Context/useCoreContext';
import { CalendarProps } from './types';
import './Calendar.scss';

export default function Calendar({ calendarMonths = 1, firstWeekDay = 0, originDate = Date.now() }: CalendarProps) {
    const { i18n } = useCoreContext();
    const calendar = useCalendar({ calendarMonths, firstWeekDay, originDate, locale: i18n.locale });

    return <div className={'calendar'}>{
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
    }</div>;
}
