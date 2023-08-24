import { CalendarGrid } from '../../calendar/types';
import { CalendarProps } from '../../types';

export interface CalendarControlsProps {
    grid: CalendarGrid;
    renderControl?: CalendarProps['renderControl'];
}
