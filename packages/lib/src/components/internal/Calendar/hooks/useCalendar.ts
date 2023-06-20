import { CalendarProps } from '../types';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCursorRoot from './useCursorRoot';
import useToday from './useToday';
import createCalendar from '../internal/createCalendar';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { NamedRefCallback } from '../../../../hooks/ref/types';
import useFocusCursorElementRef from '../../../../hooks/ref/useFocusCursorElementRef';

const useCalendar = ({
    calendarMonths,
    dynamicMonthWeeks,
    firstWeekDay,
    offset = 0,
    onlyMonthDays,
    onSelected,
    originDate,
    sinceDate,
    trackToday,
    untilDate,
}: CalendarProps) => {
    const {
        i18n: { locale },
    } = useCoreContext();
    const [, setRefreshCount] = useState(0);

    const today = useToday(trackToday);
    const watch = useCallback(() => setRefreshCount(current => ++current), []);

    const calendar = useMemo(
        () =>
            createCalendar(
                {
                    calendarMonths,
                    dynamicMonthWeeks,
                    firstWeekDay,
                    locale,
                    onlyMonthDays,
                    originDate,
                    sinceDate,
                    untilDate,
                    watch,
                },
                offset
            ),
        [calendarMonths, dynamicMonthWeeks, firstWeekDay, locale, offset, onlyMonthDays, originDate, sinceDate, untilDate]
    );

    const cursorRootProps = useCursorRoot(calendar, onSelected);

    const cursorElementRef = useFocusCursorElementRef(
        useCallback(
            ((current, previous) => {
                if (previous instanceof Element) previous.removeAttribute('aria-selected');
                if (current instanceof Element) current.setAttribute('aria-selected', 'true');
            }) as NamedRefCallback<Element>,
            []
        )
    );

    return useMemo(() => ({ calendar, cursorElementRef, cursorRootProps, today } as const), [calendar, cursorElementRef, cursorRootProps, today]);
};

export default useCalendar;
