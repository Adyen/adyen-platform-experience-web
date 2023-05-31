import { CalendarProps, CalendarTraversalControls, CalendarView } from '../../types';

export interface CalendarControlsProps {
    calendar: CalendarView;
    controls?: CalendarTraversalControls;
    renderControl: false | Exclude<CalendarProps['renderControl'], undefined>;
}