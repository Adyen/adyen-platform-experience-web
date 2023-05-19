import { useMemo, useState } from 'preact/hooks';
import { CalendarProps, CalendarShift } from '../types';
import createCalendar from './createCalendar';
import useToday from './useToday';

const useCalendar = (config: CalendarProps = {}, offset = 0) => {
    const [ calendar, shift ] = useMemo(() => createCalendar(config, offset), [config, offset]);
    const [, setOffset ] = useState(shift(0));
    const today = useToday(config.trackCurrentDay);

    const [ preshift, postshift ] = useMemo(() => {
        const shiftCalendar = (monthOffset: number) => (
            calendarShift: CalendarShift = CalendarShift.MONTH
        ) => setOffset(shift(monthOffset, calendarShift));

        return [
            shiftCalendar(-1),
            shiftCalendar(1)
        ];
    }, [shift]);

    return { calendar, postshift, preshift, today };
};

export default useCalendar;
