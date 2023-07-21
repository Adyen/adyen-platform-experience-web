const FROM_EDGE: unique symbol = Symbol();
const TO_EDGE: unique symbol = Symbol();

const mod = (int: number, modulo: number) => ((int % modulo) + modulo) % modulo;
const struct = Function.prototype.call.bind(Object.create, null, null);

const enum FrameSize {
    SIZE_1 = 1,
    SIZE_2 = 2,
    SIZE_3 = 3,
    SIZE_4 = 4,
    SIZE_6 = 6,
    SIZE_12 = 12,
}

type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Month = WeekDay | 7 | 8 | 9 | 10 | 11;
type Time = Date | number | string;

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

type TimeMark = {
    readonly [K: number]: number | undefined;
    readonly firstDayOffset: WeekDay;
    get firstWeekDay(): WeekDay;
    set firstWeekDay(firstWeekDay: WeekDay | null | undefined);
    readonly month: Month;
    readonly shift: (offset?: number) => TimeMark;
    get timestamp(): number;
    set timestamp(time: Time | null | undefined);
    readonly year: number;
};

type TimeSliceEdges<T = {}> = {
    readonly from: T;
    readonly to: T;
};

type TimeSlice = TimeSliceEdges<number> & {
    readonly offsets: TimeSliceEdges<number>;
    readonly origin: TimeMark;
    readonly span: number;
};

type TimeSliceFactory = {
    (from?: Time, to?: Time): TimeSlice;
    (time?: Time, edge?: typeof FROM_EDGE | typeof TO_EDGE): TimeSlice;
    readonly Edge: {
        readonly FROM: typeof FROM_EDGE;
        readonly TO: typeof TO_EDGE;
    };
};

