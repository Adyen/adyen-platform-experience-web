import { createPortal } from 'preact/compat';
import { useMemo, useState } from 'preact/hooks';
import { DatePickerProps } from './types';
import Button from '../Button';
import Calendar from '../Calendar';
import { CalendarTraversal, CalendarTraversalControlRootProps, CalendarTraversalControls } from '../Calendar/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import useElementRef from '../../../hooks/useElementRef';
import useIdRefs from '../../../hooks/useIdRefs';

export default function DatePicker(props: DatePickerProps) {
    const { i18n } = useCoreContext();
    const [renderControl, setRenderControl] = useState<DatePickerProps['renderControl']>();
    const datePickerDialogRef = useElementRef();

    const calendarControlsContainerRef = useElementRef(
        useMemo(() => {
            const renderControl = (traversal: CalendarTraversal, controlRootProps: CalendarTraversalControlRootProps) => {
                if (!(calendarControlsContainerRef.current instanceof HTMLElement)) return null;

                let directionModifier: string;
                let labelModifier: string;
                let label: string;

                switch (traversal) {
                    case CalendarTraversal.PREV:
                        directionModifier = 'prev';
                        labelModifier = 'previous';
                        label = '◀︎';
                        break;
                    case CalendarTraversal.NEXT:
                        directionModifier = labelModifier = 'next';
                        label = '▶︎';
                        break;
                    default:
                        return null;
                }

                return createPortal(
                    <Button
                        aria-label={i18n.get(`calendar.${labelModifier}`)}
                        variant={'ghost'}
                        // disabled={true || false}
                        classNameModifiers={['circle', directionModifier]}
                        label={label}
                        {...controlRootProps}
                    />,
                    calendarControlsContainerRef.current
                );
            };

            return (current: any) => setRenderControl(current instanceof HTMLElement ? () => renderControl : undefined);
        }, [])
    );

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
