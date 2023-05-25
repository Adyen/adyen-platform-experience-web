import useCalendar from './hooks/useCalendar';
import useCoreContext from '../../../core/Context/useCoreContext';
import { CalendarProps, CalendarTraversalDirection } from './types';
import { Directions } from './hooks/usePointerTraversal';
import { useMemo } from 'preact/hooks';
import Button from '../Button';
import './Calendar.scss';

export default function Calendar(props: CalendarProps) {
    const { i18n } = useCoreContext();
    const { augmentCursorElement, calendar, cursorRootProps, pointerTraversalControls, today } = useCalendar(
        useMemo(() => ({ ...props, locale: i18n.locale }), [i18n, props])
    );

    return <div role="group" aria-label="calendar">
        <div role="group" aria-label="calendar navigation" style={{ textAlign: 'center' }}>{
            Directions.map(direction => {
                let directionModifier = 'next';
                let labelModifier = directionModifier;
                let label = '▶︎';

                if (direction === CalendarTraversalDirection.PREV) {
                    directionModifier = 'prev';
                    labelModifier = 'previous';
                    label = '◀︎';
                }

                // @ts-ignore
                return <Button
                    key={direction}
                    aria-label={i18n.get(`calendar.${labelModifier}Month`)}
                    variant={'ghost'}
                    // disabled={props.page === 1}
                    classNameModifiers={['circle', directionModifier]}
                    label={label}
                    {...pointerTraversalControls[direction]}
                />;
            })
        }</div>

        <ol className={'adyen-fp-calendar'} role="none" {...cursorRootProps}>{
            [...calendar.months.map(view => {
                const month = `${view.year}-${view.month + 1}`;
                const humanizedMonth = new Date(month).toLocaleDateString(i18n.locale, { month: 'short', year: 'numeric' });

                return <li key={month} className={'adyen-fp-calendar-month'} role="none">
                    <div className={'adyen-fp-calendar-month__name'} role="none">
                        <time dateTime={month} aria-hidden="true">{humanizedMonth}</time>
                    </div>

                    <table className={'adyen-fp-calendar-month__grid'} role="grid" aria-label={humanizedMonth}>
                        <thead>
                            <tr className={'adyen-fp-calendar-month__grid-row'}>{
                                [...calendar.daysOfTheWeek.map(([long,, short]) => (
                                    <th key={long} className={'adyen-fp-calendar-month__grid-cell'} scope="col" aria-label={long}>
                                        <abbr className={'adyen-fp-calendar-month__day-of-week'} title={long}>{short}</abbr>
                                    </th>
                                ))]
                            }</tr>
                        </thead>

                        <tbody>{
                            [...view.weeks.map((week, index) => (
                                <tr key={`${month}:${index}`} className={'adyen-fp-calendar-month__grid-row'}>{
                                    [...week.map((cursorPosition, index) => {
                                        const date = calendar[cursorPosition] as string;
                                        const isWithinMonth = week.isWithinMonthAt(index);

                                        const extraProps = {
                                            'data-date': date,
                                            'data-first-week-day': `${week.isFirstWeekDayAt(index)}`,
                                            'data-today': `${date === today}`,
                                            'data-weekend': `${week.isWeekendAt(index)}`,
                                            'data-within-month': `${isWithinMonth}`
                                        } as any;

                                        augmentCursorElement(cursorPosition, extraProps);

                                        return <td key={date} className={'adyen-fp-calendar-month__grid-cell'} tabIndex={-1} {...extraProps}>{
                                            (props.onlyMonthDays !== true || isWithinMonth) && (
                                                <time className={'adyen-fp-calendar__date'} dateTime={date}>{+date.slice(-2)}</time>
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
