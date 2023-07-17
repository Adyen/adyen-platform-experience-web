import { useMemo } from 'preact/hooks';
import { CalendarCursorRootProps, CalendarCursorShift, CalendarFlag, CalendarProps, CalendarView } from '../types';
import { InteractionKeyCode } from '../../../types';

const useCursorRoot = (calendar: CalendarView, onSelected: CalendarProps['onSelected']) =>
    useMemo(() => {
        const triggerSelection =
            onSelected &&
            (() => {
                const cursorPosition = calendar.cursorPosition;
                const withinRange = (calendar.flags[cursorPosition] || 0) & CalendarFlag.WITHIN_RANGE;
                withinRange && onSelected(calendar[cursorPosition]?.[0]);
            });

        return {
            onClickCapture(evt: Event) {
                let cursorElement: HTMLElement | null = evt.target as HTMLElement;

                while (cursorElement && cursorElement !== evt.currentTarget) {
                    const index = Number(cursorElement.dataset.cursorPosition);

                    if (Number.isFinite(index)) {
                        calendar.shiftCursor(index);
                        triggerSelection?.();
                        break;
                    }

                    cursorElement = cursorElement.parentNode as HTMLElement;
                }
            },

            onKeyDownCapture(evt: KeyboardEvent) {
                switch (evt.code) {
                    case InteractionKeyCode.ARROW_LEFT:
                    case InteractionKeyCode.ARROW_RIGHT:
                    case InteractionKeyCode.ARROW_UP:
                    case InteractionKeyCode.ARROW_DOWN:
                    case InteractionKeyCode.HOME:
                    case InteractionKeyCode.END:
                    case InteractionKeyCode.PAGE_UP:
                    case InteractionKeyCode.PAGE_DOWN:
                    case InteractionKeyCode.SPACE:
                    case InteractionKeyCode.ENTER:
                        evt.preventDefault();
                        break;
                    default:
                        return;
                }

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
                        return calendar.shiftCursor(evt.ctrlKey ? CalendarCursorShift.FIRST_MONTH_DAY : CalendarCursorShift.FIRST_WEEK_DAY);
                    case InteractionKeyCode.END:
                        return calendar.shiftCursor(evt.ctrlKey ? CalendarCursorShift.LAST_MONTH_DAY : CalendarCursorShift.LAST_WEEK_DAY);
                    case InteractionKeyCode.PAGE_UP:
                        return calendar.shiftCursor(CalendarCursorShift.PREV_MONTH);
                    case InteractionKeyCode.PAGE_DOWN:
                        return calendar.shiftCursor(CalendarCursorShift.NEXT_MONTH);
                    case InteractionKeyCode.SPACE:
                    case InteractionKeyCode.ENTER:
                        return triggerSelection?.();
                }
            },
        } as CalendarCursorRootProps;
    }, [calendar, onSelected]);

export default useCursorRoot;
