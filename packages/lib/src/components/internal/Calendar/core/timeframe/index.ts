import {
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
import { TimeFrame, TimeFrameFactory, TimeFrameMonth, TimeFrameMonthSize, TimeFrameShift, TimeFrameSize } from './types';
import { TimeFlag, WeekDay } from '../shared/types';
import { clamp, getMonthDays, isBitSafeInteger, struct, structFrom } from '../shared/utils';
import { TimeSlice } from '../timeslice/types';
import $timeorigin from '../timeorigin';
import $today from '../today';

const timeframe = (() => {
    const downsizedMonthSize = (size: TimeFrameSize, maxsize: TimeFrameSize) => {};

    const resolveMonthSize = (size: TimeFrameSize) => {
        const index = Math.max(typeof size === 'symbol' ? MONTH_SIZES_SYMBOLS.indexOf(size) : MONTH_SIZES.indexOf(size), 0);

        return [MONTH_SIZES_SYMBOLS[index], MONTH_SIZES[index]] as const;
    };

    const factory = ((size?: TimeFrameSize) => {
        const todayUnwatch = $today.watch(() => {
            todayTimestamp = $today.timestamp;
        });

        let days: number;
        let originMonthTimestamp: number;
        let frameSize: TimeFrameMonthSize = 3;
        let timeorigin = $timeorigin();
        let todayTimestamp = $today.timestamp;

        const months: TimeFrameMonth[] = [];

        const withSize = (size?: TimeFrameSize | null) => {
            // frameSize = FRAME_SIZE_MAP[
            // (~~(size as FrameSize) === size ? Math.max(1, Math.min(timeSlice.span, size || frameSize || 1, 12)) : frameSize || 1) - 1
            //     ] as FrameSize;
        };

        const updateFrameIfNecessary = (): void => {
            if (timeorigin.month.timestamp === originMonthTimestamp) return;

            const originMonth = timeorigin.month;
            const timeslice = timeorigin.timeslice;
            const timeSliceStartTimestamp = timeslice.from + timeslice.offsets.from;
            const timeSliceEndTimestamp = timeslice.to + timeslice.offsets.to;
            const markers = [originMonth.offset] as number[];

            months.length = 0;

            for (let i = 0, j = markers[markers.length - 1] as number; i < frameSize; i++) {
                const monthStartIndex = Math.floor(j / 7) * 7;
                const [monthDays, month, year] = getMonthDays(originMonth.index, originMonth.year, i);

                markers.push((j += monthDays));

                const monthEndIndex = Math.ceil(j / 7) * 7;
                const days = monthEndIndex - monthStartIndex;

                const indexedAccessProxy = new Proxy(struct(), {
                    get: (target: {}, property: string | symbol, receiver: {}) => {
                        if (typeof property === 'string') {
                            const offset = +property;
                            if (isBitSafeInteger(offset) && offset >= 0 && offset < days) {
                                return timeorigin[monthStartIndex + offset] as number;
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

                                    const index = monthStartIndex + offset;
                                    const weekDay = (index % 7) as WeekDay;

                                    let flags = timestamp === todayTimestamp ? TimeFlag.TODAY : 0;

                                    if (index >= (markers[i] as number) && index < j) {
                                        if (index === (markers[i] as number)) flags |= TimeFlag.MONTH_START;
                                        else if (index === j - 1) flags |= TimeFlag.MONTH_END;
                                        flags |= TimeFlag.WITHIN_MONTH;
                                    }

                                    if (weekDay === 0) flags |= TimeFlag.WEEK_START;
                                    else if (weekDay === 6) flags |= TimeFlag.WEEK_END;
                                    if ([5, 6].includes(weekDay)) flags |= TimeFlag.WEEKEND;

                                    if (timestamp >= timeSliceStartTimestamp && timestamp <= timeSliceEndTimestamp) {
                                        if (index === timeSliceStartTimestamp) flags |= TimeFlag.RANGE_START;
                                        if (index === timeSliceEndTimestamp) flags |= TimeFlag.RANGE_END;
                                        flags |= TimeFlag.WITHIN_RANGE;
                                    }

                                    return flags;
                                }
                            }
                            return Reflect.get(target, property, receiver);
                        },
                        set: () => true,
                    })
                );

                months.push(
                    structFrom(indexedAccessProxy, {
                        days: { value: days },
                        flags: { value: flags },
                        month: { value: month },
                        startTimestamp: { value: timeorigin[monthStartIndex] },
                        weeks: { value: days / 7 },
                        year: { value: year },
                    }) as TimeFrameMonth
                );
            }

            days = Math.ceil((markers[frameSize] as number) / 7) * 7;
            originMonthTimestamp = timeorigin.month.timestamp;
        };

        const shiftByOffset = (offset: number) => {
            const clampedOffset = clamp(
                timeorigin.offsets.from,
                offset - (timeorigin.month.index % frameSize),
                timeorigin.offsets.to - frameSize + 1
            );
            if (clampedOffset) {
                timeorigin.shift(clampedOffset);
                updateFrameIfNecessary();
            }
            return timeframe;
        };

        const shiftFrame = (offset?: number, shift?: TimeFrameShift) => {
            if (offset && isBitSafeInteger(offset)) {
                switch (shift) {
                    case SHIFT_MONTH:
                        return shiftByOffset(offset);
                    case SHIFT_YEAR:
                        return shiftByOffset(offset * 12);
                    case SHIFT_FRAME:
                    default:
                        return shiftByOffset(offset * frameSize);
                }
            }
            return timeframe;
        };

        const timeframe = struct({
            days: { get: () => days },
            firstWeekDay: {
                get: () => timeorigin.firstWeekDay,
                set: (day?: WeekDay | null) => {
                    timeorigin.firstWeekDay = day;
                    updateFrameIfNecessary();
                },
            },
            months: { value: months },
            size: {
                get: () => frameSize,
                set: (size?: TimeFrameSize | null) => {
                    withSize(size);
                    updateFrameIfNecessary();
                },
            },
            shift: { value: shiftFrame },
            timeslice: {
                get: () => timeorigin.timeslice,
                set: (timeslice?: TimeSlice | null) => {
                    timeorigin.timeslice = timeslice;
                    withSize(frameSize);
                    updateFrameIfNecessary();
                },
            },
            timestamp: { get: () => timeorigin.month.timestamp },
            weeks: { get: () => days / 7 },
        }) as TimeFrame;

        withSize(size);
        updateFrameIfNecessary();
        return timeframe;
    }) as TimeFrameFactory;

    return Object.defineProperties(factory, {
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
