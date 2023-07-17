import { forwardRef } from 'preact/compat';
import { CalendarGridDateProps, CalendarGridDayOfWeekProps, CalendarGridProps } from './types';
import { CalendarDay, CalendarFlag, CalendarRenderToken } from '../../types';
import { flagsProperty, hasFlag, property, propsProperty } from '@src/components/internal/Calendar/components/CalendarGrid/utils';
import CalendarGridDate from '@src/components/internal/Calendar/components/CalendarGrid/CalendarGridDate';
import CalendarGridDayOfWeek from '@src/components/internal/Calendar/components/CalendarGrid/CalendarGridDayOfWeek';
import '../../Calendar.scss';

export default forwardRef(function CalendarGrid({ calendar, cursorRootProps, prepare, today }: CalendarGridProps, cursorElementRef) {
    return (
        <ol className={'adyen-fp-calendar'} role="none" {...cursorRootProps}>
            {[
                ...calendar.months.map(view => {
                    const month = `${view.year}-${view.month}`;

                    return (
                        <li key={month} className={'adyen-fp-calendar-month'} role="none">
                            <div className={'adyen-fp-calendar-month__name'} role="none">
                                <time dateTime={month} aria-hidden="true">
                                    {view.displayName}
                                </time>
                            </div>

                            <table className={'adyen-fp-calendar-month__grid'} role="grid" aria-label={view.displayName}>
                                <thead>
                                    <tr className={'adyen-fp-calendar-month__grid-row'}>
                                        {[
                                            ...calendar.daysOfWeek.map((labels, index) => {
                                                const [long, , short] = labels;
                                                const props = { 'aria-label': long, key: long, scope: 'col' };
                                                const weekday = (index % 7) as CalendarDay;

                                                let flags = 0;

                                                if (weekday === 0) flags |= CalendarFlag.WEEK_START;
                                                if (weekday === 6) flags |= CalendarFlag.WEEK_END;
                                                if (calendar.weekendDays.includes(weekday)) flags |= CalendarFlag.WEEKEND;

                                                const renderProps = propsProperty.unwrapped<CalendarGridDayOfWeekProps>(
                                                    {
                                                        childClassName: property.mutable('adyen-fp-calendar__day-of-week'),
                                                        childProps: {
                                                            children: property.restricted(),
                                                            className: '',
                                                        },
                                                        children: property.mutable<any>(CalendarGridDayOfWeek.CHILD),
                                                        className: property.mutable('adyen-fp-calendar-month__grid-cell'),
                                                        flags: flagsProperty(flags),
                                                        label: short,
                                                        props: {
                                                            ...props,
                                                            children: property.restricted(),
                                                            className: '',
                                                        },
                                                    },
                                                    true
                                                );

                                                prepare?.(CalendarRenderToken.DAY_OF_WEEK, renderProps);
                                                return <CalendarGridDayOfWeek {...renderProps} />;
                                            }),
                                        ]}
                                    </tr>
                                </thead>

                                <tbody>
                                    {[
                                        ...view.weeks.map((week, weekIndex) => (
                                            <tr key={`${month}:${weekIndex}`} className={'adyen-fp-calendar-month__grid-row'}>
                                                {[
                                                    ...week.map((cursorPosition, index) => {
                                                        const [date, displayDate] =
                                                            cursorPosition < 0
                                                                ? (calendar[view.origin + weekIndex * 7 + index] as string[])
                                                                : (calendar[cursorPosition] as string[]);

                                                        const props = {
                                                            key: `${date}${cursorPosition < 0 ? ':0' : ''}`,
                                                            tabIndex: -1,
                                                        } as any;

                                                        let flags = date === today ? CalendarFlag.TODAY : 0;

                                                        if (cursorPosition >= view.start && cursorPosition <= view.end) {
                                                            if (cursorPosition === calendar.cursorPosition) {
                                                                props.ref = cursorElementRef;
                                                            }

                                                            if (cursorPosition === view.start) flags |= CalendarFlag.MONTH_START;
                                                            if (cursorPosition === view.end) flags |= CalendarFlag.MONTH_END;

                                                            flags |= calendar.flags[cursorPosition] || 0;
                                                            flags |= CalendarFlag.WITHIN_MONTH;
                                                        }

                                                        if (cursorPosition >= 0 && hasFlag(flags, CalendarFlag.WITHIN_RANGE)) {
                                                            props['data-cursor-position'] = cursorPosition;
                                                        }

                                                        const renderProps = propsProperty.unwrapped<CalendarGridDateProps>(
                                                            {
                                                                childClassName: property.mutable('adyen-fp-calendar__date'),
                                                                childProps: {
                                                                    children: property.restricted(),
                                                                    className: '',
                                                                },
                                                                children: property.restricted(),
                                                                className: property.mutable('adyen-fp-calendar-month__grid-cell'),
                                                                dateTime: date,
                                                                displayDate: displayDate as string,
                                                                flags: flagsProperty(flags, CalendarGridDate.TRUSTED_FLAGS),
                                                                props: {
                                                                    ...props,
                                                                    children: property.restricted(),
                                                                    className: '',
                                                                },
                                                            },
                                                            true
                                                        );

                                                        prepare?.(CalendarRenderToken.DATE, renderProps);
                                                        return <CalendarGridDate {...renderProps} />;
                                                    }),
                                                ]}
                                            </tr>
                                        )),
                                    ]}
                                </tbody>
                            </table>
                        </li>
                    );
                }),
            ]}
        </ol>
    );
});
