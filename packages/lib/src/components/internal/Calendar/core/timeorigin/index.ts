import { Month, Time, WeekDay } from '../shared/types';
import { clamp, computeTimestampOffset, getEdgesDistance, isBitSafeInteger, isInfinite, mid, mod, struct, structFrom } from '../shared/utils';
import $watchable from '../shared/watchable';
import { WatchAtoms } from '../shared/watchable/types';
import $timeslice from '../timeslice';
import { TimeSlice } from '../timeslice/types';
import { TimeOrigin, TimeOriginAtoms } from './types';

const timeorigin = (() => {
    const getRelativeEdgeOffsets = (timestamp: number, timeslice: TimeSlice = $timeslice()) => {
        const { from: fromTimestamp, to: toTimestamp, span } = timeslice;
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

    return (timeslice?: TimeSlice) => {
        let currentTimestamp: number = Date.now();
        let firstWeekDay: WeekDay;
        let monthDate: number;
        let monthIndex: Month;
        let monthOffset: WeekDay;
        let monthTimestamp: number;
        let monthYear: number;
        let timestamp: number;
        let timestampOffset: number;

        let fromOffset: number;
        let toOffset: number;
        let forceTimeRefresh = false;
        let withFallbackTimeSlice = timeslice === undefined;
        let timeSlice = withFallbackTimeSlice ? $timeslice() : (timeslice as TimeSlice);
        let { from, to } = timeSlice;

        const refreshTime = (time: number = currentTimestamp) => {
            (forceTimeRefresh = true) && withTime(time);
        };

        const shiftTime = (offset?: number) => {
            const clampedOffset = clamp(fromOffset, offset || Infinity, toOffset);

            if (clampedOffset && isBitSafeInteger(clampedOffset)) {
                const nextTimestamp = new Date(currentTimestamp).setMonth(monthIndex + clampedOffset);
                refreshTime(nextTimestamp);
            }

            return timeorigin;
        };

        const withFirstWeekDay = (day?: WeekDay | null) => {
            if (day == undefined && !isBitSafeInteger(day)) return;
            if (firstWeekDay === (firstWeekDay = mod(day, 7) as WeekDay)) return;
            refreshTime();
        };

        const withTime = (time?: Time | null): void => {
            if (time == undefined) return withTime(Date.now());

            let nextTimestamp = clamp(from, new Date(time).getTime(), to);

            if (nextTimestamp != nextTimestamp) nextTimestamp = mid(from, to);
            if (nextTimestamp != nextTimestamp || isInfinite(nextTimestamp)) nextTimestamp = clamp(from, currentTimestamp, to);
            if (nextTimestamp === currentTimestamp && !forceTimeRefresh) return;

            forceTimeRefresh = false;
            [currentTimestamp, fromOffset, toOffset] = getRelativeEdgeOffsets(nextTimestamp, timeSlice);
            timestamp = currentTimestamp - (timestampOffset = computeTimestampOffset(currentTimestamp));

            const timestampDate = new Date(timestamp);

            monthIndex = timestampDate.getMonth() as Month;
            monthYear = timestampDate.getFullYear();
            monthOffset = ((8 - ((timestampDate.getDate() - timestampDate.getDay() + firstWeekDay) % 7)) % 7) as WeekDay;
            monthTimestamp = timestampDate.setDate(1 - monthOffset);
            monthDate = new Date(monthTimestamp).getDate();

            watchable.notify();
        };

        const withTimeSlice = (timeslice?: TimeSlice | null) => {
            if (timeslice === timeSlice || (timeslice == undefined && withFallbackTimeSlice)) return;

            const _withFallbackTimeSlice = timeslice == undefined;
            const _timeSlice = _withFallbackTimeSlice ? $timeslice() : timeslice;
            const edgeOffsets = getRelativeEdgeOffsets(currentTimestamp, _timeSlice);

            ({ from, to } = timeSlice = _timeSlice);
            [, fromOffset, toOffset] = edgeOffsets;
            withFallbackTimeSlice = _withFallbackTimeSlice;

            if (edgeOffsets[0] !== currentTimestamp) refreshTime(edgeOffsets[0]);
        };

        const atoms = {
            firstWeekDay: () => firstWeekDay,
            fromOffset: () => fromOffset,
            monthTimestamp: () => monthTimestamp,
            timestamp: () => currentTimestamp,
            toOffset: () => toOffset,
        } as WatchAtoms<TimeOriginAtoms>;

        const watchable = $watchable(atoms);

        const timeorigin = structFrom(
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
                    get: atoms.firstWeekDay,
                    set: withFirstWeekDay,
                },
                month: {
                    value: struct({
                        index: { get: () => monthIndex },
                        offset: { get: () => monthOffset },
                        timestamp: { get: atoms.monthTimestamp },
                        year: { get: () => monthYear },
                    }),
                },
                offsets: {
                    value: struct({
                        from: { get: atoms.fromOffset },
                        to: { get: atoms.toOffset },
                    }),
                },
                shift: { value: shiftTime },
                time: {
                    get: atoms.timestamp,
                    set: withTime,
                },
                timeslice: {
                    get: () => timeSlice,
                    set: withTimeSlice,
                },
                watch: { value: watchable.watch },
            }
        ) as TimeOrigin;

        withFirstWeekDay(0);
        return timeorigin;
    };
})();

export default timeorigin;
