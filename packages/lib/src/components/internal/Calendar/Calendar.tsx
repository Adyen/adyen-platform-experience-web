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
    const { calendar, isToday, postshift, preshift } = useCalendar(useMemo(() => ({ ...props, locale: i18n.locale }), [i18n, props]));
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

    return <div role="grid">
        <div role="group" onClickCapture={captureNavigationClick} style={{ textAlign: 'center' }}>
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

        <div className={'calendar'}>{
            [...calendar.months.map(view => {
                const month = `${view.year}-${(`0` + (view.month + 1)).slice(-2)}`;
                const humanizedMonth = new Date(month).toLocaleDateString(i18n.locale, { month: 'short', year: 'numeric' });

                return <div key={month} className={'calendar-month'} role="group" aria-label={humanizedMonth}>
                    <div className={'calendar-month__name'}>
                        <time dateTime={month}>{humanizedMonth}</time>
                    </div>

                    <div className={'calendar-month__grid'} role="rowgroup">
                        <div className={'calendar-month__grid-row'} role="row">{
                            [...calendar.daysOfTheWeek.map(([long,, short]) => (
                                <div key={long} className={'calendar-month__grid-cell'} role="columnheader" aria-label={long}>
                                    <abbr className={'calendar-month__day-of-week'} title={long}>{short}</abbr>
                                </div>
                            ))]
                        }</div>

                        <>{[...view.weeks.map((week, index) => (
                            <div key={`${month}:${index}`} className={'calendar-month__grid-row'} role="row">{
                                [...week.map((date, index) => {
                                    const isWithinMonth = week.isWithinMonthAt(index);
                                    const isTodayDate = isToday(date);
                                    const extraProps = isTodayDate ? { role: 'gridcell', tabIndex: 0 } : {};

                                    const classes = classnames('calendar__date', {
                                        'calendar__date--first-week-day': week.isFirstWeekDayAt(index),
                                        'calendar__date--today': isTodayDate,
                                        'calendar__date--weekend': week.isWeekendAt(index),
                                        'calendar__date--within-month': isWithinMonth
                                    });

                                    return <div key={date} className={'calendar-month__grid-cell'}>{
                                        (props.onlyMonthDays !== true || isWithinMonth) && (
                                            <CalendarDay {...extraProps} onClick={() => props.onSelected?.(date)}>
                                                <time className={classes} dateTime={date}>{ +date.slice(-2) }</time>
                                            </CalendarDay>
                                        )
                                    }</div>
                                })]
                            }</div>
                        ))]}</>
                    </div>
                </div>;
            })]
        }</div>
    </div>;
}
