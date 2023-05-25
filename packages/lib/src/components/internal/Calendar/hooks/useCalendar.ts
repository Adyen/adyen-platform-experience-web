import { useMemo } from 'preact/hooks';
import { CalendarProps } from '../types';
import createCalendar from '../internal/createCalendar';
import useCursorTraversal from './useCursorTraversal';
import usePointerTraversal from './usePointerTraversal';
import useToday from './useToday';

const useCalendar = (config: CalendarProps = {}, offset = 0) => {
    const today = useToday(config.trackCurrentDay);
    const calendarViewRecord = useMemo(() => createCalendar(config, offset), [config, offset]);
    const onSelected = useMemo(() => typeof config.onSelected === 'function' && config.onSelected, [config.onSelected]);

    const pointerTraversalControls = usePointerTraversal(calendarViewRecord);
    const { augmentCursorElement, cursorRootProps } = useCursorTraversal(calendarViewRecord, onSelected);
    const [ calendar ] = calendarViewRecord;

    return { augmentCursorElement, calendar, cursorRootProps, pointerTraversalControls, today };
};

export default useCalendar;
