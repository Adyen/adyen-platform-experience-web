import { memo } from 'preact/compat';
import CalendarGrid from './components/CalendarGrid';
import CalendarControls from './components/CalendarControls';
import useCalendar from './hooks/useCalendar';
import { CalendarProps } from './types';
import './Calendar.scss';

function Calendar(props: CalendarProps) {
    const { trackToday, traversalControls } = props;
    const { calendar, renderControl, withSelected } = useCalendar(props);

    return <div role="group" aria-label="calendar">
        <CalendarControls calendar={calendar} controls={traversalControls} renderControl={renderControl} />
        <CalendarGrid calendar={calendar} trackToday={trackToday} withSelected={withSelected} />
    </div>;
}

export default memo(Calendar);
