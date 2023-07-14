import { JSX } from 'preact';
import { useMemo } from 'preact/hooks';
import { CalendarGridDayOfWeekProps } from '@src/components/internal/Calendar/components/CalendarGrid/types';
import { hasFlag, useClassName } from '@src/components/internal/Calendar/components/CalendarGrid/utils';
import { CalendarFlag } from '@src/components/internal/Calendar/types';

const CalendarGridDayOfWeek = (({
    childClassName,
    children,
    className,
    flags = 0,
    label,
    childProps: { children: _1, className: requiredChildClassName, ...childProps } = {} as Exclude<
        CalendarGridDayOfWeekProps['childProps'],
        undefined
    >,
    props: { children: _2, className: requiredClassName, ...priorityProps } = {} as Exclude<CalendarGridDayOfWeekProps['props'], undefined>,
    ...props
}: CalendarGridDayOfWeekProps) => {
    if (children !== CalendarGridDayOfWeek.CHILD) return null;

    const dataAttrs = useMemo(
        () =>
            ({
                'data-first-week-day': hasFlag(flags, CalendarFlag.WEEK_START),
                'data-last-week-day': hasFlag(flags, CalendarFlag.WEEK_END),
                'data-weekend': hasFlag(flags, CalendarFlag.WEEKEND),
            } as any),
        [flags]
    );

    const classes = useClassName({ className, requiredClassName, fallbackClassName: 'adyen-fp-calendar-month__grid-cell' });

    const childClasses = useClassName({
        className: childClassName,
        fallbackClassName: 'adyen-fp-calendar__day-of-week',
        requiredClassName: requiredChildClassName,
    });

    return (
        <th {...props} {...dataAttrs} {...priorityProps} className={classes}>
            <abbr {...childProps} className={childClasses}>
                {label}
            </abbr>
        </th>
    );
}) as {
    (props: CalendarGridDayOfWeekProps): JSX.Element | null;
    readonly CHILD: Readonly<{}>;
};

Object.defineProperty(CalendarGridDayOfWeek, 'CHILD', {
    value: Object.freeze(Object.create(null)),
});

export default CalendarGridDayOfWeek;
