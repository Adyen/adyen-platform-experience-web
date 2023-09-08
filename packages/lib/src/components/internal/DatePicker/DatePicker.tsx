import { forwardRef } from 'preact/compat';
import Calendar from '../Calendar';
import calendar from '../Calendar/calendar';
import useCalendarControlsRendering from '../Calendar/hooks/useCalendarControlsRendering';
import { CalendarProps } from '../Calendar/types';
import './DatePicker.scss';

const DatePicker = forwardRef((props: CalendarProps, ref) => {
    const [controlsRenderer, controlsContainerRef] = useCalendarControlsRendering(props.renderControl);
    return (
        <>
            <div ref={controlsContainerRef} className={'adyen-fp-datepicker__controls'} role="group" />
            <Calendar
                {...props}
                ref={ref}
                controls={props.controls ?? calendar.controls.MINIMAL}
                highlight={props.highlight ?? calendar.highlight.MANY}
                renderControl={controlsRenderer}
            />
        </>
    );
});

export default DatePicker;
