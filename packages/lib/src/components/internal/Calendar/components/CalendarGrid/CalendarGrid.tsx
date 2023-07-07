import { Attributes, ClassAttributes, ComponentChild, ComponentChildren, ComponentType, JSX, toChildArray } from 'preact';
import { createElement, forwardRef } from 'preact/compat';
import { CalendarGridProps } from './types';
import { CalendarDay, CalendarFlag } from '../../types';
import '../../Calendar.scss';

const CHILD_SLOT = Object.freeze(Object.create(null));

type CalendarRenderProps = (ClassAttributes<any> & (JSX.DOMAttributes<any> | JSX.SVGAttributes<any>)) | (Attributes & Record<string, any>) | null;

type CalendarTokenContext = {
    DATE: {
        className?: string;
        displayDate: string;
        dateTime: string;
        dateTimeClassName?: string;
        dateTimeProps?: CalendarRenderProps;
        flag: number;
        props?: CalendarRenderProps;
    };
    DATE_TIME: {
        className?: string;
        displayDate: string;
        dateTime: string;
        flag: number;
        props?: CalendarRenderProps;
    };
    DAY_OF_WEEK: {
        className?: string;
        flag: number;
    };
    // MONTH_HEADER
};

type CalendarDelegatedRenderResult = {
    children: () => ComponentChildren[];
    props?: (ClassAttributes<any> & (JSX.DOMAttributes<any> | JSX.SVGAttributes<any>)) | (Attributes & Record<string, any>) | null;
    reflag?: number;
    type: keyof JSX.IntrinsicElements | ComponentType | string;
};

type CalendarRenderer<T = ComponentChild> = (
    token: keyof CalendarTokenContext,
    ctx: CalendarTokenContext[typeof token],
    render?: CalendarRenderer<CalendarDelegatedRenderResult>
) => T;

const renderer: CalendarRenderer = (token, ctx, render) => {
    switch (token) {
        case 'DATE': {
            let dateTimeJSX = renderer('DATE_TIME', {
                ...(ctx as CalendarTokenContext['DATE']),
                className: (ctx as CalendarTokenContext['DATE']).dateTimeClassName,
                props: (ctx as CalendarTokenContext['DATE']).dateTimeProps,
            } as CalendarTokenContext['DATE_TIME']);

            const withinMonth = !!(ctx.flag & CalendarFlag.WITHIN_MONTH);
            const dataAttrs = {} as any;

            if (withinMonth) {
                if (ctx.flag & CalendarFlag.TODAY) dataAttrs['data-today'] = true;
                if (ctx.flag & CalendarFlag.WEEK_START) dataAttrs['data-first-week-day'] = true;
                if (ctx.flag & CalendarFlag.WEEK_END) dataAttrs['data-weekend'] = true;
                dataAttrs['data-within-month'] = true;
            }

            if (render === undefined)
                return (
                    <td className={(ctx as CalendarTokenContext['DATE']).className} {...dataAttrs} {...(ctx as CalendarTokenContext['DATE']).props}>
                        {withinMonth && dateTimeJSX}
                    </td>
                );

            const { children, props } = render('DATE', ctx as CalendarTokenContext['DATE']);
            const { children: renderChildren, ...renderProps } = (ctx as CalendarTokenContext['DATE']).props || {};
            const componentChildren = toChildArray(children()).map(child => (child === CHILD_SLOT ? dateTimeJSX : child));

            return createElement('td', { ...(props as JSX.IntrinsicAttributes), ...dataAttrs, ...renderProps }, ...componentChildren);
        }
        case 'DATE_TIME': {
            if (render === undefined)
                return (
                    <time
                        className={(ctx as CalendarTokenContext['DATE_TIME']).className}
                        dateTime={(ctx as CalendarTokenContext['DATE_TIME']).dateTime}
                        {...(ctx as CalendarTokenContext['DATE_TIME']).props}
                    >
                        {(ctx as CalendarTokenContext['DATE_TIME']).displayDate}
                    </time>
                );

            const { children, props } = render('DATE_TIME', ctx as CalendarTokenContext['DATE_TIME']);
            const { children: renderChildren, ...renderProps } = (ctx as CalendarTokenContext['DATE_TIME']).props || {};
            const componentChildren = toChildArray(children()).map(child => (child === CHILD_SLOT ? renderChildren : child));

            return createElement('time', { ...(props as JSX.IntrinsicAttributes), ...renderProps }, ...componentChildren);
        }
        default:
            return null;
    }
};

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

                                                        let flag = date === today ? CalendarFlag.TODAY : 0;

                                                        if (cursorPosition >= 0) {
                                                            const weekday = ((props['data-cursor-position'] = cursorPosition) % 7) as CalendarDay;
                                                            if (weekday === 0) flag |= CalendarFlag.WEEK_START;
                                                            if (calendar.weekendDays.includes(weekday)) flag |= CalendarFlag.WEEK_END;
                                                        }

                                                        if (cursorPosition >= view.start && cursorPosition <= view.end) {
                                                            if (cursorPosition === calendar.cursorPosition) {
                                                                props.ref = cursorElementRef;
                                                            }
                                                            flag |= CalendarFlag.WITHIN_MONTH;
                                                        }

                                                        return renderer('DATE', {
                                                            className: 'adyen-fp-calendar-month__grid-cell',
                                                            dateTimeClassName: 'adyen-fp-calendar__date',
                                                            dateTime: date,
                                                            displayDate,
                                                            flag,
                                                            props,
                                                        } as CalendarTokenContext['DATE']);
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
