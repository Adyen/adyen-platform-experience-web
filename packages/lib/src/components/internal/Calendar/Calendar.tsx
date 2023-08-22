import { memo } from 'preact/compat';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import calendar from './core';
import useCalendar from './hooks/useCalendar';
import { CalendarProps } from './types';
import './Calendar.scss';

function Calendar({ prepare, renderControl, traversalControls, ...props }: CalendarProps) {
    const { cursorElementRef, cursorRootProps, grid } = useCalendar({
        blocks: props.calendarMonths,
        firstWeekDay: props.firstWeekDay,
        timeslice: calendar.range(props.sinceDate, props.untilDate),
    });

    return (
        <div role="group" aria-label="calendar">
            <CalendarControls controls={traversalControls} grid={grid} renderControl={renderControl} />
            <CalendarGrid ref={cursorElementRef} cursorRootProps={cursorRootProps} grid={grid} prepare={prepare} />
        </div>
    );
}

export default memo(Calendar);
