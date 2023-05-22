import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CalendarCursorShift, CalendarProps, CalendarShift } from '../types';
import createCalendar from './createCalendar';
import useToday from './useToday';

const useCalendar = (config: CalendarProps = {}, offset = 0) => {
    const [ calendar, shift, shiftCursor ] = useMemo(() => createCalendar(config, offset), [config, offset]);
    const [ cursorPosition, setCursorPosition ] = useState(shiftCursor());
    const [, setOffset ] = useState(shift(0));

    const today = useToday(config.trackCurrentDay);
    const cursorDate = useMemo(() => calendar[cursorPosition] as string, [cursorPosition]);

    const [ preshift, postshift ] = useMemo(() => {
        const shiftCalendar = (monthOffset: number) => (
            calendarShift: CalendarShift = CalendarShift.MONTH
        ) => setOffset(shift(monthOffset, calendarShift));

        return [
            shiftCalendar(-1),
            shiftCalendar(1)
        ];
    }, [shift]);

    const handleKeys = useCallback((evt: KeyboardEvent) => {
        switch (evt.key) {
            case 'ArrowLeft': return setCursorPosition(shiftCursor(CalendarCursorShift.PREV_WEEK_DAY));
            case 'ArrowRight': return setCursorPosition(shiftCursor(CalendarCursorShift.NEXT_WEEK_DAY));
            case 'ArrowUp': return setCursorPosition(shiftCursor(CalendarCursorShift.PREV_WEEK));
            case 'ArrowDown': return setCursorPosition(shiftCursor(CalendarCursorShift.NEXT_WEEK));
            case 'Home': return setCursorPosition(shiftCursor(
                evt.ctrlKey ? CalendarCursorShift.FIRST_MONTH_DAY : CalendarCursorShift.FIRST_WEEK_DAY
            ));
            case 'End': return setCursorPosition(shiftCursor(
                evt.ctrlKey ? CalendarCursorShift.LAST_MONTH_DAY : CalendarCursorShift.LAST_WEEK_DAY
            ));
        }
    }, [shiftCursor]);

    const handleKeysRef = useRef(handleKeys);

    useEffect(() => {
        document.removeEventListener('keyup', handleKeysRef.current, false);
        handleKeysRef.current = handleKeys;

        document.addEventListener('keyup', handleKeysRef.current, false);

        return () => {
            document.removeEventListener('keyup', handleKeysRef.current, false);
            handleKeysRef.current = (null as unknown) as () => void;
        };
    }, [handleKeys]);

    return { calendar, cursorDate, postshift, preshift, today };
};

export default useCalendar;
