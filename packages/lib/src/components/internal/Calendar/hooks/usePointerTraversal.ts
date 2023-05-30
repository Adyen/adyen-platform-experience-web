import { CalendarShift, CalendarTraversalDirection, CalendarView } from '../types';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';

export const Directions = [CalendarTraversalDirection.PREV, CalendarTraversalDirection.NEXT] as const;

const getAutoCalendarShiftFromEvent = (evt: MouseEvent) => {
    if (evt.shiftKey) return CalendarShift.YEAR;
    if (evt.altKey) return CalendarShift.WINDOW;
    return CalendarShift.MONTH;
};

const getUnitCalendarShiftOffsetForDirection = (direction: CalendarTraversalDirection) => (
    direction === CalendarTraversalDirection.PREV ? -1 : 1
);

const usePointerTraversal = (calendar: CalendarView) => {
    const [, setOffset ] = useState(calendar.shift(0));

    const monthOffset = useRef(1);
    const calendarShift = useRef(CalendarShift.MONTH);
    const shiftCalendar = useCallback(() => setOffset(calendar.shift(monthOffset.current, calendarShift.current)), [calendar]);

    return useMemo(() => (
        Object.fromEntries(Directions.map(direction => {
            const unitShiftOffset = getUnitCalendarShiftOffsetForDirection(direction);
            return [ direction, {
                onClick(evt: Event) {
                    calendarShift.current = getAutoCalendarShiftFromEvent(evt as MouseEvent);
                    monthOffset.current = unitShiftOffset;
                    shiftCalendar();
                }
            }];
        }))
    ), [shiftCalendar]);
};

export default usePointerTraversal;
