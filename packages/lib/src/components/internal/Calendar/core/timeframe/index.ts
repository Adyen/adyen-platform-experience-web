import __TimeFrame__ from './base';
import {
    CURSOR_MONTH_END,
    CURSOR_MONTH_START,
    CURSOR_NEXT_DAY,
    CURSOR_NEXT_MONTH,
    CURSOR_NEXT_WEEK,
    CURSOR_PREV_DAY,
    CURSOR_PREV_MONTH,
    CURSOR_PREV_WEEK,
    CURSOR_WEEK_END,
    CURSOR_WEEK_START,
    SHIFT_FRAME,
    SHIFT_MONTH,
    SHIFT_YEAR,
    SIZE_MONTH_1,
    SIZE_MONTH_12,
    SIZE_MONTH_2,
    SIZE_MONTH_3,
    SIZE_MONTH_4,
    SIZE_MONTH_6,
} from './constants';
import { TimeFrame, TimeFrameFactory, TimeFrameSize } from './types';
import { struct, structFrom } from '../shared/utils';

const timeframe = (() => {
    const factory = ((length?: TimeFrameSize) => {
        const base = new __TimeFrame__(length);
        const { firstWeekDay, time, timeslice } = Object.getOwnPropertyDescriptors(base.origin);
        const { from: selectionFrom, to: selectionTo, select } = Object.getOwnPropertyDescriptors(base.selection);

        return structFrom(
            new Proxy(struct(), {
                get: (target: {}, property: string | symbol, receiver: {}) => {
                    return typeof property === 'string' ? base.getFrameMonthByIndex(+property) : Reflect.get(target, property, receiver);
                },
                set: () => true,
            }),
            {
                firstWeekDay,
                timeslice,
                select,
                cursor: {
                    get: () => base.cursorIndex,
                    set: base.shiftFrameCursor,
                },
                days: { get: () => base.numberOfDays },
                length: {
                    get: () => base.numberOfMonths,
                    set: (length?: TimeFrameSize | null) => {
                        base.numberOfMonths = length;
                    },
                },
                origin: {
                    get: () => base.origin.month.timestamp,
                    set: time.set,
                },
                selection: {
                    value: struct({
                        from: selectionFrom,
                        to: selectionTo,
                    }),
                },
                shift: { value: base.shiftFrame },
                watch: { value: base.watchable.watch },
            }
        ) as TimeFrame;
    }) as TimeFrameFactory;

    return Object.defineProperties(factory, {
        CURSOR_MONTH_END: { value: CURSOR_MONTH_END },
        CURSOR_MONTH_START: { value: CURSOR_MONTH_START },
        CURSOR_NEXT_DAY: { value: CURSOR_NEXT_DAY },
        CURSOR_NEXT_MONTH: { value: CURSOR_NEXT_MONTH },
        CURSOR_NEXT_WEEK: { value: CURSOR_NEXT_WEEK },
        CURSOR_PREV_DAY: { value: CURSOR_PREV_DAY },
        CURSOR_PREV_MONTH: { value: CURSOR_PREV_MONTH },
        CURSOR_PREV_WEEK: { value: CURSOR_PREV_WEEK },
        CURSOR_WEEK_END: { value: CURSOR_WEEK_END },
        CURSOR_WEEK_START: { value: CURSOR_WEEK_START },
        MONTH: { value: SIZE_MONTH_1 },
        MONTH_1: { value: SIZE_MONTH_1 },
        MONTH_2: { value: SIZE_MONTH_2 },
        MONTH_3: { value: SIZE_MONTH_3 },
        MONTH_4: { value: SIZE_MONTH_4 },
        MONTH_6: { value: SIZE_MONTH_6 },
        MONTH_12: { value: SIZE_MONTH_12 },
        SHIFT_FRAME: { value: SHIFT_FRAME },
        SHIFT_MONTH: { value: SHIFT_MONTH },
        SHIFT_YEAR: { value: SHIFT_YEAR },
        YEAR: { value: SIZE_MONTH_12 },
    });
})();

export default timeframe;
