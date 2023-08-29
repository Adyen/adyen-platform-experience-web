import { forwardRef, memo } from 'preact/compat';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import useCalendar from './hooks/useCalendar';
import { CalendarProps } from './types';
import './Calendar.scss';

const Calendar = forwardRef((props: CalendarProps, ref) => {
    const {
        config: { current: config },
        cursorElementRef,
        cursorRootProps,
        grid,
    } = useCalendar(props, ref);

    return (
        <div role="group" aria-label="calendar">
            <CalendarControls config={config} grid={grid} renderControl={props.renderControl} />
            <CalendarGrid
                ref={cursorElementRef}
                config={config}
                cursorRootProps={cursorRootProps}
                grid={grid}
                onlyCellsWithin={props.onlyCellsWithin}
                prepare={props.prepare}
            />
        </div>
    );
});

export default memo(Calendar);
