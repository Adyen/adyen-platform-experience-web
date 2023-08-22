import { CalendarProps, CalendarTraversalControls } from '../../types';
import { CalendarGrid } from '../../core/calendar/types';

export interface CalendarControlsProps {
    controls?: CalendarTraversalControls;
    grid: CalendarGrid;
    renderControl?: CalendarProps['renderControl'];
}
