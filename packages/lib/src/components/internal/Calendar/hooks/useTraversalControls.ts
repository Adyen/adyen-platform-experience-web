import { useMemo, useRef } from 'preact/hooks';
import {
    CalendarProps,
    CalendarShift,
    CalendarTraversal,
    CalendarTraversalControlRootProps,
    CalendarTraversalControls,
    CalendarView
} from '../types';

const SharedEmptyControlsObject = Object.freeze(Object.create(null));
const CondensedTraversalControls = [ CalendarTraversal.PREV, CalendarTraversal.NEXT ] as const;

export const TraversalControls = [
    CalendarTraversal.PREV_YEAR,
    CalendarTraversal.PREV_WINDOW,
    ...CondensedTraversalControls,
    CalendarTraversal.NEXT_WINDOW,
    CalendarTraversal.NEXT_YEAR
] as const;

const getAutoCalendarShiftFromEvent = (evt: MouseEvent) => {
    if (evt.shiftKey) return CalendarShift.YEAR;
    if (evt.altKey) return CalendarShift.WINDOW;
    return CalendarShift.MONTH;
};

const getCalendarShiftForTraversal = (traversal: CalendarTraversal) => {
    switch (traversal) {
        case CalendarTraversal.NEXT_YEAR:
        case CalendarTraversal.PREV_YEAR: return CalendarShift.YEAR;
        case CalendarTraversal.NEXT_WINDOW:
        case CalendarTraversal.PREV_WINDOW: return CalendarShift.WINDOW;
        default: return CalendarShift.MONTH;
    }
};

const getUnitCalendarShiftOffsetForTraversal = (traversal: CalendarTraversal) => {
    switch (traversal) {
        case CalendarTraversal.PREV:
        case CalendarTraversal.PREV_WINDOW:
        case CalendarTraversal.PREV_YEAR: return -1;
        default: return 1;
    }
};

const useTraversalControls = (
    calendar: CalendarView,
    renderControl: false | Exclude<CalendarProps['renderControl'], undefined>,
    controls: CalendarTraversalControls = CalendarTraversalControls.EXPANDED
) => {
    const monthOffset = useRef(1);
    const calendarShift = useRef(CalendarShift.MONTH);

    return useMemo(() => {
        if (!renderControl) return SharedEmptyControlsObject;

        const CONTROLS = controls === CalendarTraversalControls.CONDENSED
            ? CondensedTraversalControls
            : TraversalControls;

        let getCalendarShiftFromEvent: (evt: MouseEvent) => CalendarShift;

        if (controls === CalendarTraversalControls.CONDENSED) {
            getCalendarShiftFromEvent = getAutoCalendarShiftFromEvent;
        }

        return Object.fromEntries(CONTROLS.map(traversal => {
            const traversalShift = getCalendarShiftForTraversal(traversal);
            const unitShiftOffset = getUnitCalendarShiftOffsetForTraversal(traversal);

            const controlRootProps = {
                key: traversal,
                onClick: (evt: Event) => {
                    calendarShift.current = getCalendarShiftFromEvent?.(evt as MouseEvent) ?? traversalShift;
                    monthOffset.current = unitShiftOffset;
                    calendar.shift(monthOffset.current, calendarShift.current);
                }
            } as CalendarTraversalControlRootProps;

            return [traversal, controlRootProps];
        }));
    }, [calendar, controls, renderControl]);
};

export default useTraversalControls;
