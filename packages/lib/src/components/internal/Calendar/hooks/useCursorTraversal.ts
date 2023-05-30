import { useCallback, useMemo, useState } from 'preact/hooks';
import { CalendarCursorShift, CalendarView } from '../types';
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

const useCursorTraversal = (calendar: CalendarView, onSelected: false | ((date: any) => void)) => {
    const [, setCursorPosition ] = useState(calendar.shiftCursor());
    const [, nominateCursorRefCandidate ] = useSharedElementRef(CursorDateRefConfig);

    const augmentCursorElement = useCallback((cursorPosition: number, cursorElementProps: Record<any, any>) => {
        if (cursorPosition < 0) return;
        if (cursorPosition === calendar.shiftCursor()) {
            cursorElementProps.ref = (elem: HTMLElement | null) => elem && nominateCursorRefCandidate(elem);
        }
        cursorElementProps['data-cursor-position'] = cursorPosition;
    }, [calendar, nominateCursorRefCandidate]);

    const cursorRootProps = useMemo(() => {
        const props = {
            onKeyDownCapture(evt: KeyboardEvent) {
                switch (evt.code) {
                    case InteractionKeyCode.ARROW_LEFT:
                        return setCursorPosition(calendar.shiftCursor(CalendarCursorShift.PREV_WEEK_DAY));
                    case InteractionKeyCode.ARROW_RIGHT:
                        return setCursorPosition(calendar.shiftCursor(CalendarCursorShift.NEXT_WEEK_DAY));
                    case InteractionKeyCode.ARROW_UP:
                        return setCursorPosition(calendar.shiftCursor(CalendarCursorShift.PREV_WEEK));
                    case InteractionKeyCode.ARROW_DOWN:
                        return setCursorPosition(calendar.shiftCursor(CalendarCursorShift.NEXT_WEEK));
                    case InteractionKeyCode.HOME:
                        return setCursorPosition(calendar.shiftCursor(
                            evt.ctrlKey ? CalendarCursorShift.FIRST_MONTH_DAY : CalendarCursorShift.FIRST_WEEK_DAY
                        ));
                    case InteractionKeyCode.END:
                        return setCursorPosition(calendar.shiftCursor(
                            evt.ctrlKey ? CalendarCursorShift.LAST_MONTH_DAY : CalendarCursorShift.LAST_WEEK_DAY
                        ));
                    case InteractionKeyCode.PAGE_UP:
                        return setCursorPosition(calendar.shiftCursor(CalendarCursorShift.PREV_MONTH));
                    case InteractionKeyCode.PAGE_DOWN:
                        return setCursorPosition(calendar.shiftCursor(CalendarCursorShift.NEXT_MONTH));
                    case InteractionKeyCode.SPACE:
                    case InteractionKeyCode.ENTER:
                        onSelected && onSelected(calendar[calendar.shiftCursor()]);
                        return;
                }
            }
        } as { onKeyDownCapture: (evt: KeyboardEvent) => void, onClickCapture?: (evt: Event) => void };

        if (onSelected) {
            props.onClickCapture = (evt: Event) => {
                let cursorElement: HTMLElement | null = (evt.target as HTMLElement);

                while (cursorElement && cursorElement !== evt.currentTarget) {
                    const index = Number(cursorElement.dataset.cursorPosition);

                    if (Number.isFinite(index)) {
                        const cursorPosition = calendar.shiftCursor(index);
                        setCursorPosition(cursorPosition);
                        onSelected(calendar[cursorPosition]);
                        break;
                    }

                    cursorElement = cursorElement.parentNode as HTMLElement;
                }
            }
        }

        return props;
    }, [calendar, onSelected]);

    return { augmentCursorElement, cursorRootProps } as const;
};

export default useCursorTraversal;
