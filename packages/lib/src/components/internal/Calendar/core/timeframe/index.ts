import __TimeFrame__ from './base/month';
import {
    CURSOR_BACKWARD,
    CURSOR_BACKWARD_EDGE,
    CURSOR_BLOCK_END,
    CURSOR_BLOCK_START,
    CURSOR_DOWNWARD,
    CURSOR_FORWARD,
    CURSOR_FORWARD_EDGE,
    CURSOR_NEXT_BLOCK,
    CURSOR_PREV_BLOCK,
    CURSOR_UPWARD,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
    SIZE_1,
    SIZE_12,
    SIZE_2,
    SIZE_3,
    SIZE_4,
    SIZE_6,
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
                    return typeof property === 'string' ? base.getFrameBlockByIndex(+property) : Reflect.get(target, property, receiver);
                },
                set: () => true,
            }),
            {
                firstWeekDay,
                timeslice,
                select,
                cells: { get: () => base.numberOfCells },
                cursor: {
                    get: () => base.cursorIndex,
                    set: base.shiftFrameCursor,
                },
                length: {
                    get: () => base.numberOfBlocks,
                    set: (length?: TimeFrameSize | null) => {
                        base.numberOfBlocks = length;
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
        CURSOR_BACKWARD: { value: CURSOR_BACKWARD },
        CURSOR_BACKWARD_EDGE: { value: CURSOR_BACKWARD_EDGE },
        CURSOR_BLOCK_END: { value: CURSOR_BLOCK_END },
        CURSOR_BLOCK_START: { value: CURSOR_BLOCK_START },
        CURSOR_DOWNWARD: { value: CURSOR_DOWNWARD },
        CURSOR_FORWARD: { value: CURSOR_FORWARD },
        CURSOR_FORWARD_EDGE: { value: CURSOR_FORWARD_EDGE },
        CURSOR_NEXT_BLOCK: { value: CURSOR_NEXT_BLOCK },
        CURSOR_PREV_BLOCK: { value: CURSOR_PREV_BLOCK },
        CURSOR_UPWARD: { value: CURSOR_UPWARD },
        SHIFT_BLOCK: { value: SHIFT_BLOCK },
        SHIFT_FRAME: { value: SHIFT_FRAME },
        SHIFT_PERIOD: { value: SHIFT_PERIOD },
        SIZE_1: { value: SIZE_1 },
        SIZE_2: { value: SIZE_2 },
        SIZE_3: { value: SIZE_3 },
        SIZE_4: { value: SIZE_4 },
        SIZE_6: { value: SIZE_6 },
        SIZE_12: { value: SIZE_12 },
    });
})();

export default timeframe;
