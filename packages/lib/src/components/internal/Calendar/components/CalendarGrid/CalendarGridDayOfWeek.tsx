import { getClassName } from '@src/utils/class-name-utils';
import { memo } from 'preact/compat';
import { CalendarGridDayOfWeekProps, CalendarGridDayOfWeekRenderProps } from './types';
import { property, propsProperty } from './utils';
import { EMPTY_OBJECT } from '@src/utils/common/constants';
import { CalendarGridRenderToken } from '../../types';
import memoComparator from '@src/utils/memoComparator';

const DEFAULT_CELL_CLASSNAME = 'adyen-fp-calendar-month__grid-cell';
const DEFAULT_CELL_ABBR_CLASSNAME = 'adyen-fp-calendar__day-of-week';

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

const CalendarGridDayOfWeek = ({ prepare, flags, labels: { long: longLabel, narrow: narrowLabel } }: CalendarGridDayOfWeekProps) => {
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
                {narrowLabel}
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
