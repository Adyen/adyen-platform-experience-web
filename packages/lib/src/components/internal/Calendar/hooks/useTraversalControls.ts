import { useMemo, useRef } from 'preact/hooks';
import { CalendarProps, CalendarTraversal, CalendarTraversalControlRootProps, CalendarTraversalControls } from '../types';
import { CalendarGrid, TimeFrameShift } from '@src/components/internal/Calendar/calendar/types';
import calendar from '../calendar';

const SharedEmptyControlsObject = Object.freeze(Object.create(null));
const CondensedTraversalControls = [CalendarTraversal.PREV, CalendarTraversal.NEXT] as const;

export const TraversalControls = [
    CalendarTraversal.PREV_YEAR,
    CalendarTraversal.PREV_WINDOW,
    ...CondensedTraversalControls,
    CalendarTraversal.NEXT_WINDOW,
    CalendarTraversal.NEXT_YEAR,
] as const;

const getAutoCalendarShiftFromEvent = (evt: MouseEvent) => {
    if (evt.shiftKey) return calendar.shift.PERIOD;
    if (evt.altKey) return calendar.shift.FRAME;
    return calendar.shift.BLOCK;
};

const getCalendarShiftForTraversal = (traversal: CalendarTraversal) => {
    switch (traversal) {
        case CalendarTraversal.NEXT_YEAR:
        case CalendarTraversal.PREV_YEAR:
            return calendar.shift.PERIOD;
        case CalendarTraversal.NEXT_WINDOW:
        case CalendarTraversal.PREV_WINDOW:
            return calendar.shift.FRAME;
        default:
            return calendar.shift.BLOCK;
    }
};

const getUnitCalendarShiftOffsetForTraversal = (traversal: CalendarTraversal) => {
    switch (traversal) {
        case CalendarTraversal.PREV:
        case CalendarTraversal.PREV_WINDOW:
        case CalendarTraversal.PREV_YEAR:
            return -1;
        default:
            return 1;
    }
};

const useTraversalControls = (
    grid: CalendarGrid,
    renderControl?: CalendarProps['renderControl'],
    controls: CalendarTraversalControls = CalendarTraversalControls.EXPANDED
) => {
    const monthOffset = useRef(1);
    const calendarShift = useRef<TimeFrameShift>(calendar.shift.BLOCK);

    return useMemo(() => {
        if (!renderControl) return SharedEmptyControlsObject;

        const CONTROLS = controls === CalendarTraversalControls.CONDENSED ? CondensedTraversalControls : TraversalControls;

        let getCalendarShiftFromEvent: (evt: MouseEvent) => TimeFrameShift;

        if (controls === CalendarTraversalControls.CONDENSED) {
            getCalendarShiftFromEvent = getAutoCalendarShiftFromEvent;
        }

        return Object.fromEntries(
            CONTROLS.map(traversal => {
                const traversalShift = getCalendarShiftForTraversal(traversal);
                const unitShiftOffset = getUnitCalendarShiftOffsetForTraversal(traversal);

                const controlRootProps = {
                    key: traversal,
                    onClick: (evt: Event) => {
                        calendarShift.current = getCalendarShiftFromEvent?.(evt as MouseEvent) ?? traversalShift;
                        monthOffset.current = unitShiftOffset;
                        grid.shift(monthOffset.current, calendarShift.current);
                    },
                } as CalendarTraversalControlRootProps;

                return [traversal, controlRootProps];
            })
        );
    }, [grid, controls, renderControl]);
};

export default useTraversalControls;
