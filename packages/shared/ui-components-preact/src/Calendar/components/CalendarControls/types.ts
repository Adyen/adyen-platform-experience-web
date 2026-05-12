import { CalendarGrid } from '../../calendar/types';
import { CalendarRenderControl } from '../../types';

export interface CalendarControlsProps {
    config: ReturnType<CalendarGrid['config']>;
    grid: CalendarGrid;
    renderer?: CalendarRenderControl;
}
