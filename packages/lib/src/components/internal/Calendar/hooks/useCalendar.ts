import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import { ReflexAction } from '@src/hooks/useReflex';
import { CalendarProps, CalendarTraversalControls } from '../types';
import useFocusCursor from '../../../../hooks/element/useFocusCursor';
import calendar from '../calendar';

const useCalendar = ({
    calendarMonths,
    dynamicMonthWeeks,
    firstWeekDay,
    locale,
    // offset,
    // onlyMonthDays,
    // onSelected,
    // originDate,
    renderControl,
    sinceDate,
    traversalControls,
    untilDate,
}: CalendarProps) => {
    const { i18n } = useCoreContext();
    const [, setLastMutationTimestamp] = useState<DOMHighResTimeStamp>(performance.now());

    const { grid, kill } = useMemo(() => {
        const { grid, kill } = calendar(function () {
            setLastMutationTimestamp(performance.now());
            config.current = this;
        });

        grid.config.cursorIndex = (evt: Event): number | undefined => {
            let element: HTMLElement | null = evt.target as HTMLElement;

            while (element && element !== evt.currentTarget) {
                const index = Number(element.dataset.cursorPosition);
                if (Number.isFinite(index)) return index;
                element = element.parentNode as HTMLElement;
            }
        };

        grid.config.shiftFactor = function (evt: Event) {
            if (this.controls !== calendar.controls.MINIMAL) return;
            if ((evt as MouseEvent)?.shiftKey) return 12;
            if ((evt as MouseEvent)?.altKey) return this.blocks;
            return 1;
        };

        return { grid, kill };
    }, []);

    const cursorRootProps = useMemo(
        () => ({
            onClickCapture: (evt: Event) => {
                grid.cursor(evt);
            },
            onKeyDownCapture: (evt: KeyboardEvent) => {
                grid.cursor(evt) && evt.preventDefault();
            },
        }),
        [grid]
    );

    const cursorElementRef = useFocusCursor(
        useCallback(
            ((current, previous) => {
                if (previous instanceof Element) previous.removeAttribute('aria-selected');
                if (current instanceof Element) current.setAttribute('aria-selected', 'true');
            }) as ReflexAction<Element>,
            []
        )
    );

    const config = useRef<ReturnType<typeof grid.config>>({});
    const timeslice = useMemo(() => calendar.range(sinceDate, untilDate), [sinceDate, untilDate]);

    useEffect(() => kill, []);

    useEffect(() => {
        grid.config({
            firstWeekDay,
            timeslice,
            blocks: calendarMonths,
            controls: renderControl
                ? traversalControls === CalendarTraversalControls.CONDENSED
                    ? calendar.controls.MINIMAL
                    : calendar.controls.ALL
                : calendar.controls.NONE,
            locale: locale ?? i18n.locale,
            // minified,
            withMinimumHeight: dynamicMonthWeeks,
            withRangeSelection: true,
        });
    }, [i18n, grid, locale, timeslice, calendarMonths, dynamicMonthWeeks, firstWeekDay, renderControl, traversalControls]);

    return { config, cursorElementRef, cursorRootProps, grid };
};

export default useCalendar;
