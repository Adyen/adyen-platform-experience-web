import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { getMonthTimestamp, getNoonTimestamp } from '../utils';
import { UseCalendarConfig } from '../types';
import createCalendar from './createCalendar';

const useCalendar = ({ calendarMonths = 1, firstWeekDay = 0, startDate = Date.now() }: UseCalendarConfig = {}) => {
    const [ monthOffset, setMonthOffset ] = useState(0);
    const [ dateTimestamp, setDateTimestamp ] = useState(() => getNoonTimestamp(startDate, true));
    const monthTimestamp = useMemo(() => getMonthTimestamp(dateTimestamp), [dateTimestamp]);

    const calendar = useMemo((() => {
        const calendar = createCalendar();
        return () => calendar(calendarMonths, firstWeekDay, monthTimestamp, monthOffset);
    })(), [calendarMonths, firstWeekDay, monthOffset, monthTimestamp]);

    const offset = useCallback((offset = 0) => {
        setMonthOffset(monthOffset => monthOffset + offset * calendarMonths);
    }, [calendarMonths]);

    useEffect(() => {
        setDateTimestamp(() => getNoonTimestamp(startDate, true));
    }, [startDate]);

    return { calendar, offset } as const;
};

export default useCalendar;
