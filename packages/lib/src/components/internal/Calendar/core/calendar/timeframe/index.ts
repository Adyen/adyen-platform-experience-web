import __AnnualTimeFrame__ from './base/AnnualTimeFrame';
import __TimeFrame__ from './base/TimeFrame';
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
    RANGE_FROM,
    RANGE_TO,
    SELECTION_COLLAPSE,
    SELECTION_FARTHEST,
    SELECTION_FROM,
    SELECTION_NEAREST,
    SELECTION_TO,
    SHIFT_BLOCK,
    SHIFT_FRAME,
    SHIFT_PERIOD,
} from '../constants';
import timeslice, { sinceNow, SLICE_UNBOUNDED, untilNow } from '../timeslice';
import { FirstWeekDay, Time, TimeFlag, TimeFrame, TimeFrameFactory, TimeFrameSize, TimeSlice } from '../types';
import { struct, structFrom } from '../../shared/utils';

export default (() => {
    const ANNUAL_TIME_FRAME: unique symbol = Symbol();
    const timeframe = ((size: TimeFrameSize) => factory(size)) as TimeFrameFactory;
    const annualTimeFrame = ((size: TimeFrameSize) => factory(size, ANNUAL_TIME_FRAME)) as TimeFrameFactory['annual'];

    const factory = (size: TimeFrameSize, annual?: typeof ANNUAL_TIME_FRAME) => {
        const frame = annual === ANNUAL_TIME_FRAME ? new __AnnualTimeFrame__(size) : new __TimeFrame__(size);

        return structFrom(
            new Proxy(struct(), {
                get: (target: {}, property: string | symbol, receiver: {}) => {
                    return typeof property === 'string' ? frame.getFrameBlockAtIndex(+property) : Reflect.get(target, property, receiver);
                },
                set: () => true,
            }),
            {
                cursor: {
                    get: () => frame.cursor,
                    set: frame.shiftFrameCursor.bind(frame),
                },
                firstWeekDay: {
                    get: () => frame.firstWeekDay,
                    set: (day?: FirstWeekDay | null) => {
                        frame.firstWeekDay = day;
                    },
                },
                highlight: {
                    value: Object.defineProperties(frame.updateSelection.bind(frame), {
                        from: {
                            get: () => frame.selectionStart,
                            set: (time?: Time | null) => {
                                frame.selectionStart = time;
                            },
                        },
                        to: {
                            get: () => frame.selectionEnd,
                            set: (time?: Time | null) => {
                                frame.selectionEnd = time;
                            },
                        },
                    }),
                },
                length: { get: () => frame.units },
                lineWidth: { get: () => frame.width },
                shift: { value: frame.shiftFrame.bind(frame) },
                size: {
                    get: () => frame.size,
                    set: (size?: TimeFrameSize | null) => {
                        frame.size = size;
                    },
                },
                timeslice: {
                    get: () => frame.timeslice,
                    set: (timeslice?: TimeSlice | null) => {
                        frame.timeslice = timeslice;
                    },
                },
                watch: { value: frame.watchable.watch },
            }
        ) as TimeFrame;
    };

    return Object.defineProperties(timeframe, {
        annual: { value: annualTimeFrame },
        cursor: {
            value: struct({
                BACKWARD: { value: CURSOR_BACKWARD },
                BLOCK_END: { value: CURSOR_BLOCK_END },
                BLOCK_START: { value: CURSOR_BLOCK_START },
                DOWNWARD: { value: CURSOR_DOWNWARD },
                FORWARD: { value: CURSOR_FORWARD },
                LINE_END: { value: CURSOR_LINE_END },
                LINE_START: { value: CURSOR_LINE_START },
                NEXT_BLOCK: { value: CURSOR_NEXT_BLOCK },
                PREV_BLOCK: { value: CURSOR_PREV_BLOCK },
                UPWARD: { value: CURSOR_UPWARD },
            }),
        },
        flag: {
            value: struct({
                BLOCK_END: { value: TimeFlag.BLOCK_END },
                BLOCK_START: { value: TimeFlag.BLOCK_START },
                CURSOR: { value: TimeFlag.CURSOR },
                LINE_END: { value: TimeFlag.LINE_END },
                LINE_START: { value: TimeFlag.LINE_START },
                RANGE_END: { value: TimeFlag.RANGE_END },
                RANGE_START: { value: TimeFlag.RANGE_START },
                SELECTION_END: { value: TimeFlag.SELECTION_END },
                SELECTION_START: { value: TimeFlag.SELECTION_START },
                TODAY: { value: TimeFlag.TODAY },
                WEEKEND: { value: TimeFlag.WEEKEND },
                WITHIN_BLOCK: { value: TimeFlag.WITHIN_BLOCK },
                WITHIN_RANGE: { value: TimeFlag.WITHIN_RANGE },
                WITHIN_SELECTION: { value: TimeFlag.WITHIN_SELECTION },
            }),
        },
        range: {
            value: Object.defineProperties(timeslice, {
                FROM: { value: RANGE_FROM },
                INFINITE: { value: SLICE_UNBOUNDED },
                SINCE_NOW: { get: sinceNow },
                UNTIL_NOW: { get: untilNow },
                TO: { value: RANGE_TO },
            }),
        },
        selection: {
            value: struct({
                COLLAPSE: { value: SELECTION_COLLAPSE },
                FARTHEST: { value: SELECTION_FARTHEST },
                FROM: { value: SELECTION_FROM },
                NEAREST: { value: SELECTION_NEAREST },
                TO: { value: SELECTION_TO },
            }),
        },
        shift: {
            value: struct({
                BLOCK: { value: SHIFT_BLOCK },
                FRAME: { value: SHIFT_FRAME },
                PERIOD: { value: SHIFT_PERIOD },
            }),
        },
    });
})();
