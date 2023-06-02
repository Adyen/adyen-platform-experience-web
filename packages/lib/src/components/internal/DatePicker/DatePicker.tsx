import useDatePickerCalendarControls from './hooks/useDatePickerCalendarControls';
import { DatePickerProps } from './types';
import { CalendarTraversalControls } from '../Calendar/types';
import useElementRef from '../../../hooks/ref/useElementRef';
import useIdRefs from '../../../hooks/ref/useIdRefs';
import Calendar from '../Calendar';

export default function DatePicker(props: DatePickerProps) {
    const [calendarControlsContainerRef, renderControl] = useDatePickerCalendarControls();
    const datePickerDialogRef = useElementRef();

    return (
        <>
            <div>
                <div
                    role="combobox"
                    aria-autocomplete="none"
                    aria-expanded="false"
                    aria-haspopup="dialog"
                    aria-labelledby={useIdRefs(datePickerDialogRef)}
                    aria-controls={(datePickerDialogRef?.current as Element)?.id}
                    tabIndex={0}
                ></div>
            </div>
            <div ref={datePickerDialogRef} role="dialog" aria-label="Choose date">
                <div ref={calendarControlsContainerRef} role="group" style={{ textAlign: 'center' }} />
                <Calendar {...props} traversalControls={CalendarTraversalControls.CONDENSED} renderControl={renderControl} />
            </div>
        </>
    );
}
