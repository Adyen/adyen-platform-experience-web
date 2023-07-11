import { forwardRef } from 'preact/compat';
import { CalendarGridProps } from './types';
import { CalendarDay, CalendarFlag, CalendarRenderToken, CalendarRenderTokenContext } from '../../types';
import renderer from '@src/components/internal/Calendar/components/CalendarGrid/renderer';
import '../../Calendar.scss';

export default forwardRef(function CalendarGrid({ calendar, cursorRootProps, render, today }: CalendarGridProps, cursorElementRef) {
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
                                            ...calendar.daysOfWeek.map(([long, , short]) => (
                                                <th key={long} className={'adyen-fp-calendar-month__grid-cell'} scope="col" aria-label={long}>
                                                    <abbr className={'adyen-fp-calendar-month__day-of-week'} title={long}>
                                                        {short}
                                                    </abbr>
                                                </th>
                                            )),
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

                                                        if (cursorPosition >= 0) {
                                                            const weekday = ((props['data-cursor-position'] = cursorPosition) % 7) as CalendarDay;

                                                            if (weekday === 0) flags |= CalendarFlag.WEEK_START;
                                                            if (weekday === 6) flags |= CalendarFlag.WEEK_END;
                                                            if (calendar.weekendDays.includes(weekday)) flags |= CalendarFlag.WEEKEND;

                                                            if (cursorPosition === view.start) flags |= CalendarFlag.MONTH_START;
                                                            if (cursorPosition === view.end) flags |= CalendarFlag.MONTH_END;
                                                        }

                                                        if (cursorPosition >= view.start && cursorPosition <= view.end) {
                                                            if (cursorPosition === calendar.cursorPosition) {
                                                                props.ref = cursorElementRef;
                                                            }
                                                            flags |= CalendarFlag.WITHIN_MONTH;
                                                        }

                                                        return renderer(
                                                            CalendarRenderToken.DATE,
                                                            {
                                                                // [TODO]: Persistent classnames for date and date-time
                                                                className: 'adyen-fp-calendar-month__grid-cell',
                                                                dateTimeClassName: 'adyen-fp-calendar__date',
                                                                dateTime: date,
                                                                displayDate,
                                                                flags,
                                                                props,
                                                            } as CalendarRenderTokenContext[CalendarRenderToken.DATE],
                                                            render
                                                        );
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
