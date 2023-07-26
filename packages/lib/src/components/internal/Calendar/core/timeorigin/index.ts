import { Month, Time, WeekDay } from '../shared/types';
import { clamp, computeTimestampOffset, getEdgesDistance, isBitSafeInteger, isInfinite, mid, mod, struct, structFrom } from '../shared/utils';
import timeslice from '../timeslice';
import { TimeSlice } from '../timeslice/types';
import { TimeOrigin } from './types';

const timeorigin = (() => {
    const getRelativeEdgeOffsets = (timestamp: number, timeSlice: TimeSlice = timeslice()) => {
        const { from: fromTimestamp, to: toTimestamp, span } = timeSlice;
        const relativeFromEdgeDistance = getEdgesDistance(timestamp, fromTimestamp);
        const relativeToEdgeDistance = getEdgesDistance(timestamp, toTimestamp);
        const timeSliceEdgesDistance = span - 1;

        let fromEdgeOffset = Infinity;
        let toEdgeOffset = Infinity;

        if (!(isInfinite(relativeFromEdgeDistance) || isInfinite(relativeToEdgeDistance))) {
            if (timestamp < fromTimestamp) {
                timestamp = fromTimestamp;
                fromEdgeOffset = 0;
                toEdgeOffset = timeSliceEdgesDistance;
            } else if (timestamp > toTimestamp) {
                timestamp = toTimestamp;
                fromEdgeOffset = timeSliceEdgesDistance;
                toEdgeOffset = 0;
            } else {
                fromEdgeOffset = relativeFromEdgeDistance;
                toEdgeOffset = relativeToEdgeDistance;
            }
        } else if (!isInfinite(relativeFromEdgeDistance)) {
            if (timestamp < fromTimestamp) {
                timestamp = fromTimestamp;
                fromEdgeOffset = 0;
            } else fromEdgeOffset = relativeFromEdgeDistance;
        } else if (!isInfinite(relativeToEdgeDistance)) {
            if (timestamp > toTimestamp) {
                timestamp = toTimestamp;
                toEdgeOffset = 0;
            } else toEdgeOffset = relativeToEdgeDistance;
        }

        return [timestamp, 0 - fromEdgeOffset, toEdgeOffset] as const;
    };

    return (timeSlice: TimeSlice = timeslice()) => {
        let currentTimestamp: number = Date.now();
        let firstWeekDay: WeekDay;
        let monthDate: number;
        let monthIndex: Month;
        let monthOffset: WeekDay;
        let monthTimestamp: number;
        let monthYear: number;
        let timestamp: number;
        let timestampOffset: number;

        let initialized = false;
        let fromOffset: number;
        let toOffset: number;
        let { from, to } = timeSlice;

        const withFirstWeekDay = (weekDay?: WeekDay | null) => {
            if (weekDay == undefined && !isBitSafeInteger(weekDay)) return;
            if (firstWeekDay === (firstWeekDay = mod(weekDay, 7) as WeekDay)) return;
            withTime(currentTimestamp);
        };

        const withTime = (time?: Time | null): void => {
            if (time == undefined) return withTime(Date.now());

            let nextTimestamp = clamp(from, (time = new Date(time).getTime()), to);

            if (nextTimestamp !== time) nextTimestamp = mid(from, to);
            if (isInfinite(nextTimestamp) || nextTimestamp != nextTimestamp) nextTimestamp = clamp(from, currentTimestamp, to);
            if (initialized && nextTimestamp === currentTimestamp) return;

            currentTimestamp = nextTimestamp;
            timestamp = currentTimestamp - (timestampOffset = computeTimestampOffset(currentTimestamp));

            const timestampDate = new Date(timestamp);
            const baseOffsetStartDate = (timestampDate.getDate() % 7) - timestampDate.getDay() - 7;

            monthIndex = timestampDate.getMonth() as Month;
            monthYear = timestampDate.getFullYear();
            monthOffset = (1 - ((baseOffsetStartDate + firstWeekDay) % 7)) as WeekDay;
            monthTimestamp = timestampDate.setDate(1 - monthOffset);
            monthDate = new Date(monthTimestamp).getDate();
        };

        const withTimeSlice = (timeSlice?: TimeSlice | null) => {
            ({ from, to } = timeSlice = timeSlice || timeslice());
            withTime(currentTimestamp);
            [, fromOffset, toOffset] = getRelativeEdgeOffsets(currentTimestamp, timeSlice);
        };

        const shiftTime = (offset?: number) => {
            if (offset && isBitSafeInteger(offset)) {
                withTime(new Date(timestamp).setMonth(monthIndex + offset));
            }
            return origin;
        };

        const origin = structFrom(
            new Proxy(struct(), {
                get: (target: {}, property: string | symbol, receiver: {}) => {
                    if (typeof property === 'string') {
                        const offset = +property;
                        if (isBitSafeInteger(offset)) {
                            return offset ? new Date(monthTimestamp).setDate(monthDate + offset) : monthTimestamp;
                        }
                    }
                    return Reflect.get(target, property, receiver);
                },
                set: () => true,
            }),
            {
                firstWeekDay: {
                    get: () => firstWeekDay,
                    set: withFirstWeekDay,
                },
                month: {
                    value: struct({
                        index: { get: () => monthIndex },
                        offset: { get: () => monthOffset },
                        timestamp: { get: () => monthTimestamp },
                        year: { get: () => monthYear },
                    }),
                },
                offsets: {
                    value: struct({
                        from: { get: () => fromOffset },
                        to: { get: () => toOffset },
                    }),
                },
                shift: { value: shiftTime },
                time: {
                    get: () => currentTimestamp,
                    set: withTime,
                },
                timeslice: {
                    get: () => timeSlice,
                    set: withTimeSlice,
                },
            }
        ) as TimeOrigin;

        withFirstWeekDay(0);
        [, fromOffset, toOffset] = getRelativeEdgeOffsets(currentTimestamp, timeSlice);
        initialized = true;

        return origin;
    };
})();

export default timeorigin;
