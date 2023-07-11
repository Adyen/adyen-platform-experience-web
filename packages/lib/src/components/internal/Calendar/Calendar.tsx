import { memo } from 'preact/compat';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import useCalendar from './hooks/useCalendar';
import { CalendarProps } from './types';
import './Calendar.scss';

function Calendar(props: CalendarProps) {
    const { calendar, cursorElementRef, cursorRootProps, today } = useCalendar(props);
    const { render, renderControl, traversalControls } = props;

    return (
        <div role="group" aria-label="calendar">
            <CalendarControls calendar={calendar} controls={traversalControls} renderControl={renderControl} />
            <CalendarGrid ref={cursorElementRef} calendar={calendar} cursorRootProps={cursorRootProps} render={render} today={today} />
        </div>
    );
}

export default memo(Calendar);
