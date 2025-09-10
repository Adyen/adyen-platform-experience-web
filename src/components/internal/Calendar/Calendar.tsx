import { forwardRef, memo } from 'preact/compat';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import useCalendar from './hooks/useCalendar';
import { CalendarProps } from './types';
import './Calendar.scss';

const Calendar = forwardRef((props: CalendarProps, ref) => {
    const calendar = useCalendar(props, ref);
    const config = calendar.grid.config();

    return (
        <div role="none">
            <CalendarControls config={config} grid={calendar.grid} renderer={props.renderControl} />
            <CalendarGrid
                ref={calendar.cursorElementRef}
                config={config}
                cursorRootProps={calendar.cursorRootProps}
                getGridLabel={props.getGridLabel}
                grid={calendar.grid}
                onlyCellsWithin={props.onlyCellsWithin}
                prepare={props.prepare}
            />
        </div>
    );
});

export default memo(Calendar);
