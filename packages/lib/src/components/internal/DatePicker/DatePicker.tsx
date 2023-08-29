// import { useCallback, useMemo, useState } from 'preact/hooks';
// import { InteractionKeyCode } from '@src/components/types';
// import { getCalendarDateString } from '../Calendar/internal/createCalendar';
// import useDatePickerCalendarControls from './hooks/useDatePickerCalendarControls';
// import useUniqueIdentifier from '../../../hooks/element/useUniqueIdentifier';
// import useIdentifierString from '../../../hooks/element/useIdentifierString';
// import useFocusTrap from '../../../hooks/element/useFocusTrap';
// import useBooleanState from '../../../hooks/useBooleanState';
// import Calendar from '../Calendar';
// import calendar from '../Calendar/calendar';
// import InputText from '../FormFields/InputText';
// import './DatePicker.scss';
// import {CalendarProps} from "@src/components/internal/Calendar/types";
//
// export default function DatePicker(props: CalendarProps) {
//     const [currentValue, setCurrentValue] = useState('');
//     const [showPopup, updateShowPopup, toggleShowPopup] = useBooleanState(false);
//     const [renderControl, calendarControlsContainerRef] = useDatePickerCalendarControls();
//     const datePickerInputRef = useUniqueIdentifier();
//
//     const datePickerDialogRef = useFocusTrap(
//         useUniqueIdentifier(),
//         useCallback((interactionKeyPressed: boolean) => {
//             const inputElement = datePickerInputRef?.current as HTMLElement;
//
//             if (document.activeElement !== inputElement) {
//                 updateShowPopup(false);
//             }
//
//             if (interactionKeyPressed) {
//                 inputElement?.focus();
//             } else if (!document.activeElement) {
//                 inputElement?.focus();
//                 inputElement?.blur();
//             }
//         }, [])
//     );
//
//     const a11yIds_datePicker = useIdentifierString(datePickerDialogRef);
//
//     const calendarProps = useMemo(() => {
//         const onSelected = (date: string) => {
//             const update = date || '';
//
//             setCurrentValue(update);
//             update && updateShowPopup(false);
//
//             props.onHighlight?.(date);
//             update && props.onUpdated?.();
//         };
//         return {
//             ...props,
//             controls: calendar.controls.MINIMAL,
//             onHighlight: onHighlight,
//             // originDate: currentValue || undefined,
//             renderControl,
//         } as const;
//     }, [props, currentValue, renderControl]);
//
//     const handleClick = useCallback((evt: Event) => {
//         (evt.target as HTMLElement)?.focus();
//         toggleShowPopup();
//     }, []);
//
//     const handleKeyUp = useCallback((evt: Event) => {
//         switch ((evt as KeyboardEvent).code) {
//             case InteractionKeyCode.ARROW_DOWN:
//             case InteractionKeyCode.ENTER:
//             case InteractionKeyCode.SPACE:
//                 updateShowPopup(true);
//                 break;
//         }
//     }, []);
//
//     return (
//         <div class={'adyen-fp-datepicker'}>
//             <InputText
//                 ref={datePickerInputRef}
//                 role="combobox"
//                 aria-autocomplete="none"
//                 aria-expanded={`${showPopup}`}
//                 aria-haspopup="dialog"
//                 aria-labelledby={a11yIds_datePicker}
//                 aria-controls={a11yIds_datePicker}
//                 onClick={handleClick}
//                 onKeyUp={handleKeyUp}
//                 placeholder={getCalendarDateString(new Date())}
//                 readonly={true}
//                 value={currentValue}
//             />
//             <div ref={datePickerDialogRef} class={'adyen-fp-datepicker__dialog'} role="dialog" aria-label="Choose date">
//                 {showPopup && (
//                     <>
//                         <div ref={calendarControlsContainerRef} class={'adyen-fp-datepicker__controls'} role="group" />
//                         <Calendar {...calendarProps} />
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }
