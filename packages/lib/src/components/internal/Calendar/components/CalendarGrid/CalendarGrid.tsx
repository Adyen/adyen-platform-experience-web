import { forwardRef } from 'preact/compat';
import { CalendarGridProps } from './types';
import { CalendarDay } from '../../types';
import '../../Calendar.scss';

export default forwardRef(function CalendarGrid({ calendar, cursorRootProps, today }: CalendarGridProps, cursorElementRef) {
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
                                        ...view.weeks.map((week, index) => (
                                            <tr key={`${month}:${index}`} className={'adyen-fp-calendar-month__grid-row'}>
                                                {[
                                                    ...week.map((cursorPosition, index) => {
                                                        if (cursorPosition < 0) {
                                                            const date = calendar[view.origin + index] as string[];
                                                            return (
                                                                <td
                                                                    key={`${date[0]}:0`}
                                                                    className={'adyen-fp-calendar-month__grid-cell'}
                                                                    tabIndex={-1}
                                                                ></td>
                                                            );
                                                        }

                                                        const date = calendar[cursorPosition] as string[];
                                                        const weekday = (cursorPosition % 7) as CalendarDay;
                                                        const cellProps = { 'data-cursor-position': cursorPosition } as any;

                                                        if (cursorPosition >= view.start && cursorPosition <= view.end) {
                                                            if (cursorPosition === calendar.cursorPosition) {
                                                                cellProps.ref = cursorElementRef;
                                                            }
                                                            cellProps['data-within-month'] = true;
                                                        }

                                                        if (date[0] === today) cellProps['data-today'] = true;
                                                        if (weekday === 0) cellProps['data-first-week-day'] = true;
                                                        if (calendar.weekendDays.includes(weekday)) cellProps['data-weekend'] = true;

                                                        return (
                                                            <td
                                                                key={date[0]}
                                                                className={'adyen-fp-calendar-month__grid-cell'}
                                                                tabIndex={-1}
                                                                {...cellProps}
                                                            >
                                                                <time className={'adyen-fp-calendar__date'} dateTime={date[0]}>
                                                                    {date[1]}
                                                                </time>
                                                            </td>
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
