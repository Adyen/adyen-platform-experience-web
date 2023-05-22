import classnames from 'classnames';
import useCalendar from './internal/useCalendar';
import useCoreContext from '../../../core/Context/useCoreContext';
import { CalendarProps, CalendarShift } from './types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Button from '../Button';
import './Calendar.scss';

const useSharedElementRef = ({ shouldRetainCurrentElement, withCurrentElement }: {
    shouldRetainCurrentElement?: (currentElem: HTMLElement, candidateElem: HTMLElement) => any;
    withCurrentElement?: (currentElement: HTMLElement) => any;
} = {}) => {
    const elementRef = useRef<HTMLElement>();
    const elementCandidatesRef = useRef<HTMLElement[]>([]);

    const nominateCandidateElement = useCallback((element?: HTMLElement | null) => {
        if (element != undefined) elementCandidatesRef.current.push(element);
    }, []);

    const updateElementRef = useMemo(() => {
        const retainCurrent = shouldRetainCurrentElement ?? (() => false);
        const withCurrent = withCurrentElement ?? (() => {});

        return () => {
            let currentElement = elementRef.current;

            for (const element of elementCandidatesRef.current) {
                if (currentElement && retainCurrent(currentElement, element)) break;
                currentElement = element;
            }

            elementCandidatesRef.current.length = 0;

            if (currentElement && elementRef.current !== currentElement) {
                withCurrent(elementRef.current = currentElement);
            }
        }
    }, [shouldRetainCurrentElement, withCurrentElement]);

    useEffect(updateElementRef);

    return [elementRef, nominateCandidateElement] as const;
};

const SharedElementRefConfig = {
    shouldRetainCurrentElement: (currentElement: HTMLElement, candidateElement: HTMLElement) => (
        currentElement.dataset.thisDate === candidateElement.dataset.thisDate &&
        currentElement.dataset.withinMonth === 'true'
    ),
    withCurrentElement: (currentElement: HTMLElement) => currentElement.focus()
};

export default function Calendar(props: CalendarProps) {
    const { i18n } = useCoreContext();
    const { calendar, cursorDate, postshift, preshift, today } = useCalendar(useMemo(() => ({ ...props, locale: i18n.locale }), [i18n, props]));
    const [ focusedDate, setFocusedDate ] = useState(today);
    const calendarShift = useRef(CalendarShift.MONTH);

    const [ cursorDateRef, nominateCursorDateRefCandidate ] = useSharedElementRef(SharedElementRefConfig);

    const leftShiftCalendar = useCallback(() => preshift(calendarShift.current), []);
    const rightShiftCalendar = useCallback(() => postshift(calendarShift.current), []);
    const onSelected = useMemo(() => typeof props.onSelected === 'function' && props.onSelected, [props.onSelected]);

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

        <ol className={'calendar'} role="none">{
            [...calendar.months.map(view => {
                const month = `${view.year}-${(`0` + (view.month + 1)).slice(-2)}`;
                const humanizedMonth = new Date(month).toLocaleDateString(i18n.locale, { month: 'short', year: 'numeric' });

                return <li key={month} className={'calendar-month'} role="none">
                    <div className={'calendar-month__name'} role="none">
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
                                        const isFocusedDate = date === focusedDate;

                                        const classes = classnames('calendar__date', {
                                            'calendar__date--first-week-day': week.isFirstWeekDayAt(index),
                                            // 'calendar__date--today': date === today,
                                            'calendar__date--weekend': week.isWeekendAt(index),
                                            'calendar__date--within-month': isWithinMonth
                                        });

                                        const extraProps = {} as any;

                                        if (date === cursorDate) {
                                            extraProps.ref = (elem: HTMLElement | null) => {
                                                if (elem) {
                                                    elem.dataset.thisDate = date;
                                                    elem.dataset.withinMonth = `${isWithinMonth}`;
                                                    nominateCursorDateRefCandidate(elem);
                                                }
                                            };
                                        }

                                        if (onSelected) {
                                            extraProps.onClick = () => {
                                                setFocusedDate(date);
                                                props.onSelected?.(date);
                                            };
                                        }

                                        return <td key={date} className={'calendar-month__grid-cell'} tabIndex={-1} {...extraProps}>{
                                            (props.onlyMonthDays !== true || isWithinMonth) && (
                                                <time className={classes} dateTime={date}>{+date.slice(-2)}</time>
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
