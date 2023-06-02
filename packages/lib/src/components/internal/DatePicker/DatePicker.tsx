import { createPortal, memo } from 'preact/compat';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { DatePickerProps } from './types';
import Button from '../Button';
import Calendar from '../Calendar';
import { CalendarTraversal, CalendarTraversalControlRootProps, CalendarTraversalControls } from '../Calendar/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import useElementRef from '../../../hooks/useElementRef';
import useIdRefs from '../../../hooks/useIdRefs';

const CalendarNavigationControl = memo(({ directionModifier, label, labelModifier, traversal, ...restProps }: any) => {
    const { i18n } = useCoreContext();

    return (
        <Button
            aria-label={i18n.get(`calendar.${labelModifier}`)}
            variant={'ghost'}
            // disabled={true || false}
            classNameModifiers={['circle', directionModifier]}
            label={label}
            {...restProps}
        />
    );
});

export default function DatePicker(props: DatePickerProps) {
    const [mounted, setMounted] = useState(false);
    const calendarControlsContainerElementRef = useRef(null);
    const datePickerDialogRef = useElementRef();

    const renderControl = useCallback(
        (traversal: CalendarTraversal, controlRootProps: CalendarTraversalControlRootProps) => {
            if (!calendarControlsContainerElementRef.current) return null;

            const props = { key: traversal } as any;

            switch (traversal) {
                case CalendarTraversal.PREV:
                    props.directionModifier = 'prev';
                    props.labelModifier = 'previous';
                    props.label = '◀︎';
                    break;
                case CalendarTraversal.NEXT:
                    props.directionModifier = props.labelModifier = 'next';
                    props.label = '▶︎';
                    break;
                default:
                    return null;
            }

            return createPortal(<CalendarNavigationControl {...props} {...controlRootProps} />, calendarControlsContainerElementRef.current);
        },
        [mounted]
    );

    useEffect(() => {
        !mounted && setMounted(mounted => !mounted);
    }, [mounted]);

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
                <div ref={calendarControlsContainerElementRef} role="group" style={{ textAlign: 'center' }} />
                <Calendar {...props} traversalControls={CalendarTraversalControls.CONDENSED} renderControl={renderControl} />
            </div>
        </>
    );
}
