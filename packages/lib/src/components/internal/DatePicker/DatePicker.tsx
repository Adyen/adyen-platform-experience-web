import { useEffect, useRef } from 'preact/hooks';
import useDatePickerCalendarControls from './hooks/useDatePickerCalendarControls';
import { DatePickerProps } from './types';
import { CalendarTraversalControls } from '../Calendar/types';
import { InteractionKeyCode } from '../../types';
import createTabbableRoot from '../../../hooks/ally/focus/tabbable';
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
        let interactionKeyPressed = false;
        // let raf: number | undefined;

        if (datePickerDialogRef?.current) {
            const root = createTabbableRoot(datePickerDialogRef.current);

            datePickerProps.current['onKeyDown'] = (evt: KeyboardEvent) => {
                switch (evt.code) {
                    case InteractionKeyCode.ARROW_DOWN:
                    case InteractionKeyCode.ARROW_LEFT:
                    case InteractionKeyCode.ARROW_RIGHT:
                    case InteractionKeyCode.ARROW_UP:
                    case InteractionKeyCode.END:
                    case InteractionKeyCode.HOME:
                    case InteractionKeyCode.PAGE_DOWN:
                    case InteractionKeyCode.PAGE_UP:
                    case InteractionKeyCode.TAB:
                        interactionKeyPressed = true;
                        break;
                }

                if (evt.code === InteractionKeyCode.TAB) {
                    focusByKeyboard = root.handleTab(evt);
                }
            };

            datePickerProps.current['onfocusin'] = (/*evt: Event*/) => {
                // cancelAnimationFrame(raf as number);
                // raf = requestAnimationFrame(() => {
                //     raf = undefined;
                //     console.log('here(1)...');
                //
                //     if (focusByKeyboard && !(focusByKeyboard = false)) return;
                //     console.log('here(2)...');
                //
                //     const tabPosition = tabbableElements.indexOf(document.activeElement as Element);
                //     if (tabPosition >= 0) currentTabPosition = tabPosition;
                //     else (tabbableElements[currentTabPosition] as HTMLElement)?.focus();
                // });
                // console.log(document.activeElement);
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
