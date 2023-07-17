import { JSX } from 'preact';
import { useMemo } from 'preact/hooks';
import { CalendarGridDateProps } from '@src/components/internal/Calendar/components/CalendarGrid/types';
import { hasFlag, useClassName } from '@src/components/internal/Calendar/components/CalendarGrid/utils';
import { CalendarFlag } from '@src/components/internal/Calendar/types';

const CalendarGridDate = (({
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
        const withinMonth = hasFlag(flags, CalendarFlag.WITHIN_MONTH);
        const dataAttrs = { 'data-within-month': withinMonth } as any;

        if (withinMonth) {
            const withinRange = hasFlag(flags, CalendarFlag.WITHIN_RANGE);

            dataAttrs['data-today'] = hasFlag(flags, CalendarFlag.TODAY);
            dataAttrs['data-first-week-day'] = hasFlag(flags, CalendarFlag.WEEK_START);
            dataAttrs['data-last-week-day'] = hasFlag(flags, CalendarFlag.WEEK_END);
            dataAttrs['data-weekend'] = hasFlag(flags, CalendarFlag.WEEKEND);
            dataAttrs['data-first-month-day'] = hasFlag(flags, CalendarFlag.MONTH_START);
            dataAttrs['data-last-month-day'] = hasFlag(flags, CalendarFlag.MONTH_END);

            dataAttrs['data-within-range'] = withinRange;

            if (withinRange) {
                dataAttrs['data-range-end'] = hasFlag(flags, CalendarFlag.RANGE_END);
                dataAttrs['data-range-start'] = hasFlag(flags, CalendarFlag.RANGE_START);
                dataAttrs['data-selection-end'] = hasFlag(flags, CalendarFlag.SELECTION_END);
                dataAttrs['data-selection-start'] = hasFlag(flags, CalendarFlag.SELECTION_START);
                dataAttrs['data-within-selection'] = hasFlag(flags, CalendarFlag.WITHIN_SELECTION);
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
}) as {
    (props: CalendarGridDateProps): JSX.Element;
    readonly TRUSTED_FLAGS: number;
};

Object.defineProperty(CalendarGridDate, 'TRUSTED_FLAGS', {
    value:
        CalendarFlag.WEEK_START |
        CalendarFlag.WEEK_END |
        CalendarFlag.WEEKEND |
        CalendarFlag.TODAY |
        CalendarFlag.MONTH_START |
        CalendarFlag.MONTH_END |
        CalendarFlag.WITHIN_MONTH |
        CalendarFlag.RANGE_START |
        CalendarFlag.RANGE_END |
        CalendarFlag.WITHIN_RANGE,
});

export default CalendarGridDate;
