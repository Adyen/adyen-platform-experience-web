import { useMemo } from 'preact/hooks';
import useCursorTraversal from './hooks/useCursorTraversal';
import usePointerTraversal, { Directions } from './hooks/usePointerTraversal';
import useToday from './hooks/useToday';
import createCalendar from './internal/createCalendar';
import { CalendarDay, CalendarProps, CalendarTraversalDirection } from './types';
import useCoreContext from '../../../core/Context/useCoreContext';
import Button from '../Button';
import './Calendar.scss';

export default function Calendar(props: CalendarProps) {
    const { i18n } = useCoreContext();
    const { onSelected, trackToday } = props;

    const calendar = useMemo(() => {
        const { offset = 0, onSelected, trackToday, ...config } = props;
        return createCalendar({ ...config, locale: i18n.locale }, offset);
    }, [i18n, props]);

    const today = useToday(trackToday);
    const onSelectedCallback = useMemo(() => typeof onSelected === 'function' && onSelected, [onSelected]);
    const pointerTraversalControls = usePointerTraversal(calendar);

    const { augmentCursorElement, cursorRootProps } = useCursorTraversal(calendar, onSelectedCallback);

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
                                [...calendar.daysOfWeek.map(([long,, short]) => (
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
                                        if (cursorPosition < 0) {
                                            const date = calendar[view.origin + index] as string;
                                            return <td key={`${date}:0`} className={'adyen-fp-calendar-month__grid-cell'} tabIndex={-1}></td>;
                                        }

                                        const date = calendar[cursorPosition] as string;
                                        const weekday = cursorPosition % 7;

                                        const extraProps = {
                                            'data-date': date,
                                            'data-first-week-day': `${weekday === 0}`,
                                            'data-today': `${date === today}`,
                                            'data-weekend': `${calendar.weekendDays.includes(weekday as CalendarDay)}`,
                                            'data-within-month': `${cursorPosition >= view.start && cursorPosition < view.end}`
                                        } as any;

                                        augmentCursorElement(cursorPosition, extraProps);

                                        return <td key={date} className={'adyen-fp-calendar-month__grid-cell'} tabIndex={-1} {...extraProps}>
                                            <time className={'adyen-fp-calendar__date'} dateTime={date}>{+date.slice(-2)}</time>
                                        </td>
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
