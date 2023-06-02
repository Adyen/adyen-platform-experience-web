import useDatePickerCalendarControls from './hooks/useDatePickerCalendarControls';
import { DatePickerProps } from './types';
import { CalendarTraversalControls } from '../Calendar/types';
import useElementRef from '../../../hooks/ref/useElementRef';
import useIdRefs from '../../../hooks/ref/useIdRefs';
import Calendar from '../Calendar';
import { useState } from 'preact/hooks';

export default function DatePicker(props: DatePickerProps) {
    const [calendarControlsContainerRef, renderControl] = useDatePickerCalendarControls();
    const datePickerDialogRef = useElementRef();
    const [counter, setCounter] = useState(0);
    const spanRef = useElementRef();

    return (
        <>
            <button onClick={() => setCounter(counter => counter + 1)}>Hey</button>
            <div>
                <div
                    role="combobox"
                    aria-autocomplete="none"
                    aria-expanded="false"
                    aria-haspopup="dialog"
                    aria-labelledby={useIdRefs(datePickerDialogRef, spanRef)}
                    aria-controls={(datePickerDialogRef?.current as Element)?.id}
                    tabIndex={0}
                ></div>
                {counter < 5 && <span ref={spanRef} aria-label="range"></span>}
            </div>
            <div ref={datePickerDialogRef} role="dialog" aria-label="Choose date">
                <div ref={calendarControlsContainerRef} role="group" style={{ textAlign: 'center' }} />
                <Calendar {...props} traversalControls={CalendarTraversalControls.CONDENSED} renderControl={renderControl} />
            </div>
        </>
    );
}
