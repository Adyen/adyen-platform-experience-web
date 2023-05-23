import { useMemo, useState } from 'preact/hooks';
import { CalendarCursorShift, CalendarViewRecord } from '../types';
import { InteractionKeyCode } from '../../../types';
import { UseSharedElementRefConfig } from '../../../../hooks/useSharedElementRef/types';
import useSharedElementRef from '../../../../hooks/useSharedElementRef';

const shouldRetainCurrentElement = (currentElement: HTMLElement, candidateElement: HTMLElement) => (
    currentElement.dataset.date === candidateElement.dataset.date &&
    currentElement.dataset.withinMonth === 'true'
);

const CursorDateRefConfig: UseSharedElementRefConfig = {
    shouldRetainCurrentElement: (currentElement: HTMLElement, candidateElement: HTMLElement) => {
        if (shouldRetainCurrentElement(currentElement, candidateElement)) return true;
        currentElement.setAttribute('tabindex', '-1');
        currentElement.removeAttribute('aria-selected');
    },
    withCurrentElement: (currentElement: HTMLElement) => {
        currentElement.setAttribute('tabindex', '0');
        currentElement.setAttribute('aria-selected', 'true');
        currentElement.focus();
    }
};

const useCursorTraversal = (calendarViewRecord: CalendarViewRecord) => {
    const [ calendar,, shiftCursor ] = calendarViewRecord;
    const [ cursorPosition, setCursorPosition ] = useState(shiftCursor());
    const [, nominateCursorRefCandidate ] = useSharedElementRef(CursorDateRefConfig);

    const augmentCursorElement = useMemo(() => {
        const cursorDate = calendar[cursorPosition] as string;

        return (date: string, cursorElementProps: Record<any, any>) => {
            if (date !== cursorDate) return;
            cursorElementProps.ref = (elem: HTMLElement | null) => elem && nominateCursorRefCandidate(elem);
        };
    }, [calendar, cursorPosition]);

    const cursorRootProps = useMemo(() => ({
        onKeyDownCapture(evt: KeyboardEvent) {
            switch (evt.code) {
                case InteractionKeyCode.ARROW_LEFT:
                    return setCursorPosition(shiftCursor(CalendarCursorShift.PREV_WEEK_DAY));
                case InteractionKeyCode.ARROW_RIGHT:
                    return setCursorPosition(shiftCursor(CalendarCursorShift.NEXT_WEEK_DAY));
                case InteractionKeyCode.ARROW_UP:
                    return setCursorPosition(shiftCursor(CalendarCursorShift.PREV_WEEK));
                case InteractionKeyCode.ARROW_DOWN:
                    return setCursorPosition(shiftCursor(CalendarCursorShift.NEXT_WEEK));
                case InteractionKeyCode.HOME:
                    return setCursorPosition(shiftCursor(
                        evt.ctrlKey ? CalendarCursorShift.FIRST_MONTH_DAY : CalendarCursorShift.FIRST_WEEK_DAY
                    ));
                case InteractionKeyCode.END:
                    return setCursorPosition(shiftCursor(
                        evt.ctrlKey ? CalendarCursorShift.LAST_MONTH_DAY : CalendarCursorShift.LAST_WEEK_DAY
                    ));
                // case InteractionKeyCode.SPACE:
                // case InteractionKeyCode.ENTER:
                //     return;
            }
        }
    }), [shiftCursor]);

    return { augmentCursorElement, cursorRootProps } as const;
};

export default useCursorTraversal;
