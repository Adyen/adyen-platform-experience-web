import { CalendarGrid } from '../../calendar/types';
import { CalendarProps } from '../../types';

export interface CalendarControlsProps {
    config: ReturnType<CalendarGrid['config']>;
    grid: CalendarGrid;
    renderControl?: CalendarProps['renderControl'];
}
