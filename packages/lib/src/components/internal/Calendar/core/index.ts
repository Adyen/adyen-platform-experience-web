import { getMonthDays, struct, structFrom } from './shared/utils';
import { Month, WeekDay, WithTimeEdges } from './shared/types';
import { TimeOrigin } from './timeorigin/types';
import $timeorigin from './timeorigin';
import $timeslice from './timeslice';
import $today from './today';

const enum FrameSize {
    SIZE_1 = 1,
    SIZE_2 = 2,
    SIZE_3 = 3,
    SIZE_4 = 4,
    SIZE_6 = 6,
    SIZE_12 = 12,
}

const enum TimeFlag {
    WEEK_START = 0x1,
    WEEK_END = 0x2,
    WEEKEND = 0x4,
    TODAY = 0x8,
    MONTH_START = 0x10,
    MONTH_END = 0x20,
    WITHIN_MONTH = 0x40,
    RANGE_START = 0x100,
    RANGE_END = 0x200,
    WITHIN_RANGE = 0x400,
    SELECTION_START = 0x1000,
    SELECTION_END = 0x2000,
    WITHIN_SELECTION = 0x4000,
    FAUX_SELECTION_START = 0x10000,
    FAUX_SELECTION_END = 0x20000,
    WITHIN_FAUX_SELECTION = 0x40000,
}

type TimeFrame = {
    readonly days: number;
    readonly months: TimeFrameMonth[];
    get size(): FrameSize;
    set size(size: FrameSize | null | undefined);
    get timeslice(): TimeSlice;
    set timeslice(time: TimeSlice | null | undefined);
    readonly weeks: number;
};

type TimeFrameFactory = FrameSize & {
    (size?: FrameSize): TimeFrame;
    readonly SIZE_1: FrameSize;
    readonly SIZE_2: FrameSize;
    readonly SIZE_3: FrameSize;
    readonly SIZE_4: FrameSize;
    readonly SIZE_6: FrameSize;
    readonly SIZE_12: FrameSize;
};

type TimeFrameMonth = {
    readonly [K: number]: number | undefined;
    readonly days: number;
    readonly flags: { readonly [K: number]: number | undefined };
    readonly month: Month;
    readonly startTimestamp: number;
    readonly weeks: number;
    readonly year: number;
};

type TimeSlice = WithTimeEdges<number> & {
    readonly offsets: WithTimeEdges<number>;
    readonly origin: TimeOrigin;
    readonly span: number;
};

export const timeslice = (...args: any[]) => {
    const timeSlice = $timeslice(...args);
    const originMark = $timeorigin(timeSlice);

    return struct({
        from: { get: () => timeSlice.from },
        to: { get: () => timeSlice.to },
        offsets: {
            value: struct({
                from: { get: () => originMark.offsets.from },
                to: { get: () => originMark.offsets.to },
            }),
        },
        origin: { get: () => originMark },
        span: { get: () => timeSlice.span },
    }) as TimeSlice;
};

