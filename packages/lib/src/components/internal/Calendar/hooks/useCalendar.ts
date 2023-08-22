import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import { ReflexAction } from '@src/hooks/useReflex';
import { CalendarConfig } from '../core/calendar/types';
import useFocusCursor from '../../../../hooks/element/useFocusCursor';
import calendar from '../core';

const useCalendar = ({
    // onlyMonthDays,
    // onSelected,
    ...config
}: CalendarConfig) => {
    const { i18n } = useCoreContext();
    const [, setLastMutationTimestamp] = useState<DOMHighResTimeStamp>(performance.now());

    const { configure, disconnect, grid } = useMemo(
        () =>
            calendar({
                indexFromEvent: (evt: Event): number | undefined => {
                    let element: HTMLElement | null = evt.target as HTMLElement;

                    while (element && element !== evt.currentTarget) {
                        const index = Number(element.dataset.cursorPosition);
                        if (Number.isFinite(index)) return index;
                        element = element.parentNode as HTMLElement;
                    }
                },
                watch: () => setLastMutationTimestamp(performance.now()),
            }),
        []
    );

    const cursorRootProps = useMemo(
        () => ({
            onClickCapture: grid.interaction,
            onKeyDownCapture: (evt: KeyboardEvent) => grid.interaction(evt) && evt.preventDefault(),
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

    useEffect(() => disconnect, []);

    useEffect(() => {
        configure({ ...config, locale: config.locale || i18n.locale });
    }, [i18n, config]);

    return { cursorElementRef, cursorRootProps, grid };
};

export default useCalendar;