export const timeslice = (() => {
    const getEdgeDistance = (from: Time, to: Time) => {
        if ((typeof from === 'number' && Math.abs(from) === Infinity) || (typeof to === 'number' && Math.abs(to) === Infinity)) return Infinity;

        const fromDate = new Date(from);
        const toDate = new Date(to);
        return Math.abs(toDate.getMonth() - fromDate.getMonth() + (toDate.getFullYear() - fromDate.getFullYear()) * 12);
    };

    const getEdgeDistances = (origin: Time, from: Time, to: Time) => {
        const edgeDistance = getEdgeDistance(from, to);
        const relativeFromEdgeOffset = getEdgeDistance(origin, from);
        const relativeToEdgeOffset = getEdgeDistance(origin, to);

        let fromEdgeOffset = Infinity;
        let toEdgeOffset = Infinity;
        let originTimestamp = new Date(origin).getTime();

        if (relativeFromEdgeOffset < Infinity && relativeToEdgeOffset < Infinity) {
            const fromTimestamp = new Date(from).getTime();
            const toTimestamp = new Date(to).getTime();

            if (originTimestamp < fromTimestamp) {
                originTimestamp = fromTimestamp;
                fromEdgeOffset = 0;
                toEdgeOffset = edgeDistance;
            } else if (originTimestamp > toTimestamp) {
                originTimestamp = toTimestamp;
                fromEdgeOffset = edgeDistance;
                toEdgeOffset = 0;
            } else {
                fromEdgeOffset = relativeFromEdgeOffset;
                toEdgeOffset = relativeToEdgeOffset;
            }
        } else if (relativeFromEdgeOffset < Infinity) {
            const fromTimestamp = new Date(from).getTime();

            if (originTimestamp < fromTimestamp) {
                originTimestamp = fromTimestamp;
                fromEdgeOffset = 0;
            } else fromEdgeOffset = relativeFromEdgeOffset;
        } else if (relativeToEdgeOffset < Infinity) {
            const toTimestamp = new Date(to).getTime();

            if (originTimestamp > toTimestamp) {
                originTimestamp = toTimestamp;
                toEdgeOffset = 0;
            } else toEdgeOffset = relativeToEdgeOffset;
        }

        return [originTimestamp, fromEdgeOffset, toEdgeOffset] as const;
    };

    const timemark = (from: number, to: number, time?: Time, firstWeekDay?: WeekDay) => {
        let baseOffsetStartDate: number;
        let offsetStartDate: number;
        let originDate: number;
        let originMonth: Month;
        let originTimestamp: number;
        let originYear: number;
        let referenceMonth: Month;
        let referenceTime: number;
        let referenceYear: number;
        let referenceDate: Date;
        let weekStartDay: WeekDay;

        const withFirstWeekDay = (firstWeekDay: WeekDay | null = weekStartDay || 0) => {
            const nextWeekStartDay = ~~(firstWeekDay as WeekDay) === firstWeekDay ? firstWeekDay : weekStartDay || 0;

            if (nextWeekStartDay !== weekStartDay) {
                weekStartDay = mod(nextWeekStartDay, 7) as WeekDay;
                withTime(referenceTime || Date.now());
            }
        };

        const withTime = (time?: Time | null) => {
            if (time != undefined) {
                referenceTime = Math.max(from, Math.min(new Date(time).getTime(), to));
                referenceDate = new Date(new Date(referenceTime).setHours(0, 0, 0, 0));

                referenceMonth = referenceDate.getMonth() as Month;
                referenceYear = referenceDate.getFullYear();

                baseOffsetStartDate = (referenceDate.getDate() % 7) - referenceDate.getDay() - 7;
                offsetStartDate = (baseOffsetStartDate + weekStartDay) % 7;
                originTimestamp = referenceDate.setDate(offsetStartDate);

                const date = new Date(originTimestamp);

                originDate = date.getDate();
                originMonth = date.getMonth() as Month;
                originYear = date.getFullYear();
            }
        };

        const shiftMark = (offset?: number) => {
            if (offset && offset === ~~offset) {
                withTime(new Date(originTimestamp).setMonth(originMonth + offset + (originDate > 1 ? 1 : 0), 1));
            }
            return mark;
        };

        const mark = Object.create(
            new Proxy(struct(), {
                get: (target: {}, property: string | symbol, receiver: {}) => {
                    if (typeof property === 'string') {
                        const offset = +property;
                        if (offset === ~~offset) {
                            return offset ? new Date(originTimestamp).setDate(originDate + offset) : originTimestamp;
                        }
                    }
                    return Reflect.get(target, property, receiver);
                },
                set: () => true,
            }),
            {
                firstDayOffset: { get: () => (1 - offsetStartDate) as WeekDay },
                firstWeekDay: {
                    get: () => weekStartDay,
                    set: withFirstWeekDay,
                },
                month: { get: () => referenceMonth },
                shift: { value: shiftMark },
                timestamp: {
                    get: () => originTimestamp,
                    set: withTime,
                },
                year: { get: () => referenceYear },
            }
        ) as TimeMark;

        withFirstWeekDay(firstWeekDay);

        return mark;
    };

    const timeslice = ((...args: any[]) => {
        let endTimestamp = Infinity;
        let endEdgeOffset = Infinity;
        let startEdgeOffset = Infinity;
        let startTimestamp = -Infinity;
        let originTimestamp = Infinity;

        if (args.length >= 2) {
            let timestamp = new Date(args[0]).getTime();

            if (typeof args[1] === 'symbol') {
                switch (args[1]) {
                    case TO_EDGE:
                        endTimestamp = timestamp;
                        break;

                    case FROM_EDGE:
                    default:
                        startTimestamp = timestamp;
                        break;
                }
            } else {
                startTimestamp = timestamp;
                endTimestamp = new Date(args[1]).getTime();

                if (endTimestamp < startTimestamp) {
                    [endTimestamp, startTimestamp] = [startTimestamp, endTimestamp];
                }
            }
        }

        const originMark = timemark(startTimestamp, endTimestamp);

        const refreshEdgeDistancesIfNecessary = () => {
            if (originTimestamp === originMark.timestamp) return;

            [, startEdgeOffset, endEdgeOffset] = getEdgeDistances((originTimestamp = originMark.timestamp), startTimestamp, endTimestamp);
        };

        refreshEdgeDistancesIfNecessary();

        return struct({
            from: { value: startTimestamp },
            to: { value: endTimestamp },
            offsets: {
                value: struct({
                    from: {
                        get: () => {
                            refreshEdgeDistancesIfNecessary();
                            return Math.min(0, 0 - startEdgeOffset);
                        },
                    },
                    to: {
                        get: () => {
                            refreshEdgeDistancesIfNecessary();
                            return endEdgeOffset;
                        },
                    },
                }),
            },
            origin: {
                get: () => {
                    refreshEdgeDistancesIfNecessary();
                    return originMark;
                },
            },
            span: { value: startEdgeOffset + endEdgeOffset + 1 },
        }) as TimeSlice;
    }) as TimeSliceFactory;

    return Object.defineProperty(timeslice, 'Edge', {
        value: struct({
            FROM: { value: FROM_EDGE },
            TO: { value: TO_EDGE },
        }),
    });
})();

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

    const getMonthDays = (() => {
        const MONTH_DAYS = [31, [28, 29] as const, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

        return (month: Month, year: number, offset = 0) => {
            const nextMonth = month + offset;
            const monthIndex = (nextMonth % 12) as Month;
            const nextYear = year + Math.floor(nextMonth / 12);

            const days = monthIndex === 1 ? MONTH_DAYS[1][(nextYear % 100 ? nextYear % 4 : nextYear % 400) && 1] : MONTH_DAYS[monthIndex];

            return [days, monthIndex, nextYear] as const;
        };
    })();

    const timeframe = ((size?: FrameSize) => {
        let currentOriginTimestamp: number;
        let days: number;
        let frameSize: FrameSize;
        let timeSlice = timeslice();
        let timeSliceStartTimestamp = Math.abs(timeSlice.from) < Infinity ? new Date(timeSlice.from).setHours(0, 0, 0, 0) : timeSlice.from;
        let timeSliceEndTimestamp = Math.abs(timeSlice.to) < Infinity ? new Date(timeSlice.to).setHours(0, 0, 0, 0) : timeSlice.to;

        const markers: number[] = [];
        const months: TimeFrameMonth[] = [];

        const withSize = (size?: FrameSize | null) => {
            let nextFrameSize = FRAME_SIZE_MAP[
                (~~(size as FrameSize) === size ? Math.max(1, Math.min(timeSlice.span, size || frameSize || 1, 12)) : frameSize || 1) - 1
            ] as FrameSize;

            if (frameSize === nextFrameSize) return;

            frameSize = nextFrameSize;
            timeSlice.origin.shift(0 - (timeSlice.origin.month % frameSize));
        };

        const updateMarkersIfNecessary = () => {
            if (currentOriginTimestamp === timeSlice.origin.timestamp) return;

            markers.length = months.length = 0;
            markers.push(timeSlice.origin.firstDayOffset);

            for (let i = 1, j = markers[0] as number; i <= frameSize; i++) {
                const monthStartIndex = Math.floor(j / 7) * 7;
                const [monthDays, month, year] = getMonthDays(timeSlice.origin.month, timeSlice.origin.year, i - 1);

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

                const flags = Object.create(
                    new Proxy(struct(), {
                        get: (target: {}, property: string | symbol, receiver: {}) => {
                            if (typeof property === 'string') {
                                const offset = +property;
                                if (offset === ~~offset) {
                                    const timestamp = indexedAccessProxy[offset];
                                    if (timestamp === undefined) return 0;

                                    const index = monthStartIndex + offset;
                                    const weekDay = (index % 7) as WeekDay;

                                    let flags = 0;

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
                    Object.create(indexedAccessProxy, {
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
            currentOriginTimestamp = timeSlice.origin.timestamp;
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
                    const { firstWeekDay, timestamp } = timeSlice?.origin || {};
                    timeSlice = timeslice(slice?.from, slice?.to);
                    timeSliceStartTimestamp = Math.abs(timeSlice.from) < Infinity ? new Date(timeSlice.from).setHours(0, 0, 0, 0) : timeSlice.from;
                    timeSliceEndTimestamp = Math.abs(timeSlice.to) < Infinity ? new Date(timeSlice.to).setHours(0, 0, 0, 0) : timeSlice.to;
                    timeSlice.origin.timestamp = timestamp;
                    timeSlice.origin.firstWeekDay = firstWeekDay;
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

export default timeslice;
