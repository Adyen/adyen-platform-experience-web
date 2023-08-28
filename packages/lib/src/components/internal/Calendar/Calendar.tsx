import { memo } from 'preact/compat';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import useCalendar from './hooks/useCalendar';
import { CalendarProps } from './types';
import './Calendar.scss';

function Calendar(props: CalendarProps) {
    const {
        config: { current: config },
        cursorElementRef,
        cursorRootProps,
        grid,
    } = useCalendar(props);
    const { prepare, renderControl } = props;

    return (
        <div role="group" aria-label="calendar">
            <CalendarControls config={config} grid={grid} renderControl={renderControl} />
            <CalendarGrid ref={cursorElementRef} config={config} cursorRootProps={cursorRootProps} grid={grid} prepare={prepare} />
        </div>
    );
}

export default memo(Calendar);
