import { forwardRef } from 'preact/compat';
import { CalendarGridProps } from './types';
import CalendarGridDate from './CalendarGridDate';
import CalendarGridDayOfWeek from './CalendarGridDayOfWeek';
import '../../Calendar.scss';

export default forwardRef(function CalendarGrid({ cursorRootProps, onlyCellsWithin, prepare, grid }: CalendarGridProps, cursorElementRef) {
    return (
        <ol className={'adyen-fp-calendar'} role="none" {...cursorRootProps}>
            {grid.map(block => {
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
                            style={{ '--_adyen-fp-calendar-rowspan': grid.rowspan }}
                        >
                            <thead>
                                <tr className={'adyen-fp-calendar-month__grid-row'}>
                                    {grid.weekdays.map((data, index) => (
                                        <CalendarGridDayOfWeek grid={grid} block={block} prepare={prepare} cell={index} {...data} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {block.map((row, rowindex) => (
                                    <tr key={`${block.month}:${rowindex}`} className={'adyen-fp-calendar-month__grid-row'}>
                                        {row.map((data, index) => (
                                            <CalendarGridDate
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
                );
            })}
        </ol>
    );
});
