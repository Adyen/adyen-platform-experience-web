import __TimeFrame__ from './timeframe/base/TimeFrame';
import {
    CURSOR_BACKWARD,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_LINE_END,
    CURSOR_LINE_START,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
} from './constants';
import { FirstWeekDay, Time, TimeFrame, TimeFrameFactory, TimeFrameSize, TimeSlice } from './types';
import { struct, structFrom } from '../shared/utils';

const timeframe = (() => {
    const factory = ((length?: TimeFrameSize) => {
        const base = new __TimeFrame__(length);
        // const { firstWeekDay, time, timeslice } = Object.getOwnPropertyDescriptors(base.origin);
        // const { from: selectionFrom, to: selectionTo, select } = Object.getOwnPropertyDescriptors(base.selection);

        return structFrom(
            new Proxy(struct(), {
                get: (target: {}, property: string | symbol, receiver: {}) => {
                    // return typeof property === 'string' ? base.getFrameBlockByIndex(+property) : Reflect.get(target, property, receiver);
                    return typeof property === 'string' ? base.getFrameBlockByIndex(+property) : Reflect.get(target, property, receiver);
                },
                set: () => true,
            }),
            {
                // firstWeekDay,
                // timeslice,
                // select,
                index: { value: base.index.bind(base) },
                firstWeekDay: {
                    get: () => base.firstWeekDay,
                    set: (day?: FirstWeekDay | null) => {
                        base.firstWeekDay = day;
                    },
                },
                timeslice: {
                    get: () => base.timeslice,
                    set: (timeslice?: TimeSlice | null) => {
                        base.timeslice = timeslice;
                    },
                },
                select: { value: base.updateSelection.bind(base) },
                cells: { get: () => base.units /* base.numberOfCells */ },
                cursor: {
                    get: () => base.cursor, // base.cursorIndex,
                    set: base.shiftFrameCursor.bind(base),
                },
                length: {
                    get: () => base.size, // base.numberOfBlocks,
                    set: (length?: TimeFrameSize | null) => {
                        // base.numberOfBlocks = length;
                        base.size = length;
                    },
                },
                // origin: {
                //     get: () => base.originTimestamp, // base.origin.month.timestamp,
                //     // set: time.set,
                // },
                selection: {
                    value: struct({
                        // from: selectionFrom,
                        // to: selectionTo,
                        from: {
                            get: () => base.selectionStart,
                            set: (time?: Time | null) => {
                                base.selectionStart = time;
                            },
                        },
                        to: {
                            get: () => base.selectionEnd,
                            set: (time?: Time | null) => {
                                base.selectionEnd = time;
                            },
                        },
                    }),
                },
                shift: { value: base.shiftFrame.bind(base) },
                watch: { value: base.watchable.watch },
                width: { get: () => base.width },
            }
        ) as TimeFrame;
    }) as TimeFrameFactory;

    return Object.defineProperties(factory, {
        CURSOR_BACKWARD: { value: CURSOR_BACKWARD },
        CURSOR_BLOCK_END: { value: CURSOR_BLOCK_END },
        CURSOR_BLOCK_START: { value: CURSOR_BLOCK_START },
        CURSOR_DOWNWARD: { value: CURSOR_DOWNWARD },
        CURSOR_FORWARD: { value: CURSOR_FORWARD },
        CURSOR_LINE_END: { value: CURSOR_LINE_END },
        CURSOR_LINE_START: { value: CURSOR_LINE_START },
        CURSOR_NEXT_BLOCK: { value: CURSOR_NEXT_BLOCK },
        CURSOR_PREV_BLOCK: { value: CURSOR_PREV_BLOCK },
        CURSOR_UPWARD: { value: CURSOR_UPWARD },
        SHIFT_BLOCK: { value: SHIFT_BLOCK },
        SHIFT_FRAME: { value: SHIFT_FRAME },
        SHIFT_PERIOD: { value: SHIFT_PERIOD },
    });
})();

export default timeframe;
