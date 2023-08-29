import { Ref } from 'preact';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import { ReflexAction } from '@src/hooks/useReflex';
import { CalendarGridCursorRootProps, CalendarHandle, CalendarProps } from '../types';
import useFocusCursor from '../../../../hooks/element/useFocusCursor';
import calendar from '../calendar';

export const normalizeCalendarOriginDate = (originDate?: CalendarProps['originDate']) => {
    const origins = ([] as number[]).concat(originDate as ConcatArray<number>);
    origins.length = 2;
    return [...origins].map(Number).filter(Boolean) as [number | undefined, number | undefined];
};

const useCalendar = (
    {
        blocks,
        controls,
        dynamicBlockRows,
        firstWeekDay,
        highlight,
        locale,
        onHighlight,
        originDate,
        renderControl,
        sinceDate,
        untilDate,
    }: CalendarProps,
    ref: Ref<unknown>
) => {
    const { i18n } = useCoreContext();
    const [, setLastMutationTimestamp] = useState<DOMHighResTimeStamp>(performance.now());
    const timeslice = useMemo(() => calendar.range(sinceDate, untilDate), [sinceDate, untilDate]);

    const { grid, kill } = useMemo(() => {
        const { grid, kill } = calendar(function () {
            setLastMutationTimestamp(performance.now());
            config.current = this;

            if (highlightStart === grid.highlight.from && highlightEnd === grid.highlight.to) return;

            highlightStart = grid.highlight.from;
            highlightEnd = grid.highlight.to;
            onHighlight?.(highlightStart, highlightEnd);
        });

        let { from: highlightStart, to: highlightEnd } = grid.highlight;

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

    const cursorRootProps = useMemo(() => {
        const pointerHandle = (evt: Event) => {
            grid.cursor(evt);
        };

        return {
            onClickCapture: pointerHandle,
            onMouseOverCapture: pointerHandle,
            onPointerOverCapture: pointerHandle,
            onKeyDownCapture: (evt: KeyboardEvent) => {
                grid.cursor(evt) && evt.preventDefault();
            },
        } as CalendarGridCursorRootProps;
    }, [grid]);

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

    useImperativeHandle(
        ref,
        () =>
            ({
                erase: () => grid?.highlight.erase(),
            } as CalendarHandle),
        [grid]
    );

    useEffect(() => {
        grid.config({
            blocks,
            controls: renderControl ? controls ?? calendar.controls.MINIMAL : calendar.controls.NONE,
            firstWeekDay,
            highlight: onHighlight ? highlight ?? calendar.highlight.ONE : calendar.highlight.NONE,
            locale: locale ?? i18n.locale,
            // minified,
            timeslice,
            withMinimumHeight: dynamicBlockRows,
        });
    }, [blocks, controls, dynamicBlockRows, firstWeekDay, grid, highlight, i18n, locale, onHighlight, renderControl, timeslice]);

    useEffect(() => {
        const origins = normalizeCalendarOriginDate(originDate);
        if (origins[0]) grid.highlight.from = +origins[0];
        if (origins[1]) grid.highlight.to = +origins[1];
        return kill;
    }, []);

    return { config, cursorElementRef, cursorRootProps, grid };
};

export default useCalendar;
