import { createPortal, memo } from 'preact/compat';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { DatePickerProps } from './types';
import Button from '../Button';
import Calendar from '../Calendar';
import { CalendarTraversal, CalendarTraversalControlRootProps, CalendarTraversalControls } from '../Calendar/types';
import useCoreContext from '../../../core/Context/useCoreContext';

const CalendarControl = memo(({ directionModifier, label, labelModifier, traversal, ...restProps }: any) => {
    const { i18n } = useCoreContext();

    return <Button
        aria-label={i18n.get(`calendar.${labelModifier}`)}
        variant={'ghost'}
        // disabled={true || false}
        classNameModifiers={['circle', directionModifier]}
        label={label}
        {...restProps}
    />
});

export default function DatePicker(props: DatePickerProps) {
    const [ mounted, setMounted ] = useState(false);
    const calendarControlsContainerElementRef = useRef(null);

    const renderControl = useCallback((traversal: CalendarTraversal, controlRootProps: CalendarTraversalControlRootProps) => {
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
            default: return null;
        }

        return createPortal(
            <CalendarControl {...props} {...controlRootProps} />,
            calendarControlsContainerElementRef.current
        );
    }, [mounted]);

    useEffect(() => {
        !mounted && setMounted(mounted => !mounted);
    }, [mounted]);

    return <div role="dialog">
        <div ref={calendarControlsContainerElementRef} role="group" aria-label="calendar navigation" style={{ textAlign: 'center' }} />
        <Calendar {...props} traversalControls={CalendarTraversalControls.CONDENSED} renderControl={renderControl} />
    </div>;
}
