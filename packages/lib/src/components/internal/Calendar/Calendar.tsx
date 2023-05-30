import { memo } from 'preact/compat';
import { useMemo, useRef, useState } from 'preact/hooks';
import useCursorRoot from './hooks/useCursorRoot';
import usePointerTraversal, { Directions } from './hooks/usePointerTraversal';
import useToday from './hooks/useToday';
import createCalendar from './internal/createCalendar';
import { CalendarDay, CalendarProps, CalendarTraversalDirection } from './types';
import useCoreContext from '../../../core/Context/useCoreContext';
import Button from '../Button';
import './Calendar.scss';

function Calendar(props: CalendarProps) {
    const { i18n } = useCoreContext();
    const { onSelected, trackToday } = props;
    const [, setLastChanged ] = useState(performance.now());

    const calendar = useMemo(() => {
        const { offset = 0, onSelected, trackToday, ...config } = props;
        return createCalendar({ ...config, locale: i18n.locale, watch: () => setLastChanged(performance.now()) }, offset);
    }, [i18n.locale, props]);

    const today = useToday(trackToday);
    const onSelectedCallback = useMemo(() => typeof onSelected === 'function' && onSelected, [onSelected]);
    const pointerTraversalControls = usePointerTraversal(calendar);

    const cursorElementRef = useRef<HTMLElement | null>(null);
    const cursorRootProps = useCursorRoot(calendar, cursorElementRef, onSelectedCallback);

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
                const month = `${view.year}-${view.month}`;

                return <li key={month} className={'adyen-fp-calendar-month'} role="none">
                    <div className={'adyen-fp-calendar-month__name'} role="none">
                        <time dateTime={month} aria-hidden="true">{view.displayName}</time>
                    </div>

                    <table className={'adyen-fp-calendar-month__grid'} role="grid" aria-label={view.displayName}>
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
                                            const date = calendar[view.origin + index] as string[];
                                            return <td key={`${date[0]}:0`} className={'adyen-fp-calendar-month__grid-cell'} tabIndex={-1}></td>;
                                        }

                                        const date = calendar[cursorPosition] as string[];
                                        const weekday = cursorPosition % 7 as CalendarDay;
                                        const cellProps = { 'data-cursor-position': cursorPosition } as any;

                                        if (cursorPosition >= view.start && cursorPosition <= view.end) {
                                            if (cursorPosition === calendar.cursorPosition) {
                                                cellProps.ref = cursorElementRef;
                                            }
                                            cellProps['data-within-month'] = true;
                                        }

                                        if (date[0] === today) cellProps['data-today'] = true;
                                        if (weekday === 0) cellProps['data-first-week-day'] = true;
                                        if (calendar.weekendDays.includes(weekday)) cellProps['data-weekend'] = true;

                                        return <td key={date[0]} className={'adyen-fp-calendar-month__grid-cell'} tabIndex={-1} {...cellProps}>
                                            <time className={'adyen-fp-calendar__date'} dateTime={date[0]}>{date[1]}</time>
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

export default memo(Calendar);
