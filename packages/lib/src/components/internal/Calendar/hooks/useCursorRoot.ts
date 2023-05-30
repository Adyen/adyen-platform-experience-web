import { MutableRef, useEffect, useMemo, useRef } from 'preact/hooks';
import { CalendarCursorShift, CalendarView } from '../types';
import { InteractionKeyCode } from '../../../types';

const useCursorRoot = (
    calendar: CalendarView,
    cursorElementRef: MutableRef<HTMLElement | null>,
    onSelectedCallback: false | ((date: any) => void)
) => {
    const previousElementRef = useRef(cursorElementRef.current);

    useEffect(() => {
        const previousElement = previousElementRef.current;
        const currentElement = cursorElementRef.current;

        if (previousElement && previousElement !== currentElement) {
            previousElement.setAttribute('tabindex', '-1');
            previousElement.removeAttribute('aria-selected');
        }

        if (currentElement) {
            currentElement.setAttribute('tabindex', '0');
            currentElement.setAttribute('aria-selected', 'true');
            currentElement.focus();
        }

        previousElementRef.current = currentElement;
    });

    return useMemo(() => {
        const props = {
            onKeyDownCapture(evt: KeyboardEvent) {
                switch (evt.code) {
                    case InteractionKeyCode.ARROW_LEFT:
                        return calendar.shiftCursor(CalendarCursorShift.PREV_WEEK_DAY);
                    case InteractionKeyCode.ARROW_RIGHT:
                        return calendar.shiftCursor(CalendarCursorShift.NEXT_WEEK_DAY);
                    case InteractionKeyCode.ARROW_UP:
                        return calendar.shiftCursor(CalendarCursorShift.PREV_WEEK);
                    case InteractionKeyCode.ARROW_DOWN:
                        return calendar.shiftCursor(CalendarCursorShift.NEXT_WEEK);
                    case InteractionKeyCode.HOME:
                        return calendar.shiftCursor(
                            evt.ctrlKey ? CalendarCursorShift.FIRST_MONTH_DAY : CalendarCursorShift.FIRST_WEEK_DAY
                        );
                    case InteractionKeyCode.END:
                        return calendar.shiftCursor(
                            evt.ctrlKey ? CalendarCursorShift.LAST_MONTH_DAY : CalendarCursorShift.LAST_WEEK_DAY
                        );
                    case InteractionKeyCode.PAGE_UP:
                        return calendar.shiftCursor(CalendarCursorShift.PREV_MONTH);
                    case InteractionKeyCode.PAGE_DOWN:
                        return calendar.shiftCursor(CalendarCursorShift.NEXT_MONTH);
                    case InteractionKeyCode.SPACE:
                    case InteractionKeyCode.ENTER:
                        onSelectedCallback && onSelectedCallback(calendar[calendar.cursorPosition]?.[0]);
                        return;
                }
            }
        } as { onKeyDownCapture: (evt: KeyboardEvent) => void, onClickCapture?: (evt: Event) => void };

        if (onSelectedCallback) {
            props.onClickCapture = (evt: Event) => {
                let cursorElement: HTMLElement | null = (evt.target as HTMLElement);

                while (cursorElement && cursorElement !== evt.currentTarget) {
                    const index = Number(cursorElement.dataset.cursorPosition);

                    if (Number.isFinite(index)) {
                        calendar.shiftCursor(index);
                        onSelectedCallback(calendar[calendar.cursorPosition]?.[0]);
                        break;
                    }

                    cursorElement = cursorElement.parentNode as HTMLElement;
                }
            }
        }

        return props;
    }, [calendar, onSelectedCallback]);
};

export default useCursorRoot;
