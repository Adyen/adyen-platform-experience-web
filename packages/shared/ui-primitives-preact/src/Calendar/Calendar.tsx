import { forwardRef, memo } from 'preact/compat';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import useCalendar from './hooks/useCalendar';
import { CalendarProps } from './types';
import './Calendar.scss';

const Calendar = forwardRef((props: CalendarProps, ref) => {
    const { cursorElementRef, cursorRootProps, grid } = useCalendar(props, ref);
    const config = grid.config();

    return (
        <div role="none">
            <CalendarControls config={config} grid={grid} renderer={props.renderControl} />
            <CalendarGrid
                ref={cursorElementRef}
                config={config}
                cursorRootProps={cursorRootProps}
                getGridLabel={props.getGridLabel}
                grid={grid}
                onlyCellsWithin={props.onlyCellsWithin}
                prepare={props.prepare}
            />
        </div>
    );
});

export default memo(Calendar);
