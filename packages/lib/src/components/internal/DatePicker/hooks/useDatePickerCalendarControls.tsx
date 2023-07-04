import { useCallback } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useDetachedRender from '../../../../hooks/element/useDetachedRender';
import { CalendarTraversal, CalendarTraversalControlRootProps } from '../../Calendar/types';
import Button from '../../Button';

const useDatePickerCalendarControls = () => {
    const { i18n } = useCoreContext();
    return useDetachedRender(
        useCallback(
            (targetElement, traversal: CalendarTraversal, controlRootProps: CalendarTraversalControlRootProps) => {
                if (!(targetElement instanceof HTMLElement)) return null;

                let directionModifier: string;
                let labelModifier: 'next' | 'previous';
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

                return (
                    <Button
                        aria-label={i18n.get(`calendar.${labelModifier}Month`)}
                        variant={'ghost'}
                        // disabled={true || false}
                        classNameModifiers={['circle', directionModifier]}
                        label={label}
                        {...controlRootProps}
                    />
                );
            },
            [i18n]
        )
    );
};

export default useDatePickerCalendarControls;
