import classnames from 'classnames';
import useCalendar from './internal/useCalendar';
import useCoreContext from '../../../core/Context/useCoreContext';
import { CalendarProps, CalendarShift } from './types';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import { Fragment } from 'preact';
import Button from '../Button';
import './Calendar.scss';

const CalendarDate = ({ children }: any) => <Fragment>{ children }</Fragment>;
const InteractiveCalendarDate = ({ children, ...props }: any) => (
    <Button variant={'ghost'} classNameModifiers={['circle']} tabIndex={-1} {...props}>{ children }</Button>
);

export default function Calendar(props: CalendarProps) {
    const { i18n } = useCoreContext();
    const { calendar, postshift, preshift, today } = useCalendar(useMemo(() => ({ ...props, locale: i18n.locale }), [i18n, props]));
    const calendarShift = useRef(CalendarShift.MONTH);

    const CalendarDay = useMemo(() => typeof props.onSelected === 'function' ? InteractiveCalendarDate : CalendarDate, [props.onSelected]);
    const leftShiftCalendar = useCallback(() => preshift(calendarShift.current), []);
    const rightShiftCalendar = useCallback(() => postshift(calendarShift.current), []);

    const captureNavigationClick = useCallback((evt: Event) => {
        if ((evt.target as HTMLElement).closest('button')) {
            if ((evt as MouseEvent).shiftKey) calendarShift.current = CalendarShift.YEAR;
            else if ((evt as MouseEvent).altKey) calendarShift.current = CalendarShift.WINDOW;
            else calendarShift.current = CalendarShift.MONTH;
        }
    }, []);

    return <div role="group" aria-label="calendar">
        <div role="group" aria-label="calendar navigation" onClickCapture={captureNavigationClick} style={{ textAlign: 'center' }}>
            <Button
                aria-label={i18n.get('calendar.previousMonth')}
                variant={'ghost'}
                // disabled={props.page === 1}
                classNameModifiers={['circle', 'prev']}
                onClick={leftShiftCalendar}
                label={'◀︎'}
            />
            <Button
                aria-label={i18n.get('calendar.nextMonth')}
                variant={'ghost'}
                // disabled={!props.hasNextPage}
                classNameModifiers={['circle', 'next']}
                onClick={rightShiftCalendar}
                label={'▶︎'}
            />
        </div>

        <ol className={'calendar'} role="group" aria-label="calendar months">{
            [...calendar.months.map(view => {
                const month = `${view.year}-${(`0` + (view.month + 1)).slice(-2)}`;
                const humanizedMonth = new Date(month).toLocaleDateString(i18n.locale, { month: 'short', year: 'numeric' });

                return <li key={month} className={'calendar-month'}>
                    <div className={'calendar-month__name'}>
                        <time dateTime={month} aria-hidden="true">{humanizedMonth}</time>
                    </div>

                    <table className={'calendar-month__grid'} role="grid" aria-label={humanizedMonth}>
                        <thead>
                            <tr className={'calendar-month__grid-row'}>{
                                [...calendar.daysOfTheWeek.map(([long,, short]) => (
                                    <th key={long} className={'calendar-month__grid-cell'} scope="col" aria-label={long}>
                                        <abbr className={'calendar-month__day-of-week'} title={long}>{short}</abbr>
                                    </th>
                                ))]
                            }</tr>
                        </thead>

                        <tbody>{
                            [...view.weeks.map((week, index) => (
                                <tr key={`${month}:${index}`} className={'calendar-month__grid-row'}>{
                                    [...week.map((date, index) => {
                                        const isWithinMonth = week.isWithinMonthAt(index);
                                        const isTodayDate = date === today;

                                        const classes = classnames('calendar__date', {
                                            'calendar__date--first-week-day': week.isFirstWeekDayAt(index),
                                            'calendar__date--today': isTodayDate,
                                            'calendar__date--weekend': week.isWeekendAt(index),
                                            'calendar__date--within-month': isWithinMonth
                                        });

                                        const extraProps = isTodayDate
                                            ? { 'aria-selected': 'true', role: 'gridcell', tabIndex: 0 }
                                            : { tabIndex: -1 };

                                        return <td key={date} className={'calendar-month__grid-cell'} {...extraProps}>{
                                            (props.onlyMonthDays !== true || isWithinMonth) && (
                                                <CalendarDay onClick={() => props.onSelected?.(date)}>
                                                    <time className={classes} dateTime={date}>{ +date.slice(-2) }</time>
                                                </CalendarDay>
                                            )
                                        }</td>
                                    })]
                                }</tr>
                            ))]
                        }</tbody>
                    </table>
                </li>;
            })]
        }</ol>
    </div>;
}
