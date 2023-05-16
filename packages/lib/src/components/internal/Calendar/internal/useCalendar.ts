import { useCallback, useMemo, useState } from 'preact/hooks';
import { CalendarConfig, CalendarShift } from '../types';
import createCalendar from './createCalendar';

const useCalendar = (config: CalendarConfig = {}, offset = 0) => {
    const [ calendar, shift ] = useMemo(() => createCalendar(config, offset), [config, offset]);
    const [, setOffset ] = useState(shift(0));

    const shiftCalendar = useCallback((monthOffset: number, calendarShift: CalendarShift = CalendarShift.MONTH) => {
        setOffset(shift(monthOffset, calendarShift));
    }, [shift]);

    return [calendar, shiftCalendar] as const;
};

export default useCalendar;
