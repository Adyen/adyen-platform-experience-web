import { DatePickerProps } from './types';
import { CalendarTraversalControls } from '../Calendar/types';
import useDatePickerCalendarControls from './hooks/useDatePickerCalendarControls';
import useElementWithUniqueIdRef from '../../../hooks/ref/useElementWithUniqueIdRef';
import useElementUniqueIdRefs from '../../../hooks/ref/useElementUniqueIdRefs';
import useFocusTrapElementRef from '../../../hooks/ref/useFocusTrapElementRef';
import Calendar from '../Calendar';

export default function DatePicker(props: DatePickerProps) {
    const [renderControl, calendarControlsContainerRef] = useDatePickerCalendarControls();
    const a11yIds_datePicker = useElementUniqueIdRefs('date-picker');
    const datePickerDialogRef = useFocusTrapElementRef(useElementWithUniqueIdRef('date-picker'));

    return (
        <>
            <div>
                <div
                    role="combobox"
                    aria-autocomplete="none"
                    aria-expanded="false"
                    aria-haspopup="dialog"
                    aria-labelledby={a11yIds_datePicker}
                    aria-controls={a11yIds_datePicker}
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
