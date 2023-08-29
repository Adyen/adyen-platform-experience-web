import { forwardRef } from 'preact/compat';
import useDatePicker from '../../hooks/useDatePicker';
import Calendar from '../../../Calendar';
import calendar from '../../../Calendar/calendar';
import { CalendarProps } from '../../../Calendar/types';
import '../../DatePicker.scss';

const DatePicker = forwardRef((props: CalendarProps, ref) => {
    const { calendarControlsContainerRef, calendarRef, onSelectionChanged, originDate, renderControl } = useDatePicker(props, ref);

    return (
        <>
            <div ref={calendarControlsContainerRef} className={'adyen-fp-datepicker__controls'} role="group" />
            <Calendar
                {...props}
                ref={calendarRef}
                controls={props.controls ?? calendar.controls.MINIMAL}
                highlight={props.highlight ?? calendar.highlight.MANY}
                onHighlight={onSelectionChanged}
                originDate={originDate}
                renderControl={renderControl}
            />
        </>
    );
});

export default DatePicker;
