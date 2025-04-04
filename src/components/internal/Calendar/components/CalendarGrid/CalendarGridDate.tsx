import { memo } from 'preact/compat';
import { property, propsProperty } from './utils';
import { CalendarGridDateProps, CalendarGridDateRenderProps } from './types';
import { fixedForwardRef, getClassName, memoComparator } from '../../../../../utils/preact';
import { EMPTY_OBJECT } from '../../../../../utils';
import { CalendarGridRenderToken } from '../../types';

const DEFAULT_DATE_CELL_CLASSNAME = 'adyen-pe-calendar__cell adyen-pe-calendar__cell--date';
const DEFAULT_DATE_TIME_CLASSNAME = 'adyen-pe-calendar__date';

const getGridDateRenderProps = (computedProps = EMPTY_OBJECT as any, prepare?: CalendarGridDateProps['prepare']) => {
    const renderProps = propsProperty.unwrapped<CalendarGridDateRenderProps>(
        {
            childClassName: property.mutable(DEFAULT_DATE_TIME_CLASSNAME),
            childProps: {
                children: property.restricted(),
                className: '',
            },
            className: property.mutable(DEFAULT_DATE_CELL_CLASSNAME),
            props: {
                ...computedProps,
                children: property.restricted(),
                className: '',
            },
        },
        true
    );

    prepare?.(CalendarGridRenderToken.DATE, renderProps);
    return renderProps;
};

const CalendarGridDate = fixedForwardRef(
    ({ grid, prepare, datetime, flags, index, label, onlyCellsWithin }: CalendarGridDateProps, cursorElementRef) => {
        const withinMonth = flags.WITHIN_BLOCK;

        const props = {
            'data-cursor-position': index,
            'data-within-month': withinMonth,
            tabIndex: -1,
        } as any;

        if (withinMonth) {
            const withinRange = flags.WITHIN_RANGE;

            props['data-today'] = flags.CURRENT;
            props['data-first-week-day'] = flags.LINE_START;
            props['data-last-week-day'] = flags.LINE_END;
            props['data-weekend'] = flags.WEEKEND;
            props['data-first-month-day'] = flags.BLOCK_START;
            props['data-last-month-day'] = flags.BLOCK_END;

            props['data-within-range'] = withinRange;

            if (withinRange) {
                props['data-range-end'] = flags.RANGE_END;
                props['data-range-start'] = flags.RANGE_START;
                props['data-selection-end'] = flags.SELECTION_END;
                props['data-selection-start'] = flags.SELECTION_START;
                props['data-within-selection'] = flags.WITHIN_SELECTION;
                props['aria-selected'] = `${!!(flags.SELECTION_END || flags.SELECTION_START || flags.WITHIN_SELECTION)}`;
            }

            if (index === +grid.cursor) props.ref = cursorElementRef;
        }

        const renderProps = getGridDateRenderProps(props, prepare);
        const { children: _, className, ...extendedProps } = renderProps.props || (EMPTY_OBJECT as NonNullable<typeof renderProps.props>);
        const classes = getClassName(renderProps.className, DEFAULT_DATE_CELL_CLASSNAME, className);

        return (
            <td {...extendedProps} {...props} className={classes}>
                {(!onlyCellsWithin || withinMonth) &&
                    (() => {
                        const {
                            children: _,
                            className,
                            ...extendedProps
                        } = renderProps.childProps || (EMPTY_OBJECT as NonNullable<typeof renderProps.childProps>);
                        const classes = getClassName(renderProps.childClassName, DEFAULT_DATE_TIME_CLASSNAME, className);
                        return (
                            <time {...extendedProps} className={classes} dateTime={datetime}>
                                {label}
                            </time>
                        );
                    })()}
            </td>
        );
    }
);

export default memo(
    CalendarGridDate,
    memoComparator({
        block: memoComparator.exclude,
        flags: value => +(value as number),
    })
);
