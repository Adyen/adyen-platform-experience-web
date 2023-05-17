import { useMemo, useState } from 'preact/hooks';
import { CalendarConfig, CalendarShift } from '../types';
import createCalendar from './createCalendar';

const useCalendar = (config: CalendarConfig = {}, offset = 0) => {
    const [ calendar, shift ] = useMemo(() => createCalendar(config, offset), [config, offset]);
    const [, setOffset ] = useState(shift(0));

    const [ preshift, postshift ] = useMemo(() => {
        const shiftCalendar = (monthOffset: number) => (
            calendarShift: CalendarShift = CalendarShift.MONTH
        ) => setOffset(shift(monthOffset, calendarShift));

        return [
            shiftCalendar(-1),
            shiftCalendar(1)
        ];
    }, [shift]);

    return { calendar, postshift, preshift };
};

export default useCalendar;
