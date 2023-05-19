import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { CalendarProps, CalendarShift } from '../types';
import createCalendar, { getCalendarDateString } from './createCalendar';
import useTimeNow from './useTimeSecondInterval';

const useCalendar = (config: CalendarProps = {}, offset = 0) => {
    const [ calendar, shift ] = useMemo(() => createCalendar(config, offset), [config, offset]);
    const [, setOffset ] = useState(shift(0));
    const now = config.trackCurrentDay ? useTimeNow() : useRef(new Date());
    const isToday = useCallback((date: string) => getCalendarDateString(now.current) === date, [config.trackCurrentDay]);

    const [ preshift, postshift ] = useMemo(() => {
        const shiftCalendar = (monthOffset: number) => (
            calendarShift: CalendarShift = CalendarShift.MONTH
        ) => setOffset(shift(monthOffset, calendarShift));

        return [
            shiftCalendar(-1),
            shiftCalendar(1)
        ];
    }, [shift]);

    return { calendar, isToday, postshift, preshift };
};

export default useCalendar;
