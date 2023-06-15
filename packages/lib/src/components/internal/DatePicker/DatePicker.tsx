import { useEffect, useRef } from 'preact/hooks';
import useDatePickerCalendarControls from './hooks/useDatePickerCalendarControls';
import { DatePickerProps } from './types';
import { CalendarTraversalControls } from '../Calendar/types';
import { InteractionKeyCode } from '../../types';
import createTabbableRoot, { hasFocusWithin } from '../../../hooks/ally/focus/tabbable';
import useElementRef from '../../../hooks/ref/useElementRef';
import useIdRefs from '../../../hooks/ref/useIdRefs';
import Calendar from '../Calendar';

export default function DatePicker(props: DatePickerProps) {
    const [renderControl, calendarControlsContainerRef] = useDatePickerCalendarControls();
    const a11yIds_datePicker = useIdRefs('date-picker');
    const datePickerDialogRef = useElementRef('date-picker');
    const datePickerProps = useRef({} as any);

    useEffect(() => {
        let focusByKeyboard = false;

        if (datePickerDialogRef?.current) {
            const root = createTabbableRoot(datePickerDialogRef.current, true);

            if (!root.active) {
                datePickerDialogRef.current.addEventListener('focusin', function _listener() {
                    (datePickerDialogRef?.current as Element)?.removeEventListener('focusin', _listener);
                    root.activate();
                });
            }

            datePickerProps.current.onKeyDownCapture = (evt: KeyboardEvent) => {
                switch (evt.code) {
                    case InteractionKeyCode.ARROW_DOWN:
                    case InteractionKeyCode.ARROW_LEFT:
                    case InteractionKeyCode.ARROW_RIGHT:
                    case InteractionKeyCode.ARROW_UP:
                    case InteractionKeyCode.END:
                    case InteractionKeyCode.HOME:
                    case InteractionKeyCode.PAGE_DOWN:
                    case InteractionKeyCode.PAGE_UP:
                        return (focusByKeyboard = true);
                    case InteractionKeyCode.TAB:
                        return (focusByKeyboard = root.handleTab(evt));
                }
            };

            datePickerProps.current.onfocusoutCapture = (evt: FocusEvent) => {
                if (root.tabbables.includes(evt.relatedTarget as Element)) return;

                if (!hasFocusWithin(datePickerDialogRef?.current as Element)) {
                    console.log('deactivate...');
                } else if (!focusByKeyboard || (focusByKeyboard = false)) {
                    console.log('clicked...');
                }
            };
        }
    }, []);

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
            <div ref={datePickerDialogRef} role="dialog" aria-label="Choose date" {...datePickerProps.current}>
                <div ref={calendarControlsContainerRef} role="group" style={{ textAlign: 'center' }} />
                <Calendar {...props} traversalControls={CalendarTraversalControls.CONDENSED} renderControl={renderControl} />
            </div>
        </>
    );
}
