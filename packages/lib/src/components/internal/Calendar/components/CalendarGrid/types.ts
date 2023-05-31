import { CalendarProps, CalendarView } from '../../types';

export interface CalendarGridProps {
    calendar: CalendarView;
    trackToday?: boolean;
    withSelected: false | Exclude<CalendarProps['onSelected'], undefined>;
}
