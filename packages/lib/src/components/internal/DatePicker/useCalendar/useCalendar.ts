import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { createCalendar, getDateStart, getMonthStart } from './utils';
import { UseCalendarConfig } from './types';

const useCalendar = ({ calendarMonths = 1, firstWeekDay = 0, startDate = Date.now() }: UseCalendarConfig = {}) => {
    const [ monthOffset, setMonthOffset ] = useState(0);
    const [ dateTimestamp, setDateTimestamp ] = useState(() => getDateStart(startDate, true));
    const monthTimestamp = useMemo(() => getMonthStart(dateTimestamp), [dateTimestamp]);

    const calendar = useMemo((() => {
        const calendar = createCalendar();
        return () => calendar(calendarMonths, firstWeekDay, monthTimestamp, monthOffset);
    })(), [calendarMonths, firstWeekDay, monthOffset, monthTimestamp]);

    const goto = useCallback((offset = 0) => {
        setMonthOffset(monthOffset => monthOffset + offset * calendarMonths);
    }, [calendarMonths]);

    useEffect(() => {
        setDateTimestamp(() => getDateStart(startDate, true));
    }, [startDate]);

    return { calendar, goto } as const;
};

export default useCalendar;
