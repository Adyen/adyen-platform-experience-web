import { useMemo } from 'preact/hooks';
import { CalendarGridDateProps } from '@src/components/internal/Calendar/components/CalendarGrid/types';
import { hasFlag, useClassName } from '@src/components/internal/Calendar/components/CalendarGrid/utils';
import calendar from '@src/components/internal/Calendar/core';

const CalendarGridDate = ({
    childClassName,
    children,
    className,
    dateTime,
    displayDate,
    flags = 0,
    childProps: { children: _1, className: requiredChildClassName, ...childProps } = {} as Exclude<CalendarGridDateProps['childProps'], undefined>,
    props: { children: _2, className: requiredClassName, ...priorityProps } = {} as Exclude<CalendarGridDateProps['props'], undefined>,
    ...props
}: CalendarGridDateProps) => {
    const [withinMonth, dataAttrs] = useMemo(() => {
        const withinMonth = hasFlag(flags, calendar.flag.WITHIN_BLOCK);
        const dataAttrs = { 'data-within-month': withinMonth } as any;

        if (withinMonth) {
            const withinRange = hasFlag(flags, calendar.flag.WITHIN_RANGE);

            dataAttrs['data-today'] = hasFlag(flags, calendar.flag.TODAY);
            dataAttrs['data-first-week-day'] = hasFlag(flags, calendar.flag.ROW_START);
            dataAttrs['data-last-week-day'] = hasFlag(flags, calendar.flag.ROW_END);
            dataAttrs['data-weekend'] = hasFlag(flags, calendar.flag.WEEKEND);
            dataAttrs['data-first-month-day'] = hasFlag(flags, calendar.flag.BLOCK_START);
            dataAttrs['data-last-month-day'] = hasFlag(flags, calendar.flag.BLOCK_END);

            dataAttrs['data-within-range'] = withinRange;

            if (withinRange) {
                dataAttrs['data-range-end'] = hasFlag(flags, calendar.flag.RANGE_END);
                dataAttrs['data-range-start'] = hasFlag(flags, calendar.flag.RANGE_START);
                dataAttrs['data-selection-end'] = hasFlag(flags, calendar.flag.HIGHLIGHT_END);
                dataAttrs['data-selection-start'] = hasFlag(flags, calendar.flag.HIGHLIGHT_START);
                dataAttrs['data-within-selection'] = hasFlag(flags, calendar.flag.HIGHLIGHTED);
            }
        }

        return [withinMonth, dataAttrs] as const;
    }, [flags]);

    const classes = useClassName({ className, requiredClassName, fallbackClassName: 'adyen-fp-calendar-month__grid-cell' });

    const childClasses = useClassName({
        className: childClassName,
        fallbackClassName: 'adyen-fp-calendar__date',
        requiredClassName: requiredChildClassName,
    });

    return (
        <td {...props} {...dataAttrs} {...priorityProps} className={classes}>
            {withinMonth && (
                <time {...childProps} className={childClasses} dateTime={dateTime}>
                    {displayDate}
                </time>
            )}
        </td>
    );
};

export default CalendarGridDate;
