import { useMemo } from 'preact/hooks';
import { CalendarGridDateProps } from '@src/components/internal/Calendar/components/CalendarGrid/types';
import { useClassName } from '@src/components/internal/Calendar/components/CalendarGrid/utils';

const CalendarGridDate = ({
    childClassName,
    children,
    className,
    dateTime,
    displayDate,
    flags,
    childProps: { children: _1, className: requiredChildClassName, ...childProps } = {} as Exclude<CalendarGridDateProps['childProps'], undefined>,
    props: { children: _2, className: requiredClassName, ...priorityProps } = {} as Exclude<CalendarGridDateProps['props'], undefined>,
    ...props
}: CalendarGridDateProps) => {
    const [withinMonth, dataAttrs] = useMemo(() => {
        const withinMonth = flags?.WITHIN_BLOCK;
        const dataAttrs = { 'data-within-month': withinMonth } as any;

        if (withinMonth) {
            const withinRange = flags?.WITHIN_RANGE;

            dataAttrs['data-today'] = flags?.TODAY;
            dataAttrs['data-first-week-day'] = flags?.LINE_START;
            dataAttrs['data-last-week-day'] = flags?.LINE_END;
            dataAttrs['data-weekend'] = flags?.WEEKEND;
            dataAttrs['data-first-month-day'] = flags?.BLOCK_START;
            dataAttrs['data-last-month-day'] = flags?.BLOCK_END;

            dataAttrs['data-within-range'] = withinRange;

            if (withinRange) {
                dataAttrs['data-range-end'] = flags?.RANGE_END;
                dataAttrs['data-range-start'] = flags?.RANGE_START;
                dataAttrs['data-selection-end'] = flags?.SELECTION_END;
                dataAttrs['data-selection-start'] = flags?.SELECTION_START;
                dataAttrs['data-within-selection'] = flags?.WITHIN_SELECTION;
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
