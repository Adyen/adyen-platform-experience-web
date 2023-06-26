import { useCallback, useMemo, useState } from 'preact/hooks';
import { DatePickerProps } from './types';
import { getCalendarDateString } from '../Calendar/internal/createCalendar';
import { CalendarTraversalControls } from '../Calendar/types';
import { InteractionKeyCode } from '../../types';
import useDatePickerCalendarControls from './hooks/useDatePickerCalendarControls';
import useElementWithUniqueIdRef from '../../../hooks/ref/useElementWithUniqueIdRef';
import useElementUniqueIdRefs from '../../../hooks/ref/useElementUniqueIdRefs';
import useFocusTrapElementRef from '../../../hooks/ref/useFocusTrapElementRef';
import useBooleanState from '../../../hooks/useBooleanState';
import Calendar from '../Calendar';
import InputText from '../FormFields/InputText';
import './DatePicker.scss';

export default function DatePicker(props: DatePickerProps) {
    const [currentValue, setCurrentValue] = useState('');
    const [showPopup, updateShowPopup, toggleShowPopup] = useBooleanState(false);
    const [renderControl, calendarControlsContainerRef] = useDatePickerCalendarControls();
    const a11yIds_datePicker = useElementUniqueIdRefs('datepicker-dialog');
    const datePickerInputRef = useElementWithUniqueIdRef('datepicker-input');

    const datePickerDialogRef = useFocusTrapElementRef(
        useElementWithUniqueIdRef('datepicker-dialog'),
        useCallback((interactionKeyPressed: boolean) => {
            const inputElement = datePickerInputRef?.current as HTMLElement;

            if (document.activeElement !== inputElement) {
                updateShowPopup(false);
            }

            if (interactionKeyPressed) {
                inputElement?.focus();
            } else if (!document.activeElement) {
                inputElement?.focus();
                inputElement?.blur();
            }
        }, [])
    );

    const calendarProps = useMemo(() => {
        const onSelected = (date: string) => {
            const update = date || '';

            setCurrentValue(update);
            update && updateShowPopup(false);

            props.onSelected?.(date);
            update && props.onUpdated?.();
        };
        return {
            ...props,
            originDate: currentValue || undefined,
            onSelected,
            renderControl,
            traversalControls: CalendarTraversalControls.CONDENSED,
        } as const;
    }, [props, currentValue, renderControl]);

    const handleClick = useCallback((evt: Event) => {
        (evt.target as HTMLElement)?.focus();
        toggleShowPopup();
    }, []);

    const handleKeyUp = useCallback((evt: Event) => {
        switch ((evt as KeyboardEvent).code) {
            case InteractionKeyCode.ARROW_DOWN:
            case InteractionKeyCode.ENTER:
            case InteractionKeyCode.SPACE:
                updateShowPopup(true);
                break;
        }
    }, []);

    return (
        <div class={'adyen-fp-datepicker'}>
            <InputText
                ref={datePickerInputRef}
                role="combobox"
                aria-autocomplete="none"
                aria-expanded={`${showPopup}`}
                aria-haspopup="dialog"
                aria-labelledby={a11yIds_datePicker}
                aria-controls={a11yIds_datePicker}
                onClick={handleClick}
                onKeyUp={handleKeyUp}
                placeholder={getCalendarDateString(new Date())}
                readonly={true}
                value={currentValue}
            />
            <div ref={datePickerDialogRef} class={'adyen-fp-datepicker__dialog'} role="dialog" aria-label="Choose date">
                {showPopup && (
                    <>
                        <div ref={calendarControlsContainerRef} class={'adyen-fp-datepicker__controls'} role="group" />
                        <Calendar {...calendarProps} />
                    </>
                )}
            </div>
        </div>
    );
}
