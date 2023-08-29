import calendar from '@src/components/internal/Calendar/calendar';

document.body.addEventListener('keydown', evt => {
    grid.cursor(evt) && evt.preventDefault();
});

const { grid } = calendar(() => {
    // console.clear();
    //
    // for (let i = 0; i < grid.length; i++) {
    //     const frameBlock = grid[i] as typeof grid[number];
    //
    //     console.log(`%c${frameBlock.label}`, 'color:pink;font-weight:bold;', "\n");
    //     console.log(`%c${Array.from(grid.daysOfWeek, ({ labels }) => labels.short).join(' ')}`, 'color:khaki;');
    //
    //     for (let i = 0; i < frameBlock.length; i++) {
    //         const row = frameBlock[i] as typeof frameBlock[number];
    //
    //         console.log(...Array.from({ length: row?.length ?? 0 }, (_, index) => {
    //             const { flags, label } = row?.[index] as typeof row[number];
    //             return `0${
    //                 !(flags.WITHIN_BLOCK)
    //                     ? '--'
    //                     : (flags.CURSOR)
    //                         ? '//'
    //                         : (flags.WITHIN_SELECTION)
    //                             ? '=='
    //                             : label
    //             } `.slice(-3);
    //         }));
    //     }
    //
    //     console.log("\n");
    // }
});

grid.config({
    // blocks: 2,
    // blocks: 3,
    // blocks: 4,
    // blocks: 6,
    // blocks: 12,
    firstWeekDay: 1,
    // timeslice: calendar.range.SINCE_NOW,
    // timeslice: calendar.range.UNTIL_NOW,
    timeslice: calendar.range('2022-12-10', '2023-10-10'),
});

// grid.highlight.from = new Date().setDate(-10);
