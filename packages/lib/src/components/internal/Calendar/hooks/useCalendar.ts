import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import { ReflexAction } from '@src/hooks/useReflex';
import { CalendarConfig } from '@src/components/internal/Calendar/calendar/types';
import useFocusCursor from '../../../../hooks/element/useFocusCursor';
import calendar from '../calendar';

const useCalendar = ({
    // onlyMonthDays,
    // onSelected,
    blocks,
    firstWeekDay,
    minified,
    timeslice,
    withMinimumHeight,
    withRangeSelection,
}: Omit<CalendarConfig, 'locale'>) => {
    const { i18n } = useCoreContext();
    const [, setLastMutationTimestamp] = useState<DOMHighResTimeStamp>(performance.now());

    const { grid, kill } = useMemo(() => {
        const { grid, kill } = calendar(() => setLastMutationTimestamp(performance.now()));

        grid.config.cursorIndex = (evt: Event): number | undefined => {
            let element: HTMLElement | null = evt.target as HTMLElement;

            while (element && element !== evt.currentTarget) {
                const index = Number(element.dataset.cursorPosition);
                if (Number.isFinite(index)) return index;
                element = element.parentNode as HTMLElement;
            }
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

    useEffect(() => kill, []);

    useEffect(() => {
        grid.config({ blocks, firstWeekDay, minified, timeslice, withMinimumHeight, withRangeSelection, locale: i18n.locale });
    }, [i18n, blocks, firstWeekDay, minified, timeslice, withMinimumHeight, withRangeSelection]);

    return { cursorElementRef, cursorRootProps, grid };
};

export default useCalendar;
