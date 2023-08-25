import { forwardRef } from 'preact/compat';
import { CalendarGridDateProps, CalendarGridDayOfWeekProps, CalendarGridProps } from './types';
import { CalendarRenderToken } from '../../types';
import { property, propsProperty } from '@src/components/internal/Calendar/components/CalendarGrid/utils';
import CalendarGridDate from '@src/components/internal/Calendar/components/CalendarGrid/CalendarGridDate';
import CalendarGridDayOfWeek from '@src/components/internal/Calendar/components/CalendarGrid/CalendarGridDayOfWeek';
import '../../Calendar.scss';

export default forwardRef(function CalendarGrid({ cursorRootProps, prepare, grid }: CalendarGridProps, cursorElementRef) {
    return (
        <ol className={'adyen-fp-calendar'} role="none" {...cursorRootProps}>
            {[
                ...grid.map(block => {
                    return (
                        <li key={block.datetime} className={'adyen-fp-calendar-month'} role="none">
                            <div className={'adyen-fp-calendar-month__name'} role="none">
                                <time dateTime={block.datetime} aria-hidden="true">
                                    {block.label}
                                </time>
                            </div>

                            <table
                                className={'adyen-fp-calendar-month__grid'}
                                role="grid"
                                aria-label={block.label}
                                style={{ '--_adyen-fp-calendar-rowspan': block[0]?.length }}
                            >
                                <thead>
                                    <tr className={'adyen-fp-calendar-month__grid-row'}>
                                        {[
                                            ...grid.daysOfWeek.map(({ flags, labels }) => {
                                                const props = { 'aria-label': labels.long, key: labels.long, scope: 'col' };

                                                const renderProps = propsProperty.unwrapped<CalendarGridDayOfWeekProps>(
                                                    {
                                                        childClassName: property.mutable('adyen-fp-calendar__day-of-week'),
                                                        childProps: {
                                                            children: property.restricted(),
                                                            className: '',
                                                        },
                                                        children: property.mutable<any>(CalendarGridDayOfWeek.CHILD),
                                                        className: property.mutable('adyen-fp-calendar-month__grid-cell'),
                                                        flags,
                                                        label: labels.narrow,
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
                                        ...block.map((row, rowindex) => (
                                            <tr key={`${block.month}:${rowindex}`} className={'adyen-fp-calendar-month__grid-row'}>
                                                {[
                                                    ...row.map(({ datetime, flags, index, label, timestamp }) => {
                                                        const props = {
                                                            'data-cursor-position': index,
                                                            key: `${block.month}:${timestamp}`,
                                                            tabIndex: -1,
                                                        } as any;

                                                        if (index === +grid.cursor && flags.WITHIN_BLOCK) {
                                                            props.ref = cursorElementRef;
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
                                                                dateTime: datetime,
                                                                displayDate: label,
                                                                flags,
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
