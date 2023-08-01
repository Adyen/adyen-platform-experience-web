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
    MONTH_SIZES,
    MONTH_SIZES_SYMBOLS,
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
import {
    TimeFrame,
    TimeFrameAtoms,
    TimeFrameCursorAtoms,
    TimeFrameFactory,
    TimeFrameMonth,
    TimeFrameMonthSize,
    TimeFrameShift,
    TimeFrameSize,
} from './types';
import today from '../shared/today';
import timecursor from '../timecursor';
import timeorigin from '../timeorigin';
import timeSelection from '../timeselection';
import $watchable from '../shared/watchable';
import { WatchAtoms, WatchCallable } from '../shared/watchable/types';
import { Month, TimeFlag, WeekDay } from '../shared/types';
import { clamp, getMonthDays, isBitSafeInteger, struct, structFrom } from '../shared/utils';

const timeframe = (() => {
    const downsizedMonthSize = (size: TimeFrameSize, maxsize: TimeFrameSize) => {};

    const resolveMonthSize = (size: TimeFrameSize) => {
        const index = Math.max(typeof size === 'symbol' ? MONTH_SIZES_SYMBOLS.indexOf(size) : MONTH_SIZES.indexOf(size), 0);
        return [MONTH_SIZES_SYMBOLS[index], MONTH_SIZES[index]] as const;
    };

    const factory = ((length?: TimeFrameSize) => {
        const cachedMonths: TimeFrameMonth[] = [];
        const months: [Month, number, number, number, number][] = [];
        const origin = timeorigin();
        const selection = timeSelection(origin);

        const frameAtoms = {
            days: () => days,
            length: () => frameSize,
            originTimestamp: () => originMonthTimestamp,
            todayTimestamp: () => today.timestamp,
        } as WatchAtoms<TimeFrameAtoms>;

        const watchable = $watchable(frameAtoms);

        const cursorWatchable = $watchable({
            index: () => Math.floor((origin.time - origin.month.timestamp) / 86400000),
        } as WatchAtoms<TimeFrameCursorAtoms>);

        let days: number;
        let frameSize: TimeFrameMonthSize = 3;
        let originMonthTimestamp: number;

        const shiftFrameByOffset = (offset: number) => {
            const clampedOffset = clamp(origin.offsets.from, offset, origin.offsets.to - frameSize + 1);
            if (clampedOffset) {
                origin.shift(clampedOffset);
                refreshFrame();
            }
        };

        const shiftFrame = (offset?: number, shift?: TimeFrameShift) => {
            if (offset && isBitSafeInteger(offset)) {
                switch (shift) {
                    case SHIFT_MONTH:
                        return shiftFrameByOffset(offset);
                    case SHIFT_YEAR:
                        return shiftFrameByOffset(offset * 12);
                    case SHIFT_FRAME:
                    default:
                        return shiftFrameByOffset(offset * frameSize);
                }
            }
        };

        const withSize = (length?: TimeFrameSize | null) => {
            // frameSize = FRAME_SIZE_MAP[
            // (~~(size as FrameSize) === size ? Math.max(1, Math.min(timeSlice.span, size || frameSize || 1, 12)) : frameSize || 1) - 1
            //     ] as FrameSize;
        };

        const refreshFrame = (forceRefresh = false) => {
            if (originMonthTimestamp === origin.month.timestamp && !forceRefresh) return;

            cachedMonths.length = months.length = 0;
            originMonthTimestamp = origin.month.timestamp;

            for (let i = 0, j = origin.month.offset as number; ; ) {
                const [monthDays, month, year] = getMonthDays(origin.month.index, origin.month.year, i);
                const startIndex = j;
                const originIndex = Math.floor(j / 7) * 7;
                const nextStartIndex = Math.ceil((j += monthDays) / 7) * 7;
                const numberOfDays = nextStartIndex - originIndex;

                months.push([month, year, numberOfDays, originIndex, startIndex]);

                if (++i === frameSize) {
                    days = nextStartIndex;
                    cursorWatchable.notify();
                    watchable.notify();
                    break;
                }
            }
        };

        withSize(length);
        origin.shift(0 - (origin.month.index % frameSize)); // normalize initial in-frame position
        refreshFrame();

        const indexedMonthAccess = new Proxy(struct(), {
            get: (target: {}, property: string | symbol, receiver: {}) => {
                if (typeof property === 'string') {
                    const offset = +property;
                    if (isBitSafeInteger(offset) && offset >= 0 && offset < frameSize) {
                        return (cachedMonths[offset] =
                            cachedMonths[offset] ||
                            (() => {
                                const [month, year, numberOfDays, originIndex, startIndex] = months[offset] as (typeof months)[number];

                                const indexedAccessProxy = new Proxy(struct(), {
                                    get: (target: {}, property: string | symbol, receiver: {}) => {
                                        if (typeof property === 'string') {
                                            const offset = +property;
                                            if (isBitSafeInteger(offset) && offset >= 0 && offset < numberOfDays) {
                                                return origin[originIndex + offset] as number;
                                            }
                                        }
                                        return Reflect.get(target, property, receiver);
                                    },
                                    set: () => true,
                                }) as TimeFrameMonth['flags'];

                                const flags = structFrom(
                                    new Proxy(struct(), {
                                        get: (target: {}, property: string | symbol, receiver: {}) => {
                                            if (typeof property === 'string') {
                                                const offset = +property;
                                                if (isBitSafeInteger(offset)) {
                                                    const timestamp = indexedAccessProxy[offset];
                                                    if (timestamp === undefined) return 0;

                                                    const index = originIndex + offset;
                                                    const weekDay = (index % 7) as WeekDay;

                                                    let flags = timestamp === today.timestamp ? TimeFlag.TODAY : 0;

                                                    if (weekDay === 0) flags |= TimeFlag.WEEK_START;
                                                    else if (weekDay === 6) flags |= TimeFlag.WEEK_END;
                                                    if ([5, 6].includes(weekDay)) flags |= TimeFlag.WEEKEND; // [TODO]: Derive weekend days (e.g from locale)

                                                    if (index === frame.cursor) flags |= TimeFlag.CURSOR;

                                                    if (index >= startIndex && offset < numberOfDays) {
                                                        if (index === startIndex) flags |= TimeFlag.MONTH_START;
                                                        else if (offset === numberOfDays - 1) flags |= TimeFlag.MONTH_END;
                                                        flags |= TimeFlag.WITHIN_MONTH;
                                                    }

                                                    const timeslice = origin.timeslice;
                                                    const timeSliceStartTimestamp = timeslice.from - timeslice.offsets.from;
                                                    const timeSliceEndTimestamp = timeslice.to - timeslice.offsets.to;

                                                    if (timestamp >= timeSliceStartTimestamp && timestamp <= timeSliceEndTimestamp) {
                                                        if (timestamp === timeSliceStartTimestamp) flags |= TimeFlag.RANGE_START;
                                                        if (timestamp === timeSliceEndTimestamp) flags |= TimeFlag.RANGE_END;
                                                        flags |= TimeFlag.WITHIN_RANGE;
                                                    }

                                                    const selectionStartTimestamp = selection.from - selection.offsets.from;
                                                    const selectionEndTimestamp = selection.to - selection.offsets.to;

                                                    if (timestamp >= selectionStartTimestamp && timestamp <= selectionEndTimestamp) {
                                                        if (timestamp === selectionStartTimestamp) flags |= TimeFlag.SELECTION_START;
                                                        if (timestamp === selectionEndTimestamp) flags |= TimeFlag.SELECTION_END;
                                                        flags |= TimeFlag.WITHIN_SELECTION;
                                                    }

                                                    return flags;
                                                }
                                            }
                                            return Reflect.get(target, property, receiver);
                                        },
                                        set: () => true,
                                    })
                                );

                                months[offset] = undefined as unknown as (typeof months)[number];

                                return structFrom(indexedAccessProxy, {
                                    flags: { value: flags },
                                    index: { value: startIndex },
                                    length: { value: numberOfDays },
                                    month: { value: month },
                                    year: { value: year },
                                }) as TimeFrameMonth;
                            })());
                    }
                }
                return Reflect.get(target, property, receiver);
            },
            set: () => true,
        });

        const frame = timecursor(
            structFrom(indexedMonthAccess, {
                days: { get: frameAtoms.days },
                length: {
                    get: frameAtoms.length,
                    set: (length?: TimeFrameSize | null) => {
                        withSize(length);
                        refreshFrame();
                    },
                },
                shift: { value: shiftFrame },
            }) as TimeFrame,
            cursorWatchable.watch
        );

        let unwatchOrigin = origin.watch(() => refreshFrame());
        let unwatchSelection = selection.watch(() => refreshFrame(true)) as WatchCallable<undefined>;
        let unwatchToday = today.watch(() => refreshFrame(true)) as WatchCallable<undefined>;

        const { firstWeekDay, time, timeslice } = Object.getOwnPropertyDescriptors(origin);
        const { from: selectionFrom, to: selectionTo, select } = Object.getOwnPropertyDescriptors(selection);

        return Object.defineProperties(frame, {
            firstWeekDay,
            timeslice,
            select,
            origin: {
                get: () => origin.month.timestamp,
                set: time.set,
            },
            selection: {
                value: struct({
                    from: selectionFrom,
                    to: selectionTo,
                }),
            },
            watch: { value: watchable.watch },
        });
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
