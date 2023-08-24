import { CalendarProps, CalendarTraversalControls } from '../../types';
import { CalendarGrid } from '@src/components/internal/Calendar/calendar/types';

export interface CalendarControlsProps {
    controls?: CalendarTraversalControls;
    grid: CalendarGrid;
    renderControl?: CalendarProps['renderControl'];
}
