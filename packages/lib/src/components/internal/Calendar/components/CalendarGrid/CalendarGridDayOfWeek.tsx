import { memo } from 'preact/compat';
import { property, propsProperty } from './utils';
import { getClassName, memoComparator } from '../../../../../primitives/utils/preact';
import { CalendarGridDayOfWeekProps, CalendarGridDayOfWeekRenderProps } from './types';
import { EMPTY_OBJECT } from '../../../../../primitives/utils';
import { CalendarGridRenderToken } from '../../types';

const DEFAULT_CELL_CLASSNAME = 'adyen-pe-calendar__cell adyen-pe-calendar__cell--day-of-week';
const DEFAULT_CELL_ABBR_CLASSNAME = 'adyen-pe-calendar__day-of-week';

const getGridDayOfWeekRenderProps = (computedProps = EMPTY_OBJECT as any, prepare?: CalendarGridDayOfWeekProps['prepare']) => {
    const renderProps = propsProperty.unwrapped<CalendarGridDayOfWeekRenderProps>(
        {
            childClassName: property.mutable(DEFAULT_CELL_ABBR_CLASSNAME),
            childProps: {
                children: property.restricted(),
                className: '',
            },
            className: property.mutable(DEFAULT_CELL_CLASSNAME),
            props: {
                ...computedProps,
                children: property.restricted(),
                className: '',
            },
        },
        true
    );

    prepare?.(CalendarGridRenderToken.DAY_OF_WEEK, renderProps);
    return renderProps;
};

const CalendarGridDayOfWeek = ({ prepare, flags, labels: { long: longLabel, short: shortLabel } }: CalendarGridDayOfWeekProps) => {
    const props = {
        'aria-label': longLabel,
        'data-first-week-day': flags.LINE_START,
        'data-last-week-day': flags.LINE_END,
        'data-weekend': flags.WEEKEND,
        scope: 'col',
    };

    const renderProps = getGridDayOfWeekRenderProps(props, prepare);
    const { children: _, className, ...extendedProps } = renderProps.props || EMPTY_OBJECT;
    const classes = getClassName(renderProps.className, DEFAULT_CELL_CLASSNAME, className);

    const { children: __, className: childClassName, ...extendedChildProps } = renderProps.childProps || EMPTY_OBJECT;
    const childClasses = getClassName(renderProps.childClassName, DEFAULT_CELL_ABBR_CLASSNAME, childClassName);

    return (
        <th {...extendedProps} {...props} className={classes}>
            <abbr {...extendedChildProps} className={childClasses}>
                {shortLabel}
            </abbr>
        </th>
    );
};

export default memo(
    CalendarGridDayOfWeek,
    memoComparator({
        block: memoComparator.exclude,
        flags: value => +(value as number),
    })
);
