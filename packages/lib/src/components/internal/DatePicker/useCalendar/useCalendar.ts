import { useMemo } from 'preact/hooks';
import { UseCalendarConfig } from './types';

const useCalendar = ({ firstDayOfWeek = 0, months = 1 }: UseCalendarConfig) => {
    const firstWeekDay = useMemo(() => firstDayOfWeek, [firstDayOfWeek]);
    const calendarMonths = useMemo(() => months, [months]);
};

export default useCalendar;
