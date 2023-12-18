import { Ref } from 'preact';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import type { ReflexAction } from '@src/hooks/useReflex';
import { getDateObjectFromTimestamp } from '../calendar/utils';
import { isFunction } from '@src/utils/common';
import { EMPTY_OBJECT } from '@src/utils/common/constants';
import { CalendarGridCursorRootProps, CalendarHandle, CalendarProps } from '../types';
import useFocusCursor from '@src/hooks/element/useFocusCursor';
import calendar from '../calendar';

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
        trackCurrentDay,
        untilDate,
        useYearView,
    }: CalendarProps,
    ref: Ref<unknown>
) => {
    const { i18n } = useCoreContext();
    const [lastMutationTimestamp, setLastMutationTimestamp] = useState<DOMHighResTimeStamp>(performance.now());
    const timeslice = useMemo(() => calendar.slice(sinceDate, untilDate), [sinceDate, untilDate]);
    const config = useRef<ReturnType<typeof grid.config>>(EMPTY_OBJECT);

    const activeControls = useMemo(
        () => controls ?? (isFunction(renderControl) ? calendar.controls.MINIMAL : calendar.controls.NONE),
        [controls, renderControl]
    );

    const activeHighlight = useMemo(
        () => highlight ?? (isFunction(onHighlight) ? calendar.highlight.ONE : calendar.highlight.NONE),
        [highlight, onHighlight]
    );

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

    useImperativeHandle(
        ref,
        () => {
            const { from, to } = grid?.highlight || EMPTY_OBJECT;
            return {
                clear: () => {
                    grid?.highlight && (grid.highlight.from = undefined);
                },
                get config() {
                    return { ...(config.current ?? EMPTY_OBJECT) };
                },
                get from() {
                    return getDateObjectFromTimestamp(from);
                },
                get to() {
                    return getDateObjectFromTimestamp(to);
                },
            } as CalendarHandle;
        },
        [grid, lastMutationTimestamp]
    );

    useEffect(() => {
        grid.config({
            blocks,
            controls: activeControls,
            firstWeekDay,
            fixedBlockHeight: !dynamicBlockRows,
            highlight: activeHighlight,
            locale: locale ?? i18n.locale,
            minified: useYearView,
            timeslice,
            trackCurrentDay,
        });
    }, [activeControls, activeHighlight, blocks, dynamicBlockRows, firstWeekDay, grid, i18n, locale, timeslice, trackCurrentDay, useYearView]);

    useEffect(() => {
        const origins = ([] as number[])
            .concat(originDate as ConcatArray<number>)
            .slice(0, 2)
            .map(Number)
            .filter(Boolean);
        if (origins[0]) grid.highlight.from = +origins[0];
        if (origins[1]) grid.highlight.to = +origins[1];
        return kill;
    }, []);

    return { cursorElementRef, cursorRootProps, grid };
};

export default useCalendar;