export const timeframe = (() => {
    const FRAME_SIZE_MAP: Readonly<FrameSize[]> = [
        FrameSize.SIZE_1,
        FrameSize.SIZE_2,
        FrameSize.SIZE_3,
        FrameSize.SIZE_4,
        FrameSize.SIZE_4,
        FrameSize.SIZE_6,
        FrameSize.SIZE_6,
        FrameSize.SIZE_6,
        FrameSize.SIZE_6,
        FrameSize.SIZE_6,
        FrameSize.SIZE_6,
        FrameSize.SIZE_12,
    ] as const;

    const timeframe = ((size?: FrameSize) => {
        let currentOriginTimestamp: number;
        let days: number;
        let frameSize: FrameSize;
        let timeSlice = timeslice();
        let timeSliceStartTimestamp = Math.abs(timeSlice.from) < Infinity ? new Date(timeSlice.from).setHours(0, 0, 0, 0) : timeSlice.from;
        let timeSliceEndTimestamp = Math.abs(timeSlice.to) < Infinity ? new Date(timeSlice.to).setHours(0, 0, 0, 0) : timeSlice.to;

        const markers: number[] = [];
        const months: TimeFrameMonth[] = [];

        let unwatchToday = $today.watch(() => {
            todayTimestamp = $today.timestamp;
            // observe if current view of the frame needs to know about the change
        });

        let todayTimestamp = $today.timestamp;

        const withSize = (size?: FrameSize | null) => {
            frameSize = FRAME_SIZE_MAP[
                (~~(size as FrameSize) === size ? Math.max(1, Math.min(timeSlice.span, size || frameSize || 1, 12)) : frameSize || 1) - 1
            ] as FrameSize;
        };

        const updateMarkersIfNecessary = () => {
            if (currentOriginTimestamp === timeSlice.origin.month.timestamp) return;

            const { from: fromOffset, to: toOffset } = timeSlice.offsets;
            const originMonth = timeSlice.origin.month;

            timeSlice.origin.shift(Math.max(fromOffset, Math.min(0 - (originMonth.index % frameSize), toOffset - frameSize + 1)));

            markers.length = months.length = 0;
            markers.push(originMonth.offset);

            for (let i = 1, j = markers[0] as number; i <= frameSize; i++) {
                const monthStartIndex = Math.floor(j / 7) * 7;
                const [monthDays, month, year] = getMonthDays(originMonth.index, originMonth.year, i - 1);

                markers.push((j += monthDays));

                const monthEndIndex = Math.ceil(j / 7) * 7;
                const days = monthEndIndex - monthStartIndex;

                const indexedAccessProxy = new Proxy(struct(), {
                    get: (target: {}, property: string | symbol, receiver: {}) => {
                        if (typeof property === 'string') {
                            const offset = +property;
                            if (offset === ~~offset && offset >= 0 && offset < days) {
                                return timeSlice.origin[monthStartIndex + offset] as number;
                            }
                        }
                        return Reflect.get(target, property, receiver);
                    },
                    set: () => true,
                }) as { readonly [K: number]: number | undefined };

                const flags = structFrom(
                    new Proxy(struct(), {
                        get: (target: {}, property: string | symbol, receiver: {}) => {
                            if (typeof property === 'string') {
                                const offset = +property;
                                if (offset === ~~offset) {
                                    const timestamp = indexedAccessProxy[offset];
                                    if (timestamp === undefined) return 0;

                                    const index = monthStartIndex + offset;
                                    const weekDay = (index % 7) as WeekDay;

                                    let flags = timestamp === todayTimestamp ? TimeFlag.TODAY : 0;

                                    if (index >= (markers[i - 1] as number) && index < j) {
                                        if (index === (markers[i - 1] as number)) flags |= TimeFlag.MONTH_START;
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
                        startTimestamp: { value: timeSlice.origin[monthStartIndex] },
                        weeks: { value: days / 7 },
                        year: { value: year },
                    }) as TimeFrameMonth
                );
            }

            days = Math.ceil((markers[frameSize] as number) / 7) * 7;
            currentOriginTimestamp = originMonth.timestamp;
        };

        withSize(size);
        updateMarkersIfNecessary();

        return struct({
            days: { get: () => days },
            months: { value: months },
            size: {
                get: () => frameSize,
                set: (size?: FrameSize | null) => {
                    withSize(size);
                    updateMarkersIfNecessary();
                },
            },
            timeslice: {
                get: () => timeSlice,
                set: (slice?: TimeSlice | null) => {
                    const { time } = timeSlice?.origin || {};

                    timeSlice = timeslice(slice?.from, slice?.to);
                    timeSlice.origin.firstWeekDay = slice?.origin.firstWeekDay;
                    timeSlice.origin.time = time;

                    if (timeSlice.origin.time < (slice?.from as number) || timeSlice.origin.time > (slice?.to as number)) {
                        timeSlice.origin.time = slice?.origin.time;
                    }

                    timeSliceStartTimestamp = Math.abs(timeSlice.from) < Infinity ? new Date(timeSlice.from).setHours(0, 0, 0, 0) : timeSlice.from;
                    timeSliceEndTimestamp = Math.abs(timeSlice.to) < Infinity ? new Date(timeSlice.to).setHours(0, 0, 0, 0) : timeSlice.to;

                    withSize(frameSize);
                    updateMarkersIfNecessary();
                },
            },
            weeks: { get: () => days / 7 },
        }) as TimeFrame;
    }) as TimeFrameFactory;

    return Object.defineProperties(timeframe, {
        SIZE_1: { value: FrameSize.SIZE_1 },
        SIZE_2: { value: FrameSize.SIZE_2 },
        SIZE_3: { value: FrameSize.SIZE_3 },
        SIZE_4: { value: FrameSize.SIZE_4 },
        SIZE_6: { value: FrameSize.SIZE_6 },
        SIZE_12: { value: FrameSize.SIZE_12 },
    });
})();
