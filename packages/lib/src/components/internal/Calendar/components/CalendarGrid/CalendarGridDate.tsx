import classnames from 'classnames';
import { toChildArray, VNode } from 'preact';
import { useMemo } from 'preact/hooks';
import { CalendarGridDateProps } from '@src/components/internal/Calendar/components/CalendarGrid/types';
import { parseClassName, withFlag } from '@src/components/internal/Calendar/components/CalendarGrid/utils';
import { CalendarFlag } from '@src/components/internal/Calendar/types';

const TRUSTED_FLAGS =
    CalendarFlag.WEEK_START |
    CalendarFlag.WEEK_END |
    CalendarFlag.WEEKEND |
    CalendarFlag.TODAY |
    CalendarFlag.MONTH_START |
    CalendarFlag.MONTH_END |
    CalendarFlag.WITHIN_MONTH |
    CalendarFlag.RANGE_START |
    CalendarFlag.RANGE_END |
    CalendarFlag.WITHIN_RANGE;

export const CalendarGridDateTime = ({
    children,
    className,
    dateTime,
    displayDate,
    flags,
    withinMonth = false,
    ...props
}: CalendarGridDateProps<HTMLTimeElement>) => {
    return withinMonth ? (
        <time className={className} dateTime={dateTime} {...props}>
            {displayDate}
        </time>
    ) : null;
};

export const CalendarGridDate = ({
    children,
    className,
    dateTime,
    dateTimeProps,
    displayDate,
    flags = 0,
    withinMonth: _,
    ...props
}: CalendarGridDateProps) => {
    const classes = useMemo(() => parseClassName('adyen-fp-calendar-month__grid-cell', className), [className]);
    const withinMonth = withFlag(flags, CalendarFlag.WITHIN_MONTH);
    const dataAttrs = { 'data-within-month': withinMonth } as any;

    let child = null;

    if (withinMonth) {
        let { classes = 'adyen-fp-calendar__date', ...extendedDateTimeProps } = {} as any;
        const {
            children: _1,
            className: requiredDateTimeClassName,
            dateTime: _2,
            dateTimeProps: _3,
            displayDate: _4,
            flags: untrustedFlags = 0,
            withinMonth: _5,
            ...trustedDateTimeProps
        } = (dateTimeProps || {}) as CalendarGridDateProps<HTMLTimeElement>;

        const childrenArray = toChildArray(children);

        if (childrenArray.length === 1 && (childrenArray[0] as VNode<{}>)?.type === CalendarGridDateTime) {
            const {
                children: _1,
                className,
                dateTime: _2,
                dateTimeProps: _3,
                displayDate: _4,
                flags: untrustedFlags = 0,
                withinMonth: _5,
                ...props
            } = ((childrenArray[0] as VNode<{}>)?.props || {}) as CalendarGridDateProps<HTMLTimeElement>;

            classes = parseClassName(classes, className);
            flags |= untrustedFlags & ~TRUSTED_FLAGS;
            extendedDateTimeProps = props;
        }

        child = (
            <CalendarGridDateTime
                className={classnames(parseClassName('', requiredDateTimeClassName), classes)}
                dateTime={dateTime}
                displayDate={displayDate}
                withinMonth={!!withinMonth}
                {...extendedDateTimeProps}
                {...trustedDateTimeProps}
            />
        );

        dataAttrs['data-today'] = withFlag(flags, CalendarFlag.TODAY);
        dataAttrs['data-first-week-day'] = withFlag(flags, CalendarFlag.WEEK_START);
        dataAttrs['data-last-week-day'] = withFlag(flags, CalendarFlag.WEEK_END);
        dataAttrs['data-weekend'] = withFlag(flags, CalendarFlag.WEEKEND);
        dataAttrs['data-first-month-day'] = withFlag(flags, CalendarFlag.MONTH_START);
        dataAttrs['data-last-month-day'] = withFlag(flags, CalendarFlag.MONTH_END);
        dataAttrs['data-selection-start'] = withFlag(flags, CalendarFlag.SELECTION_START);
        dataAttrs['data-selection-end'] = withFlag(flags, CalendarFlag.SELECTION_END);
        dataAttrs['data-selection-start'] = withFlag(flags, CalendarFlag.SELECTION_START);
        dataAttrs['data-within-selection'] = withFlag(flags, CalendarFlag.WITHIN_SELECTION);
    }

    return (
        <td className={classes} {...dataAttrs} {...props}>
            {withinMonth && child}
        </td>
    );
};

export default CalendarGridDate;
