import { forwardRef, memo } from 'preact/compat';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import useCalendar from './hooks/useCalendar';
import { CalendarProps } from './types';
import './Calendar.scss';

const Calendar = memo(
    forwardRef((props: CalendarProps, ref) => {
        const calendar = useCalendar(props, ref);
        const config = calendar.grid.config();

        return (
            <div role="group" aria-label="calendar">
                <CalendarControls config={config} grid={calendar.grid} renderer={props.renderControl} />
                <CalendarGrid
                    ref={calendar.cursorElementRef}
                    config={config}
                    cursorRootProps={calendar.cursorRootProps}
                    grid={calendar.grid}
                    onlyCellsWithin={props.onlyCellsWithin}
                    prepare={props.prepare}
                />
            </div>
        );
    })
);

export default Calendar;
