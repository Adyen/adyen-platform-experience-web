import { forwardRef, memo } from 'preact/compat';
import { CalendarGridProps } from './types';
import CalendarGridDate from './CalendarGridDate';
import CalendarGridDayOfWeek from './CalendarGridDayOfWeek';
import '../../Calendar.scss';

const CalendarGrid = forwardRef(({ cursorRootProps, onlyCellsWithin, prepare, grid }: CalendarGridProps, cursorElementRef) => (
    <ol className={'adyen-fp-calendar'} role="none" {...cursorRootProps}>
        {grid.map(block => (
            <li key={block.datetime} className={'adyen-fp-calendar__month'} role="none">
                <div className={'adyen-fp-calendar__month-name'} role="none">
                    <time dateTime={block.datetime} aria-hidden="true">
                        {block.label}
                    </time>
                </div>

                <table
                    role="grid"
                    aria-multiselectable={true}
                    aria-label={`${block.label} calendar`}
                    className={'adyen-fp-calendar__grid'}
                    style={{ '--adyen-fp-calendar-rowspan': grid.rowspan }}
                >
                    <thead>
                        <tr className={'adyen-fp-calendar__row'}>
                            {grid.weekdays.map((data, index) => (
                                <CalendarGridDayOfWeek key={data.labels['long']} grid={grid} block={block} prepare={prepare} cell={index} {...data} />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {block.map((row, rowindex) => (
                            <tr key={`${block.month}:${rowindex}`} className={'adyen-fp-calendar__row'}>
                                {row.map((data, index) => (
                                    <CalendarGridDate
                                        key={`${block.month}:${data.timestamp}`}
                                        ref={cursorElementRef}
                                        grid={grid}
                                        block={block}
                                        prepare={prepare}
                                        cell={index}
                                        onlyCellsWithin={onlyCellsWithin}
                                        row={rowindex}
                                        {...data}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </li>
        ))}
    </ol>
));

export default memo(CalendarGrid);
